import { MercadoPagoConfig, Payment, WebhookSignatureValidator, InvalidWebhookSignatureError } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const paymentId = req.query?.["data.id"] || req.body?.data?.id;

  if (!webhookSecret || !accessToken || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Webhook Mercado Pago: faltan variables privadas de entorno.");
    return res.status(500).json({ error: "Webhook no configurado." });
  }
  if (!paymentId) return res.status(400).json({ error: "Falta el ID del pago." });

  try {
    // Verifica HMAC-SHA256 con el validador oficial del SDK de Mercado Pago.
    WebhookSignatureValidator.validate({
      xSignature: req.headers["x-signature"],
      xRequestId: req.headers["x-request-id"],
      dataId: String(paymentId),
      secret: webhookSecret,
    });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      console.warn("Webhook rechazado: firma inválida.");
      return res.status(401).json({ error: "Firma de notificación inválida." });
    }
    console.error("No se pudo validar la firma del webhook:", error);
    return res.status(400).json({ error: "No se pudo validar la notificación." });
  }

  try {
    const mp = new MercadoPagoConfig({ accessToken });
    const paymentApi = new Payment(mp);
    // Nunca se confía en el estado/monto del cuerpo del webhook: se consulta el pago a MP.
    const payment = await paymentApi.get({ id: paymentId });

    if (payment.status !== "approved") {
      return res.status(200).json({ received: true, processed: false });
    }

    const orderId = payment.external_reference || payment.metadata?.order_id;
    if (!orderId) return res.status(200).json({ received: true, processed: false });

    const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id,user_id,status,deposit_amount,deposit_paid")
      .eq("id", orderId)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order) return res.status(200).json({ received: true, processed: false });

    const paidAmount = Number(payment.transaction_amount);
    const expectedAmount = Number(order.deposit_amount);
    const currency = payment.currency_id;
    if (currency !== "ARS" || !Number.isFinite(paidAmount) || Math.abs(paidAmount - expectedAmount) > 0.01) {
      console.error("Pago aprobado con importe o moneda inesperados para el pedido:", order.id);
      return res.status(200).json({ received: true, processed: false });
    }

    // Idempotencia: las notificaciones pueden llegar más de una vez.
    if (order.status === "pending_payment") {
      const { error: updateError } = await admin
        .from("orders")
        .update({
          status: "paid",
          deposit_paid: expectedAmount,
          payment_id: String(payment.id),
          paid_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .eq("status", "pending_payment");
      if (updateError) throw updateError;
    }

    return res.status(200).json({ received: true, processed: true });
  } catch (error) {
    console.error("mercadopago-webhook:", error);
    // 500 permite que Mercado Pago reintente la notificación si hubo un fallo temporal.
    return res.status(500).json({ error: "No se pudo procesar la notificación." });
  }
}

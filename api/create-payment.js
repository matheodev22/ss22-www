import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Falta configurar Supabase en las variables privadas de Vercel.");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
  }

  let admin;
  let orderId;

  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const siteUrl = (process.env.PUBLIC_SITE_URL || "").replace(/\/$/, "");
    if (!accessToken) throw new Error("Falta configurar Mercado Pago en Vercel.");
    if (!siteUrl.startsWith("https://")) {
      throw new Error("PUBLIC_SITE_URL debe ser la URL HTTPS de tu tienda publicada.");
    }

    const bearerToken = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!bearerToken) return res.status(401).json({ error: "Iniciá sesión para continuar." });

    admin = getAdminClient();
    const { data: authData, error: authError } = await admin.auth.getUser(bearerToken);
    if (authError || !authData?.user) {
      return res.status(401).json({ error: "Tu sesión venció. Volvé a iniciar sesión." });
    }

    const { items, customer } = req.body || {};
    if (
      !Array.isArray(items) || items.length === 0 || items.length > 30 ||
      !customer?.name?.trim() || !customer?.phone?.trim() ||
      !customer?.address?.trim() || !customer?.city?.trim()
    ) {
      return res.status(400).json({ error: "Revisá los productos y completá los datos de entrega." });
    }

    // Los precios y porcentajes se leen de Supabase: nunca se confía en importes del navegador.
    if (items.some((item) => !item?.product_id)) {
      return res.status(400).json({ error: "El carrito contiene un producto inválido. Actualizalo e intentá nuevamente." });
    }
    const productIds = [...new Set(items.map((item) => item.product_id))];
    if (productIds.some((id) => String(id).startsWith("demo-"))) {
      return res.status(400).json({ error: "El catálogo de demostración no admite pagos reales. Primero cargá productos en Supabase." });
    }

    const { data: products, error: productsError } = await admin
      .from("products")
      .select("id,name,price,deposit_percent,active")
      .in("id", productIds);
    if (productsError) throw new Error("No se pudieron validar los productos. Intentá nuevamente.");
    if (!products || products.length !== productIds.length) {
      return res.status(400).json({ error: "Uno de los productos ya no está disponible." });
    }

    const validatedItems = items.map((item) => {
      const product = products.find((entry) => entry.id === item.product_id);
      if (!product || !product.active) throw new Error("Uno de los productos ya no está disponible.");
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        throw new Error("La cantidad de un producto no es válida.");
      }
      const unitPrice = Number(product.price);
      const depositPercent = Number(product.deposit_percent || 30);
      if (!Number.isFinite(unitPrice) || unitPrice <= 0 || !Number.isFinite(depositPercent) || depositPercent < 1 || depositPercent > 100) {
        throw new Error("Hay un precio o porcentaje de seña inválido en el catálogo.");
      }
      const lineTotal = Math.round(unitPrice * quantity * 100) / 100;
      const lineDeposit = Math.round(lineTotal * depositPercent) / 100;
      return {
        product_id: product.id,
        name: product.name,
        quantity,
        unit_price: unitPrice,
        deposit_amount: lineDeposit,
        size: String(item.size || "").slice(0, 30),
        color: String(item.color || "").slice(0, 40),
      };
    });

    const totalAmount = Math.round(validatedItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0) * 100) / 100;
    const depositAmount = Math.round(validatedItems.reduce((sum, item) => sum + item.deposit_amount, 0) * 100) / 100;
    if (!Number.isFinite(depositAmount) || depositAmount <= 0 || depositAmount > totalAmount) {
      throw new Error("No se pudo calcular una seña válida para este pedido.");
    }

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: authData.user.id,
        status: "pending_payment",
        total_amount: totalAmount,
        deposit_amount: depositAmount,
        balance_due: Math.round((totalAmount - depositAmount) * 100) / 100,
        customer_name: customer.name.trim().slice(0, 120),
        customer_phone: customer.phone.trim().slice(0, 50),
        shipping_address: customer.address.trim().slice(0, 200),
        shipping_city: customer.city.trim().slice(0, 120),
        customer_notes: String(customer.notes || "").trim().slice(0, 1000),
      })
      .select("id")
      .single();
    if (orderError) throw orderError;
    orderId = order.id;

    const { error: itemsError } = await admin.from("order_items").insert(
      validatedItems.map((item) => ({ order_id: order.id, ...item }))
    );
    if (itemsError) throw itemsError;

    const mp = new MercadoPagoConfig({ accessToken });
    const preferenceApi = new Preference(mp);
    const preference = await preferenceApi.create({
      body: {
        items: [{
          id: order.id,
          title: `Seña pedido SS22 #${order.id.slice(0, 8).toUpperCase()}`,
          description: "Pago de seña. El saldo restante se abonará según las condiciones de SS22.WWW.",
          quantity: 1,
          unit_price: depositAmount,
          currency_id: "ARS",
        }],
        external_reference: order.id,
        payer: {
          name: customer.name.trim(),
          email: authData.user.email || undefined,
          phone: { number: customer.phone.trim() },
        },
        back_urls: {
          success: `${siteUrl}/pago/resultado?status=success`,
          failure: `${siteUrl}/pago/resultado?status=failure`,
          pending: `${siteUrl}/pago/resultado?status=pending`,
        },
        auto_return: "approved",
        notification_url: `${siteUrl}/api/mercadopago-webhook`,
        statement_descriptor: "SS22 WWW",
        metadata: { order_id: order.id, user_id: authData.user.id, payment_kind: "deposit" },
      },
    });

    if (!preference?.id || !preference?.init_point) {
      throw new Error("Mercado Pago no devolvió el enlace de pago. Intentá nuevamente.");
    }

    const { error: updateError } = await admin
      .from("orders")
      .update({ mp_preference_id: preference.id })
      .eq("id", order.id);
    if (updateError) throw updateError;

    return res.status(200).json({ init_point: preference.init_point });
  } catch (error) {
    console.error("create-payment:", error);
    // Si el proceso falló antes de entregar el enlace, no dejamos un pedido incompleto.
    if (admin && orderId) {
      await admin.from("orders").delete().eq("id", orderId);
    }
    const message = error?.message || "No se pudo iniciar el pago.";
    return res.status(500).json({ error: message });
  }
}

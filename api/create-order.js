
import { createClient } from "@supabase/supabase-js";

const cors = {
  "Access-Control-Allow-Origin": process.env.PUBLIC_SITE_URL || "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export default async function handler(req, res) {
  Object.entries(cors).forEach(([key, value]) => res.setHeader(key, value));

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido." });
  }

  let supabase;
  let orderId = null;
  const reserved = [];

  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return res.status(401).json({
        error: "Iniciá sesión para continuar.",
      });
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return res.status(500).json({
        error: "Falta configurar Supabase en el servidor.",
      });
    }

    supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: auth, error: authError } =
      await supabase.auth.getUser(token);

    if (authError || !auth.user) {
      return res.status(401).json({
        error: "La sesión no es válida. Volvé a iniciar sesión.",
      });
    }

    const { items, customer } = req.body || {};

    if (!Array.isArray(items) || !items.length || items.length > 30) {
      return res.status(400).json({
        error: "El carrito está vacío o contiene demasiados productos.",
      });
    }

    for (const field of ["name", "phone", "address", "city"]) {
      if (typeof customer?.[field] !== "string" || !customer[field].trim()) {
        return res.status(400).json({
          error: "Completá todos los datos de entrega.",
        });
      }
    }

    if (
      items.some(
        (item) =>
          typeof item?.product_id !== "string" ||
          item.product_id.startsWith("demo-")
      )
    ) {
      return res.status(400).json({
        error: "El carrito contiene productos de demostración.",
      });
    }

    const ids = [...new Set(items.map((item) => item.product_id))];

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id,name,price,active,stock")
      .in("id", ids);

    if (productsError) throw productsError;

    if (
      !products ||
      products.length !== ids.length ||
      products.some((product) => !product.active)
    ) {
      return res.status(400).json({
        error: "Un producto ya no está disponible. Actualizá tu carrito.",
      });
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    const orderItems = items.map((item) => {
      const product = productMap.get(item.product_id);
      const quantity = Number(item.quantity);
      const stock = Number(product?.stock ?? 1);

      if (
        !product ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 20
      ) {
        throw new Error("Hay un producto o una cantidad inválida.");
      }

      if (quantity > stock) {
        throw new Error(
          `No hay stock suficiente de ${product.name}. Disponible: ${stock}.`
        );
      }

      const price = Number(product.price);

      if (!Number.isFinite(price) || price <= 0) {
        throw new Error(`El precio de ${product.name} no es válido.`);
      }

      return {
        product_id: product.id,
        name: product.name,
        quantity,
        unit_price: price,
        deposit_amount: price * quantity,
        size: String(item.size || ""),
        color: String(item.color || ""),
      };
    });

    // Reservar las unidades directamente en Supabase.
    // La función SQL evita vender una unidad que ya no está disponible.
    for (const item of orderItems) {
      const { data, error } = await supabase.rpc(
        "reserve_product_stock",
        {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        }
      );

      if (error) {
        throw new Error(
          "No se pudo reservar el stock. Verificá que ejecutaste el SQL de stock."
        );
      }

      if (data !== true) {
        throw new Error(
          `No queda stock suficiente de ${item.name}. Actualizá tu carrito.`
        );
      }

      reserved.push({
        product_id: item.product_id,
        quantity: item.quantity,
      });
    }

    const total = orderItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: auth.user.id,
        status: "pending_payment",
        total_amount: total,
        deposit_amount: total,
        deposit_paid: 0,
        balance_due: total,
        customer_name: customer.name.trim(),
        customer_phone: customer.phone.trim(),
        shipping_address: customer.address.trim(),
        shipping_city: customer.city.trim(),
        customer_notes: String(customer.notes || "").trim(),
      })
      .select("id,total_amount")
      .single();

    if (orderError) throw orderError;

    orderId = order.id;

    const rows = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(rows);

    if (itemsError) throw itemsError;

    return res.status(201).json({
      order: {
        id: order.id,
        total: order.total_amount,
      },
    });
  } catch (error) {
    console.error("create-order:", error);

    // Si falla el registro, eliminar el pedido incompleto.
    if (supabase && orderId) {
      await supabase.from("orders").delete().eq("id", orderId);
    }

    // Devolver las unidades reservadas durante este intento.
    if (supabase) {
      for (const item of reserved.reverse()) {
        const { error: restoreError } = await supabase.rpc(
          "restore_product_stock",
          {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          }
        );

        if (restoreError) {
          console.error("No se pudo restaurar el stock:", restoreError);
        }
      }
    }

    const message = error?.message || "No se pudo crear el pedido.";
    const clientError =
      /stock|carrito|producto|cantidad|precio/i.test(message);

    return res.status(clientError ? 400 : 500).json({
      error: message,
    });
  }
}

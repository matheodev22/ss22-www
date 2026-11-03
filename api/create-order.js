import { createClient } from '@supabase/supabase-js';

const cors = {
  'Access-Control-Allow-Origin': process.env.PUBLIC_SITE_URL || '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default async function handler(req, res) {
  Object.entries(cors).forEach(([key, value]) => res.setHeader(key, value));
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });

  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Iniciá sesión para continuar.' });
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Falta configurar Supabase en el servidor.' });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) return res.status(401).json({ error: 'La sesión no es válida. Volvé a iniciar sesión.' });

    const { items, customer } = req.body || {};
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'El carrito está vacío.' });
    for (const field of ['name', 'phone', 'address', 'city']) {
      if (!customer?.[field]?.trim()) return res.status(400).json({ error: 'Completá todos los datos de entrega.' });
    }

    const ids = [...new Set(items.map(item => item.product_id).filter(id => typeof id === 'string' && !id.startsWith('demo-')))];
    if (ids.length === 0 || items.some(item => typeof item.product_id !== 'string' || item.product_id.startsWith('demo-'))) return res.status(400).json({ error: 'Hay productos de demostración. Cargá productos reales en el administrador antes de vender.' });
    const { data: products, error: productsError } = await supabase.from('products').select('id,name,price,active').in('id', ids);
    if (productsError) throw productsError;
    if (!products || products.length !== ids.length || products.some(product => !product.active)) {
      return res.status(400).json({ error: 'Uno de los productos ya no está disponible. Actualizá tu carrito.' });
    }

    const productMap = new Map(products.map(product => [product.id, product]));
    const orderItems = items.map(item => {
      const product = productMap.get(item.product_id);
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error('Hay un producto o una cantidad inválida.');
      return {
        product_id: product.id,
        name: product.name,
        quantity,
        unit_price: Number(product.price),
        deposit_amount: Number(product.price) * quantity,
        size: String(item.size || ''),
        color: String(item.color || ''),
      };
    });
    const total = orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    const { data: order, error: orderError } = await supabase.from('orders').insert({
      user_id: authData.user.id,
      status: 'pending_payment',
      total_amount: total,
      deposit_amount: total,
      deposit_paid: 0,
      balance_due: total,
      customer_name: customer.name.trim(),
      customer_phone: customer.phone.trim(),
      shipping_address: customer.address.trim(),
      shipping_city: customer.city.trim(),
      customer_notes: customer.notes?.trim() || '',
    }).select('id,total_amount').single();
    if (orderError) throw orderError;

    const rows = orderItems.map(item => ({ ...item, order_id: order.id }));
    const { error: itemsError } = await supabase.from('order_items').insert(rows);
    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id);
      throw itemsError;
    }

    return res.status(201).json({ order: { id: order.id, total: order.total_amount } });
  } catch (error) {
    console.error('create-order:', error);
    return res.status(500).json({ error: error.message || 'No se pudo crear el pedido.' });
  }
}

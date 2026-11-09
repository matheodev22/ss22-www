import { createClient } from '@supabase/supabase-js';
import { shippingPrice, validatePostalCode } from '../src/lib/shipping.js';
import { sendEmail, emailLayout, safeText } from './_email.js';

const cors = {
  'Access-Control-Allow-Origin': process.env.PUBLIC_SITE_URL || '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function matches(promotion, product) {
  if (promotion.target_type === 'all') return true;
  if (promotion.target_type === 'category') return String(product.category || '').trim().toLowerCase() === String(promotion.target_value || '').trim().toLowerCase();
  if (promotion.target_type === 'product') return String(product.id) === String(promotion.target_value);
  return false;
}

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
    if (authError || !authData.user) return res.status(401).json({ error: 'La sesión no es válida. Volvé a ingresar.' });

    const { items, customer } = req.body || {};
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'El carrito está vacío.' });
    for (const field of ['name', 'email', 'phone', 'address', 'city', 'postal_code']) {
      if (!customer?.[field]?.trim()) return res.status(400).json({ error: 'Completá todos los datos de entrega.' });
    }

    const ids = [...new Set(items.map(item => item.product_id).filter(id => typeof id === 'string' && !id.startsWith('demo-')))];
    if (ids.length === 0 || items.some(item => typeof item.product_id !== 'string' || item.product_id.startsWith('demo-'))) return res.status(400).json({ error: 'Hay productos de demostración. Cargá productos reales en el administrador antes de vender.' });
    const { data: products, error: productsError } = await supabase.from('products').select('id,name,price,category,active,stock_status').in('id', ids);
    if (productsError) throw productsError;
    if (!products || products.length !== ids.length || products.some(product => !product.active || product.stock_status === 'sold_out')) {
      return res.status(400).json({ error: 'Una de las prendas está agotada o ya no está disponible. Actualizá tu carrito.' });
    }

    const postal = validatePostalCode(customer.postal_code);
    if (!postal.valid) return res.status(400).json({ error: postal.message || 'El CPA no es válido.' });
    const zone = postal.zone;
    const method = customer.shipping_method === 'branch' ? 'branch' : 'home';
    const shippingAmountForZone = shippingPrice(zone, method, false);
    if (shippingAmountForZone == null) return res.status(400).json({ error: 'La zona de envío seleccionada no es válida.' });
    const { data: promotions, error: promotionsError } = await supabase.from('store_promotions').select('*').eq('active', true);
    if (promotionsError) throw promotionsError;

    const productMap = new Map(products.map(product => [product.id, product]));
    let freeShipping = false;
    const garmentCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    if (!Number.isInteger(garmentCount) || garmentCount < 1 || garmentCount > 100) {
      return res.status(400).json({ error: 'La cantidad de prendas no es válida.' });
    }
    const qualifiesForTwo = garmentCount >= 2;
    const orderItems = items.map(item => {
      const product = productMap.get(item.product_id);
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error('Hay un producto o una cantidad inválida.');
      const applicable = (promotions || []).filter(p => matches(p, product));
      const discount = applicable.reduce((best, p) => Math.max(best, Number(p.discount_percent) || 0), 0);
      if (applicable.some(p => p.free_shipping)) freeShipping = true;
      const promotionalUnitPrice = Math.max(0, Math.round(Number(product.price) * (100 - discount) / 100));
      const unitPrice = qualifiesForTwo ? Math.max(0, Math.round(promotionalUnitPrice * 0.90)) : promotionalUnitPrice;
      return {
        product_id: product.id,
        name: product.name,
        quantity,
        unit_price: unitPrice,
        deposit_amount: unitPrice * quantity,
        size: String(item.size || ''),
        color: String(item.color || ''),
      };
    });
    const subtotal = orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    const shippingAmount = freeShipping ? 0 : shippingAmountForZone;
    const grandTotal = subtotal + shippingAmount;

    const { data: order, error: orderError } = await supabase.from('orders').insert({
      user_id: authData.user.id,
      status: 'shipping_quoted',
      total_amount: subtotal,
      deposit_amount: grandTotal,
      deposit_paid: 0,
      balance_due: grandTotal,
      customer_name: customer.name.trim(),
      customer_phone: customer.phone.trim(),
      shipping_address: customer.address.trim(),
      shipping_city: customer.city.trim(),
      shipping_postal_code: postal.normalized,
      customer_email: customer.email.trim().toLowerCase(),
      shipping_zone: zone,
      shipping_method: method,
      shipping_amount: shippingAmount,
      customer_notes: customer.notes?.trim() || '',
    }).select('id,total_amount,shipping_amount').single();
    if (orderError) throw orderError;

    const rows = orderItems.map(item => ({ ...item, order_id: order.id }));
    const { error: itemsError } = await supabase.from('order_items').insert(rows);
    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id);
      throw itemsError;
    }

    const orderCode = order.id.slice(0, 8).toUpperCase();
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    const customerEmail = customer.email.trim().toLowerCase();
    const safe = safeText;
    const orderHtml = `<h2>Nuevo pedido #${orderCode}</h2><p><b>${safe(customer.name)}</b> realizó un pedido.</p><p>Email: ${safe(customerEmail)}<br>Teléfono: ${safe(customer.phone)}<br>Entrega: ${safe(customer.address)}, ${safe(customer.city)} · CP ${safe(postal.normalized)}<br>Modalidad: ${method === 'branch' ? 'Sucursal' : 'Domicilio'}</p><p>Prendas: $${subtotal.toLocaleString('es-AR')}<br>Envío: $${shippingAmount.toLocaleString('es-AR')}<br><b>Total: $${grandTotal.toLocaleString('es-AR')}</b></p><p>Estado: pendiente de comprobante y aprobación manual.</p>`;
    const customerHtml = `<h2>¡Gracias por tu compra!</h2><p>Hola ${safe(customer.name)}, registramos tu pedido <b>#${orderCode}</b>.</p><p><b>Total a transferir: $${grandTotal.toLocaleString('es-AR')}</b></p><p>Alias: <b>ss22.www</b><br>Titular: Matheo Martinez</p><p>Enviá el comprobante por WhatsApp al 11 5415-4628 o por Instagram @ss22.www. El pedido se confirma cuando verifiquemos el pago.</p><p>Te enviaremos la información del despacho y seguimiento a este correo.</p>`;
    const [adminMailResult, customerMailResult] = await Promise.all([
      sendEmail({ to: adminEmail, subject: `SS22 · Nuevo pedido #${orderCode} — requiere comprobante`, html: emailLayout(orderHtml) }),
      sendEmail({ to: customerEmail, subject: `SS22 · Recibimos tu pedido #${orderCode}`, html: emailLayout(customerHtml) }),
    ]);
    return res.status(201).json({ order: { id: order.id, subtotal, shipping_amount: shippingAmount, total: grandTotal }, emails: { admin: adminMailResult, customer: customerMailResult }, promotion: { buy_two_applied: qualifiesForTwo, percent: qualifiesForTwo ? 10 : 0 } });
  } catch (error) {
    console.error('create-order:', error);
    return res.status(500).json({ error: error.message || 'No se pudo crear el pedido.' });
  }
}

import { createClient } from '@supabase/supabase-js';
import { sendEmail, emailLayout } from './_email.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(401).json({ error: 'No autorizado.' });
    const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data: auth, error: authError } = await db.auth.getUser(token);
    if (authError || !auth.user) return res.status(401).json({ error: 'Sesión inválida.' });
    const { data: profile } = await db.from('profiles').select('role').eq('id', auth.user.id).single();
    if (profile?.role !== 'admin') return res.status(403).json({ error: 'Solo administración puede enviar estas notificaciones.' });
    const { order_id, status, tracking_number } = req.body || {};
    if (!order_id) return res.status(400).json({ error: 'Falta el pedido.' });
    const { data: order, error } = await db.from('orders').select('*').eq('id', order_id).single();
    if (error || !order) return res.status(404).json({ error: 'Pedido no encontrado.' });
    const email = order.customer_email;
    if (!email) return res.status(200).json({ sent: false, reason: 'missing_customer_email' });
    const code = order.id.slice(0, 8).toUpperCase();
    const safe = v => String(v || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    let subject = `SS22 · Actualización de tu pedido #${code}`;
    let content = `<h2>Actualizamos tu pedido</h2><p>Tu pedido <b>#${code}</b> cambió de estado: <b>${safe(status || order.status)}</b>.</p>`;
    if (status === 'paid') content = `<h2>¡Pago confirmado!</h2><p>Verificamos tu transferencia del pedido <b>#${code}</b>. Ya comenzaremos a preparar tu compra.</p>`;
    if (status === 'in_transit' || tracking_number) content += `<p>Tu pedido fue despachado.${tracking_number ? `<br>Número de seguimiento: <b>${safe(tracking_number)}</b>` : ''}<br>Podés seguirlo en <a href="https://www.correoargentino.com.ar/formularios/e-commerce?id=${encodeURIComponent(tracking_number || '')}">Correo Argentino</a>.</p>`;
    if (status === 'ready' || status === 'arrived') content += `<p>Tu paquete ya está disponible para retirar / llegó a la sucursal indicada. Revisá el seguimiento para confirmar los detalles.</p>`;
    const result = await sendEmail({ to: email, subject, html: emailLayout(content) });
    return res.status(200).json(result);
  } catch (e) {
    console.error('order-notification:', e);
    return res.status(500).json({ error: 'No se pudo enviar el correo de actualización.' });
  }
}

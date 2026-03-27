import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

function wrapEmailContent(title, content) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050b14; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050b14;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0a1628; border-radius: 24px; overflow: hidden; border: 1px solid #1a3a5c; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
          <tr>
            <td style="padding: 60px 40px 40px 40px; text-align: center;">
              <h1 style="color: #00d4ff; margin: 0; font-size: 32px; letter-spacing: 4px; font-weight: bold; text-transform: uppercase;">XTREME PEPTIDES NZ</h1>
              <p style="color: #8b9cb5; margin: 15px 0 0 0; font-size: 14px; letter-spacing: 4px; font-weight: 500; text-transform: uppercase;">LABORATORY SUPPLY</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background: linear-gradient(to right, transparent, #00d4ff, transparent); opacity: 0.5;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding: 60px 60px 40px 60px; color: #a0aec0; font-size: 16px; line-height: 1.8;">
              ${content}
              <div style="margin-top: 60px; text-align: center;">
                <p style="color: #8b9cb5; margin: 0; font-size: 16px;">
                  Questions? Contact us at <a href="mailto:support@xtremepeptides.nz" style="color: #00d4ff; text-decoration: underline;">support@xtremepeptides.nz</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 60px; text-align: center; border-top: 1px solid rgba(26, 58, 92, 0.5);">
              <p style="color: #5a6a7d; margin: 0; font-size: 13px; line-height: 1.6;">
                Products sold for research purposes only. Not for human consumption.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateOrderConfirmationHTML(orderData) {
  const items = orderData.items || [];
  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #1a3a5c; color: #e0e6ed;">${item.name || 'Product'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #1a3a5c; color: #e0e6ed; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #1a3a5c; color: #00d4ff; text-align: right;">$${(parseFloat(item.price) || 0).toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #1a3a5c; color: #00d4ff; text-align: right;">$${((parseFloat(item.price) || 0) * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const shippingAddr = orderData.shippingAddress || {};
  const total = parseFloat(orderData.total || orderData.orderTotal) || 0;
  const shippingCost = parseFloat(orderData.shippingCost) || 0;
  const subtotal = parseFloat(orderData.subtotal) || (total - shippingCost) || 0;

  const content = `
    <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
      <h2 style="color: #ffffff; margin: 0; font-size: 24px;">✅ Order Confirmed!</h2>
    </div>
    <p style="margin-bottom: 20px;">
      Thank you for your order. We've received your order and will confirm your payment before shipping.
    </p>
    <div style="background-color: #1a2a3a; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="color: #8b9cb5; margin: 0 0 5px 0; font-size: 14px;">Order Number</p>
      <p style="color: #00d4ff; margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 1px;">${orderData.orderNumber}</p>
    </div>
    <h3 style="color: #00d4ff; margin: 30px 0 15px 0; border-bottom: 1px solid #1a3a5c; padding-bottom: 10px;">Order Summary</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #1a2a3a;">
          <th style="padding: 12px; text-align: left; color: #00d4ff; font-weight: bold;">Product</th>
          <th style="padding: 12px; text-align: center; color: #00d4ff; font-weight: bold;">Qty</th>
          <th style="padding: 12px; text-align: right; color: #00d4ff; font-weight: bold;">Price</th>
          <th style="padding: 12px; text-align: right; color: #00d4ff; font-weight: bold;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; border-top: 2px solid #1a3a5c; padding-top: 20px;">
      <tr>
        <td style="padding: 8px 0; color: #8b9cb5; text-align: right; width: 70%;">Subtotal:</td>
        <td style="padding: 8px 0; color: #e0e6ed; text-align: right;">$${subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #8b9cb5; text-align: right;">Shipping:</td>
        <td style="padding: 8px 0; color: #e0e6ed; text-align: right;">$${shippingCost.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; color: #00d4ff; font-weight: bold; text-align: right; border-top: 1px solid #1a3a5c;">Total:</td>
        <td style="padding: 12px 0; color: #00d4ff; font-weight: bold; text-align: right; border-top: 1px solid #1a3a5c;">$${total.toFixed(2)}</td>
      </tr>
    </table>
    <div style="background-color: #1a2a3a; padding: 20px; border-radius: 8px; margin-top: 30px;">
      <h4 style="color: #00d4ff; margin: 0 0 15px 0;">Shipping Details</h4>
      <p style="color: #e0e6ed; margin: 0; line-height: 1.6;">
        ${shippingAddr.name || orderData.customerName || 'N/A'}<br>
        ${shippingAddr.address || 'N/A'}<br>
        ${shippingAddr.city || 'N/A'}, ${shippingAddr.postalCode || 'N/A'}<br>
        ${shippingAddr.region ? shippingAddr.region + '<br>' : ''}New Zealand
      </p>
    </div>
  `;
  return wrapEmailContent(`Order Confirmation - ${orderData.orderNumber}`, content);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const body = req.body;
  let orderData = body.orderData || body;

  if (!orderData.customerEmail || !orderData.orderNumber) {
    return res.status(400).json({ error: 'Invalid request payload.' });
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const now = new Date().toISOString();

    // Upsert order to Supabase
    const { data: orderRow, error: upsertError } = await supabase
      .from('orders')
      .upsert({
        order_number: orderData.orderNumber,
        customer_name: orderData.customerName || orderData.shippingAddress?.name || orderData.customerEmail,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone || null,
        items: orderData.items || [],
        order_total: parseFloat(orderData.total || orderData.orderTotal) || 0,
        subtotal: parseFloat(orderData.subtotal) || 0,
        shipping_cost: parseFloat(orderData.shippingCost) || 0,
        shipping_address: orderData.shippingAddress || {},
        payment_method: orderData.paymentMethod || null,
        status: 'pending',
        created_at: now,
        updated_at: now,
      }, { onConflict: 'order_number' })
      .select()
      .single();

    if (upsertError) throw upsertError;

    // Send confirmation email
    const htmlContent = generateOrderConfirmationHTML(orderData);
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `XTREME PEPTIDES NZ <${fromEmail}>`,
      to: orderData.customerEmail,
      subject: `Order Confirmation - ${orderData.orderNumber}`,
      html: htmlContent,
    });

    if (emailError) throw emailError;

    // Log email
    await supabase.from('email_logs').insert({
      order_id: orderRow?.id || null,
      order_number: orderData.orderNumber,
      recipient_email: orderData.customerEmail,
      subject: `Order Confirmation - ${orderData.orderNumber}`,
      body: `Order confirmation for #${orderData.orderNumber}`,
      type: 'order_confirmation',
      sent_at: now,
      status: 'sent',
      resend_id: emailData?.id || null,
    });

    return res.json({ success: true, orderId: orderRow?.id });
  } catch (err) {
    console.error('Order Processing Error:', err);
    return res.status(500).json({ error: 'Failed to process order confirmation.' });
  }
}

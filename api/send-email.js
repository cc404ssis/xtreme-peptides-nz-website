// API endpoint for sending order confirmation emails
// Uses Resend API - requires RESEND_API_KEY environment variable

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_BkgL5J49_5idSZmG6ywuU8PzmuLKEc53r';
const FROM_EMAIL = 'support@xtremepeptides.nz';

function generateOrderConfirmationHTML(data) {
  const { orderNumber, customerEmail, items, subtotal, shippingCost, total, shippingAddress, paymentMethod } = data;
  
  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #1a3a5c; color: #e0e6ed;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #1a3a5c; color: #e0e6ed; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #1a3a5c; color: #00d4ff; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #1a3a5c; color: #00d4ff; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - XTREME PEPTIDES NZ</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a1628; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a1628;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0f1f33; border-radius: 16px; overflow: hidden; border: 1px solid #1a3a5c;">
          
          <tr>
            <td style="background: linear-gradient(135deg, #0a1628 0%, #0f1f33 100%); padding: 40px; text-align: center; border-bottom: 2px solid #00d4ff;">
              <img src="https://xtremepeptides.nz/logo.png" alt="XTREME PEPTIDES NZ" style="max-width: 200px; height: auto; margin-bottom: 10px;" onerror="this.style.display='none'">
              <p style="color: #8b9cb5; margin: 10px 0 0 0; font-size: 14px; letter-spacing: 2px;">LABORATORY SUPPLY</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 24px;">✅ Order Confirmed!</h2>
              </div>
              <p style="color: #e0e6ed; font-size: 16px; line-height: 1.6;">
                Thank you for your order. We've received your payment and are processing your items.
              </p>
              
              <div style="background-color: #1a2a3a; border-left: 4px solid #00d4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #8b9cb5; margin: 0 0 5px 0; font-size: 14px;">Order Number</p>
                <p style="color: #00d4ff; margin: 0; font-size: 24px; font-family: monospace; font-weight: bold;">${orderNumber}</p>
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <h3 style="color: #00d4ff; margin-bottom: 15px;">Order Summary</h3>
              <table width="100%" style="border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #1a3a5c;">
                    <th style="padding: 12px; text-align: left; color: #ffffff;">Product</th>
                    <th style="padding: 12px; text-align: center; color: #ffffff;">Qty</th>
                    <th style="padding: 12px; text-align: right; color: #ffffff;">Price</th>
                    <th style="padding: 12px; text-align: right; color: #ffffff;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
              
              <table width="100%" style="margin-top: 20px; border-top: 2px solid #1a3a5c;">
                <tr>
                  <td style="padding: 8px 0; color: #8b9cb5; text-align: right;">Subtotal:</td>
                  <td style="padding: 8px 0; color: #e0e6ed; text-align: right; width: 100px;">$${subtotal.toFixed(2)}</td>
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
                <h4 style="color: #00d4ff; margin: 0 0 15px 0;">Shipping Address</h4>
                <p style="color: #e0e6ed; margin: 0; line-height: 1.6;">
                  ${shippingAddress.name}<br>
                  ${shippingAddress.address}<br>
                  ${shippingAddress.city}, ${shippingAddress.postcode}<br>
                  ${shippingAddress.country || 'New Zealand'}
                </p>
              </div>
              
              <p style="color: #8b9cb5; margin-top: 30px; font-size: 14px; text-align: center;">
                Questions? Contact us at <a href="mailto:support@xtremepeptides.nz" style="color: #00d4ff;">support@xtremepeptides.nz</a>
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #0a1628; padding: 30px 40px; text-align: center; border-top: 1px solid #1a3a5c;">
              <p style="color: #5a6a7d; margin: 0 0 10px 0; font-size: 12px;">
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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  try {
    // FIX: Support both data formats:
    // 1. { orderData: { ... } } - original expected format
    // 2. { orderNumber, customerEmail, ... } - flat format from frontend
    const body = req.body;
    
    // Check if data is wrapped in orderData or flat
    let orderData;
    if (body.orderData && body.orderData.customerEmail) {
      orderData = body.orderData;
    } else if (body.customerEmail && body.orderNumber) {
      orderData = body;
    } else {
      return res.status(400).json({ 
        error: 'Missing required fields: orderData.customerEmail and orderData.orderNumber are required',
        received: Object.keys(body)
      });
    }

    const htmlContent = generateOrderConfirmationHTML(orderData);

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [orderData.customerEmail], // Must be an array
        subject: `Order Confirmation - ${orderData.orderNumber}`,
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return res.status(response.status).json({ 
        error: 'Failed to send email', 
        details: data 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Order confirmation email sent successfully',
      emailId: data.id 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

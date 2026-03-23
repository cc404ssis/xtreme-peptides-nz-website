// Vercel Serverless Function for sending order emails
// Endpoint: /api/send-email

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    
    // Get API key from environment (server-side only)
    const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    console.log('Sending email for order:', data.orderNumber);

    const htmlContent = generateOrderEmailHTML(data);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'XTREME PEPTIDES NZ <support@xtremepeptides.nz>',
        to: data.customerEmail,
        subject: `Order Received - ${data.orderNumber}`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    const result = await response.json();
    console.log('Email sent successfully:', result.id);
    return res.status(200).json({ success: true, id: result.id });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: String(error) });
  }
}

function generateOrderEmailHTML(data) {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #1a2a3a;">
        <strong style="color: #e0e6ed;">${item.name}</strong><br>
        <span style="color: #8b9cb5; font-size: 14px;">${item.size}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #1a2a3a; text-align: center; color: #e0e6ed;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #1a2a3a; text-align: right; color: #00d4ff; font-family: monospace;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const shippingAddressHtml = `
    ${data.shippingAddress.name}<br>
    ${data.shippingAddress.address}<br>
    ${data.shippingAddress.city}, ${data.shippingAddress.region}<br>
    ${data.shippingAddress.postalCode}
  `;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
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
              <h2 style="color: #e0e6ed; margin: 0 0 10px 0; font-size: 24px;">Order Received</h2>
              <p style="color: #8b9cb5; margin: 0; font-size: 16px;">Thank you for your order. Please complete your payment using the details below.</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px;">
              <div style="background-color: #1a2a3a; border-left: 4px solid #00d4ff; padding: 20px; border-radius: 8px;">
                <p style="color: #8b9cb5; margin: 0 0 5px 0; font-size: 14px;">Order Number</p>
                <p style="color: #00d4ff; margin: 0; font-size: 24px; font-family: monospace; font-weight: bold;">${data.orderNumber}</p>
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <h3 style="color: #e0e6ed; margin: 0 0 20px 0; font-size: 18px;">Order Details</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a1628; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #1a3a5c;">
                    <th style="padding: 12px; text-align: left; color: #e0e6ed; font-size: 14px;">Product</th>
                    <th style="padding: 12px; text-align: center; color: #e0e6ed; font-size: 14px;">Qty</th>
                    <th style="padding: 12px; text-align: right; color: #e0e6ed; font-size: 14px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr>
                    <td colspan="2" style="padding: 12px; text-align: right; color: #8b9cb5;">Subtotal</td>
                    <td style="padding: 12px; text-align: right; color: #e0e6ed; font-family: monospace;">$${(data.orderTotal - data.shippingCost).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 12px; text-align: right; color: #8b9cb5;">Shipping</td>
                    <td style="padding: 12px; text-align: right; color: #e0e6ed; font-family: monospace;">$${data.shippingCost.toFixed(2)}</td>
                  </tr>
                  <tr style="border-top: 2px solid #00d4ff;">
                    <td colspan="2" style="padding: 12px; text-align: right; color: #e0e6ed; font-weight: bold;">Total</td>
                    <td style="padding: 12px; text-align: right; color: #00d4ff; font-family: monospace; font-weight: bold; font-size: 18px;">$${data.orderTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <h3 style="color: #e0e6ed; margin: 0 0 20px 0; font-size: 18px;">Payment Instructions</h3>
              <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #ffffff; margin: 0; font-size: 14px;"><strong>IMPORTANT:</strong> Do not mention peptides or product names in your transfer reference. Use only your name and order number.</p>
              </div>
              <div style="background-color: #1a2a3a; padding: 20px; border-radius: 8px; border: 1px solid #1a3a5c;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; color: #8b9cb5; font-size: 14px;">Account Name</td>
                    <td style="padding: 8px 0; color: #e0e6ed; font-family: monospace; text-align: right; font-size: 14px;">xtremepeptidesnz</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #8b9cb5; font-size: 14px;">Account Number</td>
                    <td style="padding: 8px 0; color: #e0e6ed; font-family: monospace; text-align: right; font-size: 14px;">12-3435-3453323-08</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #8b9cb5; font-size: 14px;">Reference</td>
                    <td style="padding: 8px 0; color: #00d4ff; font-family: monospace; text-align: right; font-size: 14px; font-weight: bold;">${data.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #8b9cb5; font-size: 14px;">Amount</td>
                    <td style="padding: 8px 0; color: #00d4ff; font-family: monospace; text-align: right; font-size: 16px; font-weight: bold;">$${data.orderTotal.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <h3 style="color: #e0e6ed; margin: 0 0 15px 0; font-size: 18px;">What's Next:</h3>
              <ol style="color: #8b9cb5; padding-left: 20px; margin: 0; line-height: 1.8;">
                <li>Transfer <strong style="color: #e0e6ed;">$${data.orderTotal.toFixed(2)}</strong> to the account above</li>
                <li>Use your order number <strong style="color: #00d4ff;">${data.orderNumber}</strong> as the reference</li>
                <li>We'll verify your payment within <strong style="color: #e0e6ed;">24 hours</strong></li>
                <li>Shipping confirmation will be emailed to <strong style="color: #e0e6ed;">${data.customerEmail}</strong></li>
              </ol>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <h3 style="color: #e0e6ed; margin: 0 0 15px 0; font-size: 18px;">Shipping Address</h3>
              <div style="background-color: #1a2a3a; padding: 20px; border-radius: 8px; border: 1px solid #1a3a5c;">
                <p style="color: #e0e6ed; margin: 0; line-height: 1.6;">${shippingAddressHtml}</p>
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #0a1628; padding: 30px 40px; text-align: center; border-top: 1px solid #1a3a5c;">
              <p style="color: #8b9cb5; margin: 0 0 10px 0; font-size: 14px;">Questions?</p>
              <a href="mailto:support@xtremepeptides.nz" style="color: #00d4ff; text-decoration: none; font-size: 14px;">support@xtremepeptides.nz</a>
              <p style="color: #5a6a7d; margin: 20px 0 0 0; font-size: 12px;">
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

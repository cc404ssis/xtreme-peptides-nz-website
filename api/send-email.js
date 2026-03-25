// API endpoint for sending order confirmation emails
// Uses Resend API - requires RESEND_API_KEY environment variable

const https = require('https');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'support@xtremepeptides.nz';

function generateOrderConfirmationHTML(data) {
  const { orderNumber, customerEmail, items, subtotal, shippingCost, total, shippingAddress, paymentMethod } = data;
  
  const itemsHTML = items.map(item => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #1a3a5c; color: #e0e6ed;">${item.name || 'Product'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #1a3a5c; color: #e0e6ed; text-align: center;">${quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #1a3a5c; color: #00d4ff; text-align: right;">$${price.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #1a3a5c; color: #00d4ff; text-align: right;">$${(price * quantity).toFixed(2)}</td>
    </tr>
  `}).join('');

  const shippingAddr = shippingAddress || {};

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
              <h1 style="color: #00d4ff; margin: 0; font-size: 28px; letter-spacing: 2px;">XTREME PEPTIDES NZ</h1>
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
              
              <div style="background-color: #1a2a3a; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #8b9cb5; margin: 0 0 5px 0; font-size: 14px;">Order Number</p>
                <p style="color: #00d4ff; margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 1px;">${orderNumber}</p>
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
                  <td style="padding: 8px 0; color: #e0e6ed; text-align: right;">$${parseFloat(subtotal).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #8b9cb5; text-align: right;">Shipping:</td>
                  <td style="padding: 8px 0; color: #e0e6ed; text-align: right;">$${parseFloat(shippingCost).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #00d4ff; font-weight: bold; text-align: right; border-top: 1px solid #1a3a5c;">Total:</td>
                  <td style="padding: 12px 0; color: #00d4ff; font-weight: bold; text-align: right; border-top: 1px solid #1a3a5c;">$${parseFloat(total).toFixed(2)}</td>
                </tr>
              </table>
              
              <div style="background-color: #1a2a3a; padding: 20px; border-radius: 8px; margin-top: 30px;">
                <h4 style="color: #00d4ff; margin: 0 0 15px 0;">Shipping Address</h4>
                <p style="color: #e0e6ed; margin: 0; line-height: 1.6;">
                  ${shippingAddr.name || 'N/A'}<br>
                  ${shippingAddr.address || 'N/A'}<br>
                  ${shippingAddr.city || 'N/A'}, ${shippingAddr.postcode || 'N/A'}<br>
                  ${shippingAddr.country || 'New Zealand'}
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

// Helper function to make HTTPS request
function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// Helper to parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    // If body is already parsed by Vercel
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  console.log('send-email API called:', req.method, req.url);
  
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
    console.error('RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  try {
    const body = await parseBody(req);
    console.log('Request body keys:', Object.keys(body));
    console.log('Request body:', JSON.stringify(body).substring(0, 500));
    
    // Support both data formats
    let orderData;
    if (body.orderData && body.orderData.customerEmail) {
      orderData = body.orderData;
    } else if (body.customerEmail && body.orderNumber) {
      orderData = body;
    } else {
      console.error('Invalid request body - missing customerEmail or orderNumber');
      return res.status(400).json({ 
        error: 'Missing required fields: customerEmail and orderNumber are required',
        received: Object.keys(body),
        bodyType: typeof body,
        bodyPreview: JSON.stringify(body).substring(0, 200)
      });
    }

    console.log('Sending email to:', orderData.customerEmail);
    
    // Validate and sanitize data - support both orderTotal and total
    const items = Array.isArray(orderData.items) ? orderData.items : [];
    const shippingCost = parseFloat(orderData.shippingCost) || 0;
    const total = parseFloat(orderData.total) || parseFloat(orderData.orderTotal) || 0;
    const subtotal = parseFloat(orderData.subtotal) || (total - shippingCost) || 0;
    const shippingAddress = orderData.shippingAddress || {};
    const customerName = orderData.customerName || shippingAddress?.name || orderData.customerEmail;
    
    const htmlContent = generateOrderConfirmationHTML({
      orderNumber: orderData.orderNumber,
      customerEmail: orderData.customerEmail,
      items: items,
      subtotal: subtotal,
      shippingCost: shippingCost,
      total: total,
      shippingAddress: shippingAddress,
      paymentMethod: orderData.paymentMethod || 'bank_transfer'
    });

    const postData = JSON.stringify({
      from: FROM_EMAIL,
      to: [orderData.customerEmail],
      subject: `Order Confirmation - ${orderData.orderNumber}`,
      html: htmlContent,
    });

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const result = await makeRequest(options, postData);
    console.log('Resend API response:', result.statusCode, result.data);

    if (result.statusCode >= 200 && result.statusCode < 300) {
      return res.status(200).json({ 
        success: true, 
        message: 'Order confirmation email sent successfully',
        emailId: result.data.id 
      });
    } else {
      console.error('Resend API error:', result.data);
      return res.status(result.statusCode || 500).json({ 
        error: 'Failed to send email', 
        details: result.data 
      });
    }

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      stack: error.stack
    });
  }
};

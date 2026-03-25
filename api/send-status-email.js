// API endpoint for sending status update emails
// Uses Resend API - requires RESEND_API_KEY environment variable

const https = require('https');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'support@xtremepeptides.nz';

function generateCustomMessageHTML(data) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message from XTREME PEPTIDES NZ</title>
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
                <h2 style="color: #ffffff; margin: 0; font-size: 24px;">✏️ Message from XTREME PEPTIDES NZ</h2>
              </div>
              <p style="color: #e0e6ed; font-size: 16px; line-height: 1.6;">
                Regarding your order <strong style="color: #00d4ff;">${data.orderNumber}</strong>:
              </p>            
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              ${data.customMessage ? `
              <div style="background-color: #1a2a3a; border-left: 4px solid #06b6d4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #e0e6ed; margin: 0; line-height: 1.8; font-size: 15px;">${data.customMessage}</p>
              </div>
              ` : ''}
              
              <div style="background-color: #1a2a3a; border-left: 4px solid #00d4ff; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p style="color: #8b9cb5; margin: 0 0 5px 0; font-size: 14px;">Order Number</p>
                <p style="color: #00d4ff; margin: 0; font-size: 20px; font-family: monospace; font-weight: bold;">${data.orderNumber}</p>
              </div>
              
              <p style="color: #8b9cb5; margin-top: 30px; font-size: 14px; text-align: center;">
                Need to reply? Contact us at <a href="mailto:support@xtremepeptides.nz" style="color: #00d4ff;">support@xtremepeptides.nz</a>
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

function generateStatusUpdateHTML(data) {
  const statusColors = {
    'pending': '#f59e0b',
    'processing': '#3b82f6',
    'shipped': '#8b5cf6',
    'delivered': '#10b981',
    'cancelled': '#ef4444',
    'completed': '#10b981'
  };

  const statusEmojis = {
    'pending': '⏳',
    'processing': '⚙️',
    'shipped': '🚚',
    'delivered': '✅',
    'cancelled': '❌',
    'completed': '✅'
  };

  const statusColor = statusColors[data.status] || '#00d4ff';
  const statusEmoji = statusEmojis[data.status] || '📦';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update - XTREME PEPTIDES NZ</title>
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
              <div style="background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 24px;">${statusEmoji} Order Status Update</h2>
              </div>
              <p style="color: #e0e6ed; font-size: 16px; line-height: 1.6;">
                Your order status has been updated to <strong style="color: ${statusColor};">${data.status.toUpperCase()}</strong>.
              </p>
              
              <div style="background-color: #1a2a3a; border-left: 4px solid ${statusColor}; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #8b9cb5; margin: 0 0 5px 0; font-size: 14px;">Order Number</p>
                <p style="color: #00d4ff; margin: 0; font-size: 24px; font-family: monospace; font-weight: bold;">${data.orderNumber}</p>
              </div>
              
              ${data.trackingNumber ? `
              <div style="background-color: #1a2a3a; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p style="color: #8b9cb5; margin: 0 0 5px 0; font-size: 14px;">Tracking Number</p>
                <p style="color: #00d4ff; margin: 0; font-size: 18px; font-family: monospace;">${data.trackingNumber}</p>
              </div>
              ` : ''}
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              ${data.message ? `
              <div style="background-color: #1a2a3a; border-left: 4px solid #06b6d4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #e0e6ed; margin: 0; line-height: 1.8; font-size: 15px;">${data.message}</p>
              </div>
              ` : ''}
              
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
  console.log('send-status-email API called:', req.method, req.url);
  
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
    const { email, orderNumber, status, message, trackingNumber, customMessage, emailType } = body;

    if (!email || !orderNumber) {
      return res.status(400).json({ error: 'Missing required fields: email and orderNumber are required' });
    }

    let htmlContent;
    let subject;

    if (emailType === 'custom' || customMessage) {
      htmlContent = generateCustomMessageHTML({ orderNumber, customMessage });
      subject = `Message Regarding Your Order - ${orderNumber}`;
    } else {
      htmlContent = generateStatusUpdateHTML({ 
        orderNumber, 
        status: status || 'updated', 
        message, 
        trackingNumber 
      });
      subject = `Order Status Update - ${orderNumber}`;
    }

    const postData = JSON.stringify({
      from: FROM_EMAIL,
      to: [email],
      subject: subject,
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
        message: 'Status update email sent successfully',
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

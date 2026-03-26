// API endpoint for sending status update emails
// Uses Resend API - requires RESEND_API_KEY environment variable

const https = require('https');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'XTREME PEPTIDES NZ <support@xtremepeptides.nz>';

function generateEmailHTML(data) {
  const emailType = data.emailType || 'status';
  const status = data.status || 'updated';
  const orderNumber = data.orderNumber || '';
  const trackingNumber = data.trackingNumber || '';
  const customMessage = data.customMessage || '';
  const message = data.message || '';

  // Email type configurations
  const typeConfig = {
    payment_confirmed: {
      title: 'Payment Confirmed',
      emoji: '💳',
      color: '#10b981',
      content: `Thank you for your payment! Your order has been confirmed and is now being processed. We'll notify you once your order ships.`
    },
    order_shipped: {
      title: 'Your Order Has Shipped',
      emoji: '🚚',
      color: '#8b5cf6',
      content: `Great news! Your order has been shipped and is on its way to you.`
    },
    order_delivered: {
      title: 'Your Order Has Been Delivered',
      emoji: '✅',
      color: '#10b981',
      content: `Your order has been delivered! Thank you for shopping with XTREME PEPTIDES NZ.`
    },
    order_cancelled: {
      title: 'Order Cancelled',
      emoji: '❌',
      color: '#ef4444',
      content: `Your order has been cancelled. If you have any questions, please contact us at support@xtremepeptides.nz`,
      closing: `We'd love to have you back — browse our full range at <a href="https://xtremepeptides.nz" style="color: #00d4ff;">xtremepeptides.nz</a> and place a new order any time.`
    },
    order_refunded: {
      title: 'Refund Processed',
      emoji: '💰',
      color: '#06b6d4',
      content: `A refund has been processed for your order. Please allow 3-5 business days for the funds to appear in your account.`,
      closing: `We hope to see you again soon — our full range is available at <a href="https://xtremepeptides.nz" style="color: #00d4ff;">xtremepeptides.nz</a> whenever you're ready.`
    },
    order_delayed: {
      title: 'Order Delay',
      emoji: '⏳',
      color: '#f59e0b',
      content: message || `We're sorry, but your order has been delayed. We appreciate your patience and will keep you updated.`,
      closing: `We will update you with your order status as soon as we can. Thank you for your patience.`
    },
    custom: {
      title: 'Message from XTREME PEPTIDES NZ',
      emoji: '✏️',
      color: '#06b6d4',
      content: customMessage
    }
  };

  const config = typeConfig[emailType] || typeConfig.custom;

  let trackingHTML = '';
  if (trackingNumber && emailType === 'order_shipped') {
    trackingHTML = `
      <div style="background-color: #1a2a3a !important; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #8b9cb5 !important; margin: 0 0 5px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Tracking Number</p>
        <p style="color: #00d4ff !important; margin: 0; font-size: 18px; font-family: 'Courier New', Courier, monospace; font-weight: bold;">${trackingNumber}</p>
      </div>
    `;
  }

  let customMessageHTML = '';
  if (customMessage) {
    customMessageHTML = `
      <div style="background-color: #1a2a3a !important; border-left: 4px solid #06b6d4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #e0e6ed !important; margin: 0; line-height: 1.8; font-size: 15px;">${customMessage.replace(/\n/g, '<br>')}</p>
      </div>
    `;
  }

  const closingHTML = config.closing ? `
    <p style="color: #e0e6ed !important; font-size: 15px; line-height: 1.6; margin-top: 25px; padding-top: 20px; border-top: 1px solid #1a3a5c;">
      ${config.closing}
    </p>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${config.title} - XTREME PEPTIDES NZ</title>
  <style>
    :root { color-scheme: dark; }
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #0a1628 !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    /* Force dark background on all clients */
    .email-wrapper { background-color: #0a1628 !important; }
    .email-card    { background-color: #0f1f33 !important; }
    .email-header  { background-color: #0a1628 !important; }
    .email-body    { background-color: #0f1f33 !important; }
    .email-footer  { background-color: #0a1628 !important; }
    .email-text    { color: #e0e6ed !important; }
    .email-muted   { color: #8b9cb5 !important; }
    .email-cyan    { color: #00d4ff !important; }
    .order-box     { background-color: #1a2a3a !important; }
    .custom-box    { background-color: #1a2a3a !important; }
    /* Outlook dark mode */
    [data-ogsc] body, [data-ogsb] body { background-color: #0a1628 !important; }
    [data-ogsc] .email-card, [data-ogsb] .email-card { background-color: #0f1f33 !important; }
    [data-ogsc] .email-body, [data-ogsb] .email-body { background-color: #0f1f33 !important; }
  </style>
</head>
<body class="email-wrapper" style="margin: 0; padding: 0; background-color: #0a1628 !important; font-family: Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%;">
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a1628 !important;">
    <tr>
      <td align="center" style="padding: 40px 20px; background-color: #0a1628 !important;">
        <table class="email-card" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #0f1f33 !important; border-radius: 16px; border: 1px solid #1a3a5c; max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td class="email-header" style="background-color: #0a1628 !important; padding: 30px 40px; text-align: center; border-bottom: 2px solid #00d4ff;">
              <img src="https://xtremepeptides.nz/logo.png" alt="XTREME PEPTIDES NZ" width="200" style="display: block; margin: 0 auto; max-width: 200px; border: 0;">
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="email-body" style="padding: 40px; background-color: #0f1f33 !important;">

              <!-- Status banner -->
              <div style="background-color: ${config.color} !important; padding: 20px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
                <h2 style="color: #ffffff !important; margin: 0; font-size: 22px; font-weight: bold;">${config.emoji} ${config.title}</h2>
              </div>

              <p class="email-text" style="color: #e0e6ed !important; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Regarding your order <strong class="email-cyan" style="color: #00d4ff !important;">${orderNumber}</strong>:
              </p>

              <p class="email-text" style="color: #e0e6ed !important; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${config.content}
              </p>

              ${customMessageHTML}
              ${trackingHTML}
              ${closingHTML}

              <!-- Order number box -->
              <div class="order-box" style="background-color: #1a2a3a !important; border-left: 4px solid #00d4ff; padding: 20px; border-radius: 8px; margin-top: 24px;">
                <p class="email-muted" style="color: #8b9cb5 !important; margin: 0 0 6px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                <p class="email-cyan" style="color: #00d4ff !important; margin: 0; font-size: 20px; font-family: 'Courier New', Courier, monospace; font-weight: bold;">${orderNumber}</p>
              </div>

              <p class="email-muted" style="color: #8b9cb5 !important; margin-top: 30px; font-size: 14px; text-align: center;">
                Questions? Contact us at <a href="mailto:support@xtremepeptides.nz" style="color: #00d4ff !important; text-decoration: underline;">support@xtremepeptides.nz</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-footer" style="background-color: #0a1628 !important; padding: 24px 40px; text-align: center; border-top: 1px solid #1a3a5c;">
              <p style="color: #4a6080 !important; margin: 0; font-size: 12px;">
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

// Legacy function for backward compatibility
function generateStatusUpdateHTML(data) {
  return generateEmailHTML(data);
}

// Legacy function for backward compatibility  
function generateCustomMessageHTML(data) {
  return generateEmailHTML({ ...data, emailType: 'custom' });
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

    // Generate email using new unified function
    const htmlContent = generateEmailHTML({
      emailType: emailType || 'status',
      orderNumber,
      status: status || 'updated',
      trackingNumber,
      customMessage,
      message
    });

    // Determine subject based on email type
    const subjectMap = {
      payment_confirmed: `Payment Confirmed - Order ${orderNumber}`,
      order_shipped: `Your Order Has Shipped - ${orderNumber}`,
      order_delivered: `Your Order Has Been Delivered - ${orderNumber}`,
      order_cancelled: `Order Cancelled - ${orderNumber}`,
      order_refunded: `Refund Processed - Order ${orderNumber}`,
      order_delayed: `Order Delay - ${orderNumber}`,
      custom: `Message Regarding Your Order - ${orderNumber}`,
      status: `Order Status Update - ${orderNumber}`
    };

    const subject = subjectMap[emailType] || subjectMap.status;

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

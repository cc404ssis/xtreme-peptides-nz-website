// Admin API endpoint for sending order status update emails
// Supports: payment_confirmed, order_shipped, order_delivered, order_cancelled, order_refunded, order_delayed

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
    const { type, data } = req.body;
    
    // Get API key from environment
    const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    let htmlContent, subject;

    switch (type) {
      case 'payment_confirmed':
        htmlContent = generatePaymentConfirmedHTML(data);
        subject = `Payment Confirmed - ${data.orderNumber}`;
        break;
      case 'order_shipped':
        htmlContent = generateOrderShippedHTML(data);
        subject = `Order Shipped - ${data.orderNumber}`;
        break;
      case 'order_delivered':
        htmlContent = generateOrderDeliveredHTML(data);
        subject = `Order Delivered - ${data.orderNumber}`;
        break;
      case 'order_cancelled':
        htmlContent = generateOrderCancelledHTML(data);
        subject = `Order Cancelled - ${data.orderNumber}`;
        break;
      case 'order_refunded':
        htmlContent = generateOrderRefundedHTML(data);
        subject = `Order Refunded - ${data.orderNumber}`;
        break;
      case 'order_delayed':
        htmlContent = generateOrderDelayedHTML(data);
        subject = `Order Delayed - ${data.orderNumber}`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'XTREME PEPTIDES NZ <support@xtremepeptides.nz>',
        to: data.customerEmail,
        subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    const result = await response.json();
    console.log(`${type} email sent:`, result.id);
    return res.status(200).json({ success: true, id: result.id });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: String(error) });
  }
}

function generatePaymentConfirmedHTML(data) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmed</title>
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
              <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 24px;">✓ Payment Confirmed</h2>
              </div>
              <p style="color: #e0e6ed; font-size: 16px; line-height: 1.6;">
                Thank you! Your payment for order <strong style="color: #00d4ff;">${data.orderNumber}</strong> has been received and confirmed.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <h3 style="color: #e0e6ed; margin: 0 0 15px 0; font-size: 18px;">What's Next:</h3>
              <p style="color: #8b9cb5; line-height: 1.8;">
                Your order is now being prepared for shipment. You'll receive a tracking notification via email once your package has been dispatched via NZ Post.
              </p>
              <div style="background-color: #1a2a3a; border-left: 4px solid #00d4ff; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p style="color: #8b9cb5; margin: 0 0 5px 0; font-size: 14px;">Order Number</p>
                <p style="color: #00d4ff; margin: 0; font-size: 20px; font-family: monospace; font-weight: bold;">${data.orderNumber}</p>
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

function generateOrderShippedHTML(data) {
  const trackingUrl = data.trackingNumber 
    ? `https://www.nzpost.co.nz/tools/tracking?trackid=${data.trackingNumber}`
    : 'https://www.nzpost.co.nz/tools/tracking';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped</title>
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
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 24px;">📦 Order Shipped</h2>
              </div>
              <p style="color: #e0e6ed; font-size: 16px; line-height: 1.6;">
                Great news! Your order <strong style="color: #00d4ff;">${data.orderNumber}</strong> has been dispatched.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <h3 style="color: #e0e6ed; margin: 0 0 15px 0; font-size: 18px;">Tracking Information</h3>
              
              <div style="background-color: #1a2a3a; padding: 20px; border-radius: 8px; border: 1px solid #1a3a5c;">
                <p style="color: #8b9cb5; margin: 0 0 10px 0; font-size: 14px;">Carrier</p>
                <p style="color: #e0e6ed; margin: 0 0 20px 0; font-size: 16px; font-weight: bold;">NZ Post</p>
                
                ${data.trackingNumber ? `
                <p style="color: #8b9cb5; margin: 0 0 10px 0; font-size: 14px;">Tracking Number</p>
                <p style="color: #00d4ff; margin: 0 0 20px 0; font-size: 20px; font-family: monospace; font-weight: bold;">${data.trackingNumber}</p>
                ` : ''}
                
                <a href="${trackingUrl}" style="display: inline-block; background-color: #00d4ff; color: #0a1628; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Track Your Order</a>
              </div>
              
              <p style="color: #8b9cb5; margin-top: 20px; font-size: 14px;">
                You can also track your package at <a href="https://www.nzpost.co.nz/tools/tracking" style="color: #00d4ff;">www.nzpost.co.nz/tools/tracking</a>
              </p>
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

function generateOrderDeliveredHTML(data) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Delivered</title>
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
              <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 24px;">✓ Order Delivered</h2>
              </div>
              <p style="color: #e0e6ed; font-size: 16px; line-height: 1.6;">
                Your order <strong style="color: #00d4ff;">${data.orderNumber}</strong> has been delivered!
              </p>            
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="color: #8b9cb5; line-height: 1.8;">
                Your package has been successfully delivered. Thank you for choosing XTREME PEPTIDES NZ.
              </p>
              
              <div style="background-color: #1a2a3a; border-left: 4px solid #00d4ff; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p style="color: #8b9cb5; margin: 0 0 5px 0; font-size: 14px;">Order Number</p>
                <p style="color: #00d4ff; margin: 0; font-size: 20px; font-family: monospace; font-weight: bold;">${data.orderNumber}</p>
              </div>
              
              <p style="color: #8b9cb5; margin-top: 30px; font-size: 14px; text-align: center;">
                Have questions about your order? Contact us at <a href="mailto:support@xtremepeptides.nz" style="color: #00d4ff;">support@xtremepeptides.nz</a>
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

function generateOrderCancelledHTML(data) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Cancelled</title>
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
              <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 24px;">❌ Order Cancelled</h2>
              </div>
              <p style="color: #e0e6ed; font-size: 16px; line-height: 1.6;">
                Your order <strong style="color: #00d4ff;">${data.orderNumber}</strong> has been cancelled.
              </p>            
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              ${data.customMessage ? `
              <div style="background-color: #1a2a3a; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #8b9cb5; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">Reason for Cancellation:</p>
                <p style="color: #e0e6ed; margin: 0; line-height: 1.6;">${data.customMessage}</p>
              </div>
              ` : ''}
              
              <p style="color: #8b9cb5; line-height: 1.8;">
                If you have any questions about this cancellation or would like to place a new order, please contact our support team.
              </p>
              
              <div style="background-color: #1a2a3a; border-left: 4px solid #00d4ff; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p style="color: #8b9cb5; margin: 0 0 5px 0; font-size: 14px;">Order Number</p>
                <p style="color: #00d4ff; margin: 0; font-size: 20px; font-family: monospace; font-weight: bold;">${data.orderNumber}</p>
              </div>
              
              <p style="color: #8b9cb5; margin-top: 30px; font-size: 14px; text-align: center;">
                Contact us at <a href="mailto:support@xtremepeptides.nz" style="color: #00d4ff;">support@xtremepeptides.nz</a>
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

function generateOrderRefundedHTML(data) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Refunded</title>
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
              <div style="background: linear-gradient(135deg, #f97316 0%, #c2410c 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 24px;">↩️ Order Refunded</h2>
              </div>
              <p style="color: #e0e6ed; font-size: 16px; line-height: 1.6;">
                Your order <strong style="color: #00d4ff;">${data.orderNumber}</strong> has been refunded.
              </p>            
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              ${data.customMessage ? `
              <div style="background-color: #1a2a3a; border-left: 4px solid #f97316; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #8b9cb5; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">Refund Details:</p>
                <p style="color: #e0e6ed; margin: 0; line-height: 1.6;">${data.customMessage}</p>
              </div>
              ` : ''}
              
              <p style="color: #8b9cb5; line-height: 1.8;">
                Your refund has been processed. Please allow 3-5 business days for the funds to appear in your account, depending on your bank.
              </p>
              
              <div style="background-color: #1a2a3a; border-left: 4px solid #00d4ff; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p style="color: #8b9cb5; margin: 0 0 5px 0; font-size: 14px;">Order Number</p>
                <p style="color: #00d4ff; margin: 0; font-size: 20px; font-family: monospace; font-weight: bold;">${data.orderNumber}</p>
              </div>
              
              <p style="color: #8b9cb5; margin-top: 30px; font-size: 14px; text-align: center;">
                Questions about your refund? Contact us at <a href="mailto:support@xtremepeptides.nz" style="color: #00d4ff;">support@xtremepeptides.nz</a>
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

function generateOrderDelayedHTML(data) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Delayed</title>
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
              <div style="background: linear-gradient(135deg, #eab308 0%, #a16207 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 24px;">⏸️ Order Delayed</h2>
              </div>
              <p style="color: #e0e6ed; font-size: 16px; line-height: 1.6;">
                We're reaching out about your order <strong style="color: #00d4ff;">${data.orderNumber}</strong>.
              </p>            
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              ${data.customMessage ? `
              <div style="background-color: #1a2a3a; border-left: 4px solid #eab308; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #8b9cb5; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">Update:</p>
                <p style="color: #e0e6ed; margin: 0; line-height: 1.6;">${data.customMessage}</p>
              </div>
              ` : ''}
              
              <p style="color: #8b9cb5; line-height: 1.8;">
                We apologize for any inconvenience this may cause. We're working to resolve this as quickly as possible and will keep you updated on your order status.
              </p>
              
              <div style="background-color: #1a2a3a; border-left: 4px solid #00d4ff; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p style="color: #8b9cb5; margin: 0 0 5px 0; font-size: 14px;">Order Number</p>
                <p style="color: #00d4ff; margin: 0; font-size: 20px; font-family: monospace; font-weight: bold;">${data.orderNumber}</p>
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

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from "resend";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// --- Email Templates ---

function wrapEmailContent(title: string, content: string) {
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

function generateOrderConfirmationHTML(orderData: any) {
  const items = orderData.items || [];
  const itemsHTML = items.map((item: any) => `
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

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000');

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
  });

  // Admin login
  app.post("/api/admin-login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    try {
      const { default: bcrypt } = await import('bcryptjs');
      const { default: jwt } = await import('jsonwebtoken');
      const supabase = getSupabase();

      const { data: user, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { sub: user.id, username: user.username },
        process.env.ADMIN_JWT_SECRET!,
        { expiresIn: '24h' }
      );
      return res.json({ token });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Send order confirmation email
  app.post("/api/send-email", async (req, res) => {
    const body = req.body;
    let orderData = body.orderData || body;

    if (!orderData.customerEmail || !orderData.orderNumber) {
      return res.status(400).json({ error: "Invalid request payload." });
    }

    try {
      const supabase = getSupabase();
      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      const now = new Date().toISOString();

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

      const htmlContent = generateOrderConfirmationHTML(orderData);
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: `XTREME PEPTIDES NZ <${fromEmail}>`,
        to: orderData.customerEmail,
        subject: `Order Confirmation - ${orderData.orderNumber}`,
        html: htmlContent,
      });

      if (emailError) throw emailError;

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
    } catch (error) {
      console.error("Order Processing Error:", error);
      return res.status(500).json({ error: "Failed to process order confirmation." });
    }
  });

  // Send status update email
  app.post("/api/send-status-email", async (req, res) => {
    const { orderId, orderNumber, recipientEmail, subject, body, type, trackingNumber } = req.body;

    try {
      const supabase = getSupabase();
      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      const htmlContent = wrapEmailContent(subject, body);

      const { data, error } = await resend.emails.send({
        from: `XTREME PEPTIDES NZ <${fromEmail}>`,
        to: recipientEmail,
        subject,
        html: htmlContent,
      });

      if (error) throw error;

      await supabase.from('email_logs').insert({
        order_id: orderId || null,
        order_number: orderNumber || null,
        recipient_email: recipientEmail,
        subject,
        body,
        type: type || 'status_update',
        tracking_number: trackingNumber || null,
        sent_at: new Date().toISOString(),
        status: 'sent',
        resend_id: data?.id || null,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Status email error:", error);
      res.status(500).json({ error: "Failed to send status email." });
    }
  });

  // Contact form
  app.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
      const supabase = getSupabase();
      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      const now = new Date().toISOString();

      await supabase.from('messages').insert({
        customer_name: name || null,
        customer_email: email,
        subject: subject || 'Contact Form Submission',
        message,
        status: 'unread',
        source: 'contact_form',
        created_at: now,
      });

      await resend.emails.send({
        from: `XTREME PEPTIDES NZ <${fromEmail}>`,
        to: "support@xtremepeptides.nz",
        subject: `New Contact Form Message: ${subject || "No Subject"}`,
        html: `<div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2>New Message from ${name || email}</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || "No Subject"}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>`,
      });

      const thankYouContent = `
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Message Received</h2>
        </div>
        <p>Hi ${name || 'there'},<br><br>
        Thank you for reaching out. We have received your message and will get back to you soon.</p>
        <div style="background-color: #1a2a3a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #8b9cb5; margin: 0 0 5px 0; font-size: 14px;">Your Message:</p>
          <p style="color: #e0e6ed; margin: 0; font-style: italic;">"${message}"</p>
        </div>
        <p>Best regards,<br>The XTREME PEPTIDES NZ Team</p>
      `;

      const { data: confirmData } = await resend.emails.send({
        from: `XTREME PEPTIDES NZ <${fromEmail}>`,
        to: email,
        subject: `Thank you for your message - XTREME PEPTIDES NZ`,
        html: wrapEmailContent('Thank you for your message', thankYouContent),
      });

      await supabase.from('email_logs').insert({
        recipient_email: email,
        subject: `Thank you for your message - XTREME PEPTIDES NZ`,
        body: `Contact form confirmation for ${email}`,
        type: 'contact_confirmation',
        sent_at: now,
        status: 'sent',
        resend_id: confirmData?.id || null,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Contact Form Error:", error);
      res.status(500).json({ error: "Failed to process contact form." });
    }
  });

  // Reply to message
  app.post("/api/reply-message", async (req, res) => {
    const { messageId, recipientEmail, subject, body } = req.body;

    try {
      const supabase = getSupabase();
      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      const now = new Date().toISOString();
      const htmlContent = wrapEmailContent(
        `Reply: ${subject}`,
        `<p style="color: #e0e6ed; font-size: 16px; line-height: 1.6;">${body.replace(/\n/g, '<br>')}</p>
         <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #1a3a5c; color: #8b9cb5; font-size: 12px;">
           This is a reply to your message regarding: ${subject}
         </div>`
      );

      const { data, error } = await resend.emails.send({
        from: `XTREME PEPTIDES NZ <${fromEmail}>`,
        to: recipientEmail,
        subject: `Re: ${subject}`,
        html: htmlContent,
      });

      if (error) throw error;

      if (messageId) {
        await supabase
          .from('messages')
          .update({ status: 'replied', reply_body: body, replied_at: now })
          .eq('id', messageId);
      }

      await supabase.from('email_logs').insert({
        recipient_email: recipientEmail,
        subject: `Re: ${subject}`,
        body,
        type: 'admin_reply',
        sent_at: now,
        status: 'sent',
        resend_id: data?.id || null,
      });

      res.json({ success: true, emailId: data?.id });
    } catch (error) {
      console.error("Reply Error:", error);
      res.status(500).json({ error: "Failed to send reply." });
    }
  });

  // Get all messages
  app.get("/api/messages", async (req, res) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Delete message
  app.delete("/api/messages/:id", async (req, res) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('messages').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ error: "Failed to delete message" });
    }
  });

  // Inbound email webhook (Resend)
  app.post("/api/inbound-email", async (req, res) => {
    try {
      const supabase = getSupabase();
      const payload = req.body?.data || req.body;
      const { from, subject, text, html } = payload;

      if (!from) {
        return res.status(400).json({ error: "Missing sender" });
      }

      // Parse "Display Name <email@example.com>" format
      const emailMatch = from.match(/<([^>]+)>/);
      const senderEmail = emailMatch ? emailMatch[1] : from.trim();
      const senderName = emailMatch
        ? from.replace(/<[^>]+>/, "").trim().replace(/^"|"$/g, "")
        : null;

      // Use plain text body; strip quoted reply chains
      const rawText =
        text ||
        (html ? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "");
      const cleanMessage =
        rawText.split(/\n--\s*\n|\nOn .+ wrote:|\n_{3,}|\n-{3,}/)[0].trim() ||
        "(no message body)";

      await supabase.from("messages").insert({
        customer_name: senderName || null,
        customer_email: senderEmail,
        subject: subject || "No Subject",
        message: cleanMessage,
        status: "unread",
        source: "email",
        created_at: new Date().toISOString(),
      });

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Inbound email webhook error:", err);
      return res.status(500).json({ error: "Failed to process inbound email" });
    }
  });

  // Serve the React admin app
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      base: '/admin/'
    });
    app.use('/admin', vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'website', 'admin');
    app.use('/admin', express.static(distPath));
    app.get('/admin*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Serve static files from the /website directory
  const websitePath = path.join(process.cwd(), 'website');
  app.use(express.static(websitePath));
  app.use(express.static(process.cwd()));

  app.get('*', (req, res) => {
    res.sendFile(path.join(websitePath, 'index.html'));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

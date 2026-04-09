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

// Plain text email — no branding, no HTML templates
function plainTextEmail(lines: string[]) {
  return lines.join('\n');
}

function generateOrderConfirmationText(orderData: any) {
  const items = orderData.items || [];
  const total = parseFloat(orderData.total || orderData.orderTotal) || 0;
  const shippingCost = parseFloat(orderData.shippingCost) || 0;
  const subtotal = parseFloat(orderData.subtotal) || (total - shippingCost) || 0;

  const itemLines = items.map((item: any) =>
    `  ${item.name || 'Product'} x${item.quantity} — $${((parseFloat(item.price) || 0) * item.quantity).toFixed(2)}`
  );

  return plainTextEmail([
    `Order Confirmed`,
    ``,
    `Order: ${orderData.orderNumber}`,
    ``,
    `Items:`,
    ...itemLines,
    ``,
    `Subtotal: $${subtotal.toFixed(2)}`,
    `Shipping: $${shippingCost.toFixed(2)}`,
    `Total: $${total.toFixed(2)} NZD`,
    ``,
    `Payment: Bank Transfer`,
    `Account Name: Xtreme Peptides NZ`,
    `Account Number: 02-0144-0217479-002`,
    `Reference: ${orderData.orderNumber}`,
    ``,
    `Your order will ship once payment is confirmed.`,
  ]);
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000');

  app.use(express.json());

  // Block search engine indexing (defense-in-depth alongside meta tags and robots.txt)
  app.use((req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
  });

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

      const textContent = generateOrderConfirmationText(orderData);
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: fromEmail,
        to: orderData.customerEmail,
        subject: `Order Confirmed - ${orderData.orderNumber}`,
        text: textContent,
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

      // Shipped emails: plain text with just tracking number
      const isShipped = type === 'shipped' || (subject && subject.toLowerCase().includes('shipped'));
      const textContent = isShipped && trackingNumber
        ? plainTextEmail([`Your order has shipped.`, ``, `Tracking: ${trackingNumber}`])
        : plainTextEmail([subject || 'Order Update', '', body || '']);

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject: isShipped ? `Shipping Update - ${orderNumber}` : subject,
        text: textContent,
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
        from: fromEmail,
        to: "support@xtremepeptides.nz",
        subject: `Contact: ${subject || "No Subject"}`,
        text: plainTextEmail([
          `From: ${name || 'Unknown'} <${email}>`,
          `Subject: ${subject || 'No Subject'}`,
          ``,
          message,
        ]),
      });

      const { data: confirmData } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `Message Received`,
        text: plainTextEmail([
          `Hi ${name || 'there'},`,
          ``,
          `We received your message and will get back to you soon.`,
        ]),
      });

      await supabase.from('email_logs').insert({
        recipient_email: email,
        subject: `Message Received`,
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

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject: `Re: ${subject}`,
        text: plainTextEmail([body]),
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

  // Hidden products (used by storefront to filter inactive products)
  app.get("/api/hidden-products", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('products')
        .select('name')
        .eq('is_active', false);

      if (error) throw error;

      const hiddenNames = (data || []).map((row: any) => row.name.toLowerCase());
      return res.json({ hiddenNames });
    } catch (err) {
      console.error('Error fetching hidden products:', err);
      return res.json({ hiddenNames: [] });
    }
  });

  // Inbound email webhook health check
  app.get("/api/inbound-email", (req, res) => {
    res.json({ status: "ok", endpoint: "inbound-email", method: "POST required" });
  });

  // Inbound email webhook (Resend)
  app.post("/api/inbound-email", async (req, res) => {
    console.log("[inbound-email] Webhook received:", JSON.stringify(req.body).slice(0, 500));
    try {
      const supabase = getSupabase();
      const payload = req.body?.data || req.body;
      const { from, subject, text, html } = payload;

      if (!from) {
        console.log("[inbound-email] Missing sender field. Full payload:", JSON.stringify(req.body).slice(0, 1000));
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

      console.log(`[inbound-email] Saved message from ${senderEmail}: "${subject || 'No Subject'}"`);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[inbound-email] Webhook error:", err);
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

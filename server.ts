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
  return plainTextEmail([
    `ORDER CONFIRMED - BANK TRANSFER DETAILS WILL BE SENT SOON`,
    ``,
    `Order: ${orderData.orderNumber}`,
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

  // Send status update email — server-side templates only, plain text only
  app.post("/api/send-status-email", async (req, res) => {
    const {
      orderId,
      orderNumber,
      recipientEmail,
      template,        // 'bank_details' | 'shipping' | 'cancelled' | 'refunded'
      trackingNumber,  // required for 'shipping' template
    } = req.body;

    try {
      const supabase = getSupabase();
      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

      let subject = '';
      let textContent = '';

      switch (template) {
        case 'bank_details':
          subject = `Bank Transfer Details - ${orderNumber}`;
          textContent = plainTextEmail([
            `BANK TRANSFER DETAILS`,
            ``,
            `Account Name: xtpnz`,
            `Account Number: 02-0144-0217479-002`,
            `Reference: ${orderNumber}`,
            ``,
            `Please make sure to include the reference when sending payment.`,
            ``,
            `Your order will ship once payment is confirmed.`,
          ]);
          break;
        case 'shipping':
          if (!trackingNumber) {
            return res.status(400).json({ error: "trackingNumber required for shipping template" });
          }
          subject = `Shipping Details - ${orderNumber}`;
          textContent = plainTextEmail([
            `Your order has shipped.`,
            ``,
            `Order: ${orderNumber}`,
            `Tracking: ${trackingNumber}`,
          ]);
          break;
        case 'cancelled':
          subject = `Order Cancelled - ${orderNumber}`;
          textContent = plainTextEmail([
            `Your order has been cancelled.`,
            ``,
            `Order: ${orderNumber}`,
          ]);
          break;
        case 'refunded':
          subject = `Refund Processed - ${orderNumber}`;
          textContent = plainTextEmail([
            `A refund has been processed for your order.`,
            ``,
            `Order: ${orderNumber}`,
          ]);
          break;
        default:
          return res.status(400).json({ error: `Unknown template: ${template}` });
      }

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject,
        text: textContent,
      });

      if (error) throw error;

      await supabase.from('email_logs').insert({
        order_id: orderId || null,
        order_number: orderNumber || null,
        recipient_email: recipientEmail,
        subject,
        body: textContent,
        type: template,
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

  // Known SPA routes — serve the React app
  const spaRoutes = [
    /^\/$/, /^\/shop(\/.*)?$/, /^\/product\//, /^\/cart$/,
    /^\/checkout$/, /^\/about$/, /^\/quality$/, /^\/faq$/,
    /^\/privacy$/, /^\/terms$/,
  ];

  app.get('*', (req, res) => {
    const isSpa = spaRoutes.some((r) => r.test(req.path));
    if (isSpa) {
      return res.sendFile(path.join(websitePath, 'index.html'));
    }
    res.status(404).sendFile(path.join(websitePath, '404.html'));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

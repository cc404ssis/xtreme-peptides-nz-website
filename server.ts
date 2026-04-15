import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from "resend";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { products as productCatalog } from "./website-src/src/data/products";
import { faqSections } from "./website-src/src/data/faq";
import { buyerNames, nzLocations } from "./website-src/src/data/social-proof";

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
            `Account Name: ${process.env.BANK_ACCOUNT_NAME ?? ''}`,
            `Account Number: ${process.env.BANK_ACCOUNT_NUMBER ?? ''}`,
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

  // Product catalog — serves product data server-side so it never ships in client bundles
  async function getHiddenSet(): Promise<Set<string>> {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('products').select('name').eq('is_active', false);
      if (error || !data) return new Set();
      return new Set((data as { name: string }[]).map((r) => r.name.toLowerCase()));
    } catch {
      return new Set();
    }
  }

  app.get("/api/products", async (req, res) => {
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
    const hiddenSet = await getHiddenSet();
    const visible = productCatalog.filter(
      (p) => !hiddenSet.has(`${p.name} ${p.size}`.toLowerCase())
    );
    return res.json(visible);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = productCatalog.find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });

    const hiddenSet = await getHiddenSet();
    if (hiddenSet.has(`${product.name} ${product.size}`.toLowerCase())) {
      return res.status(404).json({ error: "Not found" });
    }

    const related = productCatalog
      .filter((p) => p.id !== product.id && !hiddenSet.has(`${p.name} ${p.size}`.toLowerCase()))
      .slice(0, 4);

    return res.json({ ...product, related });
  });

  // FAQ content
  app.get("/api/faq", (_req, res) => {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.json(faqSections);
  });

  // Social proof data for live sales feed
  app.get("/api/social-proof", (_req, res) => {
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    const productNames = productCatalog.map((p) => `${p.name} ${p.size}`);
    return res.json({ buyerNames, nzLocations, productNames });
  });

  // Shipping methods
  app.get("/api/shipping-methods", (_req, res) => {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.json([
      { value: "express", label: "Express Shipping", desc: "Business day overnight", price: 16 },
      { value: "rural",   label: "Rural Delivery",   desc: "1-2 business days",     price: 22 },
    ]);
  });

  // Payment details — bank account info served server-side only
  app.get("/api/payment-details", (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    return res.json({
      accountName:   process.env.BANK_ACCOUNT_NAME,
      accountNumber: process.env.BANK_ACCOUNT_NUMBER,
    });
  });

  // Featured products — spotlight selection served server-side
  app.get("/api/featured-products", async (req, res) => {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    const featuredIds = [
      "bpc-157-10mg", "retatrutide-10mg", "ghk-cu-50mg",
      "dsip-15mg", "mots-c-40mg", "ss-31-10mg",
    ];
    const hiddenSet = await getHiddenSet();
    const featured = featuredIds
      .map((id) => productCatalog.find((p) => p.id === id))
      .filter((p) => p && !hiddenSet.has(`${p.name} ${p.size}`.toLowerCase()));
    return res.json(featured);
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

  // Site config — brand name and UI copy served server-side
  app.get("/api/site-config", (_req, res) => {
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.json({
      brandName: "Xtreme Peptides",
      tagline: "New Zealand",
      siteTitle: "XTREME PEPTIDES NZ",
      footerDesc: "Premium research compounds. Verified purity, NZ-based supply, transparent testing documentation.",
      copyright: "Xtreme Peptides NZ",
      productBadge: "Research Grade",
      shopSubheading: "Browse our complete catalog of laboratory-grade research compounds.",
    });
  });

  // Terms page content
  app.get("/api/terms-content", (_req, res) => {
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.json([
      { title: "1. Acceptance of Terms", content: "By accessing and using the XTREME PEPTIDES NZ website, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use this website or purchase any products." },
      { title: "2. Age Restriction", content: "You must be 18 years of age or older to use this website and purchase products. By using our website, you confirm that you meet this age requirement." },
      { title: "3. Research Use Only — CRITICAL", content: "ALL PRODUCTS ARE FOR RESEARCH PURPOSES ONLY. By purchasing from XTREME PEPTIDES NZ, you acknowledge and agree that:", list: ["Products are intended exclusively for legitimate laboratory research", "Products are not for human consumption, veterinary use, or therapeutic application", "You are a qualified researcher or represent a research institution", "You will comply with all applicable laws and regulations"] },
      { title: "4. Product Information & Accuracy", content: "We make every effort to display accurate product information. However, we do not warrant that product descriptions, pricing, or other content is complete, reliable, or error-free." },
      { title: "5. Ordering & Payment", content: "All orders are subject to product availability and acceptance. We reserve the right to refuse any order for any reason, including but not limited to suspected misuse, violation of these terms, or shipping restrictions to your location.\n\nWe accept bank transfers only. Payment details are provided upon order confirmation." },
      { title: "6. Shipping & Delivery", content: "All orders are shipped in discrete packaging without external markings indicating contents. Temperature-sensitive products are shipped with appropriate cold-chain packaging." },
      { title: "7. Returns & Refunds", content: "IMPORTANT: Due to the nature of research chemicals, we have specific return policies.\n\nFor damaged or incorrect orders, claims must be raised within 48 hours of delivery via your order record. We will replace damaged products or issue a refund at our discretion." },
      { title: "8. Limitation of Liability", content: "All products are sold for research purposes only. Purchaser assumes full responsibility for compliance with all applicable laws and regulations. XTREME PEPTIDES NZ is not responsible for misuse of products." },
      { title: "9. Indemnification", content: "You agree to indemnify and hold XTREME PEPTIDES NZ harmless from any claims, damages, or expenses arising from your use of our products or violation of these terms." },
      { title: "10. Intellectual Property", content: "All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of XTREME PEPTIDES NZ and is protected by copyright, trademark, and other intellectual property laws." },
      { title: "11. Governing Law", content: "These Terms & Conditions are governed by the laws of New Zealand." },
    ]);
  });

  // About page content
  app.get("/api/about-content", (_req, res) => {
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.json({
      headingPre: "About",
      headingAccent: "Xtreme Peptides",
      subheading: "We supply high-purity research compounds with transparent testing, fast NZ shipping, and discrete packaging.",
      mission: "XTREME PEPTIDES NZ sells laboratory research chemicals intended exclusively for research purposes. All products sold by Xtreme Peptides NZ are strictly for laboratory research purposes. We do not condone or support any use of these compounds outside of controlled research settings.",
      features: [
        { title: "Verified Purity", desc: "All compounds meet or exceed 99.8% purity with independent HPLC testing and batch COAs." },
        { title: "Quality Assurance", desc: "Every batch is tracked, stored cold, and shipped with full documentation." },
        { title: "Fast NZ Shipping", desc: "Express overnight delivery across New Zealand. All orders tracked with discrete packaging." },
        { title: "Research Support", desc: "Dedicated support team ready to help with product questions and documentation requests." },
      ],
      qualityPara1: "Whether you're running cell assays or endocrine studies, consistency matters. Every batch is tracked, stored cold, and shipped with documentation.",
      qualityPara2: "We verify identity and purity by HPLC and provide batch COAs. Products are stored cold and shipped with tracking and documentation.",
    });
  });

  // Quality page content
  app.get("/api/quality-content", (_req, res) => {
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.json({
      features: [
        { title: "HPLC Purity Testing", description: "All compounds meet or exceed 99.897% purity as verified by independent HPLC testing." },
        { title: "Batch Documentation", description: "Every batch we supply comes with a comprehensive Certificate of Analysis. This document provides detailed information about the product's identity, purity, and testing methodology." },
        { title: "Cold-Chain Storage", description: "Products are stored in temperature-controlled environments. Cold-chain integrity is maintained from storage through shipping." },
      ],
      sections: [
        {
          title: "Testing Standards",
          body: "All compounds meet or exceed 99.897% purity as verified by independent HPLC testing.",
          body2: "Each product undergoes rigorous quality control including:",
          list: [
            "High-Performance Liquid Chromatography (HPLC) for purity verification",
            "Mass Spectrometry for identity confirmation",
            "Sterility testing for injectable-grade products",
            "Endotoxin testing where applicable",
          ],
        },
        {
          title: "Certificates of Analysis",
          body: "Every batch we supply comes with a comprehensive Certificate of Analysis. This document provides detailed information about the product's identity, purity, and testing methodology.",
          body2: "COAs include batch numbers, testing dates, analytical methods used, and the results of each test. This documentation is essential for research record-keeping and regulatory compliance.",
          body3: "Batch-specific COAs are included with every shipment.",
        },
        {
          title: "Storage & Shipping",
          body: "Products require refrigeration. Storage guidance is printed on each label.",
          body2: "All orders are shipped in discrete packaging without external markings indicating contents. Temperature-sensitive products are shipped with appropriate cold-chain packaging.",
          body3: "Insulated packaging for compound stability during transit.",
        },
      ],
    });
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, Truck, Info, Shield, Clock, FlaskConical } from "lucide-react";
import { useCart } from "@/lib/cart";
import { supabase } from "@/lib/supabase";

type ShippingMethod = "express" | "rural";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [shipping, setShipping] = useState<ShippingMethod>("express");

  const shippingCost = shipping === "express" ? 16 : 22;
  const grandTotal = total + shippingCost;

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postcode: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);

    try {
      const ref = `XP-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase.from("orders").insert({
        order_ref: ref,
        customer_name: form.name,
        customer_email: form.email,
        shipping_address: `${form.address}, ${form.city} ${form.postcode}`,
        shipping_method: shipping === "express" ? "Express Shipping" : "Rural Delivery",
        shipping_cost: shippingCost,
        items: items.map((i) => ({ id: i.id, name: i.name, size: i.size, qty: i.quantity, price: i.price })),
        subtotal: total,
        total: grandTotal,
        status: "pending",
        notes: form.notes || null,
      });

      if (error) throw error;

      setOrderRef(ref);
      setSuccess(true);
      clearCart();

      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: form.email,
            orderRef: ref,
            customerName: form.name,
            items,
            subtotal: total,
            shippingCost,
            total: grandTotal,
            shippingMethod: shipping === "express" ? "Express Shipping" : "Rural Delivery",
          }),
        });
      } catch {}
    } catch (err) {
      console.error("Order error:", err);
      alert("There was an error placing your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-28 sm:pt-40 text-center px-4">
        <div className="inline-block mb-6 animate-fade-in-up">
          <CheckCircle size={64} style={{ color: "#16a34a" }} />
        </div>
        <h1 className="!text-3xl mb-2">Order <span className="text-accent">Confirmed!</span></h1>
        <p className="font-heading text-sm" style={{ color: "var(--xp-grey-text)" }}>Your order reference is:</p>
        <p className="font-mono text-2xl mt-2 mb-6" style={{ color: "var(--xp-red)" }}>{orderRef}</p>

        <div className="card-dark card-red-top max-w-md mx-auto p-6 text-left">
          <h3 className="!text-base mb-3">Payment Details — Bank Transfer</h3>
          <div className="space-y-2 font-body text-sm">
            <p style={{ color: "var(--xp-grey-text)" }}>Account Name: <span style={{ color: "var(--xp-white)" }}>Xtreme Peptides NZ</span></p>
            <p style={{ color: "var(--xp-grey-text)" }}>Account Number: <span className="font-mono" style={{ color: "var(--xp-white)" }}>02-0144-0217479-002</span></p>
            <p style={{ color: "var(--xp-grey-text)" }}>Reference: <span className="font-mono" style={{ color: "var(--xp-red)" }}>{orderRef}</span></p>
            <p style={{ color: "var(--xp-grey-text)" }}>Amount: <span className="font-display" style={{ color: "var(--xp-white)" }}>${grandTotal.toFixed(2)} NZD</span></p>
          </div>
        </div>

        <div className="card-dark max-w-md mx-auto p-4 mt-4 text-left">
          <p className="font-body text-sm flex items-start gap-2" style={{ color: "var(--xp-grey-text)" }}>
            <Truck size={16} className="mt-0.5 shrink-0" style={{ color: "var(--xp-red)" }} />
            Your order will be shipped once payment has been confirmed. Please allow 1-2 business days for payment verification.
          </p>
        </div>

        <p className="font-mono text-xs mt-6" style={{ color: "var(--xp-grey-text)" }}>A confirmation email has been sent to {form.email || "your email"}.</p>
        <button onClick={() => navigate("/")} className="btn-primary mt-6">Back to Home</button>
      </div>
    );
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-header mb-6 sm:mb-8">
          <div className="section-label">— Complete Order —</div>
          <h1 className="!text-2xl sm:!text-3xl animate-fade-in-up">
            <span className="text-accent">Checkout</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
          {/* Form Fields */}
          <div className="md:col-span-2 space-y-4">
            <div className="card-dark p-6 space-y-4">
              <h3 className="!text-base mb-2">Contact Information</h3>
              <input name="name" value={form.name} onChange={handleChange} placeholder="NAME *" required className="xp-input" />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="EMAIL *" required className="xp-input" />
            </div>

            <div className="card-dark p-6 space-y-4">
              <h3 className="!text-base mb-2">Shipping Address</h3>
              <input name="address" value={form.address} onChange={handleChange} placeholder="ADDRESS *" required className="xp-input" />
              <div className="grid grid-cols-2 gap-4">
                <input name="city" value={form.city} onChange={handleChange} placeholder="CITY *" required className="xp-input" />
                <input name="postcode" value={form.postcode} onChange={handleChange} placeholder="POSTCODE *" required className="xp-input" />
              </div>
            </div>

            <div className="card-dark p-6 space-y-4">
              <h3 className="!text-base mb-2">Shipping Method</h3>
              {[
                { value: "express" as const, label: "Express Shipping", desc: "Business day overnight", price: 16 },
                { value: "rural" as const, label: "Rural Delivery", desc: "1-2 business days", price: 22 },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center justify-between p-4 cursor-pointer transition-colors"
                  style={{
                    border: shipping === opt.value ? "1px solid var(--xp-red)" : "1px solid var(--xp-border)",
                    background: shipping === opt.value ? "var(--xp-red-dim)" : "transparent",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.value}
                      checked={shipping === opt.value}
                      onChange={() => setShipping(opt.value)}
                      className="accent-[var(--xp-red)]"
                    />
                    <div>
                      <p className="font-heading text-sm" style={{ color: "var(--xp-white)" }}>{opt.label}</p>
                      <p className="font-mono text-xs" style={{ color: "var(--xp-grey-text)" }}>{opt.desc}</p>
                    </div>
                  </div>
                  <span className="font-display" style={{ color: "var(--xp-white)" }}>${opt.price.toFixed(2)}</span>
                </label>
              ))}
            </div>

            <div className="card-dark p-6">
              <h3 className="!text-base mb-2">Order Notes</h3>
              <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="OPTIONAL NOTES..." rows={3} className="xp-input" style={{ resize: "none" }} />
            </div>

            {/* Important Information */}
            <div className="card-dark p-6 space-y-5">
              <h3 className="!text-base flex items-center gap-2">
                <Info size={18} style={{ color: "var(--xp-red)" }} /> Important Information
              </h3>
              {[
                { icon: Clock, title: "Payment & Shipping", text: "We accept bank transfer only. Orders are shipped once payment has been confirmed. Please use your order reference as the payment reference to avoid delays." },
                { icon: Shield, title: "Discrete & Secure", text: "All orders are shipped in plain, unmarked packaging with no external branding or indication of contents. Temperature-sensitive products include insulated packaging." },
                { icon: FlaskConical, title: "Research Use Only", text: "All products sold by Xtreme Peptides NZ are intended strictly for laboratory research purposes. By placing an order you confirm you are 18+ years of age and that products will not be used for human consumption." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <item.icon size={16} className="mt-0.5 shrink-0" style={{ color: "var(--xp-red)" }} />
                  <div>
                    <p className="font-heading text-sm" style={{ color: "var(--xp-white)" }}>{item.title}</p>
                    <p className="font-body text-xs mt-1" style={{ color: "var(--xp-grey-text)" }}>{item.text}</p>
                  </div>
                </div>
              ))}
              <p className="font-mono text-xs pt-4" style={{ borderTop: "1px solid var(--xp-border)", color: "var(--xp-grey-text)" }}>
                By placing your order you agree to our <a href="/terms" target="_blank">Terms & Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a>.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="card-dark card-red-top p-6 sticky top-24">
              <h3 className="!text-base mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between font-body text-sm">
                    <span style={{ color: "var(--xp-grey-text)" }}>{item.name} {item.size} x{item.quantity}</span>
                    <span style={{ color: "var(--xp-white)" }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 space-y-2" style={{ borderTop: "1px solid var(--xp-border)" }}>
                <div className="flex justify-between font-body text-sm">
                  <span style={{ color: "var(--xp-grey-text)" }}>Subtotal</span>
                  <span style={{ color: "var(--xp-white)" }}>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span style={{ color: "var(--xp-grey-text)" }}>Shipping</span>
                  <span style={{ color: "var(--xp-white)" }}>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-display text-lg pt-2" style={{ borderTop: "1px solid var(--xp-border)" }}>
                  <span style={{ color: "var(--xp-white)" }}>Total</span>
                  <span style={{ color: "var(--xp-red)" }}>${grandTotal.toFixed(2)} NZD</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-3 mt-6 disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing...</>
                ) : (
                  <><Truck size={18} /> Place Order</>
                )}
              </button>
              <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-center mt-3" style={{ color: "var(--xp-grey-text)" }}>
                Bank transfer payment — details provided after order
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

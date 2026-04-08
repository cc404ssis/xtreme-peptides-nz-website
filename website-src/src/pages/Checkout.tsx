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

      // Send confirmation email
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
          <CheckCircle size={64} className="text-green-500" />
        </div>
        <h1 className="font-display text-3xl font-bold text-silver-200 mb-2">Order Confirmed!</h1>
        <p className="text-silver-400 mb-2">Your order reference is:</p>
        <p className="text-cyan-400 font-mono text-2xl font-bold mb-6">{orderRef}</p>

        <div className="card-dark max-w-md mx-auto p-6 text-left">
          <h3 className="text-silver-200 font-semibold mb-3">Payment Details — Bank Transfer</h3>
          <div className="space-y-2 text-sm">
            <p className="text-silver-400">Account Name: <span className="text-silver-200">Xtreme Peptides NZ</span></p>
            <p className="text-silver-400">Account Number: <span className="text-silver-200 font-mono">02-0144-0217479-002</span></p>
            <p className="text-silver-400">Reference: <span className="text-cyan-400 font-mono">{orderRef}</span></p>
            <p className="text-silver-400">Amount: <span className="text-silver-200 font-bold">${grandTotal.toFixed(2)} NZD</span></p>
          </div>
        </div>

        <div className="card-dark max-w-md mx-auto p-4 mt-4 text-left">
          <p className="text-silver-400 text-sm flex items-start gap-2">
            <Truck size={16} className="text-cyan-400 mt-0.5 shrink-0" />
            Your order will be shipped once payment has been confirmed. Please allow 1-2 business days for payment verification.
          </p>
        </div>

        <p className="text-silver-500 text-sm mt-6">A confirmation email has been sent to {form.email || "your email"}.</p>
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
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-silver-200 mb-6 sm:mb-8 animate-fade-in-up">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
          {/* Form Fields */}
          <div className="md:col-span-2 space-y-4">
            <div className="card-dark p-6 space-y-4">
              <h2 className="text-silver-200 font-semibold text-lg mb-2">Contact Information</h2>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name *" required className="w-full px-4 py-2.5 bg-navy-800/80 border border-cyan-400/20 rounded-lg text-sm text-silver-200 placeholder-silver-500 focus:outline-none focus:border-cyan-400/50" />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email *" required className="w-full px-4 py-2.5 bg-navy-800/80 border border-cyan-400/20 rounded-lg text-sm text-silver-200 placeholder-silver-500 focus:outline-none focus:border-cyan-400/50" />
            </div>

            <div className="card-dark p-6 space-y-4">
              <h2 className="text-silver-200 font-semibold text-lg mb-2">Shipping Address</h2>
              <input name="address" value={form.address} onChange={handleChange} placeholder="Address *" required className="w-full px-4 py-2.5 bg-navy-800/80 border border-cyan-400/20 rounded-lg text-sm text-silver-200 placeholder-silver-500 focus:outline-none focus:border-cyan-400/50" />
              <div className="grid grid-cols-2 gap-4">
                <input name="city" value={form.city} onChange={handleChange} placeholder="City *" required className="w-full px-4 py-2.5 bg-navy-800/80 border border-cyan-400/20 rounded-lg text-sm text-silver-200 placeholder-silver-500 focus:outline-none focus:border-cyan-400/50" />
                <input name="postcode" value={form.postcode} onChange={handleChange} placeholder="Postcode *" required className="w-full px-4 py-2.5 bg-navy-800/80 border border-cyan-400/20 rounded-lg text-sm text-silver-200 placeholder-silver-500 focus:outline-none focus:border-cyan-400/50" />
              </div>
            </div>

            <div className="card-dark p-6 space-y-4">
              <h2 className="text-silver-200 font-semibold text-lg mb-2">Shipping Method</h2>
              {[
                { value: "express" as const, label: "Express Shipping", desc: "Business day overnight", price: 16 },
                { value: "rural" as const, label: "Rural Delivery", desc: "1-2 business days", price: 22 },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                    shipping === opt.value
                      ? "border-cyan-400 bg-cyan-400/5"
                      : "border-cyan-400/20 bg-navy-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.value}
                      checked={shipping === opt.value}
                      onChange={() => setShipping(opt.value)}
                      className="accent-cyan-400"
                    />
                    <div>
                      <p className="text-silver-200 font-medium text-sm">{opt.label}</p>
                      <p className="text-silver-500 text-xs">{opt.desc}</p>
                    </div>
                  </div>
                  <span className="text-silver-200 font-bold">${opt.price.toFixed(2)}</span>
                </label>
              ))}
            </div>

            <div className="card-dark p-6">
              <h2 className="text-silver-200 font-semibold text-lg mb-2">Order Notes</h2>
              <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Optional notes..." rows={3} className="w-full px-4 py-2.5 bg-navy-800/80 border border-cyan-400/20 rounded-lg text-sm text-silver-200 placeholder-silver-500 focus:outline-none focus:border-cyan-400/50 resize-none" />
            </div>

            {/* Important Information */}
            <div className="card-dark p-6 space-y-5">
              <h2 className="text-silver-200 font-semibold text-lg flex items-center gap-2">
                <Info size={18} className="text-cyan-400" /> Important Information
              </h2>

              <div className="flex items-start gap-3">
                <Clock size={16} className="text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-silver-200 text-sm font-medium">Payment & Shipping</p>
                  <p className="text-silver-400 text-xs mt-1">
                    We accept bank transfer only. Orders are shipped once payment has been confirmed. Please use your order reference as the payment reference to avoid delays.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield size={16} className="text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-silver-200 text-sm font-medium">Discrete & Secure</p>
                  <p className="text-silver-400 text-xs mt-1">
                    All orders are shipped in plain, unmarked packaging with no external branding or indication of contents. Temperature-sensitive products include insulated packaging.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FlaskConical size={16} className="text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-silver-200 text-sm font-medium">Research Use Only</p>
                  <p className="text-silver-400 text-xs mt-1">
                    All products sold by Xtreme Peptides NZ are intended strictly for laboratory research purposes. By placing an order you confirm you are 18+ years of age and that products will not be used for human consumption.
                  </p>
                </div>
              </div>

              <p className="text-silver-500 text-xs border-t border-cyan-400/10 pt-4">
                By placing your order you agree to our <a href="/terms" target="_blank" className="text-cyan-400 hover:underline">Terms & Conditions</a> and <a href="/privacy" target="_blank" className="text-cyan-400 hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="card-dark p-6 sticky top-36">
              <h2 className="text-silver-200 font-semibold text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-silver-400">{item.name} {item.size} x{item.quantity}</span>
                    <span className="text-silver-200">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-cyan-400/10 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-silver-400">Subtotal</span>
                  <span className="text-silver-200">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-silver-400">Shipping</span>
                  <span className="text-silver-200">${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-cyan-400/10">
                  <span className="text-silver-200">Total</span>
                  <span className="text-cyan-400">${grandTotal.toFixed(2)} NZD</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Truck size={18} /> Place Order
                  </>
                )}
              </button>
              <p className="text-silver-500 text-xs text-center mt-3">
                Bank transfer payment — details provided after order
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

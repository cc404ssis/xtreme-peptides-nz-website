import { useState } from "react";
import { Mail, Send, Loader2 } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", ...form }),
      });
      setSent(true);
    } catch {
      alert("Failed to send message. Please try emailing us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-silver-200 mb-3 sm:mb-4">Contact Us</h1>
          <p className="text-silver-400 text-sm sm:text-base">
            Have questions about our products or services? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <div className="card-dark p-5">
              <div className="flex items-center gap-3 mb-2">
                <Mail size={18} className="text-cyan-400" />
                <h3 className="text-silver-200 font-medium">Email</h3>
              </div>
              <a href="mailto:support@xtremepeptides.nz" className="text-cyan-400 text-sm hover:underline">
                support@xtremepeptides.nz
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            {sent ? (
              <div className="card-dark p-8 text-center">
                <Send size={32} className="text-cyan-400 mx-auto mb-4" />
                <h2 className="text-silver-200 font-bold text-xl mb-2">Message Sent!</h2>
                <p className="text-silver-400">We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card-dark p-6 space-y-4">
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your Name *" required className="w-full px-4 py-2.5 bg-navy-800/80 border border-cyan-400/20 rounded-lg text-sm text-silver-200 placeholder-silver-500 focus:outline-none focus:border-cyan-400/50" />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Your Email *" required className="w-full px-4 py-2.5 bg-navy-800/80 border border-cyan-400/20 rounded-lg text-sm text-silver-200 placeholder-silver-500 focus:outline-none focus:border-cyan-400/50" />
                <input name="subject" value={form.subject} onChange={handleChange} placeholder="Subject" className="w-full px-4 py-2.5 bg-navy-800/80 border border-cyan-400/20 rounded-lg text-sm text-silver-200 placeholder-silver-500 focus:outline-none focus:border-cyan-400/50" />
                <textarea name="message" value={form.message} onChange={handleChange} placeholder="Your Message *" required rows={5} className="w-full px-4 py-2.5 bg-navy-800/80 border border-cyan-400/20 rounded-lg text-sm text-silver-200 placeholder-silver-500 focus:outline-none focus:border-cyan-400/50 resize-none" />
                <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

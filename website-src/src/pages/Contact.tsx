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
        <div className="section-header mb-8 sm:mb-12 animate-fade-in-up">
          <div className="section-label">— Get In Touch —</div>
          <h1 className="!text-2xl sm:!text-3xl md:!text-4xl">
            Contact <span className="text-accent">Us</span>
          </h1>
          <div className="section-rule" />
          <p className="font-heading font-300 text-sm sm:text-base max-w-xl mx-auto mt-4" style={{ color: "var(--xp-grey-text)" }}>
            Have questions about our products or services? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <div className="card-dark p-5">
              <div className="flex items-center gap-3 mb-3">
                <Mail size={18} style={{ color: "var(--xp-red)" }} />
                <h3 className="!text-sm">Email</h3>
              </div>
              <a href="mailto:support@xtremepeptides.nz" className="font-mono text-sm">
                support@xtremepeptides.nz
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            {sent ? (
              <div className="card-dark p-8 text-center">
                <Send size={32} style={{ color: "var(--xp-red)" }} className="mx-auto mb-4" />
                <h2 className="!text-xl mb-2">Message Sent!</h2>
                <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card-dark p-6 space-y-4">
                <input name="name" value={form.name} onChange={handleChange} placeholder="YOUR NAME *" required className="xp-input" />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="YOUR EMAIL *" required className="xp-input" />
                <input name="subject" value={form.subject} onChange={handleChange} placeholder="SUBJECT" className="xp-input" />
                <textarea name="message" value={form.message} onChange={handleChange} placeholder="YOUR MESSAGE *" required rows={5} className="xp-input" style={{ resize: "none" }} />
                <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
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

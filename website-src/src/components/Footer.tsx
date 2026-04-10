import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative" style={{ background: "var(--xp-black)", borderTop: "1px solid var(--xp-red)", zIndex: 3 }}>
      {/* Corner brackets */}
      <div className="absolute top-6 left-6 w-8 h-8" style={{ borderTop: "1px solid rgba(204,0,0,0.4)", borderLeft: "1px solid rgba(204,0,0,0.4)" }} />
      <div className="absolute top-6 right-6 w-8 h-8" style={{ borderTop: "1px solid rgba(204,0,0,0.4)", borderRight: "1px solid rgba(204,0,0,0.4)" }} />
      <div className="absolute bottom-6 left-6 w-8 h-8" style={{ borderBottom: "1px solid rgba(204,0,0,0.4)", borderLeft: "1px solid rgba(204,0,0,0.4)" }} />
      <div className="absolute bottom-6 right-6 w-8 h-8" style={{ borderBottom: "1px solid rgba(204,0,0,0.4)", borderRight: "1px solid rgba(204,0,0,0.4)" }} />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Brand */}
          <div className="text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-2.5 justify-center md:justify-start mb-5" style={{ textDecoration: "none" }}>
              <div className="w-[2px] h-7" style={{ background: "var(--xp-red)" }} />
              <div>
                <span className="font-display text-xl tracking-[0.22em] text-[var(--xp-white)] leading-none block">
                  Xtreme Peptides
                </span>
                <span className="font-mono text-[10px] tracking-[0.55em] uppercase block" style={{ color: "rgba(204,0,0,0.7)" }}>
                  New Zealand
                </span>
              </div>
              <div className="w-[2px] h-7" style={{ background: "var(--xp-red)" }} />
            </Link>
            <p className="font-body text-base" style={{ color: "var(--xp-grey-text)" }}>
              Premium research peptides and laboratory compounds. Verified purity, NZ-based supply, transparent testing documentation.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="font-heading text-base tracking-[0.15em] uppercase mb-5" style={{ color: "var(--xp-white)" }}>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/shop", label: "Shop All" },
                { to: "/about", label: "About Us" },
                { to: "/quality", label: "Quality" },
                { to: "/faq", label: "FAQ" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="font-heading text-base tracking-[0.06em] transition-colors"
                    style={{ color: "var(--xp-grey-text)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--xp-red)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--xp-grey-text)")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8" style={{ borderTop: "1px solid var(--xp-border)" }}>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-center mb-3" style={{ color: "rgba(255,255,255,0.18)" }}>
            <strong style={{ color: "rgba(255,255,255,0.3)" }}>18+ Only.</strong> All products sold for laboratory research use. Not for human consumption.
          </p>
          <div className="flex items-center justify-center gap-4 font-mono text-xs tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.18)" }}>
            <Link to="/privacy" className="transition-colors hover:!text-[var(--xp-red)]">Privacy Policy</Link>
            <span>|</span>
            <Link to="/terms" className="transition-colors hover:!text-[var(--xp-red)]">Terms & Conditions</Link>
          </div>
          <p className="font-mono text-xs tracking-[0.15em] uppercase text-center mt-4" style={{ color: "rgba(255,255,255,0.12)" }}>
            © {new Date().getFullYear()} Xtreme Peptides NZ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

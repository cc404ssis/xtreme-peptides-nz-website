import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-navy-900/50 border-t border-cyan-400/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="text-center md:text-left">
            <img src="/logo.png" alt="Xtreme Peptides NZ" className="h-28 sm:h-36 mb-4 sm:mb-5 mx-auto md:mx-0" />
            <p className="text-silver-500 text-sm leading-relaxed">
              Premium research peptides and laboratory compounds. Verified purity, NZ-based supply, transparent testing documentation.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="text-lg sm:text-xl font-display font-bold text-silver-200 mb-4 sm:mb-5">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { to: "/shop", label: "Shop All" },
                { to: "/about", label: "About Us" },
                { to: "/quality", label: "Quality" },
                { to: "/faq", label: "FAQ" },
                { to: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-silver-400 text-sm hover:text-cyan-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left">
            <h4 className="text-lg sm:text-xl font-display font-bold text-silver-200 mb-4 sm:mb-5">Contact</h4>
            <ul className="space-y-2 sm:space-y-3 text-silver-400 text-sm">
              <li>
                <a href="mailto:support@xtremepeptides.nz" className="hover:text-cyan-400 transition-colors">
                  support@xtremepeptides.nz
                </a>
              </li>
              <li>New Zealand</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cyan-400/10 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
          <p className="text-silver-500 text-xs mb-2">
            For research purposes only. Not for human consumption. 18+ only.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-silver-500">
            <Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link>
            <span>|</span>
            <Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms & Conditions</Link>
          </div>
          <p className="text-silver-500 text-xs mt-4">
            © {new Date().getFullYear()} Xtreme Peptides NZ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

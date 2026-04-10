import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/about", label: "About" },
    { to: "/quality", label: "Quality" },
    { to: "/faq", label: "FAQ" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled || mobileOpen
            ? "border-b-[var(--xp-red)]"
            : "border-b-transparent"
        }`}
        style={{ background: scrolled || mobileOpen ? "rgba(0,0,0,0.95)" : "transparent", backdropFilter: scrolled ? "blur(8px)" : "none" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo wordmark */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
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
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-heading text-base tracking-[0.08em] uppercase transition-colors"
                  style={{
                    color: location.pathname === link.to ? "var(--xp-red)" : "rgba(255,255,255,0.6)",
                    borderBottom: location.pathname === link.to ? "1px solid var(--xp-red)" : "1px solid transparent",
                    paddingBottom: "2px",
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== link.to) e.currentTarget.style.color = "var(--xp-white)";
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== link.to) e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Search */}
              <div className="relative flex items-center">
                {searchOpen && (
                  <form onSubmit={handleSearch} className="absolute right-8 top-1/2 -translate-y-1/2">
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="xp-input w-40 sm:w-48 md:w-64 !py-1.5 !px-3 text-sm"
                      onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                    />
                  </form>
                )}
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 transition-colors"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--xp-red)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                >
                  <Search size={20} />
                </button>
              </div>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 transition-colors"
                style={{ color: "rgba(255,255,255,0.5)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--xp-red)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              >
                <ShoppingCart size={20} />
                {count > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-xs w-5 h-5 flex items-center justify-center font-display"
                    style={{ background: "var(--xp-red)", color: "var(--xp-white)" }}
                  >
                    {count}
                  </span>
                )}
              </Link>

              {/* Mobile Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 transition-colors"
                style={{ color: "rgba(255,255,255,0.5)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--xp-red)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu — Full screen overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-2"
          style={{ background: "rgba(0,0,0,0.97)" }}
        >
          {navLinks.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              className="font-display text-3xl tracking-[0.2em] uppercase py-3 transition-colors animate-fade-in-up"
              style={{
                color: location.pathname === link.to ? "var(--xp-red)" : "rgba(255,255,255,0.5)",
                animationDelay: `${i * 0.06}s`,
              }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

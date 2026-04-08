import { Link } from "react-router-dom";
import { ArrowRight, FlaskConical } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(11, 27, 45, 0.85), rgba(11, 27, 45, 0.95)), url('/hero_lab_bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-32 w-full">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="animate-fade-in-up text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 mb-4 sm:mb-6">
              <FlaskConical size={14} className="text-cyan-400" />
              <span className="text-xs font-mono text-cyan-400 tracking-wider">Research Grade</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-silver-200 leading-tight mb-3 sm:mb-4">
              NZ's Trusted{" "}
              <span className="text-gradient">Research Supplier</span>
            </h1>
            <p className="text-silver-400 text-base sm:text-lg mb-6 sm:mb-8">
              Verified purity · NZ-based · Discrete delivery
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-start justify-center">
              <Link to="/shop" className="btn-primary inline-flex items-center justify-center gap-2 text-sm sm:text-base">
                Browse All Products
                <ArrowRight size={16} />
              </Link>
              <Link to="/product/bpc-157-10mg" className="btn-outline inline-flex items-center justify-center gap-2 text-sm sm:text-base">
                View Product
              </Link>
            </div>
          </div>

          {/* Right - Featured Product Card (desktop only) */}
          <div className="hidden md:block animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <Link to="/product/bpc-157-10mg" className="block card-dark card-glow p-6 max-w-sm ml-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-cyan-400">Featured</span>
                <span className="text-xs bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded font-mono">
                  {">"}99.8% Purity
                </span>
              </div>
              <div className="aspect-[4/3] bg-navy-800 rounded-lg overflow-hidden mb-4">
                <img src="/product_bpc157_10mg.png" alt="BPC-157" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-display font-bold text-silver-200 text-lg">BPC-157</h3>
              <p className="text-silver-500 text-xs mt-1">10mg</p>
              <p className="text-silver-400 text-sm mt-2">
                Stable, high-purity sequence for tissue repair studies.
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-cyan-400 font-bold text-xl">$99.00 NZD</span>
                <span className="text-cyan-400 text-sm font-medium flex items-center gap-1">
                  View Product <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-32 w-full">
        <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
          {/* Label */}
          <div className="xp-label mb-6" style={{ animationDelay: "0.1s" }}>
            Research Grade · New Zealand
          </div>

          {/* Headline */}
          <h1 className="mb-6">
            NZ's Trusted{" "}
            <span className="text-accent">Research</span>{" "}
            Supplier
          </h1>

          {/* Dot divider */}
          <div className="dot-divider">
            <div className="dot-line" />
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
            <div className="dot-line" />
          </div>

          {/* Subheadline */}
          <p className="font-heading font-300 text-base sm:text-lg tracking-[0.06em] mb-10 max-w-lg mx-auto" style={{ color: "var(--xp-grey-text)" }}>
            Verified purity · NZ-based · Discrete delivery
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/shop" className="btn-primary">
              Browse All Products
              <ArrowRight size={16} />
            </Link>
            <Link to="/about" className="btn-outline">
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Section rule */}
      <div className="section-rule absolute bottom-12 left-1/2 -translate-x-1/2 w-48" />
    </section>
  );
}

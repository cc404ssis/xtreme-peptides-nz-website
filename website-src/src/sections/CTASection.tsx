import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 sm:py-32">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up">
          <div className="section-label mb-6">— Get Started —</div>
          <h2 className="mb-4">
            Ready to Start Your <span className="text-accent">Research?</span>
          </h2>
          <div className="dot-divider mb-6">
            <div className="dot-line" />
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
            <div className="dot-line" />
          </div>
          <p className="font-heading font-300 text-base sm:text-lg mb-10 max-w-xl mx-auto" style={{ color: "var(--xp-grey-text)" }}>
            Browse our research compounds and add items to your cart.
          </p>
          <Link to="/shop" className="btn-primary text-base sm:text-lg px-8 py-4">
            Shop All Products
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

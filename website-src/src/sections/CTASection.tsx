import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section
      className="py-16 sm:py-24"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(11, 27, 45, 0.9), rgba(11, 27, 45, 0.85)), url('/cta_lab_bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-silver-200 mb-3 sm:mb-4">
            Ready to Start Your Research?
          </h2>
          <p className="text-silver-400 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
            Browse our research compounds and add items to your cart.
          </p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
            Shop All Products
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

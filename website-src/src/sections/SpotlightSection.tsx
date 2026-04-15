import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";

export default function SpotlightSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/featured-products")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Product[]) => setFeatured(data))
      .catch(() => {});
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  if (featured.length === 0) return null;

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-header">
          <div className="section-label">— New Arrivals —</div>
          <h2>Product <span className="text-accent">Spotlight</span></h2>
          <div className="section-rule" />
          <div className="dot-divider">
            <div className="dot-line" />
            <div className="dot" /><div className="dot" /><div className="dot" />
            <div className="dot-line" />
          </div>
        </div>

        <div className="hidden md:flex justify-end gap-2 mb-6">
          <button
            onClick={() => scroll("left")}
            className="p-2 transition-colors"
            style={{ border: "1px solid var(--xp-border-red)", color: "var(--xp-grey-text)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--xp-red)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--xp-grey-text)")}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 transition-colors"
            style={{ border: "1px solid var(--xp-border-red)", color: "var(--xp-grey-text)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--xp-red)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--xp-grey-text)")}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory stagger-children"
          style={{ scrollbarWidth: "none" }}
        >
          {featured.map((product) => (
            <div key={product.id} className="w-[160px] sm:w-[280px] md:w-[300px] lg:w-[320px] shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

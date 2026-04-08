import { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useVisibleProducts } from "@/lib/useVisibleProducts";
import ProductCard from "@/components/ProductCard";

const featuredIds = [
  "bpc-157-10mg",
  "retatrutide-10mg",
  "ghk-cu-50mg",
  "dsip-15mg",
  "mots-c-40mg",
  "ss-31-10mg",
];

export default function SpotlightSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { products } = useVisibleProducts();

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 280;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const featuredProducts = featuredIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  if (featuredProducts.length === 0) return null;

  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                <Sparkles size={12} className="text-red-500" />
                <span className="text-xs font-mono text-red-500">New Arrivals</span>
              </div>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-silver-200">Spotlight</h2>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-lg bg-navy-800 border border-cyan-400/20 text-silver-400 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-lg bg-navy-800 border border-cyan-400/20 text-silver-400 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory stagger-children"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="w-[160px] sm:w-[280px] md:w-[300px] lg:w-[320px] shrink-0 snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useVisibleProducts } from "@/lib/useVisibleProducts";
import ProductCard from "@/components/ProductCard";

export default function Shop() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { products } = useVisibleProducts();

  const [search, setSearch] = useState(initialQuery);

  const filtered = useMemo(() => {
    if (!search) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, products]);

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="section-header mb-8 sm:mb-12 animate-fade-in-up">
          <div className="section-label">— Product Range —</div>
          <h2>
            Shop <span className="text-accent">All</span> Products
          </h2>
          <div className="section-rule" />
          <p className="font-heading font-300 text-sm sm:text-base max-w-xl mx-auto mt-3" style={{ color: "var(--xp-grey-text)" }}>
            Browse our complete catalog of laboratory-grade research compounds.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 sm:mb-10">
          <div className="relative max-w-md mx-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--xp-grey-text)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH PRODUCTS..."
              className="xp-input !pl-10"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 stagger-children">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-heading text-sm" style={{ color: "var(--xp-grey-text)" }}>No products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

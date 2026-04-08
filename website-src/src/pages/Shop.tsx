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
        {/* Header */}
        <div className="mb-6 sm:mb-10 animate-fade-in-up">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-silver-200 mb-2">
            Shop All Products
          </h1>
          <p className="text-silver-400 text-sm sm:text-base">
            Browse our complete catalog of laboratory-grade research peptides and compounds.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-navy-800/80 border border-cyan-400/20 rounded-lg text-sm text-silver-200 placeholder-silver-500 focus:outline-none focus:border-cyan-400/50"
            />
          </div>
        </div>

        {/* Product Grid — 2 cols on mobile, scales up */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 stagger-children">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-silver-400">No products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

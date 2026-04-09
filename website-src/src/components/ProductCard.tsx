import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import type { Product } from "@/data/products";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      size: product.size,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <div className="product-card-lift">
      <Link
        to={`/product/${product.id}`}
        className="block card-dark card-glow card-red-top overflow-hidden group"
        style={{ textDecoration: "none" }}
      >
        <div className="aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: "var(--xp-dark)" }}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-3 sm:p-4">
          {/* Category badge */}
          <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: "var(--xp-red)" }}>
            Research Peptide
          </div>
          {/* Product name */}
          <h3 className="font-display text-base sm:text-lg tracking-[0.04em] leading-tight mb-1" style={{ color: "var(--xp-white)" }}>
            {product.name}
          </h3>
          <span className="font-heading text-xs" style={{ color: "var(--xp-grey-text)" }}>{product.size}</span>

          <div className="flex items-center justify-between mt-3">
            <span className="font-display text-lg sm:text-xl" style={{ color: "var(--xp-white)" }}>
              $<span className="text-accent">{product.price.toFixed(2)}</span>
            </span>
            <button
              onClick={handleAdd}
              className="p-2 transition-all"
              style={{ background: "var(--xp-red-dim)", color: "var(--xp-red)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--xp-red)"; e.currentTarget.style.color = "var(--xp-white)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--xp-red-dim)"; e.currentTarget.style.color = "var(--xp-red)"; }}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

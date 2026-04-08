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
      <Link to={`/product/${product.id}`} className="block card-dark card-glow overflow-hidden group">
        <div className="aspect-[4/3] bg-navy-800 overflow-hidden flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-silver-200 font-display font-semibold text-sm sm:text-base leading-tight">
            {product.name} <span className="text-silver-400 font-normal text-xs sm:text-sm">{product.size}</span>
          </h3>
          <div className="flex items-center justify-between mt-2 sm:mt-3">
            <span className="text-cyan-400 font-bold text-sm sm:text-lg">${product.price.toFixed(2)}</span>
            <button
              onClick={handleAdd}
              className="p-1.5 sm:p-2 rounded-lg bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

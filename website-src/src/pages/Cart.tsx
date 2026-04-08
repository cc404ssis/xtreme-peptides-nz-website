import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 sm:pt-40 text-center px-4">
        <ShoppingBag size={48} className="text-silver-500 mx-auto mb-4" />
        <h1 className="font-display text-xl sm:text-2xl font-bold text-silver-200 mb-2">Your Cart is Empty</h1>
        <p className="text-silver-400 mb-6 text-sm sm:text-base">Add items to your cart before proceeding to checkout.</p>
        <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
          Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-silver-200 mb-6 sm:mb-8 animate-fade-in-up">
          Your Cart
        </h1>

        <div className="space-y-3 sm:space-y-4 stagger-children">
          {items.map((item) => (
            <div
              key={item.id}
              className="card-dark p-3 sm:p-4"
            >
              {/* Mobile: stacked layout / Desktop: row layout */}
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-navy-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-silver-200 font-medium text-sm sm:text-base">{item.name} <span className="text-silver-400 text-xs sm:text-sm">{item.size}</span></h3>
                  <p className="text-cyan-400 font-bold text-sm sm:text-base">${item.price.toFixed(2)}</p>

                  {/* Mobile: controls row below name */}
                  <div className="flex items-center justify-between mt-2 sm:hidden">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 rounded bg-navy-800 text-silver-400 hover:text-cyan-400 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-silver-200 font-mono w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 rounded bg-navy-800 text-silver-400 hover:text-cyan-400 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-silver-200 font-bold text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-silver-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop: inline controls */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 rounded bg-navy-800 text-silver-400 hover:text-cyan-400 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-silver-200 font-mono w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 rounded bg-navy-800 text-silver-400 hover:text-cyan-400 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="hidden sm:block text-silver-200 font-bold w-24 text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="hidden sm:block p-2 text-silver-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card-dark p-5 sm:p-6 mt-6 sm:mt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-silver-400">Subtotal</span>
            <span className="text-silver-200 font-bold text-lg sm:text-xl">${total.toFixed(2)} NZD</span>
          </div>
          <p className="text-silver-500 text-xs sm:text-sm mb-5 sm:mb-6">Shipping calculated at checkout</p>
          <Link
            to="/checkout"
            className="btn-primary w-full py-3 text-center block text-base sm:text-lg font-bold"
          >
            Checkout
          </Link>
          <Link to="/shop" className="block text-center text-silver-400 text-sm mt-4 hover:text-cyan-400 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 sm:pt-40 text-center px-4">
        <ShoppingBag size={48} className="mx-auto mb-4" style={{ color: "var(--xp-grey-text)" }} />
        <h1 className="!text-xl sm:!text-2xl mb-2">Your Cart is <span className="text-accent">Empty</span></h1>
        <p className="font-heading text-sm mb-6" style={{ color: "var(--xp-grey-text)" }}>Add items to your cart before proceeding to checkout.</p>
        <Link to="/shop" className="btn-primary">
          Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-header mb-6 sm:mb-8">
          <div className="section-label">— Checkout —</div>
          <h1 className="!text-2xl sm:!text-3xl animate-fade-in-up">
            Your <span className="text-accent">Cart</span>
          </h1>
        </div>

        <div className="space-y-3 sm:space-y-4 stagger-children">
          {items.map((item) => (
            <div key={item.id} className="card-dark p-3 sm:p-4">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 overflow-hidden" style={{ background: "var(--xp-dark)" }}>
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm sm:text-base tracking-[0.04em]" style={{ color: "var(--xp-white)" }}>
                    {item.name} <span className="font-heading text-xs" style={{ color: "var(--xp-grey-text)" }}>{item.size}</span>
                  </h3>
                  <p className="font-display text-sm sm:text-base" style={{ color: "var(--xp-red)" }}>${item.price.toFixed(2)}</p>

                  {/* Mobile controls */}
                  <div className="flex items-center justify-between mt-2 sm:hidden">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5" style={{ background: "var(--xp-dark)", color: "var(--xp-grey-text)", border: "none", cursor: "pointer" }}>
                        <Minus size={12} />
                      </button>
                      <span className="font-mono w-6 text-center text-sm" style={{ color: "var(--xp-white)" }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5" style={{ background: "var(--xp-dark)", color: "var(--xp-grey-text)", border: "none", cursor: "pointer" }}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-display text-sm" style={{ color: "var(--xp-white)" }}>${(item.price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => removeItem(item.id)} className="p-1.5 transition-colors" style={{ color: "var(--xp-grey-text)", background: "none", border: "none", cursor: "pointer" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop controls */}
                <div className="hidden sm:flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5" style={{ background: "var(--xp-dark)", color: "var(--xp-grey-text)", border: "none", cursor: "pointer" }}>
                    <Minus size={14} />
                  </button>
                  <span className="font-mono w-8 text-center" style={{ color: "var(--xp-white)" }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5" style={{ background: "var(--xp-dark)", color: "var(--xp-grey-text)", border: "none", cursor: "pointer" }}>
                    <Plus size={14} />
                  </button>
                </div>
                <p className="hidden sm:block font-display w-24 text-right" style={{ color: "var(--xp-white)" }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <button onClick={() => removeItem(item.id)} className="hidden sm:block p-2 transition-colors" style={{ color: "var(--xp-grey-text)", background: "none", border: "none", cursor: "pointer" }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card-dark card-red-top p-5 sm:p-6 mt-6 sm:mt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="font-heading text-sm uppercase tracking-[0.08em]" style={{ color: "var(--xp-grey-text)" }}>Subtotal</span>
            <span className="font-display text-lg sm:text-xl" style={{ color: "var(--xp-white)" }}>${total.toFixed(2)} NZD</span>
          </div>
          <p className="font-mono text-xs mb-5 sm:mb-6" style={{ color: "var(--xp-grey-text)" }}>Shipping calculated at checkout</p>
          <Link to="/checkout" className="btn-primary w-full text-center block text-base sm:text-lg">
            Checkout
          </Link>
          <Link to="/shop" className="block text-center font-heading text-sm mt-4 transition-colors" style={{ color: "var(--xp-grey-text)" }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

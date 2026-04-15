import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft, FlaskConical, Thermometer, FileText, Package } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/lib/cart";
import ProductCard from "@/components/ProductCard";

type Tab = "description" | "storage" | "documentation";
type ProductWithRelated = Product & { related: Product[] };

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ProductWithRelated | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState<Tab>("description");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ProductWithRelated | null) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return null;

  if (!data) {
    return (
      <div className="min-h-screen pt-32 sm:pt-40 text-center px-4">
        <p className="font-heading text-lg" style={{ color: "var(--xp-grey-text)" }}>Product not found.</p>
        <Link to="/shop" className="text-accent mt-4 inline-block font-heading">Back to Shop</Link>
      </div>
    );
  }

  const product = data;
  const related = data.related ?? [];

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, size: product.size, price: product.price, image: product.image });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const tabs: { key: Tab; label: string; icon: typeof FlaskConical }[] = [
    { key: "description", label: "Description", icon: FlaskConical },
    { key: "storage", label: "Storage", icon: Thermometer },
    { key: "documentation", label: "Docs", icon: FileText },
  ];

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 font-heading text-sm tracking-[0.06em] mb-6 sm:mb-8 transition-colors"
          style={{ color: "var(--xp-grey-text)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--xp-red)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--xp-grey-text)")}
        >
          <ArrowLeft size={16} /> Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          {/* Image */}
          <div className="card-dark card-red-top overflow-hidden aspect-square sm:aspect-[4/3] animate-fade-in-up flex items-center justify-center p-6 sm:p-8" style={{ background: "var(--xp-dark)" }}>
            <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
          </div>

          {/* Info */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="xp-badge mb-4">Research Peptide</div>
            <h1 className="!text-3xl sm:!text-4xl mb-1">{product.name}</h1>
            <span className="font-heading text-base" style={{ color: "var(--xp-grey-text)" }}>{product.size}</span>
            <p className="font-mono text-xs mt-1" style={{ color: "var(--xp-grey-text)" }}>{product.catalog}</p>

            <div className="dot-divider my-4" />

            <p className="font-display text-3xl sm:text-4xl mt-3">
              $<span className="text-accent">{product.price.toFixed(2)}</span>
              <span className="font-heading text-sm ml-2" style={{ color: "var(--xp-grey-text)" }}>NZD</span>
            </p>
            <p className="font-body text-sm mt-4" style={{ color: "var(--xp-grey-text)" }}>{product.description}</p>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-6">
              {[
                { label: "CAS Number", value: product.casNumber },
                { label: "Formula", value: product.molecularFormula },
                { label: "Purity", value: product.purity },
                { label: "Form", value: product.form },
              ].map((spec) => (
                <div key={spec.label} className="p-3" style={{ background: "var(--xp-black)", border: "1px solid var(--xp-border)" }}>
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--xp-grey-text)" }}>{spec.label}</p>
                  <p className="font-mono text-xs mt-1 break-all" style={{ color: "var(--xp-white)" }}>{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAdd}
              className="w-full mt-6 sm:mt-8 py-4 font-display text-lg tracking-[0.18em] uppercase flex items-center justify-center gap-2 transition-all"
              style={{
                background: added ? "#16a34a" : "var(--xp-red)",
                color: "var(--xp-white)",
                border: "none",
                cursor: "pointer",
              }}
            >
              <ShoppingCart size={20} />
              {added ? "Added!" : "Add to Cart"}
            </button>

            {/* Shipping info */}
            <div className="flex items-center gap-4 mt-4 font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: "var(--xp-grey-text)" }}>
              <span className="flex items-center gap-1"><Package size={12} /> Discrete packaging</span>
              <span className="flex items-center gap-1"><Thermometer size={12} /> Insulated shipping</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 sm:mt-16">
          <div className="flex gap-0 sm:gap-1 mb-4 sm:mb-6 overflow-x-auto" style={{ borderBottom: "1px solid var(--xp-border)", scrollbarWidth: "none" }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-3 font-heading text-xs sm:text-sm tracking-[0.08em] uppercase whitespace-nowrap transition-colors"
                style={{
                  borderBottom: activeTab === tab.key ? "2px solid var(--xp-red)" : "2px solid transparent",
                  color: activeTab === tab.key ? "var(--xp-red)" : "var(--xp-grey-text)",
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  borderBottomWidth: "2px",
                  borderBottomStyle: "solid",
                  borderBottomColor: activeTab === tab.key ? "var(--xp-red)" : "transparent",
                }}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
          <div className="card-dark p-5 sm:p-8">
            {activeTab === "description" && (
              <div className="space-y-3 sm:space-y-4">
                <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>{product.description}</p>
                <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}><strong style={{ color: "var(--xp-white)" }}>Molecular Formula:</strong> <span className="font-mono break-all">{product.molecularFormula}</span></p>
                <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}><strong style={{ color: "var(--xp-white)" }}>CAS Number:</strong> <span className="font-mono">{product.casNumber}</span></p>
                <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}><strong style={{ color: "var(--xp-white)" }}>Purity:</strong> <span className="font-mono">{product.purity}</span></p>
              </div>
            )}
            {activeTab === "storage" && (
              <div className="space-y-3 sm:space-y-4">
                <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}><strong style={{ color: "var(--xp-white)" }}>Storage Conditions:</strong> {product.storage}</p>
                <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}><strong style={{ color: "var(--xp-white)" }}>Shelf Life:</strong> {product.shelfLife}</p>
                <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}><strong style={{ color: "var(--xp-white)" }}>Form:</strong> {product.form}</p>
              </div>
            )}
            {activeTab === "documentation" && (
              <div className="space-y-3 sm:space-y-4">
                <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>COAs include batch numbers, testing dates, analytical methods used, and the results of each test. This documentation is essential for research record-keeping and regulatory compliance.</p>
                <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>Batch-specific documentation is provided with each shipment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12 sm:mt-20">
            <div className="section-header">
              <div className="section-label">— More Products —</div>
              <h2>Related <span className="text-accent">Products</span></h2>
              <div className="section-rule" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

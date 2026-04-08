import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft, FlaskConical, Thermometer, FileText, Package } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/lib/cart";
import { useProductVisible } from "@/lib/useVisibleProducts";
import ProductCard from "@/components/ProductCard";

type Tab = "description" | "storage" | "documentation";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === id);
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState<Tab>("description");
  const [added, setAdded] = useState(false);
  const { visible, loading: visLoading } = useProductVisible(id);

  if (!product || (!visLoading && !visible)) {
    return (
      <div className="min-h-screen pt-32 sm:pt-40 text-center px-4">
        <p className="text-silver-400 text-lg">Product not found.</p>
        <Link to="/shop" className="text-cyan-400 mt-4 inline-block">Back to Shop</Link>
      </div>
    );
  }

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, size: product.size, price: product.price, image: product.image });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  const tabs: { key: Tab; label: string; icon: typeof FlaskConical }[] = [
    { key: "description", label: "Description", icon: FlaskConical },
    { key: "storage", label: "Storage", icon: Thermometer },
    { key: "documentation", label: "Docs", icon: FileText },
  ];

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-silver-400 hover:text-cyan-400 text-sm mb-6 sm:mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          {/* Image */}
          <div className="card-dark overflow-hidden aspect-square sm:aspect-[4/3] animate-fade-in-up">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Info */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-silver-200">
              {product.name} <span className="text-silver-400 font-normal text-lg sm:text-xl">{product.size}</span>
            </h1>
            <p className="text-silver-500 text-xs sm:text-sm mt-1 font-mono">{product.catalog}</p>
            <p className="text-cyan-400 font-bold text-2xl sm:text-3xl mt-3 sm:mt-4">${product.price.toFixed(2)} NZD</p>
            <p className="text-silver-400 text-sm sm:text-base mt-3 sm:mt-4">{product.description}</p>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-5 sm:mt-6">
              {[
                { label: "CAS Number", value: product.casNumber },
                { label: "Formula", value: product.molecularFormula },
                { label: "Purity", value: product.purity },
                { label: "Form", value: product.form },
              ].map((spec) => (
                <div key={spec.label} className="bg-navy-800/50 rounded-lg p-2.5 sm:p-3">
                  <p className="text-silver-500 text-[10px] sm:text-xs">{spec.label}</p>
                  <p className="text-silver-200 text-xs sm:text-sm font-mono mt-0.5 break-all">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAdd}
              className={`w-full mt-6 sm:mt-8 py-3 rounded-lg font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all ${
                added
                  ? "bg-green-500 text-white"
                  : "btn-primary"
              }`}
            >
              <ShoppingCart size={20} />
              {added ? "Added!" : "Add to Cart"}
            </button>

            {/* Shipping info */}
            <div className="flex items-center gap-4 mt-3 sm:mt-4 text-xs text-silver-500">
              <span className="flex items-center gap-1"><Package size={12} /> Discrete packaging</span>
              <span className="flex items-center gap-1"><Thermometer size={12} /> Insulated shipping</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 sm:mt-16">
          <div className="flex gap-0 sm:gap-1 border-b border-cyan-400/10 mb-4 sm:mb-6 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-silver-500 hover:text-silver-300"
                }`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
          <div className="card-dark p-4 sm:p-6">
            {activeTab === "description" && (
              <div className="text-silver-400 space-y-3 sm:space-y-4 text-sm">
                <p>{product.description}</p>
                <p><strong className="text-silver-200">Molecular Formula:</strong> <span className="break-all">{product.molecularFormula}</span></p>
                <p><strong className="text-silver-200">CAS Number:</strong> {product.casNumber}</p>
                <p><strong className="text-silver-200">Purity:</strong> {product.purity}</p>
              </div>
            )}
            {activeTab === "storage" && (
              <div className="text-silver-400 space-y-3 sm:space-y-4 text-sm">
                <p><strong className="text-silver-200">Storage Conditions:</strong> {product.storage}</p>
                <p><strong className="text-silver-200">Shelf Life:</strong> {product.shelfLife}</p>
                <p><strong className="text-silver-200">Form:</strong> {product.form}</p>
              </div>
            )}
            {activeTab === "documentation" && (
              <div className="text-silver-400 space-y-3 sm:space-y-4 text-sm">
                <p>COAs include batch numbers, testing dates, analytical methods used, and the results of each test. This documentation is essential for research record-keeping and regulatory compliance.</p>
                <p>Contact <a href="mailto:support@xtremepeptides.nz" className="text-cyan-400">support@xtremepeptides.nz</a> to request batch-specific documentation.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-10 sm:mt-16">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-silver-200 mb-4 sm:mb-6">Related Products</h2>
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

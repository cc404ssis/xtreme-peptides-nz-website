import { useState, useEffect } from "react";
import { products as allProducts, type Product } from "@/data/products";

/**
 * Fetches hidden product names from the API (backed by Supabase products table).
 * The admin dashboard toggles is_active; this filters hidden products from the storefront.
 */
export function useVisibleProducts() {
  const [visibleProducts, setVisibleProducts] = useState<Product[]>(allProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchVisibility() {
      try {
        const res = await fetch("/api/hidden-products");
        if (!res.ok) throw new Error("Failed to fetch");
        const { hiddenNames } = await res.json() as { hiddenNames: string[] };

        if (cancelled) return;

        if (hiddenNames && hiddenNames.length > 0) {
          const hiddenSet = new Set(hiddenNames.map((n: string) => n.toLowerCase()));
          setVisibleProducts(
            allProducts.filter(
              (p) => !hiddenSet.has(`${p.name} ${p.size}`.toLowerCase())
            )
          );
        } else {
          setVisibleProducts(allProducts);
        }
      } catch {
        // On error, show all products (fail-open)
        setVisibleProducts(allProducts);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchVisibility();
    return () => { cancelled = true; };
  }, []);

  return { products: visibleProducts, loading };
}

/**
 * Check if a single product ID is hidden. Used by ProductDetail page.
 */
export function useProductVisible(productId: string | undefined) {
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) { setLoading(false); return; }

    const product = allProducts.find((p) => p.id === productId);
    if (!product) { setVisible(false); setLoading(false); return; }

    const fullName = `${product.name} ${product.size}`.toLowerCase();

    (async () => {
      try {
        const res = await fetch("/api/hidden-products");
        if (!res.ok) throw new Error("Failed to fetch");
        const { hiddenNames } = await res.json() as { hiddenNames: string[] };

        if (hiddenNames && hiddenNames.some((n: string) => n.toLowerCase() === fullName)) {
          setVisible(false);
        }
      } catch {
        // fail-open
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  return { visible, loading };
}

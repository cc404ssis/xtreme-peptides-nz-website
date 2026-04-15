import { useState, useEffect } from "react";
import type { Product } from "@/data/products";

/**
 * Fetches visible products from the server API.
 * Product data is never bundled into the client — it lives server-side only.
 */
export function useVisibleProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Product[]) => { if (!cancelled) { setProducts(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { products, loading };
}

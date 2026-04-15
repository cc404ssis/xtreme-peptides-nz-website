import { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import GlobalBackground from "@/components/GlobalBackground";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AgeVerificationModal from "@/components/AgeVerificationModal";
import LiveSalesFeed from "@/components/LiveSalesFeed";
import ScrollToTop from "@/components/ScrollToTop";
import About from "@/pages/About";
import Quality from "@/pages/Quality";
import FAQ from "@/pages/FAQ";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/NotFound";

const Home = lazy(() => import("@/pages/Home"));
const Shop = lazy(() => import("@/pages/Shop"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));

export default function App() {
  const [gateCleared, setGateCleared] = useState(() => {
    try { return localStorage.getItem("xp_age_verified") === "true"; }
    catch { return false; }
  });

  useEffect(() => {
    const handler = () => setGateCleared(true);
    window.addEventListener("xp:gate_cleared", handler);
    return () => window.removeEventListener("xp:gate_cleared", handler);
  }, []);

  return (
    <>
      <ScrollToTop />
      <AgeVerificationModal />
      <GlobalBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navigation />
        {gateCleared && (
          <>
            <main>
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/quality" element={<Quality />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </>
        )}
      </div>
      <LiveSalesFeed />
    </>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";
import { ShoppingBag } from "lucide-react";

interface Notification {
  id: number;
  name: string;
  location: string;
  product: string;
  time: string;
}

interface SocialProof {
  buyerNames: string[];
  nzLocations: string[];
  productNames: string[];
}

export default function LiveSalesFeed() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [visible, setVisible] = useState(false);
  const proofRef = useRef<SocialProof | null>(null);

  useEffect(() => {
    fetch("/api/social-proof")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SocialProof | null) => { if (data) proofRef.current = data; })
      .catch(() => {});
  }, []);

  const generateNotification = useCallback((): Notification | null => {
    const proof = proofRef.current;
    if (!proof) return null;
    const name = proof.buyerNames[Math.floor(Math.random() * proof.buyerNames.length)];
    const location = proof.nzLocations[Math.floor(Math.random() * proof.nzLocations.length)];
    const product = proof.productNames[Math.floor(Math.random() * proof.productNames.length)];
    const minutes = Math.floor(Math.random() * 30) + 1;
    return { id: Date.now(), name, location, product, time: `${minutes}m ago` };
  }, []);

  useEffect(() => {
    const initialDelay = setTimeout(() => {
      const n = generateNotification();
      if (n) { setNotification(n); setVisible(true); }
    }, 5000);

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        const n = generateNotification();
        if (n) { setNotification(n); setVisible(true); }
      }, 300);
      setTimeout(() => setVisible(false), 4000);
    }, 15000);

    return () => { clearTimeout(initialDelay); clearInterval(interval); };
  }, [generateNotification]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-50 max-w-[260px] sm:max-w-xs">
      <div
        className={`p-2.5 sm:p-3 flex items-start gap-2.5 sm:gap-3 shadow-2xl transition-all duration-300 ${
          visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
        style={{ background: "rgba(9,9,9,0.97)", border: "1px solid var(--xp-border)", borderTop: "2px solid var(--xp-red)" }}
      >
        <div className="p-1.5 sm:p-2 shrink-0" style={{ background: "var(--xp-red-dim)" }}>
          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "var(--xp-red)" }} />
        </div>
        <div className="min-w-0">
          <p className="font-heading text-xs sm:text-sm leading-tight" style={{ color: "var(--xp-white)" }}>
            {notification.name} from {notification.location}
          </p>
          <p className="font-mono text-[10px] sm:text-xs mt-0.5" style={{ color: "var(--xp-grey-text)" }}>
            purchased {notification.product}
          </p>
          <p className="font-mono text-[10px] sm:text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.18)" }}>
            {notification.time}
          </p>
        </div>
      </div>
    </div>
  );
}

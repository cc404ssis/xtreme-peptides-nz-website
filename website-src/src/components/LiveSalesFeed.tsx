import { useState, useEffect, useCallback } from "react";
import { ShoppingBag } from "lucide-react";
import { buyerNames, nzLocations } from "@/data/social-proof";

const productNames = [
  "BPC-157 10mg", "TB-500 10mg", "GHK-Cu 50mg", "GHK-Cu 100mg",
  "BPC-157 5mg", "BAC Water 10ml", "BAC Water 3ml", "DSIP 15mg",
  "Retatrutide 10mg", "MOTSC 40mg", "SS-31 10mg", "Epitalon 50mg",
  "Sermorelin 10mg", "CJC-1295 5mg", "Ipamorelin 5mg", "GHRP-6 5mg",
  "NAD+ 100mg", "NAD+ 500mg", "PT-141 10mg", "Melanotan II 10mg",
  "Tesamorelin 10mg", "Kisspeptin 10mg", "SNAP-8 10mg", "Thymosin α1 10mg",
];

interface Notification {
  id: number;
  name: string;
  location: string;
  product: string;
  time: string;
}

export default function LiveSalesFeed() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [visible, setVisible] = useState(false);

  const generateNotification = useCallback((): Notification => {
    const name = buyerNames[Math.floor(Math.random() * buyerNames.length)];
    const location = nzLocations[Math.floor(Math.random() * nzLocations.length)];
    const product = productNames[Math.floor(Math.random() * productNames.length)];
    const minutes = Math.floor(Math.random() * 30) + 1;
    return {
      id: Date.now(),
      name,
      location,
      product,
      time: `${minutes}m ago`,
    };
  }, []);

  useEffect(() => {
    const initialDelay = setTimeout(() => {
      setNotification(generateNotification());
      setVisible(true);
    }, 5000);

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setNotification(generateNotification());
        setVisible(true);
      }, 300);
      setTimeout(() => setVisible(false), 4000);
    }, 15000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [generateNotification]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-50 max-w-[260px] sm:max-w-xs">
      <div
        className={`p-2.5 sm:p-3 flex items-start gap-2.5 sm:gap-3 shadow-2xl transition-all duration-300 ${
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
        style={{
          background: "rgba(9,9,9,0.97)",
          border: "1px solid var(--xp-border)",
          borderTop: "2px solid var(--xp-red)",
        }}
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
          <p className="font-mono text-[10px] sm:text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.18)" }}>{notification.time}</p>
        </div>
      </div>
    </div>
  );
}

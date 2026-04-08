import { useState, useEffect, useCallback } from "react";
import { ShoppingBag } from "lucide-react";
import { products } from "@/data/products";
import { buyerNames, nzLocations } from "@/data/social-proof";

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
    const product = products[Math.floor(Math.random() * products.length)];
    const minutes = Math.floor(Math.random() * 30) + 1;
    return {
      id: Date.now(),
      name,
      location,
      product: `${product.name} ${product.size}`,
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
        className={`p-2.5 sm:p-3 flex items-start gap-2.5 sm:gap-3 shadow-2xl transition-all duration-300 rounded-2xl border border-cyan-400/10 ${
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
        style={{ background: "rgba(4, 12, 24, 0.97)" }}
      >
        <div className="p-1.5 sm:p-2 rounded-lg bg-cyan-400/10 text-cyan-400 shrink-0">
          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-silver-200 text-xs sm:text-sm font-medium leading-tight">
            {notification.name} from {notification.location}
          </p>
          <p className="text-silver-400 text-[10px] sm:text-xs mt-0.5">
            purchased {notification.product}
          </p>
          <p className="text-silver-500 text-[10px] sm:text-xs mt-0.5">{notification.time}</p>
        </div>
      </div>
    </div>
  );
}

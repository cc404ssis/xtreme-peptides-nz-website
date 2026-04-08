import { useState, useEffect } from "react";

export default function AgeVerificationModal() {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem("age-verified");
    if (!verified) {
      setShow(true);
      requestAnimationFrame(() => setVisible(true));
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem("age-verified", "true");
    setVisible(false);
    setTimeout(() => setShow(false), 200);
  };

  const handleDecline = () => {
    window.location.href = "https://google.com";
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`card-dark p-6 sm:p-8 max-w-md w-full text-center transition-all duration-200 ${
          visible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        <img src="/logo.png" alt="Xtreme Peptides NZ" className="h-10 sm:h-12 mx-auto mb-4 sm:mb-6" />
        <h2 className="text-lg sm:text-xl font-display font-bold text-silver-200 mb-2 sm:mb-3">
          Age Verification Required
        </h2>
        <p className="text-silver-400 text-xs sm:text-sm mb-5 sm:mb-6">
          You must be 18 years or older to access this website. All products are sold for laboratory research purposes only.
        </p>
        <div className="flex gap-3 sm:gap-4 justify-center">
          <button
            onClick={handleConfirm}
            className="btn-primary px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base"
          >
            I am 18+
          </button>
          <button
            onClick={handleDecline}
            className="btn-outline px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base"
          >
            Under 18
          </button>
        </div>
        <p className="text-silver-500 text-[10px] sm:text-xs mt-3 sm:mt-4">
          18+ Only. All products sold for laboratory research use.
        </p>
      </div>
    </div>
  );
}

import { FlaskConical, FileText, Thermometer } from "lucide-react";

const features = [
  {
    icon: FlaskConical,
    title: "HPLC Purity Testing",
    description: "All peptides meet or exceed 99.897% purity as verified by independent HPLC testing.",
  },
  {
    icon: FileText,
    title: "Batch Documentation",
    description: "Every batch we supply comes with a comprehensive Certificate of Analysis. This document provides detailed information about the product's identity, purity, and testing methodology.",
  },
  {
    icon: Thermometer,
    title: "Cold-Chain Storage",
    description: "We verify identity and purity by HPLC and provide batch COAs. Products are stored cold and shipped with tracking and documentation.",
  },
];

export default function QualityPromise() {
  return (
    <section
      className="py-16 sm:py-24"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(11, 27, 45, 0.9), rgba(11, 27, 45, 0.75)), url('/quality_lab_bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14 animate-fade-in-up">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-silver-200 mb-3 sm:mb-4">
            Tested. Documented. Consistent.
          </h2>
          <p className="text-silver-400 max-w-2xl mx-auto text-sm sm:text-base">
            Whether you're running cell assays or endocrine studies, consistency matters. Every batch is tracked, stored cold, and shipped with documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 stagger-children">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-dark card-glow p-5 sm:p-6 text-center"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <feature.icon size={22} />
              </div>
              <h3 className="font-display font-semibold text-silver-200 text-base sm:text-lg mb-2">{feature.title}</h3>
              <p className="text-silver-400 text-xs sm:text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

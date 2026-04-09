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
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="section-header animate-fade-in-up">
          <div className="section-label">— Our Promise —</div>
          <h2>
            Tested. Documented. <span className="text-accent">Consistent.</span>
          </h2>
          <div className="section-rule" />
          <p className="font-heading font-300 text-sm sm:text-base max-w-2xl mx-auto mt-4" style={{ color: "var(--xp-grey-text)" }}>
            Whether you're running cell assays or endocrine studies, consistency matters. Every batch is tracked, stored cold, and shipped with documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 stagger-children">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-dark card-glow card-red-top p-6 sm:p-8 text-center"
            >
              <div
                className="w-12 h-12 flex items-center justify-center mx-auto mb-4"
                style={{ border: "1px solid var(--xp-border-red)" }}
              >
                <feature.icon size={22} style={{ color: "var(--xp-red)" }} />
              </div>
              <h3 className="text-base sm:text-lg mb-3">{feature.title}</h3>
              <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

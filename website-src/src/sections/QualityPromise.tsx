import { useState, useEffect } from "react";
import { FlaskConical, FileText, Thermometer } from "lucide-react";

interface QualityFeature {
  title: string;
  description: string;
}

const icons = [FlaskConical, FileText, Thermometer];

export default function QualityPromise() {
  const [features, setFeatures] = useState<QualityFeature[]>([]);

  useEffect(() => {
    fetch("/api/quality-content")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { features: QualityFeature[] } | null) => {
        if (data?.features) setFeatures(data.features);
      })
      .catch(() => {});
  }, []);

  if (features.length === 0) return null;

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
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
          {features.map((feature, i) => {
            const Icon = icons[i];
            return (
              <div
                key={feature.title}
                className="card-dark card-glow card-red-top p-6 sm:p-8 text-center"
              >
                <div
                  className="w-12 h-12 flex items-center justify-center mx-auto mb-4"
                  style={{ border: "1px solid var(--xp-border-red)" }}
                >
                  <Icon size={22} style={{ color: "var(--xp-red)" }} />
                </div>
                <h3 className="text-base sm:text-lg mb-3">{feature.title}</h3>
                <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

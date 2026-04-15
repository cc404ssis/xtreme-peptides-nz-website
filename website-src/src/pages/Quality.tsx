import { useState, useEffect } from "react";
import { FlaskConical, FileText, Thermometer, Shield, CheckCircle } from "lucide-react";

interface QualityFeature {
  title: string;
  description: string;
}

interface QualitySection {
  title: string;
  body: string;
  body2?: string;
  body3?: string;
  list?: string[];
}

interface QualityContent {
  features: QualityFeature[];
  sections: QualitySection[];
}

const featureIcons = [FlaskConical, FileText, Thermometer];
const sectionIcons = [Shield, FileText, Thermometer];

export default function Quality() {
  const [content, setContent] = useState<QualityContent | null>(null);

  useEffect(() => {
    fetch("/api/quality-content")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: QualityContent | null) => { if (data) setContent(data); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-header mb-12 animate-fade-in-up">
          <div className="section-label">— Standards —</div>
          <h1 className="!text-3xl sm:!text-4xl">
            Quality <span className="text-accent">Assurance</span>
          </h1>
          <div className="section-rule" />
          <p className="font-heading font-300 text-sm sm:text-base max-w-2xl mx-auto mt-4" style={{ color: "var(--xp-grey-text)" }}>
            We verify identity and purity by HPLC and provide batch COAs. Products are stored cold and shipped with tracking and documentation.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-16 stagger-children">
          {content?.features.map((feature, i) => {
            const Icon = featureIcons[i];
            return (
              <div key={feature.title} className="card-dark card-glow card-red-top p-6 sm:p-8 text-center">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4" style={{ border: "1px solid var(--xp-border-red)" }}>
                  <Icon size={24} style={{ color: "var(--xp-red)" }} />
                </div>
                <h3 className="!text-base sm:!text-lg mb-2">{feature.title}</h3>
                <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6">
          {content?.sections.map((section, i) => {
            const Icon = sectionIcons[i];
            return (
              <div key={section.title} className="card-dark p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 shrink-0" style={{ border: "1px solid var(--xp-border-red)" }}>
                    <Icon size={24} style={{ color: "var(--xp-red)" }} />
                  </div>
                  <div>
                    <h3 className="!text-lg mb-3">{section.title}</h3>
                    <div className="space-y-3">
                      <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>{section.body}</p>
                      {section.body2 && <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>{section.body2}</p>}
                      {section.list && (
                        <ul className="space-y-2 ml-4">
                          {section.list.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: "var(--xp-red)" }} />
                              <span className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {section.body3 && <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>{section.body3}</p>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

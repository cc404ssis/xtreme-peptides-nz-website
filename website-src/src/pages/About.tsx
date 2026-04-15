import { useState, useEffect } from "react";
import { FlaskConical, Shield, Truck, Users } from "lucide-react";

interface AboutContent {
  headingPre: string;
  headingAccent: string;
  subheading: string;
  mission: string;
  features: { title: string; desc: string }[];
  qualityPara1: string;
  qualityPara2: string;
}

const featureIcons = [FlaskConical, Shield, Truck, Users];

export default function About() {
  const [content, setContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    fetch("/api/about-content")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AboutContent | null) => { if (data) setContent(data); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-header animate-fade-in-up">
          <div className="section-label">— About Us —</div>
          <h1 className="!text-3xl sm:!text-4xl">
            {content?.headingPre} <span className="text-accent">{content?.headingAccent}</span>
          </h1>
          <div className="section-rule" />
          <p className="font-heading font-300 text-base sm:text-lg max-w-2xl mx-auto mt-4" style={{ color: "var(--xp-grey-text)" }}>
            {content?.subheading}
          </p>
        </div>

        <div className="space-y-16 mt-12">
          <section>
            <h2 className="!text-2xl mb-4 text-center md:text-left">Our <span className="text-accent">Mission</span></h2>
            <div className="section-rule !mx-0 md:!mx-0 !ml-0" style={{ maxWidth: "120px" }} />
            <p className="font-body text-sm sm:text-base mt-4" style={{ color: "var(--xp-grey-text)" }}>
              {content?.mission}
            </p>
          </section>

          <section>
            <h2 className="!text-2xl mb-6 text-center">Why <span className="text-accent">Choose</span> Us</h2>
            <div className="section-rule" />
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 stagger-children mt-8">
              {content?.features.map((item, i) => {
                const Icon = featureIcons[i];
                return (
                  <div key={item.title} className="card-dark card-glow card-red-top p-6">
                    <div className="w-10 h-10 flex items-center justify-center mb-3" style={{ border: "1px solid var(--xp-border-red)" }}>
                      <Icon size={20} style={{ color: "var(--xp-red)" }} />
                    </div>
                    <h3 className="!text-base mb-2">{item.title}</h3>
                    <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="!text-2xl mb-4 text-center md:text-left">Commitment to <span className="text-accent">Quality</span></h2>
            <div className="section-rule !mx-0 md:!mx-0 !ml-0" style={{ maxWidth: "120px" }} />
            <div className="card-dark p-6 sm:p-8 mt-6">
              <p className="font-body text-sm sm:text-base mb-4" style={{ color: "var(--xp-grey-text)" }}>
                {content?.qualityPara1}
              </p>
              <p className="font-body text-sm sm:text-base" style={{ color: "var(--xp-grey-text)" }}>
                {content?.qualityPara2}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

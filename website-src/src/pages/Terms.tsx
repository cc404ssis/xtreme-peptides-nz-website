import { useState, useEffect } from "react";

interface TermsSection {
  title: string;
  content: string;
  list?: string[];
}

export default function Terms() {
  const [sections, setSections] = useState<TermsSection[]>([]);

  useEffect(() => {
    fetch("/api/terms-content")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: TermsSection[]) => setSections(data))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up">
          <div className="section-label text-center mb-4">— Legal —</div>
          <h1 className="!text-3xl sm:!text-4xl text-center">Terms & <span className="text-accent">Conditions</span></h1>
          <div className="section-rule" />
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-center mt-3" style={{ color: "var(--xp-grey-text)" }}>Last updated: April 2026</p>
        </div>

        <div className="space-y-8 mt-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="!text-xl mb-3">{section.title}</h2>
              <p className="font-body text-sm whitespace-pre-line" style={{ color: "var(--xp-grey-text)" }}>{section.content}</p>
              {section.list && (
                <ul className="list-disc ml-6 space-y-1 mt-2">
                  {section.list.map((item) => (
                    <li key={item} className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

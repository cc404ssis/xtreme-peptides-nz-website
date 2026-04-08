import { FlaskConical, FileText, Thermometer, Shield, CheckCircle } from "lucide-react";

export default function Quality() {
  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-silver-200 mb-4">
            Quality Assurance
          </h1>
          <p className="text-silver-400 max-w-2xl mx-auto">
            We verify identity and purity by HPLC and provide batch COAs. Products are stored cold and shipped with tracking and documentation.
          </p>
        </div>

        {/* Documentation & Storage Monitoring */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 stagger-children">
          {[
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
              title: "Storage Monitoring",
              description: "Products are stored in temperature-controlled environments. Cold-chain integrity is maintained from storage through shipping.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="card-dark card-glow p-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center mx-auto mb-4">
                <feature.icon size={24} />
              </div>
              <h3 className="font-display font-semibold text-silver-200 text-lg mb-2">{feature.title}</h3>
              <p className="text-silver-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12">
          <section className="card-dark p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400 shrink-0">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-silver-200 mb-3">Testing Standards</h2>
                <div className="text-silver-400 space-y-3">
                  <p>All peptides meet or exceed 99.897% purity as verified by independent HPLC testing.</p>
                  <p>Each product undergoes rigorous quality control including:</p>
                  <ul className="space-y-2 ml-4">
                    {[
                      "High-Performance Liquid Chromatography (HPLC) for purity verification",
                      "Mass Spectrometry for identity confirmation",
                      "Sterility testing for injectable-grade products",
                      "Endotoxin testing where applicable",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="card-dark p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400 shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-silver-200 mb-3">Certificates of Analysis</h2>
                <div className="text-silver-400 space-y-3">
                  <p>Every batch we supply comes with a comprehensive Certificate of Analysis. This document provides detailed information about the product's identity, purity, and testing methodology.</p>
                  <p>COAs include batch numbers, testing dates, analytical methods used, and the results of each test. This documentation is essential for research record-keeping and regulatory compliance.</p>
                  <p>Contact <a href="mailto:support@xtremepeptides.nz" className="text-cyan-400 hover:underline">support@xtremepeptides.nz</a> to request batch-specific COAs.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="card-dark p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400 shrink-0">
                <Thermometer size={24} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-silver-200 mb-3">Storage & Shipping</h2>
                <div className="text-silver-400 space-y-3">
                  <p>Most peptides require refrigeration. Storage guidance is printed on each label.</p>
                  <p>All orders are shipped in discrete packaging without external markings indicating contents. Temperature-sensitive products are shipped with appropriate cold-chain packaging.</p>
                  <p>Insulated packaging for peptide stability during transit.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

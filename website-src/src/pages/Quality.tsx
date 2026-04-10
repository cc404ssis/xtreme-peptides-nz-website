import { FlaskConical, FileText, Thermometer, Shield, CheckCircle } from "lucide-react";

export default function Quality() {
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
          {[
            { icon: FlaskConical, title: "HPLC Purity Testing", description: "All peptides meet or exceed 99.897% purity as verified by independent HPLC testing." },
            { icon: FileText, title: "Batch Documentation", description: "Every batch we supply comes with a comprehensive Certificate of Analysis. This document provides detailed information about the product's identity, purity, and testing methodology." },
            { icon: Thermometer, title: "Storage Monitoring", description: "Products are stored in temperature-controlled environments. Cold-chain integrity is maintained from storage through shipping." },
          ].map((feature) => (
            <div key={feature.title} className="card-dark card-glow card-red-top p-6 sm:p-8 text-center">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4" style={{ border: "1px solid var(--xp-border-red)" }}>
                <feature.icon size={24} style={{ color: "var(--xp-red)" }} />
              </div>
              <h3 className="!text-base sm:!text-lg mb-2">{feature.title}</h3>
              <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6">
          <div className="card-dark p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 shrink-0" style={{ border: "1px solid var(--xp-border-red)" }}>
                <Shield size={24} style={{ color: "var(--xp-red)" }} />
              </div>
              <div>
                <h3 className="!text-lg mb-3">Testing Standards</h3>
                <div className="space-y-3">
                  <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>All peptides meet or exceed 99.897% purity as verified by independent HPLC testing.</p>
                  <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>Each product undergoes rigorous quality control including:</p>
                  <ul className="space-y-2 ml-4">
                    {[
                      "High-Performance Liquid Chromatography (HPLC) for purity verification",
                      "Mass Spectrometry for identity confirmation",
                      "Sterility testing for injectable-grade products",
                      "Endotoxin testing where applicable",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: "var(--xp-red)" }} />
                        <span className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="card-dark p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 shrink-0" style={{ border: "1px solid var(--xp-border-red)" }}>
                <FileText size={24} style={{ color: "var(--xp-red)" }} />
              </div>
              <div>
                <h3 className="!text-lg mb-3">Certificates of Analysis</h3>
                <div className="space-y-3">
                  <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>Every batch we supply comes with a comprehensive Certificate of Analysis. This document provides detailed information about the product's identity, purity, and testing methodology.</p>
                  <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>COAs include batch numbers, testing dates, analytical methods used, and the results of each test. This documentation is essential for research record-keeping and regulatory compliance.</p>
                  <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>Batch-specific COAs are included with every shipment.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-dark p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 shrink-0" style={{ border: "1px solid var(--xp-border-red)" }}>
                <Thermometer size={24} style={{ color: "var(--xp-red)" }} />
              </div>
              <div>
                <h3 className="!text-lg mb-3">Storage & Shipping</h3>
                <div className="space-y-3">
                  <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>Most peptides require refrigeration. Storage guidance is printed on each label.</p>
                  <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>All orders are shipped in discrete packaging without external markings indicating contents. Temperature-sensitive products are shipped with appropriate cold-chain packaging.</p>
                  <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>Insulated packaging for peptide stability during transit.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

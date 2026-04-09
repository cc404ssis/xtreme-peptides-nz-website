import { FlaskConical, Shield, Truck, Users } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-header animate-fade-in-up">
          <div className="section-label">— About Us —</div>
          <h1 className="!text-3xl sm:!text-4xl">
            About <span className="text-accent">Xtreme Peptides</span>
          </h1>
          <div className="section-rule" />
          <p className="font-heading font-300 text-base sm:text-lg max-w-2xl mx-auto mt-4" style={{ color: "var(--xp-grey-text)" }}>
            We supply high-purity peptides and research compounds with transparent testing, fast NZ shipping, and discrete packaging.
          </p>
        </div>

        <div className="space-y-16 mt-12">
          <section>
            <h2 className="!text-2xl mb-4 text-center md:text-left">Our <span className="text-accent">Mission</span></h2>
            <div className="section-rule !mx-0 md:!mx-0 !ml-0" style={{ maxWidth: "120px" }} />
            <p className="font-body text-sm sm:text-base mt-4" style={{ color: "var(--xp-grey-text)" }}>
              XTREME PEPTIDES NZ sells laboratory research chemicals intended exclusively for research purposes.
              All products sold by Xtreme Peptides NZ are strictly for laboratory research purposes. We do not condone or support any use of these compounds outside of controlled research settings.
            </p>
          </section>

          <section>
            <h2 className="!text-2xl mb-6 text-center">Why <span className="text-accent">Choose</span> Us</h2>
            <div className="section-rule" />
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 stagger-children mt-8">
              {[
                { icon: FlaskConical, title: "Verified Purity", desc: "All peptides meet or exceed 99.8% purity with independent HPLC testing and batch COAs." },
                { icon: Shield, title: "Quality Assurance", desc: "Every batch is tracked, stored cold, and shipped with full documentation." },
                { icon: Truck, title: "Fast NZ Shipping", desc: "Express overnight delivery across New Zealand. All orders tracked with discrete packaging." },
                { icon: Users, title: "Research Support", desc: "Dedicated support team ready to help with product questions and documentation requests." },
              ].map((item) => (
                <div key={item.title} className="card-dark card-glow card-red-top p-6">
                  <div className="w-10 h-10 flex items-center justify-center mb-3" style={{ border: "1px solid var(--xp-border-red)" }}>
                    <item.icon size={20} style={{ color: "var(--xp-red)" }} />
                  </div>
                  <h3 className="!text-base mb-2">{item.title}</h3>
                  <p className="font-body text-sm" style={{ color: "var(--xp-grey-text)" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="!text-2xl mb-4 text-center md:text-left">Commitment to <span className="text-accent">Quality</span></h2>
            <div className="section-rule !mx-0 md:!mx-0 !ml-0" style={{ maxWidth: "120px" }} />
            <div className="card-dark p-6 sm:p-8 mt-6">
              <p className="font-body text-sm sm:text-base mb-4" style={{ color: "var(--xp-grey-text)" }}>
                Whether you're running cell assays or endocrine studies, consistency matters. Every batch is tracked, stored cold, and shipped with documentation.
              </p>
              <p className="font-body text-sm sm:text-base" style={{ color: "var(--xp-grey-text)" }}>
                We verify identity and purity by HPLC and provide batch COAs. Products are stored cold and shipped with tracking and documentation.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

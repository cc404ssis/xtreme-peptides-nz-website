import { FlaskConical, Shield, Truck, Users } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up text-center md:text-left">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-silver-200 mb-4">About Us</h1>
          <p className="text-silver-400 text-base sm:text-lg mb-8 sm:mb-12">
            We supply high-purity peptides and research compounds with transparent testing, fast NZ shipping, and discrete packaging.
          </p>
        </div>

        <div className="space-y-16">
          <section className="text-center md:text-left">
            <h2 className="font-display text-2xl font-bold text-silver-200 mb-4">Our Mission</h2>
            <p className="text-silver-400 text-sm sm:text-base">
              XTREME PEPTIDES NZ sells laboratory research chemicals intended exclusively for research purposes.
              All products sold by Xtreme Peptides NZ are strictly for laboratory research purposes. We do not condone or support any use of these compounds outside of controlled research settings.
            </p>
          </section>

          <section className="text-center md:text-left">
            <h2 className="font-display text-2xl font-bold text-silver-200 mb-6">Why Choose Us</h2>
            <div className="grid sm:grid-cols-2 gap-6 stagger-children">
              {[
                { icon: FlaskConical, title: "Verified Purity", desc: "All peptides meet or exceed 99.8% purity with independent HPLC testing and batch COAs." },
                { icon: Shield, title: "Quality Assurance", desc: "Every batch is tracked, stored cold, and shipped with full documentation." },
                { icon: Truck, title: "Fast NZ Shipping", desc: "Express overnight delivery across New Zealand. All orders tracked with discrete packaging." },
                { icon: Users, title: "Research Support", desc: "Dedicated support team ready to help with product questions and documentation requests." },
              ].map((item) => (
                <div
                  key={item.title}
                  className="card-dark card-glow p-6"
                >
                  <div className="w-10 h-10 rounded-lg bg-cyan-400/10 text-cyan-400 flex items-center justify-center mb-3">
                    <item.icon size={20} />
                  </div>
                  <h3 className="text-silver-200 font-semibold mb-2">{item.title}</h3>
                  <p className="text-silver-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="text-center md:text-left">
            <h2 className="font-display text-2xl font-bold text-silver-200 mb-4">Commitment to Quality</h2>
            <div className="card-dark p-5 sm:p-6 text-center md:text-left">
              <p className="text-silver-400 text-sm sm:text-base mb-4">
                Whether you're running cell assays or endocrine studies, consistency matters. Every batch is tracked, stored cold, and shipped with documentation.
              </p>
              <p className="text-silver-400 text-sm sm:text-base">
                We verify identity and purity by HPLC and provide batch COAs. Products are stored cold and shipped with tracking and documentation.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

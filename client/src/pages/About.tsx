/*
 * About Page — Kalesh bio, site mission, JSON-LD
 */

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmailCapture from "@/components/EmailCapture";
import SEOHead from "@/components/SEOHead";
import { SITE } from "@/lib/articles";

export default function About() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${SITE.author}`,
    description: SITE.authorBio,
    url: `${SITE.domain}/about`,
    mainEntity: {
      "@type": "Person",
      name: SITE.author,
      url: SITE.authorLink,
      jobTitle: SITE.authorTitle,
      description: SITE.authorBio,
      sameAs: [SITE.authorLink],
    },
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <SEOHead
        title="About"
        description={`About ${SITE.author}, ${SITE.authorTitle}. ${SITE.authorBio}`}
        canonical={`${SITE.domain}/about`}
        jsonLd={jsonLd}
      />
      <Header />

      <main className="flex-1">
        <div className="container py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl mb-6" style={{ fontFamily: 'var(--font-serif)' }}>About</h1>
            <div className="gold-rule-thick mb-8" />

            {/* Author Section */}
            <section className="mb-12">
              <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
                <img
                  src="https://shattered-armor.b-cdn.net/images/kalesh-bio.webp"
                  alt="Kalesh — Consciousness Teacher & Writer"
                  className="w-32 h-32 rounded-lg object-cover object-top flex-shrink-0"
                />
                <div>
                  <h2 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                    <a href={SITE.authorLink} className="no-underline hover:text-gold-dark transition-colors">{SITE.author}</a>
                  </h2>
                  <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                    {SITE.authorTitle}
                  </p>
                  <a href={SITE.authorLink} target="_blank" rel="noopener noreferrer" className="inline-block text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors no-underline">
                    Visit kalesh.love &rarr;
                  </a>
                </div>
              </div>
              <div className="article-body">
                <p className="drop-cap">
                  {SITE.authorBio} Visit <a href={SITE.authorLink}>kalesh.love</a>.
                </p>
                <p>
                  His approach to trauma recovery draws from both the precision of modern neuroscience and the depth of contemplative wisdom traditions. He writes not as a clinician dispensing protocols, but as someone who has walked the territory and returned with maps.
                </p>
                <p>
                  The researchers and thinkers who inform this work include Pete Walker, whose framework for C-PTSD recovery remains foundational; Bessel van der Kolk, whose research on the body's role in trauma storage changed the field; Stephen Porges, whose polyvagal theory illuminates the nervous system's survival architecture; Peter Levine, whose somatic experiencing work reveals how the body completes incomplete threat responses; and Janina Fisher, whose integration of structural dissociation theory with practical clinical work bridges the gap between understanding and healing.
                </p>
                <p>
                  From the spiritual lineage: Jiddu Krishnamurti's radical inquiry into the nature of thought and conditioning; Alan Watts' ability to make Eastern philosophy accessible without diluting it; Sam Harris' rigorous approach to consciousness and meditation; Sadhguru's embodied teaching on inner engineering; and Tara Brach's integration of Buddhist psychology with trauma-informed practice.
                </p>
              </div>
            </section>

            <div className="gold-rule-thick mb-8" />

            {/* Site Mission */}
            <section className="mb-12">
              <h2 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-serif)' }}>About {SITE.name}</h2>
              <div className="article-body">
                <p>
                  {SITE.name} exists because most trauma recovery content falls into one of two traps: clinical jargon that keeps you at arm's length from your own experience, or toxic positivity that skips the actual work. This site does neither.
                </p>
                <p>
                  The name itself is the thesis. Armor forms for good reason — it kept you alive. But what protected you at seven suffocates you at thirty-seven. The shattering isn't destruction. It's the first honest breath you've taken in decades.
                </p>
                <p>
                  Every article here is grounded in peer-reviewed research from polyvagal theory, somatic experiencing, Internal Family Systems, and structural dissociation. But research without embodiment is just more intellectualization — another way to stay in your head while your body holds the score. So the spiritual thread runs through everything: the Vedantic understanding that trauma is stored energy blocking consciousness flow, the Buddhist recognition that suffering has structure, the somatic truth that the body knows what the mind has forgotten.
                </p>
                <p>
                  {SITE.tagline}
                </p>
              </div>
            </section>

            <div className="gold-rule-thick mb-8" />

            {/* Disclaimer */}
            <section>
              <h2 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                {SITE.disclaimer} The content on this site is for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </p>
            </section>
          </div>
        </div>

        <EmailCapture />
      </main>

      <Footer />
    </div>
  );
}

/*
 * Disclaimer Page — No contact info
 */

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { SITE } from "@/lib/articles";

export default function Disclaimer() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <SEOHead title="Disclaimer" description="Medical and content disclaimer for The Shattered Armor." canonical={`${SITE.domain}/disclaimer`} />
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto article-body">
          <h1 className="text-4xl mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Disclaimer</h1>
          <div className="gold-rule-thick mb-8" />

          <h2>Not Therapy</h2>
          <p>{SITE.disclaimer}</p>
          <p>The content published on {SITE.name} is written for educational and informational purposes. It draws on peer-reviewed research in polyvagal theory, somatic experiencing, Internal Family Systems, and related fields. However, reading about trauma recovery is not the same as receiving professional treatment.</p>

          <h2>No Doctor-Patient Relationship</h2>
          <p>No content on this site creates a therapeutic, medical, or professional relationship between the reader and the author. {SITE.author} is a consciousness teacher and writer, not a licensed therapist or physician. Always consult a qualified healthcare provider before making changes to your treatment plan.</p>

          <h2>Crisis Resources</h2>
          <p>If you are in crisis or experiencing suicidal thoughts, please contact:</p>
          <ul>
            <li><strong>988 Suicide and Crisis Lifeline:</strong> Call or text 988 (US)</li>
            <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
            <li><strong>International Association for Suicide Prevention:</strong> <a href="https://www.iasp.info/resources/Crisis_Centres/" rel="nofollow">Find a crisis center</a></li>
          </ul>

          <h2>External Links & Affiliate Disclosure</h2>
          <p>This site contains links to external websites for reference purposes. Some links are affiliate links, meaning we may earn a small commission at no additional cost to you. We do not control or endorse the content of external sites. Links to research papers, professional organizations, products, and other resources are provided for educational context and reader convenience.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

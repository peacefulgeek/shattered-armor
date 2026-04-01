/*
 * Privacy Policy Page
 * No contact info. Affiliate disclosure included.
 */

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { SITE } from "@/lib/articles";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <SEOHead title="Privacy Policy" description="Privacy policy for The Shattered Armor." canonical={`${SITE.domain}/privacy`} />
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto article-body">
          <h1 className="text-4xl mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Privacy Policy</h1>
          <div className="gold-rule-thick mb-8" />
          <p><strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <h2>Information We Collect</h2>
          <p>{SITE.name} collects minimal information. If you subscribe to our newsletter, we store your email address securely. We use privacy-respecting analytics to understand how readers engage with our content. We do not sell, trade, or rent your personal information to any third party.</p>

          <h2>Cookies</h2>
          <p>This site uses essential cookies for functionality and anonymous analytics cookies to improve the reading experience. No third-party advertising cookies are used. You may manage your cookie preferences through your browser settings.</p>

          <h2>Third-Party Services</h2>
          <p>Images are served via Bunny CDN. Analytics are collected via a privacy-respecting analytics service. No data is shared with advertising networks.</p>

          <h2>Affiliate Disclosure</h2>
          <p>As an Amazon Associate I earn from qualifying purchases.</p>
          <p>This site is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. Some links on this site are affiliate links, meaning we may earn a small commission at no additional cost to you.</p>

          <h2>Your Rights</h2>
          <p>You may request deletion of your email subscription at any time by using the unsubscribe link provided in each message. All data processing is conducted in accordance with applicable privacy regulations.</p>

          <h2>Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. Any changes will be reflected on this page with an updated revision date.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

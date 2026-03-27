/*
 * Privacy Policy Page
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
          <p>{SITE.name} collects minimal information. If you subscribe to our newsletter, we store your email address. We use privacy-respecting analytics to understand how readers engage with our content. We do not sell, trade, or rent your personal information.</p>
          <h2>Cookies</h2>
          <p>This site uses essential cookies for functionality and anonymous analytics cookies to improve the reading experience. No third-party advertising cookies are used.</p>
          <h2>Third-Party Services</h2>
          <p>Images are served via Bunny CDN. Analytics are collected via a self-hosted, privacy-respecting analytics service. No data is shared with advertising networks.</p>
          <h2>Your Rights</h2>
          <p>You may request deletion of your email subscription at any time by contacting us. You may also unsubscribe from any email using the link provided in each message.</p>
          <h2>Contact</h2>
          <p>For privacy-related inquiries, please visit <a href={SITE.authorLink}>{SITE.authorLink}</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

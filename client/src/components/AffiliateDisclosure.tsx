/*
 * Affiliate Disclosure — shown above article body on articles with Amazon links
 */

export default function AffiliateDisclosure() {
  return (
    <div className="mb-6 px-4 py-3 rounded border text-sm"
      style={{
        background: 'oklch(0.96 0.01 80)',
        borderColor: 'oklch(0.88 0.03 80)',
        color: 'oklch(0.35 0.03 80)',
        fontFamily: 'var(--font-sans)',
      }}>
      This article contains affiliate links. We may earn a small commission if you make a purchase — at no extra cost to you.
    </div>
  );
}

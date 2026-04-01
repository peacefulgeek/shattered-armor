/*
 * Author Bio Card — top-right sidebar on all articles
 * Kalesh — mystic and spiritual advisor
 * Image from Bunny CDN, links to kalesh.love
 */

const AUTHOR_IMAGE = "https://shattered-armor.b-cdn.net/images/kalesh-bio.webp";

export default function AuthorBioCard() {
  return (
    <div className="rounded-lg border overflow-hidden"
      style={{
        background: 'oklch(0.97 0.005 80)',
        borderColor: 'oklch(0.88 0.03 80)',
      }}>
      <img
        src={AUTHOR_IMAGE}
        alt="Kalesh — Consciousness Teacher & Writer"
        className="w-full aspect-[4/3] object-cover object-top"
        loading="lazy"
      />
      <div className="p-4">
        <h3 className="text-base font-semibold mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
          Kalesh
        </h3>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          Kalesh is a mystic and spiritual advisor who brings ancient wisdom and depth to life's biggest decisions.
        </p>
        <div className="flex flex-col gap-2">
          <a
            href="https://kalesh.love"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center text-xs font-medium px-3 py-2 rounded no-underline transition-colors"
            style={{
              background: 'oklch(0.45 0.04 80)',
              color: 'oklch(0.97 0.005 80)',
            }}
          >
            Visit Kalesh's Website
          </a>
          <a
            href="https://kalesh.love"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center text-xs font-medium px-3 py-2 rounded border no-underline transition-colors"
            style={{
              borderColor: 'oklch(0.45 0.04 80)',
              color: 'oklch(0.45 0.04 80)',
            }}
          >
            Book a Session
          </a>
        </div>
      </div>
    </div>
  );
}

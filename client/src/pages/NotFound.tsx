/*
 * 404 Page — Branded, teaching content, 6 article links
 * Kintsugi Broadsheet: The armor cracked, but the gold still holds
 */

import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const RECOMMENDED_ARTICLES = [
  { slug: "why-your-nervous-system-is-still-running-a-program-from-childhood", title: "Why Your Nervous System Is Still Running a Program from Childhood" },
  { slug: "polyvagal-theory-and-the-three-states-you-didnt-know-you-were-living-in", title: "Polyvagal Theory and the Three States You Didn't Know You Were Living In" },
  { slug: "the-dorsal-vagal-shutdown-nobody-talks-about", title: "The Dorsal Vagal Shutdown Nobody Talks About" },
  { slug: "neuroception-how-your-body-decides-before-you-do", title: "Neuroception: How Your Body Decides Before You Do" },
  { slug: "what-happens-in-the-brain-during-an-emotional-flashback", title: "What Happens in the Brain During an Emotional Flashback" },
  { slug: "the-autonomic-ladder-and-why-you-keep-falling-off-it", title: "The Autonomic Ladder and Why You Keep Falling Off It" },
];

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-cream)" }}>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16">
        <div className="gold-rule-thick mb-8" />

        <h1
          className="text-6xl md:text-8xl font-bold mb-4"
          style={{ fontFamily: "var(--font-serif)", color: "var(--color-slate)" }}
        >
          404
        </h1>

        <h2
          className="text-2xl md:text-3xl mb-6"
          style={{ fontFamily: "var(--font-serif)", color: "var(--color-slate)" }}
        >
          The page you are looking for does not exist.
        </h2>

        <div className="mb-10" style={{ color: "var(--color-text)" }}>
          <p className="text-lg leading-relaxed mb-4" style={{ fontFamily: "var(--font-sans)" }}>
            Sometimes the path we thought we were on dissolves beneath our feet. The nervous system
            registers this as loss — even when it is just a missing webpage. Notice the micro-frustration.
            That is your threat-detection system doing exactly what it was designed to do: scanning for
            what went wrong.
          </p>
          <p className="text-lg leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
            The page may have been moved, renamed, or removed. But the work continues. Here are six
            articles that might be exactly what your nervous system needs right now.
          </p>
        </div>

        <div className="gold-rule mb-8" />

        <h3
          className="text-xl mb-6 uppercase tracking-wider"
          style={{ fontFamily: "var(--font-sans)", color: "var(--color-slate)", fontWeight: 700 }}
        >
          Start Here Instead
        </h3>

        <ul className="space-y-4 mb-12">
          {RECOMMENDED_ARTICLES.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/${article.slug}`}
                className="text-lg underline decoration-1 underline-offset-4 transition-colors hover:opacity-80"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-slate)",
                  textDecorationColor: "var(--color-gold)",
                }}
              >
                {article.title}
              </Link>
            </li>
          ))}
        </ul>

        <div className="gold-rule mb-8" />

        <Link
          href="/"
          className="inline-block px-8 py-3 text-sm uppercase tracking-widest font-bold text-white transition-colors"
          style={{ background: "var(--color-slate)" }}
        >
          Return to the Front Page
        </Link>

        <div className="gold-rule-thick mt-12" />
      </main>
      <Footer />
    </div>
  );
}

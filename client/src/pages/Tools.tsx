/*
 * Tools We Recommend — Curated product recommendation page
 * 25+ real products across 6 categories
 * Amazon affiliate links with spankyspinola-20 tag
 * ItemList schema, affiliate disclosure
 */

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import { SITE } from "@/lib/articles";
import { Link } from "wouter";

interface Product {
  name: string;
  description: string;
  url: string;
  isAmazon: boolean;
}

interface Category {
  title: string;
  products: Product[];
}

const CATEGORIES: Category[] = [
  {
    title: "Essential Books on Trauma & Recovery",
    products: [
      { name: "The Body Keeps the Score — Bessel van der Kolk", description: "The foundational text on how trauma reshapes the body and brain. If you read one book on this list, make it this one. Van der Kolk draws on decades of clinical research to show why talk therapy alone often falls short.", url: "https://www.amazon.com/dp/0143127748?tag=spankyspinola-20", isAmazon: true },
      { name: "Complex PTSD: From Surviving to Thriving — Pete Walker", description: "The most accessible guide to understanding C-PTSD from the inside. Walker names the four F responses (fight, flight, freeze, fawn) and gives you practical tools for each. This is the book that makes people say 'I finally understand myself.'", url: "https://www.amazon.com/dp/1492871842?tag=spankyspinola-20", isAmazon: true },
      { name: "No Bad Parts — Richard Schwartz", description: "The creator of Internal Family Systems explains why every part of you exists for a reason. This book changed how I think about inner conflict. It is compassionate, clear, and genuinely healing to read.", url: "https://www.amazon.com/dp/1615193820?tag=spankyspinola-20", isAmazon: true },
      { name: "In an Unspoken Voice — Peter Levine", description: "Levine's masterwork on somatic experiencing. He explains how trauma gets trapped in the body and how the body itself holds the key to release. Dense but deeply rewarding.", url: "https://www.amazon.com/dp/1572245964?tag=spankyspinola-20", isAmazon: true },
      { name: "Healing the Fragmented Selves of Trauma Survivors — Janina Fisher", description: "Fisher bridges IFS and somatic approaches in a way that makes structural dissociation finally make sense. Essential for anyone working with parts.", url: "https://www.amazon.com/dp/1462513638?tag=spankyspinola-20", isAmazon: true },
      { name: "The Polyvagal Theory in Therapy — Deb Dana", description: "Deb Dana translates Stephen Porges' polyvagal theory into language you can actually use. Practical exercises, clear frameworks, and a compassionate tone throughout. We reference her work extensively in our articles on nervous system regulation.", url: "https://www.amazon.com/dp/0393710246?tag=spankyspinola-20", isAmazon: true },
      { name: "Waking the Tiger — Peter Levine", description: "The book that started the somatic revolution. Levine shows how animals discharge trauma naturally and why humans get stuck. A shorter, more accessible entry point than In an Unspoken Voice.", url: "https://www.amazon.com/dp/0393707253?tag=spankyspinola-20", isAmazon: true },
      { name: "The Tao of Fully Feeling — Pete Walker", description: "Walker's exploration of grief as a healing force. Less well-known than his C-PTSD book but equally important. This one is about learning to feel again after years of numbness.", url: "https://www.amazon.com/dp/0062316117?tag=spankyspinola-20", isAmazon: true },
    ],
  },
  {
    title: "Journals & Workbooks",
    products: [
      { name: "The Complex PTSD Workbook — Arielle Schwartz", description: "Structured exercises that walk you through the stages of trauma recovery. Schwartz integrates somatic, cognitive, and mindfulness approaches. A practical companion to any of the books above.", url: "https://www.amazon.com/dp/1623174023?tag=spankyspinola-20", isAmazon: true },
      { name: "Polyvagal Exercises for Safety and Connection — Deb Dana", description: "Hands-on exercises for mapping your nervous system states and building regulation capacity. Each exercise is clearly explained with variations for different comfort levels.", url: "https://www.amazon.com/dp/1684038561?tag=spankyspinola-20", isAmazon: true },
      { name: "The DBT Skills Workbook — Matthew McKay", description: "Dialectical behavior therapy skills for distress tolerance, emotional regulation, and interpersonal effectiveness. Structured and evidence-based.", url: "https://www.amazon.com/dp/1683731395?tag=spankyspinola-20", isAmazon: true },
      { name: "Trauma Recovery Journal", description: "A dedicated journaling practice is one of the most effective self-regulation tools available. This guided journal provides prompts specifically designed for trauma processing and nervous system awareness.", url: "https://www.amazon.com/dp/B0BW2LBXWN?tag=spankyspinola-20", isAmazon: true },
    ],
  },
  {
    title: "Body & Nervous System Tools",
    products: [
      { name: "Weighted Blanket — YnM", description: "Deep pressure stimulation activates the parasympathetic nervous system. A weighted blanket is one of the simplest, most effective tools for calming hyperarousal. Choose 10% of your body weight.", url: "https://www.amazon.com/dp/B0009F3QKW?tag=spankyspinola-20", isAmazon: true },
      { name: "Acupressure Mat — ProsourceFit", description: "Thousands of pressure points provide intense somatic grounding. Lying on this for 15-20 minutes can shift you from sympathetic overdrive into ventral vagal. Not comfortable at first — that is the point.", url: "https://www.amazon.com/dp/B07PXJNQFQ?tag=spankyspinola-20", isAmazon: true },
      { name: "Breathing Trainer — Komodo", description: "Resistance breathing builds vagal tone more effectively than unassisted breathwork. This device provides calibrated resistance on both inhale and exhale. We discuss the science behind this in our breathwork articles.", url: "https://www.amazon.com/dp/B0BXM2JWCN?tag=spankyspinola-20", isAmazon: true },
      { name: "Meditation Cushion — Florensi", description: "A dedicated meditation space signals safety to your nervous system. This buckwheat-filled zafu provides proper alignment for extended sitting practice.", url: "https://www.amazon.com/dp/B08DFLBKH7?tag=spankyspinola-20", isAmazon: true },
      { name: "Yoga Mat — Gaiam", description: "Movement practices are central to somatic healing. A quality mat with good grip and cushioning supports everything from gentle yoga to trauma-sensitive movement.", url: "https://www.amazon.com/dp/B074WDJNH3?tag=spankyspinola-20", isAmazon: true },
    ],
  },
  {
    title: "Supplements & Wellness",
    products: [
      { name: "Magnesium Glycinate — NOW Supplements", description: "Magnesium supports GABA production and nervous system regulation. Glycinate is the most bioavailable form and least likely to cause digestive issues. Many trauma survivors are chronically deficient.", url: "https://www.amazon.com/dp/B003LHRLNC?tag=spankyspinola-20", isAmazon: true },
      { name: "Essential Oil Diffuser — ASAKUKI", description: "Olfactory grounding bypasses the cognitive brain and speaks directly to the limbic system. Lavender, frankincense, and vetiver are particularly effective for nervous system regulation.", url: "https://www.amazon.com/dp/B07N1WQ6RB?tag=spankyspinola-20", isAmazon: true },
      { name: "Light Therapy Lamp — Verilux", description: "Circadian rhythm disruption is common in trauma survivors. A 10,000 lux light therapy lamp used for 20-30 minutes each morning can help reset your body's internal clock and improve sleep quality.", url: "https://www.amazon.com/dp/B0CXKFHB3X?tag=spankyspinola-20", isAmazon: true },
    ],
  },
  {
    title: "Tracking & Biofeedback",
    products: [
      { name: "Fitbit Sense — Heart Rate Variability Tracker", description: "HRV is one of the most reliable biomarkers for nervous system regulation. Tracking it over time gives you objective data on your recovery progress. The Sense measures HRV during sleep and provides trends.", url: "https://www.amazon.com/dp/B08DFPC99M?tag=spankyspinola-20", isAmazon: true },
      { name: "Noise-Canceling Headphones — Sony WH-1000XM5", description: "Sensory overwhelm is a hallmark of C-PTSD. Quality noise-canceling headphones create an instant safe auditory environment. Essential for anyone with hypervigilance or sound sensitivity.", url: "https://www.amazon.com/dp/B09JNK8Y6L?tag=spankyspinola-20", isAmazon: true },
    ],
  },
  {
    title: "Apps & Digital Resources",
    products: [
      { name: "Insight Timer", description: "The largest free meditation app with thousands of guided practices specifically for trauma recovery, nervous system regulation, and somatic awareness. No subscription required for core features.", url: "https://insighttimer.com", isAmazon: false },
      { name: "Calm", description: "Guided meditations, sleep stories, and breathing exercises. The body scan and progressive relaxation features are particularly useful for somatic grounding.", url: "https://www.calm.com", isAmazon: false },
      { name: "Wim Hof Method App", description: "Structured breathwork and cold exposure protocols that directly engage the autonomic nervous system. The guided breathing sessions are excellent for building vagal tone.", url: "https://www.wimhofmethod.com/app", isAmazon: false },
      { name: "Psychology Today Therapist Directory", description: "The most comprehensive directory for finding trauma-informed therapists. Filter by specialty (EMDR, somatic experiencing, IFS) and insurance. The single most important resource on this page.", url: "https://www.psychologytoday.com/us/therapists", isAmazon: false },
    ],
  },
];

const allProducts = CATEGORIES.flatMap(c => c.products);
const amazonCount = allProducts.filter(p => p.isAmazon).length;
const nonAmazonCount = allProducts.filter(p => !p.isAmazon).length;

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Healing Tools & Resources We Recommend",
  description: "Curated list of the best books, tools, apps, and resources for C-PTSD recovery and nervous system healing.",
  numberOfItems: allProducts.length,
  itemListElement: allProducts.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: p.name,
    url: p.url,
  })),
};

export default function Tools() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <SEOHead
        title="Best C-PTSD Recovery Tools & Resources We Recommend"
        description={`Curated list of the best books, tools, apps, and resources for C-PTSD recovery and nervous system healing. Personally vetted recommendations from ${SITE.author}.`}
        canonical={`${SITE.domain}/tools`}
        jsonLd={itemListSchema}
      />
      <Header />

      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            Healing Tools & Resources We Recommend
          </h1>
          <div className="gold-rule-thick mb-6" />

          <AffiliateDisclosure />

          <div className="mb-10 article-body">
            <p>
              These are the tools, books, and resources I actually trust. Every recommendation here has been chosen because it serves the work this site is about — understanding how trauma lives in the nervous system and learning to work with it rather than against it. Nothing on this list is here because someone paid for placement. These are the things I return to, the books I keep lending out, the tools that have made a measurable difference.
            </p>
            <p>
              Some links below are Amazon affiliate links. If you purchase through them, we earn a small commission at no extra cost to you. That support helps keep this site running and free for everyone.
            </p>
          </div>

          {CATEGORIES.map((cat, catIdx) => (
            <section key={catIdx} className="mb-12">
              <h2 className="text-2xl mb-6" style={{ fontFamily: 'var(--font-serif)' }}>{cat.title}</h2>
              <div className="gold-rule mb-6" />
              <div className="grid gap-4">
                {cat.products.map((product, prodIdx) => (
                  <div key={prodIdx} className="p-5 rounded-lg border" style={{ background: 'oklch(0.97 0.005 80)', borderColor: 'oklch(0.90 0.02 80)' }}>
                    <h3 className="text-lg mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                      <a href={product.url} target="_blank" rel={product.isAmazon ? "noopener" : "noopener noreferrer"} className="underline decoration-gold underline-offset-2 hover:text-foreground transition-colors">
                        {product.name}
                      </a>
                      {product.isAmazon && <span className="text-xs text-muted-foreground ml-2">(paid link)</span>}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Internal links to articles */}
          <section className="mb-12 p-6 rounded-lg" style={{ background: 'oklch(0.96 0.01 80)' }}>
            <h2 className="text-xl mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Continue Your Journey</h2>
            <p className="text-sm text-muted-foreground mb-4">These articles explore the science behind many of the tools recommended above:</p>
            <ul className="space-y-2">
              <li><Link href="/article/polyvagal-theory-and-the-three-states-you-didnt-know-you-were-living-in" className="text-sm underline decoration-gold underline-offset-2">Polyvagal Theory and the Three States You Didn't Know You Were Living In</Link></li>
              <li><Link href="/article/completing-the-stress-response-cycle" className="text-sm underline decoration-gold underline-offset-2">Completing the Stress Response Cycle</Link></li>
              <li><Link href="/article/why-movement-matters-more-than-meditation-for-some-survivors" className="text-sm underline decoration-gold underline-offset-2">Why Movement Matters More Than Meditation for Some Survivors</Link></li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

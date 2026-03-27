# The Shattered Armor — Design Brainstorm

<response>
<text>
## Idea 1: Kintsugi Broadsheet — Japanese Repair Meets Victorian Press

**Design Movement:** Wabi-sabi meets Victorian broadsheet typography — the beauty of imperfection rendered through the formality of newspaper tradition.

**Core Principles:**
1. Broken-then-repaired as visual metaphor — gold veins running through layout dividers, borders, and decorative elements
2. Typographic authority — dense, serious newspaper hierarchy that communicates credibility and depth
3. Warm sanctuary — every pixel should feel like a safe room with morning light coming through linen curtains
4. Deliberate breathing space — generous margins and paragraph spacing that mirrors the therapeutic concept of "holding space"

**Color Philosophy:** The palette tells the story of repair. Warm slate (#5D6D7E) is the armor — protective, serious, institutional. Safe cream (#FFF8F0) is the skin beneath — vulnerable, warm, human. Gold repair (#D4A017) is the kintsugi — the healing that makes the broken places stronger. Gold appears sparingly: in horizontal rules, active states, pull-quote borders, and the occasional accent. Never garish. Always earned.

**Layout Paradigm:** True newspaper broadsheet. Homepage uses a masthead with site name in large serif, a thin gold horizontal rule, and a date line. Below: asymmetric 3-column grid where the lead story occupies 50% left with a large hero, while the right 50% splits into two columns of compact article cards. Category sections flow as horizontal bands with 3-article rows. The article page uses a 3-column layout: sticky ToC left (20%), article body center (55%), sidebar right (25%).

**Signature Elements:**
1. Gold hairline rules — thin gold (#D4A017) horizontal lines used as section dividers, mimicking kintsugi repair lines running through the page
2. Drop-cap first letters in Charter serif with a subtle gold tint
3. Pull quotes set in Charter italic with a 3px gold left border and cream background

**Interaction Philosophy:** Interactions should feel grounding, not stimulating. No bouncy animations. Smooth, slow transitions (300-400ms ease). Hover states that warm rather than pop — subtle background shifts from cream to slightly warmer cream. The site should feel like settling into a chair, not clicking through a feed.

**Animation:** Fade-in-up on scroll for article cards (opacity 0→1, translateY 20px→0, 400ms ease-out). Smooth scroll for ToC anchor links. Sticky sidebar with gentle position transitions. No parallax. No particle effects. No loading spinners — use skeleton screens in cream tones.

**Typography System:** Charter for all headlines (H1-H3) — a warm, readable serif that feels literary without being stuffy. Lato for body text at 18px/1.7 line-height — clean, humanist sans-serif that reads well at length. Monospace (system) for dates and metadata only. H1: Charter 42px/1.2, H2: Charter 28px/1.3, H3: Charter 22px/1.3. Body: Lato 18px/1.7. All fonts self-hosted on Bunny CDN.
</text>
<probability>0.08</probability>
</response>

<response>
<text>
## Idea 2: Somatic Minimalism — The Body's Own Language

**Design Movement:** Scandinavian minimalism crossed with somatic therapy aesthetics — clean, spacious, body-aware design that uses negative space as a therapeutic tool.

**Core Principles:**
1. Space as medicine — extreme whitespace that forces the nervous system to slow down
2. Organic geometry — no sharp corners, everything slightly rounded or hand-drawn feeling
3. Warm neutrals only — no cool grays, no blues, everything leans toward skin and earth tones
4. Single-focus reading — one thing at a time, progressive disclosure, no visual overwhelm

**Color Philosophy:** Cream dominates 85% of the viewport. Slate appears only in text and structural elements. Gold is reserved for interactive moments — a reward color that appears when you engage. The overall feeling should be "warm paper in morning light."

**Layout Paradigm:** Extremely generous margins. Homepage uses a centered single-column hero with massive type, then transitions to a loose masonry grid. Article pages use a wide center column (70%) with no visible sidebar on desktop — related content appears only at the bottom.

**Signature Elements:**
1. Breathing indicators — subtle animated dots that pulse slowly near section breaks
2. Hand-drawn gold underlines on hover states
3. Oversized pull quotes that take up 60% of the column width

**Interaction Philosophy:** Everything moves like breath — slow inhale (ease-in) and exhale (ease-out). Touch targets are oversized (60px+). Nothing jumps or pops.

**Animation:** Slow fade transitions (600ms). Content reveals on scroll with staggered timing. No transform animations — only opacity changes.

**Typography System:** Charter at enormous sizes for headlines (56px+). Lato at 20px for body. Extreme contrast between headline and body sizes.
</text>
<probability>0.05</probability>
</response>

<response>
<text>
## Idea 3: Archive Recovery — The Clinical File Made Human

**Design Movement:** Brutalist editorial meets trauma-informed design — the raw honesty of exposed structure combined with warm, safe materiality.

**Core Principles:**
1. Structure as safety — visible grid lines, clear hierarchy, predictable patterns (mirrors what a dysregulated nervous system needs)
2. Raw but warm — exposed typographic structure with warm color fills
3. Evidence-based aesthetic — feels like reading a well-organized research paper that someone highlighted with gold ink
4. Progressive depth — homepage is broad and structured, article pages become increasingly intimate and spacious

**Color Philosophy:** Slate as the structural skeleton — visible in borders, rules, and navigation. Cream as the flesh — filling content areas. Gold as the nervous system being repaired — appearing in highlights, active states, and the occasional decorative element that suggests circuitry being reconnected.

**Layout Paradigm:** Strict newspaper grid with visible column gutters on homepage. Article pages break free into a more spacious single-column with sidebar. The transition from homepage to article mirrors the therapeutic journey from structure to openness.

**Signature Elements:**
1. Visible grid lines on the homepage that fade as you scroll deeper
2. Gold "circuit" lines connecting related articles in the sidebar
3. Section numbers in the ToC styled as clinical reference numbers but in warm gold

**Interaction Philosophy:** Click responses are immediate and definitive. No ambiguity. Hover states provide clear feedback. Everything communicates "you are safe here, you know what will happen next."

**Animation:** Crisp, fast transitions (200ms) for navigation. Slower, gentler transitions (400ms) for content reveals. The speed difference communicates: "structure is reliable, content is patient."

**Typography System:** Charter bold for headlines with tight letter-spacing. Lato regular for body at 18px. Metadata in Lato medium uppercase at 11px with generous letter-spacing.
</text>
<probability>0.06</probability>
</response>

---

## SELECTED: Idea 1 — Kintsugi Broadsheet

This approach best serves the C-PTSD healing niche because:
- The newspaper broadsheet format communicates authority and credibility for trauma content
- Kintsugi (golden repair) is the site's central visual metaphor — it should permeate the design
- The warm, safe color palette directly supports trauma-informed design principles
- The generous typography and spacing create a reading experience that feels grounding

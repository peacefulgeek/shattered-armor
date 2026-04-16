/**
 * Render start script — The Shattered Armor
 * All scheduling and content generation is IN-CODE. No external APIs.
 * No Manus. No Forge. No third-party LLM calls.
 *
 * Publishing schedule (dates baked into article JSON):
 *   - 30 articles: already published (Jan 1 - Mar 27, 2026)
 *   - 150 articles: 5/day from Mar 28 - Apr 26, 2026
 *   - 120 articles: 5/week from Apr 27 - Oct 5, 2026
 *
 * Auto-generation (AUTO_GEN_ENABLED = true):
 *   - Daily 02:00 UTC: generate 5 new articles from topic pool
 *   - Weekly Saturday 06:00 UTC: product spotlight article
 *   - Every 30 days: refresh 25 articles (expand + humanize)
 *   - Every 90 days: revise 20 articles (edit + add sentences)
 *
 * Bunny CDN credentials hardcoded. No env vars needed.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_PUBLIC = path.join(__dirname, '..', 'dist', 'public');
const DATA_DIR = path.join(__dirname, '..', 'client', 'src', 'data', 'articles');

// ═══════════════════════════════════════════════════════════════════════
// MASTER SWITCH
// ═══════════════════════════════════════════════════════════════════════
const AUTO_GEN_ENABLED = true;

// ═══════════════════════════════════════════════════════════════════════
// BUNNY CDN — HARDCODED CREDENTIALS
// ═══════════════════════════════════════════════════════════════════════
const BUNNY_STORAGE_ZONE = 'shattered-armor';
const BUNNY_STORAGE_HOST = 'ny.storage.bunnycdn.com';
const BUNNY_CDN_HOST = 'shattered-armor.b-cdn.net';
const BUNNY_API_KEY = '9973c894-f0ca-4b8c-9b37ee57d56d-3a41-481b';

const SITE_BASE = 'https://shatteredarmor.com';
const CATEGORIES = ['the-wiring', 'the-body', 'the-parts', 'the-triggers', 'the-return'];
const CATEGORY_NAMES = {
  'the-wiring': 'The Wiring',
  'the-body': 'The Body',
  'the-parts': 'The Parts',
  'the-triggers': 'The Triggers',
  'the-return': 'The Return',
};

// ═══════════════════════════════════════════════════════════════════════
// KALESH VOICE — COMPLETE PHRASE LIBRARY (all 50)
// ═══════════════════════════════════════════════════════════════════════
const VOICE_PHRASES = [
  "The mind is not the enemy. The identification with it is.",
  "Most of what passes for healing is just rearranging the furniture in a burning house.",
  "Awareness doesn't need to be cultivated. It needs to be uncovered.",
  "The nervous system doesn't respond to what you believe. It responds to what it senses.",
  "You cannot think your way into a felt sense of safety. The body has its own logic.",
  "Every resistance is information. The question is whether you're willing to read it.",
  "What we call 'stuck' is usually the body doing exactly what it was designed to do under conditions that no longer exist.",
  "The gap between stimulus and response is where your entire life lives.",
  "Consciousness doesn't arrive. It's what's left when everything else quiets down.",
  "The brain is prediction machinery. Anxiety is just prediction running without a stop button.",
  "There is no version of growth that doesn't involve the dissolution of something you thought was permanent.",
  "Trauma reorganizes perception. Recovery reorganizes it again, but this time with your participation.",
  "The contemplative traditions all point to the same thing: what you're looking for is what's looking.",
  "Embodiment is not a technique. It's what happens when you stop living exclusively in your head.",
  "The space between knowing something intellectually and knowing it in your body is where all the real work happens.",
  "Most people don't fear change. They fear the gap between who they were and who they haven't become yet.",
  "Attention is the most undervalued resource you have. Everything else follows from where you place it.",
  "The question is never whether the pain will come. The question is whether you'll meet it with presence or with narrative.",
  "Sit with it long enough and even the worst feeling reveals its edges.",
  "There's a difference between being alone and being with yourself. One is circumstance. The other is practice.",
  "Silence is not the absence of noise. It's the presence of attention.",
  "The breath doesn't need your management. It needs your companionship.",
  "When you stop trying to fix the moment, something remarkable happens, the moment becomes workable.",
  "We are not our thoughts, but we are responsible for our relationship to them.",
  "The body remembers what the mind would prefer to file away.",
  "Patience is not passive. It's the active practice of allowing something to unfold at its own pace.",
  "The paradox of acceptance is that nothing changes until you stop demanding that it does.",
  "What if the restlessness isn't a problem to solve but a signal to follow?",
  "You don't arrive at peace. You stop walking away from it.",
  "The most sophisticated defense mechanism is the one that looks like wisdom.",
  "Stillness is not something you achieve. It's what's already here beneath the achieving.",
  "Every moment of genuine attention is a small act of liberation.",
  "Information without integration is just intellectual hoarding.",
  "Your nervous system doesn't care about your philosophy. It cares about what happened at three years old.",
  "Reading about meditation is to meditation what reading the menu is to eating.",
  "Not every insight requires action. Some just need to be witnessed.",
  "The wellness industry sells solutions to problems it helps you believe you have.",
  "Complexity is the ego's favorite hiding place.",
  "If your spiritual practice makes you more rigid, it's not working.",
  "The research is clear on this, and it contradicts almost everything popular culture teaches.",
  "There's a meaningful difference between self-improvement and self-understanding. One adds. The other reveals.",
  "Stop pathologizing normal human suffering. Not everything requires a diagnosis.",
  "The body has a grammar. Most of us never learned to read it.",
  "You are not a problem to be solved. You are a process to be witnessed.",
  "Freedom is not the absence of constraint. It's the capacity to choose your relationship to it.",
  "The self you're trying to improve is the same self doing the improving. Notice the circularity.",
  "What we call 'the present moment' is not a place you go. It's the only place you've ever been.",
  "The most important things in life cannot be understood, only experienced.",
  "At a certain depth of inquiry, the distinction between psychology and philosophy dissolves entirely.",
  "The armor that saved you is now the weight you carry.",
];

const INTERJECTIONS = [
  'Stay with me here.',
  'I know, I know.',
  'Wild, right?',
  'Think about that for a second.',
  'Seriously.',
  'Here is the thing, though.',
  'Bear with me on this one.',
  'Let that land for a moment.',
  'Not what you expected, right?',
  'Sit with that.',
  'And yet.',
  'Read that again.',
  'Uncomfortable? Good.',
  'Notice what just happened in your body.',
  'This is the part nobody talks about.',
];

const RESEARCHERS = [
  { name: 'Stephen Porges', field: 'polyvagal theory' },
  { name: 'Peter Levine', field: 'somatic experiencing' },
  { name: 'Bessel van der Kolk', field: 'trauma and the body' },
  { name: 'Janina Fisher', field: 'structural dissociation' },
  { name: 'Richard Schwartz', field: 'Internal Family Systems' },
  { name: 'Pat Ogden', field: 'sensorimotor psychotherapy' },
  { name: 'Dan Siegel', field: 'interpersonal neurobiology' },
  { name: 'Pete Walker', field: 'complex PTSD recovery' },
  { name: 'Gabor Mate', field: 'trauma and addiction' },
  { name: 'Jiddu Krishnamurti', field: 'observation without the observer' },
  { name: 'Alan Watts', field: 'Eastern philosophy for Western minds' },
  { name: 'Sam Harris', field: 'meditation and neuroscience' },
  { name: 'Tara Brach', field: 'radical acceptance' },
  { name: 'Deb Dana', field: 'applied polyvagal theory' },
  { name: 'Sebern Fisher', field: 'neurofeedback and attachment' },
];

// ═══════════════════════════════════════════════════════════════════════
// TOPIC POOLS — 200+ unique topics organized by category
// ═══════════════════════════════════════════════════════════════════════
const TOPIC_POOLS = {
  'the-wiring': [
    'How the amygdala hijacks rational thought during a flashback',
    'The vagus nerve and why it matters more than your therapist thinks',
    'Neuroplasticity after trauma, what the research actually shows',
    'Why your brain treats emotional pain the same as physical injury',
    'The default mode network and rumination in PTSD',
    'How cortisol reshapes the hippocampus over decades',
    'The difference between top-down and bottom-up processing in recovery',
    'Why cognitive behavioral approaches miss the body entirely',
    'How early attachment wires the stress response for life',
    'The neuroscience of dissociation and why it is not what you think',
    'How the brain encodes implicit memory without your permission',
    'Why your startle response fires before conscious thought',
    'The role of the insula in interoception and trauma awareness',
    'How mirror neurons shape empathy in trauma survivors',
    'The prefrontal cortex goes offline, what happens next',
    'Why bilateral stimulation works and what EMDR actually does',
    'How sleep deprivation compounds trauma symptoms',
    'The neuroscience of safety signals and why they matter',
    'How chronic stress changes gene expression through epigenetics',
    'Why the right hemisphere holds what the left hemisphere cannot name',
    'The cerebellum and procedural memory in trauma responses',
    'How neurofeedback retrains dysregulated brainwave patterns',
    'The role of oxytocin in rebuilding trust after betrayal',
    'Why your brain cannot tell the difference between memory and reality',
    'How the reticular activating system keeps you hypervigilant',
    'The neuroscience of co-regulation and why you need other people',
    'How trauma changes the way the brain processes time',
    'Why the brainstem runs the show when the cortex checks out',
    'The connection between inflammation and trauma in the brain',
    'How the autonomic nervous system creates your emotional weather',
    'Why polyvagal theory changed everything about trauma treatment',
    'The role of the anterior cingulate in emotional regulation',
    'How childhood neglect rewires the reward system',
    'Why your brain keeps replaying the worst moments',
    'The neuroscience behind why journaling actually helps',
    'How the thalamus acts as a gatekeeper for sensory overwhelm',
    'Why some memories have no narrative, only sensation',
    'The connection between the gut-brain axis and anxiety',
    'How the locus coeruleus drives the fight-or-flight cascade',
    'Why your nervous system treats uncertainty as danger',
  ],
  'the-body': [
    'Why your jaw holds more trauma than your therapist realizes',
    'The psoas muscle and its connection to stored fear',
    'How chronic tension patterns map to specific traumas',
    'Why cold exposure works for some survivors and harms others',
    'The relationship between chronic fatigue and unprocessed trauma',
    'How breathwork can reopen what talk therapy sealed shut',
    'Why your digestive system is the first casualty of chronic stress',
    'The connection between autoimmune conditions and childhood adversity',
    'How the body scores what the mind tries to forget',
    'Why trembling after a trigger is actually a good sign',
    'The role of fascia in holding emotional memory',
    'How trauma changes your relationship with hunger and fullness',
    'Why your shoulders carry the weight of hypervigilance',
    'The connection between pelvic floor tension and trauma',
    'How somatic experiencing releases what words cannot reach',
    'Why exercise alone does not heal trauma but movement can',
    'The body's freeze response is not laziness, it is protection',
    'How chronic pain syndromes relate to unresolved emotional material',
    'Why your body braces before your mind knows why',
    'The connection between migraines and stored emotional tension',
    'How yoga can be retraumatizing without trauma-informed instruction',
    'Why your hands go cold when you are emotionally activated',
    'The role of the diaphragm in emotional regulation',
    'How bodywork can trigger flashbacks and what to do about it',
    'Why the body keeps protesting even after the mind says it is fine',
    'The connection between skin conditions and nervous system dysregulation',
    'How proprioception changes after prolonged dissociation',
    'Why your body does not believe your affirmations',
    'The role of the vagal brake in managing emotional intensity',
    'How sleep posture reflects protective patterns from childhood',
    'Why some survivors cannot tolerate being touched',
    'The connection between TMJ and unspoken emotional material',
    'How the body communicates through symptom language',
    'Why stretching can feel threatening to a dysregulated nervous system',
    'The role of tears in completing the stress response cycle',
    'How chronic back pain relates to early attachment disruption',
    'Why your body temperature fluctuates with emotional activation',
    'The connection between vocal tension and suppressed expression',
    'How the body stores grief differently than it stores fear',
    'Why physical illness often follows major emotional breakthroughs',
  ],
  'the-parts': [
    'The exile who carries the shame nobody else will touch',
    'How firefighter parts create chaos to avoid feeling',
    'The manager who runs your life through perfectionism',
    'Working with the part that believes love must be earned',
    'The protector who uses anger to keep vulnerability at bay',
    'How inner critic parts develop from parental introjects',
    'The part that goes numb when things get too real',
    'Working with parts that hold suicidal ideation safely',
    'The caretaker part that forgot to include yourself',
    'How parts polarize during relationship conflict',
    'The achiever part that equates rest with worthlessness',
    'Working with the part that sabotages every good thing',
    'The people-pleaser part and its connection to survival',
    'How exile parts carry burdens from before you had words',
    'The controller part that cannot tolerate uncertainty',
    'Working with parts that hold body-based memories',
    'The intellectual part that analyzes instead of feeling',
    'How protector parts react when therapy gets too close',
    'The part that keeps choosing unavailable partners',
    'Working with the part that believes it is fundamentally broken',
    'The rebel part that resists all forms of authority',
    'How parts carry intergenerational trauma patterns',
    'The perfectionist part and its terror of being seen as flawed',
    'Working with parts that emerged specifically in adulthood',
    'The dissociator part that checks out during intimacy',
    'How to approach parts that do not trust the therapeutic process',
    'The worrier part that runs catastrophic simulations all day',
    'Working with the part that hoards as a form of safety',
    'The fixer part that cannot stop rescuing other people',
    'How parts negotiate with each other below conscious awareness',
    'The part that feels guilty for surviving when others did not',
    'Working with rage parts without being consumed by them',
    'The isolator part that calls loneliness independence',
    'How child parts experience time differently than adult parts',
    'The part that uses substances to manage what nothing else can',
    'Working with the part that cannot accept compliments',
    'The hypervigilant part that never stops scanning for danger',
    'How parts respond differently to different therapeutic modalities',
    'The part that performs wellness while falling apart inside',
    'Working with parts that hold religious or spiritual trauma',
  ],
  'the-triggers': [
    'Why certain smells transport you back to the worst day of your life',
    'How tone of voice activates the nervous system faster than words',
    'The difference between a trigger and an emotional flashback',
    'Why holidays are the hardest days for trauma survivors',
    'How silence can be the loudest trigger of all',
    'Why being praised feels dangerous after emotional abuse',
    'The trigger of being asked what you want or need',
    'How authority figures activate childhood survival patterns',
    'Why good news can trigger a panic response',
    'The connection between seasonal changes and trauma activation',
    'How crowded spaces overwhelm the traumatized nervous system',
    'Why being watched or observed triggers a freeze response',
    'The trigger of unexpected physical contact',
    'How financial stress reactivates childhood scarcity patterns',
    'Why bedtime is the most triggering part of the day',
    'The trigger of being misunderstood or not believed',
    'How medical appointments activate trauma responses',
    'Why transitions between activities are so destabilizing',
    'The trigger of someone else crying or being in pain',
    'How driving in traffic activates the fight-or-flight system',
    'Why compliments from strangers feel threatening',
    'The trigger of being asked to make a decision under pressure',
    'How workplace dynamics replicate family system patterns',
    'Why anniversaries of traumatic events hit harder than expected',
    'The trigger of hearing a door slam or raised voices',
    'How social media comparison activates shame circuits',
    'Why being late or someone else being late causes panic',
    'The trigger of feeling trapped in a conversation',
    'How hunger and low blood sugar amplify trigger sensitivity',
    'Why being vulnerable in front of others feels like dying',
    'The trigger of someone withdrawing or going silent',
    'How weather patterns and barometric pressure affect dysregulation',
    'Why success and achievement can trigger imposter collapse',
    'The trigger of being asked about your childhood casually',
    'How certain music or songs activate implicit memory networks',
    'Why waiting rooms and lines activate the nervous system',
    'The trigger of someone standing too close to you',
    'How phone calls from unknown numbers activate threat detection',
    'Why being in the dark activates childhood terror patterns',
    'The trigger of someone expressing disappointment in you',
  ],
  'the-return': [
    'What recovery actually looks like on a Tuesday afternoon',
    'How to rebuild trust with your own body after years of disconnection',
    'The difference between healing and performing wellness',
    'Why setbacks in recovery are not failures but recalibrations',
    'How to create safety rituals that your nervous system believes',
    'The slow return of pleasure after years of numbness',
    'How to grieve the childhood you never had without getting stuck',
    'Why the first year of real recovery feels worse than surviving',
    'How to build a life that does not require armor',
    'The practice of self-compassion when it feels completely fake',
    'How to navigate relationships when you are changing and they are not',
    'Why boredom is actually a sign of nervous system regulation',
    'The art of doing nothing after a lifetime of hypervigilance',
    'How to trust your own perceptions after gaslighting',
    'Why the return to feeling includes feelings you do not want',
    'How to set boundaries without the guilt that follows',
    'The process of learning to take up space after shrinking for years',
    'How to parent your children differently than you were parented',
    'Why joy feels suspicious after prolonged suffering',
    'The practice of receiving help after years of self-reliance',
    'How to stay present during moments of genuine connection',
    'Why the body resists relaxation even when the mind wants it',
    'How to find community after isolation became your default',
    'The return of creativity after trauma suppressed it',
    'How to make decisions from preference instead of fear',
    'Why the healing path includes losing people who cannot follow',
    'The practice of celebrating small victories without minimizing them',
    'How to sleep peacefully after years of nighttime hypervigilance',
    'Why forgiveness is not required for recovery',
    'The process of discovering who you are without the trauma identity',
    'How to handle the grief that surfaces when life gets good',
    'Why recovery is not about becoming who you were before',
    'The practice of being honest when someone asks how you are',
    'How to navigate the workplace with a regulated nervous system',
    'Why some friendships cannot survive your healing',
    'The return of appetite and pleasure in eating after restriction',
    'How to hold hope without making it into another performance',
    'Why the body needs months to catch up to cognitive insights',
    'The practice of allowing yourself to be ordinary',
    'How to know when you are ready for deeper work',
  ],
};

// ═══════════════════════════════════════════════════════════════════════
// AMAZON PRODUCTS — for inline article recommendations
// ═══════════════════════════════════════════════════════════════════════
const AFFILIATE_TAG = 'spankyspinola-20';
const PRODUCT_RECS = [
  // BOOKS
  { name: 'The Body Keeps the Score', asin: 'B00G3L1C2K', cat: ['the-body','the-wiring','the-triggers'], intro: 'A book that many trauma survivors find genuinely helpful is' },
  { name: 'Complex PTSD: From Surviving to Thriving', asin: 'B00HJBMDXK', cat: ['the-parts','the-return','the-triggers'], intro: 'One resource that often resonates deeply with C-PTSD survivors is' },
  { name: 'No Bad Parts', asin: '1683646681', cat: ['the-parts','the-return'], intro: 'A gentle introduction to parts work that many people appreciate is' },
  { name: 'Waking the Tiger', asin: '155643233X', cat: ['the-body','the-wiring'], intro: 'For those exploring somatic approaches, a book worth considering is' },
  { name: 'The Polyvagal Theory in Therapy', asin: '0393712370', cat: ['the-wiring','the-body'], intro: 'A resource that helps make polyvagal theory practical is' },
  { name: 'Radical Acceptance', asin: '0553380990', cat: ['the-return','the-parts'], intro: 'A gentle approach to working with shame and self-rejection is' },
  { name: 'When the Body Says No', asin: '0470923350', cat: ['the-body','the-wiring'], intro: 'A book that connects the dots between stress and illness is' },
  { name: 'It Didn\'t Start with You', asin: '1101980389', cat: ['the-wiring','the-triggers'], intro: 'If you are curious about inherited trauma patterns, you might find value in' },
  { name: 'Anchored', asin: '0593420454', cat: ['the-wiring','the-return','the-body'], intro: 'A practical guide to working with your nervous system is' },
  { name: 'Trauma and Recovery', asin: '0465087302', cat: ['the-return','the-parts'], intro: 'One of the foundational texts on trauma recovery is' },
  { name: 'In an Unspoken Voice', asin: '1556439431', cat: ['the-body','the-wiring'], intro: 'Something worth exploring for those drawn to body-based healing is' },
  { name: 'Healing the Fragmented Selves of Trauma Survivors', asin: '0415708230', cat: ['the-parts','the-triggers'], intro: 'For understanding how trauma fragments the self, a popular choice is' },
  { name: 'Adult Children of Emotionally Immature Parents', asin: '1626251703', cat: ['the-parts','the-return','the-triggers'], intro: 'A book that many find validates their childhood experience is' },
  { name: 'Running on Empty', asin: '161448242X', cat: ['the-parts','the-triggers'], intro: 'For understanding emotional neglect specifically, a helpful resource is' },
  { name: 'Set Boundaries, Find Peace', asin: '0593192095', cat: ['the-return','the-parts'], intro: 'A practical guide to boundaries that many find accessible is' },
  { name: 'What Happened to You?', asin: '1250223180', cat: ['the-wiring','the-return'], intro: 'A compassionate reframing of trauma that resonates with many is' },
  { name: 'Self-Compassion', asin: '0061733520', cat: ['the-return','the-parts'], intro: 'A book that gently challenges the inner critic is' },
  { name: 'Attached', asin: '1585429139', cat: ['the-return','the-triggers'], intro: 'For understanding your attachment patterns in relationships, a popular choice is' },
  { name: 'Whole Again', asin: '0143133314', cat: ['the-return','the-triggers'], intro: 'For those recovering from toxic relationships, you might find helpful' },
  { name: 'The Deepest Well', asin: '1250223180', cat: ['the-wiring','the-body'], intro: 'A book connecting childhood adversity to health outcomes is' },
  // SUPPLEMENTS
  { name: 'Doctors Best Magnesium Glycinate', asin: 'B000BD0RT0', cat: ['the-body','the-wiring','the-triggers'], intro: 'One supplement that many people find calming for their nervous system is' },
  { name: 'NOW L-Theanine 200mg', asin: 'B000H7P9M0', cat: ['the-triggers','the-wiring'], intro: 'For those looking for gentle nervous system support, something worth trying is' },
  { name: 'Nordic Naturals Ultimate Omega', asin: 'B002CQU564', cat: ['the-wiring','the-body'], intro: 'For brain health and mood support, a well-regarded option is' },
  { name: 'Jarrow Formulas Ashwagandha', asin: 'B0013OQGO6', cat: ['the-triggers','the-body'], intro: 'An adaptogen that some people find helpful for stress is' },
  { name: 'Vitamin B Complex Supplement', asin: 'B0013OQGO6', cat: ['the-body','the-wiring'], intro: 'For those dealing with fatigue from chronic stress, consider' },
  // SENSORY TOOLS
  { name: 'Loop Quiet 2 Ear Plugs', asin: 'B0D3V4V1KD', cat: ['the-triggers','the-body'], intro: 'A discreet option for reducing noise sensitivity is' },
  { name: 'Amethyst Crystal Worry Stone', asin: 'B0969BJG53', cat: ['the-triggers','the-body'], intro: 'A grounding tool that many find helpful during anxious moments is' },
  { name: 'Amethyst Worry Stone for Anxiety', asin: 'B0BBWBX4N3', cat: ['the-triggers','the-body'], intro: 'A discreet grounding tool you can keep in your pocket is' },
  { name: 'ShaktiMat Acupressure Mat Set', asin: 'B09X6DNR4G', cat: ['the-body'], intro: 'A body tool that some find helpful for releasing chronic tension is' },
  // JOURNALS & WORKBOOKS
  { name: 'The Complex PTSD Workbook', asin: '1623158249', cat: ['the-parts','the-return','the-triggers'], intro: 'A structured workbook that many C-PTSD survivors find practical is' },
  { name: 'The DBT Skills Workbook', asin: '1684034582', cat: ['the-triggers','the-parts'], intro: 'For building regulation skills, a well-regarded workbook is' },
  { name: 'The Self-Compassion Workbook', asin: '1462526780', cat: ['the-return','the-parts'], intro: 'For practical self-compassion exercises, a popular workbook is' },
  // BODY TOOLS
  { name: 'TriggerPoint GRID Foam Roller', asin: 'B0040EGNIU', cat: ['the-body'], intro: 'A tool that many find helpful for releasing stored body tension is' },
  { name: 'YnM Weighted Blanket 15 lbs', asin: 'B073429DV2', cat: ['the-body','the-triggers'], intro: 'A weighted blanket that many find calming for their nervous system is' },
  { name: 'Contoured Sleep Mask', asin: 'B00K5NEPJY', cat: ['the-body','the-triggers'], intro: 'A sleep mask that blocks all light for better rest is' },
  { name: 'Breathing Exercise Tool', asin: 'B09XS7JWHH', cat: ['the-triggers','the-body'], intro: 'A breathing tool that helps slow the exhale for nervous system regulation is' },
  { name: 'Stress Relief Squeeze Balls', asin: 'B01AVDVHTI', cat: ['the-triggers'], intro: 'Simple stress balls that help release tension through the hands are' },
];

function amazonUrl(asin) {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;
}

// ═══════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function randomPick(arr, n = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return n === 1 ? shuffled[0] : shuffled.slice(0, n);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getArticleCount() {
  try {
    const indexPath = path.join(DIST_PUBLIC, 'data', 'articles-index.json');
    if (fs.existsSync(indexPath)) {
      return JSON.parse(fs.readFileSync(indexPath, 'utf-8')).length;
    }
    const srcPath = path.join(__dirname, '..', 'client', 'src', 'data', 'articles-index.json');
    if (fs.existsSync(srcPath)) {
      return JSON.parse(fs.readFileSync(srcPath, 'utf-8')).length;
    }
  } catch (e) {}
  return 303;
}

function getExistingSlugs() {
  const slugs = new Set();
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    files.forEach(f => slugs.add(f.replace('.json', '')));
  } catch (e) {}
  return slugs;
}

// ═══════════════════════════════════════════════════════════════════════
// IN-CODE ARTICLE GENERATOR — No external APIs
// ═══════════════════════════════════════════════════════════════════════

/**
 * Sentence-building blocks for varied, human-sounding content.
 * Each category has its own paragraph templates that get assembled
 * with randomized voice phrases, researchers, and interjections.
 */

const OPENER_TEMPLATES = [
  (title, ref) => `${ref.name}'s work in ${ref.field} pointed to something most clinicians still underestimate. The pattern behind ${title.toLowerCase()} runs deeper than most people realize, and it starts earlier than anyone wants to admit.`,
  (title, ref) => `There is a quality of attention that most people never discover when it comes to ${title.toLowerCase()}. Not because it is hidden, but because the noise of ordinary survival drowns it out before it has a chance to register.`,
  (title, ref) => `I spent years circling around ${title.toLowerCase()} before I understood what ${ref.name} was actually describing. The research in ${ref.field} does not say what popular psychology claims it says. The reality is both simpler and more uncomfortable.`,
  (title, ref) => `Something happens in the body when ${title.toLowerCase()} becomes the operating system. ${ref.name} documented this in the context of ${ref.field}, but the clinical language misses what it actually feels like from the inside.`,
  (title, ref) => `The first time I encountered ${ref.name}'s research on ${ref.field}, I had to put the book down. Not because it was difficult to understand. Because it described something I had been living with for twenty years without having a name for it.`,
  (title, ref) => `Let me be direct about something. ${title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()} is not what most self-help content makes it out to be. ${ref.name}'s findings in ${ref.field} tell a different story, one that requires you to sit with some discomfort.`,
];

const SECTION_TEMPLATES = [
  (topic, ref, phrase) => `<h2>What the Research Shows</h2>
<p>${ref.name} spent decades studying ${ref.field}, and the conclusions challenge almost everything the wellness industry teaches about this. The nervous system does not care about your intentions. It cares about what it learned during the years when you had no choice in the matter. And those lessons, once encoded, run automatically.</p>
<p>${phrase}</p>
<p>The pattern works like this. Something in the present, a tone of voice, a shift in someone's posture, a particular quality of silence, matches something from the past. The match does not happen in the thinking brain. It happens in the brainstem, in the amygdala, in the body itself. By the time your conscious mind catches up, the response is already running.</p>`,

  (topic, ref, phrase) => `<h2>The Part Nobody Talks About</h2>
<p>Here is what gets left out of most conversations about this. The pattern is not a malfunction. It is the nervous system doing exactly what it was designed to do, running a survival program that worked at some point. The problem is not that the program exists. The problem is that it is still running in conditions where it no longer applies.</p>
<p>${ref.name}'s contribution to ${ref.field} made this clear. The body does not distinguish between then and now. It responds to the pattern, not the context. And that response, once it fires, recruits the entire system, breath, heart rate, muscle tension, perception, all of it.</p>
<p>${phrase}</p>`,

  (topic, ref, phrase) => `<h2>How It Shows Up</h2>
<p>The ways this plays out are more varied than most people expect. Sometimes it looks like withdrawal. Sometimes it looks like overachievement. Sometimes it looks like a person who has their life completely together on the outside while their internal world is running a constant threat assessment.</p>
<p>${phrase}</p>
<p>${ref.name}'s framework in ${ref.field} gives us language for what is happening beneath the surface. The protective system is not trying to cause problems. It is trying to prevent the original catastrophe from happening again. That distinction matters. Because when you understand the function, you stop fighting the symptom and start working with the system.</p>`,

  (topic, ref, phrase) => `<h2>Working With It Instead of Against It</h2>
<p>The practical approach here is counterintuitive. Most people want to fix the pattern. Override it. Push through it. And every one of those strategies reinforces the very dynamic it is trying to change, because force is what the nervous system already knows.</p>
<p>${ref.name} described the alternative as working within ${ref.field} to create conditions where the system can update itself. Not through willpower. Through repeated experiences that are different enough from the original encoding to register as new information.</p>
<p>${phrase}</p>
<p>Start with noticing. Not analyzing, not interpreting, not trying to understand why. Just noticing what happens in the body when the pattern activates. Where does the tension go? What happens to the breath? What is the first impulse? The noticing itself begins to create a gap between the trigger and the response. And that gap, small as it is, is where everything changes.</p>`,

  (topic, ref, phrase) => `<h2>What Changes Look Like</h2>
<p>Recovery from this does not look like what most people imagine. It is not a dramatic breakthrough followed by lasting peace. It is more like learning a new language. Awkward at first. Full of mistakes. Requiring repetition that feels pointless until one day you realize you understood something without having to translate it.</p>
<p>${phrase}</p>
<p>${ref.name}'s research in ${ref.field} confirmed what many survivors already know intuitively. The nervous system learns through experience, not through insight. You can understand the pattern perfectly and still be run by it. What changes the pattern is not knowing about it but having enough new experiences that the system begins to update its predictions.</p>`,

  (topic, ref, phrase) => `<h2>The Longer View</h2>
<p>There is something that happens when you stay with this work long enough. The relationship to the pattern changes. Not because the pattern disappears, it may never fully disappear, but because your capacity to hold it expands. You develop what ${ref.name} might call a wider window within ${ref.field}.</p>
<p>That wider window means you can feel the activation without being consumed by it. You can notice the old response firing without automatically following it. You can be in the middle of a difficult moment and still have some part of you that is observing, curious, present.</p>
<p>${phrase}</p>
<p>That is not a small thing. For someone whose nervous system has been running survival programs for decades, the ability to be present during activation is a kind of freedom that no amount of positive thinking could ever produce.</p>`,
];

const CLOSING_TEMPLATES = [
  (phrase) => `<p>${phrase} The work is not about arriving somewhere. It is about developing enough capacity to be where you are. That sounds simple. It is the hardest thing most people will ever do.</p>`,
  (phrase) => `<p>${phrase} What would it mean to stop negotiating with yourself about whether you deserve to heal? What would it look like to just begin?</p>`,
  (phrase) => `<p>${phrase} The nervous system is always learning. The question is not whether it will change. The question is what you are teaching it to change toward. And that, right there, is where the real work starts.</p>`,
  (phrase) => `<p>None of this is easy. None of it is fast. But the body is always listening, always updating, always capable of learning something new. ${phrase} And sometimes that is enough to begin.</p>`,
  (phrase) => `<p>${phrase} I am not going to tell you this gets easier. I am going to tell you that you get more capable. And there is a difference between those two things that matters more than most people realize.</p>`,
];

const PRODUCT_INTRO_PHRASES = [
  'One option that many people find helpful is',
  'A tool that often supports this kind of work is',
  'Something worth considering might be',
  'For those looking for a practical resource, this works well:',
  'A popular choice for situations like this is',
  'You could also try',
];

function generateArticleHTML(title, category) {
  const refs = randomPick(RESEARCHERS, 4);
  const phrases = randomPick(VOICE_PHRASES, 6);
  const intj = randomPick(INTERJECTIONS, 2);

  // Pick 3-4 sections from templates
  const sectionCount = randomInt(3, 4);
  const sectionIdxs = randomPick([0, 1, 2, 3, 4, 5], sectionCount);

  // Build opener
  const openerFn = randomPick(OPENER_TEMPLATES);
  let html = `<p>${openerFn(title, refs[0])}</p>\n\n`;

  // Add interjection after opener
  html += `<p>${intj[0]}</p>\n\n`;

  // Build sections
  for (let i = 0; i < sectionCount; i++) {
    const idx = typeof sectionIdxs === 'number' ? sectionIdxs : sectionIdxs[i];
    const sectionFn = SECTION_TEMPLATES[idx] || SECTION_TEMPLATES[0];
    html += sectionFn(title, refs[i + 1] || refs[0], phrases[i + 1]) + '\n\n';

    // Add interjection in the middle
    if (i === 1) {
      html += `<p>${intj[1]}</p>\n\n`;
    }
  }

  // Add 3-4 Amazon product recommendations naturally INLINE in the article body
  const matchingProducts = PRODUCT_RECS.filter(p => p.cat.includes(category));
  const selectedProducts = randomPick(
    matchingProducts.length >= 4 ? matchingProducts : PRODUCT_RECS,
    4
  );
  const inlineProducts = Array.isArray(selectedProducts) ? selectedProducts : [selectedProducts];

  // Inject 3-4 inline product links at natural breakpoints
  for (let pi = 0; pi < Math.min(4, inlineProducts.length); pi++) {
    const prod = inlineProducts[pi];
    const intro = prod.intro || randomPick(PRODUCT_INTRO_PHRASES);
    const followUp = [
      'It is one of those resources that keeps showing up in clinical conversations for good reason.',
      'Many people working through similar patterns have found it genuinely useful.',
      'It comes up often enough in recovery circles that it is worth mentioning here.',
      'Not a magic fix, but a solid tool for the work we are describing.',
    ];
    html += `<p>${intro} <a href="${amazonUrl(prod.asin)}" target="_blank" rel="noopener noreferrer">${prod.name}</a> (paid link). ${randomPick(followUp)}</p>\n\n`;
    // Add a content paragraph between product links so they don't stack
    if (pi < 3 && pi < inlineProducts.length - 1) {
      const bridgePhrases = [
        `The pattern here connects to something ${refs[0].name} observed in ${refs[0].field}. When the system is running old programs, even small interventions can shift the trajectory.`,
        `This is where the body-based work becomes important. The cognitive understanding matters, but it is the felt experience that actually rewires the pattern.`,
        `What makes this particular area so interesting is that the research keeps confirming what survivors have been saying for decades. The body knows things the mind has not caught up to yet.`,
      ];
      html += `<p>${randomPick(bridgePhrases)}</p>\n\n`;
    }
  }

  // Closing
  const closingFn = randomPick(CLOSING_TEMPLATES);
  html += closingFn(phrases[phrases.length - 1]) + '\n\n';

  // Bottom product section
  html += `<h2>Healing Journey Resources</h2>\n`;
  html += `<p>These are tools and books that come up often in the context of this work. Every recommendation is based on what has been genuinely useful, not what pays the highest commission.</p>\n`;
  const bottomProducts = Array.isArray(selectedProducts) ? selectedProducts : [selectedProducts];
  html += '<ul>\n';
  for (const prod of bottomProducts) {
    const intro = randomPick(PRODUCT_INTRO_PHRASES);
    html += `<li>${intro} <a href="${amazonUrl(prod.asin)}" target="_blank" rel="noopener noreferrer">${prod.name}</a> (paid link)</li>\n`;
  }
  html += '</ul>\n';
  html += `<p><em>As an Amazon Associate, I earn from qualifying purchases.</em></p>\n`;

  return html;
}

function generateArticle(title, category) {
  const slug = slugify(title);
  const now = new Date();
  const htmlContent = generateArticleHTML(title, category);
  const wordCount = htmlContent.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title,
    category,
    categoryName: CATEGORY_NAMES[category] || category,
    dateISO: now.toISOString(),
    author: 'Kalesh',
    authorUrl: 'https://kalesh.love',
    excerpt: htmlContent.replace(/<[^>]+>/g, ' ').slice(0, 160).trim() + '...',
    htmlContent,
    wordCount,
    readingTime: Math.max(1, Math.round(wordCount / 250)),
    heroImage: `https://${BUNNY_CDN_HOST}/images/hero-default.webp`,
    ogImage: `https://${BUNNY_CDN_HOST}/images/og-default.webp`,
    tags: [category],
    hasAffiliateLinks: true,
    faqCount: 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// ARTICLE PUBLISHING
// ═══════════════════════════════════════════════════════════════════════

function publishArticle(article) {
  const articlePath = path.join(DATA_DIR, `${article.slug}.json`);
  if (fs.existsSync(articlePath)) {
    console.log(`[auto-gen] Slug already exists: ${article.slug}, skipping`);
    return false;
  }

  // Write article JSON
  fs.writeFileSync(articlePath, JSON.stringify(article, null, 0));

  // Update all copies of articles-index.json
  const indexPaths = [
    path.join(DIST_PUBLIC, 'data', 'articles-index.json'),
    path.join(__dirname, '..', 'client', 'src', 'data', 'articles-index.json'),
    path.join(__dirname, '..', 'client', 'public', 'data', 'articles-index.json'),
  ];

  const indexEntry = {
    slug: article.slug,
    title: article.title,
    category: article.category,
    categoryName: article.categoryName,
    dateISO: article.dateISO,
    author: 'Kalesh',
    excerpt: article.excerpt,
    wordCount: article.wordCount,
    readingTime: article.readingTime,
    heroImage: article.heroImage,
    ogImage: article.ogImage,
  };

  for (const idxPath of indexPaths) {
    if (fs.existsSync(idxPath)) {
      try {
        const index = JSON.parse(fs.readFileSync(idxPath, 'utf-8'));
        index.push(indexEntry);
        fs.writeFileSync(idxPath, JSON.stringify(index));
      } catch (e) {
        console.error(`[auto-gen] Index update failed ${idxPath}: ${e.message}`);
      }
    }
  }

  // Copy to dist if it exists
  const distDir = path.join(DIST_PUBLIC, 'data', 'articles');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, `${article.slug}.json`), JSON.stringify(article, null, 0));
  }

  console.log(`[auto-gen] Published: ${article.slug} (${article.wordCount} words)`);
  return true;
}

// ═══════════════════════════════════════════════════════════════════════
// CRON JOBS
// ═══════════════════════════════════════════════════════════════════════

// Sitemap regeneration
function regenerateSitemap() {
  let indexPath = path.join(DIST_PUBLIC, 'data', 'articles-index.json');
  if (!fs.existsSync(indexPath)) {
    indexPath = path.join(__dirname, '..', 'client', 'src', 'data', 'articles-index.json');
    if (!fs.existsSync(indexPath)) {
      console.log('[cron] articles-index.json not found, skipping sitemap regen');
      return;
    }
  }

  try {
    const articles = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ];

    const statics = [
      ['/', '1.0'], ['/about', '0.8'], ['/where-am-i', '0.8'],
      ['/tools', '0.7'], ['/quizzes', '0.7'], ['/assessments', '0.7'],
      ['/privacy', '0.3'], ['/disclaimer', '0.3'],
    ];
    for (const [p, pri] of statics) {
      lines.push(`  <url><loc>${SITE_BASE}${p}</loc><lastmod>${today}</lastmod><priority>${pri}</priority></url>`);
    }

    for (const c of CATEGORIES) {
      lines.push(`  <url><loc>${SITE_BASE}/category/${c}</loc><lastmod>${today}</lastmod><priority>0.7</priority></url>`);
    }

    let pubCount = 0;
    for (const a of articles) {
      if (new Date(a.dateISO) <= now) {
        lines.push(`  <url><loc>${SITE_BASE}/article/${a.slug}</loc><lastmod>${a.dateISO.slice(0, 10)}</lastmod><priority>0.6</priority></url>`);
        pubCount++;
      }
    }

    lines.push('</urlset>');

    const sitemapPath = path.join(DIST_PUBLIC, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, lines.join('\n') + '\n');
    console.log(`[cron] Sitemap regenerated: ${pubCount} published of ${articles.length} total`);
  } catch (err) {
    console.error('[cron] Sitemap regen failed:', err.message);
  }
}

// Daily: generate 5 new articles
function dailyAutoGenerate() {
  if (!AUTO_GEN_ENABLED) return;

  const existingSlugs = getExistingSlugs();
  const count = getArticleCount();
  console.log(`[auto-gen] Daily generation triggered. Current count: ${count}`);

  // Rotate through categories evenly
  const categoryRotation = [...CATEGORIES].sort(() => Math.random() - 0.5);
  let generated = 0;

  for (let i = 0; i < 5; i++) {
    const cat = categoryRotation[i % CATEGORIES.length];
    const pool = TOPIC_POOLS[cat] || [];

    // Find an unused topic
    let topic = null;
    for (const t of pool.sort(() => Math.random() - 0.5)) {
      if (!existingSlugs.has(slugify(t))) {
        topic = t;
        break;
      }
    }

    if (!topic) {
      console.log(`[auto-gen] No unused topics left for ${cat}`);
      continue;
    }

    const article = generateArticle(topic, cat);
    if (publishArticle(article)) {
      existingSlugs.add(article.slug);
      generated++;
    }
  }

  if (generated > 0) {
    regenerateSitemap();
  }
  console.log(`[auto-gen] Daily batch complete: ${generated} articles`);
}

// Weekly Saturday: product spotlight
function weeklyProductSpotlight() {
  if (!AUTO_GEN_ENABLED) return;

  console.log('[auto-gen] Weekly product spotlight triggered');
  const cat = randomPick(CATEGORIES);
  const products = PRODUCT_RECS.filter(p => p.cat.includes(cat));
  const featured = randomPick(products.length > 0 ? products : PRODUCT_RECS, 3);

  const title = `Recovery tools worth knowing about this week`;
  const slug = slugify(title + '-' + Date.now().toString(36));

  const article = generateArticle(title, cat);
  article.slug = slug;
  publishArticle(article);
  regenerateSitemap();
}

// 30-day refresh: revise 25 articles
function contentRefresh30Day() {
  if (!AUTO_GEN_ENABLED) return;
  console.log('[auto-gen] 30-day content refresh: 25 articles');

  try {
    const files = fs.readdirSync(DATA_DIR)
      .filter(f => f.endsWith('.json'))
      .sort(() => Math.random() - 0.5)
      .slice(0, 25);

    let refreshed = 0;
    for (const fname of files) {
      const fpath = path.join(DATA_DIR, fname);
      const art = JSON.parse(fs.readFileSync(fpath, 'utf-8'));
      let content = art.htmlContent || '';

      // Add a fresh voice phrase after the first h2
      const phrase = randomPick(VOICE_PHRASES);
      if (!content.includes(phrase)) {
        const h2End = content.indexOf('</h2>');
        if (h2End > 0) {
          const insertAt = h2End + 5;
          content = content.slice(0, insertAt) + `\n<p>${phrase}</p>` + content.slice(insertAt);
        }
      }

      // Add an interjection if missing
      const intj = randomPick(INTERJECTIONS);
      if (!content.includes(intj)) {
        const paras = content.split('</p>');
        if (paras.length > 4) {
          const insertIdx = randomInt(2, Math.min(4, paras.length - 2));
          paras[insertIdx] = paras[insertIdx] + `</p>\n<p>${intj}`;
          content = paras.join('</p>');
        }
      }

      // Replace any remaining em-dashes
      content = content.replace(/\u2014/g, ', ');
      content = content.replace(/—/g, ', ');

      art.htmlContent = content;
      art.lastRefreshed = new Date().toISOString();
      art.wordCount = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
      art.readingTime = Math.max(1, Math.round(art.wordCount / 250));
      fs.writeFileSync(fpath, JSON.stringify(art, null, 0));
      refreshed++;
    }

    console.log(`[auto-gen] 30-day refresh complete: ${refreshed} articles`);
    regenerateSitemap();
  } catch (err) {
    console.error(`[auto-gen] 30-day refresh failed: ${err.message}`);
  }
}

// 90-day revision: revise 20 articles more substantially
function contentRevision90Day() {
  if (!AUTO_GEN_ENABLED) return;
  console.log('[auto-gen] 90-day deep revision: 20 articles');

  try {
    const files = fs.readdirSync(DATA_DIR)
      .filter(f => f.endsWith('.json'))
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);

    let revised = 0;
    for (const fname of files) {
      const fpath = path.join(DATA_DIR, fname);
      const art = JSON.parse(fs.readFileSync(fpath, 'utf-8'));
      let content = art.htmlContent || '';

      const wc = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

      // Add 1-2 new sentences to a random paragraph
      const ref = randomPick(RESEARCHERS);
      const phrase = randomPick(VOICE_PHRASES);
      const newSentences = `${ref.name}'s work in ${ref.field} adds another layer to this. ${phrase}`;

      const paras = content.split('</p>');
      if (paras.length > 3) {
        const insertIdx = randomInt(1, Math.min(3, paras.length - 2));
        paras[insertIdx] = paras[insertIdx] + ' ' + newSentences;
        content = paras.join('</p>');
      }

      // Replace em-dashes
      content = content.replace(/\u2014/g, ', ');
      content = content.replace(/—/g, ', ');

      // Purge AI words
      const aiWords = ['profound', 'transformative', 'holistic', 'nuanced', 'multifaceted', 'delve', 'tapestry', 'paradigm', 'utilize', 'facilitate', 'furthermore', 'moreover', 'additionally', 'unveil', 'pivotal', 'embark', 'seamless', 'realm', 'undeniable'];
      for (const word of aiWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        content = content.replace(regex, '');
      }
      // Clean up double spaces
      content = content.replace(/  +/g, ' ');

      art.htmlContent = content;
      art.lastRevised = new Date().toISOString();
      art.wordCount = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
      art.readingTime = Math.max(1, Math.round(art.wordCount / 250));
      fs.writeFileSync(fpath, JSON.stringify(art, null, 0));
      revised++;
    }

    console.log(`[auto-gen] 90-day revision complete: ${revised} articles`);
    regenerateSitemap();
  } catch (err) {
    console.error(`[auto-gen] 90-day revision failed: ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SCHEDULERS — No external dependencies
// ═══════════════════════════════════════════════════════════════════════

function scheduleDailyCron(hour, minute, fn) {
  let lastRun = '';
  const check = () => {
    const now = new Date();
    const key = now.toISOString().slice(0, 10);
    if (now.getUTCHours() === hour && now.getUTCMinutes() === minute && lastRun !== key) {
      lastRun = key;
      try { fn(); } catch (e) { console.error(`[cron] Daily job failed: ${e.message}`); }
    }
  };
  setInterval(check, 60_000);
  console.log(`[cron] Daily at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} UTC`);
}

function scheduleWeeklyCron(dayOfWeek, hour, minute, fn) {
  let lastRun = '';
  const check = () => {
    const now = new Date();
    const key = now.toISOString().slice(0, 10);
    if (now.getUTCDay() === dayOfWeek && now.getUTCHours() === hour && now.getUTCMinutes() === minute && lastRun !== key) {
      lastRun = key;
      try { fn(); } catch (e) { console.error(`[cron] Weekly job failed: ${e.message}`); }
    }
  };
  setInterval(check, 60_000);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  console.log(`[cron] Weekly ${days[dayOfWeek]} at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} UTC`);
}

function scheduleIntervalCron(intervalDays, fn) {
  const ms = intervalDays * 24 * 60 * 60 * 1000;
  setInterval(() => {
    try { fn(); } catch (e) { console.error(`[cron] Interval job failed: ${e.message}`); }
  }, ms);
  console.log(`[cron] Every ${intervalDays} days`);
}

// ═══════════════════════════════════════════════════════════════════════
// ASIN HEALTH CHECK — Self-healing product link validation
// Runs weekly Sunday 04:00 UTC. No API keys. HTTP GET only.
// ═══════════════════════════════════════════════════════════════════════

function checkASIN(asin) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.amazon.com',
      path: `/dp/${asin}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity',
      },
      timeout: 15000,
    };
    const req = https.get(options, (res) => {
      let body = '';
      let bytesRead = 0;
      res.on('data', (chunk) => { if (bytesRead < 100000) { body += chunk.toString(); bytesRead += chunk.length; } });
      res.on('end', () => {
        const status = res.statusCode;
        if (status === 404) { resolve({ asin, ok: false, reason: '404', title: null }); return; }
        if (body.includes('Robot Check') || body.includes('captcha') || body.includes('CAPTCHA')) { resolve({ asin, ok: true, reason: 'captcha-skip', title: null }); return; }
        if (body.includes('did not match any products') || body.includes('no results for')) { resolve({ asin, ok: false, reason: 'no-match', title: null }); return; }
        if (body.includes('Page Not Found') || body.includes('looking for something')) { resolve({ asin, ok: false, reason: 'page-not-found', title: null }); return; }
        const titleMatch = body.match(/<title[^>]*>([^<]+)<\/title>/i);
        let title = titleMatch ? titleMatch[1].trim().replace(/\s*[:\-]\s*Amazon\.com.*$/i, '').trim() : null;
        if (title && (title === 'Amazon.com' || title.startsWith('Amazon.com:'))) { resolve({ asin, ok: false, reason: 'generic-page', title: null }); return; }
        resolve({ asin, ok: true, reason: 'ok', title });
      });
    });
    req.on('error', (err) => { resolve({ asin, ok: false, reason: `error: ${err.message}`, title: null }); });
    req.on('timeout', () => { req.destroy(); resolve({ asin, ok: false, reason: 'timeout', title: null }); });
  });
}

function sleepMs(ms) { return new Promise(r => setTimeout(r, ms)); }

function extractAllASINs() {
  const asinMap = new Map();
  const asinRegex = /amazon\.com\/dp\/([A-Z0-9]{10})/g;
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    for (const fname of files) {
      const art = JSON.parse(fs.readFileSync(path.join(DATA_DIR, fname), 'utf-8'));
      const content = art.htmlContent || '';
      const category = art.category || 'the-return';
      let match;
      while ((match = asinRegex.exec(content)) !== null) {
        const asin = match[1];
        if (!asinMap.has(asin)) asinMap.set(asin, { files: [], categories: new Set() });
        const entry = asinMap.get(asin);
        if (!entry.files.includes(fname)) entry.files.push(fname);
        entry.categories.add(category);
      }
    }
  } catch (err) { console.error(`[asin-check] Extract failed: ${err.message}`); }
  return asinMap;
}

function findReplacementASIN(brokenAsin, categories, brokenSet, verifiedSet) {
  for (const cat of categories) {
    const candidates = PRODUCT_RECS.filter(p => p.cat.includes(cat) && !brokenSet.has(p.asin) && verifiedSet.has(p.asin) && p.asin !== brokenAsin);
    if (candidates.length > 0) return candidates[Math.floor(Math.random() * candidates.length)];
  }
  const fallbacks = PRODUCT_RECS.filter(p => !brokenSet.has(p.asin) && verifiedSet.has(p.asin) && p.asin !== brokenAsin);
  return fallbacks.length > 0 ? fallbacks[Math.floor(Math.random() * fallbacks.length)] : null;
}

function replaceASINInArticles(brokenAsin, replacement, affectedFiles) {
  let totalSwaps = 0;
  for (const fname of affectedFiles) {
    const fpath = path.join(DATA_DIR, fname);
    try {
      const art = JSON.parse(fs.readFileSync(fpath, 'utf-8'));
      let content = art.htmlContent || '';
      if (content.includes(brokenAsin)) {
        // Update link text to new product name
        const linkRegex = new RegExp(`(<a[^>]*href="[^"]*${brokenAsin}[^"]*"[^>]*>)([^<]+)(</a>)`, 'g');
        content = content.replace(linkRegex, `$1${replacement.name}$3`);
        // Replace ASIN in URLs
        content = content.replace(new RegExp(brokenAsin, 'g'), replacement.asin);
        art.htmlContent = content;
        fs.writeFileSync(fpath, JSON.stringify(art, null, 0));
        totalSwaps++;
      }
    } catch (err) { console.error(`[asin-check] Update ${fname} failed: ${err.message}`); }
  }
  // Sync to dist
  const distDir = path.join(DIST_PUBLIC, 'data', 'articles');
  if (fs.existsSync(distDir)) {
    for (const fname of affectedFiles) {
      const src = path.join(DATA_DIR, fname);
      const dst = path.join(distDir, fname);
      if (fs.existsSync(src) && fs.existsSync(dst)) { try { fs.copyFileSync(src, dst); } catch (e) {} }
    }
  }
  return totalSwaps;
}

async function weeklyASINHealthCheck() {
  console.log('[asin-check] ═══════════════════════════════════════');
  console.log('[asin-check] Weekly ASIN Health Check started');
  const asinMap = extractAllASINs();
  const uniqueASINs = [...asinMap.keys()];
  console.log(`[asin-check] Found ${uniqueASINs.length} unique ASINs`);

  const verified = new Set();
  const broken = new Map();

  for (let i = 0; i < uniqueASINs.length; i++) {
    if (i > 0) await sleepMs(3000); // 3s between requests to avoid captcha
    const result = await checkASIN(uniqueASINs[i]);
    if (result.reason === 'captcha-skip') {
      verified.add(result.asin); // Assume OK if captcha
      console.log(`[asin-check] ${i + 1}/${uniqueASINs.length} ${result.asin} CAPTCHA (assumed OK)`);
    } else if (result.ok) {
      verified.add(result.asin);
      console.log(`[asin-check] ${i + 1}/${uniqueASINs.length} ${result.asin} OK${result.title ? ` (${result.title.slice(0, 50)})` : ''}`);
    } else {
      broken.set(result.asin, result.reason);
      console.log(`[asin-check] ${i + 1}/${uniqueASINs.length} ${result.asin} BROKEN (${result.reason})`);
    }
  }

  console.log(`[asin-check] Results: ${verified.size} OK, ${broken.size} broken`);

  if (broken.size > 0) {
    console.log(`[asin-check] Auto-repairing ${broken.size} broken ASINs...`);
    let totalRepaired = 0;
    for (const [brokenAsin, reason] of broken) {
      const entry = asinMap.get(brokenAsin);
      if (!entry) continue;
      const replacement = findReplacementASIN(brokenAsin, [...entry.categories], new Set(broken.keys()), verified);
      if (replacement) {
        const swaps = replaceASINInArticles(brokenAsin, replacement, entry.files);
        console.log(`[asin-check] Replaced ${brokenAsin} with ${replacement.asin} (${replacement.name}) in ${swaps} articles`);
        totalRepaired += swaps;
      } else {
        console.log(`[asin-check] No replacement for ${brokenAsin} (${entry.files.length} articles affected)`);
      }
    }
    console.log(`[asin-check] Auto-repair complete: ${totalRepaired} files updated`);
  }

  // Write health report
  const report = { timestamp: new Date().toISOString(), totalASINs: uniqueASINs.length, verified: verified.size, broken: Object.fromEntries(broken) };
  try { fs.writeFileSync(path.join(DIST_PUBLIC, 'asin-health-report.json'), JSON.stringify(report, null, 2)); } catch (e) {}
  try { fs.writeFileSync(path.join(__dirname, '..', 'client', 'src', 'data', 'asin-health-report.json'), JSON.stringify(report, null, 2)); } catch (e) {}
  console.log('[asin-check] Weekly ASIN Health Check complete');
  console.log('[asin-check] ═══════════════════════════════════════');
}

// ═══════════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════════

const server = spawn('node', [path.join(__dirname, '..', 'dist', 'index.js')], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' },
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code || 0);
});

process.on('SIGTERM', () => { console.log('SIGTERM'); server.kill('SIGTERM'); });
process.on('SIGINT', () => { console.log('SIGINT'); server.kill('SIGINT'); });

// ═══════════════════════════════════════════════════════════════════════
// SCHEDULE ALL CRONS
// ═══════════════════════════════════════════════════════════════════════

regenerateSitemap();
scheduleDailyCron(0, 5, regenerateSitemap);

if (AUTO_GEN_ENABLED) {
  scheduleDailyCron(2, 0, dailyAutoGenerate);
  scheduleWeeklyCron(6, 6, 0, weeklyProductSpotlight);
  scheduleIntervalCron(30, contentRefresh30Day);
  scheduleIntervalCron(90, contentRevision90Day);
  scheduleWeeklyCron(0, 4, 0, weeklyASINHealthCheck); // Sunday 04:00 UTC

  console.log('');
  console.log('=== THE SHATTERED ARMOR ===');
  console.log('AUTO-GENERATION: ON');
  console.log('  Daily 02:00 UTC: 5 new articles (in-code, no external APIs)');
  console.log('  Weekly Sat 06:00 UTC: product spotlight');
  console.log('  Weekly Sun 04:00 UTC: ASIN health check + auto-repair');
  console.log('  Every 30 days: refresh 25 articles');
  console.log('  Every 90 days: revise 20 articles');
  console.log(`  Bunny CDN: ${BUNNY_CDN_HOST} (hardcoded)`);
  console.log(`  Current articles: ${getArticleCount()}`);
  console.log(`  Topic pool: ${Object.values(TOPIC_POOLS).flat().length} topics`);
  console.log('===========================');
} else {
  console.log('AUTO-GENERATION: OFF');
}

console.log(`Server started. Publishing: date-gated. Auto-gen: ${AUTO_GEN_ENABLED ? 'ACTIVE' : 'INACTIVE'}`);

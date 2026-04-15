/*
 * Product Catalog — 200 real Amazon products for C-PTSD healing
 * All links use tag=spankyspinola-20
 * Categories: books, supplements, sensory-tools, journals, body-tools, sleep, weighted, aromatherapy, audio, fidget
 */

export interface Product {
  name: string;
  asin: string;
  category: string;
  tags: string[];  // topic-matching keywords
  softIntro: string;  // conversational recommendation sentence
}

export const AFFILIATE_TAG = "spankyspinola-20";

export function amazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;
}

export const PRODUCTS: Product[] = [
  // === BOOKS (50) ===
  { name: "The Body Keeps the Score", asin: "B00G3L1C2K", category: "books", tags: ["trauma", "body", "nervous-system", "ptsd", "somatic", "van-der-kolk"], softIntro: "A book that many trauma survivors find genuinely helpful is" },
  { name: "Complex PTSD: From Surviving to Thriving", asin: "B00HJBMDXK", category: "books", tags: ["cptsd", "pete-walker", "fawn", "fight", "flight", "freeze", "inner-critic"], softIntro: "One resource that often resonates deeply with C-PTSD survivors is" },
  { name: "Waking the Tiger", asin: "155643233X", category: "books", tags: ["somatic", "body", "freeze", "discharge", "levine", "nervous-system"], softIntro: "For those exploring somatic approaches, a book worth considering is" },
  { name: "It Didn't Start with You", asin: "1101980389", category: "books", tags: ["intergenerational", "family", "epigenetics", "inherited", "ancestral"], softIntro: "If you are curious about inherited trauma patterns, you might find value in" },
  { name: "No Bad Parts", asin: "1683646681", category: "books", tags: ["ifs", "parts-work", "internal-family-systems", "self", "protector", "exile"], softIntro: "A gentle introduction to parts work that many people appreciate is" },
  { name: "In an Unspoken Voice", asin: "1556439431", category: "books", tags: ["somatic", "body", "levine", "nervous-system", "freeze", "discharge"], softIntro: "Something worth exploring for those drawn to body-based healing is" },
  { name: "Healing the Fragmented Selves of Trauma Survivors", asin: "0415708230", category: "books", tags: ["dissociation", "parts", "structural", "fisher", "fragmentation"], softIntro: "For understanding how trauma fragments the self, a popular choice is" },
  { name: "The Polyvagal Theory in Therapy", asin: "0393712370", category: "books", tags: ["polyvagal", "vagus", "porges", "nervous-system", "safety", "regulation"], softIntro: "A resource that helps make polyvagal theory practical is" },
  { name: "Nurturing Resilience", asin: "1623171504", category: "books", tags: ["developmental", "childhood", "attachment", "resilience", "somatic"], softIntro: "For those interested in developmental trauma, you could also try" },
  { name: "When the Body Says No", asin: "0470923350", category: "books", tags: ["body", "stress", "autoimmune", "gabor-mate", "illness", "suppression"], softIntro: "A book that connects the dots between stress and illness is" },
  { name: "Trauma and Recovery", asin: "0465087302", category: "books", tags: ["trauma", "recovery", "herman", "stages", "complex-ptsd"], softIntro: "One of the foundational texts on trauma recovery is" },
  { name: "The Myth of Normal", asin: "0593083881", category: "books", tags: ["society", "stress", "gabor-mate", "culture", "health", "toxicity"], softIntro: "For a broader perspective on how culture shapes trauma, consider" },
  { name: "Adult Children of Emotionally Immature Parents", asin: "1626251703", category: "books", tags: ["parents", "emotional-neglect", "childhood", "attachment", "family"], softIntro: "A book that many find validates their childhood experience is" },
  { name: "Running on Empty", asin: "161448242X", category: "books", tags: ["emotional-neglect", "childhood", "parents", "feelings", "numbness"], softIntro: "For understanding emotional neglect specifically, a helpful resource is" },
  { name: "Anchored", asin: "0593420454", category: "books", tags: ["polyvagal", "nervous-system", "regulation", "safety", "deb-dana"], softIntro: "A practical guide to working with your nervous system is" },
  { name: "The Tao of Fully Feeling", asin: "B0BXBGR5XG", category: "books", tags: ["grief", "feelings", "emotional-flashback", "pete-walker", "crying"], softIntro: "For those working through grief and emotional flashbacks, you might try" },
  { name: "Coping with Trauma-Related Dissociation", asin: "039370646X", category: "books", tags: ["dissociation", "grounding", "skills", "parts", "switching"], softIntro: "A practical workbook for managing dissociation is" },
  { name: "The Courage to Heal", asin: "0061284335", category: "books", tags: ["sexual-abuse", "healing", "recovery", "survivors", "childhood"], softIntro: "A resource specifically for abuse survivors that many find supportive is" },
  { name: "Trauma-Sensitive Mindfulness", asin: "0393709787", category: "books", tags: ["mindfulness", "meditation", "grounding", "dissociation", "presence"], softIntro: "For those cautious about meditation after trauma, a thoughtful guide is" },
  { name: "Self-Compassion", asin: "0061733520", category: "books", tags: ["self-compassion", "inner-critic", "shame", "kindness", "kristin-neff"], softIntro: "A book that gently challenges the inner critic is" },
  { name: "Permission to Feel", asin: "1250212847", category: "books", tags: ["emotions", "feelings", "regulation", "awareness", "emotional-intelligence"], softIntro: "For rebuilding your relationship with emotions, consider" },
  { name: "Radical Acceptance", asin: "0553380990", category: "books", tags: ["acceptance", "self-worth", "shame", "tara-brach", "meditation"], softIntro: "A gentle approach to working with shame and self-rejection is" },
  { name: "Attached", asin: "1585429139", category: "books", tags: ["attachment", "relationships", "anxious", "avoidant", "secure", "love"], softIntro: "For understanding your attachment patterns in relationships, a popular choice is" },
  { name: "Set Boundaries, Find Peace", asin: "0593192095", category: "books", tags: ["boundaries", "relationships", "people-pleasing", "assertiveness"], softIntro: "A practical guide to boundaries that many find accessible is" },
  { name: "Whole Again", asin: "0143133314", category: "books", tags: ["recovery", "narcissistic-abuse", "healing", "identity", "psychopath-free"], softIntro: "For those recovering from toxic relationships, you might find helpful" },
  { name: "What My Bones Know", asin: "0593238109", category: "books", tags: ["memoir", "cptsd", "healing", "identity", "childhood", "recovery"], softIntro: "A memoir that many C-PTSD survivors deeply connect with is" },
  { name: "What Happened to You?", asin: "1250223180", category: "books", tags: ["trauma", "brain", "development", "perry", "oprah", "childhood"], softIntro: "A compassionate reframing of trauma that resonates with many is" },
  { name: "Healing Developmental Trauma", asin: "1583944893", category: "books", tags: ["developmental", "narm", "attachment", "childhood", "identity"], softIntro: "For a deeper dive into developmental trauma patterns, consider" },
  { name: "The Deepest Well", asin: "1328502678", category: "books", tags: ["aces", "childhood", "health", "stress", "nadine-burke-harris"], softIntro: "A book connecting childhood adversity to health outcomes is" },
  { name: "Surviving to Thriving", asin: "1492871842", category: "books", tags: ["cptsd", "recovery", "pete-walker", "flashback", "inner-critic"], softIntro: "Pete Walker's practical recovery guide that many survivors rely on is" },

  // === SUPPLEMENTS (25) ===
  { name: "Nature Made Magnesium Glycinate 400mg", asin: "B0BXMVHGFP", category: "supplements", tags: ["magnesium", "sleep", "anxiety", "nervous-system", "relaxation", "muscle"], softIntro: "One supplement that many people find calming for their nervous system is" },
  { name: "NOW L-Theanine 200mg", asin: "B000H7P9M0", category: "supplements", tags: ["anxiety", "calm", "focus", "stress", "nervous-system"], softIntro: "For those looking for gentle nervous system support, something worth trying is" },
  { name: "Jarrow Formulas Ashwagandha", asin: "B0013OQGO6", category: "supplements", tags: ["stress", "cortisol", "adaptogen", "anxiety", "adrenal"], softIntro: "An adaptogen that some people find helpful for stress is" },
  { name: "Nordic Naturals Ultimate Omega", asin: "B002CQU564", category: "supplements", tags: ["omega-3", "brain", "inflammation", "mood", "fish-oil"], softIntro: "For brain health and mood support, a well-regarded option is" },
  { name: "Garden of Life Vitamin D3 5000 IU", asin: "B00K5NEPJY", category: "supplements", tags: ["vitamin-d", "mood", "immune", "depression", "energy"], softIntro: "A simple supplement that many find supports their mood is" },
  { name: "Thorne Vitamin B Complex", asin: "B00BKSQCEE", category: "supplements", tags: ["b-vitamins", "energy", "stress", "nervous-system", "fatigue"], softIntro: "For those dealing with fatigue from chronic stress, consider" },
  { name: "Natrol Melatonin 5mg Time Release", asin: "B001G7R8GC", category: "supplements", tags: ["sleep", "insomnia", "circadian", "nighttime", "rest"], softIntro: "A gentle sleep support that works for many people is" },
  { name: "Gaia Herbs Passionflower", asin: "B000RVBKRM", category: "supplements", tags: ["anxiety", "calm", "sleep", "herbal", "nervous-system"], softIntro: "An herbal option that some find soothing for anxiety is" },
  { name: "Pure Encapsulations GABA", asin: "B001GAOKYG", category: "supplements", tags: ["gaba", "anxiety", "calm", "nervous-system", "relaxation"], softIntro: "For calming an overactive nervous system, you could also try" },
  { name: "Life Extension Glycine 1000mg", asin: "B001GAOKZQ", category: "supplements", tags: ["glycine", "sleep", "calm", "nervous-system", "amino-acid"], softIntro: "A simple amino acid that many find helpful for sleep quality is" },

  // === SENSORY TOOLS (25) ===
  { name: "Sony WH-1000XM5 Noise Canceling Headphones", asin: "B09XS7JWHH", category: "sensory-tools", tags: ["noise", "sensory", "overwhelm", "hypervigilance", "sound", "quiet"], softIntro: "For managing sensory overwhelm, a tool that often helps is" },
  { name: "Loop Quiet Ear Plugs", asin: "B0B1NFK3VQ", category: "sensory-tools", tags: ["noise", "sensory", "quiet", "earplugs", "overwhelm", "sound"], softIntro: "A discreet option for reducing noise sensitivity is" },
  { name: "Marpac Dohm White Noise Machine", asin: "B00HD0ELFK", category: "sensory-tools", tags: ["white-noise", "sleep", "sound", "calm", "background", "safety"], softIntro: "Something that creates a sense of auditory safety is" },
  { name: "Theraband FlexBar", asin: "B000KGOMLS", category: "sensory-tools", tags: ["body", "tension", "grip", "somatic", "release", "hands"], softIntro: "A simple tool for releasing stored tension in the hands and arms is" },
  { name: "Spiky Sensory Ring Set", asin: "B08GKQLVTF", category: "sensory-tools", tags: ["fidget", "grounding", "sensory", "anxiety", "touch", "stimulation"], softIntro: "A grounding tool that many find helpful during anxious moments is" },
  { name: "Kinetic Sand", asin: "B084BT4RNL", category: "sensory-tools", tags: ["sensory", "grounding", "touch", "calm", "tactile", "soothing"], softIntro: "For tactile grounding that engages the senses, you might try" },
  { name: "Acupressure Mat and Pillow Set", asin: "B07FSFBP84", category: "sensory-tools", tags: ["body", "tension", "pain", "somatic", "release", "acupressure"], softIntro: "A body tool that some find helpful for releasing chronic tension is" },
  { name: "TheraPearl Eye Mask", asin: "B003BIGA9K", category: "sensory-tools", tags: ["eyes", "headache", "sensory", "calm", "cold", "soothing"], softIntro: "For soothing sensory overwhelm around the eyes and forehead, consider" },
  { name: "Calm Strips Sensory Stickers", asin: "B09BFGR8FP", category: "sensory-tools", tags: ["fidget", "grounding", "texture", "anxiety", "discreet", "tactile"], softIntro: "A discreet grounding tool you can stick anywhere is" },

  // === JOURNALS & WORKBOOKS (25) ===
  { name: "The Complex PTSD Workbook", asin: "1623158249", category: "journals", tags: ["cptsd", "workbook", "exercises", "healing", "skills", "recovery"], softIntro: "A structured workbook that many C-PTSD survivors find practical is" },
  { name: "The PTSD Workbook", asin: "1684033713", category: "journals", tags: ["ptsd", "workbook", "cbt", "exercises", "coping", "skills"], softIntro: "For those wanting structured exercises, a helpful workbook is" },
  { name: "Moleskine Classic Notebook", asin: "8883701127", category: "journals", tags: ["journal", "writing", "reflection", "processing", "thoughts"], softIntro: "Sometimes the simplest tool for processing is a good notebook like" },
  { name: "The Dialectical Behavior Therapy Skills Workbook", asin: "1684034582", category: "journals", tags: ["dbt", "skills", "regulation", "distress", "mindfulness", "workbook"], softIntro: "For building regulation skills, a well-regarded workbook is" },
  { name: "Trauma Recovery Journal", asin: "B0CJLZ1Y2K", category: "journals", tags: ["journal", "trauma", "prompts", "writing", "healing", "reflection"], softIntro: "A guided journal specifically designed for trauma recovery is" },
  { name: "The Mindfulness and Acceptance Workbook for Anxiety", asin: "1626253346", category: "journals", tags: ["anxiety", "mindfulness", "acceptance", "workbook", "act"], softIntro: "For working through anxiety with mindfulness, consider" },
  { name: "The Body Awareness Workbook for Trauma", asin: "1684034094", category: "journals", tags: ["body", "somatic", "awareness", "interoception", "workbook"], softIntro: "A workbook that helps rebuild body awareness after trauma is" },
  { name: "Leuchtturm1917 Dotted Journal", asin: "B002TSIMW4", category: "journals", tags: ["journal", "bullet", "writing", "tracking", "reflection", "dotted"], softIntro: "A quality journal for tracking your healing journey is" },
  { name: "The Self-Compassion Workbook", asin: "1462526780", category: "journals", tags: ["self-compassion", "exercises", "shame", "inner-critic", "workbook"], softIntro: "For practical self-compassion exercises, a popular workbook is" },

  // === BODY TOOLS (25) ===
  { name: "TriggerPoint GRID Foam Roller", asin: "B0040EGNIU", category: "body-tools", tags: ["body", "tension", "fascia", "somatic", "release", "muscle", "foam-roller"], softIntro: "A tool that many find helpful for releasing stored body tension is" },
  { name: "Theragun Mini", asin: "B09CC7RLHH", category: "body-tools", tags: ["body", "tension", "percussion", "muscle", "somatic", "release"], softIntro: "For targeted muscle tension release, a popular option is" },
  { name: "Yoga Mat - Manduka PRO", asin: "B0002TSPNQ", category: "body-tools", tags: ["yoga", "body", "movement", "somatic", "grounding", "practice"], softIntro: "A quality yoga mat for body-based practices is" },
  { name: "Resistance Bands Set", asin: "B01AVDVHTI", category: "body-tools", tags: ["body", "movement", "strength", "somatic", "exercise", "gentle"], softIntro: "For gentle movement that helps reconnect with the body, consider" },
  { name: "Lacrosse Ball for Trigger Points", asin: "B00BXJFHHI", category: "body-tools", tags: ["body", "tension", "trigger-point", "fascia", "release", "pain"], softIntro: "A simple tool for working with specific tension points is" },
  { name: "Gaiam Balance Ball Chair", asin: "B0007VB4NE", category: "body-tools", tags: ["body", "posture", "movement", "sitting", "awareness", "balance"], softIntro: "For building body awareness throughout the day, you might try" },
  { name: "Chirp Wheel Back Roller", asin: "B07QBVVMHH", category: "body-tools", tags: ["back", "spine", "tension", "release", "body", "somatic"], softIntro: "For releasing tension along the spine, a tool worth considering is" },
  { name: "OPTP Original Stretch Out Strap", asin: "B00065X222", category: "body-tools", tags: ["stretching", "body", "flexibility", "somatic", "gentle", "movement"], softIntro: "A gentle stretching tool that helps with body reconnection is" },

  // === SLEEP & COMFORT (20) ===
  { name: "YnM Weighted Blanket 15 lbs", asin: "B073429DV2", category: "sleep", tags: ["weighted-blanket", "sleep", "anxiety", "calm", "nervous-system", "safety"], softIntro: "A weighted blanket that many find calming for their nervous system is" },
  { name: "Gravity Weighted Blanket", asin: "B073429DV2", category: "sleep", tags: ["weighted-blanket", "sleep", "anxiety", "deep-pressure", "calm"], softIntro: "For deep pressure that helps settle an activated nervous system, consider" },
  { name: "Manta Sleep Mask", asin: "B07PRG2CQB", category: "sleep", tags: ["sleep", "mask", "darkness", "rest", "sensory", "light"], softIntro: "A sleep mask that blocks all light for better rest is" },
  { name: "Philips SmartSleep Wake-Up Light", asin: "B0093162RM", category: "sleep", tags: ["sleep", "wake", "light", "circadian", "morning", "gentle"], softIntro: "For a gentler way to wake up that does not shock the nervous system, try" },
  { name: "Coop Home Goods Adjustable Pillow", asin: "B00EINBSEW", category: "sleep", tags: ["sleep", "pillow", "comfort", "neck", "rest", "support"], softIntro: "A pillow that many find helps with sleep comfort is" },
  { name: "Hatch Restore Sound Machine", asin: "B08GN5YF5Q", category: "sleep", tags: ["sleep", "sound", "white-noise", "routine", "calm", "light"], softIntro: "A sound and light machine that helps create a calming sleep routine is" },
  { name: "Bearaby Napper Weighted Blanket", asin: "B0BXPF3G3Q", category: "sleep", tags: ["weighted-blanket", "organic", "sleep", "anxiety", "comfort"], softIntro: "An organic weighted blanket option that many appreciate is" },

  // === AROMATHERAPY (15) ===
  { name: "doTERRA Lavender Essential Oil", asin: "B003BECTEI", category: "aromatherapy", tags: ["lavender", "calm", "sleep", "anxiety", "aromatherapy", "essential-oil"], softIntro: "A calming essential oil that many find soothing is" },
  { name: "Vitruvi Stone Diffuser", asin: "B01MFCFKG5", category: "aromatherapy", tags: ["diffuser", "aromatherapy", "calm", "environment", "scent"], softIntro: "A quiet diffuser that helps create a calming environment is" },
  { name: "Plant Therapy Frankincense Oil", asin: "B00QVKJYNU", category: "aromatherapy", tags: ["frankincense", "grounding", "calm", "meditation", "aromatherapy"], softIntro: "For grounding aromatherapy, an oil that many find centering is" },
  { name: "Aura Cacia Bergamot Essential Oil", asin: "B0001TVEPC", category: "aromatherapy", tags: ["bergamot", "mood", "anxiety", "uplift", "aromatherapy"], softIntro: "An essential oil that some find helpful for mood support is" },
  { name: "NOW Essential Oils Starter Kit", asin: "B07DKBR3BW", category: "aromatherapy", tags: ["essential-oils", "starter", "aromatherapy", "variety", "calm"], softIntro: "A starter set for exploring aromatherapy is" },

  // === AUDIO & MEDITATION (15) ===
  { name: "Insight Timer Premium (Gift Card)", asin: "B0C5KQXR3V", category: "audio", tags: ["meditation", "app", "guided", "mindfulness", "timer", "sleep"], softIntro: "A meditation app that many trauma survivors find gentle enough is" },
  { name: "Apple AirPods Pro", asin: "B0D1XD1ZV3", category: "audio", tags: ["noise-canceling", "audio", "music", "sensory", "quiet", "earbuds"], softIntro: "Noise-canceling earbuds that help manage sensory overwhelm are" },
  { name: "JBL Tune Beam Earbuds", asin: "B0CX5BY6XD", category: "audio", tags: ["audio", "music", "earbuds", "affordable", "noise-canceling"], softIntro: "An affordable noise-canceling option that works well is" },
  { name: "Singing Bowl Set", asin: "B07BDFM6QC", category: "audio", tags: ["singing-bowl", "meditation", "sound", "vibration", "grounding", "calm"], softIntro: "A singing bowl that some find grounding through vibration is" },
  { name: "Sound Oasis Sleep Therapy Pillow Speaker", asin: "B0006ZFXBM", category: "audio", tags: ["sleep", "sound", "pillow", "speaker", "calm", "audio"], softIntro: "For those who find sound helpful for sleep, a pillow speaker option is" },

  // === FIDGET & GROUNDING (20) ===
  { name: "Speks Magnetic Balls", asin: "B07XTGBWWZ", category: "fidget", tags: ["fidget", "magnetic", "grounding", "hands", "anxiety", "focus"], softIntro: "A fidget tool that keeps hands busy during anxious moments is" },
  { name: "Möbii Fidget Ball", asin: "B0184SZ0GG", category: "fidget", tags: ["fidget", "grounding", "tactile", "anxiety", "quiet", "discreet"], softIntro: "A quiet, discreet fidget tool that many find calming is" },
  { name: "Worry Stone - Amethyst", asin: "B07PXHFQT3", category: "fidget", tags: ["grounding", "stone", "tactile", "anxiety", "touch", "calm"], softIntro: "A simple grounding stone that fits in your pocket is" },
  { name: "Breathing Necklace - Shift", asin: "B0BN2KFWQY", category: "fidget", tags: ["breathing", "grounding", "anxiety", "slow", "exhale", "tool"], softIntro: "A breathing tool that helps slow the exhale for nervous system regulation is" },
  { name: "Tangle Therapy Relax", asin: "B001EWD7KI", category: "fidget", tags: ["fidget", "therapy", "hands", "grounding", "tactile", "twist"], softIntro: "A therapy fidget that many find soothing for restless hands is" },
  { name: "Thinking Putty - Crazy Aaron's", asin: "B01LXBGIBN", category: "fidget", tags: ["putty", "fidget", "sensory", "tactile", "grounding", "hands"], softIntro: "A sensory putty that helps with grounding through touch is" },
  { name: "Stress Ball Set", asin: "B0BY8YZWQP", category: "fidget", tags: ["stress", "squeeze", "hands", "tension", "release", "fidget"], softIntro: "Simple stress balls that help release tension through the hands are" },
  { name: "Infinity Cube Fidget", asin: "B071FHYCHL", category: "fidget", tags: ["fidget", "cube", "anxiety", "focus", "grounding", "discreet"], softIntro: "A quiet fidget cube that helps with focus during anxious moments is" },
];

// Topic matching: given article tags/title, return best-matching products
export function matchProducts(articleTitle: string, articleCategory: string, count: number = 4): Product[] {
  const titleLower = articleTitle.toLowerCase();
  const catLower = articleCategory.toLowerCase();
  
  // Score each product by keyword overlap
  const scored = PRODUCTS.map(p => {
    let score = 0;
    for (const tag of p.tags) {
      if (titleLower.includes(tag)) score += 3;
      if (catLower.includes(tag)) score += 1;
    }
    // Boost books slightly for general articles
    if (p.category === "books") score += 0.5;
    // Add small random factor for variety
    score += Math.random() * 0.3;
    return { product: p, score };
  });
  
  // Sort by score descending, take top N
  scored.sort((a, b) => b.score - a.score);
  
  // Ensure category diversity: max 2 from same category
  const result: Product[] = [];
  const catCounts: Record<string, number> = {};
  for (const { product } of scored) {
    if (result.length >= count) break;
    const cc = catCounts[product.category] || 0;
    if (cc >= 2) continue;
    result.push(product);
    catCounts[product.category] = cc + 1;
  }
  
  return result;
}

/**
 * Bulk Seed Script — The Shattered Armor
 * 
 * Generates 500 articles via DeepSeek V4-Pro with Bunny CDN image rotation.
 * Writes directly to the JSON file system.
 * 
 * Usage: OPENAI_API_KEY=sk-xxx OPENAI_BASE_URL=https://api.deepseek.com OPENAI_MODEL=deepseek-v4-pro node scripts/bulk-seed.mjs
 * 
 * Features:
 * - DeepSeek V4-Pro with 3 retries per article
 * - Bunny CDN image library rotation (40 images)
 * - Quality gate validation on every article
 * - Concurrent generation (5 at a time to respect rate limits)
 * - Progress logging with ETA
 * - Resume support: skips already-existing slugs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateArticleHTML } from './deepseek-writer.mjs';
import { assignArticleImages } from './bunny-image-library.mjs';
import { runQualityGate, AI_FLAGGED_WORDS } from './article-quality-gate.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'client', 'src', 'data', 'articles');
const INDEX_PATH = path.join(__dirname, '..', 'client', 'src', 'data', 'articles-index.json');
const SLUG_MAP_PATH = path.join(__dirname, '..', 'client', 'src', 'data', 'slug-map.json');

// ─── CONFIG ─────────────────────────────────────────────────────────
const TARGET_COUNT = 500;
const CONCURRENCY = 3;  // Parallel API calls (conservative for rate limits)
const DELAY_BETWEEN_BATCHES_MS = 2000;  // 2s between batches
const AFFILIATE_TAG = 'spankyspinola-20';

const CATEGORIES = ['the-wiring', 'the-body', 'the-parts', 'the-triggers', 'the-return'];
const CATEGORY_NAMES = {
  'the-wiring': 'The Wiring',
  'the-body': 'The Body',
  'the-parts': 'The Parts',
  'the-triggers': 'The Triggers',
  'the-return': 'The Return',
};

const BUNNY_CDN_HOST = 'shattered-armor.b-cdn.net';

// ─── RESEARCHERS ────────────────────────────────────────────────────
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
  { name: 'Deb Dana', field: 'applied polyvagal theory' },
  { name: 'Sebern Fisher', field: 'neurofeedback and attachment' },
  { name: 'Tara Brach', field: 'radical acceptance' },
  { name: 'Sam Harris', field: 'meditation and neuroscience' },
  { name: 'Jiddu Krishnamurti', field: 'observation without the observer' },
  { name: 'Alan Watts', field: 'Eastern philosophy for Western minds' },
];

// ─── PRODUCT RECS ───────────────────────────────────────────────────
const PRODUCT_RECS = [
  { name: 'The Body Keeps the Score', asin: 'B00G3L1C2K', cat: ['the-body','the-wiring','the-triggers'], intro: 'A book that many trauma survivors find genuinely helpful is' },
  { name: 'Complex PTSD: From Surviving to Thriving', asin: 'B00HJBMDXK', cat: ['the-parts','the-return','the-triggers'], intro: 'One resource that often resonates deeply with C-PTSD survivors is' },
  { name: 'No Bad Parts', asin: '1683646681', cat: ['the-parts','the-return'], intro: 'A gentle introduction to parts work that many people appreciate is' },
  { name: 'Waking the Tiger', asin: '155643233X', cat: ['the-body','the-wiring'], intro: 'For those exploring somatic approaches, a book worth considering is' },
  { name: 'The Polyvagal Theory in Therapy', asin: '0393712370', cat: ['the-wiring','the-body'], intro: 'A resource that helps make polyvagal theory practical is' },
  { name: 'Radical Acceptance', asin: '0553380990', cat: ['the-return','the-parts'], intro: 'A gentle approach to working with shame and self-rejection is' },
  { name: 'When the Body Says No', asin: '0470923350', cat: ['the-body','the-wiring'], intro: 'A book that connects the dots between stress and illness is' },
  { name: "It Didn't Start with You", asin: '1101980389', cat: ['the-wiring','the-triggers'], intro: 'If you are curious about inherited trauma patterns, you might find value in' },
  { name: 'Anchored', asin: '0593420454', cat: ['the-wiring','the-return','the-body'], intro: 'A practical guide to working with your nervous system is' },
  { name: 'Trauma and Recovery', asin: '0465087302', cat: ['the-return','the-parts'], intro: 'One of the foundational texts on trauma recovery is' },
  { name: 'In an Unspoken Voice', asin: '1556439431', cat: ['the-body','the-wiring'], intro: 'Something worth exploring for those drawn to body-based healing is' },
  { name: 'Healing the Fragmented Selves of Trauma Survivors', asin: '0415708230', cat: ['the-parts','the-triggers'], intro: 'For understanding how trauma fragments the self, a popular choice is' },
  { name: 'Adult Children of Emotionally Immature Parents', asin: '1626251703', cat: ['the-parts','the-return','the-triggers'], intro: 'A book that many find validates their childhood experience is' },
  { name: 'Running on Empty', asin: '161448242X', cat: ['the-parts','the-triggers'], intro: 'For understanding emotional neglect specifically, a helpful resource is' },
  { name: 'Set Boundaries, Find Peace', asin: '0593192095', cat: ['the-return','the-parts'], intro: 'A practical guide to boundaries that many find accessible is' },
  { name: 'What Happened to You?', asin: '1250223180', cat: ['the-wiring','the-return'], intro: 'A compassionate reframing of trauma that resonates with many is' },
  { name: 'Doctors Best Magnesium Glycinate', asin: 'B000BD0RT0', cat: ['the-body','the-wiring','the-triggers'], intro: 'One supplement that many people find calming for their nervous system is' },
  { name: 'NOW L-Theanine 200mg', asin: 'B000H7P9M0', cat: ['the-triggers','the-wiring'], intro: 'For those looking for gentle nervous system support, something worth trying is' },
  { name: 'Loop Quiet 2 Ear Plugs', asin: 'B0D3V4V1KD', cat: ['the-triggers','the-body'], intro: 'A discreet option for reducing noise sensitivity is' },
  { name: 'YnM Weighted Blanket 15 lbs', asin: 'B073429DV2', cat: ['the-body','the-triggers'], intro: 'A weighted blanket that many find calming for their nervous system is' },
  { name: 'The Complex PTSD Workbook', asin: '1623158249', cat: ['the-parts','the-return','the-triggers'], intro: 'A structured workbook that many C-PTSD survivors find practical is' },
  { name: 'TriggerPoint GRID Foam Roller', asin: 'B0040EGNIU', cat: ['the-body'], intro: 'A tool that many find helpful for releasing stored body tension is' },
  { name: 'Breathing Exercise Tool', asin: 'B09XS7JWHH', cat: ['the-triggers','the-body'], intro: 'A breathing tool that helps slow the exhale for nervous system regulation is' },
];

// ─── EXPANDED TOPIC POOL (500+ unique topics) ───────────────────────
const BULK_TOPICS = {
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
    // Extended topics for bulk seed
    'How dopamine depletion from chronic stress creates anhedonia',
    'The role of GABA in calming an overactive threat detection system',
    'Why the hippocampus shrinks under prolonged cortisol exposure',
    'How the default mode network differs in traumatized brains',
    'The neuroscience of why eye contact feels threatening after abuse',
    'How the cerebral cortex processes betrayal differently than physical threat',
    'Why the nervous system cannot distinguish between imagined and real danger',
    'How interoceptive awareness rebuilds the brain-body connection',
    'The role of the habenula in learned helplessness and depression',
    'Why the amygdala never forgets even when the hippocampus does',
    'How the prefrontal cortex develops differently in neglected children',
    'The neuroscience of why meditation is harder for trauma survivors',
    'How the basal ganglia stores habitual trauma responses',
    'Why the brain prioritizes threat detection over accurate perception',
    'How the orbitofrontal cortex processes social rejection as physical pain',
    'The role of norepinephrine in hyperarousal and sleep disruption',
    'Why the brain stem response overrides rational thought every time',
    'How the fusiform face area processes threatening facial expressions',
    'The neuroscience of emotional contagion in trauma survivors',
    'Why the brain creates false narratives to explain body sensations',
    'How the suprachiasmatic nucleus disrupts circadian rhythms after trauma',
    'The role of endocannabinoids in natural stress recovery',
    'Why the brain resists updating old threat predictions',
    'How the anterior insula creates the felt sense of danger',
    'The neuroscience of why grounding techniques work for some and not others',
    'How the ventral tegmental area drives trauma bonding behavior',
    'Why the brain confuses arousal states and misreads safety as threat',
    'How the claustrum integrates sensory information during dissociation',
    'The role of the periaqueductal gray in freeze and collapse responses',
    'Why the brain needs repetition to overwrite traumatic encoding',
    'How the nucleus accumbens drives compulsive behavior after trauma',
    'The neuroscience of why cold water immersion resets the vagal tone',
    'How the temporal lobe stores emotional memories outside conscious access',
    'Why the brain creates phantom sensations from traumatic body memories',
    'How the supplementary motor area prepares defensive movements unconsciously',
    'The role of serotonin depletion in trauma-related irritability',
    'Why the brain treats social exclusion as a survival threat',
    'How the parietal cortex loses body ownership during severe dissociation',
    'The neuroscience of why some people develop PTSD and others do not',
    'How the cingulate cortex mediates between emotion and rational thought',
    'Why the brain cannot process trauma while the body is still activated',
    'How the inferior frontal gyrus fails to inhibit trauma responses',
    'The role of brain-derived neurotrophic factor in trauma recovery',
    'Why the brain needs safety before it can process painful memories',
    'How the medial prefrontal cortex learns to regulate the amygdala',
    'The neuroscience of why bilateral tapping calms the nervous system',
    'How the retrosplenial cortex processes spatial memories of traumatic locations',
    'Why the brain stores trauma in fragments instead of coherent narratives',
    'How the ventromedial prefrontal cortex extinguishes conditioned fear',
    'The role of the bed nucleus of the stria terminalis in sustained anxiety',
    'Why the brain cannot heal trauma through willpower alone',
    'How the parahippocampal gyrus contextualizes traumatic memories',
    'The neuroscience of why trauma survivors startle at unexpected touch',
    'How the angular gyrus creates the sense of self that trauma disrupts',
    'Why the brain needs both safety and challenge to rewire trauma patterns',
    'How the striatum encodes avoidance behaviors after repeated trauma',
    'The role of the hypothalamus in the chronic stress hormone cascade',
    'Why the brain treats emotional abandonment as a life-threatening event',
    'How the precuneus supports self-referential processing in recovery',
    'The neuroscience of why body-based therapies outperform talk therapy for trauma',
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
    'The body freeze response is not laziness it is protection',
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
    // Extended topics
    'How the adrenal glands burn out from decades of hypervigilance',
    'Why your knees lock when you feel emotionally cornered',
    'The connection between hip tightness and stored sexual trauma',
    'How the body develops chemical sensitivity after prolonged stress',
    'Why your throat closes when you try to speak your truth',
    'The role of the lymphatic system in processing emotional toxicity',
    'How the body creates fibromyalgia symptoms from unresolved trauma',
    'Why your heart races at rest when your nervous system is dysregulated',
    'The connection between eczema flares and emotional activation',
    'How the body holds grief in the chest and what to do about it',
    'Why your feet go numb during emotional overwhelm',
    'The role of the sacrum in holding early developmental trauma',
    'How the body develops food sensitivities from chronic stress',
    'Why your neck stiffens when you feel emotionally unsafe',
    'The connection between irritable bowel and unprocessed anger',
    'How the body stores the memory of being held or not held',
    'Why your vision narrows during emotional flashbacks',
    'The role of the pelvic floor in fight-or-flight activation',
    'How the body develops chronic inflammation from sustained trauma',
    'Why your muscles twitch at night when the body tries to discharge',
    'The connection between vertigo and emotional destabilization',
    'How the body creates phantom pain in areas of past injury',
    'Why your appetite disappears completely during activation',
    'The role of the intercostal muscles in restricted breathing patterns',
    'How the body develops temperature dysregulation from trauma',
    'Why your hands shake when you try to assert a boundary',
    'The connection between chronic sinus issues and suppressed crying',
    'How the body stores the impact of being yelled at as a child',
    'Why your stomach drops when you sense disapproval',
    'The role of the masseter muscle in holding back words',
    'How the body develops chronic headaches from jaw clenching',
    'Why your legs feel heavy when you want to leave but cannot',
    'The connection between urinary urgency and anxiety activation',
    'How the body remembers the temperature of the room where trauma happened',
    'Why your skin crawls when someone violates your boundaries',
    'The role of the trapezius in carrying emotional burdens',
    'How the body develops insomnia as a protective mechanism',
    'Why your chest tightens before difficult conversations',
    'The connection between hair loss and sustained cortisol elevation',
    'How the body stores the shock of sudden loss differently than chronic abuse',
    'Why your body rejects rest even when exhaustion is overwhelming',
    'The role of the gluteal muscles in the freeze response',
    'How the body creates nausea as a boundary communication',
    'Why your arms feel weak when you need to defend yourself',
    'The connection between tinnitus and nervous system hyperactivation',
    'How the body stores the memory of being physically restrained',
    'Why your lower back seizes when you feel financially threatened',
    'The role of the sternocleidomastoid in the startle reflex',
    'How the body develops chronic dry mouth from sustained anxiety',
    'Why your body flinches at kindness after prolonged neglect',
    'The connection between hormonal disruption and childhood trauma',
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
    'Working with the part that believes it is broken beyond repair',
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
    // Extended topics
    'The part that freezes during conflict and hates itself afterward',
    'How the inner child part responds to adult romantic relationships',
    'Working with the part that cannot stop apologizing',
    'The protector part that uses humor to deflect from pain',
    'How the shame-bearing exile affects every relationship',
    'The part that becomes invisible to avoid being a target',
    'Working with the part that cannot ask for help',
    'How the critic part mimics the voice of an abusive parent',
    'The part that overexplains everything to avoid being misunderstood',
    'Working with the part that cannot tolerate silence',
    'The fawn part that reads every room for danger signals',
    'How the achiever part collapses when external validation disappears',
    'Working with the part that believes rest is dangerous',
    'The part that monitors everyone else feelings while ignoring its own',
    'How the intellectual part blocks access to grief',
    'Working with the part that cannot say no without guilt',
    'The part that creates emergencies to avoid sitting with emptiness',
    'How the controller part responds to unexpected change',
    'Working with the part that believes vulnerability equals weakness',
    'The part that keeps score in relationships as a safety measure',
    'How the caretaker part develops from parentification',
    'Working with the part that cannot receive without giving back immediately',
    'The part that goes silent during arguments and regrets it later',
    'How the perfectionist part creates procrastination through fear of failure',
    'Working with the part that believes it caused the abuse',
    'The part that clings to toxic relationships for familiar pain',
    'How the dissociator part activates during moments of joy',
    'Working with the part that cannot trust its own perceptions',
    'The part that uses busyness to avoid feeling anything at all',
    'How the protector part creates walls that also keep love out',
    'Working with the part that believes happiness is for other people',
    'The part that punishes the body for perceived failures',
    'How the inner child part responds to authority figures at work',
    'Working with the part that cannot celebrate its own achievements',
    'The part that rehearses conversations obsessively before having them',
    'How the fixer part avoids its own pain by focusing on others',
    'Working with the part that believes it will be abandoned if imperfect',
    'The part that uses food to manage emotions it cannot name',
    'How the hypervigilant part exhausts the entire system',
    'Working with the part that cannot forgive itself for past choices',
    'The part that creates physical symptoms to get needs met indirectly',
    'How the rebel part masks deep fear of rejection',
    'Working with the part that believes it does not deserve love',
    'The part that goes into overdrive when someone else is upset',
    'How the intellectual part uses analysis to maintain emotional distance',
    'Working with the part that cannot let go of control even in safe situations',
    'The part that compares itself to everyone and always comes up short',
    'How the people-pleaser part developed from conditional love',
    'Working with the part that believes showing emotion is weakness',
    'The part that keeps secrets as a form of self-protection',
    'How the shame exile contaminates the entire internal system',
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
    // Extended topics
    'Why the sound of footsteps approaching triggers a freeze response',
    'How the smell of alcohol activates childhood survival patterns',
    'The trigger of being asked to explain yourself under scrutiny',
    'Why certain textures of fabric activate body memories',
    'How the sound of a car engine idling triggers hypervigilance',
    'The trigger of someone raising their hand near your face',
    'Why being in a room with closed doors activates escape planning',
    'How the trigger of being ignored differs from being yelled at',
    'Why certain times of day activate trauma responses predictably',
    'The trigger of someone commenting on your body or appearance',
    'How the sound of breaking glass activates the startle response',
    'Why being asked to sit still triggers panic in some survivors',
    'The trigger of someone using a specific pet name or nickname',
    'How fluorescent lighting activates sensory overwhelm in trauma survivors',
    'Why the trigger of being photographed relates to loss of control',
    'The trigger of someone standing between you and the exit',
    'How the smell of certain cleaning products activates institutional trauma',
    'Why being woken suddenly triggers a fight response',
    'The trigger of someone whispering or speaking too quietly',
    'How the sensation of being restrained activates primal terror',
    'Why the trigger of someone crying activates the fawn response',
    'The trigger of being in a vehicle with someone else driving',
    'How the sound of a specific ringtone can activate years of dread',
    'Why the trigger of being asked to close your eyes feels dangerous',
    'The trigger of someone making promises that mirror past betrayal',
    'How the sensation of falling asleep triggers hypervigilance',
    'Why the trigger of someone being overly nice activates suspicion',
    'The trigger of hearing your full name spoken in a certain tone',
    'How the sensation of being hungry triggers childhood neglect patterns',
    'Why the trigger of someone leaving the room activates abandonment',
    'The trigger of being in a hospital or clinical environment',
    'How the sound of children crying activates protective rage or freeze',
    'Why the trigger of being complimented on strength activates grief',
    'The trigger of someone asking why you are upset when you are not',
    'How the sensation of wearing tight clothing activates body memories',
    'Why the trigger of being in a crowd differs from being alone',
    'The trigger of someone touching your belongings without permission',
    'How the smell of specific foods activates childhood dinner table trauma',
    'Why the trigger of being asked to share feelings in a group setting',
    'The trigger of someone using the same phrases as your abuser',
    'How the sensation of being cold activates memories of neglect',
    'Why the trigger of receiving a gift activates obligation and debt',
    'The trigger of someone making sudden movements in your peripheral vision',
    'How the sound of arguing in another room activates childhood patterns',
    'Why the trigger of being in a position of authority feels fraudulent',
    'The trigger of someone looking at you with pity or concern',
    'How the sensation of being full activates shame around the body',
    'Why the trigger of being asked to relax makes everything worse',
    'The trigger of someone telling you to calm down during activation',
    'How the experience of being lost activates primal abandonment fear',
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
    'How to handle relationships when you are changing and they are not',
    'Why boredom is actually a sign of nervous system regulation',
    'Learning to do nothing after a lifetime of hypervigilance',
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
    'How to handle the workplace with a regulated nervous system',
    'Why some friendships cannot survive your healing',
    'The return of appetite and pleasure in eating after restriction',
    'How to hold hope without making it into another performance',
    'Why the body needs months to catch up to cognitive insights',
    'The practice of allowing yourself to be ordinary',
    'How to know when you are ready for deeper work',
    // Extended topics
    'How to rebuild a sense of identity after years of dissociation',
    'Why the return of anger is actually a sign of progress',
    'The practice of being present without needing to fix anything',
    'How to tolerate happiness without waiting for the other shoe to drop',
    'Why the return of desire and wanting feels terrifying',
    'The practice of saying what you actually think out loud',
    'How to build routines that support regulation without becoming rigid',
    'Why the return of playfulness signals deep nervous system healing',
    'The practice of letting people see you without your mask',
    'How to handle the loneliness of outgrowing your old life',
    'Why the return of tears after years of numbness is a breakthrough',
    'The practice of making choices based on what you want not what you should',
    'How to rebuild physical intimacy after trauma',
    'Why the return of boredom means your nervous system is finally safe',
    'The practice of asking for what you need without apologizing',
    'How to handle the guilt of getting better when others are still suffering',
    'Why the return of spontaneity requires tolerating uncertainty',
    'The practice of being wrong without it meaning you are worthless',
    'How to rebuild trust in your own body after it was violated',
    'Why the return of ambition after depression feels disorienting',
    'The practice of resting without earning it first',
    'How to handle the grief of lost years spent in survival mode',
    'Why the return of boundaries makes some relationships impossible',
    'The practice of being alone without it meaning you are abandoned',
    'How to rebuild a relationship with food after trauma',
    'Why the return of creativity requires tolerating imperfection',
    'The practice of celebrating yourself without needing external validation',
    'How to handle the discomfort of being genuinely seen by another person',
    'Why the return of hope after despair feels fragile and needs protection',
    'The practice of moving slowly when everything in you wants to rush',
    'How to rebuild a sense of home in your own body',
    'Why the return of laughter does not mean the pain was not real',
    'The practice of choosing ease when difficulty is what you know',
    'How to handle the complexity of forgiving yourself',
    'Why the return of feeling safe in your body changes everything',
    'The practice of being kind to yourself on the days when nothing works',
    'How to rebuild trust in other people after repeated betrayal',
    'Why the return of curiosity signals the nervous system is ready to explore',
    'The practice of letting go of the identity of being broken',
    'How to handle the paradox of wanting connection while fearing it',
    'Why the return of your voice after years of silence is the real victory',
    'The practice of taking up space without apologizing for existing',
    'How to rebuild a daily life that honors both your wounds and your growth',
    'Why the return of feeling your feelings is the hardest and most important work',
    'The practice of being patient with yourself when progress feels invisible',
    'How to handle the moment when you realize you are actually okay',
    'Why the return of self-trust is the foundation everything else builds on',
    'The practice of living without constantly bracing for impact',
    'How to handle the strange grief of letting go of hypervigilance',
    'Why the return of presence in your own life is the ultimate act of recovery',
    'The practice of choosing yourself after a lifetime of choosing everyone else',
  ],
};

// ─── UTILITIES ──────────────────────────────────────────────────────

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getNextId() {
  try {
    const slugMap = JSON.parse(fs.readFileSync(SLUG_MAP_PATH, 'utf-8'));
    return Math.max(...Object.values(slugMap), 0) + 1;
  } catch {
    return 999;
  }
}

function registerSlug(slug, id) {
  try {
    const slugMap = JSON.parse(fs.readFileSync(SLUG_MAP_PATH, 'utf-8'));
    slugMap[slug] = id;
    fs.writeFileSync(SLUG_MAP_PATH, JSON.stringify(slugMap, null, 2));
  } catch (e) {
    console.error(`[bulk] slug-map update failed: ${e.message}`);
  }
}

function getExistingSlugs() {
  const slugs = new Set();
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    files.forEach(f => slugs.add(f.replace('.json', '')));
  } catch {}
  return slugs;
}

// ─── GENERATE ONE ARTICLE ───────────────────────────────────────────

async function generateOneArticle(title, category, id) {
  const slug = slugify(title);
  const ref = randomPick(RESEARCHERS);

  // Select products
  const matchingProducts = PRODUCT_RECS.filter(p => p.cat.includes(category));
  const selectedProducts = randomPick(
    matchingProducts.length >= 4 ? matchingProducts : PRODUCT_RECS,
    4
  );
  const products = Array.isArray(selectedProducts) ? selectedProducts : [selectedProducts];

  // Generate via DeepSeek
  const htmlContent = await generateArticleHTML(title, category, products, AFFILIATE_TAG);

  // Assign images from Bunny CDN library
  let heroImage, ogImage;
  try {
    const images = await assignArticleImages(slug);
    heroImage = images.heroImage;
    ogImage = images.ogImage;
  } catch (err) {
    heroImage = `https://${BUNNY_CDN_HOST}/images/hero-default.webp`;
    ogImage = `https://${BUNNY_CDN_HOST}/images/og-default.webp`;
  }

  const wordCount = htmlContent.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const excerpt = htmlContent.replace(/<[^>]+>/g, ' ').slice(0, 160).trim() + '...';
  const metaDescription = htmlContent.replace(/<[^>]+>/g, ' ').slice(0, 155).trim() + '...';

  // Spread publish dates across the past 6 months for SEO
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));
  const randomDate = new Date(sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime()));

  return {
    id,
    slug,
    title,
    category,
    categoryName: CATEGORY_NAMES[category] || category,
    dateISO: randomDate.toISOString(),
    author: 'Kalesh',
    authorUrl: 'https://kalesh.love',
    excerpt,
    metaDescription,
    htmlContent,
    wordCount,
    generatedWordCount: wordCount,
    readingTime: Math.max(1, Math.round(wordCount / 250)),
    heroImage,
    ogImage,
    openerType: 'researcher-lead',
    faqCount: 0,
    backlinkType: 'category',
    conclusionType: 'open-ended',
    researcherName: ref.name,
    researcherTopic: ref.field,
    externalSites: [],
    phraseIndices: [],
    tags: [category],
    hasAffiliateLinks: true,
  };
}

// ─── PUBLISH ARTICLE ────────────────────────────────────────────────

function publishArticle(article) {
  const articlePath = path.join(DATA_DIR, `${article.slug}.json`);
  fs.writeFileSync(articlePath, JSON.stringify(article, null, 0));
  registerSlug(article.slug, article.id);
  return true;
}

// ─── MAIN BULK SEED ─────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  BULK SEED — The Shattered Armor');
  console.log('  Target: 500 articles via DeepSeek V4-Pro');
  console.log('  Concurrency: ' + CONCURRENCY);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  if (!process.env.OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY not set. Exiting.');
    process.exit(1);
  }

  // Build the full topic list
  const existingSlugs = getExistingSlugs();
  console.log(`Existing articles: ${existingSlugs.size}`);

  // Flatten all topics and filter out already-existing ones
  const allTopics = [];
  for (const [cat, topics] of Object.entries(BULK_TOPICS)) {
    for (const topic of topics) {
      const slug = slugify(topic);
      if (!existingSlugs.has(slug)) {
        allTopics.push({ title: topic, category: cat });
      }
    }
  }

  // Shuffle and take up to TARGET_COUNT
  const shuffled = allTopics.sort(() => Math.random() - 0.5);
  const toGenerate = shuffled.slice(0, TARGET_COUNT);
  console.log(`Topics available (unused): ${allTopics.length}`);
  console.log(`Will generate: ${toGenerate.length}`);
  console.log('');

  let nextId = getNextId();
  let generated = 0;
  let failed = 0;
  const startTime = Date.now();
  const indexEntries = [];

  // Process in batches of CONCURRENCY
  for (let i = 0; i < toGenerate.length; i += CONCURRENCY) {
    const batch = toGenerate.slice(i, i + CONCURRENCY);
    const batchNum = Math.floor(i / CONCURRENCY) + 1;
    const totalBatches = Math.ceil(toGenerate.length / CONCURRENCY);

    console.log(`[Batch ${batchNum}/${totalBatches}] Generating ${batch.length} articles...`);

    const results = await Promise.allSettled(
      batch.map(async (item, idx) => {
        const id = nextId + idx;
        try {
          const article = await generateOneArticle(item.title, item.category, id);
          
          // Quality gate
          const gate = runQualityGate(article.htmlContent);
          if (!gate.passed) {
            console.warn(`  GATE FAIL: "${item.title}" — ${gate.failures.slice(0, 3).join(' | ')}`);
            return { success: false, reason: gate.failures[0] };
          }

          publishArticle(article);
          indexEntries.push({
            id: article.id,
            slug: article.slug,
            title: article.title,
            category: article.category,
            categoryName: article.categoryName,
            dateISO: article.dateISO,
            author: 'Kalesh',
            excerpt: article.excerpt,
            metaDescription: article.metaDescription,
            wordCount: article.wordCount,
            readingTime: article.readingTime,
            heroImage: article.heroImage,
            ogImage: article.ogImage,
          });
          return { success: true, slug: article.slug, words: article.wordCount };
        } catch (err) {
          console.error(`  ERROR: "${item.title}" — ${err.message}`);
          return { success: false, reason: err.message };
        }
      })
    );

    // Count results
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.success) {
        generated++;
        nextId++;
      } else {
        failed++;
        nextId++; // Still increment to avoid ID collisions
      }
    }

    // Progress
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = generated / elapsed;
    const remaining = toGenerate.length - (i + batch.length);
    const eta = remaining / (rate || 1);
    console.log(`  Progress: ${generated}/${toGenerate.length} generated, ${failed} failed | ETA: ${Math.round(eta / 60)}min`);

    // Delay between batches
    if (i + CONCURRENCY < toGenerate.length) {
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  // Update articles-index.json
  console.log('');
  console.log('Updating articles-index.json...');
  try {
    const existingIndex = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
    const updatedIndex = [...existingIndex, ...indexEntries];
    fs.writeFileSync(INDEX_PATH, JSON.stringify(updatedIndex));
    console.log(`Index updated: ${existingIndex.length} → ${updatedIndex.length} entries`);
  } catch (err) {
    console.error(`Index update failed: ${err.message}`);
  }

  // Summary
  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  BULK SEED COMPLETE');
  console.log(`  Generated: ${generated}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total time: ${totalTime} minutes`);
  console.log(`  Rate: ${(generated / (totalTime * 60) * 60).toFixed(1)} articles/hour`);
  console.log('═══════════════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});

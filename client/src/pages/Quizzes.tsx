/*
 * Quizzes Page — 8 interactive quizzes for C-PTSD self-exploration
 * Client-side only, nothing stored. Results on screen + PDF download.
 */

import { useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import HealthDisclaimer from "@/components/HealthDisclaimer";
import { SITE } from "@/lib/articles";

interface Question {
  text: string;
  options: { label: string; score: number }[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  ranges: { min: number; max: number; label: string; text: string }[];
}

const QUIZZES: Quiz[] = [
  {
    id: "fight-flight-freeze-fawn",
    title: "What Is Your Dominant Trauma Response?",
    description: "Based on Pete Walker's four F responses. Discover whether fight, flight, freeze, or fawn is your primary survival strategy.",
    questions: [
      { text: "When someone criticizes you unfairly, your first instinct is to:", options: [{ label: "Push back and defend yourself immediately", score: 1 }, { label: "Get busy with something else to avoid the feeling", score: 2 }, { label: "Go blank and shut down internally", score: 3 }, { label: "Apologize and try to fix the situation", score: 4 }] },
      { text: "In a group conflict, you tend to:", options: [{ label: "Take charge and confront the issue head-on", score: 1 }, { label: "Find an excuse to leave or stay distracted", score: 2 }, { label: "Withdraw and become very quiet", score: 3 }, { label: "Mediate and try to make everyone happy", score: 4 }] },
      { text: "When you feel emotionally overwhelmed, you:", options: [{ label: "Feel angry and want to control the situation", score: 1 }, { label: "Throw yourself into work or exercise", score: 2 }, { label: "Feel numb, foggy, or disconnected", score: 3 }, { label: "Focus on what others need instead of yourself", score: 4 }] },
      { text: "Your relationship pattern tends toward:", options: [{ label: "Being dominant or controlling", score: 1 }, { label: "Staying too busy for deep connection", score: 2 }, { label: "Avoiding intimacy or going silent", score: 3 }, { label: "Losing yourself in the other person's needs", score: 4 }] },
      { text: "When you feel unsafe, your body:", options: [{ label: "Tenses up, jaw clenches, fists tighten", score: 1 }, { label: "Gets restless, fidgety, needs to move", score: 2 }, { label: "Goes heavy, tired, hard to move", score: 3 }, { label: "Becomes hyper-aware of others' moods", score: 4 }] },
      { text: "Your inner critic most often says:", options: [{ label: "You need to be stronger and fight harder", score: 1 }, { label: "You're not doing enough, work harder", score: 2 }, { label: "There's no point, nothing will change", score: 3 }, { label: "You're being selfish if you don't help", score: 4 }] },
    ],
    ranges: [
      { min: 6, max: 10, label: "Fight-Dominant", text: "Your primary trauma response is Fight. You tend to meet perceived threats with assertion, control, and boundary enforcement. In its healthy form, this is strength and advocacy. In its traumatized form, it can become reactive anger or compulsive dominance. The work for fight types involves learning to distinguish between real threats and triggered responses, and developing the capacity to feel vulnerability without immediately armoring up." },
      { min: 11, max: 14, label: "Flight-Dominant", text: "Your primary trauma response is Flight. You tend to manage distress through activity — workaholism, perfectionism, constant busyness. The flight response says: if I keep moving, I won't have to feel what's underneath. The work for flight types involves learning to tolerate stillness, recognizing that productivity can be a form of avoidance, and gradually building capacity to sit with uncomfortable emotions." },
      { min: 15, max: 18, label: "Freeze-Dominant", text: "Your primary trauma response is Freeze. You tend to shut down, dissociate, or go numb when overwhelmed. This is not laziness — it is a nervous system that learned immobility as the safest survival strategy. The work for freeze types involves gentle, titrated activation — slowly building the body's capacity to tolerate sensation and movement without overwhelming the system." },
      { min: 19, max: 24, label: "Fawn-Dominant", text: "Your primary trauma response is Fawn. You tend to manage safety through people-pleasing, codependency, and self-abandonment. The fawn response developed because your safety depended on managing others' emotional states. The work for fawn types involves learning to identify your own needs, practicing saying no, and tolerating the discomfort of disappointing others." },
    ],
  },
  {
    id: "nervous-system-state",
    title: "Where Is Your Nervous System Right Now?",
    description: "A polyvagal-informed check-in. Map your current state across the three branches of the autonomic nervous system.",
    questions: [
      { text: "Right now, your breathing is:", options: [{ label: "Relaxed and natural", score: 3 }, { label: "Shallow and quick", score: 2 }, { label: "Barely noticeable or held", score: 1 }] },
      { text: "Your body feels:", options: [{ label: "Comfortable and present", score: 3 }, { label: "Tense, restless, or on edge", score: 2 }, { label: "Heavy, numb, or disconnected", score: 1 }] },
      { text: "If someone spoke to you right now, you would:", options: [{ label: "Engage easily and make eye contact", score: 3 }, { label: "Feel irritated or want to be left alone", score: 2 }, { label: "Struggle to respond or feel far away", score: 1 }] },
      { text: "Your thoughts are:", options: [{ label: "Clear and focused", score: 3 }, { label: "Racing or scanning for threats", score: 2 }, { label: "Foggy, blank, or scattered", score: 1 }] },
      { text: "Your jaw and shoulders are:", options: [{ label: "Relaxed", score: 3 }, { label: "Clenched or raised", score: 2 }, { label: "You can't really feel them", score: 1 }] },
    ],
    ranges: [
      { min: 5, max: 8, label: "Dorsal Vagal (Shutdown)", text: "Your nervous system appears to be in a dorsal vagal state — the shutdown or freeze response. This is characterized by numbness, disconnection, fatigue, and difficulty engaging. This is not a character flaw. It is your nervous system's oldest survival strategy. Gentle movement, warm drinks, and orienting to your environment (naming 5 things you can see) can help your system begin to come back online." },
      { min: 9, max: 12, label: "Sympathetic (Mobilized)", text: "Your nervous system appears to be in sympathetic activation — the fight-or-flight state. You may feel tense, restless, hypervigilant, or irritable. Your body is mobilized for action. Slow exhale breathing (longer exhale than inhale), bilateral movement like walking, and grounding through your feet can help your system shift toward safety." },
      { min: 13, max: 15, label: "Ventral Vagal (Safe & Social)", text: "Your nervous system appears to be in a ventral vagal state — the state of safety and social engagement. You feel present, connected, and capable of engaging with others. This is the state from which healing happens. Notice what conditions helped you arrive here — environment, people, activities — and use that information to build more ventral vagal access over time." },
    ],
  },
  {
    id: "inner-critic-type",
    title: "What Type of Inner Critic Do You Have?",
    description: "Identify the dominant voice of your inner critic and understand its origin in your survival system.",
    questions: [
      { text: "Your inner critic most often tells you:", options: [{ label: "You're not good enough", score: 1 }, { label: "You need to try harder", score: 2 }, { label: "Something bad is about to happen", score: 3 }, { label: "Everyone will leave you", score: 4 }] },
      { text: "When you make a mistake, you:", options: [{ label: "Feel deep shame and want to hide", score: 1 }, { label: "Immediately try to fix it perfectly", score: 2 }, { label: "Catastrophize about consequences", score: 3 }, { label: "Worry about how others will react", score: 4 }] },
      { text: "Your critic sounds most like:", options: [{ label: "A harsh judge pronouncing you worthless", score: 1 }, { label: "A demanding taskmaster pushing for more", score: 2 }, { label: "An anxious voice warning of danger", score: 3 }, { label: "A voice saying you'll be abandoned", score: 4 }] },
      { text: "The critic is loudest when:", options: [{ label: "You're vulnerable or exposed", score: 1 }, { label: "You're resting or not productive", score: 2 }, { label: "Something unexpected happens", score: 3 }, { label: "You set a boundary with someone", score: 4 }] },
      { text: "The critic's ultimate threat is:", options: [{ label: "You are fundamentally broken", score: 1 }, { label: "You will fail and be exposed", score: 2 }, { label: "Something terrible is coming", score: 3 }, { label: "You will end up completely alone", score: 4 }] },
    ],
    ranges: [
      { min: 5, max: 8, label: "The Shaming Critic", text: "Your inner critic operates primarily through shame — attacking your fundamental worth and identity. This critic often originates from environments where you were made to feel inherently defective. The antidote is not positive affirmations (which the critic will reject) but rather developing the capacity to witness the critic's voice without fusing with it. IFS therapy calls this 'unblending' from the critic part." },
      { min: 9, max: 12, label: "The Perfectionist Critic", text: "Your inner critic operates through impossible standards and relentless demands for achievement. This critic often develops in environments where love was conditional on performance. The work involves recognizing that rest is not laziness, that good enough is actually good enough, and that your worth is not determined by your output." },
      { min: 13, max: 16, label: "The Catastrophizing Critic", text: "Your inner critic operates through hypervigilance and worst-case thinking. This critic developed to keep you safe by anticipating every possible threat. The work involves learning to distinguish between genuine danger signals and the critic's habitual scanning, and building tolerance for uncertainty." },
      { min: 17, max: 20, label: "The Abandonment Critic", text: "Your inner critic operates through fear of rejection and isolation. This critic developed in environments where connection was unreliable or conditional. The work involves building a secure internal base — learning that you can survive disapproval, that boundaries don't destroy relationships, and that your worth doesn't depend on others' approval." },
    ],
  },
  {
    id: "attachment-style",
    title: "What Is Your Attachment Pattern?",
    description: "Explore your relational patterns through the lens of attachment theory and understand how early bonds shape adult connections.",
    questions: [
      { text: "In close relationships, you tend to:", options: [{ label: "Feel comfortable with intimacy and independence", score: 4 }, { label: "Worry about being abandoned or not loved enough", score: 1 }, { label: "Feel uncomfortable when people get too close", score: 2 }, { label: "Want closeness but push people away when they get near", score: 3 }] },
      { text: "When your partner is unavailable, you:", options: [{ label: "Feel okay and trust they'll return", score: 4 }, { label: "Feel anxious and need reassurance", score: 1 }, { label: "Feel relieved to have space", score: 2 }, { label: "Feel both relieved and anxious simultaneously", score: 3 }] },
      { text: "Your deepest relationship fear is:", options: [{ label: "You don't have a dominant fear about relationships", score: 4 }, { label: "Being abandoned or not being enough", score: 1 }, { label: "Losing your independence or being engulfed", score: 2 }, { label: "Being hurt if you let someone in", score: 3 }] },
      { text: "When conflict arises, you:", options: [{ label: "Address it directly and work toward resolution", score: 4 }, { label: "Pursue the other person for reassurance", score: 1 }, { label: "Withdraw and need space to process", score: 2 }, { label: "Alternate between pursuing and withdrawing", score: 3 }] },
      { text: "Your childhood caregivers were:", options: [{ label: "Generally consistent and responsive", score: 4 }, { label: "Inconsistent — sometimes present, sometimes absent", score: 1 }, { label: "Emotionally distant or dismissive", score: 2 }, { label: "Frightening or confusing", score: 3 }] },
    ],
    ranges: [
      { min: 5, max: 8, label: "Anxious-Preoccupied", text: "Your attachment pattern leans anxious-preoccupied. You tend to seek closeness and reassurance in relationships, sometimes at the cost of your own autonomy. This pattern often develops when caregivers were inconsistently available. The nervous system learned that connection requires vigilance. The work involves building self-regulation capacity so that your sense of safety doesn't depend entirely on another person's availability." },
      { min: 9, max: 12, label: "Dismissive-Avoidant", text: "Your attachment pattern leans dismissive-avoidant. You tend to value independence and may feel uncomfortable with deep emotional intimacy. This pattern often develops when caregivers were emotionally unavailable. The nervous system learned that self-reliance was safer than depending on others. The work involves gradually allowing vulnerability and recognizing that needing others is not weakness." },
      { min: 13, max: 16, label: "Fearful-Avoidant (Disorganized)", text: "Your attachment pattern leans fearful-avoidant, also called disorganized attachment. You want closeness but fear it simultaneously. This pattern often develops when caregivers were both the source of comfort and the source of threat. The work involves building a coherent narrative of your relational history and developing the capacity to tolerate the vulnerability that intimacy requires." },
      { min: 17, max: 20, label: "Secure (Earned)", text: "Your attachment pattern appears relatively secure. You're comfortable with both intimacy and independence. If you came from a difficult background, this may be 'earned security' — security developed through therapeutic work, healthy relationships, or deep self-awareness. This is a significant achievement." },
    ],
  },
  {
    id: "emotional-flashback",
    title: "Are You Having an Emotional Flashback?",
    description: "Pete Walker identified emotional flashbacks as the hallmark of C-PTSD. This quiz helps you recognize when you're in one.",
    questions: [
      { text: "Right now, do you feel suddenly small, young, or helpless?", options: [{ label: "Not at all", score: 0 }, { label: "Somewhat", score: 1 }, { label: "Strongly", score: 2 }] },
      { text: "Is your emotional reaction bigger than the current situation warrants?", options: [{ label: "My reaction matches the situation", score: 0 }, { label: "It might be slightly disproportionate", score: 1 }, { label: "Yes, this feels way too big for what happened", score: 2 }] },
      { text: "Do you feel a familiar shame, fear, or abandonment that you can't quite explain?", options: [{ label: "No", score: 0 }, { label: "There's something familiar about this feeling", score: 1 }, { label: "Yes, this is a feeling I know well", score: 2 }] },
      { text: "Is your inner critic particularly loud right now?", options: [{ label: "Not especially", score: 0 }, { label: "Louder than usual", score: 1 }, { label: "Relentless and harsh", score: 2 }] },
      { text: "Do you feel like you need to fight, flee, freeze, or people-please right now?", options: [{ label: "I feel relatively calm", score: 0 }, { label: "I notice some activation", score: 1 }, { label: "I'm strongly pulled toward a survival response", score: 2 }] },
      { text: "Does the world feel unsafe or threatening in a way that doesn't match your actual environment?", options: [{ label: "I feel reasonably safe", score: 0 }, { label: "Something feels off", score: 1 }, { label: "Yes, I feel unsafe even though I know I'm not in danger", score: 2 }] },
    ],
    ranges: [
      { min: 0, max: 3, label: "Not Currently in Flashback", text: "Based on your responses, you don't appear to be in an emotional flashback right now. Your emotional responses seem proportionate to your current situation. This is a good time to practice grounding techniques so they're available when you need them." },
      { min: 4, max: 7, label: "Mild Emotional Flashback", text: "You may be experiencing a mild emotional flashback. Some of your responses suggest that past emotional patterns are coloring your present experience. Try Pete Walker's 13 steps: remind yourself that you are having a flashback, that the feeling will pass, and that you are safe now. Slow your breathing. Feel your feet on the ground." },
      { min: 8, max: 12, label: "Significant Emotional Flashback", text: "You appear to be in a significant emotional flashback. The feelings you're experiencing right now likely belong more to the past than to the present. This is not your fault. Your nervous system is replaying an old survival pattern. Right now: name 5 things you can see. Feel the surface beneath you. Remind yourself of your actual age and location. You survived what happened then. You are safe now." },
    ],
  },
  {
    id: "window-of-tolerance",
    title: "How Wide Is Your Window of Tolerance?",
    description: "Dan Siegel's window of tolerance describes the zone where you can process emotions without becoming overwhelmed or shutting down.",
    questions: [
      { text: "How often do you feel emotionally overwhelmed by everyday situations?", options: [{ label: "Rarely", score: 3 }, { label: "Sometimes", score: 2 }, { label: "Frequently", score: 1 }] },
      { text: "When something stressful happens, how quickly do you recover?", options: [{ label: "Within minutes to hours", score: 3 }, { label: "It takes most of a day", score: 2 }, { label: "Days or longer", score: 1 }] },
      { text: "Can you identify and name your emotions as they arise?", options: [{ label: "Usually, yes", score: 3 }, { label: "Sometimes, but they often feel confusing", score: 2 }, { label: "I often feel numb or can't identify what I'm feeling", score: 1 }] },
      { text: "How often do you swing between intense emotions and numbness?", options: [{ label: "Rarely", score: 3 }, { label: "Sometimes", score: 2 }, { label: "This is my normal pattern", score: 1 }] },
      { text: "Can you stay present during difficult conversations?", options: [{ label: "Most of the time", score: 3 }, { label: "I struggle but manage", score: 2 }, { label: "I usually shut down or become reactive", score: 1 }] },
      { text: "How is your sleep?", options: [{ label: "Generally restful", score: 3 }, { label: "Disrupted but functional", score: 2 }, { label: "Severely disrupted — nightmares, insomnia, or oversleeping", score: 1 }] },
    ],
    ranges: [
      { min: 6, max: 9, label: "Narrow Window", text: "Your window of tolerance appears quite narrow right now. You may frequently oscillate between hyperarousal (anxiety, reactivity, overwhelm) and hypoarousal (numbness, shutdown, dissociation). This is common in C-PTSD and is not a personal failing. Somatic practices, polyvagal exercises, and titrated exposure to emotion can gradually widen your window. Consider working with a trauma-informed therapist who understands nervous system regulation." },
      { min: 10, max: 14, label: "Moderate Window", text: "Your window of tolerance is moderate — you can handle some stress but may get pushed outside your window by triggers or accumulated pressure. You likely have some regulation strategies that work but may not be consistent. Building a daily regulation practice (breathwork, movement, grounding) can help widen your window over time." },
      { min: 15, max: 18, label: "Wide Window", text: "Your window of tolerance appears relatively wide. You can generally process emotions without becoming overwhelmed or shutting down. This may reflect natural resilience, effective therapy, or years of practice. Continue the practices that support your regulation and be aware that stress, illness, or life changes can temporarily narrow even a wide window." },
    ],
  },
  {
    id: "somatic-awareness",
    title: "How Connected Are You to Your Body?",
    description: "Trauma often disconnects us from bodily sensation. This quiz explores your level of somatic awareness and interoception.",
    questions: [
      { text: "Can you feel your heartbeat without taking your pulse?", options: [{ label: "Yes, easily", score: 3 }, { label: "If I focus, sometimes", score: 2 }, { label: "No, I can't feel it", score: 1 }] },
      { text: "Do you notice hunger and thirst signals before they become urgent?", options: [{ label: "Usually", score: 3 }, { label: "Sometimes I forget to eat or drink", score: 2 }, { label: "I often don't notice until I'm starving or dehydrated", score: 1 }] },
      { text: "When you feel an emotion, can you locate it in your body?", options: [{ label: "Yes — I can feel where emotions live", score: 3 }, { label: "Sometimes, with certain emotions", score: 2 }, { label: "Emotions feel more like thoughts than body sensations", score: 1 }] },
      { text: "How aware are you of tension in your body throughout the day?", options: [{ label: "I notice and can release it", score: 3 }, { label: "I notice it but can't always release it", score: 2 }, { label: "I usually don't notice until pain develops", score: 1 }] },
      { text: "Can you feel the difference between anxiety and excitement in your body?", options: [{ label: "Yes, they feel different to me", score: 3 }, { label: "They feel similar but I can sometimes tell", score: 2 }, { label: "They feel the same or I can't tell", score: 1 }] },
    ],
    ranges: [
      { min: 5, max: 8, label: "Low Somatic Awareness", text: "Your connection to bodily sensation appears limited. This is extremely common in trauma survivors — disconnection from the body is a survival strategy. The body held too much pain, so the mind learned to leave. Rebuilding this connection is central to trauma recovery. Start gently: body scans, warm baths, noticing the feeling of your feet on the ground. Peter Levine's work on somatic experiencing is particularly relevant for you." },
      { min: 9, max: 12, label: "Developing Somatic Awareness", text: "You have some connection to your body but it's inconsistent. You may notice certain sensations (like tension or pain) but miss subtler signals (like the early stages of emotional activation). This is a good foundation to build on. Regular body-based practices — yoga, tai chi, walking meditation — can strengthen your interoceptive capacity." },
      { min: 13, max: 15, label: "Strong Somatic Awareness", text: "You have a well-developed connection to your body's signals. You can feel emotions as physical sensations and notice subtle shifts in your internal state. This is a significant resource for trauma recovery. Your body is giving you real-time information about your nervous system state. Trust it." },
    ],
  },
  {
    id: "self-compassion",
    title: "How Do You Treat Yourself When You're Struggling?",
    description: "Self-compassion is one of the strongest predictors of trauma recovery. This quiz explores your relationship with yourself during difficulty.",
    questions: [
      { text: "When you make a mistake, your first response is:", options: [{ label: "I try to be kind to myself", score: 3 }, { label: "I feel bad but move on", score: 2 }, { label: "I criticize myself harshly", score: 1 }] },
      { text: "When you're in pain, you:", options: [{ label: "Acknowledge it and allow yourself to feel it", score: 3 }, { label: "Try to push through", score: 2 }, { label: "Tell yourself others have it worse", score: 1 }] },
      { text: "Do you believe you deserve care and compassion?", options: [{ label: "Yes, as much as anyone", score: 3 }, { label: "Intellectually yes, but it's hard to feel", score: 2 }, { label: "Not really", score: 1 }] },
      { text: "When a friend is struggling, compared to when you are struggling:", options: [{ label: "I treat myself with similar kindness", score: 3 }, { label: "I'm somewhat kinder to friends", score: 2 }, { label: "I'm much kinder to others than to myself", score: 1 }] },
      { text: "Can you comfort yourself when you're upset?", options: [{ label: "Yes, I have ways to soothe myself", score: 3 }, { label: "Sometimes, but it's inconsistent", score: 2 }, { label: "I don't know how or it feels wrong", score: 1 }] },
      { text: "When you think about your trauma history, you feel:", options: [{ label: "Compassion for what you went through", score: 3 }, { label: "A mix of understanding and self-blame", score: 2 }, { label: "Mostly shame or self-blame", score: 1 }] },
    ],
    ranges: [
      { min: 6, max: 9, label: "Low Self-Compassion", text: "Your relationship with yourself during difficulty is harsh. This is not a character flaw — it is a direct consequence of growing up in an environment where compassion was absent or conditional. The inner critic took the place of the nurturing caregiver you needed. Kristin Neff's research shows that self-compassion is a skill that can be developed. Start with one practice: place your hand on your heart when you notice the critic, and say 'this is a moment of suffering.' It will feel awkward. Do it anyway." },
      { min: 10, max: 14, label: "Developing Self-Compassion", text: "You have some capacity for self-compassion but it's inconsistent. You may be kinder to yourself on good days and harsher during stress or activation. This is normal in recovery. The gap between how you treat others and how you treat yourself is narrowing. Keep practicing. Tara Brach's RAIN technique (Recognize, Allow, Investigate, Nurture) is particularly effective at this stage." },
      { min: 15, max: 18, label: "Strong Self-Compassion", text: "You have developed a genuinely compassionate relationship with yourself. You can hold your own suffering with tenderness rather than judgment. This is one of the most significant achievements in trauma recovery. Self-compassion is not self-indulgence — it is the foundation from which all other healing grows. Your nervous system is learning that you are safe with yourself." },
    ],
  },
];

function generatePDF(quiz: Quiz, score: number, result: { label: string; text: string }) {
  const content = `
THE SHATTERED ARMOR — QUIZ RESULTS
====================================

Quiz: ${quiz.title}
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Score: ${score}
Result: ${result.label}

${result.text}

---

DISCLAIMER: This quiz is for educational and self-exploration purposes only.
It is not a diagnostic tool and does not replace professional assessment.
Always consult a qualified healthcare provider for clinical guidance.

Visit: https://shatteredarmor.com
Author: Kalesh — Consciousness Teacher & Writer
Website: https://kalesh.love
  `.trim();

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shattered-armor-${quiz.id}-results.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function QuizComponent({ quiz }: { quiz: Quiz }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleAnswer = (qIdx: number, score: number) => {
    setAnswers(prev => ({ ...prev, [qIdx]: score }));
  };

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const allAnswered = Object.keys(answers).length === quiz.questions.length;

  const result = quiz.ranges.find(r => totalScore >= r.min && totalScore <= r.max) || quiz.ranges[quiz.ranges.length - 1];

  const handleSubmit = () => {
    setShowResult(true);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleReset = () => {
    setAnswers({});
    setShowResult(false);
  };

  return (
    <div className="mb-12 p-6 rounded-lg border" style={{ background: 'oklch(0.98 0.005 80)', borderColor: 'oklch(0.90 0.02 80)' }}>
      <h2 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>{quiz.title}</h2>
      <p className="text-sm text-muted-foreground mb-6">{quiz.description}</p>

      {quiz.questions.map((q, qIdx) => (
        <div key={qIdx} className="mb-6">
          <p className="text-sm font-medium mb-3">{qIdx + 1}. {q.text}</p>
          <div className="space-y-2 pl-4">
            {q.options.map((opt, oIdx) => (
              <label key={oIdx} className="flex items-start gap-3 text-sm cursor-pointer group">
                <input
                  type="radio"
                  name={`${quiz.id}-q${qIdx}`}
                  checked={answers[qIdx] === opt.score}
                  onChange={() => handleAnswer(qIdx, opt.score)}
                  className="mt-0.5 accent-current"
                  style={{ accentColor: 'oklch(0.55 0.10 80)' }}
                />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {!showResult && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="px-6 py-2 rounded text-sm font-medium transition-all disabled:opacity-40"
          style={{
            background: allAnswered ? 'oklch(0.45 0.04 80)' : 'oklch(0.80 0.02 80)',
            color: allAnswered ? 'oklch(0.97 0.005 80)' : 'oklch(0.60 0.02 80)',
          }}
        >
          {allAnswered ? 'See My Results' : `Answer all ${quiz.questions.length} questions`}
        </button>
      )}

      {showResult && result && (
        <div ref={resultRef} className="mt-6 p-5 rounded-lg border" style={{ background: 'oklch(0.96 0.02 80)', borderColor: 'oklch(0.75 0.12 85)' }}>
          <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Your Result: {result.label}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground mb-4">{result.text}</p>
          <div className="flex gap-3">
            <button
              onClick={() => generatePDF(quiz, totalScore, result)}
              className="px-4 py-2 rounded text-xs font-medium border transition-colors"
              style={{ borderColor: 'oklch(0.45 0.04 80)', color: 'oklch(0.45 0.04 80)' }}
            >
              Download Results
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Quizzes() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <SEOHead
        title="C-PTSD Self-Exploration Quizzes"
        description="8 interactive quizzes for understanding your trauma responses, nervous system state, attachment patterns, and more. Free, private, nothing stored."
        canonical={`${SITE.domain}/quizzes`}
      />
      <Header />

      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            Self-Exploration Quizzes
          </h1>
          <div className="gold-rule-thick mb-6" />

          <div className="mb-10 article-body">
            <p>
              These quizzes are tools for self-understanding, not clinical diagnosis. Nothing is stored — your answers exist only in your browser and disappear when you leave. Use them as starting points for deeper inquiry, not as definitive labels.
            </p>
          </div>

          {QUIZZES.map(quiz => (
            <QuizComponent key={quiz.id} quiz={quiz} />
          ))}

          <HealthDisclaimer />
        </div>
      </main>

      <Footer />
    </div>
  );
}

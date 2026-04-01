/*
 * Assessments Page — 8 deeper assessments for C-PTSD self-exploration
 * Client-side only, nothing stored. Results on screen + PDF download.
 * Longer and more structured than quizzes.
 */

import { useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import HealthDisclaimer from "@/components/HealthDisclaimer";
import { SITE } from "@/lib/articles";

interface Question {
  text: string;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  scale: string[];
  questions: Question[];
  ranges: { min: number; max: number; label: string; text: string }[];
}

const ASSESSMENTS: Assessment[] = [
  {
    id: "cptsd-screening",
    title: "C-PTSD Symptom Screening",
    description: "A comprehensive screening based on the ICD-11 criteria for Complex PTSD. This is not a diagnosis — it is a tool for self-awareness.",
    scale: ["Never", "Rarely", "Sometimes", "Often", "Almost Always"],
    questions: [
      { text: "I have flashbacks or intrusive memories of traumatic events" },
      { text: "I avoid situations, people, or places that remind me of what happened" },
      { text: "I feel constantly on guard or hypervigilant" },
      { text: "I have difficulty controlling my emotions — they feel too big or too absent" },
      { text: "I feel fundamentally different from other people, as though something is wrong with me" },
      { text: "I have difficulty maintaining close relationships" },
      { text: "I feel empty, numb, or disconnected from myself" },
      { text: "I have a persistent sense of shame that goes beyond specific events" },
      { text: "I struggle to feel safe even in objectively safe environments" },
      { text: "I have difficulty trusting others, even people who have proven trustworthy" },
    ],
    ranges: [
      { min: 0, max: 12, label: "Minimal Symptoms", text: "Your responses suggest minimal C-PTSD symptoms at this time. This does not mean your experiences are invalid — it means your current symptom presentation is relatively low. Continue monitoring your wellbeing and seek support if symptoms increase." },
      { min: 13, max: 24, label: "Mild to Moderate Symptoms", text: "Your responses suggest mild to moderate C-PTSD symptoms. You may be experiencing some disruption in emotional regulation, self-perception, or relationships. These symptoms are common and treatable. Consider connecting with a trauma-informed therapist who specializes in approaches like EMDR, somatic experiencing, or IFS." },
      { min: 25, max: 34, label: "Moderate to Significant Symptoms", text: "Your responses suggest moderate to significant C-PTSD symptoms. The patterns you're experiencing — in emotional regulation, self-concept, and relationships — are consistent with complex trauma responses. This is not a character flaw. It is a nervous system that adapted to survive difficult circumstances. Professional support from a trauma-specialized therapist is strongly recommended." },
      { min: 35, max: 40, label: "Significant Symptoms", text: "Your responses suggest significant C-PTSD symptoms across multiple domains. The level of distress you're experiencing deserves professional support. If you're not already working with a trauma-informed therapist, please consider reaching out to one. The Psychology Today therapist directory allows you to filter by trauma specialization. You deserve support — and effective treatments exist." },
    ],
  },
  {
    id: "emotional-regulation",
    title: "Emotional Regulation Capacity Assessment",
    description: "Evaluate your current ability to identify, tolerate, and modulate emotional states — a core challenge in C-PTSD recovery.",
    scale: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    questions: [
      { text: "I can usually identify what emotion I'm feeling" },
      { text: "I can tolerate uncomfortable emotions without immediately reacting" },
      { text: "I have healthy ways to calm myself when I'm upset" },
      { text: "My emotions feel proportionate to the situations that trigger them" },
      { text: "I can feel strong emotions without losing my sense of self" },
      { text: "I don't need substances or compulsive behaviors to manage my feelings" },
      { text: "I can express my emotions in ways that others can receive" },
      { text: "I can shift my emotional state when I need to (not suppressing, but regulating)" },
      { text: "I can be present with grief or sadness without being consumed by it" },
      { text: "I feel a range of emotions, not just numbness or overwhelm" },
    ],
    ranges: [
      { min: 10, max: 20, label: "Significant Dysregulation", text: "Your emotional regulation capacity is currently limited. You may experience emotions as either overwhelming floods or complete absence. This is a hallmark of C-PTSD — the nervous system's thermostat was never properly calibrated because the environment didn't allow it. Deb Dana's polyvagal exercises and DBT skills training are specifically designed to build the regulation capacity that was disrupted by trauma." },
      { min: 21, max: 30, label: "Developing Regulation", text: "You have some emotional regulation capacity but it's inconsistent. You may regulate well in certain contexts but lose access to regulation under stress. This is progress. Building a daily practice of nervous system regulation (breathwork, body scans, movement) can strengthen the neural pathways that support emotional modulation." },
      { min: 31, max: 40, label: "Moderate Regulation", text: "Your emotional regulation capacity is moderate. You can generally identify and tolerate emotions, though intense triggers may still overwhelm your system. Continue building your regulation toolkit and notice which practices work best for different emotional states." },
      { min: 41, max: 50, label: "Strong Regulation", text: "Your emotional regulation capacity is well-developed. You can identify, tolerate, and modulate emotional states with relative consistency. This represents significant nervous system healing. The capacity to feel without being consumed is one of the most important outcomes of trauma recovery." },
    ],
  },
  {
    id: "dissociation-screening",
    title: "Dissociation Awareness Screening",
    description: "Dissociation exists on a spectrum from mild (daydreaming) to severe (identity fragmentation). This assessment helps you understand where you fall.",
    scale: ["Never", "Rarely", "Sometimes", "Often", "Almost Always"],
    questions: [
      { text: "I find myself staring into space, not thinking about anything" },
      { text: "I feel like I'm watching myself from outside my body" },
      { text: "I have gaps in my memory for recent events" },
      { text: "The world around me sometimes feels unreal, like a dream" },
      { text: "I feel disconnected from my own emotions, as though they belong to someone else" },
      { text: "I lose track of time — minutes feel like hours or hours feel like minutes" },
      { text: "I sometimes don't recognize my own reflection" },
      { text: "I find evidence of things I've done but don't remember doing" },
      { text: "Parts of my body feel numb or like they don't belong to me" },
      { text: "I feel like different parts of me want different things" },
    ],
    ranges: [
      { min: 0, max: 12, label: "Minimal Dissociation", text: "Your responses suggest minimal dissociative experiences. Some mild dissociation (like daydreaming or highway hypnosis) is normal and not concerning. Your connection to present-moment experience appears relatively intact." },
      { min: 13, max: 24, label: "Mild to Moderate Dissociation", text: "Your responses suggest mild to moderate dissociative experiences. You may sometimes feel disconnected from your body, emotions, or surroundings. This level of dissociation is common in trauma survivors and often serves a protective function. Grounding practices and somatic awareness exercises can help strengthen your connection to present-moment experience." },
      { min: 25, max: 34, label: "Moderate to Significant Dissociation", text: "Your responses suggest moderate to significant dissociative experiences. Dissociation at this level often indicates that your nervous system is using disconnection as a primary coping strategy. Janina Fisher's work on structural dissociation and IFS therapy are particularly relevant. Working with a therapist trained in dissociative processes is recommended." },
      { min: 35, max: 40, label: "Significant Dissociation", text: "Your responses suggest significant dissociative experiences. This level of dissociation warrants professional assessment from a clinician experienced with dissociative processes. The International Society for the Study of Trauma and Dissociation (ISST-D) maintains a therapist directory. Dissociation is a survival strategy — it kept you alive. But healing requires gradually building the capacity to be present." },
    ],
  },
  {
    id: "boundaries",
    title: "Boundary Health Assessment",
    description: "Healthy boundaries are often the first casualty of childhood trauma. This assessment explores your current boundary patterns.",
    scale: ["Never", "Rarely", "Sometimes", "Often", "Almost Always"],
    questions: [
      { text: "I can say no without excessive guilt" },
      { text: "I know what I need in relationships and can communicate it" },
      { text: "I can tolerate others' disappointment when I set a limit" },
      { text: "I don't take responsibility for other people's emotions" },
      { text: "I can end conversations or leave situations that feel harmful" },
      { text: "I maintain my own opinions even when others disagree" },
      { text: "I don't over-share personal information with people I don't trust" },
      { text: "I can ask for help without feeling like a burden" },
      { text: "I recognize when someone is crossing my boundaries" },
      { text: "I feel entitled to my own time, space, and privacy" },
    ],
    ranges: [
      { min: 10, max: 20, label: "Significantly Compromised Boundaries", text: "Your boundary system is significantly compromised. This is a direct consequence of growing up in an environment where your boundaries were not respected — or where having boundaries was dangerous. The fawn response often underlies boundary difficulties. Rebuilding boundaries is not about building walls. It is about developing the internal permission to have needs and the nervous system capacity to tolerate others' reactions when you express them." },
      { min: 21, max: 30, label: "Developing Boundaries", text: "You have some boundary awareness but struggle with consistent implementation. You may know what you need but find it difficult to communicate or maintain. This is common in recovery — the knowledge comes before the capacity. Practice in low-stakes situations first. Each successful boundary experience rewires the nervous system's expectation of what happens when you say no." },
      { min: 31, max: 40, label: "Moderate Boundary Health", text: "Your boundaries are moderately healthy. You can set limits in most situations but may still struggle with certain people or contexts (often those that resemble original family dynamics). Notice where your boundaries are strongest and where they collapse — that pattern contains important information about your trauma history." },
      { min: 41, max: 50, label: "Strong Boundary Health", text: "Your boundary system is well-developed. You can identify your needs, communicate them clearly, and tolerate others' reactions. This represents significant healing, especially if you came from an environment where boundaries were not modeled or allowed. Your capacity to hold boundaries while maintaining connection is a sign of earned security." },
    ],
  },
  {
    id: "body-connection",
    title: "Body-Mind Connection Assessment",
    description: "Trauma disrupts the connection between mind and body. This assessment evaluates your current level of embodiment and interoceptive awareness.",
    scale: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    questions: [
      { text: "I can feel physical sensations in my body clearly" },
      { text: "I notice when my body is tense and can consciously relax" },
      { text: "I trust the signals my body sends me" },
      { text: "I feel at home in my body" },
      { text: "I can use my body to regulate my emotional state (through movement, breathing, etc.)" },
      { text: "I notice subtle changes in my body's state throughout the day" },
      { text: "Physical touch (appropriate) feels safe and pleasant to me" },
      { text: "I can feel the difference between physical hunger, emotional hunger, and anxiety" },
      { text: "I take care of my body's basic needs consistently (sleep, food, movement)" },
      { text: "I can be present in my body during intimacy" },
    ],
    ranges: [
      { min: 10, max: 20, label: "Significant Disconnection", text: "Your connection to your body is significantly disrupted. This is one of the most common consequences of trauma — the body held too much pain, so the mind learned to leave. Peter Levine's somatic experiencing and Bessel van der Kolk's body-based approaches are specifically designed to rebuild this connection. Start with the gentlest practices: noticing the feeling of warm water on your hands, the texture of fabric, the weight of your body in a chair." },
      { min: 21, max: 30, label: "Partial Connection", text: "You have partial connection to your body. You may be aware of some sensations (especially pain or tension) but disconnected from subtler signals. This is a common stage in recovery. The body is beginning to come back online, but the nervous system is still cautious about how much sensation it allows through." },
      { min: 31, max: 40, label: "Developing Embodiment", text: "Your body-mind connection is developing well. You can feel and respond to many of your body's signals. Continue deepening this connection through regular somatic practice. The more you listen to your body, the more information it will share." },
      { min: 41, max: 50, label: "Strong Embodiment", text: "You have a strong connection to your body. You can feel, trust, and use your body's signals for self-regulation and decision-making. This level of embodiment is a significant achievement in trauma recovery and represents deep nervous system healing." },
    ],
  },
  {
    id: "relational-safety",
    title: "Relational Safety Assessment",
    description: "How safe do you feel in relationships? This assessment explores your capacity for trust, vulnerability, and connection.",
    scale: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    questions: [
      { text: "I have at least one person I can be fully honest with" },
      { text: "I can ask for help when I need it" },
      { text: "I feel safe being vulnerable with people I trust" },
      { text: "I can tolerate conflict without assuming the relationship is over" },
      { text: "I don't constantly scan for signs of rejection or abandonment" },
      { text: "I can receive compliments or care without suspicion" },
      { text: "I feel worthy of love and belonging" },
      { text: "I can maintain my sense of self within close relationships" },
      { text: "I don't need to control others to feel safe" },
      { text: "I can repair ruptures in relationships" },
    ],
    ranges: [
      { min: 10, max: 20, label: "Low Relational Safety", text: "Your sense of safety in relationships is significantly compromised. Trust feels dangerous because, in your history, it was. The people who were supposed to protect you may have been the source of harm. Rebuilding relational safety is possible but it requires safe relationships — a trauma-informed therapist can provide the corrective relational experience your nervous system needs." },
      { min: 21, max: 30, label: "Developing Relational Safety", text: "You have some capacity for relational safety but it's fragile. You may trust in certain contexts but become hypervigilant when vulnerability increases. This is your nervous system doing its job — protecting you based on past data. Gradually updating that data through safe relational experiences is the path forward." },
      { min: 31, max: 40, label: "Moderate Relational Safety", text: "Your relational safety is moderate. You can connect and trust in many situations but may still have specific triggers or relationship patterns that activate old survival responses. Notice the patterns. They contain the map of your healing work." },
      { min: 41, max: 50, label: "Strong Relational Safety", text: "You have a well-developed sense of relational safety. You can trust, be vulnerable, and maintain connection even through conflict. If this was earned through recovery work, it represents profound nervous system healing. The capacity to feel safe with another person is one of the deepest forms of healing available." },
    ],
  },
  {
    id: "grief-processing",
    title: "Grief & Loss Processing Assessment",
    description: "C-PTSD involves profound losses — loss of childhood, safety, trust, identity. This assessment explores your relationship with grief.",
    scale: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    questions: [
      { text: "I can acknowledge what I lost because of my trauma" },
      { text: "I allow myself to grieve without judging the grief" },
      { text: "I can feel sadness without it becoming overwhelming despair" },
      { text: "I have grieved the childhood I didn't have" },
      { text: "I can hold both grief and gratitude simultaneously" },
      { text: "I don't minimize my losses by comparing them to others'" },
      { text: "I have rituals or practices that help me process grief" },
      { text: "I can talk about my losses without shutting down" },
      { text: "I understand that grief is not linear and comes in waves" },
      { text: "I feel that my grief has led to some form of growth or understanding" },
    ],
    ranges: [
      { min: 10, max: 20, label: "Unprocessed Grief", text: "Your grief appears largely unprocessed. This is common — trauma survivors are often so focused on survival that grief gets deferred indefinitely. Pete Walker calls this 'the grief that was never allowed.' The work involves creating safe conditions for grief to emerge — and then allowing it without trying to fix, rush, or minimize it. Grief is not a problem to solve. It is a process to honor." },
      { min: 21, max: 30, label: "Beginning to Grieve", text: "You are beginning to access and process your grief. This is significant and often painful work. The losses associated with C-PTSD — loss of childhood, safety, trust, identity — are profound. Allow the grief to come in waves. You don't have to process it all at once." },
      { min: 31, max: 40, label: "Active Grief Processing", text: "You are actively processing your grief. You can acknowledge your losses, feel the sadness, and continue functioning. This represents emotional maturity and nervous system capacity. Grief work is some of the most important work in trauma recovery." },
      { min: 41, max: 50, label: "Integrated Grief", text: "Your grief appears well-integrated. You can hold your losses with tenderness and wisdom. You understand that grief and growth coexist. This level of grief processing often brings a depth of compassion — for yourself and for others — that was not available before the healing work." },
    ],
  },
  {
    id: "recovery-readiness",
    title: "Recovery Readiness Assessment",
    description: "Where are you in your healing journey? This assessment helps you understand your current stage and what might serve you next.",
    scale: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    questions: [
      { text: "I acknowledge that what happened to me was traumatic" },
      { text: "I understand that my symptoms are adaptations, not character flaws" },
      { text: "I have some stability in my daily life (housing, basic safety)" },
      { text: "I am willing to feel uncomfortable emotions as part of healing" },
      { text: "I have or am seeking professional support" },
      { text: "I have at least one safe relationship in my life" },
      { text: "I can commit to regular self-care practices" },
      { text: "I understand that recovery is not linear" },
      { text: "I have hope that healing is possible for me" },
      { text: "I am ready to do the work, even when it's hard" },
    ],
    ranges: [
      { min: 10, max: 20, label: "Pre-Contemplation", text: "You may be in the early stages of recognizing your trauma and its effects. This is a valid and important stage. The fact that you're taking this assessment suggests a part of you is ready to explore. There is no rush. Healing begins with acknowledgment, and acknowledgment begins with safety. Focus on stabilization first — basic needs, safe environment, one trustworthy connection." },
      { min: 21, max: 30, label: "Contemplation", text: "You are contemplating deeper healing work. You understand that what happened to you was significant, and you're beginning to connect your current struggles to your history. This is the stage where education is most valuable — understanding the neuroscience of trauma can reduce shame and increase motivation for treatment." },
      { min: 31, max: 40, label: "Preparation", text: "You are preparing for active recovery work. You have some stability, some understanding, and some willingness. This is an excellent foundation. If you haven't already, now is a good time to connect with a trauma-specialized therapist. The work ahead is challenging but you have the resources to engage with it." },
      { min: 41, max: 50, label: "Active Recovery", text: "You are in active recovery. You have the understanding, the stability, the support, and the willingness to do deep healing work. This is where transformation happens. Trust the process. Trust your nervous system's capacity to heal. And remember that setbacks are not failures — they are the nervous system testing new territory." },
    ],
  },
];

function generateAssessmentPDF(assessment: Assessment, answers: Record<number, number>, score: number, result: { label: string; text: string }) {
  const lines = [
    `THE SHATTERED ARMOR — ASSESSMENT RESULTS`,
    `========================================`,
    ``,
    `Assessment: ${assessment.title}`,
    `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    ``,
    `Total Score: ${score} / ${assessment.questions.length * (assessment.scale.length - 1)}`,
    `Result: ${result.label}`,
    ``,
    result.text,
    ``,
    `--- DETAILED RESPONSES ---`,
    ``,
  ];

  assessment.questions.forEach((q, i) => {
    const val = answers[i] ?? 0;
    lines.push(`${i + 1}. ${q.text}`);
    lines.push(`   Response: ${assessment.scale[val]} (${val}/${assessment.scale.length - 1})`);
    lines.push(``);
  });

  lines.push(`---`);
  lines.push(``);
  lines.push(`DISCLAIMER: This assessment is for educational and self-exploration purposes only.`);
  lines.push(`It is not a diagnostic tool and does not replace professional assessment.`);
  lines.push(`Always consult a qualified healthcare provider for clinical guidance.`);
  lines.push(``);
  lines.push(`Visit: https://shatteredarmor.com`);
  lines.push(`Author: Kalesh — Consciousness Teacher & Writer`);
  lines.push(`Website: https://kalesh.love`);

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shattered-armor-${assessment.id}-results.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function AssessmentComponent({ assessment }: { assessment: Assessment }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleAnswer = (qIdx: number, value: number) => {
    setAnswers(prev => ({ ...prev, [qIdx]: value }));
  };

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const allAnswered = Object.keys(answers).length === assessment.questions.length;

  const result = assessment.ranges.find(r => totalScore >= r.min && totalScore <= r.max) || assessment.ranges[assessment.ranges.length - 1];

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
      <h2 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>{assessment.title}</h2>
      <p className="text-sm text-muted-foreground mb-4">{assessment.description}</p>
      <p className="text-xs text-muted-foreground mb-6">Rate each statement: {assessment.scale.join(' · ')}</p>

      {assessment.questions.map((q, qIdx) => (
        <div key={qIdx} className="mb-5">
          <p className="text-sm font-medium mb-2">{qIdx + 1}. {q.text}</p>
          <div className="flex gap-2 pl-4 flex-wrap">
            {assessment.scale.map((label, sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleAnswer(qIdx, sIdx)}
                className="px-3 py-1.5 rounded text-xs font-medium border transition-all"
                style={{
                  background: answers[qIdx] === sIdx ? 'oklch(0.45 0.04 80)' : 'transparent',
                  color: answers[qIdx] === sIdx ? 'oklch(0.97 0.005 80)' : 'oklch(0.50 0.02 80)',
                  borderColor: answers[qIdx] === sIdx ? 'oklch(0.45 0.04 80)' : 'oklch(0.85 0.02 80)',
                }}
              >
                {label}
              </button>
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
          {allAnswered ? 'See My Results' : `Complete all ${assessment.questions.length} items`}
        </button>
      )}

      {showResult && result && (
        <div ref={resultRef} className="mt-6 p-5 rounded-lg border" style={{ background: 'oklch(0.96 0.02 80)', borderColor: 'oklch(0.75 0.12 85)' }}>
          <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
            Your Result: {result.label}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">Score: {totalScore} / {assessment.questions.length * (assessment.scale.length - 1)}</p>
          <p className="text-sm leading-relaxed text-muted-foreground mb-4">{result.text}</p>
          <div className="flex gap-3">
            <button
              onClick={() => generateAssessmentPDF(assessment, answers, totalScore, result)}
              className="px-4 py-2 rounded text-xs font-medium border transition-colors"
              style={{ borderColor: 'oklch(0.45 0.04 80)', color: 'oklch(0.45 0.04 80)' }}
            >
              Download Detailed Results
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Retake Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Assessments() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <SEOHead
        title="C-PTSD Self-Assessments"
        description="8 in-depth self-assessments for C-PTSD recovery: symptom screening, emotional regulation, dissociation, boundaries, body connection, relational safety, grief, and recovery readiness."
        canonical={`${SITE.domain}/assessments`}
      />
      <Header />

      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            Self-Assessments
          </h1>
          <div className="gold-rule-thick mb-6" />

          <div className="mb-10 article-body">
            <p>
              These assessments are deeper explorations than the quizzes — each one maps a specific dimension of trauma recovery. Nothing is stored or transmitted. Your responses exist only in your browser. Use the download button to save your results as a text file for personal reference or to share with your therapist.
            </p>
            <p>
              These tools are for self-understanding, not clinical diagnosis. They cannot replace professional assessment. If your results suggest significant distress, please consider connecting with a trauma-informed therapist.
            </p>
          </div>

          {ASSESSMENTS.map(assessment => (
            <AssessmentComponent key={assessment.id} assessment={assessment} />
          ))}

          <HealthDisclaimer />
        </div>
      </main>

      <Footer />
    </div>
  );
}

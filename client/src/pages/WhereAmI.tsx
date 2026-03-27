/*
 * Where Am I Right Now? — Interactive grounding tool
 * 5 questions: fight/flight/freeze/fawn detection
 * Immediate 30-second somatic practice per result
 */

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { SITE } from "@/lib/articles";

interface Question {
  text: string;
  options: { label: string; state: string }[];
}

const questions: Question[] = [
  {
    text: "Right now, my body feels...",
    options: [
      { label: "Tense, clenched, ready to explode", state: "fight" },
      { label: "Restless, jittery, like I need to run", state: "flight" },
      { label: "Heavy, numb, like I'm underwater", state: "freeze" },
      { label: "Small, compliant, focused on what others need", state: "fawn" },
      { label: "Relatively calm and present", state: "regulated" },
    ],
  },
  {
    text: "My breathing is...",
    options: [
      { label: "Shallow and fast, chest tight", state: "fight" },
      { label: "Quick, can't seem to slow it down", state: "flight" },
      { label: "Barely noticeable, like I forget to breathe", state: "freeze" },
      { label: "Held, careful, trying not to take up space", state: "fawn" },
      { label: "Steady and natural", state: "regulated" },
    ],
  },
  {
    text: "My thoughts are...",
    options: [
      { label: "Angry, critical, replaying conflicts", state: "fight" },
      { label: "Racing, planning escape routes, catastrophizing", state: "flight" },
      { label: "Foggy, blank, disconnected", state: "freeze" },
      { label: "Focused on someone else's feelings or reactions", state: "fawn" },
      { label: "Present and relatively clear", state: "regulated" },
    ],
  },
  {
    text: "If someone walked in right now, I would...",
    options: [
      { label: "Snap at them or feel irritated", state: "fight" },
      { label: "Want to leave the room immediately", state: "flight" },
      { label: "Barely register their presence", state: "freeze" },
      { label: "Immediately smile and ask what they need", state: "fawn" },
      { label: "Acknowledge them normally", state: "regulated" },
    ],
  },
  {
    text: "The sensation I notice most is...",
    options: [
      { label: "Heat, pressure, jaw clenching", state: "fight" },
      { label: "Tingling, restlessness, urge to move", state: "flight" },
      { label: "Coldness, heaviness, feeling far away", state: "freeze" },
      { label: "Tightness in chest, scanning for danger in others", state: "fawn" },
      { label: "Groundedness, weight in my feet", state: "regulated" },
    ],
  },
];

interface StateResult {
  title: string;
  description: string;
  practice: string;
  practiceTitle: string;
}

const stateResults: Record<string, StateResult> = {
  fight: {
    title: "Fight Response Active",
    description: "Your nervous system is mobilized for confrontation. The sympathetic branch is dominant — adrenaline is flowing, muscles are tensing, and your system is preparing to defend. This is not a character flaw. This is your body doing exactly what it was designed to do when it perceives threat.",
    practiceTitle: "30-Second Practice: Discharge the Energy",
    practice: "Stand up. Push both palms flat against a wall as hard as you can for 10 seconds. Push like you're trying to move the wall. Then release completely and let your arms hang. Notice the trembling or warmth. That's your body completing the fight response it's been holding. Repeat twice more. The anger isn't the problem — the incomplete discharge is.",
  },
  flight: {
    title: "Flight Response Active",
    description: "Your system wants to run. The sympathetic nervous system is in high gear — scanning for exits, planning escape routes, unable to settle. This is mobilization energy that hasn't found its completion. Your body is trying to get you to safety, even when the danger is internal.",
    practiceTitle: "30-Second Practice: Orient to Safety",
    practice: "Without moving your body, slowly turn your head to the right. Let your eyes find something in the room — any object. Name its color silently. Now slowly turn left. Find another object. Name its color. Do this four more times, slowly. You're engaging the orienting response, which tells your brainstem: I can look around. I'm not being chased. The scanning can slow down.",
  },
  freeze: {
    title: "Freeze Response Active",
    description: "Your system has gone into conservation mode. The dorsal vagal branch has taken over — energy is being pulled inward, consciousness is dimming, the body is going offline. This isn't laziness or depression. This is your nervous system's oldest survival strategy: when you can't fight and can't flee, you disappear.",
    practiceTitle: "30-Second Practice: Gentle Activation",
    practice: "Press your feet into the floor — feel the ground pushing back. Now squeeze both hands into fists for 5 seconds, then release. Squeeze again. Release. Now rub your palms together vigorously for 10 seconds until you feel heat. Place those warm palms on your cheeks. You're gently bringing your system back online — not forcing it, inviting it.",
  },
  fawn: {
    title: "Fawn Response Active",
    description: "Your system is in appeasement mode. You're tracking others' emotional states with exquisite precision while losing contact with your own. This is a brilliant survival adaptation — you learned that safety came through pleasing, accommodating, becoming what others needed. The cost is losing yourself.",
    practiceTitle: "30-Second Practice: Return to Self",
    practice: "Place one hand on your chest and one on your belly. Close your eyes. Ask yourself — not anyone else — 'What do I actually feel right now?' Don't answer for 10 seconds. Just wait. Whatever comes up, say it silently: 'I feel ___.' This is you checking in with yourself instead of scanning others. Your feelings matter. They were always supposed to matter.",
  },
  regulated: {
    title: "Ventral Vagal — Present and Regulated",
    description: "Your social engagement system is online. You're in the window of tolerance — able to think clearly, feel your body, and connect with others. This is the state your nervous system is designed to return to. It's not the absence of difficulty — it's the presence of capacity.",
    practiceTitle: "30-Second Practice: Anchor This State",
    practice: "Take three slow breaths. On each exhale, notice where in your body you feel the most settled. Maybe it's your hands. Maybe your belly. Maybe your feet on the floor. Place your attention there like you're bookmarking a page. This is your anchor point. When activation comes — and it will — you can return here. Your body knows the way back.",
  },
};

export default function WhereAmI() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<StateResult | null>(null);

  const handleAnswer = (state: string) => {
    const newAnswers = [...answers, state];
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Tally results
      const counts: Record<string, number> = {};
      newAnswers.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
      const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      setResult(stateResults[dominant]);
    }
  };

  const reset = () => {
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <SEOHead
        title="Where Am I Right Now?"
        description="A nervous system check-in tool. Five questions to identify your current survival state — fight, flight, freeze, or fawn — with an immediate somatic practice."
        canonical={`${SITE.domain}/where-am-i`}
      />
      <Header />

      <main className="flex-1">
        <div className="container py-12">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl mb-3" style={{ fontFamily: 'var(--font-serif)' }}>Where Am I Right Now?</h1>
            <p className="text-muted-foreground mb-8">
              A nervous system check-in. Five questions. No judgment. Just honest orientation.
            </p>

            <div className="gold-rule-thick mb-8" />

            {!result ? (
              <div>
                {/* Progress */}
                <div className="flex gap-1 mb-8">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 transition-colors duration-300"
                      style={{
                        background: i <= currentQ ? 'oklch(0.75 0.12 85)' : 'oklch(0.90 0.01 85)',
                      }}
                    />
                  ))}
                </div>

                {/* Question */}
                <p className="text-sm text-muted-foreground mb-2">Question {currentQ + 1} of {questions.length}</p>
                <h2 className="text-xl md:text-2xl mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                  {questions[currentQ].text}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                  {questions[currentQ].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt.state)}
                      className="w-full text-left p-4 border border-border hover:border-gold transition-colors"
                      style={{ fontFamily: 'var(--font-sans)', background: 'white' }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {/* Result */}
                <h2 className="text-2xl md:text-3xl mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                  {result.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {result.description}
                </p>

                <div className="p-6 mb-8" style={{ background: 'oklch(0.97 0.01 85)', borderLeft: '3px solid oklch(0.75 0.12 85)' }}>
                  <h3 className="text-lg mb-3" style={{ fontFamily: 'var(--font-serif)' }}>{result.practiceTitle}</h3>
                  <p className="leading-relaxed">{result.practice}</p>
                </div>

                <button
                  onClick={reset}
                  className="px-6 py-3 text-sm uppercase tracking-wider font-bold text-white transition-colors"
                  style={{ background: 'oklch(0.50 0.02 250)' }}
                >
                  Check In Again
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/*
 * Health Disclaimer Card — bottom of every article
 * 4-sentence robust disclaimer: educational only, not medical advice
 */

export default function HealthDisclaimer() {
  return (
    <div className="mt-10 mb-6 p-5 rounded-lg border"
      style={{
        background: 'oklch(0.97 0.005 80)',
        borderColor: 'oklch(0.90 0.02 80)',
      }}>
      <p className="text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'oklch(0.35 0.04 50)' }}>
        Health & Wellness Disclaimer
      </p>
      <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.40 0.02 60)' }}>
        The content on this site is provided for educational and informational purposes only and is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the guidance of a qualified healthcare provider with any questions you may have regarding a medical or psychological condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this website. If you are in crisis or believe you may have an emergency, contact your doctor or emergency services immediately.
      </p>
    </div>
  );
}

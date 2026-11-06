// The tutor puts corrections and explanations (in the learner's support
// language) in a paragraph that starts with this marker. See ai.service.ts.
export const CORRECTION_MARKER = "💡";

// Returns only the Italian part of a tutor reply, so the it-IT voice
// doesn't read the explanation in the wrong language.
export function getSpeakableText(content) {
  const idx = content.indexOf(CORRECTION_MARKER);
  const italian = idx === -1 ? content : content.slice(0, idx);
  return italian.trim() || content.trim();
}

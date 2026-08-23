export function speakText(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

export function createSpeechRecognizer() {
  if (typeof window === 'undefined') return null;

  const SpeechRecognitionCtor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionCtor) return null;

  const recognizer = new SpeechRecognitionCtor();
  recognizer.lang = 'pt-BR';
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;
  return recognizer;
}

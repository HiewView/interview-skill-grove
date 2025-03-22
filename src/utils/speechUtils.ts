
// Speech synthesis utility for text-to-speech functionality

// Initialize speech synthesis
const synth = window.speechSynthesis;

export const speechUtils = {
  // Speak the given text
  speak: (text: string, voice?: SpeechSynthesisVoice | null, options?: { rate?: number; pitch?: number; volume?: number }) => {
    // Cancel any ongoing speech
    synth.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if provided
    if (voice) {
      utterance.voice = voice;
    }
    
    // Set options if provided
    if (options) {
      if (options.rate !== undefined) utterance.rate = options.rate;
      if (options.pitch !== undefined) utterance.pitch = options.pitch;
      if (options.volume !== undefined) utterance.volume = options.volume;
    }
    
    // Speak the utterance
    synth.speak(utterance);
    
    return {
      // Return a cancel function
      cancel: () => synth.cancel(),
      
      // Return a promise that resolves when speech is done
      finished: new Promise<void>(resolve => {
        utterance.onend = () => resolve();
      })
    };
  },
  
  // Cancel any ongoing speech
  cancel: () => {
    synth.cancel();
  },
  
  // Get all available voices
  getVoices: (): SpeechSynthesisVoice[] => {
    return synth.getVoices();
  },
  
  // Get a specific voice by language
  getVoiceByLang: (lang: string = 'en-US'): SpeechSynthesisVoice | null => {
    const voices = synth.getVoices();
    return voices.find(voice => voice.lang.includes(lang)) || null;
  }
};

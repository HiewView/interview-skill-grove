
// Text-to-Speech service for AI questions
export class SpeechService {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.stop();

      this.currentUtterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance.rate = 0.9;
      this.currentUtterance.pitch = 1;
      this.currentUtterance.volume = 1;

      // Try to get a female voice for AI interviewer
      const voices = this.synth.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('aria')
      );
      
      if (femaleVoice) {
        this.currentUtterance.voice = femaleVoice;
      }

      this.currentUtterance.onend = () => resolve();
      this.currentUtterance.onerror = (event) => reject(event.error);

      this.synth.speak(this.currentUtterance);
    });
  }

  stop(): void {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }
}

export const speechService = new SpeechService();

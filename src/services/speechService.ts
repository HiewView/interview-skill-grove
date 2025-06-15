
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export class SpeechService {
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeakingFlag = false;

  async speak(text: string): Promise<void> {
    this.stop();

    try {
      const response = await fetch(`${API_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch TTS audio' }));
        throw new Error(errorData.error);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      this.currentAudio = new Audio(audioUrl);
      this.isSpeakingFlag = true;

      return new Promise((resolve, reject) => {
        if (!this.currentAudio) {
          this.cleanup();
          return reject("Audio not initialized");
        }
        this.currentAudio.onended = () => {
          this.cleanup();
          resolve();
        };
        this.currentAudio.onerror = (e) => {
          console.error('Audio playback error', e);
          this.cleanup();
          reject(e);
        };
        this.currentAudio.play().catch(e => {
            console.error('Audio play failed', e);
            this.cleanup();
            reject(e);
        });
      });
    } catch (error) {
      this.cleanup();
      console.error('Error in speak method:', error);
      throw error;
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.cleanup();
    }
  }

  private cleanup() {
    if (this.currentAudio) {
      // Check if src is a blob URL before revoking
      if (this.currentAudio.src.startsWith('blob:')) {
        URL.revokeObjectURL(this.currentAudio.src);
      }
      this.currentAudio = null;
    }
    this.isSpeakingFlag = false;
  }
  
  isSpeaking(): boolean {
    return this.isSpeakingFlag;
  }
}

export const speechService = new SpeechService();

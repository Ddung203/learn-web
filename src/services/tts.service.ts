const TTS_API_BASE = 'https://unvicarious-laronda-impeccably.ngrok-free.dev/api/v1';
const DEFAULT_VOICE = 'larynx:mary_ann-glow_tts';

interface Voice {
  id: string;
  name: string;
  engine: string;
  gender: string;
}

class TTSService {
  private audioCache = new Map<string, Blob>();
  private currentAudio: HTMLAudioElement | null = null;

  async getVoices(): Promise<Voice[]> {
    try {
      const response = await fetch(`${TTS_API_BASE}/voices`, {
        headers: {
          'ngrok-skip-browser-warning': '1',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  async synthesizeSpeech(text: string, voiceId: string = DEFAULT_VOICE): Promise<Blob> {
    const cacheKey = `${text}-${voiceId}`;
    
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    try {
      const url = `${TTS_API_BASE}/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voiceId)}`;
      
      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': '1',
        },
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const contentType = response.headers.get('Content-Type') || '';
      if (!contentType.includes('audio')) {
        throw new Error('Server did not return audio');
      }

      const blob = await response.blob();
      this.audioCache.set(cacheKey, blob);
      
      return blob;
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw error;
    }
  }

  async playText(text: string, voiceId: string = DEFAULT_VOICE): Promise<void> {
    try {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      const blob = await this.synthesizeSpeech(text, voiceId);
      const audioUrl = URL.createObjectURL(blob);
      
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          resolve();
        };

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          reject(new Error('Audio playback failed'));
        };

        audio.play().catch(reject);
      });
    } catch (error) {
      console.error('Error playing text:', error);
      throw error;
    }
  }

  stopPlayback(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  clearCache(): void {
    this.audioCache.clear();
  }
}

export const ttsService = new TTSService();

const TTS_API_BASE = 'https://tts.ddung203.id.vn/api/v1';
const DEFAULT_VOICE = 'en_UK/apope_low';

export interface Voice {
  key: string;
  name: string;
  description: string;
  language: string;
  language_native: string;
}

class TTSService {
  private audioCache = new Map<string, Blob>();
  private currentAudio: HTMLAudioElement | null = null;

  async getVoices(): Promise<Voice[]> {
    try {
      const response = await fetch(`${TTS_API_BASE}/voices`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  async synthesizeSpeech(
    text: string, 
    voiceId: string = DEFAULT_VOICE,
    lengthScale: number = 1.0
  ): Promise<Blob> {
    const cacheKey = `${text}-${voiceId}-${lengthScale}`;
    
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    try {
      const url = `${TTS_API_BASE}/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voiceId)}&length_scale=${lengthScale}`;
      
      const response = await fetch(url);

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

  async playText(text: string, voiceId?: string, lengthScale: number = 1.0): Promise<void> {
    const effectiveVoiceId = voiceId || this.getUserPreferredVoice() || DEFAULT_VOICE;
    
    try {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      const blob = await this.synthesizeSpeech(text, effectiveVoiceId, lengthScale);
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

  getUserPreferredVoice(): string | null {
    try {
      const authStoreData = localStorage.getItem('auth');
      if (authStoreData) {
        const parsed = JSON.parse(authStoreData);
        return parsed.user?.preferred_voice_id || null;
      }
    } catch (error) {
      console.error('Error getting user preferred voice:', error);
    }
    return null;
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

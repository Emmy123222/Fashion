// src/services/audio/AudioManager.ts
import { Audio } from 'expo-av';

class AudioManager {
  private backgroundMusic: Audio.Sound | null = null;
  private soundEffects: Map<string, Audio.Sound> = new Map();
  private isMusicEnabled: boolean = true;
  private isSoundEnabled: boolean = true;
  private musicVolume: number = 0.5;
  private soundVolume: number = 0.7;

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  // Background Music
  async loadBackgroundMusic(source: any) {
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(source, {
        isLooping: true,
        volume: this.musicVolume,
      });

      this.backgroundMusic = sound;
    } catch (error) {
      console.error('Failed to load background music:', error);
    }
  }

  async playBackgroundMusic() {
    if (this.backgroundMusic && this.isMusicEnabled) {
      try {
        await this.backgroundMusic.playAsync();
      } catch (error) {
        console.error('Failed to play background music:', error);
      }
    }
  }

  async pauseBackgroundMusic() {
    if (this.backgroundMusic) {
      try {
        await this.backgroundMusic.pauseAsync();
      } catch (error) {
        console.error('Failed to pause background music:', error);
      }
    }
  }

  async stopBackgroundMusic() {
    if (this.backgroundMusic) {
      try {
        await this.backgroundMusic.stopAsync();
      } catch (error) {
        console.error('Failed to stop background music:', error);
      }
    }
  }

  // Sound Effects
  async loadSoundEffect(name: string, source: any) {
    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        volume: this.soundVolume,
      });

      this.soundEffects.set(name, sound);
    } catch (error) {
      console.error(`Failed to load sound effect ${name}:`, error);
    }
  }

  async playSoundEffect(name: string) {
    if (!this.isSoundEnabled) return;

    const sound = this.soundEffects.get(name);
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (error) {
        console.error(`Failed to play sound effect ${name}:`, error);
      }
    }
  }

  // Volume Controls
  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.setVolumeAsync(this.musicVolume);
    }
  }

  setSoundVolume(volume: number) {
    this.soundVolume = Math.max(0, Math.min(1, volume));
    this.soundEffects.forEach((sound) => {
      sound.setVolumeAsync(this.soundVolume);
    });
  }

  // Enable/Disable
  setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    if (enabled) {
      this.playBackgroundMusic();
    } else {
      this.pauseBackgroundMusic();
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
  }

  // Cleanup
  async cleanup() {
    if (this.backgroundMusic) {
      await this.backgroundMusic.unloadAsync();
      this.backgroundMusic = null;
    }

    for (const sound of this.soundEffects.values()) {
      await sound.unloadAsync();
    }
    this.soundEffects.clear();
  }

  // Getters
  isMusicPlaying(): boolean {
    return this.isMusicEnabled;
  }

  isSoundPlaying(): boolean {
    return this.isSoundEnabled;
  }

  getMusicVolume(): number {
    return this.musicVolume;
  }

  getSoundVolume(): number {
    return this.soundVolume;
  }
}

export const audioManager = new AudioManager();

// Sound effect names
export const SOUND_EFFECTS = {
  CARD_FLIP: 'card_flip',
  MATCH: 'match',
  WIN: 'win',
  LOSE: 'lose',
  COMBO: 'combo',
  BUTTON_CLICK: 'button_click',
};

// Usage example:
/*
// Initialize
await audioManager.initialize();

// Load sounds
await audioManager.loadBackgroundMusic(require('../../assets/audio/music/background.mp3'));
await audioManager.loadSoundEffect(SOUND_EFFECTS.CARD_FLIP, require('../../assets/audio/sfx/flip.mp3'));
await audioManager.loadSoundEffect(SOUND_EFFECTS.MATCH, require('../../assets/audio/sfx/match.mp3'));

// Play
audioManager.playBackgroundMusic();
audioManager.playSoundEffect(SOUND_EFFECTS.CARD_FLIP);

// Control
audioManager.setMusicEnabled(false);
audioManager.setMusicVolume(0.5);
*/

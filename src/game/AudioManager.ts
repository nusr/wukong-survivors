import Phaser from "phaser";
import { useSaveStore } from "../store";
import type { GameScene } from "./GameScene";

// Audio types following Vampire Survivors style
export enum SoundEffect {
  PLAYER_HIT = "player_hit",
  PLAYER_DEATH = "player_death",
  PLAYER_FIRE = "player_fire",
  LEVEL_UP = "level_up",
  VICTORY_THEME = "victory_theme",
}

/**
 * Audio Manager - Handles all game audio (music and sound effects)
 * Following Vampire Survivors audio patterns
 */
export class AudioManager {
  private scene: GameScene;
  private isPlayerSoundEnabled = false;
  private music: Phaser.Sound.BaseSound | null = null;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  /**
   * Preload all audio assets
   */
  public static preloadAudio(scene: GameScene): void {
    for (const key of Object.values(SoundEffect)) {
      scene.load.audio(key, `assets/audio/${key}.wav`);
    }
  }

  /**
   * Play a sound effect
   */
  public playSfx(effect: SoundEffect): void {
    const { musicEnabled, musicVolume } = useSaveStore.getState();

    if (!musicEnabled || this.isPlayerSoundEnabled || musicVolume === 0) return;
    this.isPlayerSoundEnabled = true;

    try {
      this.music = this.scene.sound.add(effect, {
        volume: musicVolume,
      });
      this.music.play();

      // Clean up after playing
      this.music.once("complete", () => {
        this.stopMusic();
      });
      this.music.once("error", (error: Error) => {
        console.warn(`Sound effect error: ${effect}`, error);
        this.stopMusic();
      });
    } catch (error) {
      this.stopMusic();
      console.warn(`Failed to play sound effect: ${effect}`, error);
    }
  }

  public stopMusic(): void {
    if (this.music) {
      this.music.stop();
      this.music.destroy();
      this.music = null;
    }
    this.isPlayerSoundEnabled = false;
  }
}

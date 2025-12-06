import { describe, it, expect, beforeEach, vi } from "vitest";
import { AudioManager, SoundEffect } from "../AudioManager";

// Mock useSaveStore
vi.mock("../../store", () => ({
  useSaveStore: {
    getState: vi.fn(() => ({
      musicEnabled: true,
      musicVolume: 0.5,
    })),
  },
}));

// Mock Phaser
let currentMockSound = {
  play: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  destroy: vi.fn(),
  once: vi.fn((event: string, callback: () => void) => {
    if (event === "complete") {
      // Call immediately for testing
      setTimeout(callback, 0);
    }
  }),
  isPlaying: false,
  isPaused: false,
  setVolume: vi.fn(),
};

const mockScene = {
  sound: {
    add: vi.fn(() => currentMockSound),
  },
  load: {
    audio: vi.fn(),
  },
} as any;

describe("AudioManager", () => {
  let audioManager: AudioManager;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn(),
    } as any;

    // Reset mocks
    vi.clearAllMocks();
    currentMockSound = {
      play: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      destroy: vi.fn(),
      once: vi.fn((event: string, callback: () => void) => {
        if (event === "complete") {
          setTimeout(callback, 0);
        }
      }),
      isPlaying: false,
      isPaused: false,
      setVolume: vi.fn(),
    };
    mockScene.sound.add.mockReturnValue(currentMockSound);

    audioManager = new AudioManager(mockScene);
  });

  describe("Sound Effects", () => {
    it("should play sound effect when sfx is enabled", () => {
      audioManager.playSfx(SoundEffect.PLAYER_HIT);

      expect(mockScene.sound.add).toHaveBeenCalledWith(
        SoundEffect.PLAYER_HIT,
        expect.objectContaining({ volume: 0.5 }),
      );
      expect(currentMockSound.play).toHaveBeenCalled();
    });

    it("should apply volume multiplier to sound effect", () => {
      audioManager.playSfx(SoundEffect.PLAYER_HIT);

      expect(mockScene.sound.add).toHaveBeenCalledWith(
        SoundEffect.PLAYER_HIT,
        expect.objectContaining({ volume: 0.5 }),
      );
    });

    it("should handle sound effect errors gracefully", () => {
      mockScene.sound.add = vi.fn(() => {
        throw new Error("Sound error");
      });

      expect(() => {
        audioManager.playSfx(SoundEffect.PLAYER_HIT);
      }).not.toThrow();
    });
  });

  describe("Preload Audio", () => {
    it("should preload all audio assets", () => {
      AudioManager.preloadAudio(mockScene);

      // Check that audio files are loaded
      expect(mockScene.load.audio).toHaveBeenCalledWith(
        SoundEffect.PLAYER_HIT,
        expect.any(String),
      );
    });
  });
});

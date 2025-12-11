import { vi } from "vitest";

type Function = (...args: any[]) => any;

class Circle {
  static Contains: any;
  constructor(
    public x: number,
    public y: number,
    public radius: number,
  ) {}
}

Circle.Contains = vi.fn(() => true);

// Mock Phaser module
const phaser = {
  Events: {
    EventEmitter: class EventEmitter {
      private events: Map<string, Function[]> = new Map();

      on(event: string, fn: Function) {
        if (!this.events.has(event)) {
          this.events.set(event, []);
        }
        this.events.get(event)?.push(fn);
      }

      off(event: string, fn: Function) {
        const listeners = this.events.get(event);
        if (listeners) {
          const index = listeners.indexOf(fn);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        }
      }

      emit(event: string, ...args: any[]) {
        const listeners = this.events.get(event);
        if (listeners) {
          listeners.forEach((fn) => fn(...args));
        }
      }

      once(event: string, fn: Function) {
        const onceFn = (...args: any[]) => {
          fn(...args);
          this.off(event, onceFn);
        };
        this.on(event, onceFn);
      }

      removeAllListeners(event?: string) {
        if (event) {
          this.events.delete(event);
        } else {
          this.events.clear();
        }
      }
    },
  },
  Math: {
    Clamp: (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max),
    Easing: {
      Quadratic: {
        InOut: vi.fn(),
      },
    },
    Distance: {
      Between: vi.fn((x1: number, y1: number, x2: number, y2: number) => {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      }),
    },
    Angle: {
      Between: vi.fn((x1: number, y1: number, x2: number, y2: number) => {
        return Math.atan2(y2 - y1, x2 - x1);
      }),
    },
  },
  Scene: class Scene {
    sound = {
      add: vi.fn(() => ({
        play: vi.fn(),
        stop: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        destroy: vi.fn(),
        once: vi.fn(),
        isPlaying: false,
        isPaused: false,
        setVolume: vi.fn(),
      })),
    };
    load = {
      audio: vi.fn(),
    };
  },
  Physics: {
    Arcade: {
      Sprite: vi.fn().mockImplementation(() => ({
        setDisplaySize: vi.fn(),
        setSize: vi.fn(),
        setVelocity: vi.fn(),
        setTint: vi.fn(),
        clearTint: vi.fn(),
        destroy: vi.fn(),
        body: { setSize: vi.fn(), setVelocity: vi.fn() },
        x: 0,
        y: 0,
        alpha: 1,
        scale: 1,
      })),
    },
  },
  Tweens: {
    Timeline: vi.fn(),
    add: vi.fn().mockImplementation((config) => {
      // Simulate tween completion
      if (config.onComplete) {
        config.onComplete();
      }
      return { stop: vi.fn() };
    }),
  },
  Input: {
    Keyboard: {
      Key: vi.fn(),
    },
  },
  GameObjects: {
    Rectangle: vi.fn().mockImplementation(() => ({
      setScrollFactor: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis(),
      setStrokeStyle: vi.fn().mockReturnThis(),
      setFillStyle: vi.fn().mockReturnThis(),
      setInteractive: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    })),
    Text: vi.fn().mockImplementation(() => ({
      setOrigin: vi.fn().mockReturnThis(),
      setScrollFactor: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis(),
      setText: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    })),
    Container: vi.fn().mockImplementation(() => ({
      setScrollFactor: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    })),
    Graphics: vi.fn().mockImplementation(() => ({
      setDepth: vi.fn().mockReturnThis(),
      clear: vi.fn(),
      lineStyle: vi.fn(),
      strokeCircle: vi.fn(),
      destroy: vi.fn(),
      fillStyle: vi.fn().mockReturnThis(),
      fillCircle: vi.fn().mockReturnThis(),
    })),
  },
  Geom: {
    Circle,
  },
};

vi.mock("phaser", () => {
  return {
    default: phaser,
    ...phaser,
  };
});

export default phaser;

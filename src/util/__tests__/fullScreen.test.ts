import { describe, it, expect, afterEach, vi } from "vitest";
import { isFullScreen, toggleFullScreen } from "../fullScreen";

const clearElementProps = (target: any, keys: string[]) => {
  keys.forEach((key) => {
    delete target[key];
  });
};

describe("fullScreen utils", () => {
  afterEach(() => {
    clearElementProps(document.documentElement, [
      "requestFullscreen",
      "webkitRequestFullscreen",
      "mozRequestFullScreen",
      "msRequestFullscreen",
    ]);
    clearElementProps(document, [
      "exitFullscreen",
      "webkitExitFullscreen",
      "mozCancelFullScreen",
      "msExitFullscreen",
      "fullscreenElement",
      "webkitFullscreenElement",
      "mozFullScreenElement",
      "msFullscreenElement",
    ]);
  });

  describe("isFullScreen", () => {
    it("should return false when no fullscreen element is set", () => {
      expect(isFullScreen()).toBe(false);
    });

    it("should return true when fullscreenElement is set", () => {
      (document as any).fullscreenElement = document.documentElement;
      expect(isFullScreen()).toBe(true);
    });

    it("should return true when webkitFullscreenElement is set", () => {
      (document as any).webkitFullscreenElement = document.documentElement;
      expect(isFullScreen()).toBe(true);
    });

    it("should return true when mozFullScreenElement is set", () => {
      (document as any).mozFullScreenElement = document.documentElement;
      expect(isFullScreen()).toBe(true);
    });

    it("should return true when msFullscreenElement is set", () => {
      (document as any).msFullscreenElement = document.documentElement;
      expect(isFullScreen()).toBe(true);
    });
  });

  describe("toggleFullScreen", () => {
    it("should do nothing when already in the requested state", () => {
      const requestFullscreen = vi.fn();
      (document.documentElement as any).requestFullscreen = requestFullscreen;

      toggleFullScreen(false);

      expect(requestFullscreen).not.toHaveBeenCalled();
    });

    it("should call requestFullscreen when enabling and standard API is available", () => {
      const requestFullscreen = vi.fn();
      (document.documentElement as any).requestFullscreen = requestFullscreen;

      toggleFullScreen(true);

      expect(requestFullscreen).toHaveBeenCalled();
    });

    it("should call webkitRequestFullscreen when standard API is unavailable", () => {
      const webkitRequestFullscreen = vi.fn();
      (document.documentElement as any).webkitRequestFullscreen =
        webkitRequestFullscreen;

      toggleFullScreen(true);

      expect(webkitRequestFullscreen).toHaveBeenCalled();
    });

    it("should call mozRequestFullScreen when only that API is available", () => {
      const mozRequestFullScreen = vi.fn();
      (document.documentElement as any).mozRequestFullScreen =
        mozRequestFullScreen;

      toggleFullScreen(true);

      expect(mozRequestFullScreen).toHaveBeenCalled();
    });

    it("should call msRequestFullscreen when only that API is available", () => {
      const msRequestFullscreen = vi.fn();
      (document.documentElement as any).msRequestFullscreen =
        msRequestFullscreen;

      toggleFullScreen(true);

      expect(msRequestFullscreen).toHaveBeenCalled();
    });

    it("should not throw when no fullscreen request API is available", () => {
      expect(() => toggleFullScreen(true)).not.toThrow();
    });

    it("should call exitFullscreen when disabling and standard API is available", () => {
      (document as any).fullscreenElement = document.documentElement;
      const exitFullscreen = vi.fn();
      (document as any).exitFullscreen = exitFullscreen;

      toggleFullScreen(false);

      expect(exitFullscreen).toHaveBeenCalled();
    });

    it("should call webkitExitFullscreen when standard API is unavailable", () => {
      (document as any).fullscreenElement = document.documentElement;
      const webkitExitFullscreen = vi.fn();
      (document as any).webkitExitFullscreen = webkitExitFullscreen;

      toggleFullScreen(false);

      expect(webkitExitFullscreen).toHaveBeenCalled();
    });

    it("should call mozCancelFullScreen when only that API is available", () => {
      (document as any).fullscreenElement = document.documentElement;
      const mozCancelFullScreen = vi.fn();
      (document as any).mozCancelFullScreen = mozCancelFullScreen;

      toggleFullScreen(false);

      expect(mozCancelFullScreen).toHaveBeenCalled();
    });

    it("should call msExitFullscreen when only that API is available", () => {
      (document as any).fullscreenElement = document.documentElement;
      const msExitFullscreen = vi.fn();
      (document as any).msExitFullscreen = msExitFullscreen;

      toggleFullScreen(false);

      expect(msExitFullscreen).toHaveBeenCalled();
    });

    it("should not throw when no exit fullscreen API is available", () => {
      (document as any).fullscreenElement = document.documentElement;
      expect(() => toggleFullScreen(false)).not.toThrow();
    });
  });
});

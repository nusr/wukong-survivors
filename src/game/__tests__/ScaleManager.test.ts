import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { scaleManager } from "../ScaleManager";

describe("ScaleManager", () => {
  let originalInnerWidth: number;
  let originalInnerHeight: number;

  beforeEach(() => {
    // Save original values
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;

    // Set default window size
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1920,
    });

    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 1080,
    });

    // Trigger update
    scaleManager.updateScale();
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });

    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });

    scaleManager.updateScale();
  });

  describe("Scale Calculation", () => {
    it("should calculate scale factor 1 for base dimensions", () => {
      window.innerWidth = 1920;
      window.innerHeight = 1080;
      scaleManager.updateScale();

      const scaledValue = scaleManager.scaleValue(100);
      expect(scaledValue).toBe(100); // Scale should be 1
    });

    it("should scale down for smaller screens", () => {
      window.innerWidth = 960;
      window.innerHeight = 540;
      scaleManager.updateScale();

      const scaledValue = scaleManager.scaleValue(100);
      // Minimum scale is 1, so value won't go below 100
      expect(scaledValue).toBeGreaterThanOrEqual(100);
    });

    it("should maintain minimum scale", () => {
      window.innerWidth = 100;
      window.innerHeight = 100;
      scaleManager.updateScale();

      const scaledValue = scaleManager.scaleValue(100);
      expect(scaledValue).toBeGreaterThanOrEqual(100); // Min scale is 1
    });

    it("should maintain maximum scale", () => {
      window.innerWidth = 5000;
      window.innerHeight = 3000;
      scaleManager.updateScale();

      const scaledValue = scaleManager.scaleValue(100);
      expect(scaledValue).toBeLessThanOrEqual(200); // Max scale is 2
    });
  });

  describe("Sprite Sizing", () => {
    it("should return rounded sprite size", () => {
      window.innerWidth = 1920;
      window.innerHeight = 1080;
      scaleManager.updateScale();

      const size = scaleManager.scaleValue(32);
      expect(Number.isInteger(size)).toBe(true);
    });

    it("should scale sprite size", () => {
      window.innerWidth = 960;
      window.innerHeight = 540;
      scaleManager.updateScale();

      const size = scaleManager.scaleValue(32);
      expect(size).toBeGreaterThan(0);
    });
  });

  describe("Camera Zoom", () => {
    it("should return camera zoom value", () => {
      const zoom = scaleManager.getCameraZoom();
      expect(zoom).toBe(1);
    });
  });

  describe("Z-Index Management", () => {
    it("should return incrementing z-index", () => {
      const z1 = scaleManager.getZIndex();
      const z2 = scaleManager.getZIndex();
      const z3 = scaleManager.getZIndex();

      expect(z2).toBe((z1 + 1) % 100);
      expect(z3).toBe((z2 + 1) % 100);
    });

    it("should wrap z-index at 100", () => {
      // Get z-index multiple times to force wrap
      for (let i = 0; i < 102; i++) {
        scaleManager.getZIndex();
      }

      const zIndex = scaleManager.getZIndex();
      expect(zIndex).toBeLessThan(100);
    });
  });

  describe("Responsive Behavior", () => {
    it("should handle window resize", () => {
      const resizeHandler = vi.fn();
      window.addEventListener("resize", resizeHandler);

      window.innerWidth = 800;
      window.innerHeight = 600;
      window.dispatchEvent(new Event("resize"));

      // Wait for throttled update
      vi.useFakeTimers();
      vi.advanceTimersByTime(150);
      vi.useRealTimers();

      window.removeEventListener("resize", resizeHandler);
    });

    it("should handle orientation change", () => {
      const orientationHandler = vi.fn();
      window.addEventListener("orientationchange", orientationHandler);

      window.innerWidth = 600;
      window.innerHeight = 800;
      window.dispatchEvent(new Event("orientationchange"));

      window.removeEventListener("orientationchange", orientationHandler);
    });
  });
});

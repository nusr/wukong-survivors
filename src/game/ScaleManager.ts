/**
 * ScaleManager - Handles responsive scaling for different screen sizes
 * Following game development best practices for mobile and desktop support
 */

import { SCREEN_SIZE, START_Z_INDEX } from "../constant";
import _ from "lodash";

export interface ScaleConfig {
  // Base design dimensions (reference screen size)
  baseWidth: number;
  baseHeight: number;

  // Current screen dimensions
  screenWidth: number;
  screenHeight: number;

  // Calculated scale factors
  scaleX: number;
  scaleY: number;
  scale: number; // Uniform scale (uses minimum to prevent stretching)

  // UI scale (can be different from game object scale)
  uiScale: number;
}

class ScaleManagerClass {
  private config: ScaleConfig = {
    baseWidth: 1920,
    baseHeight: 1080,
    screenWidth: SCREEN_SIZE.width,
    screenHeight: SCREEN_SIZE.height,
    scaleX: 1,
    scaleY: 1,
    scale: 1,
    uiScale: 1,
  };

  private minScale = 1;
  private maxScale = 2.0;
  private zIndex = START_Z_INDEX;

  constructor() {
    this.updateScale();

    const onResize = _.throttle(() => {
      this.updateScale();
    }, 100);

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", () => {
      this.updateScale();
    });
  }

  getZIndex() {
    const t = (this.zIndex + 1) % 100;
    this.zIndex = t;
    return t;
  }

  /**
   * Update scale factors based on current screen size
   */
  public updateScale(): void {
    this.config.screenWidth = window.innerWidth;
    this.config.screenHeight = window.innerHeight;

    // Calculate scale factors
    this.config.scaleX = this.config.screenWidth / this.config.baseWidth;
    this.config.scaleY = this.config.screenHeight / this.config.baseHeight;

    // Use minimum scale to maintain aspect ratio without stretching
    const rawScale = Math.min(this.config.scaleX, this.config.scaleY);
    this.config.scale = Math.max(
      this.minScale,
      Math.min(this.maxScale, rawScale),
    );

    // UI scale can be slightly different for better readability
    // On very small screens, increase UI scale relative to game objects
    if (this.config.screenWidth < 480) {
      // Small mobile devices
      this.config.uiScale = this.config.scale * 1.4;
    } else if (this.config.screenWidth < 768) {
      // Mobile devices
      this.config.uiScale = this.config.scale * 1.2;
    } else if (this.config.screenWidth < 1024) {
      // Tablets
      this.config.uiScale = this.config.scale * 1.1;
    } else {
      // Desktop
      this.config.uiScale = this.config.scale;
    }

    // Clamp UI scale
    this.config.uiScale = Math.max(
      this.minScale,
      Math.min(this.maxScale, this.config.uiScale),
    );
  }

  /**
   * Scale a value based on the uniform scale
   */
  public scaleValue(value: number): number {
    return value * this.config.scale;
  }

  /**
   * Get responsive font size
   */
  public getFontSize(baseFontSize: number): string {
    const scaledSize = Math.round(baseFontSize * this.config.uiScale);
    return `${scaledSize}px`;
  }

  /**
   * Get base sprite size with scaling applied
   */
  public getSpriteSize(baseSize: number): number {
    return Math.round(baseSize * this.config.scale);
  }

  /**
   * Get UI element size with UI scaling applied
   */
  public getUIElementSize(baseSize: number): number {
    return Math.round(baseSize * this.config.uiScale);
  }
}

// Export singleton instance
export const scaleManager = new ScaleManagerClass();

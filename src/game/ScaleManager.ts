/**
 * ScaleManager - Handles responsive scaling for different screen sizes
 * Following game development best practices for mobile and desktop support
 */

import { START_Z_INDEX } from "../constant";
import _ from "lodash";

export interface ScaleConfig {
  // Base design dimensions (reference screen size)
  baseWidth: number;
  baseHeight: number;

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
    scaleX: 1,
    scaleY: 1,
    scale: 1,
    uiScale: 1,
  };

  private minScale = 1;
  private maxScale = 2;
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
    this.zIndex = (this.zIndex + 1) % 100;
    return this.zIndex;
  }

  public isMobile() {
    return window.innerWidth < 768;
  }

  public isSmallMobile() {
    return window.innerWidth < 480;
  }

  /**
   * Update scale factors based on current screen size
   */
  public updateScale(): void {
    // Calculate scale factors
    this.config.scaleX = window.innerWidth / this.config.baseWidth;
    this.config.scaleY = window.innerHeight / this.config.baseHeight;

    // Use minimum scale to maintain aspect ratio without stretching
    const rawScale = Math.min(this.config.scaleX, this.config.scaleY);
    this.config.scale = Math.max(
      this.minScale,
      Math.min(this.maxScale, rawScale),
    );

    // UI scale can be slightly different for better readability
    // On very small screens, increase UI scale relative to game objects
    if (this.isSmallMobile()) {
      // Small mobile devices
      this.config.uiScale = this.config.scale * 1;
    } else if (this.isMobile()) {
      // Mobile devices
      this.config.uiScale = this.config.scale * 1;
    } else if (window.innerWidth < 1024) {
      // Tablets
      this.config.uiScale = this.config.scale * 1.1;
    } else if (window.innerWidth < 1920) {
      // Desktop
      this.config.uiScale = this.config.scale * 1.2;
    } else {
      // Ultra-wide desktops
      this.config.uiScale = this.config.scale * 1.4;
    }

    // Clamp UI scale
    this.config.uiScale = Math.max(
      this.minScale,
      Math.min(this.maxScale, this.config.uiScale),
    );
  }

  public getTitleSize(): string {
    const scaledSize = Math.round(24 * this.config.uiScale);
    return `${scaledSize}px`;
  }

  public getDefaultFont(): string {
    return "PingFang SC, Microsoft YaHei, SimSun, Arial, sans-serif";
  }

  public getNameSize(): string {
    const scaledSize = Math.round(18 * this.config.uiScale);
    return `${scaledSize}px`;
  }

  public getDescSize(): string {
    const scaledSize = Math.round(14 * this.config.uiScale);
    return `${scaledSize}px`;
  }

  public scaleValue(baseSize: number): number {
    return Math.round(baseSize * this.config.scale);
  }

  public UIScaleValue(baseSize: number): number {
    return Math.round(baseSize * this.config.uiScale);
  }

  public getCameraZoom() {
    return 1;
  }
}

// Export singleton instance
export const scaleManager = new ScaleManagerClass();

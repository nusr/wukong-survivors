/**
 * ScaleManager - Handles responsive scaling for different screen sizes
 * Following game development best practices for mobile and desktop support
 */

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
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    scaleX: 1,
    scaleY: 1,
    scale: 1,
    uiScale: 1,
  };

  private minScale = 0.5;
  private maxScale = 2.0;
  private resizeCallbacks: (() => void)[] = [];

  constructor() {
    this.updateScale();
    this.setupResizeListener();
  }

  /**
   * Setup window resize listener
   */
  private setupResizeListener(): void {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.updateScale();
        this.notifyResizeCallbacks();
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", () => {
      setTimeout(handleResize, 100);
    });
  }

  /**
   * Register a callback to be called when screen is resized
   */
  public onResize(callback: () => void): () => void {
    this.resizeCallbacks.push(callback);
    // Return unsubscribe function
    return () => {
      const index = this.resizeCallbacks.indexOf(callback);
      if (index > -1) {
        this.resizeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all resize callbacks
   */
  private notifyResizeCallbacks(): void {
    this.resizeCallbacks.forEach((callback) => callback());
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
   * Get the uniform scale factor
   */
  public getScale(): number {
    return this.config.scale;
  }

  /**
   * Get UI-specific scale factor
   */
  public getUIScale(): number {
    return this.config.uiScale;
  }

  /**
   * Get full scale configuration
   */
  public getConfig(): ScaleConfig {
    return { ...this.config };
  }

  /**
   * Scale a value based on the uniform scale
   */
  public scaleValue(value: number): number {
    return value * this.config.scale;
  }

  /**
   * Scale a UI value
   */
  public scaleUIValue(value: number): number {
    return value * this.config.uiScale;
  }

  /**
   * Get responsive font size
   */
  public getFontSize(baseFontSize: number): string {
    const scaledSize = Math.round(baseFontSize * this.config.uiScale);
    return `${scaledSize}px`;
  }

  /**
   * Check if current device is mobile
   */
  public isMobile(): boolean {
    return this.config.screenWidth < 768;
  }

  /**
   * Check if current device is small mobile
   */
  public isSmallMobile(): boolean {
    return this.config.screenWidth < 480;
  }

  /**
   * Check if current device is tablet
   */
  public isTablet(): boolean {
    return this.config.screenWidth >= 768 && this.config.screenWidth < 1024;
  }

  /**
   * Check if current device is desktop
   */
  public isDesktop(): boolean {
    return this.config.screenWidth >= 1024;
  }

  /**
   * Get camera zoom level based on screen size
   */
  public getCameraZoom(): number {
    if (this.isSmallMobile()) {
      return 0.6; // Zoom out more on small mobile for better view
    } else if (this.isMobile()) {
      return 0.7; // Zoom out on mobile for better view
    } else if (this.isTablet()) {
      return 0.85;
    }
    return 1.0;
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

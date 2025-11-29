import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.css";
import { GameScene } from "../../game/GameScene";
import { EVENT_MAP } from "../../constant";
import Phaser from "phaser";
import EventBus from "../../game/eventBus";

interface GameWrapperProps {
  onBack: () => void;
}

const getConfig = (parent: HTMLElement) => {
  const config: Phaser.Types.Core.GameConfig = {
    width: window.innerWidth,
    height: window.innerHeight,
    type: Phaser.AUTO,
    parent,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0, x: 0 },
        debug: false,
      },
    },
    scene: [GameScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: "100%",
      height: "100%",
    },
    render: {
      pixelArt: false,
      antialias: true,
    },
  };

  return config;
};

const GameWrapper: React.FC<GameWrapperProps> = ({ onBack }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    gameRef.current = new Phaser.Game(getConfig(containerRef.current));

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    EventBus.on(EVENT_MAP.BACK_TO_HOME, onBack);
    const handleGameInitialized = () => {
      setIsLoading(false);
    };

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        EventBus.emit(EVENT_MAP.SHOW_END_GAME_MODAL);
      }

      return false;
    }

    window.addEventListener("keydown", handleKeyDown);
    EventBus.on(EVENT_MAP.GAME_INITIALIZED, handleGameInitialized);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      EventBus.off(EVENT_MAP.BACK_TO_HOME, onBack);
      EventBus.off(EVENT_MAP.GAME_INITIALIZED, handleGameInitialized);
    };
  }, []);

  return (
    <>
      <div className={styles.gameContainer} ref={containerRef} />
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
        </div>
      )}
    </>
  );
};

export default GameWrapper;

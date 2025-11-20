import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.css";
import { useTranslation } from "react-i18next";
import { GameScene } from "../../game/GameScene";
import { EVENT_MAP, type EventTypes } from "../../constant";
import Modal from "./Modal";
import Phaser from "phaser";

interface GameWrapperProps {
  onBack: () => void;
}

const getConfig = (parent: HTMLElement) => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: parent,
    width: window.innerWidth,
    height: window.innerHeight,
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
  const [t] = useTranslation();
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [modalType, setModalType] = useState<EventTypes | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    gameRef.current = new Phaser.Game(getConfig(containerRef.current));

    // Cleanup
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setModalType(EVENT_MAP.GAME_OVER);
      }

      return false;
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div className={styles.gameContainer} ref={containerRef} />
      <button
        className={styles.endGameButton}
        onClick={() => setModalType(EVENT_MAP.GAME_OVER)}
      >
        {t("game.endGame")}
      </button>
      <Modal
        modalType={modalType}
        setModalType={setModalType}
        onBack={onBack}
        gameRef={gameRef}
      />
    </>
  );
};

export default GameWrapper;

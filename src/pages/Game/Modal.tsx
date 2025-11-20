import React, { useEffect, useMemo, useState } from "react";
import { Dialog } from "../../components";
import { useTranslation } from "react-i18next";
import { EVENT_MAP, type EventTypes } from "../../constant";
import type { UpgradeOption } from "../../game/weapon";
import EventBus from "../../game/eventBus";
import styles from "./index.module.css";
import Phaser from "phaser";
import type { GameScene } from "../../game/GameScene";

interface GameWrapperProps {
  onBack: () => void;
  modalType: EventTypes | null;
  setModalType: (type: EventTypes | null) => void;
  gameRef: React.RefObject<Phaser.Game | null>;
}

const ModalContainer: React.FC<GameWrapperProps> = ({
  onBack,
  modalType,
  setModalType,
  gameRef,
}) => {
  const [t] = useTranslation();
  const [upgradeData, setUpgradeData] = useState<UpgradeOption[] | null>(null);

  const gameScene = useMemo(() => {
    const scene = gameRef.current?.scene.getAt(0);
    return scene as GameScene | undefined;
  }, [gameRef]);

  useEffect(() => {
    const handleUpgradeLevel = (options: UpgradeOption[]) => {
      setModalType(EVENT_MAP.UPGRADE_LEVEL);
      setUpgradeData(options);
    };

    const handleGameOver = () => {
      onBack()
    }

    EventBus.on(EVENT_MAP.UPGRADE_LEVEL, handleUpgradeLevel);
    EventBus.on(EVENT_MAP.GAME_OVER, handleGameOver);

    return () => {
      EventBus.off(EVENT_MAP.UPGRADE_LEVEL, handleUpgradeLevel);
      EventBus.off(EVENT_MAP.GAME_OVER, handleGameOver);
    };
  }, []);

  if (modalType === EVENT_MAP.GAME_OVER) {
    return (
      <Dialog
        visible
        title={t("game.endGameTitle")}
        onCancel={() => setModalType(null)}
        onOk={onBack}
        confirmText={t("game.endGame")}
        testId={modalType}
      />
    );
  }

  if (modalType === EVENT_MAP.UPGRADE_LEVEL && upgradeData) {
    return (
      <div className={styles.modalContainer}>
        <div className={styles.modalContent}>
          {upgradeData.map((item) => (
            <div
              key={item.name}
              className={styles.card}
              onClick={() => {
                gameScene?.selectUpgrade(item);
                setModalType(null);
              }}
            >
              <div>{item.name}</div>
              <div>{item.description}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default ModalContainer;

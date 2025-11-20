import React, { FunctionComponent, memo } from "react";
import { createPortal } from "react-dom";
import { createRoot, Root } from "react-dom/client";
import styles from "./index.module.css";
import { useTranslation } from "react-i18next";

interface DialogProps {
  title: string;
  visible: boolean;
  className?: string;
  children?: React.ReactNode;
  testId?: string;
  cancelText?: string;
  confirmText?: string;
  getContainer?: () => HTMLElement;
  onOk?: React.MouseEventHandler<HTMLButtonElement>;
  onCancel?: React.MouseEventHandler<HTMLButtonElement>;
  hideButtons?: boolean;
}

export const Dialog: FunctionComponent<DialogProps> = memo((props) => {
  const {
    children,
    title,
    className = "",
    onCancel,
    onOk,
    visible,
    getContainer = () => document.body,
    testId,
    cancelText,
    confirmText,
    hideButtons = false,
  } = props;

  const [t] = useTranslation();

  if (!visible) {
    return undefined;
  }
  const cancelTestId = testId ? `${testId}-cancel` : undefined;
  const confirmTestId = testId ? `${testId}-confirm` : undefined;
  return createPortal(
    <div className={styles["dialog-modal"]} data-testid={testId}>
      <div className={`${styles["dialog-container"]} ${className}`}>
        <div className={styles.titleWrapper}>
          <div className={styles["dialog-title"]}>{title}</div>
          <button
            className={styles.closeButton}
            onClick={(event) => {
              onCancel?.(event as any);
            }}
          >
            X
          </button>
        </div>
        <div className={styles["dialog-content"]}>{children}</div>
        {!hideButtons && (
          <div className={styles["dialog-button"]}>
            <button
              onClick={onCancel}
              data-testId={cancelTestId}
              className="backButton"
            >
              {cancelText || t("cancel")}
            </button>

            <button
              onClick={onOk}
              data-testId={confirmTestId}
              className="confirmButton"
            >
              {confirmText || t("confirm")}
            </button>
          </div>
        )}
      </div>
    </div>,
    getContainer()
  );
});
Dialog.displayName = "Dialog";

export function info(props: DialogProps) {
  const container = document.createDocumentFragment();
  let root: Root | undefined = undefined;
  function close() {
    root?.unmount();
    root = undefined;
  }

  function render(modalProps: DialogProps) {
    root = root || createRoot(container);
    root.render(
      <Dialog
        visible={modalProps.visible}
        title={modalProps.title}
        className={modalProps.className}
        onCancel={(event) => {
          event.stopPropagation();
          if (modalProps.onCancel) {
            modalProps.onCancel(event);
          }
          close();
        }}
        onOk={(event) => {
          event.stopPropagation();
          if (modalProps.onOk) {
            modalProps.onOk(event);
          }
          close();
        }}
        testId={modalProps.testId}
      >
        {modalProps.children}
      </Dialog>
    );
  }
  function update(modalProps: DialogProps) {
    render(modalProps);
  }

  render(props);

  return {
    close,
    update,
  };
}

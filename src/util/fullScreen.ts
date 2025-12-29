import { toast } from "../components";
import i18n from "../i18n";

export const confirmModal = (message: string): boolean => {
  const res = window.confirm(message);

  if (res) {
    toast.success(i18n.t("settings.resetSuccess"));
  }
  return res;
};

function requestFullscreen(element: any) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    // webkit
    element.webkitRequestFullscreen();
  } else if (element.mozRequestFullScreen) {
    // Firefox
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    // IE/Edge
    element.msRequestFullscreen();
  }
}

function exitFullscreen() {
  const element = document as any;

  if (element.exitFullscreen) {
    element.exitFullscreen();
  } else if (element.webkitExitFullscreen) {
    element.webkitExitFullscreen();
  } else if (element.mozCancelFullScreen) {
    element.mozCancelFullScreen();
  } else if (element.msExitFullscreen) {
    element.msExitFullscreen();
  }
}

export function isFullScreen() {
  const element = document as any;

  const res =
    !!element.fullscreenElement ||
    !!element.webkitFullscreenElement ||
    !!element.mozFullScreenElement ||
    !!element.msFullscreenElement;

  return res;
}

export const toggleFullScreen = (enable: boolean) => {
  const isOn = isFullScreen();

  if (isOn === enable) {
    return;
  }

  if (enable) {
    requestFullscreen(document.documentElement);
  } else {
    exitFullscreen();
  }
};

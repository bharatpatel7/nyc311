import { FiPlus, FiMinus } from "react-icons/fi";
import type { ZoomButtonConfig } from "./types";

export const ZOOM_BUTTONS: ZoomButtonConfig[] = [
  {
    key: "zoomIn",
    icon: FiPlus,
    action: "zoomIn",
    disabledKey: "disableZoomIn",
    ariaLabel: "Zoom in",
  },
  {
    key: "zoomOut",
    icon: FiMinus,
    action: "zoomOut",
    disabledKey: "disableZoomOut",
    ariaLabel: "Zoom out",
  },
];

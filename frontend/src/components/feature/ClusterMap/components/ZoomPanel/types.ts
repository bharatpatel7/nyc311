import type { IconType } from "react-icons";

export type ZoomAction = "zoomIn" | "zoomOut";
export type DisabledKey = "disableZoomIn" | "disableZoomOut";

export interface ZoomButtonConfig {
  key: ZoomAction;
  icon: IconType;
  action: ZoomAction;
  disabledKey: DisabledKey;
  ariaLabel: string;
}

export interface ResetButtonProps {
  resetView: () => void;
  disableReset: boolean;
}

export interface ZoomButtonsProps {
  zoomIn: () => void;
  zoomOut: () => void;
  disableZoomIn: boolean;
  disableZoomOut: boolean;
}

export interface ZoomPanelProps extends ZoomButtonsProps, ResetButtonProps {
  disableReset: boolean;
}

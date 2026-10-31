import { FiCompass } from "react-icons/fi";
import Button from "@/components/ui/Button";
import { ZOOM_BUTTONS } from "./constants";
import Divider from "../Divider";
import Tooltip from "../Tooltip";
import type {
  DisabledKey,
  ResetButtonProps,
  ZoomAction,
  ZoomButtonConfig,
  ZoomButtonsProps,
  ZoomPanelProps,
} from "./types";
import { buttonClass, panelClass } from "./styles";

const ZoomButtons = ({ zoomIn, zoomOut, disableZoomIn, disableZoomOut }: ZoomButtonsProps) => {
  const actions: Record<ZoomAction, () => void> = { zoomIn, zoomOut };
  const disabled: Record<DisabledKey, boolean> = { disableZoomIn, disableZoomOut };

  return (
    <div className={`flex flex-col ${panelClass}`}>
      {ZOOM_BUTTONS.map((btn: ZoomButtonConfig, i: number) => {
        const { key, icon: Icon, action, disabledKey, ariaLabel } = btn;
        return (
          <div key={key}>
            {i > 0 && <Divider />}
            <Button
              aria-label={ariaLabel}
              onClick={actions[action]}
              disabled={disabled[disabledKey]}
              variant="icon"
              className={`${buttonClass} disabled:opacity-40 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent`}
            >
              <Icon size={18} />
            </Button>
          </div>
        );
      })}
    </div>
  );
};

const ResetButton = ({ resetView, disableReset }: ResetButtonProps) => (
  <div className="group relative">
    <div className={panelClass}>
      <Button
        aria-label="Reset map view"
        onClick={resetView}
        variant="icon"
        disabled={disableReset}
        className={buttonClass}
      >
        <FiCompass size={18} />
      </Button>
    </div>
    <Tooltip label="Reset" />
  </div>
);

const ZoomPanel = ({
  zoomIn,
  zoomOut,
  resetView,
  disableZoomIn,
  disableZoomOut,
  disableReset,
}: ZoomPanelProps) => (
  <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
    <ZoomButtons
      zoomIn={zoomIn}
      zoomOut={zoomOut}
      disableZoomIn={disableZoomIn}
      disableZoomOut={disableZoomOut}
    />
    <ResetButton resetView={resetView} disableReset={disableReset} />
  </div>
);

export default ZoomPanel;

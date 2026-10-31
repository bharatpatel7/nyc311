import Loader from "@/components/ui/Loader";
import { LOADING_LABEL } from "./constants";
import type { LoadingOverlayProps } from "./types";

/**
 * Full-container overlay that centers a spinner and prevents interaction during loading states.
 */
const LoadingOverlay = ({ isVisible, label = LOADING_LABEL }: LoadingOverlayProps) => (
  <div
    className="absolute inset-0 z-[1000] flex items-center justify-center rounded bg-white/80 dark:bg-[#0a1628]/80 transition-opacity duration-200"
    style={{ opacity: isVisible ? 1 : 0, pointerEvents: isVisible ? "auto" : "none" }}
  >
    {isVisible && <Loader isShowLabel={false} label={label} />}
  </div>
);

export default LoadingOverlay;

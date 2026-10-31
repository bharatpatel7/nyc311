import { cn } from "@/lib/util";
import type { LoaderProps, LoaderSize } from "@/types/Loader";
import { DEFAULT_LABEL, WRAP_SIZE_CLASS, FONT_SIZE_CLASS, SPINNER_CLASS } from "./constants";

const MultiShadow = ({ size = "md" }: { size?: LoaderSize }) => (
  <div className={cn("flex items-center justify-center", WRAP_SIZE_CLASS[size])}>
    <div
      className={cn(
        `relative h-[1em] w-[1em] -indent-[9999em] overflow-hidden rounded-full text-indigo-600 ${SPINNER_CLASS}`,
        FONT_SIZE_CLASS[size]
      )}
      style={{
        animation: "mltShdSpin 1.7s infinite ease, mltShdRound 1.7s infinite ease",
        animationDelay: "-0.5s",
      }}
    />
  </div>
);
/* HTML: <div class="loader"></div> */

/**
 * loader
 * @param label       - optional text displayed below the spinner
 * @param size        - sm | md | lg
 * @param isShowSpinner - set false to hide the spinner
 * @param isShowLabel   - set false to hide the label
 */
const Loader = ({
  label,
  size = "md",
  isShowSpinner = true,
  isShowLabel = true,
  className,
}: LoaderProps) => {
  const displayLabel = isShowLabel
    ? (label ?? (!isShowSpinner ? DEFAULT_LABEL : undefined))
    : undefined;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("flex flex-col items-center gap-3", className)}
    >
      {isShowSpinner && <MultiShadow size={size} />}
      {displayLabel && (
        <p className="text-xs text-gray-400 dark:text-gray-400 font-black">
          {displayLabel}
          <span className="inline-flex w-4">
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ animation: `ellipsis 1.2s ease-in-out ${i * 0.2}s infinite` }}>
                .
              </span>
            ))}
          </span>
        </p>
      )}
    </div>
  );
};

export default Loader;

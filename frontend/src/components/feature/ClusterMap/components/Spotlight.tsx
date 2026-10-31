import Button from "@/components/ui/Button";
import { useState, useEffect, useCallback, type RefObject } from "react";
import { createPortal } from "react-dom";
import { FiX, FiArrowRight, FiArrowLeft } from "react-icons/fi";

interface Step {
  title: string;
  description: string;
  onEnter?: () => void;
  highlightSelector?: string;
}

interface SpotlightTipProps {
  id: string;
  targetRef: RefObject<HTMLDivElement | null>;
  steps: Step[];
  onOpenChange: (open: boolean) => void;
  onDismiss?: () => void;
}

const btn =
  "flex-1 rounded text-[11px] font-medium py-1.5 cursor-pointer transition-colors border-none";

/**
 * A multi-step walkthrough tooltip that portals into document.body.
 *
 * Shows a pulsing dot over targetRef to signal there's a new feature.
 * Clicking it opens a popup with step-by-step instructions. Each step can
 * optionally highlight a specific element via highlightSelector and run a
 * side-effect via onEnter (e.g. opening a panel before the step is shown)
 *
 * Once dismissed, a flag is written to localStorage under spotlight-tip:{id}
 * so  tip doesn't re-appear on future visits
 */
const SpotlightTip = ({ id, targetRef, steps, onOpenChange, onDismiss }: SpotlightTipProps) => {
  // hide permanently if the user has already dismissed this tip
  const [visible, setVisible] = useState(() => !localStorage.getItem(`spotlight-tip:${id}`));
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  // bounding rect of the targetRef element — used to position the popup
  const [rect, setRect] = useState<DOMRect | null>(null);
  // bounding rect of the currently highlighted element for the backdrop cutout
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // recompute the target element's position on demand
  const updateRect = useCallback(() => {
    if (targetRef.current) setRect(targetRef.current.getBoundingClientRect());
  }, [targetRef]);

  const close = useCallback(() => {
    setOpen(false);
    onOpenChange(false);
  }, [onOpenChange]);

  // resolve the highlight element's rect from a CSS selector, or clear it if none
  const updateHighlightRect = useCallback((selector?: string) => {
    if (!selector) {
      setHighlightRect(null);
      return;
    }
    const el = document.querySelector(selector);
    if (el) setHighlightRect(el.getBoundingClientRect());
    else setHighlightRect(null);
  }, []);

  // keep the popup position in sync with the target element across resizes/scrolls.
  // multiple timeouts are used because the DOM may not have settled immediately.
  useEffect(() => {
    if (!visible) return;
    const timers = [100, 500, 1000].map((ms) => setTimeout(updateRect, ms));
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    const observer = new ResizeObserver(updateRect);
    if (targetRef.current) observer.observe(targetRef.current);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      observer.disconnect();
    };
  }, [visible, targetRef, updateRect]);

  // update the highlight rect after step transitions, with retries for async DOM updates
  useEffect(() => {
    if (!open) return;
    const selector = steps[step]?.highlightSelector;
    const timers = [50, 200, 500].map((ms) => setTimeout(() => updateHighlightRect(selector), ms));
    return () => timers.forEach(clearTimeout);
  }, [step, open, steps, updateHighlightRect]);

  // close the walkthrough on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  /** Persist dismissal to localStorage and tear down the tip. */
  const dismiss = () => {
    localStorage.setItem(`spotlight-tip:${id}`, "1");
    setVisible(false);
    onDismiss?.();
    close();
  };

  /** Start the walkthrough from step 0, running any onEnter side-effect */
  const openWalkthrough = () => {
    setStep(0);
    steps[0]?.onEnter?.();
    setOpen(true);
    onOpenChange(true);
  };

  /** Navigate to a specific step and run its onEnter side-effect */
  const goToStep = (next: number) => {
    steps[next]?.onEnter?.();
    setStep(next);
  };

  const isLast = step === steps.length - 1;

  const currentStep = steps[step];

  if (!visible || !rect) return null;

  return createPortal(
    <>
      {!open && (
        <div
          onClick={openWalkthrough}
          className="fixed z-[9999] rounded cursor-pointer"
          style={{ top: rect.top, left: rect.left + 2, width: rect.width, height: rect.height }}
        >
          <span className="absolute top-1.5 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500" />
          </span>
        </div>
      )}

      {open && rect && (
        <>
          {highlightRect ? (
            <div
              className="fixed z-[10000] pointer-events-none rounded"
              style={{
                top: highlightRect.top - 4,
                left: highlightRect.left - 4,
                width: highlightRect.width + 8,
                height: highlightRect.height + 8,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
                pointerEvents: "none",
              }}
            />
          ) : (
            <div className="fixed inset-0 z-[10000] bg-black/30 pointer-events-none" />
          )}

          <div
            className="fixed z-[10001]"
            style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          />

          <div
            data-spotlight-popup
            className="fixed z-[10002] w-72 rounded border border-slate-200 bg-white shadow-xl p-4"
            style={{ top: rect.top, left: rect.right + 8 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-blue-500">
                  New Feature
                </span>
                <span className="text-[10px] text-slate-400">
                  {step + 1} / {steps.length}
                </span>
              </div>
              <Button
                variant="icon"
                aria-label="Close"
                onClick={close}
                className="p-0 text-slate-400 hover:text-slate-600"
              >
                <FiX size={13} />
              </Button>
            </div>

            <div className="h-[2px] w-full bg-slate-100 rounded-full mb-4">
              <div
                className="h-[2px] bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>

            <p className="text-[13px] font-semibold text-slate-800 leading-snug mb-1">
              {currentStep.title}
            </p>
            <p className="text-[12px] text-slate-500 leading-relaxed mb-4">
              {currentStep.description}
            </p>

            <div className="flex items-center justify-center gap-1.5 mb-4">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToStep(i)}
                  className={`rounded-full transition-all border-none cursor-pointer ${i === step ? "w-4 h-1.5 bg-blue-500" : "w-1.5 h-1.5 bg-slate-200"}`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {step > 0 && (
                <Button
                  variant="none"
                  aria-label="Back"
                  onClick={() => goToStep(step - 1)}
                  className={`${btn} border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-1`}
                >
                  <FiArrowLeft size={11} /> Back
                </Button>
              )}
              {!isLast ? (
                <Button
                  variant="none"
                  aria-label="Next"
                  onClick={() => goToStep(step + 1)}
                  className={`${btn} bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-1`}
                >
                  Next <FiArrowRight size={11} />
                </Button>
              ) : (
                <Button
                  variant="none"
                  aria-label="Done"
                  onClick={dismiss}
                  className={`${btn} bg-emerald-500 hover:bg-emerald-600 text-white`}
                >
                  Done
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </>,
    document.body
  );
};

export default SpotlightTip;

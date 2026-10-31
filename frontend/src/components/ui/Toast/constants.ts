import type { ToastVariant } from "@/types/Toast";

export const TEST_MESSAGE = "Test message";

export const OPACITY_STYLE = {
  VISIBLE: "opacity-100",
  NOT_VISIBLE: "opacity-0",
};

export const INVISIBLE_DISABLE_EVENTS = "pointer-events-none";

export const VARIANT_STYLES = {
  INFO: "text-blue-800",
  SUCCESS: "text-green-800",
  WARNING: "text-amber-800",
  ERROR: "text-red-800",
};

export const VARIANT_BAR_STYLES: Record<ToastVariant, string> = {
  info: "bg-blue-300",
  success: "bg-green-300",
  warning: "bg-stone-400",
  error: "bg-red-300",
  emerald: "bg-emerald-300",
};

export const TIMER_DURATION = 3000;

export const MAX_TOAST_PROGRESS = 100;

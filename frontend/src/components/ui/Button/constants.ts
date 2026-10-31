import type { ButtonSize, ButtonVariant } from "@/types/Button";

export const BUTTON_TEXT = "Test button";
export const BUTTON_COLOUR_STYLES = {
  PRIMARY: "bg-indigo-600",
  SECONDARY: "bg-white",
};

export const BUTTON_SIZE_STYLES = {
  SMALL: "text-sm",
  MEDIUM: "text-base",
  LARGE: "text-lg",
};

export const DEFAULT_BUTTON_CLASS = "rounded-xl";

export const VARIANT_STYLES: Record<ButtonVariant, string> = {
  base: "",
  primary: "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 rounded-xl",
  secondary: "bg-white text-gray-900 ring-1 ring-gray-300 shadow-sm hover:bg-gray-50 rounded-xl",
  glass:
    "rounded-r-full border border-white/50 bg-white/30 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md hover:bg-white/45 dark:border-white/20 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20",
  dropdown:
    "flex h-9 min-w-[14rem] max-w-[14rem] overflow-hidden items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 text-left text-xs text-gray-800 shadow-sm transition-all hover:border-gray-300 focus:outline-none disabled:cursor-wait disabled:opacity-40 dark:border-gray-700 bg-white/80 dark:bg-[#0d0d0d] dark:text-gray-100 dark:hover:border-gray-600",
  icon: "rounded-md p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
  none: "",
};

export const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-8 py-3.5 text-lg",
};

export const ICON_SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "h-8 min-w-8 text-sm",
  md: "h-10 min-w-10 text-base",
  lg: "h-12 min-w-12 text-lg",
};

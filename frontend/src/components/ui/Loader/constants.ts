import type { LoaderSize } from "@/types/Loader";

export const DEFAULT_LABEL = "Loading";
export const DEFAULT_LABEL_ONLY = "Please wait";

export const SPINNER_CLASS = "transform-gpu";

export const WRAP_SIZE_CLASS: Record<LoaderSize, string> = {
  sm: "size-20",
  md: "size-32",
  lg: "size-48",
};

export const FONT_SIZE_CLASS: Record<LoaderSize, string> = {
  sm: "text-[20px]",
  md: "text-[32px]",
  lg: "text-[48px]",
};

export const SIZE_CASES = [
  { size: "sm", expected: FONT_SIZE_CLASS.sm },
  { size: "md", expected: FONT_SIZE_CLASS.md },
  { size: "lg", expected: FONT_SIZE_CLASS.lg },
] as const;

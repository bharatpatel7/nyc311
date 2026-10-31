export type LoaderSize = "sm" | "md" | "lg";

export interface LoaderProps {
  label?: string;
  size?: LoaderSize;
  isShowSpinner?: boolean;
  isShowLabel?: boolean;
  className?: string;
}

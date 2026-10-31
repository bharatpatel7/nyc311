import type { ComponentProps, ReactNode } from "react";

export type ButtonVariant =
  | "base"
  | "primary"
  | "secondary"
  | "glass"
  | "icon"
  | "dropdown"
  | "none";

export type ButtonSize = "sm" | "md" | "lg";

type BaseButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
};

export type ButtonProps = BaseButtonProps &
  (
    | { variant: "icon"; "aria-label": string }
    | { variant?: Exclude<ButtonVariant, "icon">; "aria-label"?: string }
  );

import type { ButtonProps } from "@/types/Button";
import { cn } from "@/lib/util";
import { ICON_SIZE_STYLES, SIZE_STYLES, VARIANT_STYLES } from "./constants";

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
        VARIANT_STYLES[variant],
        variant === "icon" ? ICON_SIZE_STYLES[size] : SIZE_STYLES[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

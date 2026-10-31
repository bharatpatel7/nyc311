export type ToastVariant = "info" | "success" | "warning" | "error" | "emerald";

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  isVisible: boolean;
  duration?: number;
  onClose: () => void;
}

import { FiX, FiInfo, FiCheckCircle, FiAlertTriangle, FiAlertCircle } from "react-icons/fi";
import { clsx } from "clsx";
import type { ToastProps, ToastVariant } from "@/types/Toast";
import { useEffect, useState, type ReactNode } from "react";
import Button from "@/components/ui/Button";
import { MAX_TOAST_PROGRESS, VARIANT_BAR_STYLES } from "./constants";

const variantStyles: Record<ToastVariant, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-green-200 bg-green-50 text-green-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-grey-200 bg-grey-100 text-grey-700",
  error: "border-red-200 bg-red-50 text-red-800",
};

const variantIcons: Record<ToastVariant, ReactNode> = {
  info: <FiInfo />,
  success: <FiCheckCircle />,
  warning: <FiAlertTriangle />,
  error: <FiAlertCircle />,
  emerald: <FiAlertTriangle />,
};

export default function ToastMessage({
  message,
  variant = "info",
  isVisible,
  onClose,
  duration,
}: ToastProps) {
  const [progress, setProgress] = useState(MAX_TOAST_PROGRESS);

  useEffect(() => {
    if (!isVisible || !duration) return;
    setProgress(MAX_TOAST_PROGRESS);

    const interval = setInterval(() => {
      setProgress((p) => Math.max(0, p - MAX_TOAST_PROGRESS / (duration / MAX_TOAST_PROGRESS)));
    }, MAX_TOAST_PROGRESS);

    const timer = setTimeout(onClose, duration);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isVisible, duration, onClose]);

  return (
    <div
      className={clsx(
        "fixed bottom-6 right-6 z-50 flex max-w-sm flex-col rounded border-md shadow-md transition-all duration-300 overflow-hidden",
        variantStyles[variant],
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      role="alert"
    >
      <div className="flex items-center gap-3 px-5 py-3.5">
        <span className="text-lg">{variantIcons[variant]}</span>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <Button variant="secondary" className="ml-2 rounded-lg p-1 opacity-60" onClick={onClose}>
          <FiX />
        </Button>
      </div>
      {duration && <ToastProgressBar variant={variant} progress={progress} />}
    </div>
  );
}

interface ToastProgressBarProps {
  variant: ToastVariant;
  progress: number;
}

const ToastProgressBar = ({ variant, progress }: ToastProgressBarProps) => {
  return (
    <div className="h-1 w-full bg-black/10">
      <div
        className={clsx("h-full transition-all ease-linear", VARIANT_BAR_STYLES[variant])}
        style={{
          width: `${(progress / MAX_TOAST_PROGRESS) * 100}%`,
          transitionDuration: `${MAX_TOAST_PROGRESS}ms`,
        }}
      />
    </div>
  );
};

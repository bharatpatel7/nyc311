import { useEffect, useRef, useCallback, type ReactNode } from "react";

interface DropdownContainerProps {
  onClose: () => void;
  children: ReactNode;
}

const DropdownContainer = ({ onClose, children }: DropdownContainerProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const close = useCallback(
    (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [close]);

  return (
    <div ref={ref} className="relative flex flex-col gap-0.5">
      {children}
    </div>
  );
};

export default DropdownContainer;

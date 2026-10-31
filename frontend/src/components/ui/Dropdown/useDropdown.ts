import type { FilterValue } from "./types";
import { useState, useCallback, type KeyboardEvent } from "react";

interface UseDropdownProps<T extends FilterValue> {
  options: readonly T[];
  onChange: (value: T | undefined) => void;
}

const useDropdown = <T extends FilterValue>({ options, onChange }: UseDropdownProps<T>) => {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);

  const totalItems = options.length + 1;

  const close = useCallback(() => {
    setOpen(false);
    setFocusIndex(-1);
  }, []);

  const select = useCallback(
    (val: T | undefined) => {
      onChange(val);
      close();
    },
    [onChange, close]
  );

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  const openMenu = useCallback(() => {
    setOpen(true);
    setFocusIndex(0);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          if (!open) {
            openMenu();
          } else if (focusIndex === 0) {
            select(undefined);
          } else if (focusIndex > 0) {
            select(options[focusIndex - 1]);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!open) {
            openMenu();
          } else {
            setFocusIndex((prev) => Math.min(prev + 1, totalItems - 1));
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (open) setFocusIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Escape":
        case "Tab":
          close();
          break;
      }
    },
    [open, focusIndex, options, totalItems, close, select, openMenu]
  );

  return { open, focusIndex, close, select, toggle, handleKeyDown };
};

export default useDropdown;

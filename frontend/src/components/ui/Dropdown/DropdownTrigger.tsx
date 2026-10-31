import type { DropdownTriggerProps } from "./types";
import Button from "@/components/ui/Button";
import { FiChevronDown } from "react-icons/fi";

const DropdownTrigger = ({
  id,
  open,
  loading,
  error,
  displayValue,
  hasValue,
  onToggle,
  onKeyDown,
}: DropdownTriggerProps) => (
  <Button
    type="button"
    id={id}
    role="combobox"
    aria-expanded={open}
    aria-haspopup="listbox"
    aria-labelledby={`${id}-label`}
    aria-controls={`${id}-listbox`}
    aria-describedby={error ? `${id}-error` : undefined}
    aria-busy={loading}
    disabled={loading}
    onClick={onToggle}
    onKeyDown={onKeyDown}
    variant="dropdown"
  >
    <span className={`truncate text-xs ${hasValue ? "" : "text-gray-400 dark:text-gray-500"}`}>
      {loading ? "Loading…" : displayValue}
    </span>
    <FiChevronDown
      className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform dark:text-gray-500 ${open ? "rotate-180" : ""}`}
    />
  </Button>
);

export default DropdownTrigger;

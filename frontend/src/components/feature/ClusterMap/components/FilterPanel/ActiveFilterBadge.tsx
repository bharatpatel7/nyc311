import Button from "@/components/ui/Button";
import { FaTimes } from "react-icons/fa";
import type { ActiveFilterBadgeProps } from "./types";

const ActiveFilterBadge = ({ filterKey, label, onRemove }: ActiveFilterBadgeProps) => (
  <span className="flex w-full items-center justify-between gap-1 rounded border border-white/30 dark:border-white/10 bg-white/20 dark:bg-white/5 px-2 py-1">
    <span className="truncate text-[11px] uppercase tracking-wider text-gray-600 dark:text-gray-300">
      {label}
    </span>
    <Button
      type="button"
      variant="icon"
      size="sm"
      onClick={() => onRemove(filterKey)}
      aria-label={`Remove ${label} filter`}
      className="shrink-0"
    >
      <FaTimes size={10} className="text-gray-400 hover:text-blue-400" />
    </Button>
  </span>
);

export default ActiveFilterBadge;

import { useFilters } from "@/context/FilterProvider";
import type { ButtonProps } from "./types";
import { IoFilter } from "react-icons/io5";
import Button from "@/components/ui/Button";

const ToggleButton = ({ onClick }: ButtonProps) => {
  const { activeEntries } = useFilters();
  const hasActive = activeEntries.length > 0;

  return (
    <Button
      aria-label="Toggle filters"
      variant="icon"
      size="lg"
      onClick={onClick}
      title="Toggle filters"
      className={`
    ml-1 relative flex items-center rounded-md cursor-pointer
    transition-all duration-150
    ${
      hasActive
        ? "text-gray-400/80 dark:text-blue-400"
        : "text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    }
  `}
    >
      <IoFilter size={22} />
      <span
        className={`absolute top-[13px] right-1.5 text-[10px] font-bold tabular-nums leading-none transition-opacity duration-150 ${hasActive ? "opacity-100" : "opacity-0"}`}
      >
        {activeEntries.length || ""}
      </span>
    </Button>
  );
};

export default ToggleButton;

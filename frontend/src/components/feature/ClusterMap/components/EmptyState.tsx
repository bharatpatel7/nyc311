import Button from "@/components/ui/Button/Button";
import type { EmptyStateProps } from "./types";

const EmptyState = ({ onLoadMock }: EmptyStateProps) => {
  return (
    <div className="absolute inset-0 z-[900] flex flex-col items-center justify-center gap-3 rounded bg-white/70 dark:bg-[#0a1628]/70 backdrop-blur-[2px]">
      <p className="text-sm font-black text-slate-600 dark:text-slate-300">
        No complaint data available
      </p>
      {onLoadMock && (
        <Button
          aria-label="Load mock data"
          onClick={onLoadMock}
          variant="none"
          className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-700 hover:shadow-lg dark:bg-stone-800 dark:text-gray-100 dark:hover:bg-stone-800/80"
        >
          Load mock data
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

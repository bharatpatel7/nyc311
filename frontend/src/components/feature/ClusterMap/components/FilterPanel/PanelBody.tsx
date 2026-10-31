import { useState } from "react";
import { useFilters } from "@/context/FilterProvider";
import ActiveFilters from "./ActiveFilters";
import type { FilterPanelBodyProps, SummaryProps } from "./types";
import { FiChevronDown } from "react-icons/fi";

type Tab = "filters" | "active";
const TABS: { key: Tab; label: string }[] = [
  { key: "filters", label: "Filters" },
  { key: "active", label: "Active" },
];

/**
 * The expanded panel body. Renders two tabs:
 * - "Filters" — shows the filter controls passed in as children
 * - "Active" — shows applied filters, a collapsible summary, and a reset button
 */
const PanelBody = ({
  isExpanded,
  activeTab,
  onTabChange,
  onHide,
  children,
  filteredCount,
  viewportCount,
}: FilterPanelBodyProps) => {
  const { activeEntries, reset: _reset } = useFilters();
  const [summaryOpen, setSummaryOpen] = useState(false);

  if (!isExpanded) return null;

  return (
    <div className="flex flex-col rounded border border-white/40 bg-white/25 shadow-xl backdrop-blur-md dark:border-white/15 dark:bg-white/10 w-64">
      {/* Tab bar */}
      <div className="grid grid-cols-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`relative px-3 py-2 text-[11px] uppercase tracking-wider transition-colors
              ${
                activeTab === key
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
          >
            {label}
            {key === "active" && activeEntries.length > 0 && (
              <span className="ml-1 rounded-full px-1.5 py-0.5 text-[10px] text-gray-500">
                {activeEntries.length}
              </span>
            )}
            {activeTab === key && (
              <span className="absolute bottom-0 left-[2.5%] h-0.5 w-[95%] rounded-full bg-blue-500 dark:bg-blue-400" />
            )}
          </button>
        ))}
        <div className="col-span-2 mx-[2.5%] border-b border-white/30 dark:border-white/10" />
      </div>

      <div className="p-3">
        {activeTab === "filters" && (
          <div className="flex flex-col gap-3">
            {children}
            <PanelFooter onHide={onHide} />
          </div>
        )}
        {activeTab === "active" && (
          <div data-walkthrough="active-filters" className="flex flex-col gap-3">
            <ActiveFilters />
            <div className="mx-[2.5%] border-t border-white/20 dark:border-white/10" />
            <button
              onClick={() => setSummaryOpen((p) => !p)}
              className="flex items-center justify-between text-[11px] uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span>Summary</span>
              <FiChevronDown
                size={12}
                className={`transition-transform ${summaryOpen ? "rotate-180" : ""}`}
              />
            </button>
            {summaryOpen && <Summary filteredCount={filteredCount} viewportCount={viewportCount} />}
            <PanelFooter onHide={onHide} />
          </div>
        )}{" "}
      </div>
    </div>
  );
};

export default PanelBody;

/** Shows filtered count (when filters are active) and the current viewport count */
const Summary = ({ filteredCount, viewportCount }: SummaryProps) => {
  const { activeEntries } = useFilters();
  return (
    <div className="flex flex-col gap-2">
      {activeEntries.length > 0 && (
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <span>Filtered</span>
          <span className="font-mono text-blue-600 dark:text-blue-400">
            {filteredCount.toLocaleString()}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
        <span>In View</span>
        <span className="font-mono text-gray-700 dark:text-gray-200">
          {viewportCount.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

/** Hide button and reset-all button shown at the bottom of both tabs */
const PanelFooter = ({ onHide }: { onHide: () => void }) => {
  const { activeEntries, reset: _reset } = useFilters();
  return (
    <>
      <div className="mx-[2.5%] border-t border-white/20 dark:border-white/10" />
      <div className="flex items-center justify-between">
        <button
          onClick={onHide}
          className="text-[11px] uppercase tracking-wider text-gray-500 transition-colors hover:text-blue-500 dark:text-gray-500 dark:hover:text-gray-300"
        >
          Hide
        </button>
        <ResetButton isExpanded={activeEntries.length === 0} />
      </div>
    </>
  );
};

interface ResetButtonProps {
  isExpanded: boolean;
}

/** Calls the filter context reset. Disabled when no filters are active */
export const ResetButton = ({ isExpanded }: ResetButtonProps) => {
  const { reset } = useFilters();
  return (
    <button
      onClick={reset}
      disabled={isExpanded}
      className="text-[11px] uppercase tracking-wider transition-colors
            disabled:cursor-default disabled:text-gray-400 dark:disabled:text-gray-700
            enabled:text-gray-500 enabled:hover:text-blue-500 dark:enabled:text-gray-500 dark:enabled:hover:text-blue-400"
    >
      Reset all
    </button>
  );
};

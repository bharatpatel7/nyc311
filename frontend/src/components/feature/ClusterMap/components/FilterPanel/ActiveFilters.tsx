import ActiveFilterBadge from "./ActiveFilterBadge";
import { FILTER_LABELS } from "./constants";
import { useFilters } from "@/context/FilterProvider";

const ActiveFilters = () => {
  const { activeEntries, removeFilter } = useFilters();
  const mapEntries = activeEntries.filter((e) => e.key !== "agency");

  if (mapEntries.length === 0) {
    return (
      <p className="text-center text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 py-2">
        No active filters
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {mapEntries.map(({ key, value }) => (
        <ActiveFilterBadge
          key={key}
          filterKey={key}
          label={`${FILTER_LABELS[key]}: ${value}`}
          onRemove={removeFilter}
        />
      ))}
    </div>
  );
};

export default ActiveFilters;

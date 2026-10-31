import type { FilterValue } from "@/components/ui/Dropdown/types";
import { useFilters } from "@/context/FilterProvider";
import { FILTERS } from "./constants";
import { Dropdown } from "@/components/ui";

const CategoryFilter = () => {
  const filters = useFilters();
  return (
    <div className="flex flex-col gap-3">
      {FILTERS.map(({ id, label, defaultLabel, key, value, setter }) => (
        <Dropdown
          key={id}
          id={id}
          label={label}
          defaultLabel={defaultLabel}
          value={filters[value] as FilterValue}
          onChange={filters[setter] as (value: FilterValue | undefined) => void}
          options={filters.options[key]}
          loading={filters.isLoading}
          error={filters.isError}
        />
      ))}
    </div>
  );
};

export default CategoryFilter;

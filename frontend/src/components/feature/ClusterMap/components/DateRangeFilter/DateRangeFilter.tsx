import { LABEL_FROM, LABEL_TO } from "./constants";
import { useFilters } from "@/context/FilterProvider";
import { inputClass } from "./styles";

export default function DateRangeFilter() {
  const { dateFrom, dateTo, setDateFrom, setDateTo } = useFilters();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor="date-from"
          className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          {LABEL_FROM}
        </label>
        <input
          id="date-from"
          type="date"
          value={dateFrom ?? ""}
          max={dateTo ?? ""}
          onChange={(e) => {
            const val = e.target.value || undefined;
            setDateFrom(val && dateTo && val > dateTo ? dateTo : val);
          }}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor="date-to"
          className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          {LABEL_TO}
        </label>
        <input
          id="date-to"
          type="date"
          value={dateTo ?? ""}
          min={dateFrom ?? ""}
          onChange={(e) => {
            const val = e.target.value || undefined;
            setDateTo(val && dateFrom && val < dateFrom ? dateFrom : val);
          }}
          className={inputClass}
        />
      </div>
    </div>
  );
}

import type { DepartmentFilterProps } from "./types";
import type { Agency } from "@/types/agency";
import Dropdown from "@/components/ui/Dropdown";

const DepartmentFilter = ({
  isError = false,
  isLoading = false,
  value,
  onChange,
  activeAgencies,
}: DepartmentFilterProps) => (
  <Dropdown<Agency>
    id="department"
    label="Department"
    defaultLabel="All Agencies"
    value={value}
    onChange={onChange}
    options={activeAgencies}
    loading={isLoading}
    error={isError}
  />
);

export default DepartmentFilter;

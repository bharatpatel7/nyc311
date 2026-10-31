import type { Agency } from "@/types/agency";

export interface DepartmentFilterProps {
  value: Agency | undefined;
  onChange: (value: Agency | undefined) => void;
  activeAgencies: readonly Agency[];
  isError?: boolean;
  isLoading?: boolean;
}

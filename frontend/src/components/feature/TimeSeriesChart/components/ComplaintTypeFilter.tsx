import Dropdown from "@/components/ui/Dropdown";
import type { ComplaintTypeFilterProps } from "./types";

const ComplaintTypeFilter = ({
  isError = false,
  isLoading = false,
  value,
  onChange,
  complaintTypes,
}: ComplaintTypeFilterProps) => (
  <Dropdown<string>
    id="complaint-type"
    label="Complaint Type"
    defaultLabel="All Types"
    value={value}
    onChange={onChange}
    options={complaintTypes}
    loading={isLoading}
    error={isError}
  />
);

export default ComplaintTypeFilter;

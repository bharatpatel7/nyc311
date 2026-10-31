export interface ComplaintTypeFilterProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  complaintTypes: readonly string[];
  isLoading?: boolean;
  isError?: boolean;
}

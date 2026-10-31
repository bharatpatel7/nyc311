export interface DateRangeFilterProps {
  dateFrom: string | undefined;
  dateTo: string | undefined;
  onChange: (dateFrom?: string, dateTo?: string) => void;
  className?: string;
}

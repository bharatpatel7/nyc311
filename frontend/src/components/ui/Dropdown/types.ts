import type { KeyboardEvent } from "react";
export type FilterValue = string;

export interface FilterProps<T extends FilterValue = FilterValue> {
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  options: readonly T[];
  loading: boolean;
  error: boolean;
}

export interface DropdownProps<T extends FilterValue> extends FilterProps<T> {
  id: string;
  label: string;
  defaultLabel?: string;
}

export interface DropdownListProps<T extends FilterValue> {
  id: string;
  options: readonly T[];
  value: T | undefined;
  focusIndex: number;
  defaultLabel: string;
  onSelect: (val: T | undefined) => void;
}

export interface DropdownTriggerProps {
  id: string;
  open: boolean;
  loading?: boolean;
  error?: boolean;
  displayValue: string;
  hasValue: boolean;
  onToggle: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
}

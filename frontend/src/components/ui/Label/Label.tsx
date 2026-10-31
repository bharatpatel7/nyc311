import type { DropdownLabelProps } from "./types";

const DropdownLabel = ({ id, label }: DropdownLabelProps) => (
  <label
    id={`${id}-label`}
    className="text-[11px] text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400"
  >
    {label}
  </label>
);

export default DropdownLabel;

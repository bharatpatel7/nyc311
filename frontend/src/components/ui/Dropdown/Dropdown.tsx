import type { DropdownProps, FilterValue } from "./types";
import useDropdown from "./useDropdown";
import DropdownContainer from "./DropdownContainer";
import DropdownTrigger from "./DropdownTrigger";
import DropdownList from "./DropdownList";
import DropdownLabel from "./DropdownLabel";

/**
 * Main Dropdown component that coordinates state (open/focus) with UI sub-components.
 */
const Dropdown = <T extends FilterValue>({
  id,
  label,
  value,
  onChange,
  options,
  loading,
  error,
  defaultLabel = "All",
}: DropdownProps<T>) => {
  const safeOptions = options ?? [];
  // Custom hook managing keyboard navigation and selection logic
  const { open, focusIndex, close, select, toggle, handleKeyDown } = useDropdown({
    options: safeOptions,
    onChange,
  });

  return (
    <DropdownContainer onClose={close}>
      <DropdownLabel id={id} label={label} />
      <DropdownTrigger
        id={id}
        open={open}
        loading={loading}
        error={error}
        displayValue={value ?? defaultLabel}
        hasValue={!!value}
        onToggle={toggle}
        onKeyDown={handleKeyDown}
      />

      {open && ( //Render list and handle focus based on current hook state
        <DropdownList
          id={id}
          options={safeOptions}
          value={value}
          focusIndex={focusIndex}
          defaultLabel={defaultLabel}
          onSelect={select}
        />
      )}
    </DropdownContainer>
  );
};

export default Dropdown;

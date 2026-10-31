import { useEffect, useRef } from "react";
import type { DropdownListProps, FilterValue } from "./types";
import { List, ListItem } from "@/components/ui";

const DropdownList = <T extends FilterValue>({
  id,
  options,
  value,
  focusIndex,
  defaultLabel,
  onSelect,
}: DropdownListProps<T>) => {
  const ref = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (!ref.current || focusIndex < 0) return;
    const items = ref.current.querySelectorAll("[role='option']");
    (items[focusIndex] as HTMLElement)?.scrollIntoView({ block: "nearest" });
  }, [focusIndex]);

  return (
    <List ref={ref} id={id}>
      <ListItem
        label={defaultLabel}
        selected={value === undefined}
        focused={focusIndex === 0}
        muted
        onClick={() => onSelect(undefined)}
      />
      {options.map((opt, i) => (
        <ListItem
          key={opt}
          label={opt}
          selected={value === opt}
          focused={focusIndex === i + 1}
          onClick={() => onSelect(opt)}
        />
      ))}
    </List>
  );
};

export default DropdownList;

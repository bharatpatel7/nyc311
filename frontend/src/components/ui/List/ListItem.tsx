import type { ListItemProps } from "./types";
import { listOptionClass } from "./utilts";

export const ListItem = ({ label, selected, focused, muted = false, onClick }: ListItemProps) => (
  <li
    role="option"
    aria-selected={selected}
    className={listOptionClass(selected, focused, muted)}
    onClick={onClick}
  >
    {label}
  </li>
);

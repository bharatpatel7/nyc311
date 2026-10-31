import type { ReactNode } from "react";

export interface ListProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export interface ListItemProps {
  label: string;
  selected: boolean;
  focused: boolean;
  muted?: boolean;
  onClick: () => void;
}

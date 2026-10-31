import type { ActiveFilters, ActiveTab } from "@/types/ClusterMap";
import type { ReactNode } from "react";

export interface ButtonProps {
  onClick: () => void;
  isExpanded: boolean;
}

export interface ActiveFilterBadgeProps {
  filterKey: keyof ActiveFilters;
  label: string;
  onRemove: (key: keyof ActiveFilters) => void;
}

export interface SummaryProps {
  filteredCount: number;
  viewportCount: number;
}

export interface FilterPanelBodyProps {
  isExpanded: boolean;
  activeTab: ActiveTab;
  children: ReactNode;
  filteredCount: number;
  viewportCount: number;
  onTabChange: (tab: ActiveTab) => void;
  onHide: () => void;
}

export interface FilterPanelProps extends SummaryProps {
  children: ReactNode;
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  spotlight?: boolean;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export interface PanelButtonsProps {
  isExpanded: boolean;
  onClick: () => void;
}

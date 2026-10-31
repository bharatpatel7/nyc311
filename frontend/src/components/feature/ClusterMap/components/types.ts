export interface TooltipProps {
  label: string;
}

export interface EmptyStateProps {
  onLoadMock?: () => void;
  filtersActive?: boolean;
}

export interface LoadingOverlayProps {
  isVisible: boolean;
  label?: string;
}

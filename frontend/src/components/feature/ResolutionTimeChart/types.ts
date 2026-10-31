import type { ReactNode } from "react";
import type { ResolutionTimeDto, Agency } from "@/types";

export interface ResolutionTimeChartProps {
  data: ResolutionTimeDto[];
  onAgencyClick?: (agency: Agency) => void;
}

export interface ResolutionTimeChartContainerProps {
  children: ReactNode;
}

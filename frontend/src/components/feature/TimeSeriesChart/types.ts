import type { ComplaintVolumeDto } from "@/hooks/types";
import type { ReactNode } from "react";

export interface ComplaintVolumeChartProps {
  data: ComplaintVolumeDto[];
}

export interface PivotedRow {
  period: string;
  [complaintType: string]: string | number;
}

export interface ChartContainerProps {
  children: ReactNode;
}

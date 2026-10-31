import type { Agency } from "@/types";
import {
  RESOLUTION_CHART_TOOLTIP_LABEL,
  RESOLUTION_CHART_TOOLTIP_UNIT,
} from "@/api/resolutionTime/constants";

export const formatResolutionTooltip = (value: unknown): [string, string] => {
  const num = typeof value === "number" ? value : parseFloat(String(value));
  return [`${num.toFixed(1)} ${RESOLUTION_CHART_TOOLTIP_UNIT}`, RESOLUTION_CHART_TOOLTIP_LABEL];
};

export const getAgencyFromBar = (d: unknown): Agency => {
  return (d as { agency: Agency }).agency;
};

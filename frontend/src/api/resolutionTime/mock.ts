import type { ResolutionTimeDto } from "@/types";

export const MOCK_RESOLUTION_TIME: ResolutionTimeDto[] = [
  { agency: "NYPD", medianMinutes: 20 },
  { agency: "DOT", medianMinutes: 6 },
  { agency: "HPD", medianMinutes: 48 },
  { agency: "DHS", medianMinutes: 127 },
  { agency: "DEP", medianMinutes: 29 },
] satisfies ResolutionTimeDto[];

export const MOCK_RESOLUTION_TIME_SINGLE: ResolutionTimeDto[] = [MOCK_RESOLUTION_TIME[0]];

export const MOCK_RESOLUTION_TIME_EMPTY: ResolutionTimeDto[] = [];

export const MOCK_RESOLUTION_TIME_GROUP = {
  ok: MOCK_RESOLUTION_TIME,
  single: MOCK_RESOLUTION_TIME_SINGLE,
  empty: MOCK_RESOLUTION_TIME_EMPTY,
} as const;

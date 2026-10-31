export type Agency =
  | "HPD"
  | "NYPD"
  | "DOT"
  | "DSNY"
  | "DEP"
  | "DOB"
  | "DPR"
  | "DOHMH"
  | "DOF"
  | "TLC"
  | "DCA"
  | "DHS"
  | "HRA"
  | "DFTA"
  | "3-1-1"
  | "DOE"
  | "EDC"
  | "NYCEM"
  | "DOITT"
  | "DCAS"
  | "ACS"
  | "TAX"
  | "DVS"
  | "DCP"
  | "DORIS"
  | "FDNY"
  | "TAT"
  | "COIB"
  | "CEO"
  | "MOC"
  | "OMB";

export interface MedianMinutes {
  medianMinutes: number;
}

export interface ResolutionTimeDtoRaw extends MedianMinutes {
  agency: string;
}

export interface ResolutionTimeDto extends MedianMinutes {
  agency: Agency;
}

export interface UseResolutionTimeResult {
  data: ResolutionTimeDto[];
  isLoading: boolean;
  isError: boolean;
}

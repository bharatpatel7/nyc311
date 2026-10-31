import { type Agency, type ResolutionTimeDto, type ResolutionTimeDtoRaw } from "@/types/agency";
import { logWarning } from "./util";

export const AGENCIES: Agency[] = [
  "HPD",
  "NYPD",
  "DOT",
  "DSNY",
  "DEP",
  "DOB",
  "DPR",
  "DOHMH",
  "DOF",
  "TLC",
  "DCA",
  "DHS",
  "HRA",
  "DFTA",
  "3-1-1",
  "DOE",
  "EDC",
  "NYCEM",
  "DOITT",
  "DCAS",
  "ACS",
  "TAX",
  "DVS",
  "DCP",
  "DORIS",
  "FDNY",
  "TAT",
  "COIB",
  "CEO",
  "MOC",
  "OMB",
];

export const AGENCY_LABELS: Record<Agency, string> = {
  HPD: "Housing Preservation and Development",
  NYPD: "Police Department",
  DOT: "Department of Transportation",
  DSNY: "Sanitation Department",
  DEP: "Environmental Protection",
  DOB: "Buildings Department",
  DPR: "Parks and Recreation",
  DOHMH: "Health and Mental Hygiene",
  DOF: "Department of Finance",
  TLC: "Taxi and Limousine Commission",
  DCA: "Consumer and Worker Protection",
  DHS: "Homeless Services",
  HRA: "Human Resources Administration",
  DFTA: "Department for the Aging",
  "3-1-1": "NYC 311 Service",
  DOE: "Department of Education",
  EDC: "Economic Development Corporation",
  NYCEM: "Emergency Management",
  DOITT: "Information Technology and Telecommunications",
  DCAS: "Citywide Administrative Services",
  ACS: "Administration for Children's Services",
  TAX: "Taxi (Legacy/Other)",
  DVS: "Veterans' Services",
  DCP: "City Planning",
  DORIS: "Records and Information Services",
  FDNY: "Fire Department",
  TAT: "Taxi and Limousine Adjudication Tribunal",
  COIB: "Conflicts of Interest Board",
  CEO: "Chief Executive Office",
  MOC: "Mayor's Office of Contracts",
  OMB: "Office of Management and Budget",
};

export const AGENCY_STORAGE_KEY = "selected-agency";

const AGENCY_SET = new Set<string>(AGENCIES);

export function isAgency(value: string): value is Agency {
  return AGENCY_SET.has(value);
}

export function parseResolutionTime(data: ResolutionTimeDtoRaw[]): ResolutionTimeDto[] {
  return data.reduce<ResolutionTimeDto[]>((acc, item) => {
    if (!isAgency(item.agency)) {
      logWarning(`ResolutionTime: invalid agency "${item.agency}"`);
      return acc;
    }
    acc.push({ agency: item.agency, medianMinutes: item.medianMinutes });
    return acc;
  }, []);
}

export const getAgencyLabel = (agency: Agency | undefined): string =>
  agency ? AGENCY_LABELS[agency] : "All Agencies";

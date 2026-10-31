import type { JsonBodyType } from "msw";

export type Status =
  | "Open"
  | "Closed"
  | "In Progress"
  | "Assigned"
  | "Started"
  | "Pending"
  | "default";

export type Borough = "MANHATTAN" | "BROOKLYN" | "QUEENS" | "BRONX" | "STATEN ISLAND";

export type ComplaintType =
  | "Noise - Residential"
  | "Noise - Commercial"
  | "Noise - Street/Sidewalk"
  | "Illegal Parking"
  | "Blocked Driveway"
  | "Heat/Hot Water"
  | "Street Condition"
  | "Water System"
  | "Rodent"
  | "Unsanitary Condition"
  | "Traffic Signal Condition"
  | "Homeless Encampment"
  | "Graffiti"
  | "Air Quality"
  | "Sewer";

export interface Neighbourhood {
  name: string;
  borough: Borough;
  lat: number;
  lng: number;
  spread: number;
  weight: number;
}

export type Method = "get" | "post" | "put" | "patch" | "delete";
export type ServiceStatus = "ok" | "error";
export type HttpLabel = "ok" | "created" | "badRequest" | "notFound" | "serverError";

type Informational = 100;
type Success = 200 | 201 | 204;
type Redirect = 301 | 302;
type ClientError = 400 | 401 | 403 | 404;
type ServerError = 500 | 502 | 503;

export type HttpCode = Informational | Success | Redirect | ClientError | ServerError;

export type HealthCheck = {
  status: ServiceStatus;
  uptime?: number;
};

export interface DomainFixtures<T extends JsonBodyType> {
  ok: T;
  empty: T;
}

export interface BoroughCount {
  borough: string;
  count: number;
}

export interface AgencyCount {
  agency: string;
  count: number;
}

export interface Summary {
  totalComplaints: number;
  complaintsByBorough: BoroughCount[];
  complaintsByAgency: AgencyCount[];
}

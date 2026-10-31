import type { Agency } from "./agency";
import type { Borough, ComplaintType, Status } from "./api";

export interface GeoPoint {
  uniqueKey: string;
  latitude: number;
  longitude: number;
  createdDate: string;
  complaintType: ComplaintType;
  borough: Borough;
  status: Status;
  agency: Agency;
}

import type { ComplaintVolumeDto } from "@/hooks/types";

export const VOLUME_STORAGE_KEY = "dashboard:selectedComplaintType";

export const MOCK_COMPLAINT_VOLUME: ComplaintVolumeDto[] = [
  { period: "2025-04", complaintType: "Noise - Residential", count: 320 },
  { period: "2025-05", complaintType: "Noise - Residential", count: 410 },
  { period: "2025-06", complaintType: "Noise - Residential", count: 580 },
  { period: "2025-07", complaintType: "Noise - Residential", count: 620 },
  { period: "2025-08", complaintType: "Noise - Residential", count: 590 },
  { period: "2025-09", complaintType: "Noise - Residential", count: 430 },
  { period: "2025-10", complaintType: "Noise - Residential", count: 310 },
  { period: "2025-11", complaintType: "Noise - Residential", count: 280 },
  { period: "2025-12", complaintType: "Noise - Residential", count: 260 },
  { period: "2026-01", complaintType: "Noise - Residential", count: 270 },
  { period: "2026-02", complaintType: "Noise - Residential", count: 290 },
  { period: "2026-03", complaintType: "Noise - Residential", count: 350 },
  { period: "2025-04", complaintType: "Heat/Hot Water", count: 180 },
  { period: "2025-05", complaintType: "Heat/Hot Water", count: 90 },
  { period: "2025-06", complaintType: "Heat/Hot Water", count: 40 },
  { period: "2025-07", complaintType: "Heat/Hot Water", count: 20 },
  { period: "2025-08", complaintType: "Heat/Hot Water", count: 25 },
  { period: "2025-09", complaintType: "Heat/Hot Water", count: 60 },
  { period: "2025-10", complaintType: "Heat/Hot Water", count: 150 },
  { period: "2025-11", complaintType: "Heat/Hot Water", count: 310 },
  { period: "2025-12", complaintType: "Heat/Hot Water", count: 380 },
  { period: "2026-01", complaintType: "Heat/Hot Water", count: 400 },
  { period: "2026-02", complaintType: "Heat/Hot Water", count: 360 },
  { period: "2026-03", complaintType: "Heat/Hot Water", count: 200 },
];

export const MOCK_COMPLAINT_VOLUME_SINGLE: ComplaintVolumeDto[] = MOCK_COMPLAINT_VOLUME.filter(
  (d) => d.complaintType === "Noise - Residential"
);

export const MOCK_COMPLAINT_VOLUME_FILTERED: ComplaintVolumeDto[] = [
  { period: "2025-04", complaintType: "Noise - Residential", count: 320 },
  { period: "2025-05", complaintType: "Noise - Residential", count: 410 },
  { period: "2025-06", complaintType: "Noise - Residential", count: 580 },
];

export const MOCK_COMPLAINT_VOLUME_INSUFFICIENT: ComplaintVolumeDto[] = [
  { period: "2025-04", complaintType: "Noise - Residential", count: 100 },
  { period: "2025-05", complaintType: "Noise - Residential", count: 200 },
];

export const MOCK_COMPLAINT_VOLUME_GROUP = {
  ok: MOCK_COMPLAINT_VOLUME,
  single: MOCK_COMPLAINT_VOLUME_SINGLE,
  filtered: MOCK_COMPLAINT_VOLUME_FILTERED,
  insufficient: MOCK_COMPLAINT_VOLUME_INSUFFICIENT,
  empty: [] as ComplaintVolumeDto[],
};

export const SAMPLE_TYPE = "Noise - Residential";

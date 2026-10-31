export interface ComplaintVolumeDto {
  period: string;
  complaintType: string;
  count: number;
}

export interface UseComplaintVolumeResult {
  data: ComplaintVolumeDto[];
  isLoading: boolean;
  isError: boolean;
}

package com.example.dto;

// Lightweight projection of a Complaint used for map rendering
// Only fields needed by the frontend map are included to keep the payload small
// createdDate is a plain date string rather than a full timestamp
// since the frontend only displays the date portion
public record ComplaintGeoPointDto(
    String uniqueKey,
    Double latitude,
    Double longitude,
    String complaintType,
    String borough,
    String createdDate,
    String status,
    String agencyName) {
  // no-arg
}

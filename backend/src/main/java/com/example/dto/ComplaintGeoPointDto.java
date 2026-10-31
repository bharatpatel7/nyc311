package com.example.dto;

// Lightweight projection of a Complaint used for map rendering
// Only fields needed by the frontend map are included to keep the payload small
// createdDate is the plain date, kept for the map's date filters; createdAt and
// closedAt are full local timestamps (closedAt is null while a complaint is open)
public record ComplaintGeoPointDto(
    String uniqueKey,
    Double latitude,
    Double longitude,
    String complaintType,
    String borough,
    String createdDate,
    String status,
    String agencyName,
    String createdAt,
    String closedAt) {
  // no-arg
}

package com.example.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

// JPA entity representing a single 311 complaint record from the NYC Open Data dataset
// The primary key is the dataset's own unique_key string rather than a generated ID
@Entity
@Table(name = "complaints")
public class Complaint {

  // Natural key sourced directly from the NYC 311 dataset.
  @Id
  @Column(name = "unique_key")
  private String uniqueKey;

  @Column(name = "created_date", nullable = false)
  private LocalDateTime createdDate;

  // Null for complaints that have not yet been resolved.
  @Column(name = "closed_date")
  private LocalDateTime closedDate;

  @Column(name = "complaint_type", nullable = false)
  private String complaintType;

  @Column(nullable = false)
  private String borough;

  @Column(nullable = false)
  private String status;

  // Nullable — not all complaints include location data
  // Only complaints with non-null lat/lng are shown on the map
  @Column private Double latitude;

  @Column private Double longitude;

  // fetched so agency name is available without an extra query when mapping to DTOs
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "agency_id")
  private Agency agency;

  public Complaint() {
    //
  }

  public String getUniqueKey() {
    return uniqueKey;
  }

  public LocalDateTime getCreatedDate() {
    return createdDate;
  }

  public LocalDateTime getClosedDate() {
    return closedDate;
  }

  public String getComplaintType() {
    return complaintType;
  }

  public String getBorough() {
    return borough;
  }

  public String getStatus() {
    return status;
  }

  public Double getLatitude() {
    return latitude;
  }

  public Double getLongitude() {
    return longitude;
  }

  public Agency getAgency() {
    return agency;
  }

  public void setAgency(Agency agency) {
    this.agency = agency;
  }
}

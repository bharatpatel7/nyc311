package com.example.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


// JPA entity that records each attempt to refresh complaint data from the upstream source
// Used by the frontend to show when the dataset was last successfully updated
@Entity
@Table(name = "data_refresh_log")
public class DataRefreshLog {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

    // When the refresh job started
  @Column(name = "refresh_started_at", nullable = false)
  private Instant refreshStartedAt;

    // When the refresh job finished. Null if the job is still in progress or failed before completion
  @Column(name = "refresh_completed_at")
  private Instant refreshCompletedAt;

    // Number of complaint records processed during this refresh run
  @Column(name = "records_processed")
  private Integer recordsProcessed;

    // Stored as a string in the database (IN_PROGRESS, SUCCESS, FAILED)
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private RefreshStatus status;

  public DataRefreshLog() {
    //
  }

  public Integer getId() {
    return id;
  }

  public Instant getRefreshStartedAt() {
    return refreshStartedAt;
  }

  public Instant getRefreshCompletedAt() {
    return refreshCompletedAt;
  }

  public Integer getRecordsProcessed() {
    return recordsProcessed;
  }

  public RefreshStatus getStatus() {
    return status;
  }
}

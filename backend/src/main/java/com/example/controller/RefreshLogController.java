package com.example.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.DataRefreshDto;
import com.example.entity.DataRefreshLog;
import com.example.entity.RefreshStatus;
import com.example.repository.DataRefreshLogRepository;


// Exposes read-only information about the most recent successful data refresh
// Used by the frontend to show users when the dataset was last updated
@RestController
@RequestMapping("/api/refreshlogs")
public class RefreshLogController {
  private final DataRefreshLogRepository dataRefreshLogRepository;

  public RefreshLogController(DataRefreshLogRepository dataRefreshLogRepository) {
    this.dataRefreshLogRepository = dataRefreshLogRepository;
  }

  
  // Returns the most recently completed successful refresh log.
  // Returns 404 if no successful refresh has ever been recorded
  @GetMapping("/latest")
  public ResponseEntity<DataRefreshDto> getLatest() {
    return dataRefreshLogRepository
        .findFirstByStatusOrderByRefreshCompletedAtDesc(RefreshStatus.SUCCESS)
        .map(this::toDto)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  
  // Maps a DataRefreshLog entity to a DTO
  // refreshCompletedAt is nullable for in-progress or failed logs, so it is null-checked.
  private DataRefreshDto toDto(DataRefreshLog r) {
    return new DataRefreshDto(
        r.getRefreshStartedAt().toString(),
        r.getRefreshCompletedAt() != null ? r.getRefreshCompletedAt().toString() : null,
        r.getRecordsProcessed(),
        r.getStatus().name());
  }
}

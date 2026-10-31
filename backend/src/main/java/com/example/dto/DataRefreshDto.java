package com.example.dto;

public record DataRefreshDto(
    String refreshStartedAt, String refreshCompletedAt, Integer recordsProcessed, String status) {
  // no-args
}

package com.example.dto;

import java.time.Instant;

// Standard error response body returned by GlobalExceptionHandler for all API errors
// All fields are included in every error response so clients have a consistent shape to parse
public record ErrorResponse(
    int status, String error, String message, String path, Instant timestamp) {

      
  // Convenience factory that stamps the current time automatically
  // Use this instead of the canonical constructor when handling exceptions
  public static ErrorResponse of(int status, String error, String message, String path) {
    return new ErrorResponse(status, error, message, path, Instant.now());
  }
}

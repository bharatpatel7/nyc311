package com.example.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// liveness check endpoint. Used by load balancers and container orchestrators
// to verify the application is running and accepting requests
@RestController
public class HealthController {

    // Returns {"status": "ok"} when the application is up
  @GetMapping("/api/health")
  public Map<String, String> health() {
    return Map.of("status", "ok");
  }
}

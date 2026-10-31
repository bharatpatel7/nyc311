package com.example.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.AgencyCountDto;
import com.example.dto.BoroughCountDto;
import com.example.dto.SummaryDto;
import com.example.repository.ComplaintRepository;

// Provides high-level complaint statistics used by the frontend dashboard summary panel
@RestController
@RequestMapping("/api/stats")
public class StatsController {

  private final ComplaintRepository complaintRepository;

  public StatsController(ComplaintRepository complaintRepository) {
    this.complaintRepository = complaintRepository;
  }

  
  // Returns total complaint count, complaints broken down by borough, and complaints by agency
  // Raw Object[] query results are mapped to typed DTOs here to keep the repository query simple
  @GetMapping("/summary")
  public SummaryDto getSummary() {
    long total = complaintRepository.countAllComplaints();

    // Each row from countComplaintsByBorough() is [boroughName (String), count (Number)]
    List<BoroughCountDto> byBorough =
        complaintRepository.countComplaintsByBorough().stream()
            .map(r -> new BoroughCountDto((String) r[0], ((Number) r[1]).longValue()))
            .toList();
            
    // Each row from countComplaintsByAgency() is [agencyName (String), count (Number)]
    List<AgencyCountDto> byAgency =
        complaintRepository.countComplaintsByAgency().stream()
            .map(r -> new AgencyCountDto((String) r[0], ((Number) r[1]).longValue()))
            .toList();

    return new SummaryDto(total, byBorough, byAgency);
  }
}
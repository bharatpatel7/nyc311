package com.example.controller;

import com.example.dto.ResolutionTimeDto;
import com.example.repository.ComplaintRepository;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


// Returns median complaint resolution times per agency
// Median is computed in Java rather than SQL to keep the query portable across databases
@RestController
@RequestMapping("/api/complaints")
public class ResolutionTimeController {

  private final ComplaintRepository complaintRepository;

  public ResolutionTimeController(ComplaintRepository complaintRepository) {
    this.complaintRepository = complaintRepository;
  }

  
  // Returns a list of agencies with their median resolution time in minutes
  // If an agency name is provided, only that agency's data is returned
  // Only closed complaints (those with a closedDate) are included
  // Results are sorted alphabetically by agency name
  @GetMapping("/resolution-time")
  public List<ResolutionTimeDto> getResolutionTimes(@RequestParam Optional<String> agency) {

    // Each row is [agencyName (String), resolutionMinutes (Number)]
    List<Object[]> rows =
        agency
            .map(complaintRepository::findResolutionMinutesByAgencyName)
            .orElseGet(complaintRepository::findResolutionMinutesByAgency);

    if (rows.isEmpty()) {
      return Collections.emptyList();
    }

  // Group all resolution times by agency, then compute the median for each group
    Map<String, List<Double>> byAgency =
        rows.stream()
            .collect(
                Collectors.groupingBy(
                    r -> (String) r[0],
                    Collectors.mapping(r -> ((Number) r[1]).doubleValue(), Collectors.toList())));

                    
  // Computes the median of a list of doubles
  // For even-sized lists, returns the average of the two middle values
    return byAgency.entrySet().stream()
        .map(e -> new ResolutionTimeDto(e.getKey(), median(e.getValue())))
        .sorted((a, b) -> a.agency().compareToIgnoreCase(b.agency()))
        .toList();
  }

  private static double median(List<Double> values) {
    List<Double> sorted = values.stream().sorted().toList();
    int size = sorted.size();
    if (size % 2 == 1) {
      return sorted.get(size / 2);
    }
    return (sorted.get(size / 2 - 1) + sorted.get(size / 2)) / 2.0;
  }
}

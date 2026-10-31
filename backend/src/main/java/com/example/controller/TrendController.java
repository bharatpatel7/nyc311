package com.example.controller;

import com.example.dto.ComplaintVolumeDto;
import com.example.repository.ComplaintRepository;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/complaints")
public class TrendController {

  private final ComplaintRepository complaintRepository;

  public TrendController(ComplaintRepository complaintRepository) {
    this.complaintRepository = complaintRepository;
  }

  @GetMapping("/volume-by-type")
  public List<ComplaintVolumeDto> getVolumeByType(@RequestParam Optional<String> complaintType) {

    List<Object[]> rows =
        complaintType
            .map(complaintRepository::findComplaintVolumeByTypeName)
            .orElseGet(complaintRepository::findComplaintVolumeByType);

    if (rows.isEmpty()) {
      return Collections.emptyList();
    }

    return rows.stream()
        .map(r -> new ComplaintVolumeDto((String) r[0], (String) r[1], ((Number) r[2]).longValue()))
        .toList();
  }
}

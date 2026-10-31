package com.example.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.ComplaintGeoPointDto;
import com.example.dto.FilterOptionsDto;
import com.example.entity.Complaint;
import com.example.repository.ComplaintRepository;
import com.example.specification.ComplaintSpecification;

// Serves complaint geo-point data and filter options used by the frontend map.
@RestController
@RequestMapping("/api/complaints")
public class GeoController {

  private final ComplaintRepository complaintRepository;

  public GeoController(ComplaintRepository complaintRepository) {
    this.complaintRepository = complaintRepository;
  }

    // Returns complaints that have coordinates, optionally filtered by any combination of
  // complaintType, borough, status, agency, and date range. All filters are optional and
  // are AND-ed together. Only complaints with non-null lat/lng are included.
  @GetMapping("/geopoints")
  public List<ComplaintGeoPointDto> getGeoPoints(
      @RequestParam Optional<String> complaintType,
      @RequestParam Optional<String> borough,
      @RequestParam Optional<String> status,
      @RequestParam Optional<String> agency,
      @RequestParam Optional<LocalDate> dateFrom,
      @RequestParam Optional<LocalDate> dateTo) {

    // Always require coordinates; additional filters are appended if present
    Specification<Complaint> spec = Specification.where(ComplaintSpecification.hasCoordinates());

    if (complaintType.isPresent()) {
      spec = spec.and(ComplaintSpecification.hasComplaintType(complaintType.get()));
    }
    if (borough.isPresent()) {
      spec = spec.and(ComplaintSpecification.hasBorough(borough.get()));
    }
    if (status.isPresent()) {
      spec = spec.and(ComplaintSpecification.hasStatus(status.get()));
    }
    if (agency.isPresent()) {
      spec = spec.and(ComplaintSpecification.hasAgencyName(agency.get()));
    }
    if (dateFrom.isPresent()) {
      spec = spec.and(ComplaintSpecification.createdAfter(dateFrom.get()));
    }
    if (dateTo.isPresent()) {
      spec = spec.and(ComplaintSpecification.createdBefore(dateTo.get()));
    }

    return complaintRepository.findAll(spec).stream().map(this::toDto).toList();
  }

    // Returns all distinct values for each filter dimension, used to populate the frontend filter UI.
  @GetMapping("/filter-options")
  public FilterOptionsDto getFilterOptions() {
    return new FilterOptionsDto(
        complaintRepository.findDistinctComplaintTypes(),
        complaintRepository.findDistinctBoroughs(),
        complaintRepository.findDistinctStatuses(),
        complaintRepository.findDistinctAgencyNames());
  }

  // Maps a Complaint entity to a lightweight DTO for map rendering.
  // createdDate is converted to a plain date string (no time component) for frontend simplicity.
  // agencyName is null-safe since agency is an optional relationship.
  private ComplaintGeoPointDto toDto(Complaint c) {
    String createdDate =
        c.getCreatedDate() != null ? c.getCreatedDate().toLocalDate().toString() : null;
    String agencyName = c.getAgency() != null ? c.getAgency().getName() : null;
    return new ComplaintGeoPointDto(
        c.getUniqueKey(),
        c.getLatitude(),
        c.getLongitude(),
        c.getComplaintType(),
        c.getBorough(),
        createdDate,
        c.getStatus(),
        agencyName);
  }
}

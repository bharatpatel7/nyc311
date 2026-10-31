package com.example.specification;

import java.time.LocalDate;

import org.springframework.data.jpa.domain.Specification;

import com.example.entity.Complaint;

import jakarta.persistence.criteria.JoinType;


// Factory class for JPA Specifications used to dynamically filter Complaint queries
// Specifications can be chained with .and() / .or() in the calling controller
public class ComplaintSpecification {

  
  // Generic helper that builds an equality predicate for any direct field on Complaint
  // Used internally to avoid repeating the same lambda for simple equality checks
  private static Specification<Complaint> hasFieldEqualTo(String fieldName, Object value) {
    return (root, query, cb) -> cb.equal(root.get(fieldName), value);
  }

  
  // Filters out complaints with no location data. Applied first on all map queries
  // so only plottable complaints reach the frontend
  public static Specification<Complaint> hasCoordinates() {
    return (root, query, cb) ->
        cb.and(cb.isNotNull(root.get("latitude")), cb.isNotNull(root.get("longitude")));
  }

    // Exact match on complaint type (e.g. "Noise - Residential")
  public static Specification<Complaint> hasComplaintType(String complaintType) {
    return hasFieldEqualTo("complaintType", complaintType);
  }

    // Exact match on borough name (e.g. "BROOKLYN")
  public static Specification<Complaint> hasBorough(String borough) {
    return hasFieldEqualTo("borough", borough);
  }

    // Exact match on status (e.g. "Open", "Closed")
  public static Specification<Complaint> hasStatus(String status) {
    return hasFieldEqualTo("status", status);
  }

  
  // Inclusive lower bound on createdDate. Converts the date to midnight (start of day)
  // so the entire given date is included in results
  public static Specification<Complaint> createdAfter(LocalDate date) {
    return (root, query, cb) ->
        cb.greaterThanOrEqualTo(root.get("createdDate"), date.atStartOfDay());
  }

  
  // Exclusive upper bound on createdDate. Uses midnight of the next day so the entire
  // given date is included (i.e. dateTo is treated as inclusive to the end of that day)
  public static Specification<Complaint> createdBefore(LocalDate date) {
    return (root, query, cb) ->
        cb.lessThan(root.get("createdDate"), date.plusDays(1).atStartOfDay());
  }

  
  // Filters by agency name via an INNER JOIN to the agencies table
  // Using INNER JOIN means complaints with no agency are excluded
  public static Specification<Complaint> hasAgencyName(String agencyName) {
    return (root, query, cb) ->
        cb.equal(root.join("agency", JoinType.INNER).get("name"), agencyName);
  }
}

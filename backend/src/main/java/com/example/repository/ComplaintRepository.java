package com.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.entity.Complaint;

// Data access layer for complaints. Extends JpaSpecificationExecutor to support
// dynamic filter queries built with ComplaintSpecification.
public interface ComplaintRepository
    extends JpaRepository<Complaint, String>, JpaSpecificationExecutor<Complaint> {

   // --- Filter option queries ---
  // These return distinct values used to populate the frontend filter dropdowns.

  @Query("SELECT DISTINCT c.complaintType FROM Complaint c ORDER BY c.complaintType")
  List<String> findDistinctComplaintTypes();

  @Query("SELECT DISTINCT c.borough FROM Complaint c ORDER BY c.borough")
  List<String> findDistinctBoroughs();

  @Query("SELECT DISTINCT c.status FROM Complaint c ORDER BY c.status")
  List<String> findDistinctStatuses();

  @Query("SELECT DISTINCT a.name FROM Complaint c JOIN c.agency a ORDER BY a.name")
  List<String> findDistinctAgencyNames();

    // --- Resolution time queries ---
  // These return raw [agencyName (String), resolutionMinutes (Number)] rows.
  // The median is computed in ResolutionTimeController rather than in SQL
  // to remain compatible with databases that don't support a native MEDIAN function.
  // Only closed complaints (closed_date IS NOT NULL) are included.

  // Returns resolution minutes for all agencies.
  @Query(
      value =
          """
          SELECT DISTINCT agency, medianMinutes
          FROM (
              SELECT a.name AS agency,
                     MEDIAN(TIMESTAMPDIFF(MINUTE, c.created_date, c.closed_date))
                     OVER (PARTITION BY a.name) AS medianMinutes
              FROM complaints c
              JOIN agencies a ON c.agency_id = a.id
              WHERE c.closed_date IS NOT NULL
          ) sub
          """,
      nativeQuery = true)
  List<ResolutionTimeProjection> findMedianResolutionTimeByAgency();

  /**
   * @returns resolution time in minutes per agency for closed complaints, to be aggregated (median)
   *     in the service layer. Result rows: [agencyName (String), minutes (Double)]
   */
  @Query(
      value =
          """
          SELECT a.name, TIMESTAMPDIFF(MINUTE, c.created_date, c.closed_date)
          FROM complaints c
          JOIN agencies a ON c.agency_id = a.id
          WHERE c.closed_date IS NOT NULL
          ORDER BY a.name
          """,
      nativeQuery = true)
  List<Object[]> findResolutionMinutesByAgency();

  
  // Unused native-query variant that computes the median in SQL via a window function.
  // Kept for reference but not wired up; requires a database that supports MEDIAN() + OVER().
  @Query(
      value =
          """
          SELECT a.name, TIMESTAMPDIFF(MINUTE, c.created_date, c.closed_date)
          FROM complaints c
          JOIN agencies a ON c.agency_id = a.id
          WHERE c.closed_date IS NOT NULL AND a.name = :agency
          """,
      nativeQuery = true)
  List<Object[]> findResolutionMinutesByAgencyName(@Param("agency") String agency);

  /**
   * Returns complaint volume grouped by complaint type and month for the most recent 12 months.
   * Result rows: [period (String, YYYY-MM), complaintType (String), count (Long)]
   */
  @Query(
      value =
          """
          SELECT DATE_FORMAT(c.created_date, '%Y-%m') AS period,
                 c.complaint_type,
                 COUNT(*) AS cnt
          FROM complaints c
          WHERE c.created_date >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
          GROUP BY period, c.complaint_type
          ORDER BY period, c.complaint_type
          """,
      nativeQuery = true)
  List<Object[]> findComplaintVolumeByType();

  /**
   * Returns complaint volume for a single complaint type grouped by month for the most recent 12
   * months. Result rows: [period (String, YYYY-MM), complaintType (String), count (Long)]
   */
  @Query(
      value =
          """
          SELECT DATE_FORMAT(c.created_date, '%Y-%m') AS period,
                 c.complaint_type,
                 COUNT(*) AS cnt
          FROM complaints c
          WHERE c.created_date >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
            AND c.complaint_type = :complaintType
          GROUP BY period, c.complaint_type
          ORDER BY period
          """,
      nativeQuery = true)
  List<Object[]> findComplaintVolumeByTypeName(@Param("complaintType") String complaintType);

  @Query("SELECT COUNT(c) FROM Complaint c")
  long countAllComplaints();

   // Complaint count per borough, ordered alphabetically
  // Each row: [borough (String), count (Number)]
  @Query("SELECT c.borough, COUNT(c) FROM Complaint c GROUP BY c.borough ORDER BY c.borough")
  List<Object[]> countComplaintsByBorough();

   // Complaint count per agency, ordered alphabetically
  // Each row: [agencyName (String), count (Number)]
  @Query("SELECT a.name, COUNT(c) FROM Complaint c JOIN c.agency a GROUP BY a.name ORDER BY a.name")
  List<Object[]> countComplaintsByAgency();
}

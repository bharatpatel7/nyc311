package com.example.specification;

import static com.example.specification.ComplaintSpecification.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.example.entity.Agency;
import com.example.entity.Complaint;
import com.example.repository.ComplaintRepository;
import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
@AutoConfigureTestDatabase()
class ComplaintSpecificationTest {

  // keys
  private static final String KEY_1 = "1";
  private static final String KEY_2 = "2";
  private static final String KEY_3 = "3";

  // coordinates
  private static final Double LAT_BROOKLYN = 40.6;
  private static final Double LNG_BROOKLYN = -73.9;
  private static final Double LAT_QUEENS = 40.7;
  private static final Double LNG_QUEENS = -73.8;

  // complaint types
  private static final String TYPE_NOISE = "Noise";
  private static final String TYPE_HEAT = "Heat";

  // boroughs
  private static final String BOROUGH_BROOKLYN = "BROOKLYN";
  private static final String BOROUGH_QUEENS = "QUEENS";
  private static final String BOROUGH_MANHATTAN = "MANHATTAN";

  // statuses
  private static final String STATUS_OPEN = "Open";
  private static final String STATUS_CLOSED = "Closed";

  // dates
  private static final String DATE_JAN_15 = "2024-01-15";
  private static final String DATE_FEB_28 = "2024-02-28";
  private static final String DATE_MAR_01 = "2024-03-01";
  private static final String DATE_MAR_02 = "2024-03-02";
  private static final LocalDate BOUNDARY_DATE = LocalDate.of(2024, 3, 1);

  // agencies
  private static final String AGENCY_DOT = "DOT";
  private static final String AGENCY_NYPD = "NYPD";

  @Autowired private TestEntityManager em;

  @Autowired private ComplaintRepository repository;

  // hasCoordinates

  @Test
  void hasCoordinates_excludesNullLatitude() {
    em.persistAndFlush(
        complaint(KEY_1, null, LNG_BROOKLYN, TYPE_NOISE, BOROUGH_BROOKLYN, DATE_JAN_15, STATUS_OPEN));
    assertThat(repository.findAll(hasCoordinates())).isEmpty();
  }

  @Test
  void hasCoordinates_excludesNullLongitude() {
    em.persistAndFlush(
        complaint(KEY_1, LAT_BROOKLYN, null, TYPE_NOISE, BOROUGH_BROOKLYN, DATE_JAN_15, STATUS_OPEN));
    assertThat(repository.findAll(hasCoordinates())).isEmpty();
  }

  @Test
  void hasCoordinates_includesRecordsWithBothCoordinates() {
    em.persistAndFlush(
        complaint(KEY_1, LAT_BROOKLYN, LNG_BROOKLYN, TYPE_NOISE, BOROUGH_BROOKLYN, DATE_JAN_15, STATUS_OPEN));
    List<Complaint> results = repository.findAll(hasCoordinates());
    assertThat(results).hasSize(1);
    assertThat(results.get(0).getUniqueKey()).isEqualTo(KEY_1);
  }

  // hasComplaintType

  @Test
  void hasComplaintType_returnsExactMatchOnly() {
    em.persistAndFlush(
        complaint(KEY_1, LAT_BROOKLYN, LNG_BROOKLYN, TYPE_NOISE, BOROUGH_BROOKLYN, DATE_JAN_15, STATUS_OPEN));
    em.persistAndFlush(
        complaint(KEY_2, LAT_QUEENS, LNG_QUEENS, TYPE_HEAT, BOROUGH_QUEENS, DATE_JAN_15, STATUS_OPEN));
    List<Complaint> results = repository.findAll(hasComplaintType(TYPE_NOISE));
    assertThat(results).hasSize(1);
    assertThat(results.get(0).getUniqueKey()).isEqualTo(KEY_1);
  }

  @Test
  void hasComplaintType_excludesNonMatchingTypes() {
    em.persistAndFlush(
        complaint(KEY_1, LAT_BROOKLYN, LNG_BROOKLYN, TYPE_HEAT, BOROUGH_BROOKLYN, DATE_JAN_15, STATUS_OPEN));
    assertThat(repository.findAll(hasComplaintType(TYPE_NOISE))).isEmpty();
  }

  // hasStatus

  @Test
  void hasStatus_returnsExactMatchOnly() {
    em.persistAndFlush(
        complaint(KEY_1, LAT_BROOKLYN, LNG_BROOKLYN, TYPE_NOISE, BOROUGH_BROOKLYN, DATE_JAN_15, STATUS_OPEN));
    em.persistAndFlush(
        complaint(KEY_2, LAT_QUEENS, LNG_QUEENS, TYPE_HEAT, BOROUGH_QUEENS, DATE_JAN_15, STATUS_CLOSED));
    List<Complaint> results = repository.findAll(hasStatus(STATUS_OPEN));
    assertThat(results).hasSize(1);
    assertThat(results.get(0).getUniqueKey()).isEqualTo(KEY_1);
  }

  @Test
  void hasStatus_excludesNonMatchingStatuses() {
    em.persistAndFlush(
        complaint(KEY_1, LAT_BROOKLYN, LNG_BROOKLYN, TYPE_NOISE, BOROUGH_BROOKLYN, DATE_JAN_15, STATUS_CLOSED));
    assertThat(repository.findAll(hasStatus(STATUS_OPEN))).isEmpty();
  }

  // hasBorough

  @Test
  void hasBorough_returnsExactMatchOnly() {
    em.persistAndFlush(
        complaint(KEY_1, LAT_BROOKLYN, LNG_BROOKLYN, TYPE_NOISE, BOROUGH_BROOKLYN, DATE_JAN_15, STATUS_OPEN));
    em.persistAndFlush(
        complaint(KEY_2, LAT_QUEENS, LNG_QUEENS, TYPE_HEAT, BOROUGH_QUEENS, DATE_JAN_15, STATUS_OPEN));
    List<Complaint> results = repository.findAll(hasBorough(BOROUGH_BROOKLYN));
    assertThat(results).hasSize(1);
    assertThat(results.get(0).getUniqueKey()).isEqualTo(KEY_1);
  }

  @Test
  void hasBorough_excludesNonMatchingBoroughs() {
    em.persistAndFlush(
        complaint(KEY_1, LAT_BROOKLYN, LNG_BROOKLYN, TYPE_NOISE, BOROUGH_MANHATTAN, DATE_JAN_15, STATUS_OPEN));
    assertThat(repository.findAll(hasBorough(BOROUGH_BROOKLYN))).isEmpty();
  }

  // createdAfter

  @Test
  void createdAfter_includesComplaintsOnDate() {
    em.persistAndFlush(
        complaint(KEY_1, LAT_BROOKLYN, LNG_BROOKLYN, TYPE_NOISE, BOROUGH_BROOKLYN, DATE_MAR_01, STATUS_OPEN));
    List<Complaint> results = repository.findAll(createdAfter(BOUNDARY_DATE));
    assertThat(results).hasSize(1);
    assertThat(results.get(0).getUniqueKey()).isEqualTo(KEY_1);
  }

  @Test
  void createdAfter_excludesComplaintsBeforeDate() {
    em.persistAndFlush(
        complaint(KEY_1, LAT_BROOKLYN, LNG_BROOKLYN, TYPE_NOISE, BOROUGH_BROOKLYN, DATE_FEB_28, STATUS_OPEN));
    assertThat(repository.findAll(createdAfter(BOUNDARY_DATE))).isEmpty();
  }

  // createdBefore

  @Test
  void createdBefore_includesComplaintsOnDate() {
    em.persistAndFlush(
        complaint(KEY_1, LAT_BROOKLYN, LNG_BROOKLYN, TYPE_NOISE, BOROUGH_BROOKLYN, DATE_MAR_01, STATUS_OPEN));
    List<Complaint> results = repository.findAll(createdBefore(BOUNDARY_DATE));
    assertThat(results).hasSize(1);
    assertThat(results.get(0).getUniqueKey()).isEqualTo(KEY_1);
  }

  @Test
  void createdBefore_excludesComplaintsAfterDate() {
    em.persistAndFlush(
        complaint(KEY_1, LAT_BROOKLYN, LNG_BROOKLYN, TYPE_NOISE, BOROUGH_BROOKLYN, DATE_MAR_02, STATUS_OPEN));
    assertThat(repository.findAll(createdBefore(BOUNDARY_DATE))).isEmpty();
  }

  // hasAgencyName

  @Test
  void hasAgencyName_returnsComplaintsMatchingAgency() {
    Agency dot = persistAgency(AGENCY_DOT);
    Agency nypd = persistAgency(AGENCY_NYPD);
    em.persistAndFlush(complaintWithAgency(KEY_1, LAT_BROOKLYN, LNG_BROOKLYN, TYPE_NOISE, BOROUGH_BROOKLYN, DATE_JAN_15, STATUS_OPEN, dot));
    em.persistAndFlush(complaintWithAgency(KEY_2, LAT_QUEENS, LNG_QUEENS, TYPE_HEAT, BOROUGH_QUEENS, DATE_JAN_15, STATUS_OPEN, nypd));

    List<Complaint> results = repository.findAll(hasAgencyName(AGENCY_DOT));
    assertThat(results).hasSize(1);
    assertThat(results.get(0).getUniqueKey()).isEqualTo(KEY_1);
  }

  @Test
  void hasAgencyName_excludesNonMatchingAgencies() {
    Agency nypd = persistAgency(AGENCY_NYPD);
    em.persistAndFlush(complaintWithAgency(KEY_1, LAT_BROOKLYN, LNG_BROOKLYN, TYPE_NOISE, BOROUGH_BROOKLYN, DATE_JAN_15, STATUS_OPEN, nypd));

    assertThat(repository.findAll(hasAgencyName(AGENCY_DOT))).isEmpty();
  }

  @Test
  void hasAgencyName_excludesComplaintsWithNoAgency() {
    em.persistAndFlush(
        complaint(KEY_1, LAT_BROOKLYN, LNG_BROOKLYN, TYPE_NOISE, BOROUGH_BROOKLYN, DATE_JAN_15, STATUS_OPEN));

    assertThat(repository.findAll(hasAgencyName(AGENCY_DOT))).isEmpty();
  }

  // composition

  @Test
  void composition_andLogicAppliesBothPredicates() {
    em.persistAndFlush(
        complaint(KEY_1, LAT_BROOKLYN, LNG_BROOKLYN, TYPE_NOISE, BOROUGH_BROOKLYN, DATE_JAN_15, STATUS_OPEN));
    em.persistAndFlush(
        complaint(KEY_2, LAT_QUEENS, LNG_QUEENS, TYPE_HEAT, BOROUGH_BROOKLYN, DATE_JAN_15, STATUS_OPEN));
    em.persistAndFlush(
        complaint(KEY_3, LAT_BROOKLYN, LNG_BROOKLYN, TYPE_NOISE, BOROUGH_QUEENS, DATE_JAN_15, STATUS_OPEN));

    List<Complaint> results =
        repository.findAll(hasComplaintType(TYPE_NOISE).and(hasBorough(BOROUGH_BROOKLYN)));
    assertThat(results).hasSize(1);
    assertThat(results.get(0).getUniqueKey()).isEqualTo(KEY_1);
  }

  // helpers

  private Agency persistAgency(String name) {
    Agency a = new Agency();
    setField(a, "name", name);
    return em.persistAndFlush(a);
  }

  private static Complaint complaint(
      String uniqueKey, Double lat, Double lng, String type, String borough, String date, String status) {
    return complaintWithAgency(uniqueKey, lat, lng, type, borough, date, status, null);
  }

  private static Complaint complaintWithAgency(
      String uniqueKey, Double lat, Double lng, String type, String borough, String date, String status, Agency agency) {
    Complaint c = new Complaint();
    setField(c, "uniqueKey", uniqueKey);
    setField(c, "latitude", lat);
    setField(c, "longitude", lng);
    setField(c, "complaintType", type);
    setField(c, "borough", borough);
    setField(c, "createdDate", LocalDateTime.parse(date + "T00:00:00"));
    setField(c, "status", status);
    c.setAgency(agency);
    return c;
  }

  private static void setField(Object obj, String name, Object value) {
    try {
      Field field = obj.getClass().getDeclaredField(name);
      field.setAccessible(true);
      field.set(obj, value);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}

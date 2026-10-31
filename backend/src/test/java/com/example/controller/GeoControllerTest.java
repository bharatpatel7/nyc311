package com.example.controller;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.entity.Agency;
import com.example.entity.Complaint;
import com.example.repository.ComplaintRepository;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(GeoController.class)
class GeoControllerTest {

  private static final String GEO_POINTS_URL = "/api/complaints/geopoints";
  private static final String GEO_POINTS_UNKNOWN_URL = "/api/complaints/geopoints/unknown";
  private static final String FILTER_OPTIONS_URL = "/api/complaints/filter-options";

  private static final String KEY_1 = "1";
  private static final String KEY_2 = "2";

  private static final String BOROUGH_MANHATTAN = "Manhattan";
  private static final double LAT_MANHATTAN = 40.7128;
  private static final double LNG_MANHATTAN = -74.006;

  private static final String BOROUGH_BROOKLYN = "Brooklyn";
  private static final double LAT_BROOKLYN = 40.6782;
  private static final double LNG_BROOKLYN = -73.9442;

  private static final String TYPE_NOISE = "Noise";
  private static final String TYPE_POTHOLE = "Pothole";

  private static final String DATE_1 = "2025-03-01";
  private static final String DATE_2 = "2025-03-02";
  private static final String DATE_PATTERN = "\\d{4}-\\d{2}-\\d{2}";

  private static final String STATUS_OPEN = "Open";
  private static final String STATUS_CLOSED = "Closed";

  private static final String AGENCY_DOT = "DOT";
  private static final String AGENCY_NYPD = "NYPD";

  private static final int LARGE_LIST_SIZE = 1000;

  @Autowired private MockMvc mockMvc;

  @MockBean private ComplaintRepository complaintRepository;

  @Test
  void getGeoPoints_returnsCorrectJsonShape() throws Exception {
    Agency dot = TestFixtures.agency(AGENCY_DOT);
    when(complaintRepository.findAll(ArgumentMatchers.<Specification<Complaint>>any()))
        .thenReturn(
            List.of(
                TestFixtures.complaint(
                    KEY_1,
                    LAT_MANHATTAN,
                    LNG_MANHATTAN,
                    TYPE_NOISE,
                    BOROUGH_MANHATTAN,
                    DATE_1,
                    STATUS_OPEN,
                    dot),
                TestFixtures.complaint(
                    KEY_2,
                    LAT_BROOKLYN,
                    LNG_BROOKLYN,
                    TYPE_POTHOLE,
                    BOROUGH_BROOKLYN,
                    DATE_2,
                    STATUS_CLOSED)));

    mockMvc
        .perform(get(GEO_POINTS_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].uniqueKey").value(KEY_1))
        .andExpect(jsonPath("$[0].latitude").value(LAT_MANHATTAN))
        .andExpect(jsonPath("$[0].longitude").value(LNG_MANHATTAN))
        .andExpect(jsonPath("$[0].complaintType").value(TYPE_NOISE))
        .andExpect(jsonPath("$[0].borough").value(BOROUGH_MANHATTAN))
        .andExpect(jsonPath("$[0].createdDate").value(DATE_1))
        .andExpect(jsonPath("$[0].status").value(STATUS_OPEN))
        .andExpect(jsonPath("$[0].agencyName").value(AGENCY_DOT))
        .andExpect(jsonPath("$[1].agencyName").doesNotExist());
  }

  @Test
  void getGeoPoints_returnsEmptyArray() throws Exception {
    when(complaintRepository.findAll(ArgumentMatchers.<Specification<Complaint>>any()))
        .thenReturn(Collections.emptyList());

    mockMvc
        .perform(get(GEO_POINTS_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(0)));
  }

  @Test
  void getGeoPoints_returnsJsonContentType() throws Exception {
    when(complaintRepository.findAll(ArgumentMatchers.<Specification<Complaint>>any()))
        .thenReturn(Collections.emptyList());

    mockMvc
        .perform(get(GEO_POINTS_URL))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON));
  }

  @Test
  void getGeoPoints_returnsOkWhenRepositoryReturnsLargeList() throws Exception {
    List<Complaint> large = new ArrayList<>();
    for (int i = 0; i < LARGE_LIST_SIZE; i++) {
      large.add(
          TestFixtures.complaint(
              String.valueOf(i),
              LAT_MANHATTAN,
              LNG_MANHATTAN,
              TYPE_NOISE,
              BOROUGH_MANHATTAN,
              DATE_1,
              STATUS_OPEN));
    }
    when(complaintRepository.findAll(ArgumentMatchers.<Specification<Complaint>>any()))
        .thenReturn(large);

    mockMvc
        .perform(get(GEO_POINTS_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(LARGE_LIST_SIZE)));
  }

  @Test
  void getGeoPoints_dateFormattedAsYyyyMmDd() throws Exception {
    when(complaintRepository.findAll(ArgumentMatchers.<Specification<Complaint>>any()))
        .thenReturn(
            List.of(
                TestFixtures.complaint(
                    KEY_1,
                    LAT_MANHATTAN,
                    LNG_MANHATTAN,
                    TYPE_NOISE,
                    BOROUGH_MANHATTAN,
                    DATE_1,
                    STATUS_OPEN)));

    mockMvc
        .perform(get(GEO_POINTS_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].createdDate").value(matchesPattern(DATE_PATTERN)));
  }

  @Test
  void getGeoPoints_excludesRecordsWithNullCoordinates() throws Exception {
    when(complaintRepository.findAll(ArgumentMatchers.<Specification<Complaint>>any()))
        .thenReturn(Collections.emptyList());

    mockMvc
        .perform(get(GEO_POINTS_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(0)));
  }

  @Test
  void getGeoPoints_agencyNameIsNullWhenNoAgencyAssigned() throws Exception {
    when(complaintRepository.findAll(ArgumentMatchers.<Specification<Complaint>>any()))
        .thenReturn(
            List.of(
                TestFixtures.complaint(
                    KEY_1,
                    LAT_MANHATTAN,
                    LNG_MANHATTAN,
                    TYPE_NOISE,
                    BOROUGH_MANHATTAN,
                    DATE_1,
                    STATUS_OPEN)));

    mockMvc
        .perform(get(GEO_POINTS_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].agencyName").doesNotExist());
  }

  // --- Filter parameters ---

  @Test
  void getGeoPoints_filterByComplaintType_returnsOnlyMatchingComplaints() throws Exception {
    when(complaintRepository.findAll(ArgumentMatchers.<Specification<Complaint>>any()))
        .thenReturn(
            List.of(
                TestFixtures.complaint(
                    KEY_1,
                    LAT_MANHATTAN,
                    LNG_MANHATTAN,
                    TYPE_NOISE,
                    BOROUGH_MANHATTAN,
                    DATE_1,
                    STATUS_OPEN)));

    mockMvc
        .perform(get(GEO_POINTS_URL).param("complaintType", TYPE_NOISE))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].complaintType").value(TYPE_NOISE));
  }

  @Test
  void getGeoPoints_filterByBorough_returnsOnlyMatchingComplaints() throws Exception {
    when(complaintRepository.findAll(ArgumentMatchers.<Specification<Complaint>>any()))
        .thenReturn(
            List.of(
                TestFixtures.complaint(
                    KEY_1,
                    LAT_MANHATTAN,
                    LNG_MANHATTAN,
                    TYPE_NOISE,
                    BOROUGH_MANHATTAN,
                    DATE_1,
                    STATUS_OPEN)));

    mockMvc
        .perform(get(GEO_POINTS_URL).param("borough", BOROUGH_MANHATTAN))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].borough").value(BOROUGH_MANHATTAN));
  }

  @Test
  void getGeoPoints_filterByStatus_returnsOnlyMatchingComplaints() throws Exception {
    when(complaintRepository.findAll(ArgumentMatchers.<Specification<Complaint>>any()))
        .thenReturn(
            List.of(
                TestFixtures.complaint(
                    KEY_1,
                    LAT_MANHATTAN,
                    LNG_MANHATTAN,
                    TYPE_NOISE,
                    BOROUGH_MANHATTAN,
                    DATE_1,
                    STATUS_OPEN)));

    mockMvc
        .perform(get(GEO_POINTS_URL).param("status", STATUS_OPEN))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].status").value(STATUS_OPEN));
  }

  @Test
  void getGeoPoints_filterByAgency_returnsOnlyMatchingComplaints() throws Exception {
    Agency dot = TestFixtures.agency(AGENCY_DOT);
    when(complaintRepository.findAll(ArgumentMatchers.<Specification<Complaint>>any()))
        .thenReturn(
            List.of(
                TestFixtures.complaint(
                    KEY_1,
                    LAT_MANHATTAN,
                    LNG_MANHATTAN,
                    TYPE_NOISE,
                    BOROUGH_MANHATTAN,
                    DATE_1,
                    STATUS_OPEN,
                    dot)));

    mockMvc
        .perform(get(GEO_POINTS_URL).param("agency", AGENCY_DOT))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].agencyName").value(AGENCY_DOT));
  }

  @Test
  void getGeoPoints_filterByDateFrom_returnsOnlyMatchingComplaints() throws Exception {
    when(complaintRepository.findAll(ArgumentMatchers.<Specification<Complaint>>any()))
        .thenReturn(
            List.of(
                TestFixtures.complaint(
                    KEY_1,
                    LAT_MANHATTAN,
                    LNG_MANHATTAN,
                    TYPE_NOISE,
                    BOROUGH_MANHATTAN,
                    DATE_1,
                    STATUS_OPEN)));

    mockMvc
        .perform(get(GEO_POINTS_URL).param("dateFrom", DATE_1))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].createdDate").value(DATE_1));
  }

  @Test
  void getGeoPoints_filterByDateTo_returnsOnlyMatchingComplaints() throws Exception {
    when(complaintRepository.findAll(ArgumentMatchers.<Specification<Complaint>>any()))
        .thenReturn(
            List.of(
                TestFixtures.complaint(
                    KEY_1,
                    LAT_MANHATTAN,
                    LNG_MANHATTAN,
                    TYPE_NOISE,
                    BOROUGH_MANHATTAN,
                    DATE_1,
                    STATUS_OPEN)));

    mockMvc
        .perform(get(GEO_POINTS_URL).param("dateTo", DATE_1))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)));
  }

  @Test
  void getGeoPoints_filterByComplaintTypeAndDateFrom_appliesAndLogic() throws Exception {
    when(complaintRepository.findAll(ArgumentMatchers.<Specification<Complaint>>any()))
        .thenReturn(
            List.of(
                TestFixtures.complaint(
                    KEY_1,
                    LAT_MANHATTAN,
                    LNG_MANHATTAN,
                    TYPE_NOISE,
                    BOROUGH_MANHATTAN,
                    DATE_1,
                    STATUS_OPEN)));

    mockMvc
        .perform(get(GEO_POINTS_URL).param("complaintType", TYPE_NOISE).param("dateFrom", DATE_1))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].complaintType").value(TYPE_NOISE))
        .andExpect(jsonPath("$[0].createdDate").value(DATE_1));
  }

  // --- Filter options ---

  @Test
  void getFilterOptions_returnsCorrectShape() throws Exception {
    when(complaintRepository.findDistinctComplaintTypes())
        .thenReturn(List.of(TYPE_NOISE, TYPE_POTHOLE));
    when(complaintRepository.findDistinctBoroughs())
        .thenReturn(List.of(BOROUGH_MANHATTAN, BOROUGH_BROOKLYN));
    when(complaintRepository.findDistinctStatuses())
        .thenReturn(List.of(STATUS_OPEN, STATUS_CLOSED));
    when(complaintRepository.findDistinctAgencyNames())
        .thenReturn(List.of(AGENCY_DOT, AGENCY_NYPD));

    mockMvc
        .perform(get(FILTER_OPTIONS_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.complaintTypes", hasSize(2)))
        .andExpect(jsonPath("$.complaintTypes", contains(TYPE_NOISE, TYPE_POTHOLE)))
        .andExpect(jsonPath("$.boroughs", hasSize(2)))
        .andExpect(jsonPath("$.boroughs", contains(BOROUGH_MANHATTAN, BOROUGH_BROOKLYN)))
        .andExpect(jsonPath("$.statuses", hasSize(2)))
        .andExpect(jsonPath("$.statuses", contains(STATUS_OPEN, STATUS_CLOSED)))
        .andExpect(jsonPath("$.agencies", hasSize(2)))
        .andExpect(jsonPath("$.agencies", contains(AGENCY_DOT, AGENCY_NYPD)));
  }

  @Test
  void getFilterOptions_returnsEmptyArrays() throws Exception {
    when(complaintRepository.findDistinctComplaintTypes()).thenReturn(Collections.emptyList());
    when(complaintRepository.findDistinctBoroughs()).thenReturn(Collections.emptyList());
    when(complaintRepository.findDistinctStatuses()).thenReturn(Collections.emptyList());
    when(complaintRepository.findDistinctAgencyNames()).thenReturn(Collections.emptyList());

    mockMvc
        .perform(get(FILTER_OPTIONS_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.complaintTypes", hasSize(0)))
        .andExpect(jsonPath("$.boroughs", hasSize(0)))
        .andExpect(jsonPath("$.statuses", hasSize(0)))
        .andExpect(jsonPath("$.agencies", hasSize(0)));
  }

  @Test
  void getGeoPoints_unknownPathReturns404() throws Exception {
    mockMvc.perform(get(GEO_POINTS_UNKNOWN_URL)).andExpect(status().isNotFound());
  }
}

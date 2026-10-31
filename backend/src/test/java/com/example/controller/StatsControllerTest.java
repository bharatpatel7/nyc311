package com.example.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.repository.ComplaintRepository;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(StatsController.class)
class StatsControllerTest {

  private static final String SUMMARY_URL = "/api/stats/summary";

  private static final long TOTAL_COMPLAINTS = 1000L;
  private static final long TOTAL_ZERO = 0L;

  private static final String BOROUGH_BROOKLYN = "BROOKLYN";
  private static final String BOROUGH_MANHATTAN = "MANHATTAN";
  private static final long COUNT_BROOKLYN = 400L;
  private static final long COUNT_MANHATTAN = 600L;

  private static final String AGENCY_NYPD = "NYPD";
  private static final String AGENCY_DOT = "DOT";
  private static final long COUNT_NYPD = 300L;
  private static final long COUNT_DOT = 700L;

  @Autowired private MockMvc mockMvc;

  @MockBean private ComplaintRepository complaintRepository;

  @Test
  void returnsSummaryWithAllFields() throws Exception {
    when(complaintRepository.countAllComplaints()).thenReturn(TOTAL_COMPLAINTS);
    when(complaintRepository.countComplaintsByBorough())
        .thenReturn(List.of(
            new Object[] {BOROUGH_BROOKLYN, COUNT_BROOKLYN},
            new Object[] {BOROUGH_MANHATTAN, COUNT_MANHATTAN}));
    when(complaintRepository.countComplaintsByAgency())
        .thenReturn(List.of(
            new Object[] {AGENCY_NYPD, COUNT_NYPD},
            new Object[] {AGENCY_DOT, COUNT_DOT}));

    mockMvc
        .perform(get(SUMMARY_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalComplaints").value(TOTAL_COMPLAINTS))
        .andExpect(jsonPath("$.complaintsByBorough.length()").value(2))
        .andExpect(jsonPath("$.complaintsByBorough[0].borough").value(BOROUGH_BROOKLYN))
        .andExpect(jsonPath("$.complaintsByBorough[0].count").value(COUNT_BROOKLYN))
        .andExpect(jsonPath("$.complaintsByAgency.length()").value(2))
        .andExpect(jsonPath("$.complaintsByAgency[0].agency").value(AGENCY_NYPD))
        .andExpect(jsonPath("$.complaintsByAgency[0].count").value(COUNT_NYPD));
  }

  @Test
  void returnsZeroTotalWhenEmpty() throws Exception {
    when(complaintRepository.countAllComplaints()).thenReturn(TOTAL_ZERO);
    when(complaintRepository.countComplaintsByBorough()).thenReturn(Collections.emptyList());
    when(complaintRepository.countComplaintsByAgency()).thenReturn(Collections.emptyList());

    mockMvc
        .perform(get(SUMMARY_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalComplaints").value(TOTAL_ZERO))
        .andExpect(jsonPath("$.complaintsByBorough.length()").value(0))
        .andExpect(jsonPath("$.complaintsByAgency.length()").value(0));
  }

  @Test
  void repositoryExceptionReturns500() throws Exception {
    when(complaintRepository.countAllComplaints())
        .thenThrow(new RuntimeException("DB connection failed"));

    mockMvc
        .perform(get(SUMMARY_URL))
        .andExpect(status().isInternalServerError());
  }
}
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

@WebMvcTest(ResolutionTimeController.class)
class ResolutionTimeControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private ComplaintRepository complaintRepository;

  @Test
  void returnsMedianPerAgency() throws Exception {
    List<Object[]> rows =
        List.of(
            new Object[] {"DOT", 4L},
            new Object[] {"DOT", 8L},
            new Object[] {"NYPD", 10L},
            new Object[] {"NYPD", 20L},
            new Object[] {"NYPD", 30L});

    when(complaintRepository.findResolutionMinutesByAgency()).thenReturn(rows);

    mockMvc
        .perform(get("/api/complaints/resolution-time"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].agency").value("DOT"))
        .andExpect(jsonPath("$[0].medianMinutes").value(6.0))
        .andExpect(jsonPath("$[1].agency").value("NYPD"))
        .andExpect(jsonPath("$[1].medianMinutes").value(20.0));
  }

  @Test
  void returnsEmptyListWhenNoData() throws Exception {
    when(complaintRepository.findResolutionMinutesByAgency()).thenReturn(Collections.emptyList());

    mockMvc
        .perform(get("/api/complaints/resolution-time"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));
  }

  @Test
  void filtersToSingleAgency() throws Exception {
    List<Object[]> rows = List.<Object[]>of(new Object[] {"HPD", 12L});

    when(complaintRepository.findResolutionMinutesByAgencyName("HPD")).thenReturn(rows);

    mockMvc
        .perform(get("/api/complaints/resolution-time").param("agency", "HPD"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].agency").value("HPD"))
        .andExpect(jsonPath("$[0].medianMinutes").value(12.0));
  }

  @Test
  void singleRowAgencyReturnsValueAsMedian() throws Exception {
    List<Object[]> rows = List.<Object[]>of(new Object[] {"FDNY", 42L});
    when(complaintRepository.findResolutionMinutesByAgency()).thenReturn(rows);

    mockMvc
        .perform(get("/api/complaints/resolution-time"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].agency").value("FDNY"))
        .andExpect(jsonPath("$[0].medianMinutes").value(42.0));
  }

  @Test
  void evenCountAgencyAveragesMiddleTwo() throws Exception {
    List<Object[]> rows =
        List.of(
            new Object[] {"HPD", 10L},
            new Object[] {"HPD", 20L},
            new Object[] {"HPD", 30L},
            new Object[] {"HPD", 40L});
    when(complaintRepository.findResolutionMinutesByAgency()).thenReturn(rows);

    mockMvc
        .perform(get("/api/complaints/resolution-time"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].medianMinutes").value(25.0));
  }

  @Test
  void agencyFilterReturnsEmptyWhenNoMatch() throws Exception {
    when(complaintRepository.findResolutionMinutesByAgencyName("FAKE"))
        .thenReturn(Collections.emptyList());

    mockMvc
        .perform(get("/api/complaints/resolution-time").param("agency", "FAKE"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));
  }

  @Test
  void repositoryExceptionReturns500() throws Exception {
    when(complaintRepository.findResolutionMinutesByAgency())
        .thenThrow(new RuntimeException("DB connection failed"));

    mockMvc
        .perform(get("/api/complaints/resolution-time"))
        .andExpect(status().isInternalServerError());
  }
}

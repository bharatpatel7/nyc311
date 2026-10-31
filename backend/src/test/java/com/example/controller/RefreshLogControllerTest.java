package com.example.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.entity.RefreshStatus;
import com.example.repository.DataRefreshLogRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(RefreshLogController.class)
class RefreshLogControllerTest {

  private static final String REFRESH_LOGS_URL = "/api/refreshlogs/latest";
  private static final int RECORDS_PROCESSED = 1500;

  @Autowired private MockMvc mockMvc;

  @MockBean private DataRefreshLogRepository dataRefreshLogRepository;

  // Success cases

  @Test
  void getLatest_returnsDataWhenRefreshExists() throws Exception {
    when(dataRefreshLogRepository.findFirstByStatusOrderByRefreshCompletedAtDesc(
            RefreshStatus.SUCCESS))
        .thenReturn(
            Optional.of(TestFixtures.dataRefresh(RECORDS_PROCESSED, RefreshStatus.SUCCESS)));

    mockMvc
        .perform(get(REFRESH_LOGS_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.recordsProcessed").value(RECORDS_PROCESSED))
        .andExpect(jsonPath("$.status").value("SUCCESS"))
        .andExpect(jsonPath("$.refreshStartedAt").isNotEmpty())
        .andExpect(jsonPath("$.refreshCompletedAt").isNotEmpty());
  }

  // Error / edge cases

  @Test
  void getLatest_returns404WhenNoRefreshExists() throws Exception {
    when(dataRefreshLogRepository.findFirstByStatusOrderByRefreshCompletedAtDesc(
            RefreshStatus.SUCCESS))
        .thenReturn(Optional.empty());

    mockMvc.perform(get(REFRESH_LOGS_URL)).andExpect(status().isNotFound());
  }

  @Test
  void getLatest_returns404WhenOnlyFailedExists() throws Exception {
    when(dataRefreshLogRepository.findFirstByStatusOrderByRefreshCompletedAtDesc(
            RefreshStatus.SUCCESS))
        .thenReturn(Optional.empty());

    mockMvc.perform(get(REFRESH_LOGS_URL)).andExpect(status().isNotFound());
  }

  @Test
  void getLatest_returns404WhenOnlyInProgressExists() throws Exception {
    when(dataRefreshLogRepository.findFirstByStatusOrderByRefreshCompletedAtDesc(
            RefreshStatus.SUCCESS))
        .thenReturn(Optional.empty());

    mockMvc.perform(get(REFRESH_LOGS_URL)).andExpect(status().isNotFound());
  }
}

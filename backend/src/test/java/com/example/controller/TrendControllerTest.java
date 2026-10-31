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

@WebMvcTest(TrendController.class)
class TrendControllerTest {

  private static final String VOLUME_URL = "/api/complaints/volume-by-type";

  private static final String PERIOD_JAN = "2025-04";
  private static final String PERIOD_FEB = "2025-05";
  private static final String PERIOD_MAR = "2025-06";

  private static final String TYPE_NOISE = "Noise";
  private static final String TYPE_HEAT = "Heat/Hot Water";
  private static final String TYPE_NONEXISTENT = "Nonexistent";

  private static final long COUNT_NOISE_JAN = 120L;
  private static final long COUNT_NOISE_FEB = 95L;
  private static final long COUNT_HEAT_JAN = 340L;
  private static final long COUNT_HEAT_FEB = 210L;
  private static final long COUNT_HEAT_MAR = 80L;

  @Autowired private MockMvc mockMvc;

  @MockBean private ComplaintRepository complaintRepository;

  @Test
  void returnsVolumeForAllTypes() throws Exception {
    List<Object[]> rows =
        List.of(
            new Object[] {PERIOD_JAN, TYPE_NOISE, COUNT_NOISE_JAN},
            new Object[] {PERIOD_FEB, TYPE_NOISE, COUNT_NOISE_FEB},
            new Object[] {PERIOD_JAN, TYPE_HEAT, COUNT_HEAT_JAN},
            new Object[] {PERIOD_FEB, TYPE_HEAT, COUNT_HEAT_FEB});

    when(complaintRepository.findComplaintVolumeByType()).thenReturn(rows);

    mockMvc
        .perform(get(VOLUME_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(rows.size()))
        .andExpect(jsonPath("$[0].period").value(PERIOD_JAN))
        .andExpect(jsonPath("$[0].complaintType").value(TYPE_NOISE))
        .andExpect(jsonPath("$[0].count").value(COUNT_NOISE_JAN))
        .andExpect(jsonPath("$[2].period").value(PERIOD_JAN))
        .andExpect(jsonPath("$[2].complaintType").value(TYPE_HEAT))
        .andExpect(jsonPath("$[2].count").value(COUNT_HEAT_JAN));
  }

  @Test
  void returnsEmptyListWhenNoData() throws Exception {
    when(complaintRepository.findComplaintVolumeByType()).thenReturn(Collections.emptyList());

    mockMvc
        .perform(get(VOLUME_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));
  }

  @Test
  void filtersToSingleComplaintType() throws Exception {
    List<Object[]> rows =
        List.of(
            new Object[] {PERIOD_JAN, TYPE_HEAT, COUNT_HEAT_JAN},
            new Object[] {PERIOD_FEB, TYPE_HEAT, COUNT_HEAT_FEB},
            new Object[] {PERIOD_MAR, TYPE_HEAT, COUNT_HEAT_MAR});

    when(complaintRepository.findComplaintVolumeByTypeName(TYPE_HEAT)).thenReturn(rows);

    mockMvc
        .perform(get(VOLUME_URL).param("complaintType", TYPE_HEAT))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(rows.size()))
        .andExpect(jsonPath("$[0].complaintType").value(TYPE_HEAT))
        .andExpect(jsonPath("$[1].complaintType").value(TYPE_HEAT))
        .andExpect(jsonPath("$[2].complaintType").value(TYPE_HEAT));
  }

  @Test
  void complaintTypeFilterReturnsEmptyWhenNoMatch() throws Exception {
    when(complaintRepository.findComplaintVolumeByTypeName(TYPE_NONEXISTENT))
        .thenReturn(Collections.emptyList());

    mockMvc
        .perform(get(VOLUME_URL).param("complaintType", TYPE_NONEXISTENT))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));
  }

  @Test
  void eachEntryHasCorrectFieldTypes() throws Exception {
    List<Object[]> rows = List.<Object[]>of(new Object[] {PERIOD_JAN, TYPE_NOISE, COUNT_NOISE_JAN});

    when(complaintRepository.findComplaintVolumeByType()).thenReturn(rows);

    mockMvc
        .perform(get(VOLUME_URL))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].period").isString())
        .andExpect(jsonPath("$[0].complaintType").isString())
        .andExpect(jsonPath("$[0].count").isNumber());
  }

  @Test
  void periodFormatIsYearMonth() throws Exception {
    List<Object[]> rows = List.<Object[]>of(new Object[] {PERIOD_JAN, TYPE_NOISE, COUNT_NOISE_JAN});

    when(complaintRepository.findComplaintVolumeByType()).thenReturn(rows);

    mockMvc
        .perform(get(VOLUME_URL))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$[0].period").value(org.hamcrest.Matchers.matchesPattern("\\d{4}-\\d{2}")));
  }

  @Test
  void repositoryExceptionReturns500() throws Exception {
    when(complaintRepository.findComplaintVolumeByType())
        .thenThrow(new RuntimeException("DB connection failed"));

    mockMvc.perform(get(VOLUME_URL)).andExpect(status().isInternalServerError());
  }
}

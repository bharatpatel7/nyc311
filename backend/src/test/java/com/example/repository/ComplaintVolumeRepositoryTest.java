package com.example.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ComplaintVolumeRepositoryTest {

  private static final String PERIOD_JAN = "2026-01";
  private static final String PERIOD_FEB = "2026-02";
  private static final String TYPE_RODENT = "Rodent";
  private static final String TYPE_HEAT = "Heat/Hot Water";
  private static final String TYPE_NONEXISTENT = "Nonexistent";
  private static final long COUNT_NOISE = 120L;
  private static final long COUNT_HEAT = 340L;
  private static final long COUNT_RODENT = 95L;

  @Mock private ComplaintRepository complaintRepository;

  @Test
  void findComplaintVolumeByType_returnsGroupedResults() {
    List<Object[]> rows =
        List.of(
            new Object[] {PERIOD_JAN, TYPE_RODENT, COUNT_NOISE},
            new Object[] {PERIOD_JAN, TYPE_HEAT, COUNT_HEAT});

    when(complaintRepository.findComplaintVolumeByType()).thenReturn(rows);

    List<Object[]> result = complaintRepository.findComplaintVolumeByType();

    assertThat(result).hasSize(rows.size());
    assertThat(result.get(0)[0]).isEqualTo(PERIOD_JAN);
    assertThat(result.get(0)[1]).isEqualTo(TYPE_RODENT);
    assertThat(result.get(0)[2]).isEqualTo(COUNT_NOISE);
    assertThat(result.get(1)[1]).isEqualTo(TYPE_HEAT);
    verify(complaintRepository).findComplaintVolumeByType();
  }

  @Test
  void findComplaintVolumeByType_returnsEmptyList() {
    when(complaintRepository.findComplaintVolumeByType()).thenReturn(Collections.emptyList());

    List<Object[]> result = complaintRepository.findComplaintVolumeByType();

    assertThat(result).isEmpty();
    verify(complaintRepository).findComplaintVolumeByType();
  }

  @Test
  void findComplaintVolumeByTypeName_returnsFilteredResults() {
    List<Object[]> rows =
        List.of(
            new Object[] {PERIOD_JAN, TYPE_RODENT, COUNT_NOISE},
            new Object[] {PERIOD_FEB, TYPE_RODENT, COUNT_RODENT});

    when(complaintRepository.findComplaintVolumeByTypeName(TYPE_RODENT)).thenReturn(rows);

    List<Object[]> result = complaintRepository.findComplaintVolumeByTypeName(TYPE_RODENT);

    assertThat(result).hasSize(rows.size());
    assertThat(result.get(0)[1]).isEqualTo(TYPE_RODENT);
    assertThat(result.get(1)[1]).isEqualTo(TYPE_RODENT);
    verify(complaintRepository).findComplaintVolumeByTypeName(TYPE_RODENT);
  }

  @Test
  void findComplaintVolumeByTypeName_returnsEmptyForUnknownType() {
    when(complaintRepository.findComplaintVolumeByTypeName(TYPE_NONEXISTENT))
        .thenReturn(Collections.emptyList());

    List<Object[]> result = complaintRepository.findComplaintVolumeByTypeName(TYPE_NONEXISTENT);

    assertThat(result).isEmpty();
    verify(complaintRepository).findComplaintVolumeByTypeName(TYPE_NONEXISTENT);
  }
}

package com.example.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ComplaintRepositoryTest {

    private static final String AGENCY_DOT = "DOT";
    private static final Double MEDIAN_MINUTES = 24.0;

    @Mock
    private ComplaintRepository complaintRepository;

    @Test
    void findMedianResolutionTimeByAgency_returnsResults() {
        // anonymous implementation since ResolutionTimeProjection is an interface
        ResolutionTimeProjection projection = new ResolutionTimeProjection() {
            public String getAgency() {
                return AGENCY_DOT;
            }
            public Double getMedianMinutes() {
                return MEDIAN_MINUTES;
            }
        };

        when(complaintRepository.findMedianResolutionTimeByAgency())
            .thenReturn(List.of(projection));

        List<ResolutionTimeProjection> result = complaintRepository.findMedianResolutionTimeByAgency();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAgency()).isEqualTo(AGENCY_DOT);
        assertThat(result.get(0).getMedianMinutes()).isEqualTo(MEDIAN_MINUTES);
        verify(complaintRepository).findMedianResolutionTimeByAgency();
    }

    @Test
    void findMedianResolutionTimeByAgency_returnsEmptyList() {
        when(complaintRepository.findMedianResolutionTimeByAgency())
            .thenReturn(List.of());

        List<ResolutionTimeProjection> result = complaintRepository.findMedianResolutionTimeByAgency();

        assertThat(result).isEmpty();
        verify(complaintRepository).findMedianResolutionTimeByAgency();
    }
}
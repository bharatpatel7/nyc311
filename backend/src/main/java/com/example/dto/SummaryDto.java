package com.example.dto;

import java.util.List;

public record SummaryDto(
    long totalComplaints,
    List<BoroughCountDto> complaintsByBorough,
    List<AgencyCountDto> complaintsByAgency) {
        // no-args
    }
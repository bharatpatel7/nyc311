package com.example.dto;

import java.util.List;

public record FilterOptionsDto(
    List<String> complaintTypes,
    List<String> boroughs,
    List<String> statuses,
    List<String> agencies) {
  //
}

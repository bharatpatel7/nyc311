package com.example.controller;

import com.example.entity.Agency;
import com.example.entity.Complaint;
import com.example.entity.DataRefreshLog;
import com.example.entity.RefreshStatus;
import java.lang.reflect.Field;
import java.time.Instant;
import java.time.LocalDateTime;

class TestFixtures {

  static Complaint complaint(
      String uniqueKey,
      double lat,
      double lng,
      String type,
      String borough,
      String date,
      String status) {
    return complaint(uniqueKey, lat, lng, type, borough, date, status, null);
  }

  static Complaint complaint(
      String uniqueKey,
      double lat,
      double lng,
      String type,
      String borough,
      String date,
      String status,
      Agency agency) {
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

  static Complaint complaintWithNullDate(
      String uniqueKey, double lat, double lng, String type, String borough, String status) {
    Complaint c = new Complaint();
    setField(c, "uniqueKey", uniqueKey);
    setField(c, "latitude", lat);
    setField(c, "longitude", lng);
    setField(c, "complaintType", type);
    setField(c, "borough", borough);
    setField(c, "status", status);
    return c;
  }

  static Agency agency(String name) {
    Agency a = new Agency();
    setField(a, "name", name);
    return a;
  }

  static DataRefreshLog dataRefresh(int recordsProcessed, RefreshStatus status) {
    DataRefreshLog r = new DataRefreshLog();
    setField(r, "refreshStartedAt", Instant.now().minusSeconds(60));
    setField(r, "refreshCompletedAt", Instant.now());
    setField(r, "recordsProcessed", recordsProcessed);
    setField(r, "status", status);
    return r;
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

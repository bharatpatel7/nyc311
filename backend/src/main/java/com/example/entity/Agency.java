package com.example.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


// JPA entity representing a NYC city agency responsible for handling complaints
// Agency names are unique and used as the join key from the complaints table
@Entity
@Table(name = "agencies")
public class Agency {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  // Human-readable agency name (e.g. "NYPD", "DEP"). Must be unique across all agencies
  @Column(nullable = false, unique = true)
  private String name;

  public Agency() {
    //
  }

  public Integer getId() {
    return id;
  }

  public String getName() {
    return name;
  }
}

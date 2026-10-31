package com.example.repository;

import com.example.entity.Agency;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgencyRepository extends JpaRepository<Agency, Integer> {
  Optional<Agency> findByName(String name);
}

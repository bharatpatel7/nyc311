package com.example.repository;

import com.example.entity.DataRefreshLog;
import com.example.entity.RefreshStatus;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DataRefreshLogRepository extends JpaRepository<DataRefreshLog, Integer> {
  Optional<DataRefreshLog> findFirstByStatusOrderByRefreshCompletedAtDesc(RefreshStatus status);

  Optional<DataRefreshLog> findFirstByOrderByRefreshStartedAtDesc();
}

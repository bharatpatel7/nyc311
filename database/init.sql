CREATE DATABASE IF NOT EXISTS devdb;

USE devdb;

CREATE TABLE IF NOT EXISTS agencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    UNIQUE INDEX idx_agency_name (name)
);

CREATE TABLE IF NOT EXISTS complaints (
    unique_key VARCHAR(50) PRIMARY KEY,
    created_date DATETIME NOT NULL,
    closed_date DATETIME,
    complaint_type VARCHAR(255) NOT NULL,
    borough VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    agency_id INT,
    INDEX idx_geo (latitude, longitude),
    INDEX idx_complaint_type (complaint_type),
    INDEX idx_status (status),
    INDEX idx_borough (borough),
    INDEX idx_created_date (created_date),
    INDEX idx_agency_id (agency_id),
    INDEX idx_complaint_type_created_date (complaint_type, created_date),
    FOREIGN KEY (agency_id) REFERENCES agencies(id)
);

CREATE TABLE IF NOT EXISTS data_refresh_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    refresh_started_at TIMESTAMP NOT NULL,
    refresh_completed_at TIMESTAMP,
    records_processed INT,
    status ENUM('IN_PROGRESS', 'SUCCESS', 'FAILED') NOT NULL,
    INDEX idx_status_completed_at (status, refresh_completed_at DESC)
);

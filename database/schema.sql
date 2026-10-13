-- ============================================================
-- CampusResQ
-- MySQL Database Schema
-- Database: campusresq_db
--
-- IMPORTANT:
-- This script creates tables that do not already exist.
-- It does not delete existing tables or data.
-- Run it against a test database first when possible.
-- ============================================================

CREATE DATABASE IF NOT EXISTS campusresq_db;
USE campusresq_db;

-- ============================================================
-- 1. ROLES
-- ============================================================

CREATE TABLE IF NOT EXISTS roles (
    role_id INT NOT NULL AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (role_id),
    UNIQUE KEY role_name (role_name)
) ENGINE=InnoDB;

-- ============================================================
-- 2. USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    user_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id),
    UNIQUE KEY email (email),
    KEY role_id (role_id),
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles (role_id)
) ENGINE=InnoDB;

-- ============================================================
-- 3. LOCATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS locations (
    location_id INT NOT NULL AUTO_INCREMENT,
    building VARCHAR(100) NOT NULL,
    floor VARCHAR(50) DEFAULT NULL,
    room VARCHAR(100) DEFAULT NULL,
    PRIMARY KEY (location_id)
) ENGINE=InnoDB;

-- ============================================================
-- 4. EMERGENCIES
-- ============================================================

CREATE TABLE IF NOT EXISTS emergencies (
    emergency_id INT NOT NULL AUTO_INCREMENT,
    reported_by INT NOT NULL,
    location_id INT NOT NULL,
    emergency_type VARCHAR(50) NOT NULL,
    priority ENUM(
        'LOW',
        'MEDIUM',
        'HIGH',
        'CRITICAL'
    ) NOT NULL,
    description TEXT NOT NULL,
    status ENUM(
        'ACTIVE',
        'IN_PROGRESS',
        'RESOLVED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (emergency_id),
    KEY reported_by (reported_by),
    KEY location_id (location_id),
    KEY idx_emergency_status (status),
    KEY idx_emergency_priority (priority),
    KEY idx_emergency_created (created_at),
    CONSTRAINT fk_emergencies_reporter
        FOREIGN KEY (reported_by)
        REFERENCES users (user_id),
    CONSTRAINT fk_emergencies_location
        FOREIGN KEY (location_id)
        REFERENCES locations (location_id)
) ENGINE=InnoDB;

-- ============================================================
-- 5. RESPONDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS responders (
    responder_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    availability_status ENUM(
        'AVAILABLE',
        'BUSY',
        'OFF_DUTY'
    ) NOT NULL DEFAULT 'AVAILABLE',
    PRIMARY KEY (responder_id),
    UNIQUE KEY user_id (user_id),
    CONSTRAINT fk_responders_user
        FOREIGN KEY (user_id)
        REFERENCES users (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- 6. ASSIGNMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS assignments (
    assignment_id INT NOT NULL AUTO_INCREMENT,
    emergency_id INT NOT NULL,
    responder_id INT NOT NULL,
    assigned_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    status ENUM(
        'ASSIGNED',
        'IN_PROGRESS',
        'COMPLETED'
    ) NOT NULL DEFAULT 'ASSIGNED',
    PRIMARY KEY (assignment_id),
    UNIQUE KEY emergency_id (emergency_id, responder_id),
    KEY responder_id (responder_id),
    CONSTRAINT fk_assignments_emergency
        FOREIGN KEY (emergency_id)
        REFERENCES emergencies (emergency_id),
    CONSTRAINT fk_assignments_responder
        FOREIGN KEY (responder_id)
        REFERENCES responders (responder_id)
) ENGINE=InnoDB;

-- ============================================================
-- 7. RESOURCES
-- ============================================================

CREATE TABLE IF NOT EXISTS resources (
    resource_id INT NOT NULL AUTO_INCREMENT,
    resource_name VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    PRIMARY KEY (resource_id),
    CONSTRAINT resources_chk_1 CHECK (quantity >= 0)
) ENGINE=InnoDB;

-- ============================================================
-- 8. RESOURCE REQUESTS
-- ============================================================

CREATE TABLE IF NOT EXISTS resource_requests (
    request_id INT NOT NULL AUTO_INCREMENT,
    emergency_id INT NOT NULL,
    resource_id INT NOT NULL,
    quantity INT NOT NULL,
    status ENUM(
        'REQUESTED',
        'APPROVED',
        'FULFILLED',
        'REJECTED'
    ) NOT NULL DEFAULT 'REQUESTED',
    requested_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (request_id),
    KEY emergency_id (emergency_id),
    KEY resource_id (resource_id),
    CONSTRAINT fk_resource_requests_emergency
        FOREIGN KEY (emergency_id)
        REFERENCES emergencies (emergency_id),
    CONSTRAINT fk_resource_requests_resource
        FOREIGN KEY (resource_id)
        REFERENCES resources (resource_id),
    CONSTRAINT resource_requests_chk_1 CHECK (quantity > 0)
) ENGINE=InnoDB;

-- ============================================================
-- END OF CAMPUSRESQ TABLE SCHEMA
-- ============================================================
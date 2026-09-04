-- =========================================================
-- CivicFix - Intelligent Civic Issue Reporting and Routing
-- Database Schema for MySQL 8.0+
-- =========================================================

CREATE DATABASE IF NOT EXISTS civicfix_db
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE civicfix_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('CITIZEN', 'STAFF', 'ADMIN') NOT NULL DEFAULT 'CITIZEN',
  department_id VARCHAR(64) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_role (role),
  INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL UNIQUE,
  description TEXT,
  head_name VARCHAR(128) NULL,
  contact_email VARCHAR(191) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Issues Table
CREATE TABLE IF NOT EXISTS issues (
  id VARCHAR(32) PRIMARY KEY, -- e.g. CF10024
  user_id VARCHAR(64) NOT NULL,
  category ENUM(
    'Road Damage', 
    'Waste Management', 
    'Street Lighting', 
    'Water Supply', 
    'Tree Hazard', 
    'Road Signage'
  ) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(512),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  address VARCHAR(255) NOT NULL,
  priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  priority_reason TEXT,
  status ENUM('Reported', 'Assigned', 'In Progress', 'Resolved') NOT NULL DEFAULT 'Reported',
  department_id VARCHAR(64) NOT NULL,
  report_count INT UNSIGNED NOT NULL DEFAULT 1,
  resolution_proof VARCHAR(512) NULL,
  resolution_notes TEXT NULL,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
  INDEX idx_issue_status (status),
  INDEX idx_issue_priority (priority),
  INDEX idx_issue_category (category),
  INDEX idx_issue_geo (latitude, longitude)
) ENGINE=InnoDB;

-- 4. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
  id VARCHAR(64) PRIMARY KEY,
  issue_id VARCHAR(32) NOT NULL,
  department_id VARCHAR(64) NOT NULL,
  assigned_to_user_id VARCHAR(64) NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  notes TEXT,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_assignment_dept (department_id, completed_at)
) ENGINE=InnoDB;

-- 5. Issue Reports (Duplicate / Corroborative Tracking)
CREATE TABLE IF NOT EXISTS issue_reports (
  id VARCHAR(64) PRIMARY KEY,
  issue_id VARCHAR(32) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  note TEXT,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_report_issue (issue_id)
) ENGINE=InnoDB;

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  issue_id VARCHAR(32) NULL,
  message VARCHAR(500) NOT NULL,
  type ENUM('STATUS_CHANGE', 'ASSIGNMENT', 'DUPLICATE', 'RESOLVED', 'ALERT') NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id, is_read)
) ENGINE=InnoDB;

-- 7. Initial Seed Data
INSERT INTO departments (id, name, description, head_name, contact_email) VALUES
('dept-road', 'Road Maintenance Department', 'Road surfaces, potholes, arterial pavements, and asphalt re-laying.', 'Er. R. Sundaram', 'roads.corporation@civicfix.gov.in'),
('dept-sanitation', 'Sanitation Department', 'Solid waste management, community dumpsters, bio-waste disposal, and public sanitation.', 'Dr. K. Meenakshi', 'sanitation@civicfix.gov.in'),
('dept-electrical', 'Electrical Department', 'Streetlights, electrical junction poles, high-mast illumination, and line safety.', 'Er. V. Anand', 'electrical@civicfix.gov.in'),
('dept-water', 'Water Department', 'Potable water pipelines, sewage lines, manhole covers, and storm drainage.', 'Er. P. Venkatesh', 'metrowater@civicfix.gov.in'),
('dept-parks', 'Parks/Maintenance Department', 'Horticulture, fallen trees, hazardous branches, urban greenery, and roadside canopy.', 'Smt. S. Shalini', 'parks.civic@civicfix.gov.in'),
('dept-traffic', 'Traffic/Road Department', 'Traffic signage, zebra crossings, signal boards, speed bumps, and road median safety.', 'Insp. M. Rajendran', 'traffic.roads@civicfix.gov.in');

INSERT INTO users (id, name, email, password, role, department_id) VALUES
('usr-citizen-1', 'Karthik Subramanian', 'karthik.citizen@gmail.com', '$2a$12$e8M0N.z9K9K3H7L6F5G4...', 'CITIZEN', NULL),
('usr-citizen-2', 'Ananya Ramesh', 'ananya.r@gmail.com', '$2a$12$e8M0N.z9K9K3H7L6F5G4...', 'CITIZEN', NULL),
('usr-staff-road', 'Rajesh Kumar (Road Division)', 'rajesh.staff@civicfix.gov.in', '$2a$12$e8M0N.z9K9K3H7L6F5G4...', 'STAFF', 'dept-road'),
('usr-staff-sanitation', 'Saravanan M. (Sanitation Staff)', 'saravanan.staff@civicfix.gov.in', '$2a$12$e8M0N.z9K9K3H7L6F5G4...', 'STAFF', 'dept-sanitation'),
('usr-admin-1', 'Civic Administrator', 'admin@civicfix.gov.in', '$2a$12$e8M0N.z9K9K3H7L6F5G4...', 'ADMIN', NULL);

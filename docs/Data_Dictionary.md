# CampusResQ — Data Dictionary

## 1. Overview

The CampusResQ relational database is named `campusresq_db` and uses MySQL.

This document describes the eight principal database tables, their columns, data types, constraints, and purposes.

**Notation:**
- PK: Primary Key
- FK: Foreign Key
- NN: NOT NULL
- UQ: UNIQUE
- AI: AUTO_INCREMENT

---

## 2. Roles Table

**Purpose:** Stores application roles.

| Column | Data type | Constraints | Description |
|---|---|---|---|
| role_id | INT | PK, AI, NN | Unique role identifier |
| role_name | VARCHAR(50) | NN, UQ | Role name |

---

## 3. Users Table

**Purpose:** Stores application user information.

| Column | Data type | Constraints | Description |
|---|---|---|---|
| user_id | INT | PK, AI, NN | Unique user identifier |
| name | VARCHAR(100) | NN | User's name |
| email | VARCHAR(150) | NN, UQ | User's email address |
| password_hash | VARCHAR(255) | NN | Hashed password |
| role_id | INT | NN, FK | References `roles.role_id` |

---

## 4. Locations Table

**Purpose:** Stores campus location information.

| Column | Data type | Constraints | Description |
|---|---|---|---|
| location_id | INT | PK, AI, NN | Unique location identifier |
| building | VARCHAR(100) | NN | Campus building |
| floor | VARCHAR(50) | Nullable | Floor information |
| room | VARCHAR(100) | Nullable | Room or specific area |

---

## 5. Emergencies Table

**Purpose:** Stores emergency reports and their current statuses.

| Column | Data type | Constraints | Description |
|---|---|---|---|
| emergency_id | INT | PK, AI, NN | Unique emergency identifier |
| reported_by | INT | NN, FK | References `users.user_id` |
| location_id | INT | NN, FK | References `locations.location_id` |
| emergency_type | VARCHAR(50) | NN | Type of emergency |
| priority | ENUM | NN | LOW, MEDIUM, HIGH, or CRITICAL |
| description | TEXT | NN | Description of the incident |
| status | ENUM | NN, default ACTIVE | ACTIVE, IN_PROGRESS, RESOLVED, or CANCELLED |
| created_at | TIMESTAMP | Default current timestamp | Time the report was created |
| updated_at | TIMESTAMP | Automatically updated | Time the record was last updated |

### Indexes

The table includes indexes for:
- `reported_by`
- `location_id`
- `status`
- `priority`
- `created_at`

These support common lookups and filtering operations.

---

## 6. Responders Table

**Purpose:** Stores responder information and availability.

| Column | Data type | Constraints | Description |
|---|---|---|---|
| responder_id | INT | PK, AI, NN | Unique responder identifier |
| user_id | INT | NN, FK, UQ | References `users.user_id` |
| availability_status | ENUM | NN, default AVAILABLE | AVAILABLE, BUSY, or OFF_DUTY |

---

## 7. Assignments Table

**Purpose:** Records the assignment of responders to emergencies.

| Column | Data type | Constraints | Description |
|---|---|---|---|
| assignment_id | INT | PK, AI, NN | Unique assignment identifier |
| emergency_id | INT | NN, FK | References `emergencies.emergency_id` |
| responder_id | INT | NN, FK | References `responders.responder_id` |
| assigned_at | TIMESTAMP | Default current timestamp | Assignment creation time |
| completed_at | TIMESTAMP | Nullable | Assignment completion time |
| status | ENUM | NN, default ASSIGNED | ASSIGNED, IN_PROGRESS, or COMPLETED |

**Additional constraint:** `(emergency_id, responder_id)` is unique.

This prevents the same responder from being assigned to the same emergency more than once.

---

## 8. Resources Table

**Purpose:** Stores available campus emergency resources.

| Column | Data type | Constraints | Description |
|---|---|---|---|
| resource_id | INT | PK, AI, NN | Unique resource identifier |
| resource_name | VARCHAR(100) | NN | Resource name |
| resource_type | VARCHAR(50) | NN | Resource category |
| quantity | INT | NN, default 0 | Available quantity |

**Integrity constraint:** `quantity >= 0`.

This prevents negative resource quantities.

---

## 9. Resource Requests Table

**Purpose:** Records requests for resources needed for emergencies.

| Column | Data type | Constraints | Description |
|---|---|---|---|
| request_id | INT | PK, AI, NN | Unique request identifier |
| emergency_id | INT | NN, FK | References `emergencies.emergency_id` |
| resource_id | INT | NN, FK | References `resources.resource_id` |
| quantity | INT | NN | Number of requested units |
| status | ENUM | NN, default REQUESTED | REQUESTED, APPROVED, FULFILLED, or REJECTED |
| requested_at | TIMESTAMP | Default current timestamp | Request creation time |

**Integrity constraint:** `quantity > 0`.

A resource request must specify a positive quantity.

---

## 10. Relationships and Foreign Keys

| Child table | Foreign-key column | Referenced table and column |
|---|---|---|
| users | role_id | roles.role_id |
| emergencies | reported_by | users.user_id |
| emergencies | location_id | locations.location_id |
| responders | user_id | users.user_id |
| assignments | emergency_id | emergencies.emergency_id |
| assignments | responder_id | responders.responder_id |
| resource_requests | emergency_id | emergencies.emergency_id |
| resource_requests | resource_id | resources.resource_id |

Foreign keys maintain referential integrity by ensuring that referenced records exist.

---

## 11. Data Integrity and Security

The database uses:
- Primary keys to uniquely identify records.
- Foreign keys to connect related tables.
- Unique constraints to prevent duplicate values.
- ENUM columns to restrict supported status and priority values.
- CHECK constraints to enforce quantity rules.
- NOT NULL constraints to require essential fields.
- Password hashes rather than plaintext passwords.

These mechanisms help maintain consistent and reliable database records.

---

## 12. Summary

The data dictionary documents the purpose, attributes, data types, and constraints of the eight principal MySQL tables in CampusResQ.

It complements the relational schema and ER diagram by explaining how each table stores information and how the tables are connected.
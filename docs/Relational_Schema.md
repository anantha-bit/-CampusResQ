# CampusResQ — Relational Schema

## 1. Overview

CampusResQ uses MySQL as its relational database. The database is named `campusresq_db`.

The relational schema describes the tables, attributes, primary keys, foreign keys, and relationships used to store campus emergency information.

**Notation**
- **PK** — Primary Key
- **FK** — Foreign Key
- **UQ** — Unique constraint
- **NN** — NOT NULL
- **AI** — AUTO_INCREMENT

---

## 2. Relations

### 2.1 Roles

**Relation:** `ROLES`

```text
ROLES(
    role_id INT PK AI,
    role_name VARCHAR(50) NN UQ
)
```

**Purpose:** Stores the roles assigned to users.

### 2.2 Users

**Relation:** `USERS`

```text
USERS(
    user_id INT PK AI,
    name VARCHAR(100) NN,
    email VARCHAR(150) NN UQ,
    password_hash VARCHAR(255) NN,
    role_id INT NN FK -> ROLES.role_id
)
```

**Purpose:** Stores user information and the associated role.

### 2.3 Locations

**Relation:** `LOCATIONS`

```text
LOCATIONS(
    location_id INT PK AI,
    building VARCHAR(100) NN,
    floor VARCHAR(50) NULL,
    room VARCHAR(100) NULL
)
```

**Purpose:** Stores campus building and location information.

### 2.4 Emergencies

**Relation:** `EMERGENCIES`

```text
EMERGENCIES(
    emergency_id INT PK AI,
    reported_by INT NN FK -> USERS.user_id,
    location_id INT NN FK -> LOCATIONS.location_id,
    emergency_type VARCHAR(50) NN,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NN,
    description TEXT NN,
    status ENUM('ACTIVE', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED')
        NN DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

**Purpose:** Stores emergency reports, priorities, statuses, and timestamps.

**Indexes:** `reported_by`, `location_id`, `status`, `priority`, and `created_at`.

### 2.5 Responders

**Relation:** `RESPONDERS`

```text
RESPONDERS(
    responder_id INT PK AI,
    user_id INT NN UQ FK -> USERS.user_id,
    availability_status ENUM('AVAILABLE', 'BUSY', 'OFF_DUTY')
        NN DEFAULT 'AVAILABLE'
)
```

**Purpose:** Stores responder information and availability.

The unique constraint on `user_id` ensures that a user is associated with at most one responder record.

### 2.6 Assignments

**Relation:** `ASSIGNMENTS`

```text
ASSIGNMENTS(
    assignment_id INT PK AI,
    emergency_id INT NN FK -> EMERGENCIES.emergency_id,
    responder_id INT NN FK -> RESPONDERS.responder_id,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    status ENUM('ASSIGNED', 'IN_PROGRESS', 'COMPLETED')
        NN DEFAULT 'ASSIGNED',
    UQ(emergency_id, responder_id)
)
```

**Purpose:** Associates responders with emergencies and records assignment status.

The composite unique constraint prevents the same responder from being assigned to the same emergency more than once.

### 2.7 Resources

**Relation:** `RESOURCES`

```text
RESOURCES(
    resource_id INT PK AI,
    resource_name VARCHAR(100) NN,
    resource_type VARCHAR(50) NN,
    quantity INT NN DEFAULT 0,
    CHECK(quantity >= 0)
)
```

**Purpose:** Stores information about available emergency resources.

The CHECK constraint prevents negative resource quantities.

### 2.8 Resource Requests

**Relation:** `RESOURCE_REQUESTS`

```text
RESOURCE_REQUESTS(
    request_id INT PK AI,
    emergency_id INT NN FK -> EMERGENCIES.emergency_id,
    resource_id INT NN FK -> RESOURCES.resource_id,
    quantity INT NN,
    status ENUM('REQUESTED', 'APPROVED', 'FULFILLED', 'REJECTED')
        NN DEFAULT 'REQUESTED',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK(quantity > 0)
)
```

**Purpose:** Records requests for resources associated with emergencies.

The CHECK constraint requires requested quantities to be greater than zero.

---

## 3. Relationship Summary

| Parent relation | Child relation | Relationship | Foreign key |
|---|---|---|---|
| ROLES | USERS | One-to-many | `users.role_id` |
| USERS | EMERGENCIES | One-to-many | `emergencies.reported_by` |
| LOCATIONS | EMERGENCIES | One-to-many | `emergencies.location_id` |
| USERS | RESPONDERS | One-to-zero-or-one | `responders.user_id` |
| EMERGENCIES | ASSIGNMENTS | One-to-many | `assignments.emergency_id` |
| RESPONDERS | ASSIGNMENTS | One-to-many | `assignments.responder_id` |
| EMERGENCIES | RESOURCE_REQUESTS | One-to-many | `resource_requests.emergency_id` |
| RESOURCES | RESOURCE_REQUESTS | One-to-many | `resource_requests.resource_id` |

### Many-to-many relationship

Emergencies and responders can be associated through the `ASSIGNMENTS` relation.

Conceptually, this is a many-to-many relationship implemented using a junction table.

The unique constraint on `(emergency_id, responder_id)` prevents duplicate pairs while allowing an emergency to have multiple responders and a responder to be assigned to multiple emergencies.

---

## 4. Referential Integrity

Foreign keys maintain relationships between records:

- Every user references an existing role.
- Every emergency references an existing reporter and location.
- Every responder references an existing user.
- Every assignment references an existing emergency and responder.
- Every resource request references an existing emergency and resource.

These relationships help prevent orphaned records.

---

## 5. Integrity Constraints

| Table | Constraint | Purpose |
|---|---|---|
| `roles` | Unique `role_name` | Prevents duplicate role names |
| `users` | Unique `email` | Prevents duplicate email addresses |
| `users` | Foreign key `role_id` | Ensures a valid role |
| `emergencies` | Priority ENUM | Restricts priority values |
| `emergencies` | Status ENUM | Restricts emergency status values |
| `responders` | Unique `user_id` | Limits each user to one responder record |
| `assignments` | Unique `(emergency_id, responder_id)` | Prevents duplicate assignments |
| `resources` | CHECK `quantity >= 0` | Prevents negative resource quantities |
| `resource_requests` | CHECK `quantity > 0` | Requires a positive requested quantity |

---

## 6. Design Summary

The relational schema separates user roles, user accounts, locations, emergencies, responders, assignments, resources, and resource requests into distinct relations.

Primary keys uniquely identify records. Foreign keys connect related relations. Unique constraints and CHECK constraints enforce additional integrity rules.

This design supports structured emergency management while reducing unnecessary duplication and maintaining referential integrity.
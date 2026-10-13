# CampusResQ — Campus Emergency Response Management System

CampusResQ is a web-based campus emergency response management system designed to help students report emergencies, enable responders to update incident statuses, and provide administrators with an overview of campus emergency activities.

The project combines a Next.js web application with MySQL for structured relational data and MongoDB for incident logging and status-based analysis.

---

## 1. Project Objectives

- Provide a centralized platform for reporting campus emergencies.
- Store emergency, user, location, and resource information reliably.
- Allow authorized responders to update emergency statuses.
- Enforce role-based access control.
- Maintain incident logs in MongoDB.
- Display emergency statistics and reports through a dashboard.
- Demonstrate relational database design, advanced SQL operations, and NoSQL data processing.

---

## 2. Key Features

### Emergency Reporting
- Submit an emergency report.
- Select the emergency type, priority, and location.
- Add a description of the incident.
- Store emergency information in MySQL.
- Create an associated incident log in MongoDB.

### Emergency Management
- View reported emergencies.
- View emergency details and locations.
- Track incident statuses.
- Allow authorized responders to update statuses.

### Authentication and Authorization
The application supports three roles:

| Role | Main responsibility |
|---|---|
| USER | Report emergencies and access permitted features |
| RESPONDER | View emergencies and update their statuses |
| ADMIN | Perform administrative operations and manage permitted emergency updates |

Authentication uses password verification and a signed JWT stored in an HTTP-only cookie. API routes enforce authentication and role-based authorization.

### Dashboard and Reports
- View emergency statistics.
- Review recent emergency reports.
- View emergency status summaries.
- Explore available resource and location information.

---

## 3. Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Next.js API Routes |
| Relational database | MySQL |
| NoSQL database | MongoDB |
| Database connectivity | mysql2 and MongoDB Node.js driver |
| Authentication | JWT and bcrypt |
| Version control | Git and GitHub |

---

## 4. System Architecture

The application follows a web application architecture.

1. The user interacts with the Next.js interface.
2. The interface sends requests to the Next.js API routes.
3. Authentication and authorization checks are performed where required.
4. MySQL stores structured application data.
5. MongoDB stores incident logs and supports document-based analysis.
6. The frontend displays the results returned by the API.

### Database responsibilities

**MySQL**
- Users and roles
- Campus locations
- Emergencies
- Responders
- Assignments
- Resources
- Resource requests

**MongoDB**
- Incident reports and associated status information
- Status-based aggregation and analysis
- Indexed retrieval of incident documents

MySQL is used for relational integrity and structured transactions. MongoDB provides a document-oriented approach to incident logging and analysis.

---

## 5. MySQL Database Design

The database is named:

`campusresq_db`

The application contains the following principal tables:

| Table | Purpose |
|---|---|
| `users` | Stores user information |
| `roles` | Stores role definitions |
| `locations` | Stores campus location information |
| `emergencies` | Stores emergency reports and statuses |
| `responders` | Stores responder information |
| `assignments` | Associates emergencies with responders |
| `resources` | Stores available resources |
| `resource_requests` | Stores requests for resources |

### Relationships

- Users are associated with roles.
- Emergencies reference the user who reported them.
- Emergencies reference campus locations.
- Responders reference users.
- Assignments connect emergencies and responders.
- Resource requests reference emergencies and resources.

Primary keys, foreign keys, and other constraints help maintain relational integrity.

### Emergency statuses

The emergency lifecycle supports the following statuses:

- `ACTIVE`
- `IN_PROGRESS`
- `RESOLVED`
- `CANCELLED`

### Emergency priorities

The supported priority levels are:

- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

---

## 6. Advanced SQL Concepts

The project demonstrates several SQL concepts beyond basic CRUD operations.

### Primary and Foreign Keys
Primary keys uniquely identify records. Foreign keys establish relationships between tables.

### Constraints
Column definitions and constraints restrict invalid data and maintain consistency.

### Indexing
Indexes support retrieval and filtering on selected columns, including emergency status, priority, and creation time.

### Views
The `emergency_details` view combines emergency information with related details for convenient querying.

### Stored Procedure
The `get_emergencies_by_status` procedure retrieves emergencies for a specified status.

### User-Defined Function
The `count_active_emergencies()` function calculates the number of active emergencies.

### Trigger
The `before_emergency_update` trigger runs before an emergency record is updated.

### Transactions
Transactions demonstrate how database changes can be committed or rolled back.

### SQL Operations
The project uses:
- DDL: `CREATE`, `ALTER`, `DROP`
- DML: `INSERT`, `UPDATE`, `DELETE`
- Queries: `SELECT`, joins, filtering, sorting, and aggregation
- Grouping: `GROUP BY` and `HAVING`
- Subqueries and aggregate functions

---

## 7. MongoDB Implementation

The MongoDB database is named:

`campusresq`

The incident collection is:

`incident_reports`

MongoDB is used for document-oriented incident logging and analysis.

### Indexes

The collection includes:
- The default `_id` index
- An index on `status`
- An index on `emergency_id`

### Aggregation

The aggregation pipeline groups incident documents by status and calculates the number of documents in each group.

This demonstrates the use of MongoDB aggregation operators such as `$group`, `$sum`, and `$sort`.

### MySQL and MongoDB integration

Emergency reporting stores the primary emergency record in MySQL and attempts to create a corresponding incident log in MongoDB.

When an authorized responder or administrator updates an emergency status, the API updates MySQL and attempts to synchronize the associated MongoDB document.

The application reports the result of MongoDB synchronization separately. This is not a distributed atomic transaction, so synchronization failures must be handled explicitly.

---

## 8. Project Structure

The principal project files and directories include:

```text
CampusResQ/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── emergencies/
│   │   ├── incident-logs/
│   │   ├── locations/
│   │   ├── mongo-test/
│   │   └── resources/
│   ├── emergency-reports/
│   ├── login/
│   ├── report-emergency/
│   ├── reports/
│   ├── resources/
│   └── page.tsx
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   └── mongodb.ts
├── public/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── next.config.ts
└── README.md
```

The exact contents may evolve as the project is developed.

---

## 9. Prerequisites

Install the following before running the project:

- Node.js and npm
- MySQL Server
- MongoDB Server
- Git

You will also need the project source code and a configured MySQL database.

---

## 10. Installation and Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/anantha-bit/-CampusResQ.git
```

Move into the project directory:

```bash
cd -CampusResQ
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure environment variables

Create a local `.env.local` file in the project root.

Use `.env.example` as a reference, and configure the variables required by the application:

```dotenv
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=campusresq_db

MONGODB_URI=mongodb://127.0.0.1:27017/campusresq

JWT_SECRET=replace_with_a_long_random_secret
```

Replace the example values with your local configuration.

**Never commit `.env.local`, real database passwords, or production secrets to GitHub.**

### Step 4: Configure MySQL

1. Start MySQL Server.
2. Create the `campusresq_db` database.
3. Create the required tables, relationships, constraints, views, procedures, functions, triggers, and indexes.
4. Configure the application database credentials in `.env.local`.

The database schema and SQL setup scripts should be included in the repository's database documentation when available.

### Step 5: Configure MongoDB

1. Start MongoDB Server.
2. Ensure the MongoDB URI matches your local configuration.
3. Use the `campusresq` database.
4. Ensure the `incident_reports` collection and required indexes are available.

### Step 6: Start the application

```bash
npm run dev
```

Open the application in your browser:

http://localhost:3000

---

## 11. Application Pages

The application includes the following pages:

| Page | Purpose |
|---|---|
| Dashboard | Displays emergency statistics and recent reports |
| Emergency Reports | Displays emergency records and their statuses |
| Report Emergency | Provides the emergency reporting form |
| Resources | Displays resource information |
| Locations | Displays campus location information |
| Reports | Displays emergency analytics |
| Login | Provides user authentication |

The availability of particular actions depends on the user's role and the implemented authorization rules.

---

## 12. API Overview

The application includes Next.js API routes for emergency management, authentication, locations, resources, incident logs, and MongoDB connectivity testing.

The principal routes include:

| Endpoint | Purpose |
|---|---|
| `/api/auth/login` | Authenticates users |
| `/api/emergencies` | Retrieves and creates emergency reports |
| `/api/locations` | Provides location-related data |
| `/api/resources` | Provides resource-related data |
| `/api/incident-logs` | Supports incident-log operations |
| `/api/mongo-test` | Tests MongoDB connectivity |

Emergency status updates use the supported emergency API route with the appropriate request method and payload.

Protected endpoints require valid authentication, and emergency status changes are restricted to authorized roles.

---

## 13. Testing

The following areas have been tested during development:

- MySQL database connectivity
- MongoDB connectivity
- Emergency reporting
- Emergency listing and dashboard display
- Emergency status updates
- Authentication and authorization
- Invalid request validation
- MySQL views, procedures, functions, and triggers
- SQL transaction rollback
- SQL DDL and DML operations
- MongoDB indexes and aggregation
- Application page navigation
- MySQL and MongoDB status synchronization for tested incident records

These checks demonstrate the main application and database capabilities. They do not imply that every possible failure condition or production scenario has been tested.

---

## 14. Security Considerations

- Environment-specific configuration is stored outside the source code.
- `.env.local` is excluded through `.gitignore`.
- Password verification uses bcrypt.
- Authentication uses a signed JWT in an HTTP-only cookie.
- Protected API routes perform authentication checks.
- Role-based authorization restricts emergency status changes.
- Request validation rejects invalid emergency fields and unsupported values.
- Database relationships and constraints help preserve data integrity.

For production deployment, use strong secrets, secure database credentials, HTTPS, and appropriate access restrictions.

---

## 15. Limitations and Future Improvements

Potential improvements include:

- Automated retry handling for failed MongoDB synchronization
- More comprehensive automated tests
- Enhanced emergency notifications
- Live incident updates
- Improved analytics and reporting
- More detailed audit logs
- Deployment configuration for a hosted environment
- Additional monitoring and production security controls

---

## 16. Contributors

Developed as a DBMS project using Next.js, MySQL, and MongoDB.

Repository:

https://github.com/anantha-bit/-CampusResQ

---

## 17. Conclusion

CampusResQ demonstrates how a web application can combine relational and document-oriented databases to support campus emergency reporting and response management.

The project integrates authentication, role-based authorization, emergency lifecycle management, SQL database design, advanced SQL features, MongoDB aggregation, and a web-based dashboard into one application.



---

## 18. Project Documentation

The following files provide detailed information about the CampusResQ database design and implementation.

| Document | Description |
|---|---|
| [Database Schema](database/schema.sql) | MySQL table definitions, primary keys, foreign keys, and constraints |
| [SQL Queries](database/queries.sql) | SQL queries, joins, aggregations, subqueries, and advanced database operations |
| [ER Diagram](docs/ER_Diagram.png) | Entity-Relationship diagram using Chen notation |
| [Relational Schema](docs/Relational_Schema.md) | Relations, attributes, keys, and relationships |
| [Data Dictionary](docs/Data_Dictionary.md) | Column descriptions, data types, and constraints |
| [Application Screenshots](docs/Screenshots/CampusResQ_Application_Screenshots.docx) | Screenshots of the application pages |

### Documentation Overview

These documents explain the relational database design, SQL implementation, relationships between entities, and application interface.

The screenshots provide visual evidence of the application's pages and functionality.
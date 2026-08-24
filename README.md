📊 Dashboard

The main dashboard provides a real-time overview of campus emergencies.

The dashboard displays:

Total Incidents
Active Incidents
In Progress Incidents
Resolved Incidents

It also displays emergency reports with information such as:

Emergency type
Priority
Current status
Location
Floor
Incident ID
Reported by
Description
🔄 Emergency Status Management

Every emergency follows a response workflow.

ACTIVE
  │
  ▼
IN PROGRESS
  │
  ▼
RESOLVED
ACTIVE

The emergency has been reported but response action has not yet started.

IN PROGRESS

A response team has started handling the emergency.

RESOLVED

The emergency has been successfully handled.

The dashboard automatically updates the number of incidents in each status.

🔍 Emergency Search and Filtering

The dashboard provides filtering functionality for emergency reports.

Users can search emergencies using keywords and filter them by:

Status
All Statuses
ACTIVE
IN PROGRESS
RESOLVED
Priority
All Priorities
HIGH
MEDIUM
CRITICAL

This makes it easier for administrators to find important emergency reports quickly.

🧰 Resource Management

CampusResQ provides a dedicated Resources section for managing emergency response resources available on campus.

Example resources include:

Resource ID	Resource	Type	Quantity
1	First Aid Kit	Medical	17
2	Fire Extinguisher	Fire Safety	15
3	Wheelchair	Medical	5
4	Stretcher	Medical	3
5	Emergency Radio	Communication	10

The Resources page displays:

Resource name
Resource type
Available quantity
Resource ID

The dashboard also provides resource statistics such as:

Total resources
Medical resources
Fire Safety resources
📍 Campus Locations

The Locations section displays all registered emergency response locations on campus.

Each location contains:

Location ID
Building
Floor
Room / Area

The page also provides:

Total number of locations
Number of buildings
Number of floors
Location search
Building filtering
📈 Reports & Analytics

CampusResQ includes a Reports & Analytics section for analyzing emergency activity.

The analytics dashboard provides:

Response Overview

Displays the distribution of incidents between:

Active
In Progress
Resolved

Example:

Active       → 20%
In Progress  → 40%
Resolved     → 40%
Emergencies by Type

Displays the number of emergencies belonging to each category.

Example:

Medical   → 3
Fire      → 1
Security  → 1
Emergencies by Priority

Displays the number of incidents grouped by priority.

Example:

HIGH      → 3
CRITICAL  → 1
MEDIUM    → 1
🖥️ Technology Stack
Frontend
Next.js
React
TypeScript
CSS
Backend
Next.js API Routes
TypeScript
Database
MySQL
Development Tools
Visual Studio Code
Node.js
npm
Git
GitHub
🏗️ System Architecture

CampusResQ follows a simple full-stack architecture.

                ┌─────────────────────┐
                │      User/Admin     │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │     Next.js UI      │
                │   React + TypeScript│
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │    API Routes       │
                │     Next.js         │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │     MySQL Database  │
                │   campusresq_db     │
                └─────────────────────┘
📁 Project Structure
CampusResQ/
│
├── app/
│   │
│   ├── api/
│   │   │
│   │   ├── emergencies/
│   │   │   └── route.ts
│   │   │
│   │   ├── locations/
│   │   │   └── route.ts
│   │   │
│   │   ├── resources/
│   │   │   └── route.ts
│   │   │
│   │   └── test-db/
│   │       └── route.ts
│   │
│   ├── emergency-reports/
│   │   └── page.tsx
│   │
│   ├── locations/
│   │   └── page.tsx
│   │
│   ├── reports/
│   │   └── page.tsx
│   │
│   ├── resources/
│   │   └── page.tsx
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── lib/
│   └── db.ts
│
├── public/
│
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
└── README.md
🗄️ Database

CampusResQ uses MySQL as its database.

The database name is:

campusresq_db
📋 Database Tables

The CampusResQ database contains the following tables:

assignments
emergencies
emergency_details
locations
resource_requests
resources
responders
roles
users
🚨 Emergencies Table

The emergencies table stores reported emergency incidents.

Important information includes:

Emergency ID
Reported By
Location ID
Emergency Type
Priority
Description
Status
Created At

The emergency status is initially stored as:

ACTIVE
📍 Locations Table

The locations table stores registered campus locations.

Example:

Location ID: 1
Building: Block A
Floor: Ground Floor
Room: Main Entrance

Another example:

Location ID: 6
Building: Block A
Floor: 2nd Floor
Room: Room 305
🧰 Resources Table

The resources table stores available emergency response resources.

Example:

First Aid Kit
Type: Medical
Quantity: 17
Fire Extinguisher
Type: Fire Safety
Quantity: 15
Wheelchair
Type: Medical
Quantity: 5
Stretcher
Type: Medical
Quantity: 3
Emergency Radio
Type: Communication
Quantity: 10
🔄 Emergency Workflow

The complete emergency workflow is:

1. User opens CampusResQ
              │
              ▼
2. Selects "Report Emergency"
              │
              ▼
3. Enters emergency details
              │
              ▼
4. System validates location
              │
              ▼
5. Emergency is stored in MySQL
              │
              ▼
6. Status = ACTIVE
              │
              ▼
7. Administrator reviews incident
              │
              ▼
8. Response is started
              │
              ▼
9. Status = IN PROGRESS
              │
              ▼
10. Emergency is handled
              │
              ▼
11. Status = RESOLVED
🔌 API Endpoints
Emergencies API
GET
GET /api/emergencies

Returns all emergency reports.

Example response:

{
  "success": true,
  "emergencies": []
}
POST
POST /api/emergencies

Creates a new emergency report.

Example request:

{
  "reported_by": 1,
  "location_id": 6,
  "emergency_type": "Medical",
  "priority": "HIGH",
  "description": "Student requires medical assistance"
}

The new emergency is stored with:

status = ACTIVE
PATCH
PATCH /api/emergencies

Updates the status of an emergency.

Possible status values:

ACTIVE
IN PROGRESS
RESOLVED
📍 Locations API
GET /api/locations

Returns all registered campus locations.

Example:

{
  "success": true,
  "locations": []
}
🧰 Resources API
GET /api/resources

Returns available emergency resources.

Example:

{
  "success": true,
  "resources": []
}
🧪 Database Testing API

The project also contains a database testing endpoint:

GET /api/test-db

This can be used to verify that the Next.js application can successfully communicate with MySQL.

⚙️ Installation
Requirements

Before running CampusResQ, install:

Node.js
npm
MySQL Server
Git
Visual Studio Code
1. Clone the Repository
git clone https://github.com/anantha-bit/-CampusResQ.git

Enter the project directory:

cd -CampusResQ
2. Install Dependencies

Run:

npm install
3. Setup MySQL

Start MySQL Server.

Open the MySQL command line:

mysql -u root -p

Create the database:

CREATE DATABASE campusresq_db;

Select it:

USE campusresq_db;

Create/import the required CampusResQ tables.

4. Configure Database Connection

The database connection is located at:

lib/db.ts

Example:

import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "YOUR_MYSQL_PASSWORD",
  database: "campusresq_db",
});

export default pool;

Replace:

YOUR_MYSQL_PASSWORD

with your local MySQL password.

Important

Do not commit your real database password to GitHub.

For production, database credentials should be stored in environment variables.

5. Start the Development Server

Run:

npm run dev

Open the application in your browser:

http://localhost:3000
🌐 Application Pages
Page	URL	Description
Dashboard	/	Main emergency monitoring dashboard
Emergency Reports	/emergency-reports	Emergency report management
Resources	/resources	Emergency resource management
Locations	/locations	Registered campus locations
Reports & Analytics	/reports	Emergency statistics and analytics
🖱️ Using the Application
Dashboard

Open:

http://localhost:3000

The dashboard shows:

Total incidents
Active incidents
In-progress incidents
Resolved incidents
Emergency reports
Search and filters
Report an Emergency

Click:

+ Report Emergency

Enter:

Emergency Type
Priority
Building
Floor
Room / Location
Description

Then click:

Submit Emergency

The system checks whether the location is registered before creating the emergency.

Start Response

For an active emergency, the administrator can select:

Start Response

The emergency status changes from:

ACTIVE

to:

IN PROGRESS
Mark Resolved

Once the emergency has been handled, the administrator can select:

Mark Resolved

The status changes to:

RESOLVED
📊 Reports & Analytics

Navigate to:

/reports

The page provides:

Total incidents
Active incidents
In-progress incidents
Resolved incidents
Response overview
Emergency types
Emergency priorities

This allows administrators to understand emergency trends across campus.

🔎 Search and Filtering

Emergency reports can be searched using:

Search emergencies...

Reports can also be filtered by:

Status
All Statuses
ACTIVE
IN PROGRESS
RESOLVED
Priority
All Priorities
HIGH
MEDIUM
CRITICAL
🛡️ Validation

CampusResQ performs validation before creating emergency reports.

Required fields include:

Reported user
Location
Emergency type
Priority
Description

The system also checks whether the selected campus location exists in the database.

Invalid locations are rejected.

🔐 Security Considerations

Before deploying CampusResQ to a production environment, the following security improvements should be implemented:

Use environment variables for database credentials.
Implement user authentication.
Implement role-based access control.
Validate all API input.
Sanitize user-provided data.
Use HTTPS.
Protect administrative endpoints.
Restrict database permissions.
Never commit passwords or API keys.
Add proper session management.
Add rate limiting to APIs where required.
🚀 Future Improvements

CampusResQ can be extended with additional functionality.

📱 Mobile Application

Develop Android/iOS applications for students, staff, and emergency responders.

🔔 Real-Time Notifications

Send emergency notifications to:

Administrators
Security personnel
Students
Staff
Emergency responders
📍 GPS Location

Automatically determine the user's campus location while reporting an emergency.

🗺️ Interactive Campus Map

Display:

Buildings
Emergency locations
Responders
Emergency resources

on an interactive campus map.

👨‍🚒 Responder Assignment

Allow administrators to assign specific responders to emergency incidents.

📞 Emergency Hotline Integration

Integrate campus emergency services and external emergency services.

📧 Email and SMS Notifications

Automatically notify relevant personnel when a critical emergency is reported.

🔔 Push Notifications

Provide real-time alerts through browser and mobile push notifications.

📦 Resource Requests

Allow responders to request resources such as:

First Aid Kits
Stretchers
Wheelchairs
Fire Extinguishers
Emergency Radios
📊 Advanced Analytics

Add:

Graphs
Charts
Monthly reports
Emergency trends
Response-time analysis
Building-wise emergency statistics
🤖 AI Emergency Classification

Future versions could automatically classify emergency descriptions into categories such as:

Medical
Fire
Security
Accident
Other
🧑‍💻 Development

After making changes to the project:

npm run dev

Test the application locally at:

http://localhost:3000
🌿 Git Workflow

After making changes:

git status

Add the changes:

git add .

Commit:

git commit -m "Describe your changes"

Push to GitHub:

git push
📦 Production Build

To create a production build:

npm run build

Then start the production server:

npm start
👨‍💻 Author
Anantha

GitHub:

https://github.com/anantha-bit

Project:

https://github.com/anantha-bit/-CampusResQ

📄 License

This project is developed for educational and academic purposes.

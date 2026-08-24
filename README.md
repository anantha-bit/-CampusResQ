🚨 CampusResQ

CampusResQ is a campus emergency management system designed to help
users report emergencies and allow administrators to monitor, manage,
and analyze emergency incidents and response resources.

✨ Features

Emergency reporting and management

Emergency status tracking

Search and filtering by status and priority

Campus location management

Emergency resource management

Reports and analytics dashboard

MySQL database integration

REST API routes through Next.js

Emergency workflow from reporting to resolution

🚦 Emergency Status

CampusResQ uses three emergency statuses:

Status                              Description

ACTIVE                            The emergency has been reported but
response action has not yet
started.

IN PROGRESS                       A response team has started
handling the emergency.

The dashboard automatically updates the number of incidents in each
status.

🔍 Emergency Search & Filtering

Emergency reports can be searched using keywords and filtered by:

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

This helps administrators quickly identify important emergency reports.

🧰 Resource Management

The Resources section manages emergency response resources available
on campus.

Example resources:

Resource ID Resource            Type              Quantity

          1 First Aid Kit       Medical                 17
          2 Fire Extinguisher   Fire Safety             15
          3 Wheelchair          Medical                  5
          4 Stretcher           Medical                  3
          5 Emergency Radio     Communication           10

The Resources page displays:

Resource name

Resource type

Available quantity

Resource ID

Total resources

Medical resources

Fire Safety resources

📍 Campus Locations

The Locations section contains registered emergency response
locations.

Each location includes:

Location ID

Building

Floor

Room / Area

Example locations:

Location ID Building         Floor          Room / Area

          1 Block A          Ground Floor   Main Entrance
          2 Block A          2nd Floor      Room 204
          3 Block B          1st Floor      Computer Lab
          4 Library          Ground Floor   Reading Hall
          5 Sports Complex   Ground Floor   Football Ground
          6 Block A          2nd Floor      Room 305

Emergency reports can only be submitted using registered campus
locations.

📈 Reports & Analytics

The Reports & Analytics section provides:

Response Overview

Emergencies by Type

Emergencies by Priority

Example response overview:

Active       → 20%
In Progress  → 40%
Resolved     → 40%

Example emergency types:

Medical   → 3
Fire      → 1
Security  → 1

Example priorities:

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

                 ┌─────────────────────┐
                 │      User/Admin     │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │     Next.js UI      │
                 │  React + TypeScript │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │     API Routes      │
                 │       Next.js       │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │    MySQL Database   │
                 │    campusresq_db    │
                 └─────────────────────┘

📁 Project Structure

CampusResQ/
│
├── app/
│   ├── api/
│   │   ├── emergencies/
│   │   │   └── route.ts
│   │   ├── locations/
│   │   │   └── route.ts
│   │   ├── resources/
│   │   │   └── route.ts
│   │   └── test-db/
│   │       └── route.ts
│   │
│   ├── emergency-reports/
│   │   └── page.tsx
│   ├── locations/
│   │   └── page.tsx
│   ├── reports/
│   │   └── page.tsx
│   ├── resources/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── lib/
│   └── db.ts
│
├── public/
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
└── README.md

🗄️ Database

CampusResQ uses MySQL.

Database name:

campusresq_db

Database Tables

assignments
emergencies
emergency_details
locations
resource_requests
resources
responders
roles
users

Emergencies Table

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

New emergencies are initially stored with:

ACTIVE

Locations Table

The locations table stores registered campus locations.

Example:

Location ID: 1
Building: Block A
Floor: Ground Floor
Room: Main Entrance

Resources Table

The resources table stores emergency response resources.

Examples:

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

Emergencies

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

Locations

GET /api/locations

Returns all registered campus locations.

Example response:

{
  "success": true,
  "locations": []
}

Resources

GET /api/resources

Returns available emergency resources.

Example response:

{
  "success": true,
  "resources": []
}

Database Testing

GET /api/test-db

This endpoint can be used to verify that the Next.js application can
communicate successfully with MySQL.

⚙️ Installation

Requirements

Install the following before running CampusResQ:

Node.js

npm

MySQL Server

Git

Visual Studio Code

1. Clone the Repository

git clone https://github.com/anantha-bit/-CampusResQ.git
cd -CampusResQ

2. Install Dependencies

npm install

3. Set Up MySQL

Start MySQL Server and open the MySQL command line:

mysql -u root -p

Create the database:

CREATE DATABASE campusresq_db;

Select the database:

USE campusresq_db;

Create/import the required CampusResQ tables.

4. Configure the Database Connection

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

Important: Do not commit your real database password to GitHub.
For production, store database credentials in environment variables.

5. Start the Development Server

npm run dev

Open:

http://localhost:3000

🌐 Application Pages

Page                    URL                     Description

Dashboard               /                     Main emergency
monitoring dashboard

Emergency Reports       /emergency-reports    Emergency report
management

Resources               /resources            Emergency resource
management

Locations               /locations            Registered campus
locations

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

🚨 Report an Emergency

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

The system checks whether the selected location is registered before
creating the emergency.

If the location does not exist in the database, the emergency report
will not be created.

🟠 Start Response

For an active emergency, the administrator can select:

Start Response

The status changes:

ACTIVE → IN PROGRESS

🟢 Mark Resolved

Once the emergency has been handled, the administrator can select:

Mark Resolved

The status changes:

IN PROGRESS → RESOLVED

Dashboard statistics are automatically updated.

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

🔎 Search and Filtering

Emergency reports can be searched using:

Search emergencies...

Reports can be filtered by status:

All Statuses
ACTIVE
IN PROGRESS
RESOLVED

And by priority:

All Priorities
HIGH
MEDIUM
CRITICAL

🛡️ Validation

CampusResQ validates emergency reports before they are created.

Required fields include:

Reported user

Location

Emergency type

Priority

Description

The system also verifies that the selected campus location exists in the
database.

Invalid locations are rejected.

🔐 Security Considerations

Before deploying CampusResQ to production, the following improvements
should be implemented:

Use environment variables for database credentials

Implement user authentication

Implement role-based access control

Validate all API input

Sanitize user-provided data

Use HTTPS

Protect administrative endpoints

Restrict database permissions

Never commit passwords or API keys

Add proper session management

Add API rate limiting where required

🚀 Future Improvements

📱 Mobile Application

Develop Android/iOS applications for students, staff, and emergency
responders.

🔔 Real-Time Notifications

Send emergency notifications to:

Administrators

Security personnel

Students

Staff

Emergency responders

📍 GPS Location

Automatically determine the user's campus location while reporting an
emergency.

🗺️ Interactive Campus Map

Display:

Buildings

Emergency locations

Responders

Emergency resources

on an interactive campus map.

👨‍🚒 Responder Assignment

Allow administrators to assign specific responders to emergency
incidents.

📞 Emergency Hotline Integration

Integrate campus emergency services and external emergency services.

📧 Email and SMS Notifications

Automatically notify relevant personnel when a critical emergency is
reported.

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

Future versions could automatically classify emergency descriptions into
categories such as:

Medical

Fire

Security

Accident

Other

🧑‍💻 Development

After making changes:

npm run dev

Test the application locally at:

http://localhost:3000

🌿 Git Workflow

Check the current changes:

git status

Add changes:

git add .

Commit changes:

git commit -m "Describe your changes"

Push to GitHub:

git push

📦 Production Build

Create a production build:

npm run build

Start the production server:

npm start

👨‍💻 Author

Anantha

GitHub: https://github.com/anantha-bit

Project: https://github.com/anantha-bit/-CampusResQ

📄 License

This project is developed for educational and academic purposes.

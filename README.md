# 🚨 CampusResQ

## Campus Emergency Response System

CampusResQ is a web-based **Campus Emergency Response System** designed to help educational institutions report, monitor, manage, and analyze emergency incidents efficiently.

The system provides administrators with a centralized platform to manage campus emergencies, track their response status, view registered campus locations, monitor available emergency resources, and analyze emergency statistics.

---

# 📌 Table of Contents

- [Overview](#-overview)
- [Objectives](#-objectives)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Application Pages](#-application-pages)
- [Database](#-database)
- [Database Tables](#-database-tables)
- [Emergency Workflow](#-emergency-workflow)
- [API Endpoints](#-api-endpoints)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Using the System](#-using-the-system)
- [Validation](#-validation)
- [Security](#-security)
- [Future Improvements](#-future-improvements)
- [Author](#-author)
- [License](#-license)

---

# 🔎 Overview

CampusResQ provides a centralized emergency management platform for a college or university campus.

Instead of handling emergency reports manually, administrators can use CampusResQ to:

- Report emergencies
- Record emergency locations
- Assign emergency priorities
- Track response progress
- Mark emergencies as resolved
- View available emergency resources
- View registered campus locations
- Analyze emergency statistics

The system uses **Next.js and TypeScript** for the web application and **MySQL** for persistent data storage.

---

# 🎯 Objectives

The main objectives of CampusResQ are:

1. Provide a centralized emergency reporting system.
2. Reduce the time required to report campus emergencies.
3. Maintain accurate campus location information.
4. Allow administrators to monitor emergency incidents.
5. Track emergency response progress.
6. Maintain information about emergency response resources.
7. Provide emergency statistics and analytics.
8. Improve coordination during campus emergencies.
9. Maintain a structured database of emergency incidents.
10. Provide a simple and user-friendly administrative dashboard.

---

# 🚨 Features

## 1. Emergency Reporting

Administrators/users can report a new emergency through the emergency reporting form.

The form contains:

- Emergency Type
- Priority
- Building
- Floor
- Room / Location
- Description

### Emergency Types

The system supports emergency categories such as:

- Medical
- Fire
- Security
- Other

### Priority Levels

Emergencies can be assigned different priority levels:

- HIGH
- MEDIUM
- CRITICAL

---

# 📍 Location Validation

CampusResQ validates the location entered during emergency reporting.

An emergency can only be reported using a **registered campus location**.

For example, registered locations include:

| Location ID | Building | Floor | Room / Area |
|---|---|---|---|
| 1 | Block A | Ground Floor | Main Entrance |
| 2 | Block A | 2nd Floor | Room 204 |
| 3 | Block B | 1st Floor | Computer Lab |
| 4 | Library | Ground Floor | Reading Hall |
| 5 | Sports Complex | Ground Floor | Football Ground |
| 6 | Block A | 2nd Floor | Room 305 |

If a user enters a location that does not exist, the system displays:

```text
This location does not exist.
Please use a registered campus location.

# CivicFix – Intelligent Civic Issue Reporting Platform
> **“See it. Report it. Fix it.”**

CivicFix is a modern smart-city civic problem reporting and routing platform. It empowers citizens to report public hazards—including potholes, overflowing garbage dumps, dark or broken streetlights, potable water pipeline leaks, fallen trees, and damaged road signage. 

The system analyzes each complaint, classifies it, evaluates urgency and public risk to calculate priority, clusters duplicate reports within spatial proximity to elevate severity, routes the task to the responsible municipal department, and tracks real-time progress through to verified photo-resolution.

---

## Key Capabilities

1. **Intelligent Issue Classification & Priority Engine**
   - Rule-based analysis mapped to 6 municipal civic categories:
     - **Road Damage** → Road Maintenance Department
     - **Waste Management** → Sanitation Department
     - **Street Lighting** → Electrical Department
     - **Water Supply** → Water Department
     - **Tree Hazard** → Parks/Maintenance Department
     - **Road Signage** → Traffic/Road Department
   - Contextual priority computation (`Low`, `Medium`, `High`, `Critical`) incorporating public risk, school/hospital proximity, arterial traffic impact, and community duplicate density.
   - Dual-mode AI classification fallback via Google Gemini (`gemini-3.8-flash`).

2. **Spatial Duplicate Clustering**
   - Automatically groups repeated citizen reports within a 350-meter radius into a single active municipal ticket.
   - Corroborates reports (`e.g., "17 citizens reported this issue"`), tracks citizen timestamps, and escalates priority when duplicate density surges.

3. **Multi-Role Experience**
   - **Citizen**: 3-step report wizard (Photo upload/capture, browser geolocation API or map pin, description), real-time status tracker with visual 4-stage timeline, live GIS map, nearby issues feed, and in-app notifications.
   - **Department Staff**: Assigned issues queue, status transition controls (`Reported` → `Assigned` → `In Progress` → `Resolved`), operational notes, resolution proof photo upload, and instant citizen dispatch alerts.
   - **Admin**: City-wide statistics, category distribution donut chart, monthly trends, department workload & resolution SLA analytics, user directory, live system audit logs, and DevOps pipeline explorer.

---

## System Architecture

```
[ Citizen / Staff / Admin ] (React 19 + Tailwind CSS + Lucide + Motion)
          │
          ▼ (HTTP REST / JSON)
[ CivicFix Backend Engine ] (Express.js / Node.js runtime + Spring Boot Reference Architecture)
   ├── Auth Controller (BCrypt hashing, Role-Based Access Control)
   ├── Issue Engine (Rule classifier, spatial clustering, priority matrix)
   ├── Gemini AI Bridge (Contextual safety & severity verification)
   ├── Notification Dispatcher (Real-time in-app alerts)
   └── Analytics Aggregator (Category breakdown, SLA tracking)
          │
          ▼
[ MySQL Database Cluster ] (Tables: users, departments, issues, assignments, issue_reports, notifications)
```

---

## DevOps CI/CD Pipeline

```
Developer ──► Git ──► GitHub ──► Jenkins Pipeline ──► Test ──► Docker Build ──► Container Run ──► Live CivicFix
```

The repository includes:
- `Dockerfile`: Multi-stage, minimal Alpine Linux production container with non-root security execution.
- `docker-compose.yml`: Multi-container orchestration binding MySQL 8.0 with automated schema initialization and the CivicFix application container.
- `Jenkinsfile`: 7-stage automated delivery pipeline:
  1. Checkout Code
  2. Install Dependencies (`npm ci`)
  3. Compile & TypeCheck (`tsc --noEmit`)
  4. Run Tests (`npm test`)
  5. Build Application (`npm run build`)
  6. Build Docker Image (`docker build -t civicfix/app:${BUILD_NUMBER}`)
  7. Deploy Container (`docker run -d --name civicfix-app-live`)
- `database/schema.sql`: Full DDL schema with foreign key constraints, indexes, and Chennai municipal seed data.
- `backend/pom.xml`: Complete Maven build configuration for Spring Boot microservice deployment.

---

## Color Palette & Visual Theme

- **Primary**: Soft Navy Blue (`#1E293B`, `#0F172A`)
- **Secondary**: Muted Royal Blue (`#2563EB`, `#1D4ED8`)
- **Background**: Very Light Blue/Grey (`#F8FAFC`, `#F1F5F9`)
- **Cards**: Pure White (`#FFFFFF`) with subtle border lines (`#E2E8F0`)
- **Status Indicators**:
  - Success / Resolved: Soft Green (`#10B981`)
  - Warning / High: Soft Orange (`#F97316`)
  - Critical: Soft Red (`#EF4444`)
  - Neutral / In Progress: Soft Royal Blue (`#2563EB`)

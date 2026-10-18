# AI-Based Smart Student Academic Management and Early-Warning System

A complete, production-grade, full-stack college academic management and early-warning web application built with **Spring Boot 3 (Java 21)**, **MySQL 8**, **Spring Security (Session-Based with HTTP-Only Cookies)**, and **React (Vite)**.

---

## 📌 1. Project Overview

Academic institutions frequently struggle to identify students at risk of academic failure or attendance shortage before final examinations. This system automates student and faculty academic management while providing an **Early-Warning Diagnostic Engine** that evaluates attendance and assessment marks to flag at-risk students deterministically.

### Highlights:
- **Strict Role-Based Access Control (RBAC)** across Admin, Faculty, and Student roles enforced at the Spring Security method and endpoint levels.
- **Rule-Based Early-Warning Engine** calculating real-time attendance percentages and marks aggregate from the MySQL database, classifying students into `HIGH RISK`, `MEDIUM RISK`, and `LOW RISK`, and generating tailored academic improvement recommendations.
- **Modern Responsive Dashboard** for desktop, tablet, and mobile with color-coded risk indicators, bulk attendance recording, and bulk marks entry.
- **Pre-Configured Demo Data** seeding Admin, Faculty, Subjects, Students, and realistic attendance/marks records out-of-the-box.

---

## 🛠️ 2. Technology Stack

### Backend
- **Language / Runtime:** Java 21 (LTS)
- **Framework:** Spring Boot 3.3.4
- **Security:** Spring Security (HTTP-Only session cookie `ACADEMIC_SESSION_ID`, BCrypt password hashing, method-level `@PreAuthorize`)
- **Persistence:** Spring Data JPA, Hibernate ORM
- **Database:** MySQL 8.0+
- **Build Tool:** Apache Maven 3.8+

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 5
- **Routing:** React Router v6
- **HTTP Client:** Axios (configured with `withCredentials: true`)
- **UI & Icons:** Lucide React, Custom Responsive CSS (Light Theme)

---

## 📊 3. Early-Warning Diagnostic Rules

The system calculates academic risk deterministically from recorded attendance and examination scores:

| Risk Category | Criteria | Recommended Action |
| :--- | :--- | :--- |
| **HIGH RISK** (Red) | Attendance < **75%** OR Marks Aggregate < **40%** | Immediate faculty mentor counseling, mandatory lecture recovery, remedial doubt clearing sessions. |
| **MEDIUM RISK** (Amber) | Attendance < **85%** OR Marks Aggregate < **60%** | Preventive monitoring, office hours consultation, peer study groups. |
| **LOW RISK** (Green) | Attendance ≥ **85%** AND Marks Aggregate ≥ **60%** | Satisfactory standing, maintain consistency, honors participation. |

> Thresholds are fully configurable in `backend/src/main/resources/application.properties` via `app.thresholds.*`.

---

## 👥 4. User Roles & Permissions

1. **ADMIN**
   - View college-wide statistics and departmental analytics.
   - CRUD management for Student accounts, Faculty accounts, and Subjects.
   - Assign students to faculty mentors.
   - Full access to institutional early-warning diagnostic reports.
   - *Restricted:* Cannot record classroom attendance or assign test marks directly.

2. **FACULTY**
   - Access only assigned mentees and courses taught.
   - Record and update classroom attendance (single entry or full-class bulk attendance sheet).
   - Enter and update assessment and examination marks (single entry or bulk score sheet).
   - View attendance history and marks breakdown.
   - Monitor early-warning risk alerts and intervention recommendations for assigned students.

3. **STUDENT**
   - Strictly view **only their own** profile, attendance history, marks breakdown, and risk diagnostics.
   - Access personalized, actionable improvement suggestions.
   - *Security Guard:* Any attempt to access another student's or administrative endpoint returns HTTP `403 Forbidden`.

---

## 🚀 5. Quick Start & Setup Instructions

### Prerequisites
- Java 21 JDK installed (`java -version`)
- Maven 3.8+ installed (`mvn -version`)
- Node.js 18+ and npm installed (`node -v`)
- MySQL Server 8 running on port `3306`

### Step 1: Database Setup
Log into your MySQL command-line client or MySQL Workbench:
```sql
CREATE DATABASE smart_academic_db;
```

### Step 2: Configure Backend Database Credentials
In `backend/src/main/resources/application.properties` (or set environment variables `DB_USERNAME` and `DB_PASSWORD`):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smart_academic_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=Sakshi@13
```

### Step 3: Run the Backend
Open a terminal in `smart-academic-system/backend`:
```bash
mvn clean package -DskipTests
java -jar target/smart-academic-system-backend-1.0.0.jar
```
*The backend starts at `http://localhost:8080`. On first run, it automatically seeds all demo accounts, subjects, attendance, and marks!*

### Step 4: Run the Frontend
Open a new terminal in `smart-academic-system/frontend`:
```bash
npm install
npm run dev
```
*The frontend runs at `http://localhost:5173` with automatic API proxying to port 8080.*

---

## 🔑 6. Pre-Seeded Demo Accounts

You can log in immediately using these credentials or use the **1-Click Demo Buttons** on the login page:

| Role | Email | Password | Persona / Notes |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | `Admin@123` | System Administrator (Full college access) |
| **Faculty** | `dr.sharma@college.edu` | `Faculty@123` | Dr. Rajesh Sharma, Professor (CSE) |
| **Faculty** | `prof.patel@college.edu` | `Faculty@123` | Prof. Anita Patel, Assoc. Prof (CSE) |
| **Faculty** | `dr.verma@college.edu` | `Faculty@123` | Dr. Suresh Verma, Asst. Prof (ECE) |
| **Student (High Risk)** | `rahul.kumar@college.edu` | `Student@123` | Rahul Kumar (Roll: `CS2023001`, Att: ~60%, Marks: ~33%) |
| **Student (Medium Risk)** | `neha.gupta@college.edu` | `Student@123` | Neha Gupta (Roll: `CS2023004`, Att: ~78%, Marks: ~52%) |
| **Student (Low Risk)** | `arjun.nair@college.edu` | `Student@123` | Arjun Nair (Roll: `CS2023007`, Att: ~92%, Marks: ~88%) |

---

## 📡 7. REST API Reference

### Authentication
- `POST /api/auth/login` - Authenticate and establish HTTP-Only session
- `POST /api/auth/logout` - Invalidate session
- `GET /api/auth/me` - Retrieve authenticated user profile

### Dashboard
- `GET /api/dashboard/stats` - Retrieve role-specific dashboard metrics

### Admin Endpoints (`hasRole('ADMIN')`)
- `GET /api/admin/students` - List students (with optional `search` and `department` query)
- `POST /api/admin/students` - Create new student
- `PUT /api/admin/students/{id}` - Update student profile
- `DELETE /api/admin/students/{id}` - Delete student
- `GET /api/admin/faculty` - List faculty
- `POST /api/admin/faculty` - Create new faculty
- `PUT /api/admin/faculty/{id}` - Update faculty
- `DELETE /api/admin/faculty/{id}` - Delete faculty
- `GET /api/admin/subjects` - List all courses
- `POST /api/admin/subjects` - Create course
- `PUT /api/admin/subjects/{id}` - Update course
- `DELETE /api/admin/subjects/{id}` - Delete course
- `GET /api/admin/assignments` - List mentor assignments
- `POST /api/admin/assignments` - Assign student to faculty mentor
- `DELETE /api/admin/assignments/{id}` - Remove assignment
- `GET /api/admin/early-warning/reports` - Generate institutional risk reports

### Faculty Endpoints (`hasAnyRole('FACULTY', 'ADMIN')`)
- `GET /api/faculty/students` - Get assigned students
- `GET /api/faculty/subjects` - Get assigned subjects
- `POST /api/faculty/attendance` - Record single attendance
- `POST /api/faculty/attendance/bulk` - Record attendance for full class date
- `GET /api/faculty/attendance?subjectId={id}&date={date}` - Attendance history
- `POST /api/faculty/marks` - Record individual mark
- `POST /api/faculty/marks/bulk` - Record examination marks for class
- `GET /api/faculty/marks?subjectId={id}` - Marks history
- `GET /api/faculty/early-warning/reports` - Mentee risk diagnostics

### Student Endpoints (`hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')`)
- `GET /api/student/profile` - View own profile
- `GET /api/student/attendance` - View own attendance history
- `GET /api/student/marks` - View own examination scores
- `GET /api/student/early-warning` - View own risk status, deficit metrics, and suggestions

---

## 📁 8. Project Structure

```text
smart-academic-system/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RiskBadge.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── FacultyDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── StudentDashboard.jsx
│   │   ├── services/
│   │   │   ├── adminService.js
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── dashboardService.js
│   │   │   ├── facultyService.js
│   │   │   └── studentService.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── backend/
│   ├── src/main/java/com/college/academic/
│   │   ├── config/
│   │   │   └── DataInitializer.java
│   │   ├── controller/
│   │   │   ├── AdminController.java
│   │   │   ├── AuthController.java
│   │   │   ├── DashboardController.java
│   │   │   ├── FacultyController.java
│   │   │   └── StudentController.java
│   │   ├── dto/
│   │   │   ├── ApiResponse.java
│   │   │   ├── AssignmentDTO.java
│   │   │   ├── AttendanceDTO.java
│   │   │   ├── BulkAttendanceRequest.java
│   │   │   ├── BulkMarksRequest.java
│   │   │   ├── DashboardStatsDTO.java
│   │   │   ├── EarlyWarningReportDTO.java
│   │   │   ├── FacultyDTO.java
│   │   │   ├── LoginRequest.java
│   │   │   ├── MarksDTO.java
│   │   │   ├── StudentDTO.java
│   │   │   ├── SubjectDTO.java
│   │   │   ├── SubjectPerformanceDTO.java
│   │   │   └── UserResponse.java
│   │   ├── entity/
│   │   │   ├── Attendance.java
│   │   │   ├── AttendanceStatus.java
│   │   │   ├── Faculty.java
│   │   │   ├── FacultyStudentAssignment.java
│   │   │   ├── Marks.java
│   │   │   ├── RiskLevel.java
│   │   │   ├── Role.java
│   │   │   ├── Student.java
│   │   │   ├── Subject.java
│   │   │   └── User.java
│   │   ├── exception/
│   │   │   ├── BadRequestException.java
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   ├── ResourceNotFoundException.java
│   │   │   └── UnauthorizedException.java
│   │   ├── repository/
│   │   │   ├── AttendanceRepository.java
│   │   │   ├── FacultyRepository.java
│   │   │   ├── FacultyStudentAssignmentRepository.java
│   │   │   ├── MarksRepository.java
│   │   │   ├── StudentRepository.java
│   │   │   ├── SubjectRepository.java
│   │   │   └── UserRepository.java
│   │   ├── security/
│   │   │   ├── CustomUserDetails.java
│   │   │   ├── CustomUserDetailsService.java
│   │   │   └── SecurityConfig.java
│   │   ├── service/
│   │   │   ├── AdminService.java
│   │   │   ├── AuthService.java
│   │   │   ├── DashboardService.java
│   │   │   ├── EarlyWarningService.java
│   │   │   ├── FacultyService.java
│   │   │   └── StudentService.java
│   │   └── SmartAcademicSystemApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── src/test/java/com/college/academic/
│   │   └── service/
│   │       └── EarlyWarningServiceTest.java
│   ├── Dockerfile
│   ├── pom.xml
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## 📄 License
This project is open-source and intended for educational and academic submission purposes.

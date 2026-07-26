# SRMS — Student Record Management System

A full-stack, role-based academic management platform for schools, colleges, and universities. Admins manage the institution's structure and staff, teachers record attendance and grades, and students track their own academic progress — all from one responsive dashboard.

![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Default Accounts / Seeding](#default-accounts--seeding)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

SRMS models the day-to-day workflow of an academic institution: departments run courses, courses are broken into semesters, semesters contain subjects, and students are enrolled in a course/semester while teachers are attached to a department and assigned subjects. On top of that structure sit attendance tracking, marks entry, and an automatic GPA / grade calculator.

The backend is a REST API built with Express and MongoDB/Mongoose, secured with JWT authentication and role-based access control (RBAC). The frontend is a Vite + React + TypeScript single-page app styled with Tailwind CSS, with charts, CSV import/export, dark mode, and optimistic, toast-driven UX.

## Features

**Authentication & Access Control**
- JWT-based auth (httpOnly cookie + bearer token), bcrypt password hashing
- Role-based authorization: `admin`, `teacher`, `student`
- Protected routes on both the API and the frontend router

**Academic Structure**
- Departments, Courses, Semesters, and Subjects with referential integrity (e.g. a department can't be deleted while it still has courses)

**People Management**
- Full CRUD for Students and Teachers, each backed by a linked login account
- Profile photo upload (Multer, validated file type/size)
- CSV export for students and teachers; CSV bulk-import for students

**Day-to-Day Operations**
- Bulk attendance marking per subject/date, with per-student status (present/absent/late/excused)
- Attendance summaries and percentage calculations (aggregation pipeline)
- Marks entry per exam type (quiz/assignment/midterm/final/practical)
- Automatic grade + GPA calculation per semester (credit-weighted, 10-point scale)

**Dashboards & Analytics**
- Role-specific dashboards (admin/teacher/student) with Recharts visualizations: students by department, status breakdown, enrollment trend, attendance rate

**UX Details**
- Search, sort, and pagination on list views
- Dark mode with persisted preference
- Toast notifications for every mutation
- Loading skeletons instead of blank screens
- Responsive layout (mobile sidebar, adaptive grids)
- Centralized error handling with a consistent JSON error shape
- 404 and 403 (unauthorized) pages

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, React Router, React Hook Form, Axios, Recharts, react-hot-toast, lucide-react |
| Backend    | Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Multer, express-validator |
| Security   | Helmet, CORS, express-mongo-sanitize, xss-clean, express-rate-limit |
| Tooling    | ESLint, nodemon, dotenv |

## Architecture

```
Client (React SPA)  ──HTTP/JSON──▶  Express REST API  ──Mongoose──▶  MongoDB
      │                                    │
      ├─ AuthContext (JWT in localStorage) ├─ authMiddleware (protect / authorize)
      ├─ React Router (protected routes)   ├─ validateMiddleware (express-validator)
      └─ Axios instance w/ interceptors    └─ errorMiddleware (centralized handler)
```

The backend follows a layered structure: **routes → middleware → controllers → models**. Controllers hold business logic and never touch `req`/`res` beyond reading input and sending a response; validation is a dedicated middleware layer using `express-validator`; cross-cutting concerns (auth, rate limiting, sanitization) are wired once in `app.js`.

The frontend separates **pages** (route-level screens), **components** (reusable UI), **context** (auth/theme global state), **hooks** (data-fetching/debounce utilities), and a typed **api** layer so no page constructs a URL string by hand.

## Project Structure

```
student-record-management/
│
├── frontend/
│   ├── src/
│   │   ├── api/            # axios instance + typed endpoint wrappers
│   │   ├── components/     # Navbar, Sidebar, Modal, DataTable pieces, etc.
│   │   ├── context/        # AuthContext, ThemeContext
│   │   ├── hooks/          # useFetch, useDebounce
│   │   ├── pages/          # route-level screens
│   │   ├── types/          # shared TypeScript interfaces
│   │   └── styles/         # Tailwind entrypoint
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── config/         # env config, DB connection
│   │   ├── controllers/    # request handlers / business logic
│   │   ├── middleware/     # auth, error handling, upload, validation
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── utils/          # token generation, CSV helpers, query features, seed script
│   │   └── validators/     # express-validator rule sets
│   ├── uploads/profiles/   # uploaded profile photos (gitignored)
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── screenshots/
├── README.md
├── .gitignore
├── LICENSE
└── .env.example
```

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB connection string — either [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier works) or a local `mongod` instance

### 1. Clone and install

```bash
git clone <your-repo-url> srms
cd srms

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

```bash
# from backend/
cp .env.example .env
# edit .env: set MONGO_URI and JWT_SECRET

# from frontend/
cp .env.example .env
# edit .env: set VITE_API_URL if not using the default
```

### 3. Seed a default admin account (optional but recommended)

```bash
cd backend
npm run seed
```

This creates an admin login, a demo department (Computer Science & Engineering), a demo course (B.Tech CSE), and its semesters — enough to start adding students/teachers immediately.

### 4. Run the app

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

Visit `http://localhost:5173` and log in with the seeded admin account below.

### 5. Build for production

```bash
cd frontend && npm run build   # outputs to frontend/dist
cd backend  && npm start       # serves the API; deploy dist/ behind any static host or the same origin
```

## Environment Variables

**backend/.env**

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | API port | `5000` |
| `CLIENT_URL` | Frontend origin (for CORS) | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/srms` |
| `JWT_SECRET` | Secret used to sign JWTs | a long random string |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `JWT_COOKIE_EXPIRES_DAYS` | Auth cookie lifetime | `7` |
| `MAX_FILE_UPLOAD_MB` | Max avatar upload size | `2` |

**frontend/.env**

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

## Default Accounts / Seeding

After running `npm run seed` in `backend/`:

| Role  | Email | Password |
|-------|-------|----------|
| Admin | `admin@srms.local` | `Admin@123` |

Students created via the admin panel default to password `Student@123`; teachers default to `Teacher@123` (both are overridable at creation time). Encourage users to change these on first login via **Update Password**.

## API Documentation

Base URL: `http://localhost:5000/api`

| Resource | Endpoints |
|---|---|
| **Auth** | `POST /auth/register` · `POST /auth/login` · `POST /auth/logout` · `GET /auth/me` · `PUT /auth/update-password` |
| **Students** | `GET/POST /students` · `GET/PUT/DELETE /students/:id` · `PUT /students/:id/avatar` · `GET /students/export/csv` · `POST /students/import/csv` |
| **Teachers** | `GET/POST /teachers` · `GET/PUT/DELETE /teachers/:id` · `PUT /teachers/:id/avatar` · `GET /teachers/export/csv` |
| **Departments** | `GET/POST /departments` · `GET/PUT/DELETE /departments/:id` |
| **Courses** | `GET/POST /courses` · `GET/PUT/DELETE /courses/:id` |
| **Semesters** | `GET/POST /semesters` · `GET/PUT/DELETE /semesters/:id` |
| **Subjects** | `GET/POST /subjects` · `GET/PUT/DELETE /subjects/:id` |
| **Attendance** | `POST /attendance/bulk` · `GET /attendance` · `GET /attendance/summary/:studentId` · `DELETE /attendance/:id` |
| **Marks** | `POST /marks` · `GET /marks` · `GET /marks/report/:studentId/:semesterId` · `DELETE /marks/:id` |
| **Dashboard** | `GET /dashboard/admin` · `GET /dashboard/teacher` · `GET /dashboard/student` |

All list endpoints accept `?search=&sort=&page=&limit=` query params. All routes except `/auth/register` and `/auth/login` require `Authorization: Bearer <token>` (or the `token` cookie). Responses follow a consistent shape:

```json
{ "success": true, "data": { } }
```

```json
{ "success": false, "message": "Human-readable error", "errors": [ { "field": "email", "message": "..." } ] }
```

## Screenshots

See [`screenshots/`](./screenshots) — add your own captures there and link them in this section once the app is running locally.

## Roadmap

- [ ] Automated tests (Jest + Supertest for the API, Vitest + Testing Library for the client)
- [ ] Email notifications (low attendance, grade posted)
- [ ] Timetable / class-schedule module
- [ ] Fee management module
- [ ] Server-side pagination for the attendance history table

## License

Distributed under the [MIT License](./LICENSE).

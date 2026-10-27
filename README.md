# StaffSync — Modern HR Management System

A learning-ready MERN starter project for employee, attendance, leave, announcements, and training workflows.

## Features
- JWT login and registration with hashed passwords
- Role-based access (`employee`, `manager`, `hr`)
- Employee directory (HR/manager view)
- Attendance check-in/check-out
- Leave requests and HR/manager approval
- Company announcements and training list
- Responsive React dashboard
- MongoDB/Mongoose persistence

> This is a starter/demo project. Before real company use, add production-grade validation, audit logs, rate limiting, email verification, backups, tests, and a security review.

## Requirements
- Node.js 18+ (20 LTS recommended)
- npm
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- VS Code

## 1. Open in VS Code
Extract `StaffSync.zip`, then in VS Code choose **File → Open Folder** and select `staffsync_project`.

## 2. Configure backend
Open a terminal in VS Code:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and set `MONGO_URI` and a long random `JWT_SECRET`.

Windows PowerShell:
```powershell
Copy-Item .env.example .env
```
macOS/Linux:
```bash
cp .env.example .env
```

For a local MongoDB install, the default URI is `mongodb://127.0.0.1:27017/staffsync`.

Start API:
```bash
npm run dev
```
API health check: http://localhost:5000/api/health

## 3. Configure frontend
Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL Vite prints (usually http://localhost:5173).

## 4. Create an account
Use **Create account** on the login screen. The first account is not automatically HR; choose Employee for normal use. For a local demo, create a user and change their role to `hr` in MongoDB, or use the seed script below.

### Seed demo users (optional)
With backend `.env` configured and MongoDB running:
```bash
cd backend
npm run seed
```
Demo credentials:
- HR: `hr@staffsync.demo` / `StaffSync123!`
- Manager: `manager@staffsync.demo` / `StaffSync123!`
- Employee: `employee@staffsync.demo` / `StaffSync123!`

Only use these credentials locally. Change/remove them before deploying publicly.

## 5. Main workflows
- Sign in using one of the demo accounts.
- HR can view employee directory, create announcements/trainings, and review leave requests.
- Manager can review leave requests and see team data.
- Employees can mark attendance, submit leave requests, and view announcements/trainings.
- Attendance records one check-in per user per day; check-out updates that record.

## Troubleshooting
- `MONGO_URI` errors: verify MongoDB is running and the URI is correct.
- Port in use: change `PORT` in backend `.env`; change Vite port in `frontend/vite.config.js`.
- CORS errors: keep the frontend URL aligned with `CLIENT_URL`.
- Login errors: seed users or register a new account.

## Project layout
```text
staffsync_project/
  backend/
    src/models/
    src/routes/
    src/middleware/
    server.js
    seed.js
  frontend/
    src/components/
    src/pages/
    src/App.jsx
    src/api.js
```

## Suggested next steps
1. Add automated tests with Vitest and Supertest.
2. Add pagination and filters to employee and leave lists.
3. Add file uploads for employee documents.
4. Add email notifications.
5. Deploy frontend and backend separately, and use MongoDB Atlas.
6. Add your deployed demo URL and GitHub repository URL to your project submission once they exist.

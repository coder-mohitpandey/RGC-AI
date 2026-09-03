# Railway Complaint Management System — Base Project

A full-stack scaffold: **FastAPI + SQLite** backend, **React (Vite)** frontend, three roles
(User, Admin, Staff), complaint classification/routing, lost & found, and staff progress reports.

This is a working base you can extend — the plumbing (auth, DB, file uploads, routing between
roles) is done; UI styling and some edge cases (pagination, staff directory dropdown, real OTP/SMS,
password reset, etc.) are left for you to build on.

## Project Structure

```
railway-complaint-system/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── database.py        # SQLite engine/session setup
│   │   ├── models.py          # SQLAlchemy models (User, Complaint, Report, LostItem, ...)
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   ├── auth.py            # JWT auth, password hashing, role-based dependencies
│   │   ├── utils/
│   │   │   └── classifier.py  # Category -> priority -> staff_type routing logic
│   │   └── routers/
│   │       ├── auth_router.py
│   │       ├── complaints_router.py
│   │       └── lost_found_router.py
│   ├── uploads/                # complaint/report/lost-item media saved here
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/api.js          # Axios instance w/ JWT interceptor
    │   ├── context/AuthContext.jsx
    │   ├── components/         # Navbar, ProtectedRoute
    │   ├── pages/
    │   │   ├── Login.jsx, Signup.jsx
    │   │   ├── user/           # ComplaintForm, MyComplaints, LostFound, ReportLostItem
    │   │   ├── admin/          # AdminComplaints, VerifyReports, UploadLostItem
    │   │   └── staff/          # StaffComplaints
    │   ├── App.jsx             # Routes
    │   └── index.css
    └── package.json
```

## How it works (matches the workflow you described)

1. **User** signs up/logs in with PNR *or* phone + password.
2. User fills the complaint form: picks one of the 6 categories, optional description, media,
   train/coach/seat, submits.
3. Backend auto-assigns **priority** and a **recommended staff_type** based on category
   (`app/utils/classifier.py`) and generates a unique complaint number (`CMP-XXXXXXXX`).
4. **Admin** sees complaints sorted by priority, opens details (incl. media), assigns to a staff
   member.
5. **Staff** sees their assigned complaints, marks "in progress", then submits a report (with
   optional proof media) when done.
6. **Admin** verifies the report — approve (closes complaint, marks verified) or reject (sends
   back to staff to redo).
7. **User** sees live progress + the staff's report on their "My Complaints" page.
8. **Lost & Found**: Admin publishes found items (with photo); users search/browse and go claim
   in person at the listed station. Users can also separately file a "lost item" report.

## Classification & Routing Logic

Defined in `backend/app/utils/classifier.py`:

| Category | Priority | Routed to |
|---|---|---|
| Public nuisance (screaming, brawling) | High | Guard |
| Unknown passenger occupying seat/corridor | High | Guard |
| Hygiene & cleanliness | Medium | Cleaning crew |
| Food related | Medium | Management *(not explicitly specified in your notes — adjust if needed)* |
| Staff related | Medium | Management |
| Non-urgent | Low | Management |

Edit the `CATEGORY_PRIORITY` / `CATEGORY_STAFF_MAP` dicts to change this anytime.

## Running it locally

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API runs at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

A default admin account is auto-created on first run:
- **phone:** `9999999999`
- **password:** `admin123`

To create staff accounts (guards/cleaning crew/management), use the `/auth/create-staff`
endpoint (admin-only) — easiest via the Swagger UI at `/docs`, or build an admin "create staff"
page in the frontend (not yet included — the base only has a numeric staff-ID input when
assigning complaints).

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`.

## Notes on things intentionally simplified (your next edits)

- **OTP**: `/auth/send-otp` and `/auth/verify-otp` are stubs — real backend logic exists but
  actual SMS sending is a `print()` for now. Wire up Twilio/MSG91/etc. and call verify-otp before
  allowing signup/login if you want it enforced (currently it's optional/unused in the flow).
- **Database**: SQLite file (`railway_complaints.db`), created automatically — good for a
  "temporary database" as you asked. Swap the URL in `database.py` for Postgres/MySQL later.
- **Admin staff picker**: currently a plain numeric staff-ID text box. Add a
  `GET /auth/staff-list` endpoint + dropdown for a nicer UX.
- **Notifications**: no email/SMS notifications on status change yet — add as needed.
- **Security**: change `SECRET_KEY` in `auth.py` before deploying anywhere real, and restrict
  CORS origins in `main.py`.

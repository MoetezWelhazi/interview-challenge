# My Solution

## Overview

This repository implements the Oxyera async interview challenge as a full-stack TypeScript application using **NestJS** (backend) and **Next.js** (frontend).  
All requirements are met, including CRUD operations, validation, calculation logic, and a clear, functional UI.

---

## How to Run

### Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```
- Runs on [http://localhost:8080](http://localhost:8080)
- Uses SQLite database at `backend/database.sqlite`

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- Runs on [http://localhost:3000](http://localhost:3000)
- Connects to backend via a global constant (`constants.ts`)

---

## Features

- **Patients:** Create, update, delete, and list patients (with date of birth validation).
- **Medications:** Create, update, delete, and list medications.
- **Assignments:** Assign medications to patients with start date and duration; view, update, and delete assignments.
- **Remaining Days:** Automatically calculates and displays remaining treatment days for each assignment.
- **Validation:** All input is validated (required fields, valid dates, unique names, etc.).
- **Testing:** Includes unit tests for calculation logic and end-to-end tests for all major backend endpoints.
- **UI:** Responsive, accessible, and styled with Tailwind CSS. All forms and lists are functional and user-friendly.

---

## API Endpoints

**Patients**
- `POST /patients` – Create patient
- `GET /patients` – List patients
- `GET /patients/:id` – Get patient
- `PATCH /patients/:id` – Update patient
- `DELETE /patients/:id` – Delete patient
- `GET /patients/:patientId/assignments/remaining-days` – List assignments with remaining days for a patient

**Medications**
- `POST /medications` – Create medication
- `GET /medications` – List medications
- `GET /medications/:id` – Get medication
- `PATCH /medications/:id` – Update medication
- `DELETE /medications/:id` – Delete medication

**Assignments**
- `POST /assignments` – Assign medication to patient
- `GET /assignments` – List assignments
- `GET /assignments/remaining-days` – List all assignments with remaining days
- `PATCH /assignments/:id` – Update assignment
- `DELETE /assignments/:id` – Delete assignment

---

## Design Decisions

- **TypeScript** is used throughout for type safety.
- **Validation** is enforced both in DTOs and with custom validators (e.g., no future DOB).
- **Separation of concerns:** Each entity (Patient, Medication, Assignment) has its own module, service, and controller.
- **UI/UX:** The frontend uses a master-detail pattern for patients and modals for forms, ensuring a smooth workflow.
- **Testing:** Core logic (remaining days calculation) is unit tested; backend endpoints have e2e tests; frontend has component tests.

---

## How to Run Tests

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

---

## Known Issues / Limitations

- No authentication is implemented (per challenge scope).
- The UI is minimal by design, focusing on functionality and clarity.

---

## Contact

For any questions, please contact me at [welhazi.moetez@gmail.com].

--- 
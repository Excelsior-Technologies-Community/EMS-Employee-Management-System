# EMS — Admin Panel

Management console for Admin / HR / Manager roles. Runs entirely on **mock
data** for now — no backend required to explore the UI.

## Stack
React 19 · Vite · MUI v7 · React Router DOM · Axios (wired but unused) ·
React Hook Form · React Hot Toast · Context API

## Setup

```bash
npm install
npm run dev
```

Runs on `http://localhost:5174` (Frontend employee app uses 5173, so both
can run side by side).

## Demo Logins

No backend is connected — `utils/mockData.js` is an in-memory "database"
that resets on page refresh. Use these on the Login screen (or tap the
chips there to autofill):

| Role    | Email            | Password   |
|---------|------------------|------------|
| Admin   | admin@ems.com    | admin123   |
| HR      | hr@ems.com       | hr123      |
| Manager | manager@ems.com  | manager123 |

## Role-Based Access

| Feature              | Admin | HR  | Manager |
|-----------------------|:---:|:---:|:-------:|
| Dashboard              | ✔ | ✔ | ✔ |
| View Employees         | ✔ | ✔ | ✔ |
| Add / Edit Employee    | ✔ | ✔ | ✖ |
| Toggle Employee Status | ✔ | ✔ | ✖ |
| Delete Employee        | ✔ | ✖ | ✖ |
| Departments (full CRUD)| ✔ | ✖ | ✖ |
| Roles (add)            | ✔ | ✖ | ✖ |
| Profile / Change Password | ✔ | ✔ | ✔ |

Enforced in two places, matching how the real backend does it:
- **Sidebar** (`layouts/Sidebar.jsx`) only lists pages the role can see.
- **Routes** (`routes/AppRoutes.jsx` + `ProtectedRoute`) redirect to
  `/unauthorized` if someone lands on a URL directly without permission.
- **Page-level buttons** (Add/Edit/Delete/status toggle) check `hasRole()`
  from `AuthContext` before rendering — matches the real app's pattern of
  defense in depth (UI hide + route guard), though remember: real
  enforcement always has to live on the backend too.

## Swapping in the real backend later

Every service function (`services/employeeService.js`,
`departmentService.js`, `roleService.js`, `authService.js`) already returns
the exact `{ data: { success, data, message } }` shape the real EMS
backend uses. To connect it for real:

1. Set `VITE_API_URL` in `.env` (see `.env.example`).
2. In each service file, replace the mock-data logic with calls through
   `services/api.js` (the axios instance — already has JWT interceptor +
   401 auto-logout wired up, just unused right now).
3. No page or component needs to change — they only ever call the service
   functions, never the mock data directly.

## Design

Same design system as the Employee Portal (`Frontend/`) — deep indigo-navy
`#26335C` + amber `#E8A33D` accent, Space Grotesk/Inter/JetBrains Mono —
so the two apps read as one product. Tokens live in `src/theme/colors.js`.

# EMS — Employee Portal (Frontend)

Employee-only React app. Handles login, dashboard, viewing/editing your own
profile, and changing your password. Talks to the existing EMS backend.

## Stack
React 19 · Vite · MUI v7 · React Router DOM · Axios · React Hook Form · Context API

## Setup

```bash
npm install
cp .env.example .env   # then set VITE_API_URL to your backend URL
npm run dev
```

Runs on `http://localhost:5173` by default. Backend is expected at
`http://localhost:5000/api` (change via `.env`).

## Notes

- **Employee-only**: Login checks `user.role === 'Employee'`. Admin/HR/Manager
  accounts are rejected here with a message pointing to the Admin app.
- **Auth**: JWT stored in `localStorage` under `ems_token` / `ems_user`
  (namespaced so it won't collide with the separate Admin app on the same
  browser/device).
- **Session expiry**: the axios response interceptor auto-clears storage and
  redirects to `/login` on any 401 from the API.
- Design tokens live in `src/theme/colors.js` — change palette/gradients there.

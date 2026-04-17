# react-ts-auth-base

A minimal, secure React TypeScript boilerplate with JWT authentication. Designed to connect to a FastAPI backend that authenticates against Active Directory. Use this as a starting point for internal web apps so you don't have to rebuild auth from scratch.

## Stack

- [Vite](https://vitejs.dev/) — build tool and dev server
- React 19 + TypeScript (strict mode)
- [react-router-dom v7](https://reactrouter.com/) — routing and protected routes
- Native `fetch` — no axios

## Getting Started

**Prerequisites:** Node.js 18+

```bash
npm install
cp .env.local.example .env.local   # then edit with your backend URL
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment Variables

Create a `.env.local` file (gitignored):

```env
VITE_API_BASE_URL=http://your-backend-server:8000
```

The dev server runs on `http://localhost:5173`. Your FastAPI backend must allow that origin during development via `CORSMiddleware`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["POST"],
    allow_headers=["Authorization", "Content-Type"],
)
```

In production, CORS is not needed if the frontend and backend are served from the same origin (e.g. behind the same nginx reverse proxy).

## Project Structure

```
src/
  api/
    auth.ts           # POST /auth/login (unauthenticated)
    client.ts         # apiFetch — attaches Bearer token, handles 401
  auth/
    tokenStorage.ts   # single point of control for token read/write/clear
    authReducer.ts    # auth state machine
    AuthContext.tsx   # AuthContext + useAuth() hook
    AuthProvider.tsx  # context provider
    PrivateRoute.tsx  # redirects unauthenticated users to /login
  pages/
    LoginPage.tsx     # login form
    Dashboard.tsx     # placeholder protected page
  types/
    auth.ts           # shared TypeScript types
  App.tsx             # router + route definitions
```

## Auth Flow

1. User submits username + password on `/login`
2. Frontend calls `POST {VITE_API_BASE_URL}/auth/login` with `{ username, password }`
3. Backend validates against AD and returns `{ access_token, token_type: "bearer" }`
4. Token is stored in memory (primary) and `sessionStorage` (restored on page refresh)
5. All subsequent API calls via `apiFetch` include `Authorization: Bearer <token>`
6. Any `401` response clears the token and redirects to `/login`
7. Logging out clears the token from memory and `sessionStorage`

## Backend Contract

The FastAPI backend must expose:

```
POST /auth/login
Content-Type: application/json

{ "username": "string", "password": "string" }

→ 200 { "access_token": "string", "token_type": "bearer" }
→ 401 on invalid credentials
```

Recommended backend settings for security:
- Set a short JWT expiry (15–60 minutes)
- Enforce HTTPS at the reverse proxy (nginx/IIS)
- Restrict CORS to your internal origins only

## Adding Protected Pages

Nest new routes under `<PrivateRoute />` in [`src/App.tsx`](src/App.tsx):

```tsx
<Route element={<PrivateRoute />}>
  <Route path="/" element={<Dashboard />} />
  <Route path="/settings" element={<Settings />} />  {/* add here */}
</Route>
```

## Making Authenticated API Calls

Use `apiFetch` from `src/api/client.ts` — it automatically attaches the Bearer token and redirects to `/login` on `401`:

```ts
import { apiFetch } from '@/api/client'

const data = await apiFetch<MyResponseType>('/some/endpoint')
const result = await apiFetch<MyResponseType>('/resource', {
  method: 'POST',
  body: JSON.stringify(payload),
})
```

## Token Storage

Tokens are held in a module-level variable (in-memory) and mirrored to `sessionStorage` so sessions survive page refreshes. `sessionStorage` is tab-scoped and clears when the browser tab is closed.

To upgrade to `httpOnly` cookies (the most secure option) once your backend supports `Set-Cookie`, the only file to change is [`src/auth/tokenStorage.ts`](src/auth/tokenStorage.ts).

## Security Notes

This architecture is appropriate for internal network apps that are not exposed to the internet. Key points:

- React's JSX escaping prevents XSS from rendered content — never use `dangerouslySetInnerHTML`
- CSRF is not a concern with Bearer tokens in headers (only relevant for cookie-based auth)
- Error messages are always generic ("Invalid credentials.") — API errors are never surfaced to the UI
- HTTPS **must** be enforced at the infrastructure level (reverse proxy)

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at http://localhost:5173 |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across all source files |

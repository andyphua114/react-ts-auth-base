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

The dev server runs on `http://localhost:5173`. Your FastAPI backend must allow that origin with credentials support via `CORSMiddleware`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # add production internal URL here
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
    allow_credentials=True,   # required — frontend uses credentials: "include"
)
```

`allow_credentials=True` is required because this frontend sends `credentials: "include"` on every request so the browser transmits the httpOnly session cookie. This also means `allow_origins` must be an explicit list — `"*"` is not permitted by browsers when credentials are involved.

In production, CORS is not needed if the frontend and backend are served from the same origin (e.g. behind the same nginx reverse proxy).

## Project Structure

```
src/
  api/
    auth.ts           # login, refresh, logout API calls
    client.ts         # createAuthorizedFetch — Bearer token + 401 retry with refresh
  auth/
    authReducer.ts    # auth state machine (loading / authenticated / unauthenticated)
    AuthContext.tsx   # AuthContext + useAuth() hook
    AuthProvider.tsx  # context provider — bootstrap, token refresh, authenticatedFetch
    PrivateRoute.tsx  # redirects unauthenticated users to /login
  pages/
    LoginPage.tsx     # login form
    Dashboard.tsx     # placeholder protected page
  types/
    auth.ts           # shared TypeScript types
  config.ts           # API base URL + endpoint path constants
  App.tsx             # router + route definitions
```

## Auth Flow

1. **Bootstrap** — on every page load, `AuthProvider` calls `POST /auth/refresh`. If the server returns a valid session (via httpOnly cookie), the access token is stored in memory and the user is shown their page. If not, they are redirected to `/login`.
2. **Login** — user submits credentials → `POST /auth/login` → server validates against AD, sets an httpOnly session cookie, and returns `{ access_token, user }` in the response body.
3. **API calls** — use `authenticatedFetch` from `useAuth()`. It attaches `Authorization: Bearer <token>` and sends `credentials: "include"` so the session cookie rides along.
4. **Token refresh** — if any API call returns `401`, `authenticatedFetch` automatically calls `POST /auth/refresh`, retries the request once with the new token, and falls back to logout if the refresh also fails. Concurrent refresh requests are deduplicated.
5. **Logout** — calls `POST /auth/logout` to clear the server-side session cookie, then clears all local auth state.

## Backend Contract

The FastAPI backend must expose three endpoints:

```
POST /auth/login
  Body:     { "username": "string", "password": "string" }
  Response: 200 { "access_token": "...", "token_type": "bearer", "user": { ... } }
  Cookie:   Set-Cookie: session=...; HttpOnly; SameSite=Strict; Secure; Path=/

POST /auth/refresh
  Cookie:   session cookie (sent automatically by browser)
  Response: 200 { "access_token": "...", "token_type": "bearer", "user": { ... } }
            401 if cookie is missing or expired

POST /auth/logout
  Cookie:   session cookie (sent automatically by browser)
  Response: 204 No Content
  Cookie:   clears the session cookie
```

The `user` object shape:
```json
{
  "id": "string",
  "username": "string",
  "displayName": "string (optional)",
  "roles": ["string"]
}
```

Recommended backend settings:
- Short access token expiry (15–60 minutes) — the refresh flow handles silent renewal
- `SameSite=Strict` on the session cookie — prevents CSRF
- `Secure` on the session cookie — requires HTTPS (enforce at nginx/IIS level)
- Restrict CORS `allow_origins` to your actual internal origins

## Adding Protected Pages

Nest new routes under `<PrivateRoute />` in [`src/App.tsx`](src/App.tsx):

```tsx
<Route element={<PrivateRoute />}>
  <Route path="/" element={<Dashboard />} />
  <Route path="/settings" element={<Settings />} />  {/* add here */}
</Route>
```

## Making Authenticated API Calls

Get `authenticatedFetch` from `useAuth()` — it attaches the Bearer token, sends the session cookie, and handles token refresh on 401 transparently:

```ts
const { authenticatedFetch } = useAuth()

const res = await authenticatedFetch('/some/endpoint')
const data = await res.json()

const res2 = await authenticatedFetch('/resource', {
  method: 'POST',
  body: JSON.stringify(payload),
})
```

## Token Storage

- **Session cookie** (httpOnly) — managed entirely by the server. Set on login, cleared on logout. The browser sends it automatically; JS cannot read it. This is what keeps the user's session alive across page refreshes.
- **Access token** (in-memory only) — returned by `/auth/login` and `/auth/refresh`, stored in a `useRef` inside `AuthProvider`. Never written to `localStorage` or `sessionStorage`. Lost on page refresh — recovered via the bootstrap refresh call.

## Security Notes

This architecture is appropriate for internal network apps that are not exposed to the internet. Key points:

- The httpOnly session cookie is inaccessible to JS — XSS cannot steal it
- The in-memory access token is short-lived; if stolen via XSS, it cannot be refreshed without the cookie
- CSRF is mitigated by `SameSite=Strict` on the session cookie (set server-side)
- React's JSX escaping prevents XSS from rendered content — never use `dangerouslySetInnerHTML`
- Error messages are always generic ("Invalid credentials.") — API errors are never surfaced to the UI
- HTTPS **must** be enforced at the infrastructure level (reverse proxy); set `Secure` on the session cookie

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at http://localhost:5173 |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across all source files |

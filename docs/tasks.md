# Tasks – Mini Payment Gateway API

> Focus: **Security first**, then correctness, then DX/clean architecture.

---

## 0. Project Setup & Tooling

- [ x] Initialize monorepo / repo structure
  - [ ] Create root folder structure:
    - [x] `/backend`
    - [x] `/frontend`
    - [x] `/API_DOCS`
    - [x] `/docs` (for ARCHITECTURE.md, SECURITY.md)
  - [x] Initialize separate `package.json` in `/backend` and `/frontend`
  - [x] Add root `.editorconfig`, `.prettierrc`, `.eslintrc`, `.gitignore`

- [ ] Choose & configure core tooling
  - [x] TypeScript for backend & frontend
  - [x] ESLint + Prettier + TypeScript configs
  - [x] Install Husky + lint-staged (optional but recommended) for pre-commit checks
  - [x] Setup basic `README.md` skeleton with sections required by the assignment

- [x] Environment & config
  - [x] Create `/backend/.env.example` with:
    - [x] `NODE_ENV`, `PORT`
    - [x] `MONGODB_URI`
    - [x] `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
    - [x] `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY`
    - [x] `ENCRYPTION_KEY` (for AES-GCM)
    - [x] `HMAC_DEFAULT_ALGO=sha256`
    - [x] `CORS_ALLOWED_ORIGINS`
    - [x] `RATE_LIMIT_AUTH_WINDOW`, `RATE_LIMIT_AUTH_MAX`
  - [x] Implement centralized config loader (no direct `process.env` usage)

---

## 1. Backend – Core Application Setup

- [x] Initialize backend project
  - [x] `npm init -y` in `/backend`
  - [x] Install core deps:
    - [x] `express`, `cors`, `helmet`, `cookie-parser`, `compression`
    - [x] `jsonwebtoken`, `bcryptjs` or `argon2`
    - [x] `mongoose`
    - [x] `express-rate-limit`
    - [x] `express-validator` or `zod` + custom middleware
    - [x] `crypto` (built-in) wrapper utilities
  - [x] Install dev deps:
    - [x] `typescript`, `ts-node-dev`
    - [x] `@types/express`, `@types/jsonwebtoken`, `@types/node`, etc.
    - [x] `jest`, `ts-jest`, `supertest` for tests

- [x] Express app bootstrap
  - [x] `src/app.ts` – create express app with:
    - [x] security middleware: `helmet`, `cors`, `compression`
    - [x] JSON body parser with size limit
    - [x] `cookie-parser`
    - [x] Centralized error handler
  - [x] `src/server.ts` – http server + MongoDB connection

- [x] MongoDB connection & models
  - [x] Setup Mongoose connection helper
  - [x] Define **User** model
  - [x] Define **Merchant** model
  - [x] Define **Transaction** model
  - [x] Add required indexes

---

## 2. Backend – Security Utilities & Middleware

- [x] Crypto & password utils
  - [x] Password hashing & verification
  - [x] HMAC signature generation & verification helpers
  - [x] Field encryption helper (AES-GCM) for `api_secret`
  - [x] Safe random ID / key generator for `api_key` & `api_secret`

- [x] JWT handling
  - [x] Utility functions:
    - [x] `generateAccessToken(user)`
    - [x] `generateRefreshToken(user, jti)`
    - [x] `verifyAccessToken(token)`
    - [x] `verifyRefreshToken(token)`
  - [x] Refresh token persistence:
    - [x] Create `RefreshToken` model (or embed in User)
    - [x] Store **hashed** refresh token with `jti`, `userId`, `expiresAt`, `revoked`
    - [x] Implement reuse detection & invalidation

- [x] Validation & sanitization middleware
  - [x] Request validation using `zod` or `express-validator`
  - [x] Central `validateRequest` middleware
  - [x] Central sanitization for strings (trim, escape where needed)

- [x] Rate limiting & abuse prevention
  - [x] Apply strict rate limit on auth endpoints (IP-based)
  - [x] General rate limit on merchant APIs
  - [x] Optional: add `slow-down` on repeated failures

- [x] Auth middlewares
  - [x] `requireAuth` (access token)
  - [x] `requireMerchant` (user with merchant role)
  - [x] `requireApiKey` (for merchant APIs)
  - [x] HMAC verification middleware for signed requests

- [x] CORS & HTTPS readiness
  - [x] Configurable CORS (allow specific frontend origin only)
  - [x] `app.set('trust proxy', 1)` for proxy scenarios
  - [x] Document HTTPS expectations (reverse proxy / TLS termination)

---

## 3. Backend – User Authentication Flows

- [x] Auth routes: `POST /auth/register`
  - [x] Validate payload (email, password)
  - [x] Hash password
  - [x] Create user with `role=user`
  - [x] Generate email verification token (simple or signed)
  - [x] Mock email send (log to console or store in DB)
  - [x] Return safe success response

- [x] Email verification: `GET /auth/verify-email?token=...`
  - [x] Verify token
  - [x] Mark user as verified
  - [x] Handle expired/invalid token gracefully

- [x] Login: `POST /auth/login`
  - [x] Validate input
  - [x] Verify email & password
  - [x] Check `emailVerified` & user status
  - [x] Generate access + refresh tokens
  - [x] Store hashed refresh token
  - [x] Return tokens (access in body, refresh via httpOnly cookie or body based on design)

- [x] Refresh token: `POST /auth/refresh`
  - [x] Verify refresh token (cookie/header)
  - [x] Check DB for token, `revoked` flag and `expiresAt`
  - [x] Issue new access token (and optionally new refresh token + token rotation)

- [x] Logout: `POST /auth/logout`
  - [x] Revoke refresh token in DB
  - [x] Clear refresh token cookie (if cookie based)
  - [x] Return success

---

## 4. Backend – Merchant Management

- [x] Merchant creation: `POST /merchants`
  - [x] Protected by `requireAuth`
  - [x] Validate merchant data (`business_name`, etc.)
  - [x] Generate `api_key` + `api_secret`
    - [x] Encrypt `api_secret` at rest before saving
  - [x] Store merchant mapping to `user_id`
  - [x] Return **only** `api_key` and `api_secret` once (masked later)

- [x] Merchant list & details
  - [x] `GET /merchants/me` – get merchant info for logged-in user
  - [x] Return masked `api_key`, never return raw `api_secret`

- [x] API key rotation: `POST /merchants/:id/rotate-key`
  - [x] Generate new `api_key` + `api_secret`
  - [x] Mark previous key as `deprecated` with grace period OR immediate revocation
  - [x] Store previous keys if needed, or just overwrite & invalidate all previous
  - [x] Return new credentials safely once

- [x] HMAC signing standardization
  - [x] Define canonical string format for signature
  - [x] Implement helper on backend & document in API_DOCS
  - [x] Enforce signature validation on transaction endpoints used by merchants

---

## 5. Backend – Transactions & Webhooks

- [x] Checkout session creation: `POST /transactions/checkout`
  - [x] Auth via API key + HMAC
  - [x] Validate amount, currency, customer_email, metadata
  - [x] Create transaction with `status="PENDING"`
  - [x] Store incoming request signature
  - [x] Return checkout session data (id, amount, status)

- [x] Process payment (mock): `POST /transactions/:id/process`
  - [x] Auth via API key + HMAC
  - [x] Validate transaction ownership by merchant
  - [x] Mock payment result (success/failure)
  - [x] Update transaction status + timestamp(s)
  - [x] Trigger webhook notification (if webhook URL configured for merchant)

- [x] Fetch transaction history:
  - [x] `GET /transactions` – merchant scoped
    - [x] Filters: date range, status, amount range
  - [x] `GET /transactions/:id` – transaction details

- [x] Webhook endpoint: `POST /webhooks/transaction-status`
  - [x] For this project, create endpoint **for consumers** or simulated external service
  - [x] Validate body and optional signature
  - [x] Document expected payload

- [x] Aggregation queries (Mongo)
  - [x] Aggregation 1: Merchant analytics
    - [ ] total transactions, total amount, success rate
  - [ ] Aggregation 2: Daily / monthly transaction stats (for charting on dashboard)

---

## 6. Backend – Security Hardening & Error Handling

- [ ] Global error handling
  - [ ] Convert thrown errors to standardized API responses
  - [ ] Hide stack traces & internal messages in production
  - [ ] Map errors to specific HTTP codes (401, 403, 422, 429, 500)

- [x] Logging
  - [x] Implement structured logging (minimal, using `console` or a logger)
  - [x] Ensure no secrets (passwords, tokens, api_secret, HMAC signatures) are logged

- [ ] XSS & injection prevention
  - [ ] Use parameterized queries (via Mongoose – default)
  - [ ] Disable or validate any fields that could store HTML
  - [ ] Escape or sanitize user-provided strings where necessary

- [ ] Security checklist cross-check (for SECURITY.md)
  - [ ] Confirm each bullet:
    - [ ] Password hashing
    - [ ] JWT expiry
    - [ ] Sensitive data masking
    - [ ] Rate limiting
    - [ ] Input validation
    - [ ] HMAC verification
    - [ ] No secret logging
    - [ ] Injection, XSS protections
    - [ ] Error handling
    - [ ] HTTPS readiness
    - [ ] Env usage
    - [ ] CORS config

---

## 7. Backend – Tests

- [ ] Setup Jest config & test environment
- [ ] Write unit tests (minimum 5; aim for more):
  - [ ] Test password hashing & verification
  - [ ] Test HMAC signature generation & verification
  - [ ] Test request validation (valid vs invalid payload)
  - [ ] Test JWT auth middleware (valid token, expired, invalid)
  - [ ] Test API-key + HMAC-protected route access
- [ ] Optional: Integration tests using `supertest` for key flows

---

## 8. Frontend – Setup & Auth Flows

- [x] Initialize Next.js app (TS)
  - [x] Install deps: `next`, `react`, `react-dom`, `axios` (or fetch wrapper), `zod`, `react-hook-form`/`formik`
  - [x] Configure basic layout, `_app.tsx` or App Router structure

- [x] Authentication UI
  - [x] Register page `/auth/register`
  - [x] Login page `/auth/login`
  - [x] Handle email verification feedback page
  - [x] Implement auth context / store
  - [x] Store access token (in memory or secure storage)
  - [x] Use refresh token via httpOnly cookie (handled by backend) – call `/auth/refresh` on app load

- [x] Protected routes
  - [x] Implement HOC or middleware pattern to protect dashboard routes
  - [x] Redirect unauthenticated users to login

---

## 9. Frontend – Merchant Dashboard

- [x] Dashboard layout
  - [x] Responsive layout (sidebar + content on desktop, stacked on mobile)
  - [x] Common components: Navbar, Sidebar, Card, Table, Spinner, Toasts

- [ ] API credentials page
  - [ ] View merchant `api_key` (masked by default)
  - [ ] One-time `api_secret` display after creation/rotation if API supports it
  - [ ] Copy-to-clipboard buttons
  - [ ] Clear disclaimer about not exposing secrets

- [ ] Transactions list
  - [ ] List with pagination or virtual scrolling
  - [ ] Filters: date range, status, min/max amount
  - [ ] Column sort for date/amount

- [ ] Transaction detail view
  - [ ] Read-only view of transaction attributes
  - [ ] Show signature (masked) & metadata

- [ ] Simple analytics dashboard
  - [ ] Cards: total transactions, total amount, success rate
  - [ ] Small chart (line/bar) using pre-computed/aggregated data from backend

---

## 10. Frontend – Demo Checkout Page

- [ ] Public/merchant-embedded demo page
  - [ ] Form: amount, currency, customer email, optional metadata
  - [ ] Call backend `checkout` endpoint (simulate as merchant or internal)
  - [ ] Show loading states & error messages
  - [ ] Poll or re-fetch transaction status from backend
  - [ ] Show final status with clear UI

---

## 11. Frontend – UX, Validation & Error Handling

- [ ] Client-side validation using `zod` + form library
- [ ] Consistent error component for API errors
- [ ] Global loading indicator or per-form loading states
- [ ] Responsive styling (mobile-first)
- [ ] Handle token expiry (auto refresh or logout + message)

---

## 12. API Documentation

- [ ] Create Postman collection or Swagger/OpenAPI spec in `/API_DOCS`
  - [ ] Document all auth endpoints
  - [ ] Merchant endpoints
  - [ ] Transaction endpoints
  - [ ] Webhook endpoint
  - [ ] Include example HMAC signature code snippet (JS) and sample headers

---

## 13. DevOps & Docker (Bonus)

- [ ] Dockerfile for backend
  - [ ] Multi-stage build (builder + production)
- [ ] Dockerfile for frontend
  - [ ] Build static assets & serve using Node or nginx
- [ ] `docker-compose.yml`
  - [ ] `backend`, `frontend`, `mongodb`, `mongo-express` (optional)
- [ ] GitHub Actions
  - [ ] On push to main:
    - [ ] Install deps
    - [ ] Run lint & tests
    - [ ] Build backend & frontend

---

## 14. Documentation Files

- [ ] `README.md`
  - [ ] Overview, tech choices, setup instructions
  - [ ] How to run tests
  - [ ] Example API usage, including HMAC
  - [ ] Known limitations & future improvements

- [ ] `ARCHITECTURE.md`
  - [ ] System diagram
  - [ ] Models & collections
  - [ ] Key flows (auth, checkout, webhook)
  - [ ] Scalability notes

- [ ] `SECURITY.md`
  - [ ] Security measures list
  - [ ] Threat model
  - [ ] HMAC design explanation
  - [ ] Sensitive data handling
  - [ ] “With more time, I would add…”


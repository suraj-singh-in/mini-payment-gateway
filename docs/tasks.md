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
  - [ ] Initialize separate `package.json` in `/backend` and `/frontend`
  - [ ] Add root `.editorconfig`, `.prettierrc`, `.eslintrc`, `.gitignore`

- [ ] Choose & configure core tooling
  - [ ] TypeScript for backend & frontend
  - [ ] ESLint + Prettier + TypeScript configs
  - [ ] Install Husky + lint-staged (optional but recommended) for pre-commit checks
  - [ ] Setup basic `README.md` skeleton with sections required by the assignment

- [ ] Environment & config
  - [ ] Create `/backend/.env.example` with:
    - [ ] `NODE_ENV`, `PORT`
    - [ ] `MONGODB_URI`
    - [ ] `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
    - [ ] `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY`
    - [ ] `ENCRYPTION_KEY` (for AES-GCM)
    - [ ] `HMAC_DEFAULT_ALGO=sha256`
    - [ ] `CORS_ALLOWED_ORIGINS`
    - [ ] `RATE_LIMIT_AUTH_WINDOW`, `RATE_LIMIT_AUTH_MAX`
  - [ ] Implement centralized config loader (no direct `process.env` usage)

---

## 1. Backend – Core Application Setup

- [ ] Initialize backend project
  - [ ] `npm init -y` in `/backend`
  - [ ] Install core deps:
    - [ ] `express`, `cors`, `helmet`, `cookie-parser`, `compression`
    - [ ] `jsonwebtoken`, `bcryptjs` or `argon2`
    - [ ] `mongoose`
    - [ ] `express-rate-limit`
    - [ ] `express-validator` or `zod` + custom middleware
    - [ ] `crypto` (built-in) wrapper utilities
  - [ ] Install dev deps:
    - [ ] `typescript`, `ts-node-dev`
    - [ ] `@types/express`, `@types/jsonwebtoken`, `@types/node`, etc.
    - [ ] `jest`, `ts-jest`, `supertest` for tests

- [ ] Express app bootstrap
  - [ ] `src/app.ts` – create express app with:
    - [ ] security middleware: `helmet`, `cors`, `compression`
    - [ ] JSON body parser with size limit
    - [ ] `cookie-parser`
    - [ ] Centralized error handler
  - [ ] `src/server.ts` – http server + MongoDB connection

- [ ] MongoDB connection & models
  - [ ] Setup Mongoose connection helper
  - [ ] Define **User** model
  - [ ] Define **Merchant** model
  - [ ] Define **Transaction** model
  - [ ] Add required indexes

---

## 2. Backend – Security Utilities & Middleware

- [ ] Crypto & password utils
  - [ ] Password hashing & verification
  - [ ] HMAC signature generation & verification helpers
  - [ ] Field encryption helper (AES-GCM) for `api_secret`
  - [ ] Safe random ID / key generator for `api_key` & `api_secret`

- [ ] JWT handling
  - [ ] Utility functions:
    - [ ] `generateAccessToken(user)`
    - [ ] `generateRefreshToken(user, jti)`
    - [ ] `verifyAccessToken(token)`
    - [ ] `verifyRefreshToken(token)`
  - [ ] Refresh token persistence:
    - [ ] Create `RefreshToken` model (or embed in User)
    - [ ] Store **hashed** refresh token with `jti`, `userId`, `expiresAt`, `revoked`
    - [ ] Implement reuse detection & invalidation

- [ ] Validation & sanitization middleware
  - [ ] Request validation using `zod` or `express-validator`
  - [ ] Central `validateRequest` middleware
  - [ ] Central sanitization for strings (trim, escape where needed)

- [ ] Rate limiting & abuse prevention
  - [ ] Apply strict rate limit on auth endpoints (IP-based)
  - [ ] General rate limit on merchant APIs
  - [ ] Optional: add `slow-down` on repeated failures

- [ ] Auth middlewares
  - [ ] `requireAuth` (access token)
  - [ ] `requireMerchant` (user with merchant role)
  - [ ] `requireApiKey` (for merchant APIs)
  - [ ] HMAC verification middleware for signed requests

- [ ] CORS & HTTPS readiness
  - [ ] Configurable CORS (allow specific frontend origin only)
  - [ ] `app.set('trust proxy', 1)` for proxy scenarios
  - [ ] Document HTTPS expectations (reverse proxy / TLS termination)

---

## 3. Backend – User Authentication Flows

- [ ] Auth routes: `POST /auth/register`
  - [ ] Validate payload (email, password)
  - [ ] Hash password
  - [ ] Create user with `role=user`
  - [ ] Generate email verification token (simple or signed)
  - [ ] Mock email send (log to console or store in DB)
  - [ ] Return safe success response

- [ ] Email verification: `GET /auth/verify-email?token=...`
  - [ ] Verify token
  - [ ] Mark user as verified
  - [ ] Handle expired/invalid token gracefully

- [ ] Login: `POST /auth/login`
  - [ ] Validate input
  - [ ] Verify email & password
  - [ ] Check `emailVerified` & user status
  - [ ] Generate access + refresh tokens
  - [ ] Store hashed refresh token
  - [ ] Return tokens (access in body, refresh via httpOnly cookie or body based on design)

- [ ] Refresh token: `POST /auth/refresh`
  - [ ] Verify refresh token (cookie/header)
  - [ ] Check DB for token, `revoked` flag and `expiresAt`
  - [ ] Issue new access token (and optionally new refresh token + token rotation)

- [ ] Logout: `POST /auth/logout`
  - [ ] Revoke refresh token in DB
  - [ ] Clear refresh token cookie (if cookie based)
  - [ ] Return success

---

## 4. Backend – Merchant Management

- [ ] Merchant creation: `POST /merchants`
  - [ ] Protected by `requireAuth`
  - [ ] Validate merchant data (`business_name`, etc.)
  - [ ] Generate `api_key` + `api_secret`
    - [ ] Encrypt `api_secret` at rest before saving
  - [ ] Store merchant mapping to `user_id`
  - [ ] Return **only** `api_key` and `api_secret` once (masked later)

- [ ] Merchant list & details
  - [ ] `GET /merchants/me` – get merchant info for logged-in user
  - [ ] Return masked `api_key`, never return raw `api_secret`

- [ ] API key rotation: `POST /merchants/:id/rotate-key`
  - [ ] Generate new `api_key` + `api_secret`
  - [ ] Mark previous key as `deprecated` with grace period OR immediate revocation
  - [ ] Store previous keys if needed, or just overwrite & invalidate all previous
  - [ ] Return new credentials safely once

- [ ] HMAC signing standardization
  - [ ] Define canonical string format for signature
  - [ ] Implement helper on backend & document in API_DOCS
  - [ ] Enforce signature validation on transaction endpoints used by merchants

---

## 5. Backend – Transactions & Webhooks

- [ ] Checkout session creation: `POST /transactions/checkout`
  - [ ] Auth via API key + HMAC
  - [ ] Validate amount, currency, customer_email, metadata
  - [ ] Create transaction with `status="PENDING"`
  - [ ] Store incoming request signature
  - [ ] Return checkout session data (id, amount, status)

- [ ] Process payment (mock): `POST /transactions/:id/process`
  - [ ] Auth via API key + HMAC
  - [ ] Validate transaction ownership by merchant
  - [ ] Mock payment result (success/failure)
  - [ ] Update transaction status + timestamp(s)
  - [ ] Trigger webhook notification (if webhook URL configured for merchant)

- [ ] Fetch transaction history:
  - [ ] `GET /transactions` – merchant scoped
    - [ ] Filters: date range, status, amount range
  - [ ] `GET /transactions/:id` – transaction details

- [ ] Webhook endpoint: `POST /webhooks/transaction-status`
  - [ ] For this project, create endpoint **for consumers** or simulated external service
  - [ ] Validate body and optional signature
  - [ ] Document expected payload

- [ ] Aggregation queries (Mongo)
  - [ ] Aggregation 1: Merchant analytics
    - [ ] total transactions, total amount, success rate
  - [ ] Aggregation 2: Daily / monthly transaction stats (for charting on dashboard)

---

## 6. Backend – Security Hardening & Error Handling

- [ ] Global error handling
  - [ ] Convert thrown errors to standardized API responses
  - [ ] Hide stack traces & internal messages in production
  - [ ] Map errors to specific HTTP codes (401, 403, 422, 429, 500)

- [ ] Logging
  - [ ] Implement structured logging (minimal, using `console` or a logger)
  - [ ] Ensure no secrets (passwords, tokens, api_secret, HMAC signatures) are logged

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

- [ ] Initialize Next.js app (TS)
  - [ ] Install deps: `next`, `react`, `react-dom`, `axios` (or fetch wrapper), `zod`, `react-hook-form`/`formik`
  - [ ] Configure basic layout, `_app.tsx` or App Router structure

- [ ] Authentication UI
  - [ ] Register page `/auth/register`
  - [ ] Login page `/auth/login`
  - [ ] Handle email verification feedback page
  - [ ] Implement auth context / store
  - [ ] Store access token (in memory or secure storage)
  - [ ] Use refresh token via httpOnly cookie (handled by backend) – call `/auth/refresh` on app load

- [ ] Protected routes
  - [ ] Implement HOC or middleware pattern to protect dashboard routes
  - [ ] Redirect unauthenticated users to login

---

## 9. Frontend – Merchant Dashboard

- [ ] Dashboard layout
  - [ ] Responsive layout (sidebar + content on desktop, stacked on mobile)
  - [ ] Common components: Navbar, Sidebar, Card, Table, Spinner, Toasts

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


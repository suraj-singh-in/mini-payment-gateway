# Implementation Plan – Mini Payment Gateway API

> Priorities: **Security > Correctness > Developer Experience > Extra Features**

---

## 1. Overall Architecture

- **Pattern**: Backend as a stateless REST API, frontend as a separate SPA/Next.js app.
- **Backend**:
  - Node.js + Express + TypeScript.
  - MongoDB via Mongoose.
  - Layered structure: `routes → controllers → services → repositories → models`.
  - Cross-cutting layers for `auth`, `validation`, `security`, and `config`.
- **Frontend**:
  - Next.js (TypeScript).
  - App router or pages router (your choice) with:
    - Auth context.
    - Protected routes (merchant dashboard).
    - Public demo checkout page.

### 1.1 Folder Structure (Backend)

```txt
backend/
  src/
    config/
      index.ts           # config loader (env)
    db/
      mongoose.ts        # Mongo connection
    models/
      User.ts
      Merchant.ts
      Transaction.ts
      RefreshToken.ts
    security/
      crypto.ts          # AES-GCM encrypt/decrypt, random IDs
      password.ts        # hash/verify functions
      hmac.ts            # HMAC sign/verify helpers
      jwt.ts             # access/refresh generation & verification
    middleware/
      auth.ts            # requireAuth, requireMerchant
      apiKey.ts          # requireApiKey + merchant lookup
      hmacVerify.ts      # HMAC verification for signed requests
      rateLimit.ts       # auth + API rate limiters
      validate.ts        # validation & sanitization
      errorHandler.ts    # global error handling
      cors.ts            # CORS config
    validators/
      authValidators.ts
      merchantValidators.ts
      transactionValidators.ts
    services/
      authService.ts
      merchantService.ts
      transactionService.ts
      webhookService.ts
    controllers/
      authController.ts
      merchantController.ts
      transactionController.ts
      webhookController.ts
    routes/
      authRoutes.ts
      merchantRoutes.ts
      transactionRoutes.ts
      webhookRoutes.ts
    utils/
      logger.ts
      response.ts
    app.ts
    server.ts
  tests/
    unit/
    integration/

# 🚀 Mini Payment Gateway API – Backend

Secure, production-grade **payment gateway API** built with **Node.js, Express, TypeScript, MongoDB**, and **high-security practices**.

---

## 📌 Core Features

### 🔐 Authentication System
- JWT Access & Refresh Tokens  
- Refresh token rotation & expiry  
- Password hashing (bcrypt / argon2)  
- Secure ENV-based secrets  

### 🧾 Merchant Management
- Create merchant accounts  
- API Key + Secret generation 🔑  
- HMAC-SHA256 request signing  
- Secure secret storage  
- API key rotation mechanism  

### 💳 Transaction System
- Create checkout session  
- Mock payment processing  
- Fetch transaction history  
- Webhook support  
- Sensitivity-based redaction  

---

## 🧱 Tech Stack

| Area            | Technology |
|-----------------|------------|
| Runtime         | Node.js + Express |
| Language        | TypeScript |
| Database        | MongoDB + Mongoose |
| Security        | JWT, HMAC, argon2/bcrypt |
| Logging         | Winston + Chalk + Decorators |
| Architecture    | Modular + Singleton Routers |
| Testing         | Jest (planned) |
| Deployment      | Docker-ready |

---

## 📂 Project Structure

```
backend/
│── src/
│ ├── app.ts # Express setup
│ ├── server.ts # Server bootstrap
│ ├── config/ # ENV + config loader
│ ├── utils/logger.ts # Winston + Chalk logger
│ ├── middleware/
│ │ ├── basicRequestLogger.ts
│ │ ├── rateLimit.ts
│ │ └── errorHandler.ts
│ ├── decorators/
│ │ └── LogRequest.ts # Per-route logging decorator
│ ├── controllers/
│ │ └── HealthController.ts
│ ├── routes/
│ │ ├── MasterRouter.ts # Singleton main router
│ │ └── HealthRouter.ts # Singleton router + controller split
│ └── models/ # Mongoose (upcoming)
│── .env.example # Sample ENV vars
│── tsconfig.json
│── package.json
│── README.md
```
---

## ⚙️ Setup Instructions

### 1️⃣ Install Dependencies
```bash
cd backend
npm install
```

### 2️⃣ Configure Environment Variables
```bash
cp .env.example .env
```

```bash
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/mini_payment_gateway

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

ENCRYPTION_KEY=...
HMAC_DEFAULT_ALGO=sha256

CORS_ALLOWED_ORIGINS=http://localhost:3000
RATE_LIMIT_AUTH_WINDOW_MS=900000
RATE_LIMIT_AUTH_MAX=10

```

### 3️⃣ Generate Secrets
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

```

### 4️⃣ Start the Server
```bash
npm run dev
```
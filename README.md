# OG Media Production CRM

Enterprise-grade, distributed Customer Relationship Management system designed to ingest, buffer, and process high-volume marketing leads for **OG Media**.

Built with a **zero direct write to database** architecture: all public contact submissions pass through **Redis Streams** before being persisted to **MongoDB** via controlled asynchronous background workers.

---

## Architecture Flow

```text
1,000,000 Burst Contact Form Submissions
                 │
                 ▼
       Express Ingestion API
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
Rate Limiting         Zod Validation
      │                     │
      └──────────┬──────────┘
                 │
                 ▼
        Deduplication Window
                 │
                 ▼
     Redis Stream (lead-submissions)
                 │
          Fast HTTP 200 Ack
                 │
                 ▼
     Controlled Worker Pool (Concurrency = 20)
                 │
                 ▼
        MongoDB bulkWrite
                 │
                 ▼
      React CRM Dashboard
```

---

## Tech Stack

- **Backend**: Node.js (ES Modules), Express 5, MongoDB, Mongoose 9, Redis, Redis Streams (ioredis), JWT, bcrypt, Zod, Helmet, CORS, express-rate-limit with Redis store, Pino structured logging.
- **Frontend**: React 19, Vite 8, Tailwind CSS, TanStack Query (React Query), Lucide React, React Router.
- **Design Aesthetic**: OG Media Neo-brutalist Manga design system with halftone screentone patterns, drafting board perspective grids, heavy drop shadows, and lime accents.

---

## Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running on `mongodb://127.0.0.1:27017`
- Redis running on `redis://127.0.0.1:6379` (Redis Windows binary included in `backend/bin/redis/`)

### 1. Start Redis
```powershell
# In Windows PowerShell:
.\backend\bin\redis\redis-server.exe .\backend\bin\redis\redis.windows.conf
```

### 2. Configure & Start Backend
```bash
cd backend
cp .env.example .env
npm install

# Create initial Super Administrator:
npm run create-super-admin

# Start backend server (includes in-process lead worker):
npm run dev
# Server listens on http://localhost:4000
```

### 3. Run Dedicated Background Worker (Optional / Distributed Mode)
```bash
# In a separate terminal or container:
npm run worker
```

### 4. Start Frontend
```bash
cd ../frontend
npm install
npm run dev
# Frontend runs at http://localhost:5173/ogmedia/
```

Access the CRM Dashboard at:
👉 **`http://localhost:5173/ogmedia/crm/login`**

---

## Test Credentials (Demo Roster)

| User | Username | Password | Role | Sectors Authorized |
|---|---|---|---|---|
| **Super Admin** | `admin` | `AdminPass123!` | `SUPER_ADMIN` | Global Access |
| **Rahul** | `rahul` | `RahulPass123!` | `EMPLOYEE` | `META_ADS` |
| **Sarah** | `sarah` | `SarahPass123!` | `EMPLOYEE` | `SEO` |

*The login screen features 1-click autofill shortcut buttons for testing role permissions and sector isolation.*

---

## Running Tests

### Automated Integration Test Suite
Verifies Redis queue buffering, deduplication window, database scoping, RBAC isolation, password hashing, and audit log immutability:
```bash
cd backend
npm test
```

### High-Throughput Load Testing Benchmark
Simulates high-volume burst ingestion, measuring API latency, Redis ingestion requests/second, and worker MongoDB write throughput:
```bash
cd backend
# 1,000 requests burst
node tests/load-test.js --count 1000 --concurrency 50

# 5,000 requests burst
node tests/load-test.js --count 5000 --concurrency 80
```

---

## Verification & Documentation

Detailed engineering documentation is located in the `docs/` folder:
- [System Design & Architecture](docs/SYSTEM_DESIGN.md)
- [Security & RBAC Specification](docs/SECURITY.md)
- [API Reference & Schema](docs/API.md)

# 📊 Unified Event Analytics Engine

A scalable and modular backend system to collect and analyze events from websites and mobile apps. Designed with performance, reliability, and real-world production requirements in mind.

---

## 🚀 Features

- 🔐 API Key Management
- 📝 Event Collection
- 📈 Aggregated Analytics
- 🧠 Redis Caching
- 📉 Rate Limiting
- 🧪 Unit and E2E Tests
- 🐳 Dockerized
- 📚 Swagger Docs

---

## 🏗️ Tech Stack

- Node.js (NestJS)
- PostgreSQL (via Prisma)
- Redis
- rate-limiter-flexible
- Docker & Docker Compose
- Jest + Supertest

---

## 📦 Setup

Clone the repo and set env vars:

DATABASE_URL=postgresql://postgres:postgres@db:5432/analytics  
REDIS_URL=redis://redis:6379  
PORT=3000

---

## 🐳 Run with Docker

docker-compose down --volumes  
docker-compose up --build  

Swagger: http://localhost:3000/api/docs

---

## 🔐 API Key Flow

1. **Register App**  
   `POST /api-key/register`

2. **Send Event**  
   `POST /analytics/collect`

3. **Get Summary**  
   `GET /analytics/event-summary?event=...`

4. **Get User Stats**  
   `GET /analytics/user-stats?userId=...`

---

## ✅ Endpoints

- `POST /api-key/register`  
- `GET /api-key`  
- `POST /api-key/revoke`  
- `POST /analytics/collect`  
- `GET /analytics/event-summary`  
- `GET /analytics/user-stats`  

---

## 🧪 Testing

pnpm test:e2e

---

## 📄 License

MIT
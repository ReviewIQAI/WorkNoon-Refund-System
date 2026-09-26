# PRD — WORKNOON AI-Powered Customer Support Refund System

## Original Problem Statement
Build a fully containerized AI-powered Customer Support Refund System for the WORKNOON
Full-Stack AI Integration Assessment. Customers submit refund requests; an AI (OpenAI
gpt-5.4) evaluates them against order data + a refund policy and returns
Approved/Denied/Escalated with reasoning. Deliverables: React frontend (customer portal +
admin dashboard), FastAPI backend with required endpoints, MongoDB with 15 customers +
orders seeded, meaningful AI integration, prompt-injection safeguards, Docker setup, and
complete README.

## Architecture
- **Frontend**: React 19 + React Router + Tailwind + shadcn/ui + Framer Motion (deep
  purple / white / orange WORKNOON branding). Pages: CustomerPortal, AdminDashboard.
- **Backend**: FastAPI + Motor (async MongoDB). Modules: server.py (routes + startup
  seed), models.py, seed.py, auth.py (JWT+bcrypt), ai_engine.py (rules + LLM + injection),
  refund_policy.txt.
- **DB collections**: customers, orders, refund_decisions, refund_policy, users.
- **AI**: OpenAI gpt-5.4 via emergentintegrations (EMERGENT_LLM_KEY).
- **Containerization**: docker-compose.yml + backend/frontend Dockerfiles + .env.example.

## User Personas
- **Customer**: submits refund requests, sees instant transparent AI decisions.
- **Support Admin**: reviews all decisions, audit trails, and can manually override.

## Core Requirements (static)
- Refund request evaluation with hard rules: final-sale not refundable, >30 days deny,
  >$500 escalate, one refund/order, amount validation, prompt-injection -> escalate.
- Required endpoints: POST /api/refund/request, GET /api/refund/history, GET /api/customers,
  GET /api/orders/:customerId, GET /api/refund/:decisionId, plus /api/customers/lookup,
  /api/refund/stats, /api/policy, /api/auth/login, /api/auth/me, /api/refund/:id/override.

## Implemented (2026-09-26)
- ✅ 15 customers + 36 orders + policy + admin auto-seeded on startup (idempotent).
- ✅ AI engine with hard-rule overrides, JSON validation, injection detection, audit trail.
- ✅ All decision paths verified: approved, denied (30-day + final-sale), escalated (>$500),
  injection-escalated, duplicate 409, mismatch 400, unknown 404, invalid amount denied.
- ✅ Customer Portal: lookup, order selection, reason, full/partial amount, animated AI
  decision card (badge, confidence, reasoning, next steps).
- ✅ Admin Dashboard: JWT login, KPI stats, filter pills, search, table, detail modal with
  audit trail + manual override.
- ✅ Security hardening: decision-detail endpoint admin-protected; regex-safe lookup.
- ✅ Docker deliverables + comprehensive README with sample test cases.
- ✅ Tested: 22/22 backend pytest pass; full frontend E2E pass (100%).

## Backlog / Remaining
- P2: Migrate FastAPI on_event -> lifespan context manager (cosmetic).
- P2: Loom video demo link (user to record & add to README).
- P2: Per-line-item refunds; multi-user roles for production.

## Next Tasks
- User records 3–5 min Loom demo, pushes to GitHub repo `worknoon-refund-system`, submits.

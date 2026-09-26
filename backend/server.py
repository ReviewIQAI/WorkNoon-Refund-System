"""WORKNOON AI-Powered Customer Support Refund System — FastAPI backend."""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
from datetime import datetime, timezone
from typing import List

from fastapi import FastAPI, APIRouter, HTTPException, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from models import RefundRequest, LoginRequest, OverrideRequest
from seed import seed_database, REFUND_POLICY_TEXT
from auth import (
    seed_admin, verify_password, create_access_token, get_current_admin,
)
from ai_engine import evaluate_refund

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("refund")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="WORKNOON AI Refund System")
api_router = APIRouter(prefix="/api")

NO_ID = {"_id": 0}


# ---------------- Startup ----------------
@app.on_event("startup")
async def startup():
    await seed_database(db)
    await seed_admin(db)
    logger.info("Seed complete: customers=%d orders=%d",
                await db.customers.count_documents({}),
                await db.orders.count_documents({}))


# ---------------- Health ----------------
@api_router.get("/")
async def root():
    return {"message": "WORKNOON AI Refund System API", "status": "ok"}


# ---------------- Customers & Orders ----------------
@api_router.get("/customers")
async def get_customers():
    return await db.customers.find({}, NO_ID).to_list(1000)


@api_router.get("/customers/lookup")
async def lookup_customer(q: str):
    """Find a customer by customerId or email (case-insensitive)."""
    query = q.strip()
    customer = await db.customers.find_one(
        {"$or": [
            {"customerId": {"$regex": f"^{query}$", "$options": "i"}},
            {"email": {"$regex": f"^{query}$", "$options": "i"}},
        ]},
        NO_ID,
    )
    if not customer:
        raise HTTPException(status_code=404, detail="No customer found with that ID or email.")
    orders = await db.orders.find({"customerId": customer["customerId"]}, NO_ID).to_list(1000)
    return {"customer": customer, "orders": orders}


@api_router.get("/orders/{customer_id}")
async def get_orders(customer_id: str):
    orders = await db.orders.find({"customerId": customer_id}, NO_ID).to_list(1000)
    return orders


# ---------------- Refund policy ----------------
@api_router.get("/policy")
async def get_policy():
    policy = await db.refund_policy.find_one({"policy_id": "active"}, NO_ID)
    if not policy:
        return {"text": REFUND_POLICY_TEXT, "rules": {}}
    return policy


# ---------------- Refund request (core) ----------------
@api_router.post("/refund/request")
async def submit_refund(req: RefundRequest):
    order = await db.orders.find_one({"orderId": req.orderId}, NO_ID)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {req.orderId} not found.")
    if order["customerId"] != req.customerId:
        raise HTTPException(status_code=400, detail="This order does not belong to the provided customer.")

    # One refund per order
    existing = await db.refund_decisions.find_one({"orderId": req.orderId}, NO_ID)
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"A refund decision already exists for {req.orderId} (status: {existing['status']}). Only one refund is allowed per order.",
        )

    policy = await db.refund_policy.find_one({"policy_id": "active"})
    policy_text = policy["text"] if policy else REFUND_POLICY_TEXT

    logger.info("Evaluating refund: order=%s customer=%s amount=%s",
                req.orderId, req.customerId, req.requestedAmount)
    outcome = await evaluate_refund(policy_text, order, req.reason, req.requestedAmount)

    decision = {
        "decision_id": f"REF-{uuid.uuid4().hex[:10].upper()}",
        "customerId": req.customerId,
        "customerName": order["customerName"],
        "orderId": req.orderId,
        "reason": req.reason,
        "requestedAmount": req.requestedAmount,
        "orderTotal": order["totalAmount"],
        "status": outcome["status"],
        "ai_status": outcome["ai_status"],
        "reasoning": outcome["reasoning"],
        "confidence": outcome["confidence"],
        "decided_by": outcome["decided_by"],
        "injection_detected": outcome["injection_detected"],
        "audit_trail": outcome["audit_trail"],
        "ai_raw_response": outcome["ai_raw_response"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.refund_decisions.insert_one(dict(decision))
    logger.info("Decision %s -> %s (by %s)",
                decision["decision_id"], decision["status"], decision["decided_by"])
    decision.pop("_id", None)
    return decision


@api_router.get("/refund/history")
async def refund_history():
    decisions = await db.refund_decisions.find({}, NO_ID).sort("timestamp", -1).to_list(1000)
    return decisions


@api_router.get("/refund/stats")
async def refund_stats():
    decisions = await db.refund_decisions.find({}, NO_ID).to_list(1000)
    total = len(decisions)
    approved = sum(1 for d in decisions if d["status"] == "approved")
    denied = sum(1 for d in decisions if d["status"] == "denied")
    escalated = sum(1 for d in decisions if d["status"] == "escalated")
    conf_map = {"high": 1.0, "medium": 0.6, "low": 0.3}
    avg_conf = round(sum(conf_map.get(d.get("confidence", "medium"), 0.6) for d in decisions) / total * 100) if total else 0
    return {
        "total": total,
        "approved": approved,
        "denied": denied,
        "escalated": escalated,
        "approval_rate": round(approved / total * 100) if total else 0,
        "avg_confidence": avg_conf,
    }


@api_router.get("/refund/{decision_id}")
async def get_decision(decision_id: str):
    decision = await db.refund_decisions.find_one({"decision_id": decision_id}, NO_ID)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found.")
    return decision


# ---------------- Admin override (protected) ----------------
@api_router.post("/refund/{decision_id}/override")
async def override_decision(decision_id: str, body: OverrideRequest, admin=Depends(get_current_admin)):
    decision = await db.refund_decisions.find_one({"decision_id": decision_id})
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found.")
    audit = decision.get("audit_trail", [])
    audit.append({
        "step": "Manual override",
        "detail": f"Agent {admin['sub']} overrode '{decision['status']}' -> '{body.status}'."
                  + (f" Note: {body.note}" if body.note else ""),
        "passed": True,
    })
    await db.refund_decisions.update_one(
        {"decision_id": decision_id},
        {"$set": {
            "status": body.status,
            "decided_by": "override",
            "audit_trail": audit,
            "override_note": body.note,
            "overridden_by": admin["sub"],
            "overridden_at": datetime.now(timezone.utc).isoformat(),
        }},
    )
    updated = await db.refund_decisions.find_one({"decision_id": decision_id}, NO_ID)
    return updated


# ---------------- Auth ----------------
@api_router.post("/auth/login")
async def login(body: LoginRequest):
    email = body.email.strip().lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_access_token(email, user.get("name", "Admin"))
    return {"access_token": token, "token_type": "bearer",
            "user": {"email": email, "name": user.get("name", "Admin"), "role": "admin"}}


@api_router.get("/auth/me")
async def me(admin=Depends(get_current_admin)):
    return {"email": admin["sub"], "name": admin.get("name", "Admin"), "role": "admin"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown():
    client.close()

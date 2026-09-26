"""Pydantic models for the WORKNOON AI Refund System."""
from datetime import datetime, timezone
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, EmailStr


# ---------- Domain models ----------
class OrderItem(BaseModel):
    name: str
    price: float
    quantity: int = 1
    isFinalSale: bool = False


class Order(BaseModel):
    orderId: str
    customerId: str
    customerName: str
    customerEmail: str
    orderDate: str          # ISO date string YYYY-MM-DD
    items: List[OrderItem]
    totalAmount: float
    status: str             # delivered | in_transit | cancelled
    deliveryDate: Optional[str] = None


class Customer(BaseModel):
    customerId: str
    name: str
    email: str


# ---------- Request / response models ----------
class RefundRequest(BaseModel):
    customerId: str
    orderId: str
    reason: str
    requestedAmount: float


class AuditStep(BaseModel):
    step: str
    detail: str
    passed: Optional[bool] = None


class RefundDecision(BaseModel):
    decision_id: str
    customerId: str
    customerName: str
    orderId: str
    reason: str
    requestedAmount: float
    orderTotal: float
    status: Literal["approved", "denied", "escalated"]
    ai_status: Optional[str] = None          # what the LLM alone suggested
    reasoning: str
    confidence: str = "medium"
    decided_by: str = "ai"                   # ai | hard_rule | override
    injection_detected: bool = False
    audit_trail: List[AuditStep] = Field(default_factory=list)
    ai_raw_response: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class LoginRequest(BaseModel):
    email: str
    password: str


class OverrideRequest(BaseModel):
    status: Literal["approved", "denied", "escalated"]
    note: Optional[str] = None

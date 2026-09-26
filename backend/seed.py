"""Seed data for the WORKNOON AI Refund System.

Populates 15 customer profiles, ~36 orders (mix of statuses, dates, values and
final-sale flags), the refund policy document, and the admin user on startup.

Order dates are computed relative to "now" (days ago) so the 30-day policy rule
stays testable no matter when the system is seeded.
"""
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT_DIR = Path(__file__).parent

# ---------- Refund policy text ----------
with open(ROOT_DIR / "refund_policy.txt", "r") as f:
    REFUND_POLICY_TEXT = f.read()


def _date(days_ago: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=days_ago)).strftime("%Y-%m-%d")


# ---------- 15 customers ----------
CUSTOMERS = [
    {"customerId": "CUST-001", "name": "John Adeyemi",     "email": "john@worknoon.com"},
    {"customerId": "CUST-002", "name": "Sarah Chen",        "email": "sarah@techcorp.io"},
    {"customerId": "CUST-003", "name": "Miguel Santos",     "email": "miguel@santos.dev"},
    {"customerId": "CUST-004", "name": "Aisha Bello",       "email": "aisha@brighthr.com"},
    {"customerId": "CUST-005", "name": "David Okonkwo",     "email": "david@okonkwo.io"},
    {"customerId": "CUST-006", "name": "Emily Roberts",     "email": "emily@hirefast.co"},
    {"customerId": "CUST-007", "name": "Rahul Verma",       "email": "rahul@verma.tech"},
    {"customerId": "CUST-008", "name": "Grace Nwosu",       "email": "grace@nwosu.com"},
    {"customerId": "CUST-009", "name": "Tunde Bakare",      "email": "tunde@bakare.io"},
    {"customerId": "CUST-010", "name": "Linda Martins",     "email": "linda@martins.co"},
    {"customerId": "CUST-011", "name": "Chidi Eze",         "email": "chidi@eze.dev"},
    {"customerId": "CUST-012", "name": "Olivia Brown",      "email": "olivia@brownhr.com"},
    {"customerId": "CUST-013", "name": "Ahmed Musa",        "email": "ahmed@musa.io"},
    {"customerId": "CUST-014", "name": "Priya Nair",        "email": "priya@nair.tech"},
    {"customerId": "CUST-015", "name": "James Wilson",      "email": "james@wilson.co"},
]

_CUST = {c["customerId"]: c for c in CUSTOMERS}


def _order(order_id, cust_id, days_ago, items, status="delivered", delivered_days_ago=None):
    c = _CUST[cust_id]
    total = round(sum(i["price"] * i.get("quantity", 1) for i in items), 2)
    return {
        "orderId": order_id,
        "customerId": cust_id,
        "customerName": c["name"],
        "customerEmail": c["email"],
        "orderDate": _date(days_ago),
        "items": items,
        "totalAmount": total,
        "status": status,
        "deliveryDate": _date(delivered_days_ago) if delivered_days_ago is not None else None,
    }


def _it(name, price, qty=1, final=False):
    return {"name": name, "price": price, "quantity": qty, "isFinalSale": final}


# ---------- ~36 orders across customers ----------
# WORKNOON products: job posting packs, subscriptions, sourcing credits, add-ons.
ORDERS = [
    # CUST-001 — includes a clean APPROVE candidate (delivered 8d ago, $800, not final sale)
    _order("ORD-10001", "CUST-001", 8, [_it("Enterprise Hiring Suite (Monthly)", 800)], "delivered", 5),
    _order("ORD-10002", "CUST-001", 22, [_it("Featured Employer Badge", 120), _it("Job Boost Add-on", 40, 1, True)], "delivered", 20),
    _order("ORD-10003", "CUST-001", 2, [_it("Resume Database Access (Weekly)", 90)], "in_transit"),

    # CUST-002 — DENY candidate: order older than 30 days ($60, 45d ago)
    _order("ORD-10004", "CUST-002", 45, [_it("Single Job Posting (30 days)", 60)], "delivered", 42),
    _order("ORD-10005", "CUST-002", 12, [_it("Candidate Sourcing Pack (50)", 250)], "delivered", 9),

    # CUST-003 — ESCALATE candidate: high-value $1500 (5d ago)
    _order("ORD-10006", "CUST-003", 5, [_it("Annual Recruiter Subscription", 1500)], "delivered", 1),
    _order("ORD-10007", "CUST-003", 18, [_it("Sponsored Listing Credits", 75, 1, True)], "delivered", 16),

    # CUST-004
    _order("ORD-10008", "CUST-004", 3, [_it("Premium Job Posting (30 days)", 199)], "delivered", 1),
    _order("ORD-10009", "CUST-004", 27, [_it("Employer Branding Page", 300)], "delivered", 24),
    _order("ORD-10010", "CUST-004", 60, [_it("Bulk Posting Bundle (10)", 450)], "delivered", 57),

    # CUST-005 — final-sale only order (DENY candidate)
    _order("ORD-10011", "CUST-005", 10, [_it("Flash Promo Credits", 45, 2, True)], "delivered", 8),
    _order("ORD-10012", "CUST-005", 6, [_it("ATS Integration Setup", 350)], "delivered", 3),

    # CUST-006
    _order("ORD-10013", "CUST-006", 1, [_it("Single Job Posting (30 days)", 60)], "in_transit"),
    _order("ORD-10014", "CUST-006", 15, [_it("Candidate Sourcing Pack (50)", 250), _it("Resume Boost", 30, 1, True)], "delivered", 12),
    _order("ORD-10015", "CUST-006", 40, [_it("Featured Employer Badge", 120)], "delivered", 37),

    # CUST-007 — high value ESCALATE candidate
    _order("ORD-10016", "CUST-007", 9, [_it("Enterprise Hiring Suite (Annual)", 1800)], "delivered", 6),
    _order("ORD-10017", "CUST-007", 20, [_it("Premium Job Posting (30 days)", 199)], "delivered", 18),

    # CUST-008
    _order("ORD-10018", "CUST-008", 4, [_it("Video Interview Add-on", 140)], "delivered", 2),
    _order("ORD-10019", "CUST-008", 33, [_it("Employer Branding Page", 300)], "delivered", 30),

    # CUST-009 — cancelled order
    _order("ORD-10020", "CUST-009", 7, [_it("Bulk Posting Bundle (10)", 450)], "cancelled"),
    _order("ORD-10021", "CUST-009", 11, [_it("Single Job Posting (30 days)", 60), _it("Job Boost Add-on", 40, 1, True)], "delivered", 8),

    # CUST-010
    _order("ORD-10022", "CUST-010", 14, [_it("Candidate Sourcing Pack (100)", 480)], "delivered", 11),
    _order("ORD-10023", "CUST-010", 2, [_it("Premium Job Posting (30 days)", 199)], "delivered", 1),
    _order("ORD-10024", "CUST-010", 50, [_it("Annual Recruiter Subscription", 1500)], "delivered", 47),

    # CUST-011
    _order("ORD-10025", "CUST-011", 6, [_it("ATS Integration Setup", 350)], "delivered", 3),
    _order("ORD-10026", "CUST-011", 25, [_it("Featured Employer Badge", 120)], "delivered", 22),

    # CUST-012
    _order("ORD-10027", "CUST-012", 3, [_it("Resume Database Access (Monthly)", 220)], "delivered", 1),
    _order("ORD-10028", "CUST-012", 38, [_it("Bulk Posting Bundle (10)", 450)], "delivered", 35),

    # CUST-013 — high value ESCALATE candidate
    _order("ORD-10029", "CUST-013", 8, [_it("Enterprise Hiring Suite (Quarterly)", 950)], "delivered", 5),
    _order("ORD-10030", "CUST-013", 16, [_it("Single Job Posting (30 days)", 60)], "delivered", 13),

    # CUST-014
    _order("ORD-10031", "CUST-014", 5, [_it("Video Interview Add-on", 140), _it("Sponsored Listing Credits", 75, 1, True)], "delivered", 2),
    _order("ORD-10032", "CUST-014", 29, [_it("Premium Job Posting (30 days)", 199)], "delivered", 26),

    # CUST-015
    _order("ORD-10033", "CUST-015", 4, [_it("Candidate Sourcing Pack (50)", 250)], "delivered", 1),
    _order("ORD-10034", "CUST-015", 55, [_it("Employer Branding Page", 300)], "delivered", 52),
    _order("ORD-10035", "CUST-015", 10, [_it("Resume Boost", 30, 3, True)], "delivered", 7),
    _order("ORD-10036", "CUST-015", 7, [_it("ATS Integration Setup", 350)], "in_transit"),
]


async def seed_database(db):
    """Idempotent seed. Populates customers, orders and policy only when empty."""
    if await db.customers.count_documents({}) == 0:
        await db.customers.insert_many([dict(c) for c in CUSTOMERS])
    if await db.orders.count_documents({}) == 0:
        await db.orders.insert_many([dict(o) for o in ORDERS])
    if await db.refund_policy.count_documents({}) == 0:
        await db.refund_policy.insert_one({
            "policy_id": "active",
            "text": REFUND_POLICY_TEXT,
            "rules": {
                "refund_window_days": 30,
                "human_review_threshold": 500,
                "final_sale_refundable": False,
                "max_refunds_per_order": 1,
            },
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })

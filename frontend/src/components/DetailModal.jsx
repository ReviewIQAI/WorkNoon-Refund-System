import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle2, XCircle, AlertTriangle, Bot, ShieldAlert } from "lucide-react";

export function DetailModal({ decision, open, onClose, onOverride, canOverride }) {
  if (!decision) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-testid="admin-detail-modal"
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-[#2E1065]">
            Refund {decision.decision_id}
            <StatusBadge status={decision.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Customer" value={decision.customerName} />
            <Field label="Order" value={decision.orderId} mono />
            <Field label="Requested" value={`$${decision.requestedAmount}`} />
            <Field label="Order total" value={`$${decision.orderTotal}`} />
            <Field label="Confidence" value={decision.confidence} capitalize />
            <Field
              label="Decided by"
              value={decision.decided_by === "hard_rule" ? "policy rule" : decision.decided_by}
              capitalize
            />
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Customer reason
            </p>
            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{decision.reason}</p>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              AI reasoning
            </p>
            <p className="text-sm text-slate-700">{decision.reasoning}</p>
            {decision.ai_status && decision.ai_status !== decision.status && (
              <p className="mt-2 flex items-center gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
                <Bot className="h-4 w-4" /> AI alone suggested{" "}
                <b className="capitalize">{decision.ai_status}</b>; a policy rule overrode it.
              </p>
            )}
            {decision.injection_detected && (
              <p className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 p-2 text-xs text-red-700">
                <ShieldAlert className="h-4 w-4" /> Prompt-injection attempt detected.
              </p>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Audit trail
            </p>
            <ol data-testid="admin-audit-trail-container" className="space-y-2">
              {(decision.audit_trail || []).map((s, i) => (
                <li key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                  <span
                    className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                      s.passed === false ? "bg-red-500" : s.passed ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{s.step}</p>
                    <p className="text-xs text-slate-500">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {canOverride && (
            <div className="border-t border-slate-100 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Manual override
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  data-testid="admin-override-approve-button"
                  onClick={() => onOverride("approved")}
                  className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
                <Button
                  size="sm"
                  data-testid="admin-override-deny-button"
                  onClick={() => onOverride("denied")}
                  className="gap-1 bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4" /> Deny
                </Button>
                <Button
                  size="sm"
                  data-testid="admin-override-escalate-button"
                  onClick={() => onOverride("escalated")}
                  className="gap-1 bg-amber-500 hover:bg-amber-600"
                >
                  <AlertTriangle className="h-4 w-4" /> Escalate
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, mono, capitalize }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`text-slate-800 ${mono ? "font-mono text-xs" : ""} ${capitalize ? "capitalize" : ""}`}>
        {value}
      </p>
    </div>
  );
}

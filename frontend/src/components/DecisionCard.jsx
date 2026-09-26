import { motion } from "framer-motion";
import { STATUS_META, StatusBadge } from "@/components/StatusBadge";
import { Sparkles, ShieldAlert, ArrowRight } from "lucide-react";

const CONFIDENCE_PCT = { high: 92, medium: 62, low: 33 };

function nextSteps(decision) {
  const ref = decision.decision_id;
  switch (decision.status) {
    case "approved":
      return [
        `Your refund of $${decision.requestedAmount} has been approved.`,
        "Funds return to your original payment method within 5–7 business days.",
        `A confirmation email with reference ${ref} will be sent shortly.`,
      ];
    case "denied":
      return [
        "This request does not meet our current refund policy.",
        `If you believe this is a mistake, reply quoting reference ${ref}.`,
        "Our support team is happy to take another look.",
      ];
    default:
      return [
        "Your request needs a quick human review.",
        "A WORKNOON support agent will follow up within 24 hours.",
        `Keep reference ${ref} handy for faster service.`,
      ];
  }
}

export function DecisionCard({ decision }) {
  const meta = STATUS_META[decision.status] || STATUS_META.escalated;
  const pct = CONFIDENCE_PCT[decision.confidence] || 60;

  return (
    <motion.div
      data-testid="ai-decision-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-purple-900/5"
    >
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-[#2E1065] to-[#4C1D95] px-6 py-4">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="h-4 w-4 text-[#F97316]" />
          <span className="text-sm font-semibold">AI Decision</span>
        </div>
        <StatusBadge status={decision.status} testId="ai-decision-status-badge" className="bg-white/95" />
      </div>

      <div className="space-y-5 p-6">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Confidence · <span className="capitalize">{decision.confidence}</span>
            </p>
            <span data-testid="ai-confidence-score" className="text-xs font-bold text-slate-700">
              {pct}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${meta.bar}`}
            />
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Reasoning
          </p>
          <p data-testid="ai-reasoning-text" className="text-sm leading-relaxed text-slate-700">
            {decision.reasoning}
          </p>
        </div>

        {decision.injection_detected && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Our safeguards detected text attempting to manipulate the assistant. The request was
              routed to a human for safety.
            </span>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Next steps
          </p>
          <ul data-testid="ai-next-steps-list" className="space-y-2">
            {nextSteps(decision).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <ArrowRight className={`mt-0.5 h-4 w-4 shrink-0 ${meta.ring}`} />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
          <span className="font-mono">{decision.decision_id}</span>
          <span>
            Decided by {decision.decided_by === "hard_rule" ? "policy rule" : decision.decided_by}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

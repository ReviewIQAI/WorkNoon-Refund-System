import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export const STATUS_META = {
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ring: "text-emerald-500",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  denied: {
    label: "Denied",
    icon: XCircle,
    badge: "bg-red-50 text-red-700 border-red-200",
    ring: "text-red-500",
    bar: "bg-red-500",
    dot: "bg-red-500",
  },
  escalated: {
    label: "Escalated",
    icon: AlertTriangle,
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    ring: "text-amber-500",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
};

export function StatusBadge({ status, className = "", testId }) {
  const meta = STATUS_META[status] || STATUS_META.escalated;
  const Icon = meta.icon;
  return (
    <span
      data-testid={testId}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${meta.badge} ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

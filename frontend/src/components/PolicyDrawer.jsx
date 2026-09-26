import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { api } from "@/lib/api";
import { CheckCircle2 } from "lucide-react";

const RULE_SUMMARY = [
  "Final sale items are NOT eligible for refunds.",
  "Orders older than 30 days cannot be refunded.",
  "Refunds above $500 require human review (escalated).",
  "Damaged or incorrect items may qualify for approval.",
  "Suspicious or conflicting requests are escalated.",
  "Maximum one refund per order.",
];

export function PolicyDrawer({ trigger }) {
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    api.get("/policy").then((r) => setPolicy(r.data)).catch(() => {});
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md" data-testid="policy-drawer">
        <SheetHeader>
          <SheetTitle className="text-[#2E1065]">Refund Policy</SheetTitle>
          <SheetDescription>The rules our AI applies to every request.</SheetDescription>
        </SheetHeader>
        <ul className="mt-6 space-y-3">
          {RULE_SUMMARY.map((rule, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#F97316]" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
        {policy?.text && (
          <pre className="mt-6 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-mono text-[11px] leading-relaxed text-slate-600">
            {policy.text}
          </pre>
        )}
      </SheetContent>
    </Sheet>
  );
}

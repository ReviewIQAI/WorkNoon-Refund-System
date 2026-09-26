import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { api, apiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DecisionCard } from "@/components/DecisionCard";
import {
  Search,
  Package,
  Loader2,
  Sparkles,
  User,
  RotateCcw,
  CircleDollarSign,
} from "lucide-react";

const REASONS = [
  "Damaged or defective item",
  "Incorrect item received",
  "Item not as described",
  "Changed my mind",
  "Ordered by mistake",
  "Billing / duplicate charge",
  "Other",
];

const SAMPLES = [
  { label: "CUST-001 · john@worknoon.com", value: "CUST-001" },
  { label: "CUST-002 · sarah@techcorp.io", value: "sarah@techcorp.io" },
  { label: "CUST-003 · miguel@santos.dev", value: "CUST-003" },
];

const STATUS_STYLE = {
  delivered: "bg-emerald-50 text-emerald-700",
  in_transit: "bg-blue-50 text-blue-700",
  cancelled: "bg-slate-100 text-slate-500",
};

export default function CustomerPortal() {
  const [lookup, setLookup] = useState("");
  const [data, setData] = useState(null);
  const [looking, setLooking] = useState(false);

  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [amountType, setAmountType] = useState("full");
  const [customAmount, setCustomAmount] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState(null);

  const selectedOrder = data?.orders?.find((o) => o.orderId === orderId);

  const runLookup = async (value) => {
    const q = (value ?? lookup).trim();
    if (!q) return;
    setLooking(true);
    setData(null);
    setDecision(null);
    setOrderId("");
    try {
      const res = await api.get("/customers/lookup", { params: { q } });
      setData(res.data);
      if (res.data.orders?.length) toast.success(`Welcome back, ${res.data.customer.name.split(" ")[0]}!`);
      else toast.info("No orders found for this customer.");
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setLooking(false);
    }
  };

  const resetForm = () => {
    setDecision(null);
    setOrderId("");
    setReason("");
    setDescription("");
    setAmountType("full");
    setCustomAmount("");
  };

  const submit = async () => {
    if (!selectedOrder) return toast.error("Please select an order.");
    if (!reason) return toast.error("Please choose a refund reason.");
    const requestedAmount =
      amountType === "full" ? selectedOrder.totalAmount : parseFloat(customAmount);
    if (amountType === "partial" && (!requestedAmount || requestedAmount <= 0))
      return toast.error("Enter a valid partial amount.");

    const fullReason = description.trim() ? `${reason}. ${description.trim()}` : reason;
    setSubmitting(true);
    setDecision(null);
    try {
      const res = await api.post("/refund/request", {
        customerId: data.customer.customerId,
        orderId: selectedOrder.orderId,
        reason: fullReason,
        requestedAmount,
      });
      setDecision(res.data);
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="mb-8 max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#F97316]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#EA580C]">
          <Sparkles className="h-3.5 w-3.5" /> AI-Powered Support
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Request a refund in seconds
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          Look up your order, tell us what went wrong, and our AI assistant evaluates it against
          WORKNOON's refund policy instantly — with transparent reasoning.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: lookup + order context */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Find your account
            </Label>
            <div className="mt-2 flex gap-2">
              <Input
                data-testid="customer-lookup-input"
                placeholder="Customer ID or email"
                value={lookup}
                onChange={(e) => setLookup(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runLookup()}
              />
              <Button
                data-testid="customer-lookup-button"
                onClick={() => runLookup()}
                disabled={looking}
                className="bg-[#2E1065] hover:bg-[#3B1E78]"
              >
                {looking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {SAMPLES.map((s) => (
                <button
                  key={s.value}
                  data-testid={`sample-${s.value}`}
                  onClick={() => {
                    setLookup(s.value);
                    runLookup(s.value);
                  }}
                  className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:border-[#2E1065] hover:text-[#2E1065]"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {data?.customer && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              data-testid="customer-profile-card"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2E1065] text-white">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{data.customer.name}</p>
                  <p className="text-xs text-slate-500">{data.customer.email}</p>
                </div>
                <span className="ml-auto font-mono text-xs text-slate-400">
                  {data.customer.customerId}
                </span>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Order history · {data.orders.length}
              </p>
              <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                {data.orders.map((o) => (
                  <button
                    key={o.orderId}
                    data-testid={`order-option-${o.orderId}`}
                    onClick={() => {
                      setOrderId(o.orderId);
                      setDecision(null);
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      orderId === o.orderId
                        ? "border-[#2E1065] bg-[#2E1065]/5 ring-1 ring-[#2E1065]"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#2E1065]">
                        {o.orderId}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                          STATUS_STYLE[o.status] || "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {o.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-700">
                      {o.items.map((i) => i.name).join(", ")}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                      <span>{o.orderDate}</span>
                      <span className="font-semibold text-slate-600">${o.totalAmount}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: form / result */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {decision ? (
              <motion.div key="decision" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DecisionCard decision={decision} />
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    data-testid="new-request-button"
                    onClick={resetForm}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" /> Submit another request
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <h2 className="text-xl font-bold text-slate-900">Refund request</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedOrder
                    ? `Order ${selectedOrder.orderId} · $${selectedOrder.totalAmount}`
                    : "Select an order from your history to begin."}
                </p>

                <div className="mt-6 space-y-5">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Selected order
                    </Label>
                    <div className="mt-2">
                      <Select value={orderId} onValueChange={setOrderId} disabled={!data}>
                        <SelectTrigger data-testid="order-select-dropdown">
                          <SelectValue placeholder={data ? "Choose an order" : "Look up your account first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {data?.orders?.map((o) => (
                            <SelectItem key={o.orderId} value={o.orderId}>
                              {o.orderId} — ${o.totalAmount} ({o.status.replace("_", " ")})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedOrder && (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <Package className="h-4 w-4" /> Items
                      </div>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {selectedOrder.items.map((it, i) => (
                          <li key={i} className="flex items-center justify-between">
                            <span>
                              {it.name} × {it.quantity}
                              {it.isFinalSale && (
                                <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-600">
                                  Final sale
                                </span>
                              )}
                            </span>
                            <span className="font-mono text-xs text-slate-500">${it.price}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Reason
                    </Label>
                    <div className="mt-2">
                      <Select value={reason} onValueChange={setReason}>
                        <SelectTrigger data-testid="refund-reason-select">
                          <SelectValue placeholder="Why are you requesting a refund?" />
                        </SelectTrigger>
                        <SelectContent>
                          {REASONS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Details <span className="normal-case text-slate-400">(optional)</span>
                    </Label>
                    <Textarea
                      data-testid="refund-description-input"
                      className="mt-2 resize-none"
                      rows={3}
                      maxLength={500}
                      placeholder="Add any details that help us understand your request…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <p className="mt-1 text-right text-[11px] text-slate-400">{description.length}/500</p>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Refund amount
                    </Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        data-testid="refund-amount-type-full"
                        onClick={() => setAmountType("full")}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          amountType === "full"
                            ? "border-[#2E1065] bg-[#2E1065]/5 ring-1 ring-[#2E1065]"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-800">Full amount</p>
                        <p className="text-xs text-slate-500">
                          {selectedOrder ? `$${selectedOrder.totalAmount}` : "Whole order"}
                        </p>
                      </button>
                      <button
                        type="button"
                        data-testid="refund-amount-type-partial"
                        onClick={() => setAmountType("partial")}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          amountType === "partial"
                            ? "border-[#2E1065] bg-[#2E1065]/5 ring-1 ring-[#2E1065]"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-800">Partial</p>
                        <p className="text-xs text-slate-500">Custom amount</p>
                      </button>
                    </div>
                    {amountType === "partial" && (
                      <div className="relative mt-3">
                        <CircleDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          data-testid="refund-amount-custom-input"
                          type="number"
                          className="pl-9"
                          placeholder="0.00"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    data-testid="submit-refund-request-button"
                    onClick={submit}
                    disabled={submitting || !selectedOrder}
                    className="w-full gap-2 bg-[#2E1065] py-6 text-base hover:bg-[#3B1E78]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> AI is evaluating…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 text-[#F97316]" /> Submit for AI review
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

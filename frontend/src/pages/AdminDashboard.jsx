import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api, apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { DetailModal } from "@/components/DetailModal";
import {
  Lock,
  Loader2,
  LogOut,
  Search,
  TrendingUp,
  ListChecks,
  AlertTriangle,
  Gauge,
  Eye,
  RefreshCw,
} from "lucide-react";

/* ---------------- Login gate ---------------- */
function AdminLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@worknoon.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back, Admin.");
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-xl"
      >
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#2E1065] text-white">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Support Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to review refund decisions.</p>

        <div className="mt-6 space-y-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</Label>
            <Input
              data-testid="admin-login-email-input"
              className="mt-1.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Password</Label>
            <Input
              data-testid="admin-login-password-input"
              type="password"
              className="mt-1.5"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          <Button
            data-testid="admin-login-submit-button"
            onClick={submit}
            disabled={loading}
            className="w-full gap-2 bg-[#2E1065] hover:bg-[#3B1E78]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Sign in
          </Button>
          <p className="rounded-lg bg-slate-50 p-2 text-center text-[11px] text-slate-400">
            Demo: admin@worknoon.com · worknoon2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------- Stats + Filters + Table ---------------- */
const FILTERS = [
  { key: "all", label: "All" },
  { key: "approved", label: "Approved" },
  { key: "denied", label: "Denied" },
  { key: "escalated", label: "Escalated" },
];

function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${tint}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

function Dashboard() {
  const { admin, logout } = useAuth();
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [h, s] = await Promise.all([api.get("/refund/history"), api.get("/refund/stats")]);
      setRows(h.data);
      setStats(s.data);
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchFilter = filter === "all" || r.status === filter;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        r.customerName.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q) ||
        r.decision_id.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [rows, filter, search]);

  const counts = useMemo(() => {
    const c = { all: rows.length, approved: 0, denied: 0, escalated: 0 };
    rows.forEach((r) => (c[r.status] = (c[r.status] || 0) + 1));
    return c;
  }, [rows]);

  const openDetail = async (id) => {
    try {
      const res = await api.get(`/refund/${id}`);
      setSelected(res.data);
      setModalOpen(true);
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  const doOverride = async (status) => {
    try {
      const res = await api.post(`/refund/${selected.decision_id}/override`, { status });
      setSelected(res.data);
      toast.success(`Decision overridden to ${status}.`);
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Support Dashboard
          </h1>
          <p className="text-sm text-slate-500">Signed in as {admin.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-2" data-testid="admin-refresh-button">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={logout} className="gap-2" data-testid="admin-logout-button">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={ListChecks} label="Total requests" value={stats?.total ?? "—"} tint="bg-[#2E1065]/10 text-[#2E1065]" />
        <StatCard icon={TrendingUp} label="Approval rate" value={stats ? `${stats.approval_rate}%` : "—"} tint="bg-emerald-100 text-emerald-600" />
        <StatCard icon={AlertTriangle} label="Escalations" value={stats?.escalated ?? "—"} tint="bg-amber-100 text-amber-600" />
        <StatCard icon={Gauge} label="Avg confidence" value={stats ? `${stats.avg_confidence}%` : "—"} tint="bg-[#F97316]/10 text-[#EA580C]" />
      </div>

      {/* Filters + search */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              data-testid={`admin-filter-pill-${f.key}`}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                filter === f.key
                  ? "bg-[#2E1065] text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-[#2E1065]"
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-xs opacity-70">{counts[f.key] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            data-testid="admin-search-input"
            className="w-56 pl-9"
            placeholder="Search name / order / ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" data-testid="admin-requests-table">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Decision</th>
                <th className="px-4 py-3 font-semibold">Reasoning</th>
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No refund requests yet.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.decision_id}
                    data-testid={`admin-request-row-${r.decision_id}`}
                    className="border-b border-slate-50 transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">{r.customerName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#2E1065]">{r.orderId}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">${r.requestedAmount}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="max-w-xs px-4 py-3 text-xs text-slate-500">
                      <span className="line-clamp-2">{r.reasoning}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-400">
                      {new Date(r.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        data-testid={`admin-view-detail-button-${r.decision_id}`}
                        onClick={() => openDetail(r.decision_id)}
                        className="gap-1 text-[#2E1065]"
                      >
                        <Eye className="h-4 w-4" /> View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DetailModal
        decision={selected}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onOverride={doOverride}
        canOverride
      />
    </div>
  );
}

export default function AdminDashboard() {
  const { admin, checking } = useAuth();
  if (checking)
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#2E1065]" />
      </div>
    );
  return admin ? <Dashboard /> : <AdminLogin />;
}

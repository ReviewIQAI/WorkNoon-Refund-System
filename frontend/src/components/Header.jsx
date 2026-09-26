import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, LayoutDashboard, ScrollText } from "lucide-react";
import { PolicyDrawer } from "@/components/PolicyDrawer";

export function Header() {
  const tabBase =
    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200";
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#2E1065]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/" data-testid="nav-brand-logo" className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-extrabold text-[#2E1065] shadow-lg"
          >
            W
          </motion.div>
          <div className="leading-tight">
            <p className="text-base font-extrabold tracking-tight text-white">WORKNOON</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-purple-200">
              AI Refund Assistant
            </p>
          </div>
        </NavLink>

        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 rounded-full bg-white/10 p-1">
            <NavLink
              to="/"
              end
              data-testid="nav-customer-tab"
              className={({ isActive }) =>
                `${tabBase} ${isActive ? "bg-white text-[#2E1065]" : "text-purple-100 hover:text-white"}`
              }
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Refund Portal</span>
            </NavLink>
            <NavLink
              to="/admin"
              data-testid="nav-admin-tab"
              className={({ isActive }) =>
                `${tabBase} ${isActive ? "bg-white text-[#2E1065]" : "text-purple-100 hover:text-white"}`
              }
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </NavLink>
          </nav>
          <PolicyDrawer
            trigger={
              <button
                data-testid="policy-drawer-trigger"
                className="flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-3 py-2 text-sm font-semibold text-purple-100 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ScrollText className="h-4 w-4" />
                <span className="hidden md:inline">Policy</span>
              </button>
            }
          />
        </div>
      </div>
    </header>
  );
}

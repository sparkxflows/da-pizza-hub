"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Mail,
  Phone,
  ShoppingBag,
  Calendar,
  ShieldAlert,
  ArrowUpDown,
  RefreshCw,
  Award,
} from "lucide-react";
import { adminFetch, getClientAdminRole } from "@/lib/admin-client";
import { formatCurrency } from "@/lib/format";
import type { CustomerWithStats } from "@/lib/db";

function GoogleIconMini() {
  return (
    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function AdminUsersPage() {
  const [role, setRole] = useState<string | null>(null);
  const [users, setUsers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState<string>("all");

  useEffect(() => {
    setRole(getClientAdminRole());
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to load users.");
        return;
      }
      setUsers(data.users || []);
    } catch {
      setError("Network error loading registered users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === "super_admin") {
      loadUsers();
    }
  }, [role, loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q));

      const matchProvider =
        providerFilter === "all" ||
        (providerFilter === "google" && u.authProvider === "google") ||
        (providerFilter === "email" &&
          (u.authProvider === "supabase" || u.authProvider === "email_password"));

      return matchQuery && matchProvider;
    });
  }, [users, query, providerFilter]);

  // Total summary metrics
  const totalSpentAll = useMemo(() => {
    return users.reduce((sum, u) => sum + (u.totalSpent || 0), 0);
  }, [users]);

  const totalOrdersAll = useMemo(() => {
    return users.reduce((sum, u) => sum + (u.orderCount || 0), 0);
  }, [users]);

  if (role === "admin") {
    return (
      <div className="p-6 sm:p-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Super Admin Privileges Required
        </h2>
        <p className="text-white/60 text-sm max-w-md mb-6 leading-relaxed">
          Customer database and user profiles are restricted exclusively to Super Admin. Store Admins manage live orders and store operations.
        </p>
        <Link
          href="/admin"
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-bright"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0c0c0c]/95 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white font-heading">
              Registered Users
            </h1>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              {users.length} Total Customers
            </span>
          </div>

          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search & Provider Filter Bar */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, or mobile..."
              className="h-9 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-xs text-white outline-none focus:border-[#F6C453]"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 p-1 text-xs">
            <button
              onClick={() => setProviderFilter("all")}
              className={`rounded-lg px-2.5 py-1 transition ${
                providerFilter === "all"
                  ? "bg-white/15 text-white font-bold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setProviderFilter("google")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
                providerFilter === "google"
                  ? "bg-white/15 text-white font-bold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <GoogleIconMini />
              <span>Google</span>
            </button>
            <button
              onClick={() => setProviderFilter("email")}
              className={`rounded-lg px-2.5 py-1 transition ${
                providerFilter === "email"
                  ? "bg-white/15 text-white font-bold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Email / Password
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border border-white/10 bg-[#121212] p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs text-white/50 mb-1">
              <span>Total Customers</span>
              <Users size={16} className="text-[#F6C453]" />
            </div>
            <p className="text-2xl font-bold font-mono text-white">
              {users.length}
            </p>
            <span className="text-[10px] text-emerald-400 mt-1 block">
              Supabase Authenticated
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121212] p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs text-white/50 mb-1">
              <span>Total Orders Placed</span>
              <ShoppingBag size={16} className="text-[#FF9800]" />
            </div>
            <p className="text-2xl font-bold font-mono text-white">
              {totalOrdersAll}
            </p>
            <span className="text-[10px] text-white/40 mt-1 block">
              Across all registered users
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121212] p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs text-white/50 mb-1">
              <span>Customer Lifetime Value</span>
              <Award size={16} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-400">
              {formatCurrency(totalSpentAll)}
            </p>
            <span className="text-[10px] text-white/40 mt-1 block">
              Total sales from registered profiles
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#D91F26] border-t-transparent" />
            <p className="mt-3 text-xs text-white/50">Loading registered users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-24 text-center rounded-2xl border border-white/10 bg-[#121212] p-8 text-white/40">
            <Users size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">No users found.</p>
            <p className="text-xs text-white/30 mt-1">
              Customers will automatically appear here as they register on the storefront.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-wider text-white/60">
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Auth Method</th>
                    <th className="py-3.5 px-4">Orders</th>
                    <th className="py-3.5 px-4">Total Spent</th>
                    <th className="py-3.5 px-4">Registered On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => {
                    const isGoogle = u.authProvider === "google";
                    const initial = (u.name || "C").slice(0, 1).toUpperCase();
                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-white/[0.02] transition"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D91F26] to-[#FF6B00] text-xs font-bold text-white shadow-md">
                              {initial}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">
                                {u.name}
                              </p>
                              <span className="text-[10px] text-white/40 font-mono">
                                ID: {u.id.slice(0, 12)}...
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            {u.email && (
                              <div className="flex items-center gap-1.5 text-white/80">
                                <Mail size={12} className="text-white/40" />
                                <span>{u.email}</span>
                              </div>
                            )}
                            {u.phone ? (
                              <div className="flex items-center gap-1.5 text-white/80">
                                <Phone size={12} className="text-white/40" />
                                <span>+91 {u.phone}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-white/30 italic">
                                No phone linked
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {isGoogle ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold text-sky-400">
                              <GoogleIconMini />
                              <span>Google Auth</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                              <Mail size={11} />
                              <span>Email &amp; Password</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="rounded-md bg-white/5 border border-white/10 px-2.5 py-1 font-mono font-bold text-white">
                            {u.orderCount} {u.orderCount === 1 ? "order" : "orders"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                          {formatCurrency(u.totalSpent || 0)}
                        </td>

                        <td className="py-3.5 px-4 text-white/50">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-white/30" />
                            <span>
                              {new Date(u.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Tag, Trash2, X, Pencil, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { adminFetch, getClientAdminRole } from "@/lib/admin-client";
import { formatCurrency } from "@/lib/format";

interface AdminCouponRow {
  code: string;
  type: "percent" | "flat";
  value: number;
  min_order: number;
  max_discount: number | null;
  description: string;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
}

const EMPTY_COUPON = {
  isEditing: false,
  code: "",
  type: "flat" as "flat" | "percent",
  value: "",
  minOrder: "0",
  maxDiscount: "",
  description: "",
  usageLimit: "",
  isActive: true,
};

export default function AdminCouponsPage() {
  const [role, setRole] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<AdminCouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_COUPON);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setRole(getClientAdminRole());
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [modalOpen]);

  // Handle Escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && modalOpen) setModalOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen]);

  const loadCoupons = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/coupons");
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to load coupons.");
        return;
      }
      setCoupons(data.coupons);
      setError(null);
    } catch {
      setError("Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  function openCreateModal() {
    setForm(EMPTY_COUPON);
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(c: AdminCouponRow) {
    setForm({
      isEditing: true,
      code: c.code,
      type: c.type,
      value: String(c.value),
      minOrder: String(c.min_order ?? 0),
      maxDiscount: c.max_discount ? String(c.max_discount) : "",
      description: c.description ?? "",
      usageLimit: c.usage_limit ? String(c.usage_limit) : "",
      isActive: c.is_active,
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.code.trim() || !form.value) {
      setFormError("Coupon code and discount value are required.");
      return;
    }
    if (
      form.type === "percent" &&
      (Number(form.value) <= 0 || Number(form.value) > 100)
    ) {
      setFormError("Percentage discount must be between 1 and 100.");
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrder: Number(form.minOrder) || 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      description:
        form.description.trim() ||
        (form.type === "percent"
          ? `${form.value}% OFF`
          : `Flat ₹${form.value} OFF`),
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      isActive: form.isActive,
    };

    try {
      const res = await adminFetch("/api/admin/coupons", {
        method: form.isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        setFormError(data.message || "Failed to save coupon.");
        return;
      }
      setModalOpen(false);
      loadCoupons();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon: AdminCouponRow) {
    const nextState = !coupon.is_active;
    setCoupons((prev) =>
      prev.map((c) =>
        c.code === coupon.code ? { ...c, is_active: nextState } : c
      )
    );
    try {
      await adminFetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.code, isActive: nextState }),
      });
    } catch {
      loadCoupons();
    }
  }

  async function handleDelete(code: string) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    try {
      await adminFetch(`/api/admin/coupons?code=${encodeURIComponent(code)}`, {
        method: "DELETE",
      });
    } catch {
      loadCoupons();
    }
  }

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
          Coupon creation, editing, and discount rule management are reserved exclusively for the Super Admin (Store Owner). Store Admins manage live orders and menu stock.
        </p>
        <Link
          href="/admin/orders"
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-bright"
        >
          Go to Live Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0c0c0c]/95 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white font-heading">
              Coupons &amp; Offers
            </h1>
            <p className="mt-0.5 text-xs text-white/50">
              Manage discount promo codes active in Hansi store
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D91F26] to-[#b3141a] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
          >
            <Plus size={16} /> Create Coupon
          </button>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#D91F26] border-t-transparent" />
            <p className="mt-3 text-sm text-white/50">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#141414] p-12 text-center text-white/50">
            <Tag size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No active coupons created yet.</p>
            <button
              onClick={openCreateModal}
              className="mt-3 text-xs font-bold text-[#F6C453] hover:underline"
            >
              + Create your first discount coupon
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div
                key={c.code}
                className={`flex flex-col justify-between rounded-2xl border p-5 transition ${
                  c.is_active
                    ? "border-white/10 bg-[#141414]"
                    : "border-red-500/20 bg-[#181212]/80 opacity-70"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-base font-bold tracking-wider text-[#F6C453] bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                      {c.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleActive(c)}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                        c.is_active
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/15 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {c.is_active ? (
                        <>
                          <CheckCircle2 size={12} /> In Stock
                        </>
                      ) : (
                        <>
                          <XCircle size={12} /> Inactive
                        </>
                      )}
                    </button>
                  </div>

                  <p className="mt-3 text-lg font-bold text-white">
                    {c.type === "percent"
                      ? `${c.value}% OFF`
                      : `Flat ${formatCurrency(c.value)} OFF`}
                  </p>

                  <p className="mt-1 text-xs text-white/60 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-white/5 space-y-1 text-xs text-white/40">
                    <p>
                      Min Order:{" "}
                      <span className="text-white/70 font-medium">
                        {c.min_order > 0 ? formatCurrency(c.min_order) : "None"}
                      </span>
                    </p>
                    {c.max_discount ? (
                      <p>
                        Max Discount:{" "}
                        <span className="text-white/70 font-medium">
                          {formatCurrency(c.max_discount)}
                        </span>
                      </p>
                    ) : null}
                    <p>
                      Used:{" "}
                      <span className="text-white/70 font-medium">
                        {c.used_count} times
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(c)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
                    title="Edit Coupon"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.code)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                    title="Delete Coupon"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[88vh] overflow-y-auto overscroll-contain rounded-3xl border border-white/15 bg-[#141414] p-6 shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white font-heading">
                {form.isEditing ? `Edit Coupon: ${form.code}` : "Create New Coupon"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Coupon Code *
                </label>
                <input
                  value={form.code}
                  disabled={form.isEditing}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g. FESTIVE50"
                  className="h-11 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 font-mono text-sm uppercase text-white outline-none focus:border-[#F6C453] disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        type: e.target.value as "flat" | "percent",
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-white/15 bg-[#1c1c1c] px-3 text-xs text-white outline-none focus:border-[#F6C453]"
                  >
                    <option value="flat">Flat ₹ OFF</option>
                    <option value="percent">Percent % OFF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    {form.type === "percent" ? "Percent (1–100) *" : "Discount (₹) *"}
                  </label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, value: e.target.value }))
                    }
                    placeholder={form.type === "percent" ? "20" : "50"}
                    className="h-11 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 font-mono text-sm text-white outline-none focus:border-[#F6C453]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={form.minOrder}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, minOrder: e.target.value }))
                    }
                    placeholder="0"
                    className="h-11 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 font-mono text-sm text-white outline-none focus:border-[#F6C453]"
                  />
                </div>

                {form.type === "percent" && (
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      value={form.maxDiscount}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, maxDiscount: e.target.value }))
                      }
                      placeholder="150"
                      className="h-11 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 font-mono text-sm text-white outline-none focus:border-[#F6C453]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Offer Description
                </label>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="e.g. Flat ₹50 OFF on orders above ₹300"
                  className="h-11 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 text-xs text-white outline-none focus:border-[#F6C453]"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-white/80">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                    className="h-4 w-4 rounded accent-[#D91F26]"
                  />
                  <span>Active &amp; Redeemable on Checkout</span>
                </label>
              </div>

              {formError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                  {formError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white/70 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-[#D91F26] to-[#b3141a] px-5 py-2 text-xs font-bold text-white shadow-lg disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : form.isEditing
                    ? "Update Coupon"
                    : "Create Coupon"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

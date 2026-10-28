"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Tag, Trash2, X } from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
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
  code: "",
  type: "flat" as "flat" | "percent",
  value: "",
  minOrder: "0",
  maxDiscount: "",
  description: "",
  usageLimit: "",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_COUPON);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  async function handleCreate() {
    if (!form.code.trim() || !form.value) {
      setFormError("Code and value are required.");
      return;
    }
    if (
      form.type === "percent" &&
      (Number(form.value) <= 0 || Number(form.value) > 100)
    ) {
      setFormError("Percent discount must be between 1 and 100.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const res = await adminFetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          minOrder: Number(form.minOrder) || 0,
          maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
          description: form.description,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setFormError(data.message || "Failed to create coupon.");
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

  async function toggleActive(c: AdminCouponRow) {
    setCoupons((prev) =>
      prev.map((row) =>
        row.code === c.code ? { ...row, is_active: !row.is_active } : row
      )
    );
    await adminFetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: c.code, isActive: !c.is_active }),
    });
  }

  async function handleDelete(c: AdminCouponRow) {
    if (!confirm(`Delete coupon "${c.code}"?`)) return;
    setCoupons((prev) => prev.filter((row) => row.code !== c.code));
    await adminFetch(
      `/api/admin/coupons?code=${encodeURIComponent(c.code)}`,
      { method: "DELETE" }
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-bg/95 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-white sm:text-xl">
              Coupons
            </h1>
            <p className="text-xs text-ink-secondary">
              {coupons.length} coupons
            </p>
          </div>
          <button
            onClick={() => {
              setForm(EMPTY_COUPON);
              setFormError(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-bright"
          >
            <Plus size={16} /> New Coupon
          </button>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-ink-secondary">
            Loading coupons...
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-24 text-center text-ink-secondary">
            No coupons yet.
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((c) => (
              <div
                key={c.code}
                className={`rounded-2xl border p-5 transition ${
                  c.is_active
                    ? "border-white/10 bg-card"
                    : "border-white/5 bg-card/50 opacity-60"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                      <Tag size={17} />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-bold text-white">
                        {c.code}
                      </p>
                      <p className="text-xs text-ink-secondary">
                        {c.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        c.is_active
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-white/5 text-white/50"
                      }`}
                    >
                      {c.is_active ? "Active" : "Paused"}
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-red-400/70 transition hover:bg-red-500/10"
                      aria-label="Delete coupon"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-muted">
                  <span>
                    Discount:{" "}
                    <strong className="text-white">
                      {c.type === "percent"
                        ? `${c.value}%`
                        : formatCurrency(c.value)}
                    </strong>
                  </span>
                  <span>
                    Min Order:{" "}
                    <strong className="text-white">
                      {formatCurrency(c.min_order)}
                    </strong>
                  </span>
                  {c.max_discount !== null && (
                    <span>
                      Max Cap:{" "}
                      <strong className="text-white">
                        {formatCurrency(c.max_discount)}
                      </strong>
                    </span>
                  )}
                  <span>
                    Used:{" "}
                    <strong className="text-white">
                      {c.used_count}
                      {c.usage_limit ? ` / ${c.usage_limit}` : ""}
                    </strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-card p-6 sm:rounded-3xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">New Coupon</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="Coupon code (e.g. DIWALI50)"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 font-mono text-white outline-none focus:border-accent"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value as "flat" | "percent",
                    }))
                  }
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-accent"
                >
                  <option value="flat">Flat ₹ Off</option>
                  <option value="percent">Percent % Off</option>
                </select>

                <input
                  type="number"
                  value={form.value}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, value: e.target.value }))
                  }
                  placeholder={form.type === "percent" ? "Percent %" : "Amount ₹"}
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={form.minOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, minOrder: e.target.value }))
                  }
                  placeholder="Min order ₹"
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
                />

                <input
                  type="number"
                  value={form.maxDiscount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, maxDiscount: e.target.value }))
                  }
                  placeholder="Max discount ₹ (optional)"
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
                />
              </div>

              <input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Description shown in cart"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
              />

              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, usageLimit: e.target.value }))
                }
                placeholder="Usage limit (optional)"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
              />

              {formError && <p className="text-sm text-red-400">{formError}</p>}

              <button
                onClick={handleCreate}
                disabled={saving}
                className="h-12 w-full rounded-xl bg-accent text-sm font-semibold text-white transition hover:bg-accent-bright disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

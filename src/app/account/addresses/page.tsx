"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Plus, Trash2, Home, Briefcase, Check, ArrowRight, X } from "lucide-react";
import { useCustomerStore } from "@/lib/customer-store";
import type { CustomerAddress } from "@/lib/types";

export default function SavedAddressesPage() {
  const { customer, addresses, setAddresses, fetchAddresses, openAuthModal } = useCustomerStore();

  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [label, setLabel] = useState<"Home" | "Work" | "Other">("Home");
  const [addressText, setAddressText] = useState("");
  const [landmark, setLandmark] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      fetchAddresses();
    }
  }, [customer, fetchAddresses]);

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (addressText.trim().length < 6) {
      setFormError("Please enter a complete delivery address in Hansi.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          addressText: addressText.trim(),
          landmark: landmark.trim(),
          isDefault,
        }),
      });
      const data = await res.json();
      if (data.success && data.address) {
        setShowAddModal(false);
        setAddressText("");
        setLandmark("");
        fetchAddresses();
      } else {
        setFormError(data.message || "Failed to save address.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`/api/customer/addresses?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(addresses.filter((a) => a.id !== id));
      }
    } catch {
      // ignore
    }
  }

  if (!customer) {
    return (
      <div className="min-h-[75vh] pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full rounded-3xl border border-white/10 bg-[#141414] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-[#F6C453]">
            <MapPin size={32} />
          </div>
          <h2 className="font-heading text-3xl font-semibold text-white">Sign In for Saved Addresses</h2>
          <p className="mt-2 text-sm text-ink-secondary">
            Save your home, shop or office address once and checkout in 1-click on your next pizza order!
          </p>
          <button
            onClick={() => openAuthModal("phone")}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] py-3.5 text-sm font-semibold text-white transition hover:scale-[1.02]"
          >
            Sign In with Phone / Supabase
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#F6C453] uppercase">
            Address Book
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">
            Saved Delivery Addresses
          </h1>
          <p className="text-sm text-ink-secondary mt-1">
            Manage your Hansi delivery addresses for quick 1-click checkout
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/account/orders"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            My Orders
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-5 py-2.5 text-xs font-semibold text-white transition hover:scale-105"
          >
            <Plus size={16} />
            Add New Address
          </button>
        </div>
      </div>

      {/* Address Cards Grid */}
      {addresses.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#141414] p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-white/40">
            <MapPin size={32} />
          </div>
          <h3 className="font-heading text-2xl text-white">No Addresses Saved Yet</h3>
          <p className="mt-2 text-sm text-ink-secondary max-w-md mx-auto">
            Add your home or office address in Hansi so you never have to type it again during checkout!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-6 py-3 text-sm font-semibold text-white transition hover:scale-105"
          >
            <Plus size={16} />
            Add First Address
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="relative rounded-3xl border border-white/10 bg-[#141414] p-6 transition hover:border-white/20 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white">
                    {addr.label === "Home" ? (
                      <Home size={13} className="text-[#F6C453]" />
                    ) : addr.label === "Work" ? (
                      <Briefcase size={13} className="text-blue-400" />
                    ) : (
                      <MapPin size={13} className="text-[#FF6B00]" />
                    )}
                    {addr.label}
                  </span>

                  {addr.isDefault && (
                    <span className="flex items-center gap-1 rounded-full bg-[#F6C453]/15 border border-[#F6C453]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#F6C453]">
                      <Check size={11} /> Default
                    </span>
                  )}
                </div>

                <p className="text-sm font-medium text-white leading-relaxed">
                  {addr.addressText}
                </p>

                {addr.landmark && (
                  <p className="mt-2 text-xs text-ink-secondary">
                    <strong className="text-white/60">Landmark:</strong> {addr.landmark}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-white/40">Hansi Delivery Area</span>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add New Address */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#141414] p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="font-heading text-2xl font-bold text-white mb-1">
              Add New Address
            </h3>
            <p className="text-xs text-ink-secondary mb-6">
              Enter your address details in Hansi, Haryana
            </p>

            <form onSubmit={handleAddAddress} className="space-y-4">
              {/* Label selector */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Address Label
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Home", "Work", "Other"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLabel(l)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold border transition ${
                        label === l
                          ? "border-[#D91F26] bg-[#D91F26]/15 text-white"
                          : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                      }`}
                    >
                      {l === "Home" && <Home size={13} />}
                      {l === "Work" && <Briefcase size={13} />}
                      {l === "Other" && <MapPin size={13} />}
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address input */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Complete Address in Hansi <span className="text-[#D91F26]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  placeholder="e.g. Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 p-3.5 text-sm text-white placeholder:text-white/30 focus:border-[#D91F26] focus:outline-none"
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Nearby Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Ambedkar Chowk / Barsi Gate"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#D91F26] focus:outline-none"
                />
              </div>

              {/* Default checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-[#D91F26] focus:ring-0"
                />
                <span className="text-xs text-white/80">Make this my default delivery address</span>
              </label>

              {formError && (
                <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] py-3.5 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-50"
              >
                {saving ? "Saving Address..." : "Save Address"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  UploadCloud,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { adminFetch, getClientAdminRole } from "@/lib/admin-client";
import { formatCurrency } from "@/lib/format";

interface AdminMenuRow {
  id: string;
  name: string;
  description: string;
  category: string;
  item_type: "pizza" | "simple";
  price_regular: number | null;
  price_medium: number | null;
  price_large: number | null;
  price: number | null;
  image: string;
  is_best_seller: boolean;
  is_new: boolean;
  is_available: boolean;
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: "royal-special", label: "Royal Special Pizzas" },
  { key: "veg-special", label: "Veg Special Pizzas" },
  { key: "veg-feast", label: "Veg Feast Pizzas" },
  { key: "veg-delight", label: "Veg Delight Pizzas" },
  { key: "veg-treat", label: "Veg Treat Pizzas" },
  { key: "simply-veg", label: "Simply Veg Pizzas" },
  { key: "burger", label: "Burgers" },
  { key: "fries", label: "Fries" },
  { key: "pasta", label: "Pasta" },
  { key: "wrap", label: "Wraps" },
  { key: "bread", label: "Garlic Breads" },
  { key: "sides-other", label: "Sides & Snacks" },
];

const EMPTY_FORM = {
  id: "",
  name: "",
  description: "",
  category: "veg-special",
  itemType: "simple" as "pizza" | "simple",
  priceRegular: "",
  priceMedium: "",
  priceLarge: "",
  price: "",
  image: "",
  isBestSeller: false,
  isNew: false,
};

export default function AdminMenuPage() {
  const [role, setRole] = useState<string | null>(null);
  const [items, setItems] = useState<AdminMenuRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  // Handle ESC key to close modal
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && modalOpen) {
        setModalOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen]);

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setForm((f) => ({ ...f, image: result }));
      }
    };
    reader.readAsDataURL(file);
  }

  const loadMenu = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/menu");
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to load menu.");
        return;
      }
      setItems(data.items || []);
      setError(null);
    } catch {
      setError("Failed to load menu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  async function handleSave() {
    if (!form.name.trim()) {
      setFormError("Please enter dish name.");
      return;
    }
    if (
      form.itemType === "pizza" &&
      (!form.priceRegular || !form.priceMedium || !form.priceLarge)
    ) {
      setFormError("Please enter Regular, Medium, and Large prices.");
      return;
    }
    if (form.itemType === "simple" && !form.price) {
      setFormError("Please enter dish price.");
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      itemType: form.itemType,
      priceRegular:
        form.itemType === "pizza" ? Number(form.priceRegular) : undefined,
      priceMedium:
        form.itemType === "pizza" ? Number(form.priceMedium) : undefined,
      priceLarge:
        form.itemType === "pizza" ? Number(form.priceLarge) : undefined,
      price: form.itemType === "simple" ? Number(form.price) : undefined,
      image: form.image.trim() || "/images/pizza-generic/pizza-1.webp",
      isBestSeller: form.isBestSeller,
      isNew: form.isNew,
    };

    try {
      const res = await adminFetch("/api/admin/menu", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form.id ? { id: form.id, ...payload } : payload),
      });
      const data = await res.json();
      if (!data.success) {
        setFormError(data.message || "Failed to save item.");
        return;
      }
      setModalOpen(false);
      loadMenu();
    } catch {
      setFormError("Something went wrong. Please check connection.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailable(row: AdminMenuRow) {
    const nextState = !row.is_available;
    setItems((prev) =>
      prev.map((i) =>
        i.id === row.id ? { ...i, is_available: nextState } : i
      )
    );
    try {
      await adminFetch("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, isAvailable: nextState }),
      });
    } catch {
      loadMenu();
    }
  }

  async function handleDelete(row: AdminMenuRow) {
    if (!confirm(`Are you sure you want to delete "${row.name}"?`)) return;
    setItems((prev) => prev.filter((i) => i.id !== row.id));
    try {
      await adminFetch(`/api/admin/menu?id=${encodeURIComponent(row.id)}`, {
        method: "DELETE",
      });
    } catch {
      loadMenu();
    }
  }

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchName =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === "all" || item.category === catFilter;
      return matchName && matchCat;
    });
  }, [items, search, catFilter]);

  const categoryNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of CATEGORIES) m[c.key] = c.label;
    return m;
  }, []);

  return (
    <div className="min-h-screen pb-24">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0c0c0c]/95 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white font-heading">
              Menu Items
            </h1>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-[#F6C453]">
              {filtered.length} of {items.length}
            </span>
          </div>

          <button
            onClick={() => {
              setForm(EMPTY_FORM);
              setFormError(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D91F26] to-[#b3141a] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        </div>

        {/* Minimal Search & Active Category indicator */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="h-9 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-7 text-xs text-white outline-none focus:border-[#F6C453]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {catFilter !== "all" && (
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-[#D91F26]/15 border border-[#D91F26]/30 px-2.5 py-1 text-xs font-bold text-white">
                Filtered: {categoryNameMap[catFilter] || catFilter}
              </span>
              <button
                onClick={() => setCatFilter("all")}
                className="text-xs text-[#F6C453] hover:underline"
              >
                Show All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout: Side-wise Category Navigator + Dishes Grid */}
      <div className="flex flex-col lg:flex-row gap-6 px-4 py-6 sm:px-6">
        {/* Left Column: Side-wise Categories List */}
        <aside className="lg:w-64 shrink-0">
          <div className="rounded-2xl border border-white/10 bg-[#121212] p-3 shadow-xl lg:sticky lg:top-28">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#F6C453]">
                Categories
              </span>
              <span className="text-[10px] text-white/50 font-mono">
                {items.length} items
              </span>
            </div>

            <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 [scrollbar-width:none]">
              <button
                type="button"
                onClick={() => setCatFilter("all")}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition text-left shrink-0 ${
                  catFilter === "all"
                    ? "bg-[#D91F26] text-white shadow-md font-bold"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>All Dishes</span>
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${
                    catFilter === "all"
                      ? "bg-black/30 text-white"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {items.length}
                </span>
              </button>

              {CATEGORIES.map((c) => {
                const count = items.filter((it) => it.category === c.key).length;
                const active = catFilter === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCatFilter(c.key)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition text-left shrink-0 ${
                      active
                        ? "bg-[#D91F26] text-white shadow-md font-bold"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="truncate">{c.label}</span>
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${
                        active
                          ? "bg-black/30 text-white"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Column: Main Dishes Grid */}
        <div className="flex-1 min-w-0">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#D91F26] border-t-transparent" />
              <p className="mt-3 text-sm text-white/50">Loading menu...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center text-white/40">
              <p className="text-sm">No items found in this category.</p>
              {catFilter !== "all" && (
                <button
                  onClick={() => setCatFilter("all")}
                  className="mt-2 text-xs text-[#F6C453] hover:underline"
                >
                  View All Dishes
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
                    item.is_available
                      ? "border-white/10 bg-[#141414]"
                      : "border-red-500/20 bg-[#171212]/80 opacity-70"
                  }`}
                >
                  <div>
                    <div className="flex gap-3.5">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image || "/images/pizza-generic/pizza-1.webp"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/images/pizza-generic/pizza-1.webp";
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-bold text-white text-sm truncate">
                            {item.name}
                          </h3>
                        </div>
                        <span className="text-[11px] text-white/45 block mt-0.5">
                          {categoryNameMap[item.category] || item.category}
                        </span>

                        {/* Clean Badges */}
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {item.is_best_seller && (
                            <span className="rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">
                              Best Seller
                            </span>
                          )}
                          {item.is_new && (
                            <span className="rounded bg-sky-500/15 border border-sky-500/30 px-1.5 py-0.5 text-[9px] font-bold text-sky-400">
                              New Launch
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Clean Price Line */}
                    <div className="mt-3 rounded-lg border border-white/5 bg-black/30 px-3 py-1.5 text-xs text-white/80 font-mono">
                      {item.item_type === "pizza" ? (
                        <div className="flex justify-between">
                          <span>R: {formatCurrency(Number(item.price_regular || 0))}</span>
                          <span>M: {formatCurrency(Number(item.price_medium || 0))}</span>
                          <span>L: {formatCurrency(Number(item.price_large || 0))}</span>
                        </div>
                      ) : (
                        <span>Price: {formatCurrency(Number(item.price || 0))}</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Stock Switch + Edit/Delete */}
                  <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toggleAvailable(item)}
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition ${
                        item.is_available
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/15 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {item.is_available ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={12} />
                          <span>Out of Stock</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setForm({
                            id: item.id,
                            name: item.name,
                            description: item.description,
                            category: item.category,
                            itemType: item.item_type,
                            priceRegular:
                              item.price_regular !== null
                                ? String(item.price_regular)
                                : "",
                            priceMedium:
                              item.price_medium !== null
                                ? String(item.price_medium)
                                : "",
                            priceLarge:
                              item.price_large !== null
                                ? String(item.price_large)
                                : "",
                            price:
                              item.price !== null
                                ? String(item.price)
                                : "",
                            image: item.image,
                            isBestSeller: item.is_best_seller,
                            isNew: item.is_new,
                          });
                          setFormError(null);
                          setModalOpen(true);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                        title="Edit dish"
                      >
                        <Pencil size={12} />
                      </button>

                      <button
                        onClick={() => handleDelete(item)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        title="Delete dish"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Simple, Non-Over-Designed Add/Edit Modal (data-lenis-prevent, Scrollable) */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        >
          <div
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[85vh] overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-[#141414] p-5 sm:p-6 shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-white font-heading">
                {form.id ? "Edit Dish" : "Add Dish"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Dish Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Enter dish name"
                  className="h-10 w-full rounded-xl border border-white/15 bg-black/30 px-3 text-xs text-white outline-none focus:border-[#F6C453]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    className="h-10 w-full rounded-xl border border-white/15 bg-[#1c1c1c] px-2.5 text-xs text-white outline-none focus:border-[#F6C453]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Pricing Mode *
                  </label>
                  <select
                    value={form.itemType}
                    disabled={!!form.id}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        itemType: e.target.value as "pizza" | "simple",
                      }))
                    }
                    className="h-10 w-full rounded-xl border border-white/15 bg-[#1c1c1c] px-2.5 text-xs text-white outline-none focus:border-[#F6C453] disabled:opacity-50"
                  >
                    <option value="pizza">Pizza (3 Sizes)</option>
                    <option value="simple">Single Price</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Enter description or ingredients"
                  rows={2}
                  className="w-full rounded-xl border border-white/15 bg-black/30 p-2.5 text-xs text-white outline-none focus:border-[#F6C453]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  {form.itemType === "pizza"
                    ? "Prices by Size (₹) *"
                    : "Dish Price (₹) *"}
                </label>
                {form.itemType === "pizza" ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-white/40 block mb-0.5">
                        Regular
                      </span>
                      <input
                        type="number"
                        value={form.priceRegular}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            priceRegular: e.target.value,
                          }))
                        }
                        placeholder="Regular"
                        className="h-9 w-full rounded-lg border border-white/15 bg-black/30 px-2.5 text-xs text-white font-mono outline-none focus:border-[#F6C453]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block mb-0.5">
                        Medium
                      </span>
                      <input
                        type="number"
                        value={form.priceMedium}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            priceMedium: e.target.value,
                          }))
                        }
                        placeholder="Medium"
                        className="h-9 w-full rounded-lg border border-white/15 bg-black/30 px-2.5 text-xs text-white font-mono outline-none focus:border-[#F6C453]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block mb-0.5">
                        Large
                      </span>
                      <input
                        type="number"
                        value={form.priceLarge}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            priceLarge: e.target.value,
                          }))
                        }
                        placeholder="Large"
                        className="h-9 w-full rounded-lg border border-white/15 bg-black/30 px-2.5 text-xs text-white font-mono outline-none focus:border-[#F6C453]"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, price: e.target.value }))
                      }
                      placeholder="Price"
                      className="h-9 w-full rounded-lg border border-white/15 bg-black/30 px-3 text-xs text-white font-mono outline-none focus:border-[#F6C453]"
                    />
                  </div>
                )}
              </div>

              {/* Clean Checkboxes */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-2.5 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-white/80">
                  <input
                    type="checkbox"
                    checked={form.isBestSeller}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        isBestSeller: e.target.checked,
                      }))
                    }
                    className="h-3.5 w-3.5 rounded accent-[#D91F26]"
                  />
                  <span>Mark as Best Seller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-white/80">
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isNew: e.target.checked }))
                    }
                    className="h-3.5 w-3.5 rounded accent-[#D91F26]"
                  />
                  <span>Mark as New Launch</span>
                </label>
              </div>

              {/* Image Input */}
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Dish Image
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-2.5 text-center transition ${
                    isDragging
                      ? "border-[#F6C453] bg-[#F6C453]/10"
                      : "border-white/15 bg-black/20 hover:border-white/30"
                  }`}
                >
                  {form.image ? (
                    <div className="flex items-center gap-3 w-full">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/20 bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.image}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-xs font-semibold text-white truncate">
                          Image selected
                        </p>
                        <label className="cursor-pointer text-[11px] font-semibold text-[#F6C453] hover:underline">
                          <span>Change file</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileSelect(file);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, image: "" }))}
                        className="rounded bg-red-500/20 p-1.5 text-red-400 hover:bg-red-500/30"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 cursor-pointer py-1.5 w-full text-xs text-white/70">
                      <UploadCloud size={18} className="text-[#F6C453]" />
                      <span>Upload or drag photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <input
                  value={form.image}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, image: e.target.value }))
                  }
                  placeholder="Or paste image URL"
                  className="mt-1.5 h-8 w-full rounded-lg border border-white/10 bg-black/30 px-2.5 text-[11px] text-white outline-none focus:border-[#F6C453]"
                />
              </div>

              {formError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-xs text-red-400">
                  {formError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-white/10 px-3.5 py-1.5 text-xs font-bold text-white/70 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-[#D91F26] to-[#b3141a] px-5 py-1.5 text-xs font-bold text-white shadow-lg disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : form.id
                    ? "Update Item"
                    : "Create Item"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

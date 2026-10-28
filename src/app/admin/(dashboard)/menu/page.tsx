"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Star,
  Sparkles,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
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

const CATEGORIES = [
  "royal-special",
  "veg-special",
  "veg-feast",
  "veg-delight",
  "veg-treat",
  "simply-veg",
  "burger",
  "fries",
  "pasta",
  "wrap",
  "bread",
  "sides-other",
  "shake",
  "mocktail",
  "double-pizza",
  "combo",
  "dessert",
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
  const [items, setItems] = useState<AdminMenuRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadMenu = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/menu");
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to load menu.");
        return;
      }
      setItems(data.items);
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
      setFormError("Name is required.");
      return;
    }
    if (
      form.itemType === "pizza" &&
      (!form.priceRegular || !form.priceMedium || !form.priceLarge)
    ) {
      setFormError("Enter all three sizes' prices for a pizza.");
      return;
    }
    if (form.itemType === "simple" && !form.price) {
      setFormError("Enter a price.");
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      itemType: form.itemType,
      priceRegular:
        form.itemType === "pizza" ? Number(form.priceRegular) : undefined,
      priceMedium:
        form.itemType === "pizza" ? Number(form.priceMedium) : undefined,
      priceLarge:
        form.itemType === "pizza" ? Number(form.priceLarge) : undefined,
      price: form.itemType === "simple" ? Number(form.price) : undefined,
      image: form.image,
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
        setFormError(data.message || "Failed to save.");
        return;
      }
      setModalOpen(false);
      loadMenu();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailable(row: AdminMenuRow) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === row.id ? { ...i, is_available: !i.is_available } : i
      )
    );
    await adminFetch("/api/admin/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, isAvailable: !row.is_available }),
    });
  }

  async function handleDelete(row: AdminMenuRow) {
    if (!confirm(`Delete "${row.name}"? This can't be undone.`)) return;
    setItems((prev) => prev.filter((i) => i.id !== row.id));
    await adminFetch(`/api/admin/menu?id=${encodeURIComponent(row.id)}`, {
      method: "DELETE",
    });
  }

  const filtered = items.filter((item) => {
    const matchName = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || item.category === catFilter;
    return matchName && matchCat;
  });

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-bg/95 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-white sm:text-xl">
              Menu
            </h1>
            <p className="text-xs text-ink-secondary">
              {items.length} items total
            </p>
          </div>
          <button
            onClick={() => {
              setForm(EMPTY_FORM);
              setFormError(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-bright"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="h-10 w-full rounded-full border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white outline-none focus:border-accent"
            />
          </div>

          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="h-10 rounded-full border border-white/10 bg-white/5 px-3.5 text-sm text-white outline-none focus:border-accent"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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
            Loading menu...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-ink-secondary">
            No items match.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`flex flex-wrap items-center gap-4 rounded-2xl border p-4 transition ${
                  item.is_available
                    ? "border-white/10 bg-card"
                    : "border-white/5 bg-card/50 opacity-60"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{item.name}</span>
                    {item.is_best_seller && (
                      <Star size={13} className="text-amber-400" />
                    )}
                    {item.is_new && (
                      <Sparkles size={13} className="text-emerald-400" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {item.category}
                  </p>
                </div>

                <div className="text-sm text-white/80">
                  {item.item_type === "pizza"
                    ? `${formatCurrency(
                        Number(item.price_regular)
                      )} / ${formatCurrency(
                        Number(item.price_medium)
                      )} / ${formatCurrency(Number(item.price_large))}`
                    : formatCurrency(Number(item.price))}
                </div>

                <label className="flex items-center gap-2 text-xs text-white/60">
                  <input
                    type="checkbox"
                    checked={item.is_available}
                    onChange={() => toggleAvailable(item)}
                    className="h-4 w-4 accent-accent"
                  />
                  Available
                </label>

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
                        price: item.price !== null ? String(item.price) : "",
                        image: item.image,
                        isBestSeller: item.is_best_seller,
                        isNew: item.is_new,
                      });
                      setFormError(null);
                      setModalOpen(true);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/5"
                    aria-label="Edit"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-red-400/70 transition hover:bg-red-500/10"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
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
              <h2 className="text-lg font-semibold text-white">
                {form.id ? "Edit Item" : "Add Item"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Item name"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
              />

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Description"
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-accent"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-accent"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={form.itemType}
                  disabled={!!form.id}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      itemType: e.target.value as "pizza" | "simple",
                    }))
                  }
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-accent disabled:opacity-50"
                >
                  <option value="simple">Single Price Item</option>
                  <option value="pizza">Pizza (R / M / L)</option>
                </select>
              </div>

              {form.itemType === "pizza" ? (
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    value={form.priceRegular}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, priceRegular: e.target.value }))
                    }
                    placeholder="Regular ₹"
                    className="h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
                  />
                  <input
                    type="number"
                    value={form.priceMedium}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, priceMedium: e.target.value }))
                    }
                    placeholder="Medium ₹"
                    className="h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
                  />
                  <input
                    type="number"
                    value={form.priceLarge}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, priceLarge: e.target.value }))
                    }
                    placeholder="Large ₹"
                    className="h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
                  />
                </div>
              ) : (
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="Price ₹"
                  className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
                />
              )}

              <input
                value={form.image}
                onChange={(e) =>
                  setForm((f) => ({ ...f, image: e.target.value }))
                }
                placeholder="Image URL (e.g. /images/pizza-generic/pizza-1.webp)"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
              />

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={form.isBestSeller}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isBestSeller: e.target.checked }))
                    }
                    className="h-4 w-4 accent-accent"
                  />
                  Best Seller
                </label>

                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isNew: e.target.checked }))
                    }
                    className="h-4 w-4 accent-accent"
                  />
                  New Badge
                </label>
              </div>

              {formError && <p className="text-sm text-red-400">{formError}</p>}

              <button
                onClick={handleSave}
                disabled={saving}
                className="h-12 w-full rounded-xl bg-accent text-sm font-semibold text-white transition hover:bg-accent-bright disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : form.id
                  ? "Save Changes"
                  : "Create Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

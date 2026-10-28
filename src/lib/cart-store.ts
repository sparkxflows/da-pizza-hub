"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AppliedCoupon, CartLine } from "./types";

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  appliedCoupon: AppliedCoupon | null;
  couponError: string | null;
  couponLoading: boolean;
  addLine: (line: Omit<CartLine, "lineId">) => void;
  removeLine: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  subtotal: () => number;
  discount: () => number;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      appliedCoupon: null,
      couponError: null,
      couponLoading: false,

      addLine: (line) =>
        set((state) => ({
          lines: [
            ...state.lines,
            {
              ...line,
              lineId: `line_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            },
          ],
        })),

      removeLine: (lineId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.lineId !== lineId),
        })),

      updateQuantity: (lineId, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (l.lineId === lineId ? { ...l, quantity } : l))
            .filter((l) => l.quantity > 0),
        })),

      clearCart: () =>
        set({
          lines: [],
          appliedCoupon: null,
          couponError: null,
        }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      applyCoupon: async (code: string) => {
        const currentSubtotal = get().subtotal();
        set({ couponLoading: true, couponError: null });
        try {
          const res = await fetch("/api/coupons/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, subtotal: currentSubtotal }),
          });
          const data = await res.json();
          if (data.success) {
            set({
              appliedCoupon: {
                code: code.trim().toUpperCase(),
                discount: data.discount,
                description: data.description,
              },
              couponError: null,
              couponLoading: false,
            });
          } else {
            set({
              appliedCoupon: null,
              couponError: data.message,
              couponLoading: false,
            });
          }
        } catch {
          set({
            appliedCoupon: null,
            couponError: "Couldn't check that coupon — please try again.",
            couponLoading: false,
          });
        }
      },

      removeCoupon: () => set({ appliedCoupon: null, couponError: null }),

      subtotal: () =>
        get().lines.reduce(
          (sum, line) => sum + line.unitPrice * line.quantity,
          0
        ),

      discount: () => get().appliedCoupon?.discount ?? 0,

      total: () => Math.max(0, get().subtotal() - get().discount()),

      itemCount: () =>
        get().lines.reduce((sum, line) => sum + line.quantity, 0),
    }),
    {
      name: "dph-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lines: state.lines,
        appliedCoupon: state.appliedCoupon,
      }),
    }
  )
);

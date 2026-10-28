"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Customer, CustomerAddress, Order } from "./types";

interface CustomerStoreState {
  customer: Customer | null;
  addresses: CustomerAddress[];
  isAuthModalOpen: boolean;
  authModalTab: "phone" | "supabase";
  isLoading: boolean;
  
  // Actions
  setCustomer: (customer: Customer | null) => void;
  setAddresses: (addresses: CustomerAddress[]) => void;
  openAuthModal: (tab?: "phone" | "supabase") => void;
  closeAuthModal: () => void;
  fetchProfile: () => Promise<void>;
  fetchAddresses: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useCustomerStore = create<CustomerStoreState>()(
  persist(
    (set, get) => ({
      customer: null,
      addresses: [],
      isAuthModalOpen: false,
      authModalTab: "phone",
      isLoading: false,

      setCustomer: (customer) => set({ customer }),
      setAddresses: (addresses) => set({ addresses }),

      openAuthModal: (tab = "phone") =>
        set({ isAuthModalOpen: true, authModalTab: tab }),

      closeAuthModal: () => set({ isAuthModalOpen: false }),

      fetchProfile: async () => {
        try {
          const res = await fetch("/api/customer/me");
          const data = await res.json();
          if (data.authenticated && data.customer) {
            set({ customer: data.customer });
            get().fetchAddresses();
          } else {
            set({ customer: null });
          }
        } catch {
          // ignore network failure
        }
      },

      fetchAddresses: async () => {
        try {
          const res = await fetch("/api/customer/addresses");
          const data = await res.json();
          if (data.success && Array.isArray(data.addresses)) {
            set({ addresses: data.addresses });
          }
        } catch {
          // ignore
        }
      },

      logout: async () => {
        try {
          await fetch("/api/customer/me", { method: "POST" });
        } finally {
          set({ customer: null, addresses: [] });
        }
      },
    }),
    {
      name: "dph_customer_store_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        customer: state.customer,
        addresses: state.addresses,
      }),
    }
  )
);

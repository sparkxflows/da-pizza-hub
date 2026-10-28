"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShoppingBag,
  Smartphone,
  Banknote,
  CircleCheck,
  Tag,
  ArrowLeft,
  Check,
  Zap,
  Clock,
  Loader2,
  MapPin,
  RotateCcw,
  CreditCard,
} from "lucide-react";
import type { Branch, PaymentMethod, ScheduleMode } from "@/lib/types";
import { BRAND_CONFIG } from "@/lib/constants";
import { useCustomerStore } from "@/lib/customer-store";
import {
  findNearestBranch,
  formatCurrency,
  generateDeliverySlots,
} from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import { EXPO_EASE } from "@/components/motion/Reveal";

function Stepper({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: string[];
}) {
  return (
    <div className="flex items-center justify-center mb-12">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const completed = stepNum < currentStep;
        const active = stepNum === currentStep;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{
                  backgroundColor:
                    completed || active ? "#E53935" : "#171717",
                  borderColor:
                    completed || active
                      ? "#E53935"
                      : "rgba(255,255,255,0.1)",
                }}
                transition={{ duration: 0.4, ease: EXPO_EASE }}
                className="w-9 h-9 rounded-full border flex items-center justify-center text-sm font-semibold"
              >
                {completed ? <Check size={16} /> : stepNum}
              </motion.div>
              <span
                className={`text-xs whitespace-nowrap ${
                  active ? "text-ink-primary font-medium" : "text-ink-muted"
                }`}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="w-12 sm:w-20 h-px bg-white/10 mx-2 sm:mx-3 mb-6 relative overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: completed ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: EXPO_EASE }}
                  className="absolute inset-y-0 left-0 bg-accent"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DeliverySchedulePicker({
  mode,
  onModeChange,
  selectedSlot,
  onSlotChange,
}: {
  mode: ScheduleMode;
  onModeChange: (m: ScheduleMode) => void;
  selectedSlot: string | null;
  onSlotChange: (s: string) => void;
}) {
  const { today, tomorrow } = generateDeliverySlots();

  return (
    <div>
      <h3 className="text-sm font-semibold text-ink-secondary mb-3">
        When do you want it?
      </h3>
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <button
          type="button"
          onClick={() => onModeChange("now")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 ${
            mode === "now"
              ? "border-accent bg-accent/10 text-ink-primary"
              : "border-white/10 text-ink-secondary hover:border-white/25"
          }`}
        >
          <Zap size={15} className="text-gold" /> As Soon As Possible
        </button>
        <button
          type="button"
          onClick={() => onModeChange("scheduled")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 ${
            mode === "scheduled"
              ? "border-accent bg-accent/10 text-ink-primary"
              : "border-white/10 text-ink-secondary hover:border-white/25"
          }`}
        >
          <Clock size={15} className="text-gold" /> Schedule for Later
        </button>
      </div>

      {mode === "scheduled" && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-ink-muted mb-2">Today</p>
            <div className="flex flex-wrap gap-2">
              {today.length === 0 && (
                <p className="text-xs text-ink-muted">
                  No more slots available today.
                </p>
              )}
              {today.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => onSlotChange(slot.value)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                    selectedSlot === slot.value
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-white/10 text-ink-secondary hover:border-white/25"
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-ink-muted mb-2">Tomorrow</p>
            <div className="flex flex-wrap gap-2">
              {tomorrow.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => onSlotChange(slot.value)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                    selectedSlot === slot.value
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-white/10 text-ink-secondary hover:border-white/25"
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface NominatimItem {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const HANSI_POPULAR_LOCALITIES = [
  {
    name: "Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi (125033)",
    short: "Gandhi Market",
    landmark: "Near Ambedkar Chowk (Store)",
    lat: 29.0941994,
    lng: 75.9622477,
  },
  {
    name: "Ambedkar Chowk, Main Market, Hansi, Haryana (125033)",
    short: "Ambedkar Chowk",
    landmark: "Ambedkar Chowk",
    lat: 29.0950,
    lng: 75.9630,
  },
  {
    name: "Model Town, Hansi, Haryana (125033)",
    short: "Model Town",
    landmark: "Model Town Park",
    lat: 29.0985,
    lng: 75.9580,
  },
  {
    name: "Barsi Gate Market, Historical Gate, Hansi, Haryana (125033)",
    short: "Barsi Gate",
    landmark: "Barsi Gate",
    lat: 29.0925,
    lng: 75.9655,
  },
  {
    name: "Lal Sadak, Near City Police Post, Hansi, Haryana (125033)",
    short: "Lal Sadak",
    landmark: "Lal Sadak",
    lat: 29.0910,
    lng: 75.9610,
  },
  {
    name: "Main Bus Stand Road, Hansi, Haryana (125033)",
    short: "Bus Stand",
    landmark: "Bus Stand Road",
    lat: 29.0970,
    lng: 75.9660,
  },
  {
    name: "Nehru Market, Main Cloth Bazar, Hansi, Haryana (125033)",
    short: "Nehru Market",
    landmark: "Main Bazar",
    lat: 29.0935,
    lng: 75.9640,
  },
  {
    name: "Jind Road, Near Sisai Pul, Hansi, Haryana (125033)",
    short: "Jind Road",
    landmark: "Sisai Pul / Bypass",
    lat: 29.1020,
    lng: 75.9710,
  },
  {
    name: "Tosham Road, Hansi, Haryana (125033)",
    short: "Tosham Road",
    landmark: "Tosham Chungi",
    lat: 29.0880,
    lng: 75.9550,
  },
  {
    name: "Railway Road, Near Hansi Junction, Hansi (125033)",
    short: "Railway Station",
    landmark: "Railway Road",
    lat: 29.1050,
    lng: 75.9680,
  },
  {
    name: "Subhash Nagar, Hansi, Haryana (125033)",
    short: "Subhash Nagar",
    landmark: "Subhash Nagar",
    lat: 29.0965,
    lng: 75.9540,
  },
  {
    name: "Adarsh Nagar, Hansi, Haryana (125033)",
    short: "Adarsh Nagar",
    landmark: "Adarsh Nagar",
    lat: 29.0990,
    lng: 75.9510,
  },
  {
    name: "Hisar Road, Near PWD Rest House, Hansi (125033)",
    short: "Hisar Road",
    landmark: "Hisar Bypass",
    lat: 29.1010,
    lng: 75.9490,
  },
  {
    name: "Vikas Nagar, Hansi, Haryana (125033)",
    short: "Vikas Nagar",
    landmark: "Vikas Nagar",
    lat: 29.0930,
    lng: 75.9500,
  },
  {
    name: "Dhobi Ghat & Barsi Gate Colony, Hansi (125033)",
    short: "Barsi Colony",
    landmark: "Dhobi Ghat",
    lat: 29.0915,
    lng: 75.9670,
  },
];

function AddressAutocomplete({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (val: string) => void;
  onSelect: (loc: { address: string; lat: number; lng: number }) => void;
}) {
  const [results, setResults] = useState<NominatimItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter local Hansi localities based on search query
  const queryLower = value.toLowerCase().trim();
  const matchedHansi = HANSI_POPULAR_LOCALITIES.filter((loc) => {
    if (!queryLower || queryLower === "hansi") return true;
    return (
      loc.name.toLowerCase().includes(queryLower) ||
      loc.short.toLowerCase().includes(queryLower) ||
      loc.landmark.toLowerCase().includes(queryLower)
    );
  });

  async function searchNominatim(q: string) {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(false);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&countrycodes=in&limit=6&addressdetails=1&viewbox=75.5,29.35,76.4,28.85&bounded=0`,
        { signal: ctrl.signal }
      );
      if (!res.ok) throw new Error(`Nominatim responded with ${res.status}`);
      const json: NominatimItem[] = await res.json();
      setResults(json);
      setOpen(true);
      setActiveIndex(-1);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setResults([]);
      setError(true);
      setOpen(true);
    } finally {
      if (abortRef.current === ctrl) setLoading(false);
    }
  }

  function handlePick(item: NominatimItem) {
    onChange(item.display_name);
    setResults([]);
    setOpen(false);
    setActiveIndex(-1);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onSelect({
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    });
  }

  function handlePickHansi(loc: (typeof HANSI_POPULAR_LOCALITIES)[number]) {
    onChange(loc.name);
    setResults([]);
    setOpen(false);
    setActiveIndex(-1);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onSelect({
      address: loc.name,
      lat: loc.lat,
      lng: loc.lng,
    });
  }

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const trimmed = value.trim();
  const hasDropdown = open && (matchedHansi.length > 0 || results.length > 0);
  const showEmpty =
    !loading && !error && open && trimmed.length >= 3 && matchedHansi.length === 0 && results.length === 0;
  const showError = !loading && error && open && matchedHansi.length === 0;

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        value={value}
        placeholder="Type Hansi area (e.g. Gandhi Market, Model Town)..."
        onChange={(e) => {
          const val = e.target.value;
          onChange(val);
          setError(false);
          setOpen(true);
          if (timerRef.current) clearTimeout(timerRef.current);
          if (val.trim().length < 2) {
            abortRef.current?.abort();
            setResults([]);
            setLoading(false);
            return;
          }
          timerRef.current = setTimeout(() => {
            searchNominatim(val.trim());
          }, 350);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
          }
        }}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls="address-suggestions"
        className="w-full rounded-xl border border-white/10 bg-[#1B1B1B] px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-all focus:border-[#F6C453] focus:ring-1 focus:ring-[#F6C453]"
      />

      {/* Quick Hansi Location Chips */}
      <div className="mt-2.5">
        <span className="block text-[11px] font-semibold text-white/50 mb-1.5">
          📍 Quick Hansi Delivery Areas:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {HANSI_POPULAR_LOCALITIES.slice(0, 7).map((loc) => (
            <button
              key={loc.short}
              type="button"
              onClick={() => handlePickHansi(loc)}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/80 transition hover:border-[#F6C453] hover:bg-white/10 hover:text-white"
            >
              {loc.short}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="mt-2 text-xs text-gray-400">Searching address in Hansi...</div>
      )}

      {hasDropdown && (
        <div
          id="address-suggestions"
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-white/15 bg-[#181818] p-2 shadow-2xl backdrop-blur-xl"
        >
          {/* Matched Hansi Localities */}
          {matchedHansi.length > 0 && (
            <div className="mb-2">
              <span className="block px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#F6C453] uppercase">
                📍 Hansi Delivery Localities
              </span>
              <div className="space-y-1">
                {matchedHansi.map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => handlePickHansi(loc)}
                    className="flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left text-xs text-white transition hover:bg-white/10"
                  >
                    <MapPin size={14} className="text-[#D91F26] shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-medium text-white">{loc.name}</span>
                      <span className="text-[10px] text-white/50">Near {loc.landmark} • 100% Free Delivery</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Online OpenStreetMap results */}
          {results.length > 0 && (
            <div>
              <span className="block px-2.5 py-1 text-[10px] font-bold tracking-wider text-white/40 uppercase border-t border-white/10 pt-2">
                🌐 Other Map Locations
              </span>
              <div className="space-y-1">
                {results.map((item, idx) => (
                  <button
                    key={item.place_id}
                    type="button"
                    onClick={() => handlePick(item)}
                    className="flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    <MapPin size={13} className="text-white/40 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{item.display_name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showError && (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-xl border border-white/10 bg-[#1B1B1B] p-4 text-center text-sm text-gray-400">
          Couldn&apos;t search right now. Please select a Hansi area above.
        </div>
      )}

      {showEmpty && (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-xl border border-white/10 bg-[#1B1B1B] p-4 text-center text-sm text-gray-400">
          No address found. Try picking a Hansi area above.
        </div>
      )}
    </div>
  );
}

const GEO_ERRORS: Record<string, string> = {
  unsupported:
    "Location isn't supported on this browser. Please enter your address manually.",
  permission_denied:
    "Location permission denied. Please enter your address manually, or allow location access and try again.",
  timeout: "Location request timed out. Please try again.",
  unavailable:
    "Couldn't determine your location. Please try again or enter your address manually.",
  reverse_geocode_failed:
    "Found your location, but couldn't resolve it to an address. Please enter it manually.",
};

function UseCurrentLocationButton({
  onLocationFound,
}: {
  onLocationFound: (coords: { lat: number; lng: number }) => Promise<void>;
}) {
  const [fetching, setFetching] = useState(false);
  const [errKey, setErrKey] = useState<string | null>(null);

  function detect() {
    if (!("geolocation" in navigator)) {
      setErrKey("unsupported");
      return;
    }
    setFetching(true);
    setErrKey(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await onLocationFound({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        } catch {
          setErrKey("reverse_geocode_failed");
        } finally {
          setFetching(false);
        }
      },
      (err) => {
        setFetching(false);
        if (err.code === err.PERMISSION_DENIED) setErrKey("permission_denied");
        else if (err.code === err.TIMEOUT) setErrKey("timeout");
        else setErrKey("unavailable");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={detect}
        disabled={fetching || errKey === "unsupported"}
        className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/10 bg-[#1B1B1B] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5 disabled:opacity-60"
      >
        {fetching ? (
          <Loader2 size={16} className="animate-spin text-gold" />
        ) : (
          <MapPin size={16} className="text-gold" />
        )}
        {fetching ? "Fetching your location..." : "Use Current Location"}
      </button>

      {errKey && (
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-accent">{GEO_ERRORS[errKey]}</p>
          {errKey !== "unsupported" && (
            <button
              type="button"
              onClick={detect}
              className="flex shrink-0 items-center gap-1 text-xs font-semibold text-gold hover:underline"
            >
              <RotateCcw size={12} /> Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StepMotion({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.4, ease: EXPO_EASE }}
    >
      {children}
    </motion.div>
  );
}

function FieldGroup({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-secondary mb-1.5 block">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-accent">{error}</p>}
    </div>
  );
}

function StepFooter({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 mt-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-5 py-3.5 rounded-full border border-white/15 text-sm font-semibold hover:bg-white/5 transition-colors duration-300"
        >
          <ArrowLeft size={16} /> Back
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="magnetic-btn flex-1 py-3.5 rounded-full bg-accent hover:bg-accent-bright disabled:opacity-40 disabled:pointer-events-none text-white font-semibold transition-all duration-300 active:scale-95 shadow-accentGlow"
      >
        {nextLabel}
      </button>
    </div>
  );
}

const STEPS = ["Details", "Payment", "Review"];
const PHONE_REGEX = /^[6-9]\d{9}$/;

export function CheckoutClient({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotal());
  const discount = useCartStore((s) => s.discount());
  const baseTotal = useCartStore((s) => s.total());
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);
  const couponError = useCartStore((s) => s.couponError);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const clearCart = useCartStore((s) => s.clearCart);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{ message: string } | null>(
    null
  );
  const [couponCode, setCouponCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "Hansi");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("now");
  const [scheduledSlot, setScheduledSlot] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [nearestBranch, setNearestBranch] = useState<Branch>(branches[0]);
  const [deliverable, setDeliverable] = useState(true);

  const { customer, addresses, openAuthModal, fetchAddresses } = useCustomerStore();
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(false);

  // Auto-prefill customer info
  useEffect(() => {
    if (customer) {
      if (!name && customer.name) setName(customer.name);
      if (!phone && customer.phone) setPhone(customer.phone);
      fetchAddresses();
    }
  }, [customer, fetchAddresses]);

  const updateBranchCalc = useCallback(
    (res: ReturnType<typeof findNearestBranch>) => {
      setBranchId(res.branch.id);
      setNearestBranch(res.branch);
      setDistanceKm(res.distance);
      setDeliveryFee(res.fee);
      setDeliverable(res.deliverable);
    },
    []
  );

  // If customer has saved addresses and address field is empty, select default
  useEffect(() => {
    if (customer && addresses.length > 0 && !address) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      if (def) {
        setAddress(def.addressText);
        if (def.lat && def.lng) {
          setCoords({ lat: def.lat, lng: def.lng });
          const res = findNearestBranch(def.lat, def.lng, branches);
          updateBranchCalc(res);
        }
      }
    }
  }, [customer, addresses, address, branches, updateBranchCalc]);

  const inFlightRef = useRef(false);
  const idempotencyRef = useRef(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  const grandTotal = baseTotal + deliveryFee;
  const belowMinOrder = subtotal < BRAND_CONFIG.minOrder;
  const neededForMin = BRAND_CONFIG.minOrder - subtotal;
  const validPhone = PHONE_REGEX.test(phone);
  const validName = name.trim().length >= 2;
  const validAddress = address.trim().length >= 6;
  const validSchedule = scheduleMode === "now" || !!scheduledSlot;
  const canProceedStep1 =
    validName && validPhone && validAddress && validSchedule && deliverable;

  function handleApplyCoupon() {
    if (couponCode.trim()) applyCoupon(couponCode);
  }

  async function handlePlaceOrder() {
    if (belowMinOrder || !deliverable || inFlightRef.current) return;
    inFlightRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerLat: coords?.lat ?? nearestBranch?.lat ?? 29.0941994,
          customerLng: coords?.lng ?? nearestBranch?.lng ?? 75.9622477,
          branchId,
          orderType: "delivery",
          customerName: name,
          customerPhone: phone,
          deliveryAddress: address,
          items: lines,
          subtotal,
          discount,
          couponCode: appliedCoupon?.code ?? null,
          paymentMethod,
          scheduleMode,
          scheduledFor: scheduleMode === "scheduled" ? scheduledSlot : null,
          idempotencyKey: idempotencyRef.current,
          debugClientBranchName: nearestBranch?.name,
          debugClientDistance: distanceKm,
          debugClientDeliveryFee: deliveryFee,
          debugClientDeliverable: deliverable,
          debugClientTotal: grandTotal,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmitError({
          message:
            data.message || "We couldn't place your order. Please try again.",
        });
        return;
      }

      const lastOrder = {
        orderId: data.orderId,
        name,
        phone,
        address,
        branchId: data.branchId ?? branchId,
        total: data.total ?? grandTotal,
        paymentMethod,
        lines,
        placedAt: Date.now(),
        scheduleMode,
        scheduledFor: scheduleMode === "scheduled" ? scheduledSlot : null,
      };
      sessionStorage.setItem("dph_last_order", JSON.stringify(lastOrder));
      if (customer && saveAddressToAccount && address.trim().length >= 6) {
        fetch("/api/customer/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: "Home",
            addressText: address,
            lat: coords?.lat ?? null,
            lng: coords?.lng ?? null,
          }),
        }).catch(() => {});
      }
      clearCart();
      idempotencyRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      router.push("/order-confirmed");
    } catch {
      setSubmitError({
        message:
          "Something went wrong while placing your order. Please check your connection and try again.",
      });
    } finally {
      setSubmitting(false);
      inFlightRef.current = false;
    }
  }

  if (lines.length === 0) {
    return (
      <div className="min-h-screen bg-bg pt-28 pb-24 flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-4">
          <ShoppingBag size={26} className="text-ink-muted" />
        </div>
        <p className="text-ink-secondary mb-6">Your cart is empty.</p>
        <Link
          href="/menu"
          className="px-6 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-bright transition-colors"
        >
          Explore Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pt-28 pb-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold mb-10 text-center">
          Checkout
        </h1>

        <Stepper currentStep={step} steps={STEPS} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepMotion key="step1">
              <div className="bg-card rounded-3xl p-6 sm:p-8 border border-white/5">
                {!customer && (
                  <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">Have an account?</p>
                      <p className="text-[11px] text-ink-secondary">Sign in for 1-click address filling &amp; past bills.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openAuthModal("phone")}
                      className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-[#F6C453] hover:bg-white/20 transition"
                    >
                      Sign In
                    </button>
                  </div>
                )}

                <h2 className="font-semibold text-lg mb-6">Delivery Details</h2>

                <div className="space-y-4 mb-6">
                  <FieldGroup label="Full Name">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="input-field"
                    />
                  </FieldGroup>

                  <FieldGroup
                    label="Phone Number"
                    error={
                      phone.length > 0 && !validPhone
                        ? "Enter a valid 10-digit mobile number"
                        : undefined
                    }
                  >
                    <input
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="10-digit mobile number"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      className="input-field"
                    />
                  </FieldGroup>

                  <FieldGroup label="Delivery Address">
                    <div className="space-y-3">
                      {customer && addresses.length > 0 && (
                        <div className="mb-2">
                          <span className="block text-[11px] font-semibold text-white/60 mb-2">
                            Quick Select from Saved Addresses:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {addresses.map((a) => (
                              <button
                                key={a.id}
                                type="button"
                                onClick={() => {
                                  setAddress(a.addressText);
                                  if (a.lat && a.lng) {
                                    setCoords({ lat: a.lat, lng: a.lng });
                                    updateBranchCalc(findNearestBranch(a.lat, a.lng, branches));
                                  }
                                }}
                                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs transition ${
                                  address === a.addressText
                                    ? "border-[#D91F26] bg-[#D91F26]/15 text-white"
                                    : "border-white/10 bg-white/5 text-white/70 hover:text-white"
                                }`}
                              >
                                <MapPin size={12} className="text-[#F6C453]" />
                                <strong className="text-white">{a.label}:</strong>
                                <span className="max-w-[200px] truncate">{a.addressText}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <AddressAutocomplete
                        value={address}
                        onChange={setAddress}
                        onSelect={({ address: addr, lat, lng }) => {
                          setAddress(addr);
                          setCoords({ lat, lng });
                          updateBranchCalc(
                            findNearestBranch(lat, lng, branches)
                          );
                        }}
                      />

                      {customer && (
                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={saveAddressToAccount}
                            onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                            className="rounded border-white/20 bg-white/5 text-[#D91F26] focus:ring-0"
                          />
                          <span className="text-xs text-white/70">Save this address to my account</span>
                        </label>
                      )}

                      <div className="flex items-center gap-3 py-1">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-xs text-ink-muted">OR</span>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>

                      <UseCurrentLocationButton
                        onLocationFound={async ({ lat, lng }) => {
                          setCoords({ lat, lng });
                          updateBranchCalc(
                            findNearestBranch(lat, lng, branches)
                          );
                          const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&lat=${lat}&lon=${lng}`
                          );
                          if (!res.ok) {
                            throw new Error(
                              `Reverse geocoding failed with status ${res.status}`
                            );
                          }
                          const data = await res.json();
                          if (!data.display_name) {
                            throw new Error(
                              "Reverse geocoding returned no address"
                            );
                          }
                          setAddress(data.display_name);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      />
                    </div>
                  </FieldGroup>
                </div>

                <DeliverySchedulePicker
                  mode={scheduleMode}
                  onModeChange={setScheduleMode}
                  selectedSlot={scheduledSlot}
                  onSlotChange={setScheduledSlot}
                />

                {!deliverable && (
                  <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                    Sorry, we don&apos;t deliver to this address yet.
                  </div>
                )}
              </div>

              <StepFooter
                onNext={() => setStep(2)}
                nextDisabled={!canProceedStep1}
                nextLabel="Continue to Payment"
              />
            </StepMotion>
          )}

          {step === 2 && (
            <StepMotion key="step2">
              <div className="bg-card rounded-3xl p-6 sm:p-8 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-lg text-white">Payment Method</h2>
                  <span className="text-xs text-ink-muted">Step 2 of 3</span>
                </div>
                <p className="text-xs text-ink-muted mb-6">
                  Select payment mode for your Hansi delivery order.
                </p>

                <div className="grid gap-3">
                  {/* Option 1: Cash on Delivery & UPI (Combined, Always ON & Active, No separate selection needed) */}
                  <div className="relative flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/10 transition-all duration-300">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="h-11 w-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <Banknote size={22} className="text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base font-semibold text-white block">
                            Cash on Delivery / UPI
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        </div>
                        <span className="text-xs text-white/60 block mt-1">
                          Pay with Cash or scan QR via any UPI App (Google Pay, PhonePe, Paytm) when your order arrives.
                        </span>
                      </div>
                    </div>
                    <div className="flex h-6 w-6 rounded-full bg-emerald-500 text-black items-center justify-center shrink-0 ml-2">
                      <Check size={14} className="stroke-[3]" />
                    </div>
                  </div>

                  {/* Option 2: Online Payment Gateway (Cards, NetBanking, Wallets) -> COMING SOON */}
                  <div className="relative flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] opacity-60 cursor-not-allowed select-none transition-all duration-300">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <CreditCard size={22} className="text-white/50" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base font-medium text-white/70 block">
                            Online Payment Gateway
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Coming Soon
                          </span>
                        </div>
                        <span className="text-xs text-white/40 block mt-1">
                          Debit/Credit Cards, Net Banking & Wallets will be available soon.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <StepFooter
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
                nextLabel="Review Order"
              />
            </StepMotion>
          )}

          {step === 3 && (
            <StepMotion key="step3">
              <div className="bg-card rounded-3xl p-6 sm:p-8 border border-white/5">
                <h2 className="font-semibold text-lg mb-6">
                  Review Your Order
                </h2>

                <div className="space-y-3 mb-6">
                  {lines.map((line) => (
                    <div key={line.lineId} className="flex gap-3 items-center">
                      {line.image && (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface">
                          <Image
                            src={line.image}
                            alt={line.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block truncate">
                          {line.quantity}x {line.name}
                        </span>
                        {line.customizationSummary && (
                          <span className="text-xs text-ink-muted">
                            {line.customizationSummary}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-semibold shrink-0">
                        {formatCurrency(line.unitPrice * line.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-4 mb-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-gold/10 border border-gold/30 rounded-xl px-3.5 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <CircleCheck
                          size={15}
                          className="text-gold shrink-0"
                        />
                        <span className="text-xs font-semibold text-gold truncate">
                          {appliedCoupon.code} applied —{" "}
                          {appliedCoupon.description}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-xs text-ink-muted hover:text-accent transition-colors shrink-0 ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 bg-bg rounded-xl px-1.5 py-1.5 border border-white/5">
                        <Tag
                          size={14}
                          className="text-ink-muted ml-2 shrink-0"
                        />
                        <input
                          value={couponCode}
                          onChange={(e) =>
                            setCouponCode(e.target.value.toUpperCase())
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleApplyCoupon()
                          }
                          placeholder="Have a coupon code?"
                          className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-ink-muted min-w-0"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="text-xs font-semibold text-gold px-3 py-1.5 rounded-lg hover:bg-gold/10 transition-colors shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-accent mt-1.5 ml-1">
                          {couponError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-ink-secondary">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-gold">
                      <span>Discount</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-ink-secondary">
                    <span>Nearest Branch</span>
                    <span>{nearestBranch?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm text-ink-secondary">
                    <span>Distance</span>
                    <span>{distanceKm.toFixed(2)} km</span>
                  </div>
                  <div className="flex justify-between text-sm text-ink-secondary">
                    <span>Delivery Fee</span>
                    <span className="text-gold">
                      {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                {belowMinOrder && (
                  <div className="mt-4 px-4 py-3 rounded-xl bg-accent/10 border border-accent/30 text-sm text-accent-bright">
                    Add {formatCurrency(neededForMin)} more to reach the{" "}
                    {formatCurrency(BRAND_CONFIG.minOrder)} minimum order value.
                  </div>
                )}

                {!deliverable && (
                  <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    Sorry, we don&apos;t deliver to this address yet. Please go
                    back and update your address.
                  </div>
                )}

                {submitError && (
                  <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    {submitError.message}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-white/5 space-y-1.5 text-sm text-ink-secondary">
                  <p>
                    <span className="text-ink-muted">Name:</span> {name}
                  </p>
                  <p>
                    <span className="text-ink-muted">Phone:</span> {phone}
                  </p>
                  <p className="break-words">
                    <span className="text-ink-muted">Address:</span> {address}
                  </p>
                  <p>
                    <span className="text-ink-muted">Payment:</span>{" "}
                    Cash on Delivery / UPI
                  </p>
                  <p>
                    <span className="text-ink-muted">Delivery:</span>{" "}
                    {scheduleMode !== "now" && scheduledSlot
                      ? new Date(scheduledSlot).toLocaleString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "As soon as possible"}
                  </p>
                </div>
              </div>

              <StepFooter
                onBack={() => setStep(2)}
                onNext={handlePlaceOrder}
                nextLabel={
                  submitting
                    ? "Placing Order..."
                    : `Place Order — ${formatCurrency(grandTotal)}`
                }
                nextDisabled={submitting || belowMinOrder || !deliverable}
              />
            </StepMotion>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

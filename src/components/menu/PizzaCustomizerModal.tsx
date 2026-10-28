"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check, Minus, Plus } from "lucide-react";
import type {
  PizzaCustomization,
  PizzaMenuItem,
  PizzaSize,
} from "@/lib/types";
import {
  PIZZA_ADDONS,
  PIZZA_SIZES,
  TOPPING_PRICES,
  VEG_TOPPINGS,
} from "@/lib/constants";
import {
  buildCustomizationSummary,
  calculatePizzaUnitPrice,
  formatCurrency,
} from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import { EXPO_EASE } from "@/components/motion/Reveal";

function AddonRow({
  label,
  price,
  checked,
  onToggle,
}: {
  label: string;
  price: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 ${
        checked
          ? "border-accent bg-accent/10"
          : "border-white/10 hover:border-white/25"
      }`}
    >
      <span className="text-sm text-ink-primary">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gold font-semibold">
          +{formatCurrency(price)}
        </span>
        <div
          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
            checked ? "bg-accent border-accent" : "border-white/25"
          }`}
        >
          {checked && <Check size={12} className="text-white" />}
        </div>
      </div>
    </button>
  );
}

export function PizzaCustomizerModal({
  item,
  onClose,
}: {
  item: PizzaMenuItem | null;
  onClose: () => void;
}) {
  const addLine = useCartStore((s) => s.addLine);
  const openCart = useCartStore((s) => s.openCart);

  const [size, setSize] = useState<PizzaSize>("medium");
  const [extraCheese, setExtraCheese] = useState(false);
  const [cheeseBurst, setCheeseBurst] = useState(false);
  const [panBase, setPanBase] = useState(false);
  const [extraToppings, setExtraToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setSize("medium");
    setExtraCheese(false);
    setCheeseBurst(false);
    setPanBase(false);
    setExtraToppings([]);
    setQuantity(1);
  }, [item?.id]);

  const customization: PizzaCustomization = useMemo(
    () => ({
      size,
      extraCheese,
      cheeseBurst,
      panBase,
      extraToppings,
    }),
    [size, extraCheese, cheeseBurst, panBase, extraToppings]
  );

  if (!item) return null;

  const basePrice = item.prices[size];
  const unitPrice = calculatePizzaUnitPrice(basePrice, customization);
  const totalPrice = unitPrice * quantity;
  const imgSrc = item.image || "/images/pizza-generic/pizza-1.webp";

  function handleAddToCart() {
    if (!item) return;
    const toppingNames = VEG_TOPPINGS.filter((t) =>
      extraToppings.includes(t.id)
    ).map((t) => t.name);

    addLine({
      itemId: item.id,
      name: `${item.name} (${PIZZA_SIZES[size].label})`,
      image: item.image,
      basePrice,
      quantity,
      customization,
      customizationSummary: buildCustomizationSummary(
        customization,
        toppingNames
      ),
      unitPrice,
    });
    onClose();
    openCart();
  }

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: EXPO_EASE }}
            data-lenis-prevent
            className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[85vh] bg-surface sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col shadow-card-hover"
          >
            <div className="relative h-44 sm:h-52 shrink-0">
              <Image
                src={imgSrc}
                alt={item.name}
                fill
                sizes="512px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors"
                aria-label="Close"
              >
                <X size={18} className="text-white" />
              </button>
              <div className="absolute bottom-4 left-5 right-5">
                <h2 className="font-display text-2xl font-semibold text-white">
                  {item.name}
                </h2>
                <p className="text-sm text-white/70">{item.description}</p>
              </div>
            </div>

            <div className="overflow-y-auto px-5 sm:px-6 py-5 flex-1 space-y-7">
              <div>
                <h3 className="text-sm font-semibold text-ink-primary mb-3">
                  Choose Size
                </h3>
                <div className="grid grid-cols-3 gap-2.5">
                  {(["regular", "medium", "large"] as PizzaSize[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`relative py-3 px-2 rounded-xl border text-center transition-all duration-300 ${
                        size === s
                          ? "border-accent bg-accent/10 text-white"
                          : "border-white/10 text-ink-secondary hover:border-white/25"
                      }`}
                    >
                      <span className="block text-sm font-semibold">
                        {PIZZA_SIZES[s].label}
                      </span>
                      <span className="block text-[10px] text-ink-muted mt-0.5">
                        {PIZZA_SIZES[s].note}
                      </span>
                      <span className="block text-xs font-bold mt-1.5 text-gold">
                        {formatCurrency(item.prices[s])}
                      </span>
                      {size === s && (
                        <motion.div
                          layoutId="size-check"
                          className="absolute -top-1.5 -right-1.5 bg-accent rounded-full p-0.5"
                        >
                          <Check size={12} className="text-white" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-ink-primary mb-3">
                  Add-ons
                </h3>
                <div className="space-y-2.5">
                  <AddonRow
                    label="Extra Cheese"
                    price={PIZZA_ADDONS.extraCheese[size]}
                    checked={extraCheese}
                    onToggle={() => setExtraCheese(!extraCheese)}
                  />
                  <AddonRow
                    label="Cheese Burst"
                    price={PIZZA_ADDONS.cheeseBurst[size]}
                    checked={cheeseBurst}
                    onToggle={() => setCheeseBurst(!cheeseBurst)}
                  />
                  <AddonRow
                    label="Pan Base"
                    price={PIZZA_ADDONS.panBase[size]}
                    checked={panBase}
                    onToggle={() => setPanBase(!panBase)}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-ink-primary mb-1">
                  Extra Toppings
                </h3>
                <p className="text-xs text-ink-muted mb-3">
                  {formatCurrency(TOPPING_PRICES[size])} each
                </p>
                <div className="flex flex-wrap gap-2">
                  {VEG_TOPPINGS.map((topping) => {
                    const selected = extraToppings.includes(topping.id);
                    return (
                      <button
                        key={topping.id}
                        onClick={() =>
                          setExtraToppings((prev) =>
                            prev.includes(topping.id)
                              ? prev.filter((id) => id !== topping.id)
                              : [...prev, topping.id]
                          )
                        }
                        className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-all duration-300 ${
                          selected
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-white/10 text-ink-secondary hover:border-white/25"
                        }`}
                      >
                        {topping.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-white/5 px-5 sm:px-6 py-4 bg-surface">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 bg-card rounded-full px-2 py-1.5">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1.5 rounded-full hover:bg-hover transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} className="text-white" />
                  </button>
                  <span className="text-sm font-semibold w-4 text-center text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1.5 rounded-full hover:bg-hover transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} className="text-white" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-ink-muted block leading-none mb-1">
                    Total
                  </span>
                  <span className="text-xl font-bold text-ink-primary">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="magnetic-btn w-full py-3.5 rounded-full bg-accent hover:bg-accent-bright text-white font-semibold transition-all duration-300 active:scale-95 shadow-accentGlow"
              >
                Add to Cart — {formatCurrency(totalPrice)}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

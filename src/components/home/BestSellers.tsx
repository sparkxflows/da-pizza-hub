"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import type { MenuItem, PizzaMenuItem } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { MenuCard } from "@/components/menu/MenuCard";
import { PizzaCustomizerModal } from "@/components/menu/PizzaCustomizerModal";

export function BestSellers({ items }: { items: MenuItem[] }) {
  const [customizing, setCustomizing] = useState<PizzaMenuItem | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Drag-to-scroll refs
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const scrollByDirection = useCallback((direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const step = 320; // 1 card width + gap

    if (direction === "right") {
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 30) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    } else {
      if (el.scrollLeft <= 30) {
        el.scrollTo({ left: el.scrollWidth - el.clientWidth, behavior: "smooth" });
      } else {
        el.scrollBy({ left: -step, behavior: "smooth" });
      }
    }
  }, []);

  // Automatic smooth left-to-right auto-slide every 2.4s (pauses on hover or touch)
  useEffect(() => {
    if (isPaused || items.length <= 4) return;

    const timer = setInterval(() => {
      scrollByDirection("right");
    }, 2400);

    return () => clearInterval(timer);
  }, [isPaused, items.length, scrollByDirection]);

  // Mouse drag handling
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const onMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  if (items.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-[#0a0a0a] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <Reveal>
          <div className="mb-8 sm:mb-10 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-2">
              <Flame size={15} className="text-[#FF9800]" />
              <span className="text-[11px] uppercase tracking-[0.3em] text-[#FF9800] font-semibold">
                FAN FAVOURITES
              </span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white">
              Best Sellers
            </h2>
            <p className="text-white/50 text-xs sm:text-sm mt-1">
              Auto-slides across all top items · Swipe or use edge buttons to explore
            </p>
          </div>
        </Reveal>

        {/* Carousel Container with Edge Navigation Buttons */}
        <div
          className="relative group/carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            onMouseUpOrLeave();
          }}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Edge Left Button */}
          <button
            type="button"
            onClick={() => {
              setIsPaused(true);
              scrollByDirection("left");
            }}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/85 border border-white/20 text-white shadow-2xl backdrop-blur-md opacity-80 hover:opacity-100 transition-all duration-300 hover:border-[#F6C453] hover:scale-110 active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Edge Right Button */}
          <button
            type="button"
            onClick={() => {
              setIsPaused(true);
              scrollByDirection("right");
            }}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/85 border border-white/20 text-white shadow-2xl backdrop-blur-md opacity-80 hover:opacity-100 transition-all duration-300 hover:border-[#F6C453] hover:scale-110 active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight size={22} />
          </button>

          {/* Scrollable Track */}
          <div
            ref={scrollContainerRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUpOrLeave}
            className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth select-none cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="w-[280px] sm:w-[310px] shrink-0"
              >
                <MenuCard item={item} onCustomize={setCustomizing} />
              </div>
            ))}
          </div>
        </div>

        {/* Clean Bottom Button: View All Best Sellers */}
        <div className="mt-8 text-center">
          <Link
            href="/menu?filter=bestsellers"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D91F26] to-[#b3141a] hover:from-[#e52830] hover:to-[#c41920] px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-xl transition hover:scale-105 active:scale-95"
          >
            <span>View All Best Sellers</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <PizzaCustomizerModal
        item={customizing}
        onClose={() => setCustomizing(null)}
      />
    </section>
  );
}

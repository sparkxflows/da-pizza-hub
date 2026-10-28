"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { MenuCategory, MenuItem } from "@/lib/types";

const FEATURED_PORTALS: {
  id: string;
  name: string;
  image: string;
  href: string;
  categories: MenuCategory[];
  glow: string;
}[] = [
  {
    id: "pizza",
    name: "Pizza",
    image: "/images/pizza-generic/pizza-6.webp",
    href: "/menu?cat=pizza",
    categories: [
      "royal-special",
      "veg-special",
      "veg-feast",
      "veg-delight",
      "veg-treat",
      "simply-veg",
    ],
    glow: "from-[#FF6B00] to-[#D91F26]",
  },
  {
    id: "burger",
    name: "Burger",
    image: "/images/burger/cheese-burger.webp",
    href: "/menu?cat=burger",
    categories: ["burger"],
    glow: "from-[#D91F26] to-[#7A0F16]",
  },
  {
    id: "pasta",
    name: "Pasta",
    image: "/images/pasta/white-sauce-pasta.webp",
    href: "/menu?cat=pasta",
    categories: ["pasta"],
    glow: "from-[#F6C453] to-[#D99C1A]",
  },
  {
    id: "garlic-bread",
    name: "Garlic Bread",
    image: "/images/bread/garlic-bread.webp",
    href: "/menu?cat=bread",
    categories: ["bread"],
    glow: "from-[#C58B45] to-[#8C5A2B]",
  },
  {
    id: "wraps",
    name: "Wraps",
    image: "/images/wrap/indian-veg-wrap.webp",
    href: "/menu?cat=wrap",
    categories: ["wrap"],
    glow: "from-[#E56B2E] to-[#A63C06]",
  },
  {
    id: "fries",
    name: "Fries",
    image: "/images/fries/cheese-fries.webp",
    href: "/menu?cat=fries",
    categories: ["fries"],
    glow: "from-[#FFB300] to-[#E65100]",
  },
  {
    id: "mocktails",
    name: "Mocktails",
    image: "/images/mocktail/mocktail-1.webp",
    href: "/menu?cat=mocktail",
    categories: ["mocktail"],
    glow: "from-[#27AE60] to-[#0B6B34]",
  },
  {
    id: "shakes",
    name: "Shakes",
    image: "/images/shake/chocolate-shake.webp",
    href: "/menu?cat=shake",
    categories: ["shake"],
    glow: "from-[#7E57C2] to-[#4527A0]",
  },
  {
    id: "desserts",
    name: "Desserts",
    image: "/images/dessert/choco-lava-cake.webp",
    href: "/menu?cat=dessert",
    categories: ["dessert"],
    glow: "from-[#F6C453] to-[#B8860B]",
  },
];

export function FeaturedCategories({ menuItems }: { menuItems: MenuItem[] }) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Drag-to-scroll state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const portals = FEATURED_PORTALS.map((portal) => {
    const count = menuItems.filter((item) =>
      portal.categories.includes(item.category)
    ).length;
    return {
      ...portal,
      items: `${count}+ Items`,
    };
  });

  // Calculate step size (1 item width + 24px gap)
  const getStepWidth = () => {
    if (!scrollContainerRef.current) return 300;
    const el = scrollContainerRef.current;
    const firstChild = el.firstElementChild as HTMLElement | null;
    return firstChild ? firstChild.offsetWidth + 24 : el.clientWidth / 4;
  };

  // Check scroll positions & update active pagination dot
  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const step = getStepWidth();
    if (step > 0) {
      const idx = Math.round(el.scrollLeft / step);
      const maxIdx = Math.max(0, portals.length - 4);
      setActiveIndex(Math.min(maxIdx, Math.max(0, idx)));
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    updateScrollButtons();
    return () => el.removeEventListener("scroll", updateScrollButtons);
  }, [portals.length]);

  // Handle Left / Right navigation: Strictly 1 Single Item at a time!
  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const step = getStepWidth();

    if (direction === "right") {
      // If at end, wrap back to start smoothly
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 15) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        // Strictly move 1 single product forward
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    } else {
      // If at start, wrap back to end smoothly
      if (el.scrollLeft <= 15) {
        el.scrollTo({
          left: el.scrollWidth - el.clientWidth,
          behavior: "smooth",
        });
      } else {
        // Strictly move 1 single product backward
        el.scrollBy({ left: -step, behavior: "smooth" });
      }
    }
  };

  // Scroll to a specific item index
  const scrollToIndex = (idx: number) => {
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const step = getStepWidth();
    el.scrollTo({ left: idx * step, behavior: "smooth" });
  };

  // When clicking a card directly: smoothly advance 1 product forward unless dragging
  const handleCardClick = (idx: number) => {
    if (hasMovedRef.current) return;
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const step = getStepWidth();
    const currentIdx = Math.round(el.scrollLeft / step);

    if (idx >= currentIdx) {
      handleScroll("right");
    } else {
      handleScroll("left");
    }
  };

  // Mouse drag handlers for smooth manual swiping
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const onMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const totalDots = Math.max(1, portals.length - 3); // 6 steps on desktop

  return (
    <section className="relative overflow-hidden bg-bg py-24 lg:py-32">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[350px] bg-[#D91F26]/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[350px] bg-[#F6C453]/5 blur-[150px] pointer-events-none" />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        {/* Section Header with Left & Right Carousel Controls */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs uppercase tracking-[0.35em] text-[#F6C453] font-semibold">
                OUR HANDCRAFTED MENU
              </span>
              <Sparkles size={14} className="text-[#F6C453]" />
            </div>
            <h2 className="font-heading text-5xl lg:text-6xl text-white">
              Explore Categories
            </h2>
            <p className="text-sm text-white/60 mt-2">
              Showing 4 items at a time · Use arrows or drag to discover all categories
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/menu"
              scroll={false}
              className="hidden lg:flex items-center gap-2 font-semibold text-[#F6C453] hover:text-white transition-colors text-sm mr-2"
            >
              <span>View Full Menu</span>
              <ArrowRight size={16} />
            </Link>

            {/* Carousel Arrow Controls (Strictly 1 item step) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleScroll("left");
                }}
                aria-label="Previous menu category"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-300 hover:border-[#F6C453] hover:bg-[#F6C453] hover:text-black hover:scale-105 active:scale-95 shadow-lg"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleScroll("right");
                }}
                aria-label="Next menu category"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-300 hover:border-[#F6C453] hover:bg-[#F6C453] hover:text-black hover:scale-105 active:scale-95 shadow-lg"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* 4-Item Single Row Carousel Track (Smooth glide + drag + arrows) */}
        <div className="relative group/carousel">
          <div
            ref={scrollContainerRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUpOrLeave}
            onMouseLeave={onMouseUpOrLeave}
            className="flex gap-6 overflow-x-auto pb-6 pt-2 scroll-smooth scrollbar-none select-none cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {portals.map((portal, idx) => (
              <div
                key={portal.id}
                onClick={() => handleCardClick(idx)}
                className="w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0 group flex flex-col items-center select-none"
              >
                {/* Floating Circular Item with 3D Depth */}
                <div className="relative h-44 w-44 sm:h-52 sm:w-52 lg:h-56 lg:w-56 mb-5 pointer-events-none">
                  {/* Glowing colored aura behind the dish */}
                  <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${portal.glow} opacity-20 blur-2xl transition duration-500 group-hover:opacity-75 group-hover:scale-110`}
                  />
                  <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-500 group-hover:border-[#F6C453] group-hover:scale-105">
                    <Image
                      src={portal.image}
                      alt={portal.name}
                      fill
                      sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 25vw"
                      className="object-cover transition duration-700 group-hover:scale-115 group-hover:rotate-3"
                    />
                  </div>
                </div>

                {/* Card Container */}
                <div className="w-full rounded-[30px] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 text-center backdrop-blur-2xl transition-all duration-500 group-hover:border-[#F6C453]/60 group-hover:bg-white/10 group-hover:-translate-y-2 group-hover:shadow-[0_20px_45px_rgba(246,196,83,0.15)] flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-heading text-3xl tracking-wide text-white group-hover:text-[#F6C453] transition-colors">
                      {portal.name}
                    </h3>
                    <p className="mt-1.5 text-xs font-semibold text-white/50 tracking-wider uppercase">
                      {portal.items}
                    </p>
                  </div>

                  {/* Explore Menu button navigates without page jumping */}
                  <div className="mt-5 flex items-center justify-center">
                    <Link
                      href={portal.href}
                      scroll={false}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#D91F26]/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#D91F26]/50"
                    >
                      Explore Menu
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Floating Left Edge Button - Prominently visible */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleScroll("left");
            }}
            aria-label="Scroll left"
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/85 border border-white/20 text-white shadow-2xl backdrop-blur-md opacity-75 hover:opacity-100 transition-all duration-300 hover:border-[#F6C453] hover:scale-110 z-30"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Floating Right Edge Button - Prominently visible */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleScroll("right");
            }}
            aria-label="Scroll right"
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/85 border border-white/20 text-white shadow-2xl backdrop-blur-md opacity-75 hover:opacity-100 transition-all duration-300 hover:border-[#F6C453] hover:scale-110 z-30"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Carousel Pagination Progress Indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalDots }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                scrollToIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === idx
                  ? "w-8 bg-gradient-to-r from-[#D91F26] to-[#F6C453]"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

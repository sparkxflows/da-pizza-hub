"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  CircleCheck,
  Navigation,
  MapPin,
  Phone,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import type { Branch } from "@/lib/types";
import { BRAND_CONFIG } from "@/lib/constants";
import { haversineDistanceKm } from "@/lib/format";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";
import {
  Reveal,
  StaggerContainer,
  staggerItemVariants,
} from "@/components/motion/Reveal";

const BRANCH_IMAGES = [
  "/images/branches/panki.webp",
  "/images/branches/raniya.webp",
  "/images/branches/rasulabad.webp",
  "/images/branches/jhinjhak.webp",
];

function SwiggyIcon() {
  return (
    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-[#FC8019] text-white text-[10px] font-bold shadow-sm shrink-0">
      swiggy
    </span>
  );
}

function ZomatoIcon() {
  return (
    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-[#CB202D] text-white text-[10px] font-black italic tracking-tighter shadow-sm shrink-0">
      zomato
    </span>
  );
}

interface BranchWithDistance extends Branch {
  distanceKm: number;
  withinRadius: boolean;
}

export function Branches({ branches }: { branches: Branch[] }) {
  const [geoState, setGeoState] = useState<
    "idle" | "loading" | "done" | "denied" | "unsupported" | "error"
  >("idle");
  const [sortedBranches, setSortedBranches] = useState<
    BranchWithDistance[] | null
  >(null);

  async function findNearestBranch() {
    setGeoState("loading");
    const result = await new Promise<
      | { status: "success"; lat: number; lng: number }
      | { status: "denied" | "unsupported" | "error"; message?: string }
    >((resolve) => {
      if (!("geolocation" in navigator)) {
        resolve({ status: "unsupported" });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            status: "success",
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            resolve({ status: "denied" });
          } else {
            resolve({ status: "error", message: err.message });
          }
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    });

    if (result.status === "success") {
      const computed = branches
        .map((b) => {
          const distanceKm = haversineDistanceKm(
            result.lat,
            result.lng,
            b.lat,
            b.lng
          );
          return {
            ...b,
            distanceKm,
            withinRadius:
              distanceKm <= BRAND_CONFIG.nearestBranchSearchRadiusKm,
          };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm);
      setSortedBranches(computed);
      setGeoState("done");
    } else {
      setGeoState(result.status);
    }
  }

  const displayList: (Branch | BranchWithDistance)[] =
    sortedBranches ?? branches;

  return (
    <section id="branches" className="py-24 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
            <div>
              <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">
                Find Us
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold">
                Our Branches
              </h2>
            </div>

            <button
              onClick={findNearestBranch}
              disabled={geoState === "loading"}
              className="magnetic-btn inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-bg text-sm font-semibold hover:bg-gold-dim disabled:opacity-70 transition-all duration-300 active:scale-95 shrink-0 w-fit"
            >
              {geoState === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Locating you...
                </>
              ) : geoState === "done" ? (
                <>
                  <CircleCheck size={16} /> Sorted by distance
                </>
              ) : (
                <>
                  <Navigation size={16} /> Find My Nearest Branch
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {geoState === "denied" && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-ink-muted bg-card rounded-xl px-4 py-3 mb-8"
              >
                Location access was denied — showing all branches below. You can
                enable location permission in your browser settings to see
                distances.
              </motion.p>
            )}
            {geoState === "unsupported" && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-ink-muted bg-card rounded-xl px-4 py-3 mb-8"
              >
                Your browser doesn&apos;t support location detection — showing
                all branches below.
              </motion.p>
            )}
            {geoState === "error" && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-ink-muted bg-card rounded-xl px-4 py-3 mb-8"
              >
                Couldn&apos;t detect your location right now — showing all
                branches below.
              </motion.p>
            )}
            {geoState === "done" &&
              sortedBranches &&
              !sortedBranches.some((b) => b.withinRadius) && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-gold bg-gold/10 rounded-xl px-4 py-3 mb-8"
                >
                  None of our branches are within{" "}
                  {BRAND_CONFIG.nearestBranchSearchRadiusKm} KM of your location
                  yet — here&apos;s your nearest one anyway.
                </motion.p>
              )}
          </AnimatePresence>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {displayList.map((branch, idx) => {
            const distBranch =
              "distanceKm" in branch ? (branch as BranchWithDistance) : null;
            const origIndex = branches.findIndex((b) => b.id === branch.id);
            const imgIdx = origIndex >= 0 ? origIndex : idx;

            return (
              <motion.div
                key={branch.id}
                layout
                variants={staggerItemVariants}
                whileHover={{ y: -4 }}
                className="bg-card rounded-2xl overflow-hidden border border-white/5 hover:border-gold/20 transition-colors duration-500"
              >
                <div className="relative aspect-[16/9]">
                  <Image
                    src={BRANCH_IMAGES[imgIdx % BRANCH_IMAGES.length]}
                    alt={branch.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <h3 className="absolute bottom-4 left-5 font-display text-xl font-semibold text-white">
                    {branch.name}
                  </h3>

                  {distBranch && (
                    <span
                      className={`absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${
                        distBranch.withinRadius
                          ? "bg-gold/90 text-bg"
                          : "bg-black/50 text-white/80"
                      }`}
                    >
                      {distBranch.distanceKm < 1
                        ? "< 1 KM away"
                        : `${distBranch.distanceKm.toFixed(1)} KM away`}
                    </span>
                  )}

                  {branch.id === "Panki" && !distBranch && (
                    <span className="absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gold/90 text-bg">
                      On Swiggy &amp; Zomato
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-sm text-ink-secondary mb-5 flex gap-2">
                    <MapPin
                      size={15}
                      className="shrink-0 mt-0.5 text-ink-muted"
                    />
                    {branch.address}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                    <a
                      href={`tel:${branch.phone}`}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors duration-300"
                    >
                      <Phone size={15} /> Call
                    </a>
                    <a
                      href={buildGeneralWhatsAppUrl(branch.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-sm font-medium transition-colors duration-300"
                    >
                      <MessageCircle size={15} /> WhatsApp
                    </a>
                  </div>

                  {(branch.swiggyUrl || branch.zomatoUrl) && (
                    <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                      {branch.swiggyUrl && (
                        <a
                          href={branch.swiggyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors duration-300"
                        >
                          <SwiggyIcon /> Swiggy
                        </a>
                      )}
                      {branch.zomatoUrl && (
                        <a
                          href={branch.zomatoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors duration-300"
                        >
                          <ZomatoIcon /> Zomato
                        </a>
                      )}
                    </div>
                  )}

                  <a
                    href={branch.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors duration-300"
                  >
                    <ExternalLink size={14} /> Get Directions
                  </a>
                </div>
              </motion.div>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

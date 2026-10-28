"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Instagram,
  Play,
  Heart,
  MessageCircle,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

const HANSI_INSTA_POSTS = [
  {
    id: "reel-1",
    type: "reel",
    badge: "Reel • 9.8k views",
    caption: "Signature Cheese Burst Pizza fresh out of the oven! 🧀🔥",
    image: "/images/pizza-named/da-paneer-special.webp",
    likes: "1.2k",
    comments: "84",
    link: "https://www.instagram.com/da_pizzahub_hansi/",
  },
  {
    id: "post-1",
    type: "post",
    badge: "Post • 1.1k likes",
    caption: "Tandoori Paneer Pizza loaded with fresh marinated paneer & veggies 🍕",
    image: "/images/pizza-named/tandoori-paneer-pizza.webp",
    likes: "1.1k",
    comments: "62",
    link: "https://www.instagram.com/da_pizzahub_hansi/",
  },
  {
    id: "reel-2",
    type: "reel",
    badge: "Reel • 14.2k views",
    caption: "Cheesy Garlic Bread pull that you simply can't resist! 🥖✨",
    image: "/images/bread/garlic-bread.webp",
    likes: "2.4k",
    comments: "145",
    link: "https://www.instagram.com/da_pizzahub_hansi/",
  },
  {
    id: "post-2",
    type: "post",
    badge: "Post • 890 likes",
    caption: "Weekend Family Combo vibes at Gandhi Market Hansi store ❤️",
    image: "/images/combos/combo-1.webp",
    likes: "890",
    comments: "41",
    link: "https://www.instagram.com/da_pizzahub_hansi/",
  },
  {
    id: "reel-3",
    type: "reel",
    badge: "Reel • 18.5k views",
    caption: "Molten center Choco Lava Cake — the ultimate sweet finish 🍫🤤",
    image: "/images/dessert/choco-lava-cake.webp",
    likes: "3.1k",
    comments: "198",
    link: "https://www.instagram.com/da_pizzahub_hansi/",
  },
];

export function InstagramGallery() {
  return (
    <section className="py-24 lg:py-32 bg-[#0A0A0A] relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-orange-500/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs uppercase tracking-[0.35em] text-[#F6C453] font-semibold">
                  OFFICIAL HANSI COMMUNITY
                </span>
                <Sparkles size={14} className="text-[#F6C453]" />
              </div>
              <h2 className="font-heading text-4xl sm:text-5xl text-white flex items-center gap-3 flex-wrap">
                <span>@da_pizzahub_hansi</span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300">
                  4.7K+ Foodies
                </span>
              </h2>
              <p className="text-sm text-white/60 mt-2 flex items-center gap-1.5">
                <MapPin size={15} className="text-red-400 shrink-0" />
                <span>Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi</span>
              </p>
            </div>

            <a
              href="https://www.instagram.com/da_pizzahub_hansi/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 text-white font-bold text-sm shadow-lg shadow-pink-600/25 hover:shadow-pink-600/40 hover:scale-105 active:scale-95 transition-all duration-300 w-fit"
            >
              <Instagram size={18} />
              <span>Follow on Instagram</span>
              <ExternalLink size={14} className="opacity-75" />
            </a>
          </div>
        </Reveal>

        {/* Curated 5-Card Hansi Instagram Reels & Posts Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {HANSI_INSTA_POSTS.map((item, idx) => (
            <motion.a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#141414] shadow-xl transition-all duration-500 hover:border-pink-500/40 hover:shadow-pink-500/10"
            >
              {/* Media Container with 4:5 aspect ratio */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-900">
                <Image
                  src={item.image}
                  alt={item.caption}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

                {/* Top Type Badge (Reel / Post) */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md border border-white/10">
                    {item.type === "reel" ? (
                      <Play size={11} className="fill-white text-white" />
                    ) : (
                      <Instagram size={11} className="text-pink-400" />
                    )}
                    {item.badge}
                  </span>

                  <div className="h-7 w-7 rounded-full bg-black/50 border border-white/15 flex items-center justify-center text-white/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={12} />
                  </div>
                </div>

                {/* Bottom Caption & Engagement on Image */}
                <div className="absolute bottom-0 inset-x-0 p-4 z-10">
                  <p className="text-xs text-white/90 line-clamp-2 leading-relaxed font-medium">
                    {item.caption}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10 text-white/70 text-[11px]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 hover:text-pink-400 transition-colors">
                        <Heart size={13} className="text-pink-400 fill-pink-400/30" />
                        {item.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={13} />
                        {item.comments}
                      </span>
                    </div>
                    <span className="text-[10px] text-pink-300 font-semibold group-hover:underline flex items-center gap-0.5">
                      Watch Reel ↗
                    </span>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

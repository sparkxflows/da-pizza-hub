"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CircleCheck, Send } from "lucide-react";
import type { Branch } from "@/lib/types";

export function ContactForm({ primaryBranch }: { primaryBranch: Branch }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit =
    name.trim().length > 0 &&
    phone.trim().length > 0 &&
    message.trim().length > 0;

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-[#F6C453]">
              SEND MESSAGE
            </span>
            <h2 className="mt-5 font-heading text-5xl text-white lg:text-6xl">
              We&apos;d Love To
              <br />
              Hear From You
            </h2>
            <p className="mt-8 max-w-lg text-lg leading-8 text-white/60">
              Whether it&apos;s feedback, catering enquiries, birthday
              celebrations or franchise opportunities, simply fill the form and
              our team will contact you shortly.
            </p>

            <div className="mt-12 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="font-semibold text-white">Fast Response</h3>
                <p className="mt-2 text-white/60">
                  Usually within 15–30 minutes.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="font-semibold text-white">
                  100% Customer Support
                </h3>
                <p className="mt-2 text-white/60">
                  Friendly support for every enquiry.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl"
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366]/15">
                  <CircleCheck size={32} className="text-[#25D366]" />
                </div>
                <h3 className="text-2xl font-semibold text-white">
                  Opening WhatsApp...
                </h3>
                <p className="mt-3 max-w-xs text-white/60">
                  Your message is ready to send on WhatsApp. If it didn&apos;t
                  open automatically,{" "}
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-[#F6C453] underline underline-offset-2 hover:text-white"
                  >
                    try again
                  </button>
                  .
                </p>
              </div>
            ) : (
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!canSubmit) return;
                  const body = [
                    "New enquiry from the Da Pizza Hub website contact form",
                    "",
                    `Name: ${name}`,
                    `Phone: ${phone}`,
                    email ? `Email: ${email}` : null,
                    subject ? `Subject: ${subject}` : null,
                    "",
                    `Message: ${message}`,
                  ]
                    .filter(Boolean)
                    .join("\n");
                  const url = `https://wa.me/${
                    primaryBranch.whatsapp
                  }?text=${encodeURIComponent(body)}`;
                  window.open(url, "_blank", "noopener,noreferrer");
                  setSubmitted(true);
                }}
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    required
                    className="h-14 rounded-2xl border border-white/10 bg-black/20 px-5 text-white outline-none transition focus:border-[#F6C453]"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    required
                    className="h-14 rounded-2xl border border-white/10 bg-black/20 px-5 text-white outline-none transition focus:border-[#F6C453]"
                  />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-black/20 px-5 text-white outline-none transition focus:border-[#F6C453]"
                />
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-black/20 px-5 text-white outline-none transition focus:border-[#F6C453]"
                />
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help..."
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/20 p-5 text-white outline-none transition focus:border-[#F6C453]"
                />
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] text-lg font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(217,31,38,.35)] disabled:opacity-40 disabled:pointer-events-none disabled:hover:scale-100"
                >
                  <Send size={20} />
                  Send Message
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

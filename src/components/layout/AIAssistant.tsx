"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles, Send } from "lucide-react";
import { EXPO_EASE } from "@/components/motion/Reveal";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  suggestions?: string[];
}

const INITIAL_MESSAGE: ChatMessage = {
  id: "init",
  role: "assistant",
  text: "Hi! I'm the Da Pizza Hub assistant. Ask me about our menu, prices, branches, or delivery.",
  suggestions: [
    "Show best sellers",
    "Where are your branches?",
    "Do you deliver to me?",
  ],
};

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  async function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      await new Promise((r) => setTimeout(r, 400));
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: "assistant",
            text: data.reply.text,
            suggestions: data.reply.suggestions,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: "assistant",
          text: "Sorry, I'm having trouble right now. Please call us directly!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-24 right-4 sm:right-6 lg:bottom-6 z-[90] w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-accent shadow-accentGlow flex items-center justify-center"
        aria-label="Open AI Assistant"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={20} className="text-white sm:hidden" />
              <X size={22} className="hidden text-white sm:block" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Sparkles size={20} className="text-white sm:hidden" />
              <Sparkles size={22} className="hidden text-white sm:block" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: EXPO_EASE }}
            data-lenis-prevent
            className="fixed bottom-40 right-4 sm:right-6 lg:bottom-24 z-[90] w-[calc(100vw-2rem)] sm:w-96 h-[60vh] sm:h-[500px] max-h-[65vh] sm:max-h-[70vh] glass rounded-3xl flex flex-col overflow-hidden shadow-card-hover"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 shrink-0">
              <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
                <Sparkles size={16} className="text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  DPH Assistant
                </h3>
                <span className="text-[11px] text-ink-muted">
                  Ask me anything about our menu
                </span>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="max-w-[85%]">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === "user"
                          ? "bg-accent text-white rounded-br-md"
                          : "bg-card text-ink-primary rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.suggestions && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.suggestions.map((sug) => (
                          <button
                            key={sug}
                            onClick={() => sendMessage(sug)}
                            className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-ink-secondary hover:border-gold/40 hover:text-gold transition-colors duration-300"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-card rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: 0.2 * i,
                        }}
                        className="w-1.5 h-1.5 rounded-full bg-ink-muted"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2 px-4 py-3 border-t border-white/5 shrink-0"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about menu, price, delivery..."
                className="flex-1 bg-card border border-white/10 rounded-full px-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:border-gold/40 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 rounded-full bg-accent hover:bg-accent-bright disabled:opacity-40 transition-colors duration-300 shrink-0"
                aria-label="Send message"
              >
                <Send size={16} className="text-white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

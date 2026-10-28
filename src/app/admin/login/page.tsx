"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { saveAdminToken } from "@/lib/admin-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Incorrect password.");
        return;
      }
      saveAdminToken(data.token);
      router.push("/admin/orders");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-card p-8"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Lock size={26} />
          </div>
          <h1 className="text-xl font-semibold text-white">Staff Login</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Enter your admin password to view and manage orders.
          </p>
        </div>

        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="h-14 w-full rounded-2xl border border-white/10 bg-black/20 px-5 text-white outline-none transition focus:border-accent"
        />

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading || password.length === 0}
          className="mt-6 flex h-14 w-full items-center justify-center rounded-2xl bg-accent text-base font-semibold text-white transition hover:bg-accent-bright disabled:opacity-40 disabled:pointer-events-none"
        >
          {loading ? "Checking..." : "Log In"}
        </button>
      </form>
    </div>
  );
}

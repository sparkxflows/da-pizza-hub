"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch, getAdminToken } from "@/lib/admin-client";

export function AdminAuthGate({
  serverAuthed,
  children,
}: {
  serverAuthed: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(() => {
    if (serverAuthed) return true;
    if (typeof window !== "undefined") {
      return Boolean(getAdminToken());
    }
    return false;
  });

  useEffect(() => {
    if (serverAuthed) {
      setAllowed(true);
      return;
    }
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    // Verify in background without blocking navigation
    adminFetch("/api/admin/stats")
      .then((res) => {
        if (res.ok) {
          setAllowed(true);
        } else {
          router.replace("/admin/login");
        }
      })
      .catch(() => {
        router.replace("/admin/login");
      });
  }, [serverAuthed, router]);

  if (!allowed) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-sm text-ink-secondary">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#D91F26] border-t-transparent rounded-full animate-spin" />
          <span>Loading admin panel...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

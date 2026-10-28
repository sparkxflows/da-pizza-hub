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
  const [allowed, setAllowed] = useState(serverAuthed);

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
    adminFetch("/api/admin/stats")
      .then((res) => {
        if (res.ok) setAllowed(true);
        else router.replace("/admin/login");
      })
      .catch(() => {
        router.replace("/admin/login");
      });
  }, [serverAuthed, router]);

  if (!allowed) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-sm text-ink-secondary">
        Checking staff session...
      </div>
    );
  }

  return <>{children}</>;
}

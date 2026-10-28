import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";

export const dynamic = "force-dynamic";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = isAdminAuthenticated();

  return (
    <AdminAuthGate serverAuthed={authed}>
      <div className="min-h-screen bg-bg text-ink-primary lg:flex">
        <AdminNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </AdminAuthGate>
  );
}

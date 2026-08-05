import { Outlet } from "@tanstack/react-router";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import { AdminProfileProvider } from "@/components/Admin/AdminProfileContext";
import RequirePermission from "@/components/Admin/RequirePermission";

export default function AdminLayout() {
  return (
    <AdminProfileProvider>
      <div className="flex gap-6 bg-blue-wash min-h-screen">
        <AdminSidebar />

        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-8">
            <RequirePermission>
              <Outlet />
            </RequirePermission>
          </main>
        </div>
      </div>
    </AdminProfileProvider>
  );
}

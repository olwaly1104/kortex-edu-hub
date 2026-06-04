import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

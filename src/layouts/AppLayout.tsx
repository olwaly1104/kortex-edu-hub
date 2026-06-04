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
        <footer className="py-3 px-6 border-t border-border/50">
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground/50">Powered by Kortex</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

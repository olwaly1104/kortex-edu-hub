import { useLocation, useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function RevDespTabs() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const base = pathname.startsWith("/admin/financas") ? "/admin/financas" : "/financas";
  const active: "receitas" | "despesas" = pathname.includes("/despesas") ? "despesas" : "receitas";

  const tabs = [
    { key: "receitas" as const, label: "Receitas", icon: TrendingUp, to: `${base}/receitas` },
    { key: "despesas" as const, label: "Despesas", icon: TrendingDown, to: `${base}/despesas` },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
      {tabs.map(t => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => !isActive && navigate(t.to)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

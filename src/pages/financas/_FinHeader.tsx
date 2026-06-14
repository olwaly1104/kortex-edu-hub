import { useEffect, useState, ReactNode } from "react";
import { GraduationCap, CalendarDays, Clock } from "lucide-react";

interface FinHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  right?: ReactNode;
  anoLetivo?: string;
}

export function FinHeader({ title, subtitle, icon, right, anoLetivo = "2024 / 2025" }: FinHeaderProps) {
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const liveTime = `${String(now.getHours()).padStart(2, "0")}h:${String(now.getMinutes()).padStart(2, "0")}min:${String(now.getSeconds()).padStart(2, "0")}s`;
  const todayLabel = new Date().toLocaleDateString("pt-PT", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 space-y-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold text-primary">
            <GraduationCap className="w-3.5 h-3.5" />
            Ano Letivo <span className="font-bold tabular-nums">{anoLetivo}</span>
          </span>
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight flex items-center gap-2">
              {icon}{title}
            </h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="inline-flex items-stretch rounded-md border border-border bg-card overflow-hidden text-[11px] uppercase tracking-wider font-medium shadow-sm">
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-foreground capitalize">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />{todayLabel}
            </span>
            <span className="w-px bg-border" />
            <span className="flex items-center gap-1.5 px-2.5 py-1 font-mono tabular-nums text-primary bg-muted/30">
              <Clock className="w-3.5 h-3.5" />{liveTime}
            </span>
          </div>
          {right}
        </div>
      </div>
    </div>
  );
}

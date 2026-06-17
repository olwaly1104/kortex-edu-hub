import { useEffect, useState, ReactNode } from "react";
import { GraduationCap, CalendarDays, Clock, Rocket } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { progressKey, isOnboardingCompleteFor } from "@/lib/onboardingStorage";

interface FinHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  right?: ReactNode;
  anoLetivo?: string;
}

// Core steps that gate the transition from "Onboarding" → "Ano Letivo".
// The institution is only considered "live" once registration is done and
// at least the academic backbone (calendar, faculties, courses) is in place.
const CORE_STEPS = ["inst.reg", "aca.cal", "aca.fac", "aca.cur"] as const;

function readProgress(email?: string | null): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(progressKey(email)) || "{}"); } catch { return {}; }
}

export function isInstitutionLive(email?: string | null): boolean {
  if (!isOnboardingCompleteFor(email)) return false;
  const p = readProgress(email);
  return CORE_STEPS.every((k) => !!p[k]);
}

export function FinHeader({ title, subtitle, icon, right, anoLetivo = "2024 / 2025" }: FinHeaderProps) {
  const { user } = useAuth();
  const [now, setNow] = useState<Date>(new Date());
  const [live, setLive] = useState<boolean>(() => isInstitutionLive(user?.email));

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Re-check phase when window regains focus or storage changes (other tabs/steps).
  useEffect(() => {
    const recheck = () => setLive(isInstitutionLive(user?.email));
    recheck();
    window.addEventListener("focus", recheck);
    window.addEventListener("storage", recheck);
    return () => {
      window.removeEventListener("focus", recheck);
      window.removeEventListener("storage", recheck);
    };
  }, [user?.email]);

  const liveTime = `${String(now.getHours()).padStart(2, "0")}h:${String(now.getMinutes()).padStart(2, "0")}min:${String(now.getSeconds()).padStart(2, "0")}s`;
  const todayLabel = new Date().toLocaleDateString("pt-PT", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
      <div className="flex items-start justify-between gap-3 flex-nowrap">
        <div className="min-w-0 space-y-2.5 flex-1">
          {live ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold text-primary">
              <GraduationCap className="w-3.5 h-3.5" />
              Ano Letivo <span className="font-bold tabular-nums">{anoLetivo}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold text-amber-800">
              <Rocket className="w-3.5 h-3.5" />
              Onboarding
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground leading-tight flex items-center gap-2 min-w-0">
              {icon}<span className="truncate">{title}</span>
            </h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="inline-flex items-stretch rounded-md border border-border bg-card overflow-hidden text-[11px] uppercase tracking-wider font-medium shadow-sm">
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-foreground capitalize">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />{todayLabel}
            </span>
            <span className="hidden sm:block w-px bg-border" />
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

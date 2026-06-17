import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { CalendarDays, Clock, ChevronRight, ShieldCheck, ClipboardCheck, Calendar, Megaphone } from "lucide-react";
import { ONBOARDING_GROUPS, readOnboardingProgress } from "@/components/admin/OnboardingStepBanner";

export default function FinancasInicio() {
  const { user } = useAuth();

  // Live clock
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const liveTime = `${String(now.getHours()).padStart(2, "0")}h:${String(now.getMinutes()).padStart(2, "0")}min:${String(now.getSeconds()).padStart(2, "0")}s`;
  const todayLabel = now.toLocaleDateString("pt-PT", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  // Onboarding chip — Finanças group
  const finGroup = ONBOARDING_GROUPS.find((g) => g.id === "fin")!;
  const [, setVersion] = useState(0);
  useEffect(() => {
    const refresh = () => setVersion((v) => v + 1);
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);
  const progress = readOnboardingProgress(user?.email);
  const doneSteps = finGroup.steps.filter((s) => progress[s.key]).length;
  const totalSteps = finGroup.steps.length;
  const nextStep = finGroup.steps.find((s) => !progress[s.key]);
  const onboardingHref = nextStep?.path || "/admin";
  const onboardingComplete = doneSteps === totalSteps;

  return (
    <div className="p-6 lg:p-8 space-y-4 animate-fade-in">
      {/* Date / time bar */}
      <div className="flex justify-end">
        <div className="inline-flex items-stretch rounded-md border border-border bg-card overflow-hidden text-[11px] uppercase tracking-wider font-medium shadow-sm">
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-foreground capitalize">
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />{todayLabel}
          </span>
          <span className="hidden sm:block w-px bg-border" />
          <span className="flex items-center gap-1.5 px-2.5 py-1 font-mono tabular-nums text-primary bg-muted/30">
            <Clock className="w-3.5 h-3.5" />{liveTime}
          </span>
        </div>
      </div>

      {/* Welcome + Onboarding */}
      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bom dia, {user?.name?.split(" ").pop()} 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Finanças — UPRA</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Link
              to={onboardingHref}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors px-3.5 py-2"
            >
              <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">Onboarding</p>
                <p className="text-xs font-semibold text-foreground tabular-nums">
                  {onboardingComplete ? "Concluído" : `${doneSteps}/${totalSteps} · ${nextStep?.title.split("—")[0].trim()}`}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-primary" />
            </Link>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ClipboardCheck className="w-3 h-3" />
              <span>Minha Presença</span>
              <span className="font-semibold text-foreground tabular-nums">0%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Agenda de Hoje + Anúncios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Agenda de Hoje</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Sem eventos hoje</p>
            <p className="text-xs text-muted-foreground mt-1">A sua agenda está livre.</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Anúncios</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
              <Megaphone className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Sem anúncios</p>
            <p className="text-xs text-muted-foreground mt-1">Não existem comunicados recentes.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

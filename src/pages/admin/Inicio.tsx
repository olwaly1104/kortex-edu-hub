import { Link, useNavigate } from "react-router-dom";
import { FinHeader } from "@/pages/financas/_FinHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Wallet, LifeBuoy, BookOpen, ArrowRight, CheckCircle2, Circle, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const ADMIN_PROGRESS_KEY = "upra.admin.config.progress";

function readProgress(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(ADMIN_PROGRESS_KEY) || "{}"); } catch { return {}; }
}

const CONFIG_STEPS = [
  { key: "fin", title: "Finanças — Configurar Receitas", desc: "Definir propinas por curso, taxas e serviços.", icon: Wallet, path: "/financas/configurar-receitas", area: "Finanças" },
  { key: "gap", title: "GAP — Configuração do gabinete", desc: "Categorias de solicitações, motivos de agendamento e canais.", icon: LifeBuoy, path: "/gap/configuracao", area: "GAP" },
  { key: "aca", title: "Área Académica — Criador curricular", desc: "Confirmar faculdades, gerar cadeiras e criar turmas.", icon: BookOpen, path: "/areaacademica/criador", area: "Académica" },
];

export default function AdminInicio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const progress = readProgress();
  const doneCount = CONFIG_STEPS.filter((s) => progress[s.key]).length;
  const pct = Math.round((doneCount / CONFIG_STEPS.length) * 100);

  const reset = () => {
    if (!confirm("Repor onboarding? Todos os dados introduzidos serão perdidos.")) return;
    localStorage.removeItem("upra.admin.onboarding");
    localStorage.removeItem(ADMIN_PROGRESS_KEY);
    navigate("/admin/onboarding");
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <FinHeader
        title={`Olá, ${user?.name || "Administrador"}`}
        subtitle="Painel de administração institucional"
        icon={<ShieldCheck className="w-5 h-5 text-primary" />}
        right={<Button variant="outline" size="sm" onClick={reset}><RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Repor onboarding</Button>}
      />

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-primary mb-1">Configuração detalhada</div>
            <h2 className="text-lg font-bold text-foreground">Completar perfil da instituição</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Os módulos abaixo são preenchidos pelas equipas responsáveis para finalizar a configuração.</p>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Progresso</div>
            <div className="text-2xl font-bold text-foreground tabular-nums">{pct}%</div>
            <div className="text-xs text-muted-foreground">{doneCount} de {CONFIG_STEPS.length} módulos</div>
          </div>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden mb-5">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {CONFIG_STEPS.map((s) => {
            const done = !!progress[s.key];
            const Icon = s.icon;
            return (
              <Link key={s.key} to={s.path} className="group rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                  {done ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{s.area}</div>
                <div className="text-sm font-semibold text-foreground mt-0.5">{s.title}</div>
                <div className="text-xs text-muted-foreground mt-1 mb-3">{s.desc}</div>
                <div className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                  Abrir módulo <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <KpiCard label="Estado da instituição" value="Ativa" hint="Onboarding concluído" tone="emerald" icon={Building2} />
        <KpiCard label="Módulos por configurar" value={String(CONFIG_STEPS.length - doneCount)} hint="A pendentes pelas equipas" tone="amber" icon={Circle} />
        <KpiCard label="Módulos configurados" value={String(doneCount)} hint="Configurações concluídas" tone="primary" icon={CheckCircle2} />
      </div>
    </div>
  );
}

function KpiCard({ label, value, hint, tone, icon: Icon }: { label: string; value: string; hint: string; tone: "emerald" | "amber" | "primary"; icon: React.ComponentType<{ className?: string }> }) {
  const toneMap = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    primary: "bg-primary/10 text-primary border-primary/20",
  } as const;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</div>
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${toneMap[tone]}`}><Icon className="w-4 h-4" /></div>
      </div>
      <div className="text-2xl font-bold text-foreground tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{hint}</div>
    </div>
  );
}

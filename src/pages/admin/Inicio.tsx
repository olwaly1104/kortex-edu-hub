import { Link, useNavigate } from "react-router-dom";
import { FinHeader } from "@/pages/financas/_FinHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2, Wallet, LifeBuoy, BookOpen, ArrowRight, CheckCircle2, Circle,
  RotateCcw, ShieldCheck, GraduationCap, Users, CalendarDays, Receipt,
  Banknote, FileText, Layers, School,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ADMIN_PROGRESS_KEY = "upra.admin.config.progress";

function readProgress(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(ADMIN_PROGRESS_KEY) || "{}"); } catch { return {}; }
}

type Task = {
  key: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
};

type Group = {
  area: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  tasks: Task[];
};

const GROUPS: Group[] = [
  {
    area: "Área Académica",
    subtitle: "Estrutura curricular e calendário",
    icon: GraduationCap,
    tasks: [
      { key: "aca.fac", title: "Faculdades e cursos", desc: "Confirmar faculdades e criar cursos da instituição.", icon: School, path: "/areaacademica/criador/faculdades" },
      { key: "aca.cad", title: "Cadeiras", desc: "Gerar cadeiras por curso, ano e semestre.", icon: BookOpen, path: "/areaacademica/criador/cadeiras" },
      { key: "aca.tur", title: "Turmas", desc: "Criar turmas e definir capacidade.", icon: Layers, path: "/areaacademica/criador/turmas" },
      { key: "aca.cal", title: "Calendário académico", desc: "Definir ano letivo, semestres e feriados.", icon: CalendarDays, path: "/areaacademica/criador/calendario" },
      { key: "aca.doc", title: "Corpo docente", desc: "Registar docentes e atribuir cadeiras.", icon: Users, path: "/areaacademica/docentes" },
    ],
  },
  {
    area: "Finanças",
    subtitle: "Receitas e tabelas financeiras",
    icon: Wallet,
    tasks: [
      { key: "fin.prop", title: "Propinas por curso", desc: "Definir valores de propinas por curso e ano.", icon: Banknote, path: "/financas/configurar-receitas" },
      { key: "fin.taxas", title: "Taxas e serviços", desc: "Configurar taxas administrativas e serviços académicos.", icon: Receipt, path: "/financas/configurar-receitas" },
    ],
  },
  {
    area: "GAP — Gabinete de Apoio",
    subtitle: "Atendimento e canais",
    icon: LifeBuoy,
    tasks: [
      { key: "gap.cfg", title: "Configuração do gabinete", desc: "Categorias de solicitações, motivos e canais.", icon: FileText, path: "/gap/configuracao" },
    ],
  },
];

const ALL_TASKS = GROUPS.flatMap((g) => g.tasks);

export default function AdminInicio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const progress = readProgress();
  const doneCount = ALL_TASKS.filter((t) => progress[t.key]).length;
  const pct = Math.round((doneCount / ALL_TASKS.length) * 100);

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
            <div className="text-[11px] uppercase tracking-wider font-semibold text-primary mb-1">Configuração da instituição</div>
            <h2 className="text-lg font-bold text-foreground">Tarefas para completar o perfil universitário</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Cada equipa configura a sua área. Conclua todas as tarefas para ativar a operação completa.</p>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Progresso global</div>
            <div className="text-2xl font-bold text-foreground tabular-nums">{pct}%</div>
            <div className="text-xs text-muted-foreground">{doneCount} de {ALL_TASKS.length} tarefas</div>
          </div>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {GROUPS.map((g) => {
        const GIcon = g.icon;
        const gDone = g.tasks.filter((t) => progress[t.key]).length;
        const gPct = Math.round((gDone / g.tasks.length) * 100);
        return (
          <div key={g.area} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><GIcon className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{g.area}</h3>
                  <p className="text-xs text-muted-foreground">{g.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-foreground tabular-nums">{gDone}/{g.tasks.length}</div>
                <div className="w-28 h-1.5 rounded-full bg-muted overflow-hidden mt-1">
                  <div className="h-full bg-primary transition-all" style={{ width: `${gPct}%` }} />
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {g.tasks.map((t) => {
                const done = !!progress[t.key];
                const Icon = t.icon;
                return (
                  <Link key={t.key} to={t.path} className="group rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all p-4 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-muted text-foreground flex items-center justify-center"><Icon className="w-4.5 h-4.5" /></div>
                      {done ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div className="text-sm font-semibold text-foreground">{t.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 mb-3 flex-1">{t.desc}</div>
                    <div className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      {done ? "Rever" : "Configurar agora"} <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="grid md:grid-cols-3 gap-3">
        <KpiCard label="Estado da instituição" value="Ativa" hint="Onboarding inicial concluído" tone="emerald" icon={Building2} />
        <KpiCard label="Tarefas pendentes" value={String(ALL_TASKS.length - doneCount)} hint="A concluir pelas equipas" tone="amber" icon={Circle} />
        <KpiCard label="Tarefas concluídas" value={String(doneCount)} hint="Configurações finalizadas" tone="primary" icon={CheckCircle2} />
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


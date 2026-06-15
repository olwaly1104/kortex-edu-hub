import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FinHeader } from "@/pages/financas/_FinHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2, Wallet, LifeBuoy, BookOpen, ArrowRight, CheckCircle2, Circle,
  RotateCcw, ShieldCheck, GraduationCap, Users, CalendarDays, Receipt,
  Banknote, FileText, Layers, School, ChevronDown, UserCog, Clock, Briefcase,
  UserPlus, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ADMIN_PROGRESS_KEY = "upra.admin.config.progress";

function readProgress(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(ADMIN_PROGRESS_KEY) || "{}"); } catch { return {}; }
}

type Step = {
  key: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
};

type Group = {
  id: string;
  area: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  steps: Step[];
};

const GROUPS: Group[] = [
  {
    id: "est",
    area: "Estudantes",
    title: "Adicionar Estudantes",
    subtitle: "Importar ou registar manualmente",
    icon: UserPlus,
    steps: [
      { key: "est.imp", title: "Registar estudantes", desc: "Importar lista CSV/Excel ou adicionar manualmente.", icon: Upload, path: "/admin/onboarding/estudantes?tab=importar&step=est.imp" },
    ],
  },
  {
    id: "aca",
    area: "Área Académica",
    title: "Configurar Área Académica",
    subtitle: "Estrutura curricular, turmas e calendário",
    icon: GraduationCap,
    steps: [
      { key: "aca.fac", title: "Faculdades e cursos", desc: "Confirmar faculdades e cursos da instituição.", icon: School, path: "/areaacademica/criador/faculdades?step=aca.fac" },
      { key: "aca.cad", title: "Cadeiras", desc: "Gerar cadeiras por curso, ano e semestre.", icon: BookOpen, path: "/areaacademica/criador/cadeiras?step=aca.cad" },
      { key: "aca.tur", title: "Turmas", desc: "Criar turmas e definir capacidade.", icon: Layers, path: "/areaacademica/criador/turmas?step=aca.tur" },
      { key: "aca.cal", title: "Calendário académico", desc: "Definir ano letivo, semestres e feriados.", icon: CalendarDays, path: "/areaacademica/criador/calendario?step=aca.cal" },
    ],
  },
  {
    id: "rh",
    area: "Recursos Humanos",
    title: "Configurar RH",
    subtitle: "Docentes, staff e regras de presença",
    icon: UserCog,
    steps: [
      { key: "rh.doc", title: "Registar docentes", desc: "Adicionar todos os docentes da instituição em lote.", icon: GraduationCap, path: "/admin/onboarding/docentes?step=rh.doc" },
      { key: "rh.staff", title: "Registar staff", desc: "Adicionar funcionários administrativos e técnicos.", icon: Briefcase, path: "/admin/onboarding/staff?step=rh.staff" },
      { key: "rh.pres", title: "Regras de presença", desc: "Definir limites de presença, tolerâncias e faltas justificadas.", icon: Clock, path: "/admin/onboarding/regras-presenca?step=rh.pres" },
    ],
  },
  {
    id: "fin",
    area: "Finanças",
    title: "Configurar Finanças",
    subtitle: "Receitas, propinas e tabelas financeiras",
    icon: Wallet,
    steps: [
      { key: "fin.prop", title: "Propinas por curso", desc: "Definir valores de propinas por curso e ano.", icon: Banknote, path: "/financas/configurar-receitas?step=fin.prop" },
      { key: "fin.taxas", title: "Emolumentos e serviços", desc: "Configurar emolumentos administrativos e serviços académicos.", icon: Receipt, path: "/financas/configurar-receitas?step=fin.taxas" },
      { key: "fin.multas", title: "Multas", desc: "Definir tabela de multas e penalidades aplicáveis.", icon: Receipt, path: "/financas/configurar-receitas?step=fin.multas" },
      { key: "fin.sal", title: "Confirmar salários", desc: "Bruto, imposto e líquido dos docentes e staff registados.", icon: Banknote, path: "/admin/onboarding/salarios?step=fin.sal" },
    ],
  },
  {
    id: "gap",
    area: "GAP",
    title: "Configurar GAP",
    subtitle: "Gabinete de apoio: solicitações, agendamentos e candidaturas",
    icon: LifeBuoy,
    steps: [
      { key: "gap.sol", title: "Solicitações", desc: "Categorias, motivos e estados das solicitações.", icon: FileText, path: "/gap/configuracao?tab=solicitacoes&step=gap.sol" },
      { key: "gap.age", title: "Agendamentos", desc: "Tipos de atendimento, salas e horários disponíveis.", icon: CalendarDays, path: "/gap/configuracao?tab=agendamentos&step=gap.age" },
      { key: "gap.cand", title: "Candidaturas", desc: "Processo de candidaturas, etapas e documentos.", icon: GraduationCap, path: "/gap/configuracao?tab=candidaturas&step=gap.cand" },
    ],
  },
];

const ALL_STEPS = GROUPS.flatMap((g) => g.steps);

export default function AdminInicio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const progress = readProgress();
  const doneCount = ALL_STEPS.filter((t) => progress[t.key]).length;
  const pct = Math.round((doneCount / ALL_STEPS.length) * 100);
  const [open, setOpen] = useState<string | null>(null);

  const reset = () => {
    if (!confirm("Repor onboarding? Todos os dados introduzidos serão perdidos.")) return;
    localStorage.removeItem("upra.admin.onboarding");
    localStorage.removeItem(ADMIN_PROGRESS_KEY);
    navigate("/admin/onboarding");
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
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
            <div className="text-xs text-muted-foreground">{doneCount} de {ALL_STEPS.length} passos</div>
          </div>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {GROUPS.map((g) => {
          const GIcon = g.icon;
          const gDone = g.steps.filter((t) => progress[t.key]).length;
          const gTotal = g.steps.length;
          const gPct = Math.round((gDone / gTotal) * 100);
          const isOpen = open === g.id;
          const complete = gDone === gTotal;
          return (
            <div key={g.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : g.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/40 transition-colors"
              >
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${complete ? "bg-emerald-50 text-emerald-700" : "bg-primary/10 text-primary"}`}>
                  <GIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground truncate">{g.title}</h3>
                    {complete && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{g.subtitle}</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  <div className="text-xs font-semibold text-foreground tabular-nums">{gDone}/{gTotal} passos</div>
                  <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full transition-all ${complete ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${gPct}%` }} />
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="border-t border-border bg-muted/20 p-5">
                  <ol className="space-y-2">
                    {g.steps.map((s, idx) => {
                      const done = !!progress[s.key];
                      const Icon = s.icon;
                      return (
                        <li key={s.key}>
                          <Link
                            to={s.path}
                            className="group flex items-center gap-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all p-4"
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${done ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                              {done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-foreground">{s.title}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                            </div>
                            <div className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all shrink-0">
                              {done ? "Rever" : "Configurar"} <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}


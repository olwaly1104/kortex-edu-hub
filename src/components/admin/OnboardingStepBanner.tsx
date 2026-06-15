import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, ShieldCheck, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

const PROGRESS_KEY = "upra.admin.config.progress";

type StepMeta = { key: string; title: string; desc: string; path: string };
type GroupMeta = { id: string; title: string; steps: StepMeta[] };

// Single source of truth — mirrors src/pages/admin/Inicio.tsx
export const ONBOARDING_GROUPS: GroupMeta[] = [
  {
    id: "est", title: "Adicionar Estudantes",
    steps: [
      { key: "est.imp", title: "Registar estudantes", desc: "Importar lista via CSV/Excel ou adicionar manualmente.", path: "/admin/onboarding/estudantes?tab=importar&step=est.imp" },
    ],
  },
  {
    id: "aca", title: "Configurar Área Académica",
    steps: [
      { key: "aca.fac", title: "Faculdades e cursos",   desc: "Confirmar faculdades, decanos e cursos da instituição.",        path: "/areaacademica/criador/faculdades?step=aca.fac" },
      { key: "aca.cad", title: "Cadeiras",              desc: "Alocar cadeiras por curso, ano, semestre e docente.",            path: "/areaacademica/criador/cadeiras?step=aca.cad" },
      { key: "aca.tur", title: "Turmas",                desc: "Gerar turmas e definir capacidade, sala e turno.",               path: "/areaacademica/criador/turmas?step=aca.tur" },
      { key: "aca.cal", title: "Calendário académico",  desc: "Definir ano letivo, semestres, exames, feriados e férias.",      path: "/areaacademica/criador/calendario?step=aca.cal" },
    ],
  },
  {
    id: "rh", title: "Configurar RH",
    steps: [
      { key: "rh.doc",   title: "Registar docentes",    desc: "Adicionar todos os docentes da instituição em lote.",            path: "/admin/onboarding/docentes?step=rh.doc" },
      { key: "rh.staff", title: "Registar staff",       desc: "Adicionar funcionários administrativos e técnicos.",             path: "/admin/onboarding/staff?step=rh.staff" },
      { key: "rh.pres",  title: "Regras de presença",   desc: "Limites de presença, tolerâncias e tipos de faltas.",            path: "/admin/onboarding/regras-presenca?step=rh.pres" },
    ],
  },
  {
    id: "fin", title: "Configurar Finanças",
    steps: [
      { key: "fin.prop",   title: "Propinas por curso",     desc: "Valores de propinas por curso e ano.",                       path: "/financas/configurar-receitas?step=fin.prop" },
      { key: "fin.taxas",  title: "Emolumentos e serviços", desc: "Emolumentos administrativos e serviços académicos.",         path: "/financas/configurar-receitas?step=fin.taxas" },
      { key: "fin.multas", title: "Multas",                 desc: "Tabela de multas e penalidades aplicáveis.",                 path: "/financas/configurar-receitas?step=fin.multas" },
      { key: "fin.sal",    title: "Confirmar salários",     desc: "Bruto, imposto e líquido dos docentes e staff registados.",  path: "/admin/onboarding/salarios?step=fin.sal" },
    ],
  },
  {
    id: "gap", title: "Configurar GAP",
    steps: [
      { key: "gap.sol",  title: "Solicitações",   desc: "Categorias, motivos e estados das solicitações.",                      path: "/gap/configuracao?tab=solicitacoes&step=gap.sol" },
      { key: "gap.age",  title: "Agendamentos",   desc: "Tipos de atendimento, salas e horários disponíveis.",                  path: "/gap/configuracao?tab=agendamentos&step=gap.age" },
      { key: "gap.cand", title: "Candidaturas",   desc: "Processo de candidaturas, etapas e documentos.",                       path: "/gap/configuracao?tab=candidaturas&step=gap.cand" },
    ],
  },
];

const STEP_TO_GROUP: Record<string, GroupMeta> = {};
const STEP_MAP: Record<string, StepMeta> = {};
ONBOARDING_GROUPS.forEach((g) => g.steps.forEach((s) => { STEP_TO_GROUP[s.key] = g; STEP_MAP[s.key] = s; }));

export function readOnboardingProgress(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}"); } catch { return {}; }
}
function markDone(key: string) {
  const cur = readOnboardingProgress();
  cur[key] = true;
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(cur)); } catch {}
}

/** Hook — true when an admin is currently inside an onboarding step (URL has ?step=valid-key). */
export function useIsOnboardingStep(stepKeyProp?: string): boolean {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const stepKey = stepKeyProp || params.get("step") || "";
  return user?.role === "admin" && !!STEP_TO_GROUP[stepKey];
}

export function OnboardingStepBanner({
  stepKey: stepKeyProp,
  actions,
}: {
  stepKey?: string;
  /** Optional contextual action buttons (e.g. "Confirmar Todas") rendered next to the primary CTA. */
  actions?: ReactNode;
}) {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const stepKey = stepKeyProp || params.get("step") || "";
  if (user?.role !== "admin") return null;
  const group = STEP_TO_GROUP[stepKey];
  if (!group) return null;

  const progress = readOnboardingProgress();
  const currentIdx = group.steps.findIndex((s) => s.key === stepKey);
  const current = group.steps[currentIdx];
  const doneCount = group.steps.filter((s) => progress[s.key]).length;
  const isCurrentDone = !!progress[stepKey];
  const nextStep = group.steps.slice(currentIdx + 1).find((s) => !progress[s.key]);
  const groupPct = Math.round((doneCount / group.steps.length) * 100);

  return (
    <div className="space-y-2">
      <Link to="/admin" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao onboarding
      </Link>
      <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden">
      {/* HERO */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary mb-1">
              <span>Onboarding institucional</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-muted-foreground normal-case tracking-normal font-medium">{group.title}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground normal-case tracking-normal font-medium tabular-nums">
                Passo {currentIdx + 1}/{group.steps.length}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2 flex-wrap">
              {current.title}
              {isCurrentDone && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Concluído
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{current.desc}</p>
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>

        {/* Mini progress + step strip */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">{doneCount} de {group.steps.length} passos concluídos neste grupo</span>
            <span className="font-semibold text-foreground tabular-nums">{groupPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${groupPct}%` }} />
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 pt-1">
            {group.steps.map((s, i) => {
              const done = !!progress[s.key];
              const active = s.key === stepKey;
              return (
                <li key={s.key}>
                  <Link
                    to={s.path}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition-colors ${
                      active
                        ? "border-primary bg-primary/15 text-foreground font-semibold"
                        : done
                          ? "border-emerald-200 bg-emerald-50/60 text-emerald-900 hover:bg-emerald-50"
                          : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      done ? "bg-emerald-500 text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {done ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                    </span>
                    <span className="truncate">{s.title}</span>
                    {active && !done && <Circle className="w-2 h-2 fill-primary text-primary ml-auto shrink-0" />}
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      </div>
    </div>
  );
}

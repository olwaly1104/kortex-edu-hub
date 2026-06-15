import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, ShieldCheck, CheckCircle2, Circle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PROGRESS_KEY = "upra.admin.config.progress";

type StepMeta = { key: string; title: string; path: string };
type GroupMeta = { id: string; title: string; steps: StepMeta[] };

// Mirrors the GROUPS structure in src/pages/admin/Inicio.tsx
const GROUPS: GroupMeta[] = [
  {
    id: "aca", title: "Configurar Área Académica",
    steps: [
      { key: "aca.fac", title: "Faculdades e cursos",     path: "/areaacademica/criador/faculdades?step=aca.fac" },
      { key: "aca.cad", title: "Cadeiras",                path: "/areaacademica/criador/cadeiras?step=aca.cad" },
      { key: "aca.tur", title: "Turmas",                  path: "/areaacademica/criador/turmas?step=aca.tur" },
      { key: "aca.cal", title: "Calendário académico",    path: "/areaacademica/criador/calendario?step=aca.cal" },
    ],
  },
  {
    id: "rh", title: "Configurar RH",
    steps: [
      { key: "rh.doc",   title: "Registar docentes",      path: "/areaacademica/docentes?step=rh.doc" },
      { key: "rh.staff", title: "Registar staff",         path: "/areaacademica/docentes?step=rh.staff" },
      { key: "rh.pres",  title: "Regras de presença",     path: "/areaacademica/docentes?step=rh.pres" },
    ],
  },
  {
    id: "fin", title: "Configurar Finanças",
    steps: [
      { key: "fin.prop",   title: "Propinas por curso",      path: "/financas/configurar-receitas?step=fin.prop" },
      { key: "fin.taxas",  title: "Emolumentos e serviços",  path: "/financas/configurar-receitas?step=fin.taxas" },
      { key: "fin.multas", title: "Multas",                  path: "/financas/configurar-receitas?step=fin.multas" },
    ],
  },
  {
    id: "gap", title: "Configurar GAP",
    steps: [
      { key: "gap.sol",  title: "Solicitações",   path: "/gap/configuracao?tab=solicitacoes&step=gap.sol" },
      { key: "gap.age",  title: "Agendamentos",   path: "/gap/configuracao?tab=agendamentos&step=gap.age" },
      { key: "gap.cand", title: "Candidaturas",   path: "/gap/configuracao?tab=candidaturas&step=gap.cand" },
    ],
  },
];

const STEP_TO_GROUP: Record<string, GroupMeta> = {};
GROUPS.forEach((g) => g.steps.forEach((s) => { STEP_TO_GROUP[s.key] = g; }));

function readProgress(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}"); } catch { return {}; }
}
function markDone(key: string) {
  const cur = readProgress();
  cur[key] = true;
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(cur)); } catch {}
}

export function OnboardingStepBanner({ stepKey: stepKeyProp }: { stepKey?: string }) {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const stepKey = stepKeyProp || params.get("step") || "";
  if (user?.role !== "admin") return null;
  const group = STEP_TO_GROUP[stepKey];
  if (!group) return null;

  const progress = readProgress();
  const currentIdx = group.steps.findIndex((s) => s.key === stepKey);
  const current = group.steps[currentIdx];
  const doneCount = group.steps.filter((s) => progress[s.key]).length;
  const isCurrentDone = !!progress[stepKey];
  const nextStep = group.steps.slice(currentIdx + 1).find((s) => !progress[s.key]);

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 mb-4 space-y-3">
      {/* Top row */}
      <div className="flex items-start gap-3 flex-wrap">
        <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary mb-0.5">
            <span>Onboarding institucional</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-muted-foreground normal-case tracking-normal font-medium">{group.title}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-foreground">
              Passo {currentIdx + 1} de {group.steps.length} · {current.title}
            </h2>
            {isCurrentDone && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                <CheckCircle2 className="w-3 h-3" /> Concluído
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {doneCount} de {group.steps.length} passos concluídos neste grupo
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/admin" className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao onboarding
          </Link>
          {!isCurrentDone ? (
            <button
              type="button"
              onClick={() => {
                markDone(stepKey);
                window.location.href = nextStep ? nextStep.path : "/admin";
              }}
              className="text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-md px-3 py-1.5"
            >
              {nextStep ? "Concluir e seguinte" : "Concluir grupo"}
            </button>
          ) : nextStep ? (
            <Link
              to={nextStep.path}
              className="text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-md px-3 py-1.5"
            >
              Passo seguinte
            </Link>
          ) : null}
        </div>
      </div>

      {/* Group progress — all steps */}
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
        {group.steps.map((s, i) => {
          const done = !!progress[s.key];
          const active = s.key === stepKey;
          return (
            <li key={s.key}>
              <Link
                to={s.path}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-foreground font-semibold"
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
  );
}

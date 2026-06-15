import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, ShieldCheck, CheckCircle2, Circle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode, useState } from "react";
import { progressKey, pushProgress } from "@/lib/onboardingStorage";

type StepMeta = { key: string; title: string; desc: string; path: string };
type GroupMeta = { id: string; title: string; steps: StepMeta[] };

// Single source of truth — mirrors src/pages/admin/Inicio.tsx
export const ONBOARDING_GROUPS: GroupMeta[] = [
  {
    id: "est", title: "Registar Discentes",
    steps: [
      { key: "est.imp", title: "Importar discentes", desc: "Carregar lista de discentes em lote.", path: "/admin/onboarding/estudantes?step=est.imp" },
    ],
  },
  {
    id: "inf", title: "Registar Geopontos do Campus",
    steps: [
      { key: "inf.esp", title: "Salas e edifícios", desc: "Registar todos os espaços físicos da instituição.", path: "/admin/onboarding/espacos?step=inf.esp" },
      { key: "inf.geo", title: "Geopontos do campus", desc: "Definir pontos GPS de entradas, edifícios e zonas de presença.", path: "/admin/onboarding/espacos?tab=geopontos&step=inf.geo" },
    ],
  },
  {
    id: "aca", title: "Configurar Área Académica",
    steps: [
      { key: "aca.cal", title: "Ano letivo & calendário", desc: "Definir ano letivo, semestres e feriados antes de tudo.", path: "/areaacademica/criador/calendario?step=aca.cal" },
      { key: "aca.fac", title: "Faculdades", desc: "Criar as faculdades da instituição.", path: "/admin/faculdades-cursos?tab=faculdades&step=aca.fac" },
      { key: "aca.cur", title: "Cursos", desc: "Criar cursos e associá-los às faculdades.", path: "/admin/faculdades-cursos?tab=cursos&step=aca.cur" },
      { key: "aca.cad", title: "Cadeiras", desc: "Gerar cadeiras por curso, ano e semestre.", path: "/areaacademica/criador/cadeiras?step=aca.cad" },
      { key: "aca.tur", title: "Turmas", desc: "Criar turmas e definir capacidade.", path: "/areaacademica/criador/turmas?step=aca.tur" },
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
      { key: "fin.pro", title: "Propinas", desc: "Definir valores de propinas por curso e ano.", path: "/financas/configurador?tab=propinas&step=fin.pro" },
      { key: "fin.emo", title: "Emolumentos e taxas", desc: "Configurar taxas e serviços académicos.", path: "/financas/configurador?tab=taxas&step=fin.emo" },
      { key: "fin.mul", title: "Multas", desc: "Definir regras e valores de multas.", path: "/financas/configurador?tab=multas&step=fin.mul" },
      { key: "fin.sal", title: "Salários", desc: "Configurar escalões e tabela salarial.", path: "/admin/onboarding/salarios?step=fin.sal" },
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

export function readOnboardingProgress(email?: string | null): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(progressKey(email)) || "{}"); } catch { return {}; }
}
function markDone(email: string | null | undefined, key: string) {
  const cur = readOnboardingProgress(email);
  cur[key] = true;
  try { localStorage.setItem(progressKey(email), JSON.stringify(cur)); } catch {}
  pushProgress(email, cur);
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
  const [refresh, setRefresh] = useState(0);
  const stepKey = stepKeyProp || params.get("step") || "";
  if (user?.role !== "admin") return null;
  const group = STEP_TO_GROUP[stepKey];
  if (!group) return null;

  const progress = readOnboardingProgress(user?.email);
  const currentIdx = group.steps.findIndex((s) => s.key === stepKey);
  const current = group.steps[currentIdx];
  const doneCount = group.steps.filter((s) => progress[s.key]).length;
  const isCurrentDone = !!progress[stepKey];
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
          <div className="flex items-center gap-2 shrink-0">
            {actions}
            <button
              type="button"
              onClick={() => { markDone(user?.email, stepKey); setRefresh(refresh + 1); }}
              className={`inline-flex h-8 items-center gap-1 rounded-md border px-3 text-xs font-semibold transition-colors ${isCurrentDone ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-primary/30 bg-card text-primary hover:bg-primary/5"}`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> {isCurrentDone ? "Concluído" : "Concluir passo"}
            </button>
          </div>
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

import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PROGRESS_KEY = "upra.admin.config.progress";

// Mirrors the GROUPS structure in src/pages/admin/Inicio.tsx
const STEPS_BY_KEY: Record<string, { group: string; groupTitle: string; index: number; total: number; title: string }> = {
  "aca.fac":   { group: "aca", groupTitle: "Configurar Área Académica", index: 1, total: 4, title: "Faculdades e cursos" },
  "aca.cad":   { group: "aca", groupTitle: "Configurar Área Académica", index: 2, total: 4, title: "Cadeiras" },
  "aca.tur":   { group: "aca", groupTitle: "Configurar Área Académica", index: 3, total: 4, title: "Turmas" },
  "aca.cal":   { group: "aca", groupTitle: "Configurar Área Académica", index: 4, total: 4, title: "Calendário académico" },
  "rh.doc":    { group: "rh",  groupTitle: "Configurar RH",              index: 1, total: 3, title: "Registar docentes" },
  "rh.staff":  { group: "rh",  groupTitle: "Configurar RH",              index: 2, total: 3, title: "Registar staff" },
  "rh.pres":   { group: "rh",  groupTitle: "Configurar RH",              index: 3, total: 3, title: "Regras de presença" },
  "fin.prop":  { group: "fin", groupTitle: "Configurar Finanças",        index: 1, total: 3, title: "Propinas por curso" },
  "fin.taxas": { group: "fin", groupTitle: "Configurar Finanças",        index: 2, total: 3, title: "Emolumentos e serviços" },
  "fin.multas":{ group: "fin", groupTitle: "Configurar Finanças",        index: 3, total: 3, title: "Multas" },
  "gap.sol":   { group: "gap", groupTitle: "Configurar GAP",             index: 1, total: 3, title: "Solicitações" },
  "gap.age":   { group: "gap", groupTitle: "Configurar GAP",             index: 2, total: 3, title: "Agendamentos" },
  "gap.cand":  { group: "gap", groupTitle: "Configurar GAP",             index: 3, total: 3, title: "Candidaturas" },
};

function markDone(key: string) {
  try {
    const cur = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    cur[key] = true;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(cur));
  } catch {}
}
function isDone(key: string): boolean {
  try { return !!JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}")[key]; } catch { return false; }
}

export function OnboardingStepBanner({ stepKey: stepKeyProp }: { stepKey?: string }) {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const stepKey = stepKeyProp || params.get("step") || "";
  if (user?.role !== "admin") return null;
  const meta = STEPS_BY_KEY[stepKey];
  if (!meta) return null;
  const done = isDone(stepKey);

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 mb-4">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary mb-0.5">
            <span>Onboarding institucional</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-muted-foreground normal-case tracking-normal font-medium">{meta.groupTitle}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-foreground">
              Passo {meta.index} de {meta.total} · {meta.title}
            </h2>
            {done && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                <CheckCircle2 className="w-3 h-3" /> Concluído
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: meta.total }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i < meta.index ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/admin"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao onboarding
          </Link>
          {!done && (
            <button
              type="button"
              onClick={() => { markDone(stepKey); window.location.href = "/admin"; }}
              className="text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-md px-3 py-1.5"
            >
              Marcar como concluído
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

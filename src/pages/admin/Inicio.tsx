import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FinHeader } from "@/pages/financas/_FinHeader";
import { useAuth } from "@/contexts/AuthContext";
import { onboardingKey, progressKey, profileKey, isOnboardingCompleteFor, clearAdminStateBackend, pushProgress } from "@/lib/onboardingStorage";
import {
  Building2, LifeBuoy, BookOpen, ArrowRight, CheckCircle2,
  RotateCcw, ShieldCheck, GraduationCap, CalendarDays,
  FileText, Layers, School, ChevronDown, UserCog, Clock, Briefcase,
  MapPin, Users, UserPlus, Upload, Wallet, Banknote, Receipt,
  TrendingUp, TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function readProgress(email?: string | null): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(progressKey(email)) || "{}"); } catch { return {}; }
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
    id: "inst",
    area: "Instituição",
    title: "Registo da Instituição",
    subtitle: "Dados institucionais base (nome, sigla, localização)",
    icon: ShieldCheck,
    steps: [
      { key: "inst.reg", title: "Ficha de registo institucional", desc: "Identificação, sigla, NIF, localização e logótipo.", icon: ShieldCheck, path: "/admin/onboarding" },
    ],
  },
  {
    id: "est",
    area: "Utilizadores",
    title: "Criar Utilizadores",
    subtitle: "Criar contas de acesso para staff, docentes e estudantes",
    icon: Users,
    steps: [
      { key: "est.imp", title: "Criar contas de utilizadores", desc: "Adicionar contas reais ligadas à cloud para qualquer perfil (estudante, professor, staff, etc.).", icon: UserPlus, path: "/admin/utilizadores?step=est.imp" },
    ],
  },
  {
    id: "geo",
    area: "Geopontos",
    title: "Registar Geopontos da Instituição",
    subtitle: "Pontos geográficos usados para marcação de presenças",
    icon: MapPin,
    steps: [
      { key: "geo.reg", title: "Geopontos institucionais", desc: "Definir campus, polos e edifícios com coordenadas GPS e raio de tolerância.", icon: MapPin, path: "/admin/onboarding/geopontos?step=geo.reg" },
    ],
  },
  {
    id: "aca",
    area: "Académica",
    title: "Configurar Área Académica",
    subtitle: "Faculdades, cursos, cadeiras, calendário e turmas",
    icon: School,
    steps: [
      { key: "aca.fac", title: "Faculdades & Cursos", desc: "Criar faculdades e cursos da instituição.", icon: Building2, path: "/admin/faculdades-cursos?tab=faculdades&step=aca.fac" },
      { key: "aca.cad", title: "Cadeiras", desc: "Gerar cadeiras por curso, ano e semestre.", icon: BookOpen, path: "/admin/faculdades-cursos?tab=cadeiras&step=aca.cad" },
      { key: "aca.cal", title: "Ano lectivo & Calendário", desc: "Definir ano lectivo, semestres e feriados.", icon: CalendarDays, path: "/admin/faculdades-cursos?tab=calendario&step=aca.cal" },
      { key: "aca.tur", title: "Turmas", desc: "Criar turmas e definir capacidade.", icon: Layers, path: "/admin/faculdades-cursos?tab=turmas&step=aca.tur" },
    ],
  },
  {
    id: "fin",
    area: "Finanças",
    title: "Configurar Finanças",
    subtitle: "Propinas, emolumentos, multas e salários",
    icon: Wallet,
    steps: [
      { key: "fin.pro", title: "Receitas — Propinas & emolumentos", desc: "Propinas por curso, emolumentos e taxas académicas.", icon: TrendingUp, path: "/financas/configurador?tab=receitas&step=fin.pro" },
      { key: "fin.des", title: "Despesas", desc: "Rubricas e categorias de despesa institucional.", icon: TrendingDown, path: "/financas/configurador?tab=despesas&step=fin.des" },
      { key: "fin.sal", title: "Salários", desc: "Escalões salariais de docentes e staff.", icon: Briefcase, path: "/financas/configurador?tab=salarios&step=fin.sal" },
      { key: "fin.mul", title: "Multas", desc: "Multas aplicadas a estudantes, docentes e staff.", icon: Banknote, path: "/financas/configurador?tab=multas&step=fin.mul" },
    ],
  },
  {
    id: "rh",
    area: "Recursos Humanos",
    title: "Configurar RH",
    subtitle: "Docentes, staff e políticas internas",
    icon: UserCog,
    steps: [
      { key: "rh.dep", title: "Registar departamentos", desc: "Criar departamentos institucionais (sigla, designação, responsável).", icon: Building2, path: "/admin/onboarding/rh?tab=departamentos&step=rh.dep" },
      { key: "rh.doc", title: "Registar docentes", desc: "Adicionar todos os docentes da instituição em lote.", icon: GraduationCap, path: "/admin/onboarding/docentes?step=rh.doc" },
      { key: "rh.staff", title: "Registar staff", desc: "Adicionar funcionários administrativos e técnicos.", icon: Briefcase, path: "/admin/onboarding/staff?step=rh.staff" },
      { key: "rh.pres", title: "Conformidade & Multas", desc: "Controlo de presença, tolerâncias, multas e disputas.", icon: Clock, path: "/admin/onboarding/regras-presenca?step=rh.pres" },
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
  const storedProgress = readProgress(user?.email);
  const [realCounts, setRealCounts] = useState({ users: 0, faculdades: 0, cursos: 0, cadeiras: 0, propinas: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [contacts, fac, cur, cad, prop] = await Promise.all([
        (supabase as any).rpc("list_institution_contacts"),
        supabase.from("faculdades").select("id", { count: "exact", head: true }),
        supabase.from("cursos").select("id", { count: "exact", head: true }),
        (supabase.from("cadeiras" as any) as any).select("id", { count: "exact", head: true }),
        supabase.from("propinas").select("id", { count: "exact", head: true }),
      ]);
      if (cancelled) return;
      const usersCount = Array.isArray(contacts.data) ? contacts.data.length : 0;
      setRealCounts({ users: usersCount, faculdades: fac.count ?? 0, cursos: cur.count ?? 0, cadeiras: cad.count ?? 0, propinas: prop.count ?? 0 });
      try {
        const raw = localStorage.getItem(progressKey(user?.email));
        const p = raw ? JSON.parse(raw) : {};
        if (usersCount > 0) p["est.imp"] = true;
        if ((fac.count ?? 0) > 0) p["aca.fac"] = true;
        if ((cad.count ?? 0) > 0) p["aca.cad"] = true;
        if ((prop.count ?? 0) > 0) p["fin.pro"] = true;
        localStorage.setItem(progressKey(user?.email), JSON.stringify(p));
        pushProgress(user?.email, p);
      } catch { /* ignore */ }
      // Clean stale est.imp=true only when there are no real created users.
      if (usersCount === 0) {
        try {
          const raw = localStorage.getItem(progressKey(user?.email));
          if (raw) {
            const p = JSON.parse(raw);
            if (p["est.imp"]) {
              delete p["est.imp"];
              localStorage.setItem(progressKey(user?.email), JSON.stringify(p));
            }
          }
        } catch { /* ignore */ }
      }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  // Derive progress from reality, not just from localStorage clicks:
  // - inst.reg: done iff institutional registration was completed.
  // - est.imp: done iff there is at least one real user account in the database.
  const progress: Record<string, boolean> = {
    ...storedProgress,
    "inst.reg": storedProgress["inst.reg"] || isOnboardingCompleteFor(user?.email),
    "est.imp": realCounts.users > 0,
    "aca.fac": realCounts.faculdades > 0,
    "aca.cad": realCounts.cadeiras > 0,
    "fin.pro": storedProgress["fin.pro"] || realCounts.propinas > 0,
  };
  const doneCount = ALL_STEPS.filter((t) => progress[t.key]).length;
  const pct = Math.round((doneCount / ALL_STEPS.length) * 100);
  const [open, setOpen] = useState<string | null>(null);


  const reset = () => {
    if (!confirm("Repor onboarding? Todos os dados introduzidos serão perdidos.")) return;
    localStorage.removeItem(onboardingKey(user?.email));
    localStorage.removeItem(progressKey(user?.email));
    localStorage.removeItem(profileKey(user?.email));
    clearAdminStateBackend();
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


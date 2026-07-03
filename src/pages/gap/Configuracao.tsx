import { OnboardingStepBanner, markOnboardingStepDone, useIsOnboardingStep } from "@/components/admin/OnboardingStepBanner";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { loadDocentes, syncDocentesFromDb, type DocenteRow } from "@/lib/peopleStorage";
import { ChevronDown } from "lucide-react";
import { Settings2, Plus, Layers, AlertCircle, FileText, Trash2, Pencil, CalendarClock, GraduationCap, MapPin, Clock, FileCheck2, Unlock, Check, Users } from "lucide-react";
import AdminDiscentes from "@/pages/admin/Discentes";
import {
  tipoConfig as initialTipoConfig,
  categoriaConfig as initialCategoriaConfig,
  estadoSolicitacaoConfig as initialEstadoConfig,
} from "@/data/gapData";
import { candidaturas as allCandidaturas } from "@/data/admissoesData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { FinHeader } from "@/pages/financas/_FinHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import CandidaturasEtapasConfig from "@/components/academica/CandidaturasEtapasConfig";

type EstadoItem = { key: string; label: string; color: string; descricao?: string };
type CategoriaItem = { key: string; label: string; color: string; descricao?: string };
type MotivoItem = { key: string; label: string; categoria: string; destino: string; slaAceitacao: number; slaConclusao: number; multa: string };
type MultaItem = { key: string; label: string; diasAposPrazo: number; valor: number; descricao: string };
type Departamento = { id: string; sigla: string; designacao: string };

const INITIAL_MULTAS: MultaItem[] = [
  { key: "atraso_relatorio", label: "Atraso na entrega de relatório", diasAposPrazo: 5, valor: 4000, descricao: "Aplicada 5 dias após o prazo de conclusão do relatório obrigatório." },
  { key: "falta_injustificada", label: "Falta injustificada a sessão", diasAposPrazo: 5, valor: 6000, descricao: "Aplicada 5 dias após o prazo de regularização da ausência." },
  { key: "atraso_aula", label: "Atraso superior a 15min na aula", diasAposPrazo: 5, valor: 3000, descricao: "Aplicada 5 dias após o prazo de justificação dos atrasos repetidos." },
  { key: "incumprimento_sla", label: "Incumprimento de SLA de solicitação", diasAposPrazo: 5, valor: 5000, descricao: "Aplicada 5 dias após o prazo de tratamento da solicitação." },
  { key: "uso_indevido", label: "Uso indevido de recursos institucionais", diasAposPrazo: 5, valor: 8000, descricao: "Aplicada 5 dias após o prazo de regularização do uso de recursos." },
];




export default function GapConfiguracao() {
  const isOnboarding = useIsOnboardingStep();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "discentes" || tabParam === "agendamentos" || tabParam === "candidaturas" || tabParam === "solicitacoes" ? tabParam : "discentes";
  const [tab, setTab] = useState(initialTab);
  const { toast } = useToast();

  // Per-card edit lock
  const [cardEdit, setCardEdit] = useState<Record<string, boolean>>({});
  const isCardEditing = (id: string) => !!cardEdit[id];
  const toggleCardEdit = (id: string) => setCardEdit(prev => ({ ...prev, [id]: !prev[id] }));
  const CardEditToggle = ({ id }: { id: string }) => {
    const on = !!cardEdit[id];
    return (
      <Button size="sm" variant={on ? "default" : "outline"} onClick={() => toggleCardEdit(id)} className="gap-1.5 h-8 text-xs">
        {on ? <><Unlock className="w-3.5 h-3.5" /> Bloquear</> : <><Pencil className="w-3.5 h-3.5" /> Editar</>}
      </Button>
    );
  };

  const [estados, setEstados] = useState<EstadoItem[]>(
    Object.entries(initialEstadoConfig).map(([key, v]) => ({ key, label: v.label, color: v.color }))
  );
  const [categorias, setCategorias] = useState<CategoriaItem[]>(
    Object.entries(initialCategoriaConfig).map(([key, v]) => ({ key, label: v.label, color: v.color }))
  );
  const [multas] = useState<MultaItem[]>(INITIAL_MULTAS);
  const [motivos, setMotivos] = useState<MotivoItem[]>(
    Object.entries(initialTipoConfig).map(([key, v]) => {
      const slaConcl = v.slaDias;
      const multaDefault = slaConcl < 5
        ? (v.categoria === "Académico" ? "atraso_relatorio"
          : v.categoria === "Tecnológico" ? "incumprimento_sla"
          : v.categoria === "Financeiro" ? "uso_indevido"
          : "atraso_relatorio")
        : "";
      return {
        key, label: v.label, categoria: v.categoria, destino: v.destino,
        slaAceitacao: Math.max(1, Math.ceil(slaConcl / 3)),
        slaConclusao: slaConcl,
        multa: multaDefault,
      };
    })
  );

  // Dialog states
  const [estadoOpen, setEstadoOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [motivoOpen, setMotivoOpen] = useState(false);

  const [newEstadoLabel, setNewEstadoLabel] = useState("");
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newMotLabel, setNewMotLabel] = useState("");
  const [newMotCat, setNewMotCat] = useState<string>("");
  const [newMotDest, setNewMotDest] = useState<string>("");
  const [newMotSlaAceit, setNewMotSlaAceit] = useState<number>(2);
  const [newMotSlaConcl, setNewMotSlaConcl] = useState<number>(5);
  const [newMotMulta, setNewMotMulta] = useState<string>("__none__");

  // Real departamentos from DB used as Destino
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  useEffect(() => {
    (async () => {
      const { data, error } = await (supabase as any)
        .from("departamentos")
        .select("id, sigla, designacao")
        .order("designacao", { ascending: true });
      if (!error && data) {
        setDepartamentos(data as Departamento[]);
        if (data.length && !newMotDest) setNewMotDest((data[0] as any).designacao);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const destLabel = (k: string) => departamentos.find(d => d.designacao === k || d.sigla === k)?.designacao || k;

  const slugify = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

  const handleAddEstado = () => {
    if (!newEstadoLabel.trim()) return;
    const key = slugify(newEstadoLabel);
    setEstados(prev => [...prev, { key, label: newEstadoLabel.trim(), color: "bg-slate-100 text-slate-700 border-slate-200" }]);
    setNewEstadoLabel(""); setEstadoOpen(false);
    toast({ title: "Estado criado" });
  };

  const handleAddCategoria = () => {
    if (!newCatLabel.trim()) return;
    const key = slugify(newCatLabel);
    setCategorias(prev => [...prev, { key, label: newCatLabel.trim(), color: "bg-slate-50 text-slate-700 border-slate-200" }]);
    setNewCatLabel(""); setCatOpen(false);
    toast({ title: "Categoria criada" });
  };

  const handleAddMotivo = () => {
    if (!newMotLabel.trim() || !newMotCat) return;
    const key = slugify(newMotLabel);
    setMotivos(prev => [...prev, {
      key, label: newMotLabel.trim(), categoria: newMotCat, destino: newMotDest,
      slaAceitacao: newMotSlaAceit, slaConclusao: newMotSlaConcl,
      multa: newMotMulta === "__none__" ? "" : newMotMulta,
    }]);
    setNewMotLabel(""); setNewMotCat("");
    setNewMotDest(departamentos[0]?.designacao || "");
    setNewMotSlaAceit(2); setNewMotSlaConcl(5);
    setNewMotMulta("__none__");
    setMotivoOpen(false);
    toast({ title: "Motivo criado" });
  };

  const removeEstado = (key: string) => setEstados(prev => prev.filter(e => e.key !== key));
  const removeCategoria = (key: string) => setCategorias(prev => prev.filter(c => c.key !== key));
  const removeMotivo = (key: string) => setMotivos(prev => prev.filter(m => m.key !== key));

  // Edit dialogs
  const [editEstado, setEditEstado] = useState<EstadoItem | null>(null);
  const [editCategoria, setEditCategoria] = useState<CategoriaItem | null>(null);
  const [editMotivo, setEditMotivo] = useState<MotivoItem | null>(null);

  const saveEditEstado = () => {
    if (!editEstado || !editEstado.label.trim()) return;
    setEstados(prev => prev.map(e => e.key === editEstado.key ? editEstado : e));
    toast({ title: "Estado atualizado" }); setEditEstado(null);
  };
  const saveEditCategoria = () => {
    if (!editCategoria || !editCategoria.label.trim()) return;
    setCategorias(prev => prev.map(c => c.key === editCategoria.key ? editCategoria : c));
    toast({ title: "Categoria atualizada" }); setEditCategoria(null);
  };
  const saveEditMotivo = () => {
    if (!editMotivo || !editMotivo.label.trim()) return;
    setMotivos(prev => prev.map(m => m.key === editMotivo.key ? editMotivo : m));
    toast({ title: "Motivo atualizado" }); setEditMotivo(null);
  };

  const formatMultaDias = (d: number) => `${d}d após prazo`;

  // ===== AGENDAMENTOS =====
  type AgCategoria = { key: string; label: string; color: string; descricao?: string };
  type AgMotivo = { key: string; label: string; categoria: string };

  const [agCategorias, setAgCategorias] = useState<AgCategoria[]>([
    { key: "psicologico", label: "Psicológico", color: "bg-purple-100 text-purple-800 border-purple-200", descricao: "Sessões de apoio psicológico individual ou em grupo." },
    { key: "academico", label: "Académico", color: "bg-blue-100 text-blue-800 border-blue-200", descricao: "Orientação académica, métodos de estudo e desempenho." },
    { key: "carreira", label: "Carreira / Vocacional", color: "bg-emerald-100 text-emerald-800 border-emerald-200", descricao: "Orientação vocacional, estágios e plano de carreira." },
    { key: "social", label: "Social", color: "bg-amber-100 text-amber-800 border-amber-200", descricao: "Mediação de conflitos e apoio social ao discente." },
    { key: "saude", label: "Saúde", color: "bg-rose-100 text-rose-800 border-rose-200", descricao: "Encaminhamento para serviços de saúde e bem-estar." },
    { key: "financeiro", label: "Financeiro", color: "bg-cyan-100 text-cyan-800 border-cyan-200", descricao: "Apoio em questões de bolsas e plano financeiro." },
    { key: "documentacao", label: "Documentação", color: "bg-slate-100 text-slate-700 border-slate-200", descricao: "Apoio na emissão e gestão de documentos." },
  ]);
  const [agMotivos, setAgMotivos] = useState<AgMotivo[]>([
    { key: "acomp_psico", label: "Acompanhamento psicológico", categoria: "Psicológico" },
    { key: "metodos_estudo", label: "Orientação académica — métodos de estudo", categoria: "Académico" },
    { key: "vocacional", label: "Orientação vocacional", categoria: "Carreira / Vocacional" },
    { key: "estagio", label: "Acompanhamento de estágio", categoria: "Carreira / Vocacional" },
    { key: "mediacao", label: "Mediação de conflito", categoria: "Social" },
  ]);
  const [agHoraInicio, setAgHoraInicio] = useState("08:00");
  const [agHoraFim, setAgHoraFim] = useState("17:00");
  const [agEstado, setAgEstado] = useState<"aberto" | "fechado">(() => {
    if (typeof window === "undefined") return "aberto";
    return (localStorage.getItem("gap_ag_estado") as "aberto" | "fechado") || "aberto";
  });
  useEffect(() => { try { localStorage.setItem("gap_ag_estado", agEstado); } catch {} }, [agEstado]);

  // Ag dialogs
  const [agCatOpen, setAgCatOpen] = useState(false);
  const [agMotOpen, setAgMotOpen] = useState(false);

  const [newAgCat, setNewAgCat] = useState("");
  const [newAgMotLabel, setNewAgMotLabel] = useState("");
  const [newAgMotCat, setNewAgMotCat] = useState("");

  // ===== CANDIDATURAS =====
  type CdEstado = { key: string; label: string; color: string; descricao?: string };
 type CdEtapa = { key: string; label: string; agenda: boolean; obrigatoria: boolean; estadosPossiveis: string[] };
 type CdSessao = { etapaKey: string; mode: "" | "dia" | "dias" | "periodo"; datas: string[]; dataFim?: string; hora: string; local: string; responsavel: string; capacidade: number | "" };


  const [cdEstados, setCdEstados] = useState<CdEstado[]>([
    { key: "completo", label: "Completo", color: "bg-green-50 text-green-700 border-green-200" },
    { key: "aprovado", label: "Aprovado", color: "bg-green-50 text-green-700 border-green-200" },
    { key: "agendado", label: "Agendado", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { key: "remarcado", label: "Remarcado", color: "bg-amber-50 text-amber-700 border-amber-200" },
    
    { key: "reprovado", label: "Reprovado", color: "bg-red-50 text-red-700 border-red-200" },
  ]);
  const [cdEtapas, setCdEtapas] = useState<CdEtapa[]>([
    { key: "submissao", label: "Submissão da candidatura", agenda: false, obrigatoria: true, estadosPossiveis: ["completo"] },
    { key: "entrevista", label: "Entrevista", agenda: true, obrigatoria: true, estadosPossiveis: ["agendado", "completo", "remarcado"] },
    { key: "curso_preparatorio", label: "Curso Preparatório", agenda: true, obrigatoria: false, estadosPossiveis: ["agendado", "completo", "remarcado"] },
    { key: "exame", label: "Exame de Acesso", agenda: true, obrigatoria: true, estadosPossiveis: ["agendado", "aprovado", "reprovado", "remarcado"] },
  ]);
  const [cdSessoes, setCdSessoes] = useState<CdSessao[]>([]);
  const [docentesList, setDocentesList] = useState<DocenteRow[]>(() => loadDocentes());
  useEffect(() => {
    syncDocentesFromDb().then(setDocentesList).catch(() => {});
    const onChange = () => setDocentesList(loadDocentes());
    window.addEventListener("upra:people-changed", onChange);
    return () => window.removeEventListener("upra:people-changed", onChange);
  }, []);
  // Auto-sync: ensure one sessão row per etapa with agenda=true (no prefilled values)
  useEffect(() => {
    setCdSessoes(prev => {
      const agendadas = cdEtapas.filter(e => e.agenda);
      const byKey = new Map(prev.map(s => [s.etapaKey, s]));
      return agendadas.map(e => byKey.get(e.key) || {
        etapaKey: e.key, mode: "" as const, datas: [], hora: "",
        local: "", responsavel: "", capacidade: "" as const,
      });
    });
  }, [cdEtapas]);
  const updateSessao = (etapaKey: string, patch: Partial<CdSessao>) =>
    setCdSessoes(prev => prev.map(s => s.etapaKey === etapaKey ? { ...s, ...patch } : s));
  const toggleSessaoData = (etapaKey: string, data: string) => setCdSessoes(prev => prev.map(s => {
    if (s.etapaKey !== etapaKey) return s;
    const has = s.datas.includes(data);
    return { ...s, datas: has ? s.datas.filter(d => d !== data) : [...s.datas, data].sort() };
  }));
  const [cdNotaMinima, setCdNotaMinima] = useState<number | "">(() => {
    if (typeof window === "undefined") return "";
    const v = window.localStorage.getItem("academica.notaMinimaAcesso");
    return v ? Number(v) : "";
  });
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "academica.notaMinimaAcesso") setCdNotaMinima(e.newValue ? Number(e.newValue) : "");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const [cdTaxa, setCdTaxa] = useState<number | "">("");
  const [cdMaxOpcoes, setCdMaxOpcoes] = useState<number | "">("");
  const [cdPeriodoInicio, setCdPeriodoInicio] = useState("");
  const [cdPeriodoFim, setCdPeriodoFim] = useState("");
  // Read Candidaturas config shared with Área Académica
  useEffect(() => {
    const readCfg = () => {
      try {
        const raw = localStorage.getItem("upra:candidaturas-cfg");
        if (!raw) return;
        const c = JSON.parse(raw);
        setCdPeriodoInicio(c.inicio || "");
        setCdPeriodoFim(c.fim || "");
        setCdMaxOpcoes(typeof c.vagas === "number" ? c.vagas : "");
        setCdTaxa(typeof c.taxa === "number" ? c.taxa : "");
      } catch {}
    };
    readCfg();
    const onStorage = (e: StorageEvent) => { if (e.key === "upra:candidaturas-cfg") readCfg(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);


  const [cdEstadoOpen, setCdEstadoOpen] = useState(false);
  const [cdEtapaOpen, setCdEtapaOpen] = useState(false);

  const [newCdEstadoLabel, setNewCdEstadoLabel] = useState("");
  const [newCdEtapaLabel, setNewCdEtapaLabel] = useState("");

  const CD_COLORS = [
    "bg-blue-50 text-blue-700 border-blue-200",
    "bg-green-50 text-green-700 border-green-200",
    "bg-amber-50 text-amber-700 border-amber-200",
    "bg-red-50 text-red-700 border-red-200",
    "bg-violet-50 text-violet-700 border-violet-200",
    "bg-slate-50 text-slate-700 border-slate-200",
  ];
  const addCdEstado = () => {
    const v = newCdEstadoLabel.trim(); if (!v) return;
    const key = v.toLowerCase().replace(/\s+/g, "_");
    if (cdEstados.some(e => e.key === key)) { toast({ title: "Estado já existe", variant: "destructive" }); return; }
    setCdEstados(s => [...s, { key, label: v, color: CD_COLORS[s.length % CD_COLORS.length] }]);
    setNewCdEstadoLabel(""); setCdEstadoOpen(false);
  };
  const removeCdEstado = (key: string) => setCdEstados(s => s.filter(e => e.key !== key));
  const addCdEtapa = () => {
    const v = newCdEtapaLabel.trim(); if (!v) return;
    const key = v.toLowerCase().replace(/\s+/g, "_");
    setCdEtapas(es => [...es, { key, label: v, agenda: false, obrigatoria: false, estadosPossiveis: [] }]);
    setNewCdEtapaLabel(""); setCdEtapaOpen(false);
  };
  const removeCdEtapa = (key: string) => setCdEtapas(es => es.filter(e => e.key !== key));
  const toggleEtapaObrig = (key: string) => setCdEtapas(es => es.map(e => e.key === key ? { ...e, obrigatoria: !e.obrigatoria } : e));
  const toggleEtapaAgenda = (key: string) => setCdEtapas(es => es.map(e => e.key === key ? { ...e, agenda: !e.agenda } : e));
  const toggleEtapaEstado = (etapaKey: string, estadoKey: string) => setCdEtapas(es => es.map(e => {
    if (e.key !== etapaKey) return e;
    const has = e.estadosPossiveis.includes(estadoKey);
    return { ...e, estadosPossiveis: has ? e.estadosPossiveis.filter(k => k !== estadoKey) : [...e.estadosPossiveis, estadoKey] };
  }));

  const confirmCurrentStep = () => {
    const key = tab === "discentes" ? "gap.disc" : tab === "agendamentos" ? "gap.age" : tab === "candidaturas" ? "gap.cand" : "gap.sol";
    markOnboardingStepDone(user?.email, key);
    toast({ title: "Configuração confirmada" });
  };

  // helper components
  const EditIcon = ({ onClick, label, editing }: { onClick: () => void; label: string; editing: boolean }) =>
    editing ? (
      <button onClick={onClick} className="opacity-60 hover:opacity-100" aria-label={label}>
        <Pencil className="w-3 h-3" />
      </button>
    ) : null;
  const RemoveIcon = ({ onClick, label, editing, size = "sm" }: { onClick: () => void; label: string; editing: boolean; size?: "sm" | "md" }) =>
    editing ? (
      <button onClick={onClick} className="opacity-60 hover:opacity-100 hover:text-destructive" aria-label={label}>
        <Trash2 className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      </button>
    ) : null;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <OnboardingStepBanner />
      {/* Header */}
      {!isOnboarding && (
        <FinHeader
          title="Configuração"
          subtitle="Configure Discentes, Solicitações, Agendamentos e o processo de Candidaturas do GAP."
          icon={<Settings2 className="w-6 h-6 text-primary" />}
        />
      )}

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="discentes" className="gap-1.5"><Users className="w-3.5 h-3.5" /> Discentes</TabsTrigger>
          <TabsTrigger value="solicitacoes" className="gap-1.5"><FileText className="w-3.5 h-3.5" /> Solicitações</TabsTrigger>
          <TabsTrigger value="agendamentos" className="gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> Agendamentos</TabsTrigger>
          <TabsTrigger value="candidaturas" className="gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Candidaturas</TabsTrigger>
        </TabsList>

        <TabsContent value="discentes" className="mt-0 -mx-6 lg:-mx-8">
          <AdminDiscentes />
        </TabsContent>

        <TabsContent value="solicitacoes" className="space-y-6 mt-0">
          {/* Estados */}
          {(() => {
            const COR_OPCOES = [
              { label: "Verde", value: "bg-green-100 text-green-700 border-green-200" },
              { label: "Âmbar", value: "bg-amber-100 text-amber-700 border-amber-200" },
              { label: "Vermelho", value: "bg-red-100 text-red-700 border-red-200" },
              { label: "Azul", value: "bg-blue-100 text-blue-700 border-blue-200" },
              { label: "Cinza", value: "bg-slate-100 text-slate-700 border-slate-200" },
              { label: "Violeta", value: "bg-violet-100 text-violet-700 border-violet-200" },
            ];
            return (
              <>
                <Card className="overflow-hidden">
                  <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-foreground">Estados de solicitação</h2>
                      <p className="text-[11px] text-muted-foreground">Fases do ciclo de vida de uma solicitação (ex: Pendente, Em execução, Concluída).</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground ml-auto tabular-nums shrink-0">{estados.length} estado{estados.length === 1 ? "" : "s"}</span>
                  </div>
                  <div className="divide-y">
                    <div className="grid grid-cols-[1fr_1.4fr_180px_120px_40px] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
                      <div>Designação</div>
                      <div>Descrição</div>
                      <div>Cor</div>
                      <div>Pré-visualização</div>
                      <div className="text-right">Ação</div>
                    </div>
                    {estados.map((es) => (
                      <div key={es.key} className="grid grid-cols-[1fr_1.4fr_180px_120px_40px] gap-3 px-5 py-2.5 items-center text-sm">
                        <Input className="h-9" placeholder="Ex: Pendente" value={es.label}
                          onChange={(e) => setEstados((s) => s.map((x) => x.key === es.key ? { ...x, label: e.target.value } : x))} />
                        <Input className="h-9" placeholder="Descrição curta do estado" value={es.descricao || ""}
                          onChange={(e) => setEstados((s) => s.map((x) => x.key === es.key ? { ...x, descricao: e.target.value } : x))} />
                        <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={es.color}
                          onChange={(e) => setEstados((s) => s.map((x) => x.key === es.key ? { ...x, color: e.target.value } : x))}>
                          {COR_OPCOES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <span className={cn("inline-flex items-center justify-center px-2.5 py-1 rounded-md border text-xs font-medium", es.color)}>{es.label || "—"}</span>
                        <div className="flex justify-end">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeEstado(es.key)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3 border-t bg-muted/10">
                    <Button size="sm" variant="outline" className="gap-1.5"
                      onClick={() => setEstados((s) => [...s, { key: `estado_${Date.now()}`, label: "", color: COR_OPCOES[0].value, descricao: "" }])}>
                      <Plus className="w-3.5 h-3.5" /> Adicionar estado
                    </Button>
                  </div>
                </Card>

                {/* Categorias */}
                <Card className="overflow-hidden">
                  <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-foreground">Categorias de solicitação</h2>
                      <p className="text-[11px] text-muted-foreground">Agrupam os motivos (ex: Académico, Tecnológico, Financeiro).</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground ml-auto tabular-nums shrink-0">{categorias.length} categoria{categorias.length === 1 ? "" : "s"}</span>
                  </div>
                  <div className="divide-y">
                    <div className="grid grid-cols-[1fr_1.4fr_180px_120px_40px] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
                      <div>Designação</div>
                      <div>Descrição</div>
                      <div>Cor</div>
                      <div>Pré-visualização</div>
                      <div className="text-right">Ação</div>
                    </div>
                    {categorias.map((c) => (
                      <div key={c.key} className="grid grid-cols-[1fr_1.4fr_180px_120px_40px] gap-3 px-5 py-2.5 items-center text-sm">
                        <Input className="h-9" placeholder="Ex: Académico" value={c.label}
                          onChange={(e) => setCategorias((s) => s.map((x) => x.key === c.key ? { ...x, label: e.target.value } : x))} />
                        <Input className="h-9" placeholder="Descrição curta da categoria" value={c.descricao || ""}
                          onChange={(e) => setCategorias((s) => s.map((x) => x.key === c.key ? { ...x, descricao: e.target.value } : x))} />
                        <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={c.color}
                          onChange={(e) => setCategorias((s) => s.map((x) => x.key === c.key ? { ...x, color: e.target.value } : x))}>
                          {COR_OPCOES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <span className={cn("inline-flex items-center justify-center px-2.5 py-1 rounded-md border text-xs font-medium", c.color)}>{c.label || "—"}</span>
                        <div className="flex justify-end">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeCategoria(c.key)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3 border-t bg-muted/10">
                    <Button size="sm" variant="outline" className="gap-1.5"
                      onClick={() => setCategorias((s) => [...s, { key: `cat_${Date.now()}`, label: "", color: COR_OPCOES[0].value, descricao: "" }])}>
                      <Plus className="w-3.5 h-3.5" /> Adicionar categoria
                    </Button>
                  </div>
                </Card>
              </>
            );
          })()}


          {/* Motivos */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Motivos</h2>
                <span className="text-[11px] text-muted-foreground tabular-nums">· {motivos.length}</span>
              </div>
              <div className="flex items-center gap-2">
              {isCardEditing("sol-motivos") && (
                <Dialog open={motivoOpen} onOpenChange={setMotivoOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Novo motivo</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                        <Input value={newMotLabel} onChange={e => setNewMotLabel(e.target.value)} placeholder="Ex: Pedido de declaração" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Categoria</label>
                          <Select value={newMotCat} onValueChange={setNewMotCat}>
                            <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                            <SelectContent>{categorias.map(c => <SelectItem key={c.key} value={c.label}>{c.label}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Destino (Departamento)</label>
                          <Select value={newMotDest} onValueChange={setNewMotDest}>
                            <SelectTrigger><SelectValue placeholder={departamentos.length ? "Selecionar..." : "Sem departamentos"} /></SelectTrigger>
                            <SelectContent>{departamentos.map(d => <SelectItem key={d.id} value={d.designacao}>{d.designacao}{d.sigla ? ` (${d.sigla})` : ""}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Limite p/ aceitar (dias)</label>
                          <Input type="number" min={1} value={newMotSlaAceit} onChange={e => setNewMotSlaAceit(Number(e.target.value) || 1)} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Limite p/ concluir (dias)</label>
                          <Input type="number" min={1} value={newMotSlaConcl} onChange={e => setNewMotSlaConcl(Number(e.target.value) || 1)} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Multa associada</label>
                        <Select value={newMotMulta} onValueChange={setNewMotMulta}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Sem multa</SelectItem>
                            {multas.map(mu => {
                              const invalid = mu.diasAposPrazo <= newMotSlaConcl;
                              return (
                                <SelectItem key={mu.key} value={mu.key} disabled={invalid}>
                                  {mu.label} · {formatMultaDias(mu.diasAposPrazo)}{invalid ? " (≤ conclusão)" : ""}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-2">
                      <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                      <Button onClick={handleAddMotivo} disabled={!newMotLabel.trim() || !newMotCat}>Adicionar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
                <CardEditToggle id="sol-motivos" />
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Motivo</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Categoria</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Destino</th>
                    <th className="text-center p-3 font-medium text-muted-foreground text-xs whitespace-nowrap">Aceitar</th>
                    <th className="text-center p-3 font-medium text-muted-foreground text-xs whitespace-nowrap">Concluir</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs whitespace-nowrap">Multa</th>
                    {isCardEditing("sol-motivos") && <th className="w-20" />}
                  </tr>
                </thead>
                <tbody>
                  {motivos.map(m => {
                    const catCfg = categorias.find(c => c.label === m.categoria);
                    return (
                      <tr key={m.key} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-3 text-xs font-medium text-foreground">{m.label}</td>
                        <td className="p-3">
                          {catCfg ? <Badge variant="outline" className={cn("text-[10px]", catCfg.color)}>{catCfg.label}</Badge> : <span className="text-xs text-muted-foreground">{m.categoria}</span>}
                        </td>
                        <td className="p-3 text-xs text-foreground whitespace-nowrap">{destLabel(m.destino)}</td>
                        <td className="p-3 text-center text-xs tabular-nums text-amber-700">{m.slaAceitacao}d</td>
                        <td className="p-3 text-center text-xs tabular-nums text-blue-700">{m.slaConclusao}d</td>
                        <td className="p-3 text-xs whitespace-nowrap tabular-nums">
                          {(() => {
                            const mu = multas.find(x => x.key === m.multa);
                            return mu ? <span className="text-foreground">{mu.diasAposPrazo}d</span> : <span className="text-muted-foreground">—</span>;
                          })()}
                        </td>
                        {isCardEditing("sol-motivos") && (
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button onClick={() => setEditMotivo(m)} className="text-muted-foreground hover:text-foreground" aria-label={`Editar ${m.label}`}>
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => removeMotivo(m.key)} className="text-muted-foreground hover:text-destructive" aria-label={`Remover ${m.label}`}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ============ AGENDAMENTOS ============ */}
        <TabsContent value="agendamentos" className="space-y-6 mt-0">
          {/* Parâmetros gerais — só início e fim */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Parâmetros de agendamento</h2>
              </div>
              <CardEditToggle id="ag-params" />
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-2xl">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Início atendimento</label>
                <Input type="time" value={agHoraInicio} disabled={!isCardEditing("ag-params")} onChange={e => setAgHoraInicio(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Fim atendimento</label>
                <Input type="time" value={agHoraFim} disabled={!isCardEditing("ag-params")} onChange={e => setAgHoraFim(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Estado</label>
                <div className="flex gap-1.5 h-9 rounded-md border border-border bg-muted/30 p-0.5">
                  {(["aberto","fechado"] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAgEstado(s)}
                      className={cn(
                        "flex-1 text-xs font-semibold rounded capitalize transition-colors",
                        agEstado === s
                          ? s === "aberto" ? "bg-emerald-600 text-white shadow-sm" : "bg-rose-600 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {s === "aberto" ? "Aberto" : "Fechado"}
                    </button>
                  ))}
                </div>
                <p className="text-[10.5px] text-muted-foreground mt-1">
                  Pode fechar manualmente após o fim do atendimento.
                </p>
              </div>
            </div>
          </Card>

          {/* Categorias de atendimento */}
          {(() => {
            const AG_COR_OPCOES = [
              { label: "Verde", value: "bg-green-100 text-green-700 border-green-200" },
              { label: "Âmbar", value: "bg-amber-100 text-amber-700 border-amber-200" },
              { label: "Vermelho", value: "bg-red-100 text-red-700 border-red-200" },
              { label: "Azul", value: "bg-blue-100 text-blue-700 border-blue-200" },
              { label: "Cinza", value: "bg-slate-100 text-slate-700 border-slate-200" },
              { label: "Violeta", value: "bg-violet-100 text-violet-700 border-violet-200" },
              { label: "Roxo", value: "bg-purple-100 text-purple-800 border-purple-200" },
              { label: "Esmeralda", value: "bg-emerald-100 text-emerald-800 border-emerald-200" },
              { label: "Rosa", value: "bg-rose-100 text-rose-800 border-rose-200" },
              { label: "Ciano", value: "bg-cyan-100 text-cyan-800 border-cyan-200" },
            ];
            return (
              <Card className="overflow-hidden">
                <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-foreground">Categorias de atendimento</h2>
                    <p className="text-[11px] text-muted-foreground">Agrupam os motivos de agendamento (ex: Psicológico, Académico, Social).</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground ml-auto tabular-nums shrink-0">{agCategorias.length} categoria{agCategorias.length === 1 ? "" : "s"}</span>
                </div>
                <div className="divide-y">
                  <div className="grid grid-cols-[1fr_1.4fr_180px_120px_40px] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
                    <div>Designação</div>
                    <div>Descrição</div>
                    <div>Cor</div>
                    <div>Pré-visualização</div>
                    <div className="text-right">Ação</div>
                  </div>
                  {agCategorias.map((c) => (
                    <div key={c.key} className="grid grid-cols-[1fr_1.4fr_180px_120px_40px] gap-3 px-5 py-2.5 items-center text-sm">
                      <Input className="h-9" placeholder="Ex: Psicológico" value={c.label}
                        onChange={(e) => setAgCategorias((s) => s.map((x) => x.key === c.key ? { ...x, label: e.target.value } : x))} />
                      <Input className="h-9" placeholder="Descrição curta da categoria" value={c.descricao || ""}
                        onChange={(e) => setAgCategorias((s) => s.map((x) => x.key === c.key ? { ...x, descricao: e.target.value } : x))} />
                      <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={c.color}
                        onChange={(e) => setAgCategorias((s) => s.map((x) => x.key === c.key ? { ...x, color: e.target.value } : x))}>
                        {AG_COR_OPCOES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <span className={cn("inline-flex items-center justify-center px-2.5 py-1 rounded-md border text-xs font-medium", c.color)}>{c.label || "—"}</span>
                      <div className="flex justify-end">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setAgCategorias((s) => s.filter((x) => x.key !== c.key))}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t bg-muted/10">
                  <Button size="sm" variant="outline" className="gap-1.5"
                    onClick={() => setAgCategorias((s) => [...s, { key: `agcat_${Date.now()}`, label: "", color: AG_COR_OPCOES[0].value, descricao: "" }])}>
                    <Plus className="w-3.5 h-3.5" /> Adicionar categoria
                  </Button>
                </div>
              </Card>
            );
          })()}


          {/* Motivos de agendamento */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Motivos de agendamento</h2>
                <span className="text-[11px] text-muted-foreground tabular-nums">· {agMotivos.length}</span>
              </div>
              <div className="flex items-center gap-2">
              {isCardEditing("ag-motivos") && (
                <Dialog open={agMotOpen} onOpenChange={setAgMotOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs"><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Novo motivo de agendamento</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                        <Input value={newAgMotLabel} onChange={e => setNewAgMotLabel(e.target.value)} placeholder="Ex: Orientação vocacional" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Categoria</label>
                        <Select value={newAgMotCat} onValueChange={setNewAgMotCat}>
                          <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                          <SelectContent>{agCategorias.map(c => <SelectItem key={c.key} value={c.label}>{c.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-2">
                      <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                      <Button onClick={() => {
                        if (!newAgMotLabel.trim() || !newAgMotCat) return;
                        setAgMotivos(prev => [...prev, { key: slugify(newAgMotLabel), label: newAgMotLabel.trim(), categoria: newAgMotCat }]);
                        setNewAgMotLabel(""); setNewAgMotCat("");
                        setAgMotOpen(false);
                        toast({ title: "Motivo adicionado" });
                      }} disabled={!newAgMotLabel.trim() || !newAgMotCat}>Adicionar</Button>

                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
                <CardEditToggle id="ag-motivos" />
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Motivo</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Categoria</th>
                    {isCardEditing("ag-motivos") && <th className="w-12" />}
                  </tr>
                </thead>
                <tbody>
                  {agMotivos.map(m => {
                    const catCfg = agCategorias.find(c => c.label === m.categoria);
                    return (
                      <tr key={m.key} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-3 text-xs font-medium text-foreground">{m.label}</td>
                        <td className="p-3">
                          {catCfg ? <Badge variant="outline" className={cn("text-[10px]", catCfg.color)}>{catCfg.label}</Badge> : <span className="text-xs text-muted-foreground">{m.categoria}</span>}
                        </td>
                        
                        {isCardEditing("ag-motivos") && (
                          <td className="p-3 text-right">
                            <button onClick={() => setAgMotivos(prev => prev.filter(x => x.key !== m.key))} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ============ CANDIDATURAS (leitura — partilhadas com Área Académica) ============ */}
        <TabsContent value="candidaturas" className="space-y-4 mt-0">
          <CandidaturasPage readOnly />
          <p className="text-[11px] text-muted-foreground px-2">
            Total de candidaturas registadas no sistema: <span className="font-semibold text-foreground tabular-nums">{allCandidaturas.length}</span>
          </p>
        </TabsContent>


      </Tabs>

      {/* Edit Estado Dialog */}
      <Dialog open={!!editEstado} onOpenChange={(o) => !o && setEditEstado(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Editar estado</DialogTitle></DialogHeader>
          {editEstado && (
            <div className="space-y-3 py-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                <Input value={editEstado.label} onChange={e => setEditEstado({ ...editEstado, label: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditEstado(null)}>Cancelar</Button>
            <Button onClick={saveEditEstado} disabled={!editEstado?.label.trim()}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Categoria Dialog */}
      <Dialog open={!!editCategoria} onOpenChange={(o) => !o && setEditCategoria(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Editar categoria</DialogTitle></DialogHeader>
          {editCategoria && (
            <div className="space-y-3 py-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                <Input value={editCategoria.label} onChange={e => setEditCategoria({ ...editCategoria, label: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditCategoria(null)}>Cancelar</Button>
            <Button onClick={saveEditCategoria} disabled={!editCategoria?.label.trim()}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Edit Motivo Dialog */}
      <Dialog open={!!editMotivo} onOpenChange={(o) => !o && setEditMotivo(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar motivo</DialogTitle></DialogHeader>
          {editMotivo && (
            <div className="space-y-3 py-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                <Input value={editMotivo.label} onChange={e => setEditMotivo({ ...editMotivo, label: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Categoria</label>
                  <Select value={editMotivo.categoria} onValueChange={(v) => setEditMotivo({ ...editMotivo, categoria: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                    <SelectContent>{categorias.map(c => <SelectItem key={c.key} value={c.label}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Destino (Departamento)</label>
                  <Select value={editMotivo.destino} onValueChange={(v) => setEditMotivo({ ...editMotivo, destino: v })}>
                    <SelectTrigger><SelectValue placeholder={departamentos.length ? "Selecionar..." : "Sem departamentos"} /></SelectTrigger>
                    <SelectContent>
                      {departamentos.map(d => <SelectItem key={d.id} value={d.designacao}>{d.designacao}{d.sigla ? ` (${d.sigla})` : ""}</SelectItem>)}
                      {editMotivo.destino && !departamentos.some(d => d.designacao === editMotivo.destino) && (
                        <SelectItem value={editMotivo.destino}>{editMotivo.destino}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Limite p/ aceitar (dias)</label>
                  <Input type="number" min={1} value={editMotivo.slaAceitacao} onChange={e => setEditMotivo({ ...editMotivo, slaAceitacao: Number(e.target.value) || 1 })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Limite p/ concluir (dias)</label>
                  <Input type="number" min={1} value={editMotivo.slaConclusao} onChange={e => setEditMotivo({ ...editMotivo, slaConclusao: Number(e.target.value) || 1 })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Multa associada</label>
                <Select value={editMotivo.multa || "__none__"} onValueChange={(v) => setEditMotivo({ ...editMotivo, multa: v === "__none__" ? "" : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem multa</SelectItem>
                    {multas.map(mu => {
                      const invalid = mu.diasAposPrazo <= editMotivo.slaConclusao;
                      return (
                        <SelectItem key={mu.key} value={mu.key} disabled={invalid}>
                          {mu.label} · {formatMultaDias(mu.diasAposPrazo)}{invalid ? " (≤ conclusão)" : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditMotivo(null)}>Cancelar</Button>
            <Button onClick={saveEditMotivo} disabled={!editMotivo?.label.trim() || !editMotivo?.categoria}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

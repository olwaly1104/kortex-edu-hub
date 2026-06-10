import { useState } from "react";
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
import { Settings2, Plus, Layers, AlertCircle, FileText, Trash2, Pencil, AlertTriangle, CalendarClock, GraduationCap, MapPin, Clock, FileCheck2, Wallet, Users } from "lucide-react";
import {
  tipoConfig as initialTipoConfig,
  categoriaConfig as initialCategoriaConfig,
  estadoSolicitacaoConfig as initialEstadoConfig,
  destinoConfig,
  type Categoria,
} from "@/data/gapData";
import { candidaturas as allCandidaturas } from "@/data/admissoesData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type EstadoItem = { key: string; label: string; color: string };
type CategoriaItem = { key: string; label: string; color: string };
type MotivoItem = { key: string; label: string; categoria: string; destino: string; responsavel: string; slaAceitacao: number; slaConclusao: number; multa: string };
type MultaItem = { key: string; label: string; diasAposPrazo: number; valor: number; descricao: string };

const INITIAL_MULTAS: MultaItem[] = [
  { key: "atraso_relatorio", label: "Atraso na entrega de relatório", diasAposPrazo: 5, valor: 4000, descricao: "Aplicada 5 dias após o prazo de conclusão do relatório obrigatório." },
  { key: "falta_injustificada", label: "Falta injustificada a sessão", diasAposPrazo: 5, valor: 6000, descricao: "Aplicada 5 dias após o prazo de regularização da ausência." },
  { key: "atraso_aula", label: "Atraso superior a 15min na aula", diasAposPrazo: 5, valor: 3000, descricao: "Aplicada 5 dias após o prazo de justificação dos atrasos repetidos." },
  { key: "incumprimento_sla", label: "Incumprimento de SLA de solicitação", diasAposPrazo: 5, valor: 5000, descricao: "Aplicada 5 dias após o prazo de tratamento da solicitação." },
  { key: "uso_indevido", label: "Uso indevido de recursos institucionais", diasAposPrazo: 5, valor: 8000, descricao: "Aplicada 5 dias após o prazo de regularização do uso de recursos." },
];



const STAFF_OPTIONS = [
  "Dra. Helena Cabral · GAP",
  "Dr. João Tavares · GAP",
  "Eng. Paulo Mendes · CTI",
  "Eng.ª Sara Lima · CTI",
  "Dra. Cita · Secretaria Académica",
  "Dra. Ana Belmiro · Académica",
  "Dra. Lúcia Mateus · Tesouraria",
  "Sr. Adriano Paka · Cobranças",
  "Dra. Catarina Lopes · Financeiro",
  "Coord. Faculdade de Ciências Exatas",
  "Coord. Faculdade de Medicina",
];

const defaultResponsavelByDestino = (destino: string) => {
  switch (destino) {
    case "CTI": return "Eng. Paulo Mendes · CTI";
    case "Académica": return "Dra. Cita · Secretaria Académica";
    case "Financeiro": return "Dra. Lúcia Mateus · Tesouraria";
    case "Faculdade": return "Coord. Faculdade de Ciências Exatas";
    default: return "Dra. Helena Cabral · GAP";
  }
};

export default function GapConfiguracao() {
  const { toast } = useToast();

  const [estados, setEstados] = useState<EstadoItem[]>(
    Object.entries(initialEstadoConfig).map(([key, v]) => ({ key, label: v.label, color: v.color }))
  );
  const [categorias, setCategorias] = useState<CategoriaItem[]>(
    Object.entries(initialCategoriaConfig).map(([key, v]) => ({ key, label: v.label, color: v.color }))
  );
  const [multas, setMultas] = useState<MultaItem[]>(INITIAL_MULTAS);
  const [motivos, setMotivos] = useState<MotivoItem[]>(
    Object.entries(initialTipoConfig).map(([key, v]) => {
      const slaConcl = v.slaDias;
      // Mock: atribuir multa por defeito (5 dias) apenas se conclusão < 5d
      const multaDefault = slaConcl < 5
        ? (v.categoria === "Académico" ? "atraso_relatorio"
          : v.categoria === "Tecnológico" ? "incumprimento_sla"
          : v.categoria === "Financeiro" ? "uso_indevido"
          : "atraso_relatorio")
        : "";
      return {
        key, label: v.label, categoria: v.categoria, destino: v.destino,
        responsavel: (v as any).responsavelDestino || defaultResponsavelByDestino(v.destino),
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
  const [multaOpen, setMultaOpen] = useState(false);

  // New estado form
  const [newEstadoLabel, setNewEstadoLabel] = useState("");
  // New categoria form
  const [newCatLabel, setNewCatLabel] = useState("");
  // New motivo form
  const [newMotLabel, setNewMotLabel] = useState("");
  const [newMotCat, setNewMotCat] = useState<string>("");
  const [newMotDest, setNewMotDest] = useState<string>("CTI");
  const [newMotSlaAceit, setNewMotSlaAceit] = useState<number>(2);
  const [newMotSlaConcl, setNewMotSlaConcl] = useState<number>(5);
  const [newMotResp, setNewMotResp] = useState<string>(STAFF_OPTIONS[0]);
  const [newMotMulta, setNewMotMulta] = useState<string>("__none__");
  // New multa form
  const [newMultaLabel, setNewMultaLabel] = useState("");
  const [newMultaDias, setNewMultaDias] = useState<number>(3);
  const [newMultaDesc, setNewMultaDesc] = useState("");

  const slugify = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

  const handleAddEstado = () => {
    if (!newEstadoLabel.trim()) return;
    const key = slugify(newEstadoLabel);
    setEstados(prev => [...prev, {
      key, label: newEstadoLabel.trim(),
      color: "bg-slate-100 text-slate-700 border-slate-200",
    }]);
    setNewEstadoLabel("");
    setEstadoOpen(false);
    toast({ title: "Estado criado", description: `“${newEstadoLabel}” foi adicionado.` });
  };

  const handleAddCategoria = () => {
    if (!newCatLabel.trim()) return;
    const key = slugify(newCatLabel);
    setCategorias(prev => [...prev, {
      key, label: newCatLabel.trim(),
      color: "bg-slate-50 text-slate-700 border-slate-200",
    }]);
    setNewCatLabel("");
    setCatOpen(false);
    toast({ title: "Categoria criada", description: `“${newCatLabel}” foi adicionada.` });
  };

  const handleAddMotivo = () => {
    if (!newMotLabel.trim() || !newMotCat) return;
    const key = slugify(newMotLabel);
    setMotivos(prev => [...prev, {
      key, label: newMotLabel.trim(),
      categoria: newMotCat, destino: newMotDest,
      responsavel: newMotResp,
      slaAceitacao: newMotSlaAceit, slaConclusao: newMotSlaConcl,
      multa: newMotMulta === "__none__" ? "" : newMotMulta,
    }]);
    setNewMotLabel(""); setNewMotCat(""); setNewMotDest("CTI");
    setNewMotSlaAceit(2); setNewMotSlaConcl(5);
    setNewMotResp(STAFF_OPTIONS[0]);
    setNewMotMulta("__none__");
    setMotivoOpen(false);
    toast({ title: "Motivo criado", description: `“${newMotLabel}” foi adicionado.` });
  };

  const removeEstado = (key: string) => setEstados(prev => prev.filter(e => e.key !== key));
  const removeCategoria = (key: string) => setCategorias(prev => prev.filter(c => c.key !== key));
  const removeMotivo = (key: string) => setMotivos(prev => prev.filter(m => m.key !== key));

  // Edit dialogs
  const [editEstado, setEditEstado] = useState<EstadoItem | null>(null);
  const [editCategoria, setEditCategoria] = useState<CategoriaItem | null>(null);
  const [editMotivo, setEditMotivo] = useState<MotivoItem | null>(null);
  const [editMulta, setEditMulta] = useState<MultaItem | null>(null);

  const saveEditEstado = () => {
    if (!editEstado || !editEstado.label.trim()) return;
    setEstados(prev => prev.map(e => e.key === editEstado.key ? editEstado : e));
    toast({ title: "Estado atualizado" });
    setEditEstado(null);
  };
  const saveEditCategoria = () => {
    if (!editCategoria || !editCategoria.label.trim()) return;
    setCategorias(prev => prev.map(c => c.key === editCategoria.key ? editCategoria : c));
    toast({ title: "Categoria atualizada" });
    setEditCategoria(null);
  };
  const saveEditMotivo = () => {
    if (!editMotivo || !editMotivo.label.trim()) return;
    setMotivos(prev => prev.map(m => m.key === editMotivo.key ? editMotivo : m));
    toast({ title: "Motivo atualizado" });
    setEditMotivo(null);
  };
  const saveEditMulta = () => {
    if (!editMulta || !editMulta.label.trim()) return;
    setMultas(prev => prev.map(m => m.key === editMulta.key ? editMulta : m));
    toast({ title: "Multa atualizada" });
    setEditMulta(null);
  };

  const formatKz = (n: number) =>
    new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + " Kz";

  const formatMultaDias = (d: number) => `${d}d após prazo`;

  // ===== AGENDAMENTOS =====
  type AgCategoria = { key: string; label: string; color: string };
  type AgMotivo = { key: string; label: string; categoria: string; duracao: number };
  type AgSala = { key: string; label: string; lotacao: number };

  const [agCategorias, setAgCategorias] = useState<AgCategoria[]>([
    { key: "psicologico", label: "Psicológico", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { key: "academico", label: "Académico", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { key: "carreira", label: "Carreira / Vocacional", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { key: "social", label: "Social", color: "bg-amber-100 text-amber-800 border-amber-200" },
    { key: "saude", label: "Saúde", color: "bg-rose-100 text-rose-800 border-rose-200" },
    { key: "financeiro", label: "Financeiro", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
    { key: "documentacao", label: "Documentação", color: "bg-slate-100 text-slate-700 border-slate-200" },
  ]);
  const [agMotivos, setAgMotivos] = useState<AgMotivo[]>([
    { key: "acomp_psico", label: "Acompanhamento psicológico", categoria: "Psicológico", duracao: 50 },
    { key: "metodos_estudo", label: "Orientação académica — métodos de estudo", categoria: "Académico", duracao: 40 },
    { key: "vocacional", label: "Orientação vocacional", categoria: "Carreira / Vocacional", duracao: 60 },
    { key: "estagio", label: "Acompanhamento de estágio", categoria: "Carreira / Vocacional", duracao: 30 },
    { key: "mediacao", label: "Mediação de conflito", categoria: "Social", duracao: 60 },
  ]);
  const [agSalas, setAgSalas] = useState<AgSala[]>([
    { key: "gap1", label: "Gab. GAP 1", lotacao: 4 },
    { key: "gap2", label: "Gab. GAP 2", lotacao: 4 },
    { key: "gap3", label: "Sala de Reuniões GAP", lotacao: 8 },
  ]);
  const [agModalidades, setAgModalidades] = useState<{ key: string; label: string }[]>([
    { key: "presencial", label: "Presencial" },
    { key: "online", label: "Online" },
  ]);
  const [agDuracaoPadrao, setAgDuracaoPadrao] = useState(45);
  const [agAntecedenciaMin, setAgAntecedenciaMin] = useState(24);
  const [agHoraInicio, setAgHoraInicio] = useState("08:00");
  const [agHoraFim, setAgHoraFim] = useState("17:00");

  const [newAgCat, setNewAgCat] = useState("");
  const [newAgMotLabel, setNewAgMotLabel] = useState("");
  const [newAgMotCat, setNewAgMotCat] = useState("");
  const [newAgMotDur, setNewAgMotDur] = useState(45);
  const [newAgSalaLabel, setNewAgSalaLabel] = useState("");
  const [newAgSalaLot, setNewAgSalaLot] = useState(4);
  const [newAgModLabel, setNewAgModLabel] = useState("");

  // ===== CANDIDATURAS =====
  type CdEstado = { key: string; label: string; color: string };
  type CdEtapa = { key: string; label: string; diasAposSubmissao: number; obrigatoria: boolean; estadosPossiveis: string[] };
  type CdSessao = { key: string; etapa: string; data: string; hora: string; local: string; capacidade: number };
  type CdPergunta = { key: string; label: string; tipo: "texto" | "numero" | "data" | "selecao" | "ficheiro"; obrigatoria: boolean };
  type CdFormStep = { key: string; titulo: string; subtitulo: string; perguntas: CdPergunta[] };

  const [cdEstados, setCdEstados] = useState<CdEstado[]>([
    { key: "completo", label: "Completo", color: "bg-green-50 text-green-700 border-green-200" },
    { key: "aprovado", label: "Aprovado", color: "bg-green-50 text-green-700 border-green-200" },
    { key: "agendado", label: "Agendado", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { key: "remarcado", label: "Remarcado", color: "bg-amber-50 text-amber-700 border-amber-200" },
    { key: "falta", label: "Falta", color: "bg-red-50 text-red-700 border-red-200" },
    { key: "reprovado", label: "Reprovado", color: "bg-red-50 text-red-700 border-red-200" },
  ]);
  const [cdEtapas, setCdEtapas] = useState<CdEtapa[]>([
    { key: "submissao", label: "Submissão da candidatura", diasAposSubmissao: 0, obrigatoria: true, estadosPossiveis: ["completo"] },
    { key: "entrevista", label: "Entrevista", diasAposSubmissao: 12, obrigatoria: true, estadosPossiveis: ["agendado", "completo", "remarcado", "falta"] },
    { key: "curso_preparatorio", label: "Curso Preparatório", diasAposSubmissao: 35, obrigatoria: false, estadosPossiveis: ["agendado", "completo", "remarcado"] },
    { key: "exame", label: "Exame de Acesso", diasAposSubmissao: 60, obrigatoria: true, estadosPossiveis: ["agendado", "aprovado", "reprovado", "remarcado"] },
  ]);
  const [cdSessoes, setCdSessoes] = useState<CdSessao[]>([
    { key: "cp_s1", etapa: "Curso Preparatório", data: "2026-07-18", hora: "09:00", local: "Anfiteatro A — Campus UPRA", capacidade: 80 },
    { key: "cp_s2", etapa: "Curso Preparatório", data: "2026-07-25", hora: "09:00", local: "Anfiteatro B — Campus UPRA", capacidade: 80 },
    { key: "ex_s1", etapa: "Exame de Acesso", data: "2026-08-15", hora: "09:00", local: "Edifício Central, Sala 04", capacidade: 60 },
    { key: "ex_s2", etapa: "Exame de Acesso", data: "2026-08-22", hora: "14:00", local: "Edifício Central, Sala 06", capacidade: 60 },
  ]);
  const [cdNotaMinima, setCdNotaMinima] = useState(10);
  const [cdTaxa, setCdTaxa] = useState(15000);
  const [cdMaxOpcoes, setCdMaxOpcoes] = useState(3);

  const [cdFormSteps, setCdFormSteps] = useState<CdFormStep[]>([
    { key: "dados_pessoais", titulo: "Dados Pessoais", subtitulo: "Identificação do candidato", perguntas: [
      { key: "nome_completo", label: "Nome completo", tipo: "texto", obrigatoria: true },
      { key: "data_nasc", label: "Data de nascimento", tipo: "data", obrigatoria: true },
      { key: "bi", label: "Bilhete de Identidade", tipo: "texto", obrigatoria: true },
      { key: "genero", label: "Género", tipo: "selecao", obrigatoria: true },
      { key: "naturalidade", label: "Naturalidade", tipo: "texto", obrigatoria: true },
    ]},
    { key: "morada_contactos", titulo: "Morada & Contactos", subtitulo: "Contactos e residência", perguntas: [
      { key: "telefone", label: "Telefone", tipo: "texto", obrigatoria: true },
      { key: "email", label: "Email", tipo: "texto", obrigatoria: true },
      { key: "morada", label: "Morada de residência", tipo: "texto", obrigatoria: true },
      { key: "provincia", label: "Província", tipo: "selecao", obrigatoria: true },
    ]},
    { key: "formacao", titulo: "Formação", subtitulo: "Histórico do ensino secundário", perguntas: [
      { key: "escola", label: "Escola de origem", tipo: "texto", obrigatoria: true },
      { key: "ano_conclusao", label: "Ano de conclusão", tipo: "numero", obrigatoria: true },
      { key: "media_final", label: "Média final", tipo: "numero", obrigatoria: true },
      { key: "cert_medio", label: "Certificado do Ensino Médio", tipo: "ficheiro", obrigatoria: true },
      { key: "decl_notas", label: "Declaração de Notas", tipo: "ficheiro", obrigatoria: true },
    ]},
    { key: "curso", titulo: "Curso", subtitulo: "Faculdades e cursos por ordem de escolha", perguntas: [
      { key: "opcao1", label: "1ª opção de curso", tipo: "selecao", obrigatoria: true },
      { key: "opcao2", label: "2ª opção de curso", tipo: "selecao", obrigatoria: false },
      { key: "opcao3", label: "3ª opção de curso", tipo: "selecao", obrigatoria: false },
    ]},
    { key: "entrevista", titulo: "Entrevista", subtitulo: "Marcação da data de entrevista", perguntas: [
      { key: "disponibilidade", label: "Disponibilidade horária", tipo: "selecao", obrigatoria: true },
      { key: "observacoes", label: "Observações", tipo: "texto", obrigatoria: false },
    ]},
    { key: "curso_prep", titulo: "Curso Preparatório", subtitulo: "Opcional — escolha da sessão", perguntas: [
      { key: "inscricao", label: "Pretende inscrever-se?", tipo: "selecao", obrigatoria: true },
      { key: "sessao", label: "Sessão preferida", tipo: "selecao", obrigatoria: false },
    ]},
    { key: "revisao", titulo: "Revisão", subtitulo: "Confirmação final da candidatura", perguntas: [
      { key: "confirma", label: "Confirmo que os dados estão corretos", tipo: "selecao", obrigatoria: true },
    ]},
  ]);

  const [cdEstadoOpen, setCdEstadoOpen] = useState(false);
  const [newCdEstadoLabel, setNewCdEstadoLabel] = useState("");
  const [newCdEtapaLabel, setNewCdEtapaLabel] = useState("");
  const [newCdEtapaDias, setNewCdEtapaDias] = useState(7);
  const [newCdSessEtapa, setNewCdSessEtapa] = useState("Curso Preparatório");
  const [newCdSessData, setNewCdSessData] = useState("");
  const [newCdSessHora, setNewCdSessHora] = useState("09:00");
  const [newCdSessLocal, setNewCdSessLocal] = useState("");
  const [newCdSessCap, setNewCdSessCap] = useState(60);
  const [expandedStep, setExpandedStep] = useState<string | null>("dados_pessoais");
  const [newPergStep, setNewPergStep] = useState<string>("");
  const [newPergLabel, setNewPergLabel] = useState("");
  const [newPergTipo, setNewPergTipo] = useState<CdPergunta["tipo"]>("texto");
  const [newPergObrig, setNewPergObrig] = useState(true);


  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-primary" /> Configuração
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Configure tudo o que diz respeito a Solicitações, Agendamentos e Candidaturas do GAP.
        </p>
      </div>

      <Tabs defaultValue="solicitacoes" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-xl">
          <TabsTrigger value="solicitacoes" className="gap-1.5"><FileText className="w-3.5 h-3.5" /> Solicitações</TabsTrigger>
          <TabsTrigger value="agendamentos" className="gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> Agendamentos</TabsTrigger>
          <TabsTrigger value="candidaturas" className="gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Candidaturas</TabsTrigger>
        </TabsList>

        <TabsContent value="solicitacoes" className="space-y-6 mt-0">

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Estados</h2>
            <span className="text-[11px] text-muted-foreground tabular-nums">· {estados.length}</span>
          </div>
          <Dialog open={estadoOpen} onOpenChange={setEstadoOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                <Plus className="w-3.5 h-3.5" /> Novo estado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Novo estado</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                  <Input value={newEstadoLabel} onChange={e => setNewEstadoLabel(e.target.value)} placeholder="Ex: Em revisão" />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={handleAddEstado} disabled={!newEstadoLabel.trim()}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-wrap gap-2">
          {estados.map(e => (
            <div key={e.key} className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs", e.color)}>
              <span className="font-medium">{e.label}</span>
              <button onClick={() => setEditEstado(e)} className="opacity-60 hover:opacity-100" aria-label={`Editar ${e.label}`}>
                <Pencil className="w-3 h-3" />
              </button>
              <button onClick={() => removeEstado(e.key)} className="opacity-60 hover:opacity-100" aria-label={`Remover ${e.label}`}>
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Categorias */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Categorias</h2>
            <span className="text-[11px] text-muted-foreground tabular-nums">· {categorias.length}</span>
          </div>
          <Dialog open={catOpen} onOpenChange={setCatOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                <Plus className="w-3.5 h-3.5" /> Nova categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Nova categoria</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                  <Input value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)} placeholder="Ex: Social" />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={handleAddCategoria} disabled={!newCatLabel.trim()}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-wrap gap-2">
          {categorias.map(c => {
            const count = motivos.filter(m => m.categoria === c.label).length;
            return (
              <div key={c.key} className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs", c.color)}>
                <span className="font-medium">{c.label}</span>
                <span className="opacity-60 tabular-nums">· {count} motivos</span>
                <button onClick={() => setEditCategoria(c)} className="opacity-60 hover:opacity-100" aria-label={`Editar ${c.label}`}>
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={() => removeCategoria(c.key)} className="opacity-60 hover:opacity-100" aria-label={`Remover ${c.label}`}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Motivos */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Motivos</h2>
            <span className="text-[11px] text-muted-foreground tabular-nums">· {motivos.length}</span>
          </div>
          <Dialog open={motivoOpen} onOpenChange={setMotivoOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                <Plus className="w-3.5 h-3.5" /> Novo motivo
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
                      <SelectContent>
                        {categorias.map(c => <SelectItem key={c.key} value={c.label}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Destino</label>
                    <Select value={newMotDest} onValueChange={setNewMotDest}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(destinoConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Limite p/ aceitar (dias)</label>
                    <Input type="number" min={1} value={newMotSlaAceit} onChange={e => setNewMotSlaAceit(Number(e.target.value) || 1)} />
                    <p className="text-[10px] text-muted-foreground mt-1">Pendente → Em Execução</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Limite p/ concluir (dias)</label>
                    <Input type="number" min={1} value={newMotSlaConcl} onChange={e => setNewMotSlaConcl(Number(e.target.value) || 1)} />
                    <p className="text-[10px] text-muted-foreground mt-1">Em Execução → Concluída</p>
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
                  <p className="text-[10px] text-muted-foreground mt-1">Aplicada se o limite de conclusão for excedido</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Responsável</label>
                  <Select value={newMotResp} onValueChange={setNewMotResp}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STAFF_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Motivo</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Categoria</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Destino</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Responsável</th>
                <th className="text-center p-3 font-medium text-muted-foreground text-xs whitespace-nowrap">Aceitar</th>
                <th className="text-center p-3 font-medium text-muted-foreground text-xs whitespace-nowrap">Concluir</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs whitespace-nowrap">Multa</th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody>
              {motivos.map(m => {
                const catCfg = categorias.find(c => c.label === m.categoria);
                const destCfg = destinoConfig[m.destino as keyof typeof destinoConfig];
                return (
                  <tr key={m.key} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="p-3 text-xs font-medium text-foreground">{m.label}</td>
                    <td className="p-3">
                      {catCfg ? (
                        <Badge variant="outline" className={cn("text-[10px]", catCfg.color)}>{catCfg.label}</Badge>
                      ) : <span className="text-xs text-muted-foreground">{m.categoria}</span>}
                    </td>
                    <td className="p-3">
                      {destCfg ? (
                        <Badge variant="outline" className={cn("text-[10px]", destCfg.color)}>{destCfg.label}</Badge>
                      ) : <span className="text-xs text-muted-foreground">{m.destino}</span>}
                    </td>
                    <td className="p-3 text-xs text-foreground whitespace-nowrap">{m.responsavel}</td>
                    <td className="p-3 text-center text-xs tabular-nums text-amber-700">{m.slaAceitacao}d</td>
                    <td className="p-3 text-center text-xs tabular-nums text-blue-700">{m.slaConclusao}d</td>
                    <td className="p-3 text-xs whitespace-nowrap tabular-nums">
                      {(() => {
                        const mu = multas.find(x => x.key === m.multa);
                        return mu ? <span className="text-foreground">{mu.diasAposPrazo}d</span> : <span className="text-muted-foreground">—</span>;
                      })()}
                    </td>
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
          {/* Parâmetros gerais */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Parâmetros de agendamento</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Duração padrão (min)</label>
                <Input type="number" min={10} step={5} value={agDuracaoPadrao} onChange={e => setAgDuracaoPadrao(Number(e.target.value) || 30)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Antecedência mín. (horas)</label>
                <Input type="number" min={0} value={agAntecedenciaMin} onChange={e => setAgAntecedenciaMin(Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Início atendimento</label>
                <Input type="time" value={agHoraInicio} onChange={e => setAgHoraInicio(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Fim atendimento</label>
                <Input type="time" value={agHoraFim} onChange={e => setAgHoraFim(e.target.value)} />
              </div>
            </div>
          </Card>

          {/* Categorias de atendimento */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Categorias de atendimento</h2>
                <span className="text-[11px] text-muted-foreground tabular-nums">· {agCategorias.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input value={newAgCat} onChange={e => setNewAgCat(e.target.value)} placeholder="Nova categoria" className="h-8 w-48 text-xs" />
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => {
                  if (!newAgCat.trim()) return;
                  const key = slugify(newAgCat);
                  setAgCategorias(prev => [...prev, { key, label: newAgCat.trim(), color: "bg-slate-100 text-slate-700 border-slate-200" }]);
                  setNewAgCat("");
                  toast({ title: "Categoria adicionada" });
                }}><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {agCategorias.map(c => (
                <div key={c.key} className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs", c.color)}>
                  <span className="font-medium">{c.label}</span>
                  <button onClick={() => setAgCategorias(prev => prev.filter(x => x.key !== c.key))} className="opacity-60 hover:opacity-100">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Motivos de agendamento */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Motivos de agendamento</h2>
                <span className="text-[11px] text-muted-foreground tabular-nums">· {agMotivos.length}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_120px_auto] gap-2 mb-3">
              <Input value={newAgMotLabel} onChange={e => setNewAgMotLabel(e.target.value)} placeholder="Designação do motivo" className="h-9 text-xs" />
              <Select value={newAgMotCat} onValueChange={setNewAgMotCat}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>{agCategorias.map(c => <SelectItem key={c.key} value={c.label}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" min={10} step={5} value={newAgMotDur} onChange={e => setNewAgMotDur(Number(e.target.value) || 30)} placeholder="Duração" className="h-9 text-xs" />
              <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5" onClick={() => {
                if (!newAgMotLabel.trim() || !newAgMotCat) return;
                setAgMotivos(prev => [...prev, { key: slugify(newAgMotLabel), label: newAgMotLabel.trim(), categoria: newAgMotCat, duracao: newAgMotDur }]);
                setNewAgMotLabel(""); setNewAgMotCat(""); setNewAgMotDur(45);
                toast({ title: "Motivo adicionado" });
              }}><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Motivo</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Categoria</th>
                    <th className="text-center p-3 font-medium text-muted-foreground text-xs">Duração</th>
                    <th className="w-12" />
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
                        <td className="p-3 text-center text-xs tabular-nums text-blue-700">{m.duracao} min</td>
                        <td className="p-3 text-right">
                          <button onClick={() => setAgMotivos(prev => prev.filter(x => x.key !== m.key))} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Salas / Gabinetes */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Salas / Gabinetes</h2>
                <span className="text-[11px] text-muted-foreground tabular-nums">· {agSalas.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input value={newAgSalaLabel} onChange={e => setNewAgSalaLabel(e.target.value)} placeholder="Nome da sala" className="h-8 w-44 text-xs" />
                <Input type="number" min={1} value={newAgSalaLot} onChange={e => setNewAgSalaLot(Number(e.target.value) || 1)} placeholder="Lotação" className="h-8 w-24 text-xs" />
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => {
                  if (!newAgSalaLabel.trim()) return;
                  setAgSalas(prev => [...prev, { key: slugify(newAgSalaLabel), label: newAgSalaLabel.trim(), lotacao: newAgSalaLot }]);
                  setNewAgSalaLabel(""); setNewAgSalaLot(4);
                  toast({ title: "Sala adicionada" });
                }}><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {agSalas.map(s => (
                <div key={s.key} className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="font-medium text-foreground">{s.label}</span>
                  <span className="text-muted-foreground tabular-nums">· {s.lotacao} lug.</span>
                  <button onClick={() => setAgSalas(prev => prev.filter(x => x.key !== s.key))} className="opacity-60 hover:opacity-100">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Modalidades */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Modalidades</h2>
                <span className="text-[11px] text-muted-foreground tabular-nums">· {agModalidades.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input value={newAgModLabel} onChange={e => setNewAgModLabel(e.target.value)} placeholder="Nova modalidade" className="h-8 w-44 text-xs" />
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => {
                  if (!newAgModLabel.trim()) return;
                  setAgModalidades(prev => [...prev, { key: slugify(newAgModLabel), label: newAgModLabel.trim() }]);
                  setNewAgModLabel("");
                }}><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {agModalidades.map(m => (
                <div key={m.key} className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs">
                  <span className="font-medium text-foreground">{m.label}</span>
                  <button onClick={() => setAgModalidades(prev => prev.filter(x => x.key !== m.key))} className="opacity-60 hover:opacity-100">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ============ CANDIDATURAS ============ */}
        <TabsContent value="candidaturas" className="space-y-6 mt-0">
          {/* ===== Candidaturas Hoje — visão operacional ===== */}
          {(() => {
            const todayKey = new Date().toISOString().slice(0, 10);
            const hoje = allCandidaturas.filter(c => c.dataSubmissao.slice(0, 10) === todayKey);
            const total = allCandidaturas.length;
            const pendentes = allCandidaturas.filter(c => c.estado === "pendente" || c.estado === "incompleto").length;
            const aprovados = allCandidaturas.filter(c => c.estado === "aprovado").length;
            const reprovados = allCandidaturas.filter(c => c.estado === "reprovado").length;
            const pagPendente = allCandidaturas.filter(c => c.pagamento?.estado === "pendente").length;
            const receita = allCandidaturas.filter(c => c.pagamento?.estado === "confirmado").reduce((s, c) => s + (c.pagamento?.valor || 0), 0);

            // Top cursos
            const cursoCount = new Map<string, number>();
            allCandidaturas.forEach(c => {
              [c.cursoOpcao1, c.cursoOpcao2, c.cursoOpcao3].filter(Boolean).forEach(k => {
                cursoCount.set(k as string, (cursoCount.get(k as string) || 0) + 1);
              });
            });
            const topCursos = [...cursoCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
            const maxCurso = topCursos[0]?.[1] || 1;

            const kpis = [
              { label: "Submetidas hoje", value: hoje.length, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
              { label: "Total ativas", value: total, color: "text-foreground", bg: "bg-slate-50 border-slate-200" },
              { label: "Pendentes", value: pendentes, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
              { label: "Aprovados", value: aprovados, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
              { label: "Reprovados", value: reprovados, color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
              { label: "Pagamentos por confirmar", value: pagPendente, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
            ];

            return (
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold text-foreground">Candidaturas — visão de hoje</h2>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      · {new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                    {formatKz(receita)} arrecadados
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  {kpis.map(k => (
                    <div key={k.label} className={cn("rounded-lg border p-3", k.bg)}>
                      <div className={cn("text-2xl font-bold tabular-nums leading-none", k.color)}>{k.value}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1.5">{k.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Top cursos */}
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="px-3 py-2 bg-muted/30 border-b border-border flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-foreground">Cursos mais procurados</h3>
                    </div>
                    <ul className="divide-y divide-border">
                      {topCursos.map(([curso, n]) => (
                        <li key={curso} className="px-3 py-2 flex items-center gap-3">
                          <span className="text-xs font-medium text-foreground flex-1 truncate">{curso}</span>
                          <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${(n / maxCurso) * 100}%` }} />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">{n}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Submetidas hoje */}
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="px-3 py-2 bg-muted/30 border-b border-border flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-foreground">Submetidas hoje</h3>
                      <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">{hoje.length}</span>
                    </div>
                    {hoje.length === 0 ? (
                      <div className="px-3 py-6 text-center text-[11px] text-muted-foreground italic">Sem candidaturas submetidas hoje</div>
                    ) : (
                      <ul className="divide-y divide-border max-h-48 overflow-y-auto">
                        {hoje.slice(0, 8).map(c => (
                          <li key={c.id} className="px-3 py-2 flex items-center gap-2 text-xs">
                            <span className="font-medium text-foreground truncate flex-1">{c.nome}</span>
                            <Badge variant="outline" className="text-[9px]">{c.cursoOpcao1}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Card>
            );
          })()}

          {/* Estados das etapas */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Estados das etapas</h2>
                <span className="text-[11px] text-muted-foreground tabular-nums">· {cdEstados.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input value={newCdEstadoLabel} onChange={e => setNewCdEstadoLabel(e.target.value)} placeholder="Novo estado" className="h-8 w-44 text-xs" />
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => {
                  if (!newCdEstadoLabel.trim()) return;
                  setCdEstados(prev => [...prev, { key: slugify(newCdEstadoLabel), label: newCdEstadoLabel.trim(), color: "bg-slate-50 text-slate-700 border-slate-200" }]);
                  setNewCdEstadoLabel("");
                }}><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {cdEstados.map(e => (
                <div key={e.key} className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs", e.color)}>
                  <span className="font-medium">{e.label}</span>
                  <button onClick={() => setCdEstados(prev => prev.filter(x => x.key !== e.key))} className="opacity-60 hover:opacity-100">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              Sequência obrigatória: cada etapa só avança quando a anterior está <strong>Completo</strong>. Não é possível Exame enquanto a Entrevista não estiver completa.
            </p>
          </Card>

          {/* Etapas do processo */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Etapas do processo</h2>
                <span className="text-[11px] text-muted-foreground tabular-nums">· {cdEtapas.length}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-2 mb-3">
              <Input value={newCdEtapaLabel} onChange={e => setNewCdEtapaLabel(e.target.value)} placeholder="Nome da etapa" className="h-9 text-xs" />
              <Input type="number" min={0} value={newCdEtapaDias} onChange={e => setNewCdEtapaDias(Number(e.target.value) || 0)} placeholder="Dias após submissão" className="h-9 text-xs" />
              <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5" onClick={() => {
                if (!newCdEtapaLabel.trim()) return;
                setCdEtapas(prev => [...prev, { key: slugify(newCdEtapaLabel), label: newCdEtapaLabel.trim(), diasAposSubmissao: newCdEtapaDias, obrigatoria: true, estadosPossiveis: ["agendado", "completo"] }]);
                setNewCdEtapaLabel(""); setNewCdEtapaDias(7);
                toast({ title: "Etapa adicionada" });
              }}><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">#</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Etapa</th>
                    <th className="text-center p-3 font-medium text-muted-foreground text-xs">Dias após submissão</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Estados possíveis</th>
                    <th className="text-center p-3 font-medium text-muted-foreground text-xs">Obrigatória</th>
                    <th className="w-12" />
                  </tr>
                </thead>
                <tbody>
                  {cdEtapas.map((e, i) => (
                    <tr key={e.key} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="p-3 text-xs text-muted-foreground tabular-nums">{i + 1}</td>
                      <td className="p-3 text-xs font-medium text-foreground">{e.label}</td>
                      <td className="p-3 text-center">
                        <Input type="number" min={0} value={e.diasAposSubmissao} onChange={ev => setCdEtapas(prev => prev.map(x => x.key === e.key ? { ...x, diasAposSubmissao: Number(ev.target.value) || 0 } : x))} className="h-7 w-20 mx-auto text-center text-xs tabular-nums" />
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {e.estadosPossiveis.map(es => {
                            const cfg = cdEstados.find(x => x.key === es);
                            return cfg ? <Badge key={es} variant="outline" className={cn("text-[9px]", cfg.color)}>{cfg.label}</Badge> : null;
                          })}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => setCdEtapas(prev => prev.map(x => x.key === e.key ? { ...x, obrigatoria: !x.obrigatoria } : x))}>
                          <Badge variant="outline" className={cn("text-[10px] cursor-pointer", e.obrigatoria ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-slate-100 text-slate-600 border-slate-200")}>
                            {e.obrigatoria ? "Sim" : "Opcional"}
                          </Badge>
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => setCdEtapas(prev => prev.filter(x => x.key !== e.key))} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>


          {/* Formulário — perguntas por passo */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Formulário de candidatura — passos e perguntas</h2>
                <span className="text-[11px] text-muted-foreground tabular-nums">· {cdFormSteps.length} passos</span>
              </div>
            </div>
            <div className="space-y-2">
              {cdFormSteps.map((step, idx) => {
                const expanded = expandedStep === step.key;
                return (
                  <div key={step.key} className="rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => setExpandedStep(expanded ? null : step.key)}
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center tabular-nums">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">{step.titulo}</div>
                          <div className="text-[11px] text-muted-foreground">{step.subtitulo}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground tabular-nums">{step.perguntas.length} perguntas</span>
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </button>

                    {expanded && (
                      <div className="border-t bg-muted/10 p-3 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_140px_auto] gap-2">
                          <Input
                            value={newPergStep === step.key ? newPergLabel : ""}
                            onChange={e => { setNewPergStep(step.key); setNewPergLabel(e.target.value); }}
                            placeholder="Nova pergunta"
                            className="h-9 text-xs"
                          />
                          <Select value={newPergStep === step.key ? newPergTipo : "texto"} onValueChange={(v) => { setNewPergStep(step.key); setNewPergTipo(v as CdPergunta["tipo"]); }}>
                            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="texto">Texto</SelectItem>
                              <SelectItem value="numero">Número</SelectItem>
                              <SelectItem value="data">Data</SelectItem>
                              <SelectItem value="selecao">Seleção</SelectItem>
                              <SelectItem value="ficheiro">Ficheiro</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={(newPergStep === step.key ? newPergObrig : true) ? "1" : "0"} onValueChange={(v) => { setNewPergStep(step.key); setNewPergObrig(v === "1"); }}>
                            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Obrigatória</SelectItem>
                              <SelectItem value="0">Opcional</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5" onClick={() => {
                            if (newPergStep !== step.key || !newPergLabel.trim()) return;
                            setCdFormSteps(prev => prev.map(s => s.key === step.key ? {
                              ...s, perguntas: [...s.perguntas, { key: slugify(newPergLabel), label: newPergLabel.trim(), tipo: newPergTipo, obrigatoria: newPergObrig }]
                            } : s));
                            setNewPergLabel(""); setNewPergTipo("texto"); setNewPergObrig(true);
                          }}><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
                        </div>

                        <div className="rounded-md border border-border bg-background overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-muted/30">
                                <th className="text-left p-2 font-medium text-muted-foreground text-[11px]">#</th>
                                <th className="text-left p-2 font-medium text-muted-foreground text-[11px]">Pergunta</th>
                                <th className="text-left p-2 font-medium text-muted-foreground text-[11px]">Tipo</th>
                                <th className="text-center p-2 font-medium text-muted-foreground text-[11px]">Obrigatória</th>
                                <th className="w-10" />
                              </tr>
                            </thead>
                            <tbody>
                              {step.perguntas.map((p, i) => (
                                <tr key={p.key} className="border-b last:border-0 hover:bg-muted/20">
                                  <td className="p-2 text-[11px] text-muted-foreground tabular-nums">{i + 1}</td>
                                  <td className="p-2 text-xs font-medium text-foreground">{p.label}</td>
                                  <td className="p-2">
                                    <Badge variant="outline" className="text-[9px] capitalize">{p.tipo}</Badge>
                                  </td>
                                  <td className="p-2 text-center">
                                    <button onClick={() => setCdFormSteps(prev => prev.map(s => s.key === step.key ? {
                                      ...s, perguntas: s.perguntas.map(q => q.key === p.key ? { ...q, obrigatoria: !q.obrigatoria } : q)
                                    } : s))}>
                                      <Badge variant="outline" className={cn("text-[9px] cursor-pointer", p.obrigatoria ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-slate-100 text-slate-600 border-slate-200")}>
                                        {p.obrigatoria ? "Sim" : "Não"}
                                      </Badge>
                                    </button>
                                  </td>
                                  <td className="p-2 text-right">
                                    <button onClick={() => setCdFormSteps(prev => prev.map(s => s.key === step.key ? {
                                      ...s, perguntas: s.perguntas.filter(q => q.key !== p.key)
                                    } : s))} className="text-muted-foreground hover:text-destructive">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {step.perguntas.length === 0 && (
                                <tr><td colSpan={5} className="p-3 text-center text-[11px] text-muted-foreground italic">Sem perguntas</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

      </Tabs>


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
                    <SelectContent>
                      {categorias.map(c => <SelectItem key={c.key} value={c.label}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Destino</label>
                  <Select value={editMotivo.destino} onValueChange={(v) => setEditMotivo({ ...editMotivo, destino: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(destinoConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Limite p/ aceitar (dias)</label>
                  <Input type="number" min={1} value={editMotivo.slaAceitacao} onChange={e => setEditMotivo({ ...editMotivo, slaAceitacao: Number(e.target.value) || 1 })} />
                  <p className="text-[10px] text-muted-foreground mt-1">Pendente → Em Execução</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Limite p/ concluir (dias)</label>
                  <Input type="number" min={1} value={editMotivo.slaConclusao} onChange={e => setEditMotivo({ ...editMotivo, slaConclusao: Number(e.target.value) || 1 })} />
                  <p className="text-[10px] text-muted-foreground mt-1">Em Execução → Concluída</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Responsável</label>
                <Select value={editMotivo.responsavel} onValueChange={(v) => setEditMotivo({ ...editMotivo, responsavel: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STAFF_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    {editMotivo.responsavel && !STAFF_OPTIONS.includes(editMotivo.responsavel) && (
                      <SelectItem value={editMotivo.responsavel}>{editMotivo.responsavel}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
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
                <p className="text-[10px] text-muted-foreground mt-1">Aplicada se o limite de conclusão for excedido</p>
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

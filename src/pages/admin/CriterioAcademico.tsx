import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Award, Save, RotateCcw, GraduationCap, Sliders, Building2, User, Settings2 } from "lucide-react";
import { useFaculdades, useEstudantes, useCursos } from "@/lib/useInstitution";

type Estado = {
  key: string;
  label: string;
  min: number;
  max: number;
  tone: string;
  dot: string;
};

const DEFAULTS: Estado[] = [
  { key: "excelente", label: "Excelente", min: 16, max: 20, tone: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  { key: "normal", label: "Normal", min: 12, max: 15.99, tone: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  { key: "risco", label: "Em Risco", min: 10, max: 11.99, tone: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  { key: "reprovado", label: "Reprovado", min: 0, max: 9.99, tone: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
];

type Params = {
  escalaMin: number;
  escalaMax: number;
  pesoTarefas: number;
  pesoExames: number;
  notaMinAprovacao: number;
};

const DEFAULT_PARAMS: Params = {
  escalaMin: 0,
  escalaMax: 20,
  pesoTarefas: 40,
  pesoExames: 60,
  notaMinAprovacao: 10,
};

const KEY_PARAMS = "academica.parametrosGerais";
const KEY_GERAL = "academica.criterioAcademico";
const KEY_FAC = "academica.criterioPorFaculdade";
const KEY_DISC = "academica.criterioPorDiscente";

function loadEstados(key: string, fallback: Estado[] = DEFAULTS): Estado[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const p = JSON.parse(raw) as Estado[];
      if (Array.isArray(p) && p.length) return p;
    }
  } catch {}
  return fallback;
}

function EstadosEditor({ estados, setEstados }: { estados: Estado[]; setEstados: (e: Estado[]) => void }) {
  const update = (i: number, k: "min" | "max", v: number) =>
    setEstados(estados.map((e, idx) => (idx === i ? { ...e, [k]: v } : e)));
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-2.5 bg-muted/30 border-b grid grid-cols-[1fr_120px_120px_1fr] gap-3 text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
        <span>Estado</span>
        <span>Média mínima</span>
        <span>Média máxima</span>
        <span>Pré-visualização</span>
      </div>
      <div className="divide-y">
        {estados.map((e, i) => (
          <div key={e.key} className="px-4 py-3 grid grid-cols-[1fr_120px_120px_1fr] gap-3 items-center">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${e.dot}`} />
              <span className="text-sm font-medium">{e.label}</span>
            </div>
            <Input type="number" step="0.01" min={0} max={20} value={e.min}
              onChange={(ev) => update(i, "min", Number(ev.target.value))} className="h-8 text-xs" />
            <Input type="number" step="0.01" min={0} max={20} value={e.max}
              onChange={(ev) => update(i, "max", Number(ev.target.value))} className="h-8 text-xs" />
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${e.tone}`}>
                <GraduationCap className="w-3 h-3 mr-1" /> {e.label}
              </Badge>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {e.min.toFixed(2)} – {e.max.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SectionHeader({ icon: Icon, title, desc, onSave, onReset }: any) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">{title}</h2>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onReset && (
            <Button size="sm" variant="ghost" onClick={onReset} className="gap-1.5 text-xs h-8">
              <RotateCcw className="w-3.5 h-3.5" /> Restaurar
            </Button>
          )}
          {onSave && (
            <Button size="sm" onClick={onSave} className="gap-1.5 text-xs h-8">
              <Save className="w-3.5 h-3.5" /> Guardar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function ParametrosTab() {
  const [p, setP] = useState<Params>(DEFAULT_PARAMS);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY_PARAMS);
      if (raw) setP({ ...DEFAULT_PARAMS, ...JSON.parse(raw) });
    } catch {}
  }, []);
  const total = p.pesoTarefas + p.pesoExames;
  const save = () => {
    if (total !== 100) { toast.error("A soma dos pesos deve ser 100%"); return; }
    localStorage.setItem(KEY_PARAMS, JSON.stringify(p));
    toast.success("Parâmetros gerais guardados");
  };
  const reset = () => { setP(DEFAULT_PARAMS); localStorage.removeItem(KEY_PARAMS); toast.success("Parâmetros restaurados"); };
  return (
    <div className="space-y-4">
      <SectionHeader icon={Sliders} title="Parâmetros Gerais de Avaliação"
        desc="Define a escala de notas, pesos de tarefas e exames, e nota mínima de aprovação."
        onSave={save} onReset={reset} />
      <Card className="p-5 space-y-5">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Escala de avaliação</h3>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <div>
              <Label className="text-xs">Nota mínima</Label>
              <Input type="number" value={p.escalaMin} onChange={(e) => setP({ ...p, escalaMin: Number(e.target.value) })} className="h-8 text-xs mt-1" />
            </div>
            <div>
              <Label className="text-xs">Nota máxima</Label>
              <Input type="number" value={p.escalaMax} onChange={(e) => setP({ ...p, escalaMax: Number(e.target.value) })} className="h-8 text-xs mt-1" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Padrão institucional: <strong>0–20</strong>.</p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Pesos da média geral</h3>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <div>
              <Label className="text-xs">Peso das Tarefas (%)</Label>
              <Input type="number" min={0} max={100} value={p.pesoTarefas} onChange={(e) => setP({ ...p, pesoTarefas: Number(e.target.value) })} className="h-8 text-xs mt-1" />
            </div>
            <div>
              <Label className="text-xs">Peso dos Exames (%)</Label>
              <Input type="number" min={0} max={100} value={p.pesoExames} onChange={(e) => setP({ ...p, pesoExames: Number(e.target.value) })} className="h-8 text-xs mt-1" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Total:</span>
            <Badge variant="outline" className={`text-[10px] ${total === 100 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
              {total}%
            </Badge>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Aprovação</h3>
          <div className="max-w-[200px]">
            <Label className="text-xs">Nota mínima para aprovar</Label>
            <Input type="number" step="0.5" value={p.notaMinAprovacao} onChange={(e) => setP({ ...p, notaMinAprovacao: Number(e.target.value) })} className="h-8 text-xs mt-1" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function GeralTab() {
  const [estados, setEstados] = useState<Estado[]>(DEFAULTS);
  useEffect(() => { setEstados(loadEstados(KEY_GERAL)); }, []);
  const save = () => { localStorage.setItem(KEY_GERAL, JSON.stringify(estados)); toast.success("Critério geral guardado"); };
  const reset = () => { setEstados(DEFAULTS); localStorage.removeItem(KEY_GERAL); toast.success("Critério restaurado"); };
  return (
    <div className="space-y-4">
      <SectionHeader icon={Award} title="Estado Académico — Geral (Instituição)"
        desc="Intervalos aplicados por defeito a toda a instituição."
        onSave={save} onReset={reset} />
      <EstadosEditor estados={estados} setEstados={setEstados} />
    </div>
  );
}

function FaculdadeTab() {
  const { data: faculdades = [] } = useFaculdades();
  const [facId, setFacId] = useState<string>("");
  const [map, setMap] = useState<Record<string, Estado[]>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY_FAC);
      if (raw) setMap(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    if (!facId && faculdades.length) setFacId(faculdades[0].id);
  }, [faculdades, facId]);

  const estados = map[facId] || loadEstados(KEY_GERAL);
  const setEstados = (e: Estado[]) => setMap((m) => ({ ...m, [facId]: e }));
  const save = () => { localStorage.setItem(KEY_FAC, JSON.stringify(map)); toast.success("Critério da faculdade guardado"); };
  const reset = () => {
    const { [facId]: _, ...rest } = map;
    setMap(rest);
    localStorage.setItem(KEY_FAC, JSON.stringify(rest));
    toast.success("Restaurado para o critério geral");
  };

  return (
    <div className="space-y-4">
      <SectionHeader icon={Building2} title="Estado Académico — por Faculdade"
        desc="Sobrescreve o critério geral para faculdades específicas (ex.: regimes mais exigentes)."
        onSave={save} onReset={reset} />
      <Card className="p-4">
        <Label className="text-xs">Faculdade</Label>
        <Select value={facId} onValueChange={setFacId}>
          <SelectTrigger className="h-9 text-xs mt-1 max-w-md"><SelectValue placeholder="Seleciona faculdade" /></SelectTrigger>
          <SelectContent>
            {faculdades.map((f: any) => (
              <SelectItem key={f.id} value={f.id} className="text-xs">{f.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {facId && !map[facId] && (
          <p className="text-[11px] text-muted-foreground mt-2">A usar o critério <strong>Geral</strong>. Ajusta abaixo para criar uma regra específica.</p>
        )}
      </Card>
      {facId && <EstadosEditor estados={estados} setEstados={setEstados} />}
    </div>
  );
}

function DiscenteTab() {
  const { data: estudantes = [] } = useEstudantes();
  const { data: cursos = [] } = useCursos();
  const [discId, setDiscId] = useState<string>("");
  const [map, setMap] = useState<Record<string, Estado[]>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY_DISC);
      if (raw) setMap(JSON.parse(raw));
    } catch {}
  }, []);

  const estados = map[discId] || loadEstados(KEY_GERAL);
  const setEstados = (e: Estado[]) => setMap((m) => ({ ...m, [discId]: e }));
  const save = () => { localStorage.setItem(KEY_DISC, JSON.stringify(map)); toast.success("Critério do discente guardado"); };
  const reset = () => {
    const { [discId]: _, ...rest } = map;
    setMap(rest);
    localStorage.setItem(KEY_DISC, JSON.stringify(rest));
    toast.success("Restaurado para o critério da faculdade/geral");
  };

  const cursoName = (id: string) => cursos.find((c: any) => c.id === id)?.name || "—";

  return (
    <div className="space-y-4">
      <SectionHeader icon={User} title="Estado Académico — por Discente"
        desc="Regras excecionais para discentes individuais (planos de recuperação, mérito, etc.)."
        onSave={save} onReset={reset} />
      <Card className="p-4">
        <Label className="text-xs">Discente</Label>
        <Select value={discId} onValueChange={setDiscId}>
          <SelectTrigger className="h-9 text-xs mt-1 max-w-md"><SelectValue placeholder="Seleciona discente" /></SelectTrigger>
          <SelectContent className="max-h-72">
            {estudantes.map((s: any) => (
              <SelectItem key={s.id} value={s.id} className="text-xs">
                {s.nome_completo} · {cursoName(s.curso_id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {discId && !map[discId] && (
          <p className="text-[11px] text-muted-foreground mt-2">A usar o critério herdado. Ajusta abaixo para criar uma regra individual.</p>
        )}
      </Card>
      {discId && <EstadosEditor estados={estados} setEstados={setEstados} />}
    </div>
  );
}

export default function CriterioAcademico() {
  const [tab, setTab] = useState("parametros");
  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="parametros" className="text-xs gap-1.5">
            <Settings2 className="w-3.5 h-3.5" /> Parâmetros Gerais
          </TabsTrigger>
          <TabsTrigger value="geral" className="text-xs gap-1.5">
            <Award className="w-3.5 h-3.5" /> Estado · Geral
          </TabsTrigger>
          <TabsTrigger value="faculdade" className="text-xs gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Por Faculdade
          </TabsTrigger>
          <TabsTrigger value="discente" className="text-xs gap-1.5">
            <User className="w-3.5 h-3.5" /> Por Discente
          </TabsTrigger>
        </TabsList>
        <TabsContent value="parametros" className="mt-0"><ParametrosTab /></TabsContent>
        <TabsContent value="geral" className="mt-0"><GeralTab /></TabsContent>
        <TabsContent value="faculdade" className="mt-0"><FaculdadeTab /></TabsContent>
        <TabsContent value="discente" className="mt-0"><DiscenteTab /></TabsContent>
      </Tabs>
    </div>
  );
}

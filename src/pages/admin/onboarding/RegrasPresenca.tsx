import { useEffect, useState } from "react";
import { OnboardingStepBanner, markOnboardingStepDone } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clock, Percent, AlertTriangle, Scale, Plus, ShieldCheck, Coins, Save } from "lucide-react";
import { RowLockControls } from "@/components/admin/RowLockControls";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type AplicaA = "Docente" | "Staff" | "Ambos";
type Multa = { id: string; nome: string; valor: number; descricao: string; aplicaA: AplicaA };

const MULTAS_KEY = "upra.rh.multas.v1";

const loadMultas = (): Multa[] => {
  try {
    const raw = localStorage.getItem(MULTAS_KEY);
    if (raw) return JSON.parse(raw) as Multa[];
  } catch { /* */ }
  return [
    { id: "1", nome: "Atraso superior a 15min", valor: 3000, descricao: "Atraso recorrente", aplicaA: "Ambos" },
    { id: "2", nome: "Falta injustificada", valor: 6000, descricao: "Ausência sem justificação aceite", aplicaA: "Ambos" },
    { id: "3", nome: "Atraso na entrega de relatório", valor: 4000, descricao: "Relatório entregue após o prazo", aplicaA: "Docente" },
    { id: "4", nome: "Incumprimento de SLA", valor: 5000, descricao: "Tratamento de solicitação fora do prazo", aplicaA: "Staff" },
  ];
};

export default function OnboardingRegrasPresenca() {
  const { user } = useAuth();

  // Assiduidade
  const [presencaEnabled, setPresencaEnabled] = useState(true);
  const [docMin, setDocMin] = useState(85);
  const [staffMin, setStaffMin] = useState(85);
  const [tolerancia, setTolerancia] = useState(10);
  const [autoFalta, setAutoFalta] = useState(true);

  // Multas
  const [multasEnabled, setMultasEnabled] = useState(true);
  const [permitirDisputa, setPermitirDisputa] = useState(true);
  const [janelaDisputa, setJanelaDisputa] = useState(72);
  const [multas, setMultas] = useState<Multa[]>(() => loadMultas());
  const [novoNome, setNovoNome] = useState("");
  const [novoValor, setNovoValor] = useState<number>(0);
  const [novoTipo, setNovoTipo] = useState<AplicaA>("Ambos");
  const [editing, setEditing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try { localStorage.setItem(MULTAS_KEY, JSON.stringify(multas)); } catch { /* */ }
  }, [multas]);

  const addMulta = () => {
    if (!novoNome.trim()) return;
    setMultas(prev => [...prev, { id: String(Date.now()), nome: novoNome.trim(), valor: novoValor, descricao: "", aplicaA: novoTipo }]);
    setNovoNome(""); setNovoValor(0); setNovoTipo("Ambos");
  };

  const saveConfig = () => {
    markOnboardingStepDone(user?.email, "rh.pres");
    toast.success("Configuração de RH guardada");
  };

  const totalMultas = multas.length;
  const valorMedio = totalMultas ? Math.round(multas.reduce((s, m) => s + m.valor, 0) / totalMultas) : 0;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <OnboardingStepBanner />

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Conformidade &amp; Multas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Defina regras de assiduidade e o quadro de infrações aplicado a docentes e staff.
          </p>
        </div>
        <Button onClick={saveConfig} className="gap-2 shrink-0">
          <Save className="w-4 h-4" /> Guardar configuração
        </Button>
      </div>

      <Tabs defaultValue="assiduidade" className="space-y-5">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="assiduidade" className="gap-2">
            <ShieldCheck className="w-4 h-4" /> Assiduidade
          </TabsTrigger>
          <TabsTrigger value="multas" className="gap-2">
            <Coins className="w-4 h-4" /> Multas
          </TabsTrigger>
        </TabsList>

        {/* ASSIDUIDADE */}
        <TabsContent value="assiduidade" className="space-y-5 mt-0">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Módulo de Assiduidade</h2>
                  <p className="text-xs text-muted-foreground">Activar regras de presença e tolerância para o pessoal.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={presencaEnabled ? "default" : "secondary"}>{presencaEnabled ? "Activo" : "Desactivado"}</Badge>
                <Switch checked={presencaEnabled} onCheckedChange={setPresencaEnabled} />
              </div>
            </div>
          </Card>

          <div className={`grid md:grid-cols-2 gap-5 ${presencaEnabled ? "" : "opacity-50 pointer-events-none"}`}>
            <Card className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Percent className="w-3.5 h-3.5" />
                <p className="text-[11px] uppercase tracking-wide font-medium">Limites mínimos de presença</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Docentes (%)</Label>
                  <Input type="number" min={0} max={100} value={docMin} onChange={e => setDocMin(Number(e.target.value))} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Staff (%)</Label>
                  <Input type="number" min={0} max={100} value={staffMin} onChange={e => setStaffMin(Number(e.target.value))} className="h-9" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">Abaixo destes valores o colaborador é sinalizado em risco.</p>
            </Card>

            <Card className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <p className="text-[11px] uppercase tracking-wide font-medium">Tolerância e marcação</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tolerância de chegada (minutos)</Label>
                <Input type="number" min={0} max={60} value={tolerancia} onChange={e => setTolerancia(Number(e.target.value))} className="h-9" />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Marcar falta automaticamente</p>
                  <p className="text-xs text-muted-foreground">Após o expediente, presenças não registadas viram falta.</p>
                </div>
                <Switch checked={autoFalta} onCheckedChange={setAutoFalta} />
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* MULTAS */}
        <TabsContent value="multas" className="space-y-5 mt-0">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Sistema de Multas</h2>
                  <p className="text-xs text-muted-foreground">Quadro de infrações aplicável a docentes e staff.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={multasEnabled ? "default" : "secondary"}>{multasEnabled ? "Activo" : "Desactivado"}</Badge>
                <Switch checked={multasEnabled} onCheckedChange={setMultasEnabled} />
              </div>
            </div>
          </Card>

          <div className={`space-y-5 ${multasEnabled ? "" : "opacity-50 pointer-events-none"}`}>
            {/* KPI strip */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Infrações</p>
                <p className="text-xl font-semibold tabular-nums mt-1">{totalMultas}</p>
              </Card>
              <Card className="p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Valor médio</p>
                <p className="text-xl font-semibold tabular-nums mt-1">{valorMedio.toLocaleString("pt-PT")} Kz</p>
              </Card>
              <Card className="p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Disputas</p>
                <p className="text-xl font-semibold mt-1">{permitirDisputa ? `${janelaDisputa}h` : "Off"}</p>
              </Card>
            </div>

            {/* Disputas */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Scale className="w-3.5 h-3.5" />
                <p className="text-[11px] uppercase tracking-wide font-medium">Disputa de multas</p>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">Permitir disputa</p>
                    <p className="text-xs text-muted-foreground">Activa o fluxo de contestação de multas.</p>
                  </div>
                  <Switch checked={permitirDisputa} onCheckedChange={setPermitirDisputa} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Janela para disputar (horas)</Label>
                  <Input type="number" min={0} max={336} value={janelaDisputa} onChange={e => setJanelaDisputa(Number(e.target.value))} className="h-9" disabled={!permitirDisputa} />
                </div>
              </div>
            </Card>

            {/* Tabela de Multas */}
            <Card className="overflow-hidden">
              {/* Table header */}
              <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <p className="text-[11px] uppercase tracking-wide font-medium">Tabela de infrações</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{totalMultas} {totalMultas === 1 ? "registo" : "registos"}</Badge>
              </div>

              <div className="grid grid-cols-[1fr_120px_120px_220px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
                <span>Infração</span>
                <span>Aplica a</span>
                <span className="text-right">Valor</span>
                <span className="text-right">Ações</span>
              </div>

              <div className="divide-y">
                {multas.map(m => {
                  const isEdit = !!editing[m.id];
                  return (
                  <div key={m.id} className="grid grid-cols-[1fr_120px_120px_220px] items-center gap-2 px-4 py-2.5 hover:bg-muted/40 transition-colors">
                    <span className="text-sm font-medium truncate">{m.nome}</span>
                    <Badge variant="outline" className="text-[10px] w-fit">{m.aplicaA}</Badge>
                    <span className="text-sm tabular-nums text-right">{m.valor.toLocaleString("pt-PT")} Kz</span>
                    <RowLockControls
                      editing={isEdit}
                      onEdit={() => setEditing(p => ({ ...p, [m.id]: true }))}
                      onConfirm={() => setEditing(p => ({ ...p, [m.id]: false }))}
                      onDelete={() => setMultas(prev => prev.filter(x => x.id !== m.id))}
                    />
                  </div>
                  );
                })}
                {multas.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-6">
                    Sem infrações configuradas.
                  </div>
                )}
              </div>

              {/* Add row */}
              <div className="px-4 py-3 border-t bg-muted/20">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Adicionar infração</p>
                <div className="grid grid-cols-[1fr_120px_120px_auto] gap-2">
                  <Input placeholder="Ex: Atraso prolongado" value={novoNome} onChange={e => setNovoNome(e.target.value)} className="h-9" />
                  <Input type="number" min={0} step={500} placeholder="Valor (Kz)" value={novoValor || ""} onChange={e => setNovoValor(Number(e.target.value))} className="h-9" />
                  <select value={novoTipo} onChange={e => setNovoTipo(e.target.value as AplicaA)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                    <option value="Docente">Docente</option>
                    <option value="Staff">Staff</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                  <Button onClick={addMulta} className="h-9 gap-1"><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

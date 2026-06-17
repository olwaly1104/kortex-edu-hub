import { useEffect, useState } from "react";
import { OnboardingStepBanner, markOnboardingStepDone } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Clock, Percent, AlertTriangle, Scale, Plus, Trash2, ShieldCheck, Coins, Check } from "lucide-react";
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
  // Master toggles separating the two domains
  const [presencaEnabled, setPresencaEnabled] = useState(true);
  const [multasEnabled, setMultasEnabled] = useState(true);

  // Presença
  const [docMin, setDocMin] = useState(85);
  const [staffMin, setStaffMin] = useState(85);
  const [tolerancia, setTolerancia] = useState(10);
  const [autoFalta, setAutoFalta] = useState(true);

  // Multas
  const [permitirDisputa, setPermitirDisputa] = useState(true);
  const [janelaDisputa, setJanelaDisputa] = useState(72);
  const [multas, setMultas] = useState<Multa[]>(() => loadMultas());
  const [novoNome, setNovoNome] = useState("");
  const [novoValor, setNovoValor] = useState<number>(0);
  const [novoTipo, setNovoTipo] = useState<AplicaA>("Ambos");

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

  const dim = (active: boolean) => active ? "" : "opacity-50 pointer-events-none";

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <OnboardingStepBanner />

      {/* Master toggles */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Conformidade &amp; Multas</h2>
            <p className="text-xs text-muted-foreground">Activar ou desactivar módulos de assiduidade e sistema de multas.</p>
          </div>
          <div className="inline-flex items-center gap-1 p-1 rounded-lg border bg-muted/30">
            <button
              type="button"
              onClick={() => setPresencaEnabled((v) => !v)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                presencaEnabled
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Assiduidade
              {presencaEnabled && <Check className="w-3 h-3 text-primary" />}
            </button>
            <button
              type="button"
              onClick={() => setMultasEnabled((v) => !v)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                multasEnabled
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              Multas
              {multasEnabled && <Check className="w-3 h-3 text-primary" />}
            </button>
          </div>
        </div>
      </Card>

      {/* SECTION 1 — Assiduidade */}
      <Card className="p-5 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
            <div>
              <h2 className="text-base font-semibold">Assiduidade</h2>
              <p className="text-xs text-muted-foreground">Limites mínimos, tolerância de chegada e marcação automática de faltas.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={presencaEnabled ? "default" : "secondary"}>{presencaEnabled ? "Activo" : "Desactivado"}</Badge>
          </div>
        </div>

        <div className={`grid md:grid-cols-2 gap-4 ${dim(presencaEnabled)}`}>
          <div className="space-y-3 rounded-md border p-4">
            <div className="flex items-center gap-2 text-muted-foreground"><Percent className="w-3.5 h-3.5" /><p className="text-[11px] uppercase tracking-wide">Limites mínimos (%)</p></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Docentes</Label>
                <Input type="number" min={0} max={100} value={docMin} onChange={e => setDocMin(Number(e.target.value))} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Staff</Label>
                <Input type="number" min={0} max={100} value={staffMin} onChange={e => setStaffMin(Number(e.target.value))} className="h-9" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">Abaixo destes valores o sistema marca em risco.</p>
          </div>

          <div className="space-y-3 rounded-md border p-4">
            <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-3.5 h-3.5" /><p className="text-[11px] uppercase tracking-wide">Tolerância e marcação</p></div>
            <div className="space-y-1">
              <Label className="text-xs">Tolerância de chegada (minutos)</Label>
              <Input type="number" min={0} max={60} value={tolerancia} onChange={e => setTolerancia(Number(e.target.value))} className="h-9" />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Marcar falta automaticamente</p>
                <p className="text-xs text-muted-foreground">Após o expediente, presenças não registadas viram falta.</p>
              </div>
              <Switch checked={autoFalta} onCheckedChange={setAutoFalta} />
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 2 — Sistema de Multas */}
      <Card className="p-5 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Coins className="w-5 h-5" /></div>
            <div>
              <h2 className="text-base font-semibold">Sistema de Multas</h2>
              <p className="text-xs text-muted-foreground">Infrações aplicáveis a docentes e staff, com fluxo de disputa opcional.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={multasEnabled ? "default" : "secondary"}>{multasEnabled ? "Activo" : "Desactivado"}</Badge>
          </div>
        </div>

        <div className={`space-y-4 ${dim(multasEnabled)}`}>
          {/* Disputas */}
          <div className="grid md:grid-cols-2 gap-3 rounded-md border p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Permitir disputa</p>
                  <p className="text-xs text-muted-foreground">Activa o fluxo de contestação de multas.</p>
                </div>
              </div>
              <Switch checked={permitirDisputa} onCheckedChange={setPermitirDisputa} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Janela para disputar (horas)</Label>
              <Input type="number" min={0} max={336} value={janelaDisputa} onChange={e => setJanelaDisputa(Number(e.target.value))} className="h-9" disabled={!permitirDisputa} />
            </div>
          </div>

          {/* Tabela de Multas */}
          <div className="space-y-2 rounded-md border p-4">
            <div className="flex items-center gap-2 text-muted-foreground"><AlertTriangle className="w-3.5 h-3.5" /><p className="text-[11px] uppercase tracking-wide">Tabela de infrações</p></div>
            <div className="space-y-1.5">
              {multas.map(m => (
                <div key={m.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border bg-card">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">{m.nome}</span>
                    <Badge variant="outline" className="text-[10px]">{m.aplicaA}</Badge>
                    <Badge variant="outline" className="text-[10px] tabular-nums">{m.valor.toLocaleString("pt-PT")} Kz</Badge>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => setMultas(prev => prev.filter(x => x.id !== m.id))} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              <div className="grid grid-cols-[1fr_110px_110px_auto] gap-2 pt-1">
                <Input placeholder="Nova multa (ex: Atraso prolongado)" value={novoNome} onChange={e => setNovoNome(e.target.value)} className="h-9" />
                <Input type="number" min={0} step={500} placeholder="Valor (Kz)" value={novoValor || ""} onChange={e => setNovoValor(Number(e.target.value))} className="h-9" />
                <select value={novoTipo} onChange={e => setNovoTipo(e.target.value as AplicaA)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                  <option value="Docente">Docente</option>
                  <option value="Staff">Staff</option>
                  <option value="Ambos">Ambos</option>
                </select>
                <Button onClick={addMulta} className="h-9 gap-1"><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveConfig} className="gap-2">Guardar configuração</Button>
      </div>
    </div>
  );
}

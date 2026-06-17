import { useEffect, useState } from "react";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Clock, Percent, AlertTriangle, Scale, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  const [docMin, setDocMin] = useState(85);
  const [staffMin, setStaffMin] = useState(85);
  const [tolerancia, setTolerancia] = useState(10);
  const [autoFalta, setAutoFalta] = useState(true);
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

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <OnboardingStepBanner />

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Percent className="w-4 h-4" /></div>
            <div>
              <h2 className="text-sm font-semibold">Limites mínimos de presença</h2>
              <p className="text-xs text-muted-foreground">Aplicável a docentes e staff. Abaixo destes valores o sistema marca em risco.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Docentes (%)</Label>
              <Input type="number" min={0} max={100} value={docMin} onChange={e => setDocMin(Number(e.target.value))} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Staff (%)</Label>
              <Input type="number" min={0} max={100} value={staffMin} onChange={e => setStaffMin(Number(e.target.value))} className="h-9" />
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Clock className="w-4 h-4" /></div>
            <div>
              <h2 className="text-sm font-semibold">Tolerância e marcação</h2>
              <p className="text-xs text-muted-foreground">Margem para chegadas e marcação automática.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Tolerância (minutos)</Label>
              <Input type="number" min={0} max={60} value={tolerancia} onChange={e => setTolerancia(Number(e.target.value))} className="h-9" />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Marcar falta automaticamente</p>
                <p className="text-xs text-muted-foreground">Após o fim do expediente, presenças não registadas viram falta.</p>
              </div>
              <Switch checked={autoFalta} onCheckedChange={setAutoFalta} />
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Scale className="w-4 h-4" /></div>
            <div>
              <h2 className="text-sm font-semibold">Disputar multas</h2>
              <p className="text-xs text-muted-foreground">Como docentes e staff contestam multas aplicadas.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Permitir disputa</p>
                <p className="text-xs text-muted-foreground">Activa o fluxo de contestação de multas.</p>
              </div>
              <Switch checked={permitirDisputa} onCheckedChange={setPermitirDisputa} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Janela para disputar (horas após aplicação)</Label>
              <Input type="number" min={0} max={336} value={janelaDisputa} onChange={e => setJanelaDisputa(Number(e.target.value))} className="h-9" disabled={!permitirDisputa} />
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><AlertTriangle className="w-4 h-4" /></div>
            <div>
              <h2 className="text-sm font-semibold">Tabela de multas</h2>
              <p className="text-xs text-muted-foreground">Infrações aplicáveis a docentes e staff. Finanças visualiza esta tabela em modo só-leitura.</p>
            </div>
          </div>
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
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Regras de RH guardadas")} className="gap-2">Guardar regras</Button>
      </div>
    </div>
  );
}

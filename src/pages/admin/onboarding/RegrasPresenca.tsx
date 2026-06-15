import { useState } from "react";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Clock, Percent, AlertTriangle, FileCheck2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingRegrasPresenca() {
  const [docMin, setDocMin] = useState(85);
  const [stuMin, setStuMin] = useState(80);
  const [tolerancia, setTolerancia] = useState(10);
  const [autoFalta, setAutoFalta] = useState(true);
  const [permitirJust, setPermitirJust] = useState(true);
  const [janelaJust, setJanelaJust] = useState(72);

  const [tipos, setTipos] = useState<{ id: string; nome: string; documento: boolean }[]>([
    { id: "1", nome: "Doença",            documento: true },
    { id: "2", nome: "Luto familiar",     documento: true },
    { id: "3", nome: "Convocação oficial", documento: true },
    { id: "4", nome: "Outra",             documento: false },
  ]);
  const [novoTipo, setNovoTipo] = useState("");

  const addTipo = () => {
    if (!novoTipo.trim()) return;
    setTipos(prev => [...prev, { id: String(Date.now()), nome: novoTipo.trim(), documento: true }]);
    setNovoTipo("");
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
              <p className="text-xs text-muted-foreground">Abaixo destes valores o sistema marca em risco.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Docentes (%)</Label>
              <Input type="number" min={0} max={100} value={docMin} onChange={e => setDocMin(Number(e.target.value))} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Estudantes (%)</Label>
              <Input type="number" min={0} max={100} value={stuMin} onChange={e => setStuMin(Number(e.target.value))} className="h-9" />
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
                <p className="text-xs text-muted-foreground">Após o fim da aula, presenças não registadas viram falta.</p>
              </div>
              <Switch checked={autoFalta} onCheckedChange={setAutoFalta} />
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><FileCheck2 className="w-4 h-4" /></div>
            <div>
              <h2 className="text-sm font-semibold">Justificação de faltas</h2>
              <p className="text-xs text-muted-foreground">Como o estudante/docente justifica.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Permitir justificação</p>
                <p className="text-xs text-muted-foreground">Activa o fluxo de submissão de justificações.</p>
              </div>
              <Switch checked={permitirJust} onCheckedChange={setPermitirJust} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Janela para submeter (horas após a falta)</Label>
              <Input type="number" min={0} max={336} value={janelaJust} onChange={e => setJanelaJust(Number(e.target.value))} className="h-9" disabled={!permitirJust} />
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><AlertTriangle className="w-4 h-4" /></div>
            <div>
              <h2 className="text-sm font-semibold">Tipos de falta justificada</h2>
              <p className="text-xs text-muted-foreground">Categorias aceites no fluxo de justificação.</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {tipos.map(t => (
              <div key={t.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border bg-card">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium truncate">{t.nome}</span>
                  {t.documento && <Badge variant="outline" className="text-[10px]">Documento</Badge>}
                </div>
                <Button size="icon" variant="ghost" onClick={() => setTipos(prev => prev.filter(x => x.id !== t.id))} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1">
              <Input placeholder="Novo tipo (ex: Estágio)" value={novoTipo} onChange={e => setNovoTipo(e.target.value)} className="h-9" />
              <Button onClick={addTipo} className="h-9 gap-1"><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Regras de presença guardadas")} className="gap-2">Guardar regras</Button>
      </div>
    </div>
  );
}

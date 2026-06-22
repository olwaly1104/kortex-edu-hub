import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Award, Save, RotateCcw, GraduationCap } from "lucide-react";

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

const STORAGE_KEY = "academica.criterioAcademico";

export default function CriterioAcademico() {
  const [estados, setEstados] = useState<Estado[]>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Estado[];
        if (Array.isArray(parsed) && parsed.length) setEstados(parsed);
      }
    } catch {}
  }, []);

  const update = (i: number, k: "min" | "max", v: number) => {
    setEstados((p) => p.map((e, idx) => (idx === i ? { ...e, [k]: v } : e)));
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estados));
    toast.success("Critério académico guardado");
  };

  const reset = () => {
    setEstados(DEFAULTS);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Critério restaurado para os valores padrão");
  };

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 mb-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Estados Académicos</h2>
              <p className="text-xs text-muted-foreground">
                Categorias atribuídas automaticamente a cada discente com base na sua média geral (escala 0–20).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={reset} className="gap-1.5 text-xs h-8">
              <RotateCcw className="w-3.5 h-3.5" /> Restaurar
            </Button>
            <Button size="sm" onClick={save} className="gap-1.5 text-xs h-8">
              <Save className="w-3.5 h-3.5" /> Guardar
            </Button>
          </div>
        </div>
      </Card>

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
              <div>
                <Label className="sr-only">Mín</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  max={20}
                  value={e.min}
                  onChange={(ev) => update(i, "min", Number(ev.target.value))}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="sr-only">Máx</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  max={20}
                  value={e.max}
                  onChange={(ev) => update(i, "max", Number(ev.target.value))}
                  className="h-8 text-xs"
                />
              </div>
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

      <p className="text-[11px] text-muted-foreground px-1">
        O estado é calculado em tempo real a partir da média geral do discente. Define os intervalos
        e clica em <strong>Guardar</strong> para aplicar a toda a instituição.
      </p>
    </div>
  );
}

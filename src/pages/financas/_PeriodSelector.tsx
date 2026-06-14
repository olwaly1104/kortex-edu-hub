import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type Periodo = "mes" | "semestre" | "ano";

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
export const SEMESTRES = ["1º Semestre", "2º Semestre"];
export const ANOS = ["2022 / 2023", "2023 / 2024", "2024 / 2025"];

export const PERIODO_MULT: Record<Periodo, number> = { mes: 1, semestre: 6, ano: 12 };

export const periodoDefaultValue = (p: Periodo) =>
  p === "mes" ? "Junho" : p === "semestre" ? "2º Semestre" : "2024 / 2025";

interface Props {
  periodo: Periodo;
  setPeriodo: (p: Periodo) => void;
  value: string;
  setValue: (v: string) => void;
}

export function PeriodSelector({ periodo, setPeriodo, value, setValue }: Props) {
  const options = periodo === "mes" ? MESES : periodo === "semestre" ? SEMESTRES : ANOS;
  const label = periodo === "mes" ? "Mês" : periodo === "semestre" ? "Semestre" : "Ano Letivo";
  const suffix = periodo === "mes" ? " 2025" : periodo === "semestre" ? " · 2024 / 2025" : "";

  const handlePeriodo = (p: Periodo) => {
    setPeriodo(p);
    setValue(periodoDefaultValue(p));
  };

  return (
    <div className="space-y-2">
      <div className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/30 p-0.5">
        {(["mes", "semestre", "ano"] as Periodo[]).map(p => (
          <Button
            key={p}
            size="sm"
            variant={periodo === p ? "default" : "ghost"}
            onClick={() => handlePeriodo(p)}
            className="text-xs h-7 px-3"
          >
            {p === "mes" ? "Mês" : p === "semestre" ? "Semestre" : "Ano"}
          </Button>
        ))}
      </div>

      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </p>
          <p className="text-lg font-bold text-foreground leading-tight capitalize">
            {value}{suffix}
          </p>
        </div>
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="w-[200px] h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map(o => (
              <SelectItem key={o} value={o}>{o}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * TabelaInfracoes — read-only view of the infractions table configured in
 * Admin → Conformidade & Multas. Reads from the same localStorage key
 * (`upra.rh.multas.v1`). Used inside "Meu Perfil → Finanças/GAP" sections
 * to replace the old "Tabela de Multas (PDF)" download button.
 *
 * Intentionally omits the "Aplica a" column for end-user surfaces.
 */

type AplicaA = "Docente" | "Staff" | "Ambos";
type Multa = { id: string; nome: string; valor: number; descricao?: string; aplicaA?: AplicaA };
const MULTAS_KEY = "upra.rh.multas.v1";

const FALLBACK: Multa[] = [
  { id: "1", nome: "Atraso superior a 15min", valor: 3000 },
  { id: "2", nome: "Falta injustificada", valor: 6000 },
  { id: "3", nome: "Atraso na entrega de relatório", valor: 4000 },
  { id: "4", nome: "Incumprimento de SLA", valor: 5000 },
];

function loadMultas(): Multa[] {
  try {
    const raw = localStorage.getItem(MULTAS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Multa[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch { /* ignore */ }
  return FALLBACK;
}

export function TabelaInfracoes({
  title = "Tabela de Infrações",
  description = "Quadro oficial de infrações e respectivos valores.",
}: { title?: string; description?: string }) {
  const [multas, setMultas] = useState<Multa[]>(() => loadMultas());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === MULTAS_KEY) setMultas(loadMultas());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              {title}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0">
            {multas.length} {multas.length === 1 ? "registo" : "registos"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-[1fr_140px] gap-2 px-5 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-y">
          <span>Infração</span>
          <span className="text-right">Valor</span>
        </div>
        <div className="divide-y">
          {multas.map((m) => (
            <div key={m.id} className="grid grid-cols-[1fr_140px] gap-2 px-5 py-2.5 items-center text-sm">
              <span className="font-medium truncate">{m.nome}</span>
              <span className="tabular-nums text-right">{m.valor.toLocaleString("pt-PT")} Kz</span>
            </div>
          ))}
          {multas.length === 0 && (
            <p className="px-5 py-6 text-xs text-muted-foreground italic text-center">
              Sem infrações configuradas.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

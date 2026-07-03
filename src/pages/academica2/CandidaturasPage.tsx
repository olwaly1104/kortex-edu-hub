import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileSignature, Settings2 } from "lucide-react";
import CandidaturasEtapasConfig from "@/components/academica/CandidaturasEtapasConfig";

const CFG_KEY = "upra:candidaturas-cfg";

type Cfg = {
  inicio: string;
  fim: string;
  vagas: number | "";
  taxa: number | "";
  notaMinima: number | "";
};

const DEFAULT_CFG: Cfg = { inicio: "", fim: "", vagas: "", taxa: "", notaMinima: "" };

function loadCfg(): Cfg {
  if (typeof window === "undefined") return DEFAULT_CFG;
  try {
    const raw = localStorage.getItem(CFG_KEY);
    if (!raw) return DEFAULT_CFG;
    const c = JSON.parse(raw);
    return {
      inicio: c.inicio ?? "",
      fim: c.fim ?? "",
      vagas: typeof c.vagas === "number" ? c.vagas : "",
      taxa: typeof c.taxa === "number" ? c.taxa : "",
      notaMinima: typeof c.notaMinima === "number" ? c.notaMinima : "",
    };
  } catch {
    return DEFAULT_CFG;
  }
}

export default function CandidaturasPage({ readOnly = false }: { readOnly?: boolean }) {
  const [cfg, setCfg] = useState<Cfg>(() => loadCfg());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === CFG_KEY) setCfg(loadCfg()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = (patch: Partial<Cfg>) => {
    if (readOnly) return;
    const next = { ...cfg, ...patch };
    setCfg(next);
    try { localStorage.setItem(CFG_KEY, JSON.stringify(next)); } catch {}
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileSignature className="w-6 h-6 text-primary" /> Candidaturas
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Configuração completa do processo de candidatura: janela, vagas, estados, etapas e sessões agendadas.
          {readOnly && <span className="ml-1 uppercase tracking-wider text-[10px] text-muted-foreground">· apenas leitura</span>}
        </p>
      </div>

      {/* Parâmetros gerais */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b bg-muted/30 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold">Parâmetros gerais</p>
          {readOnly && <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">Apenas leitura</span>}
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Início das candidaturas</label>
            <Input type="date" value={cfg.inicio} disabled={readOnly} readOnly={readOnly}
              onChange={e => update({ inicio: e.target.value })} className="h-9" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Fim das candidaturas</label>
            <Input type="date" value={cfg.fim} disabled={readOnly} readOnly={readOnly}
              onChange={e => update({ fim: e.target.value })} className="h-9" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Nota mínima de aprovação</label>
            <Input type="number" min={0} max={20} step={0.1} value={cfg.notaMinima} disabled={readOnly} readOnly={readOnly}
              onChange={e => update({ notaMinima: e.target.value === "" ? "" : Number(e.target.value) })} className="h-9" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Taxa de candidatura (Kz)</label>
            <Input type="number" min={0} value={cfg.taxa} disabled={readOnly} readOnly={readOnly}
              onChange={e => update({ taxa: e.target.value === "" ? "" : Number(e.target.value) })} className="h-9" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Vagas totais</label>
            <Input type="number" min={0} value={cfg.vagas} disabled={readOnly} readOnly={readOnly}
              onChange={e => update({ vagas: e.target.value === "" ? "" : Number(e.target.value) })} className="h-9" />
          </div>
        </div>
      </Card>

      {/* Estados + Etapas + Sessões (shared, wired to real DB) */}
      <Card className="p-5">
        <CandidaturasEtapasConfig readOnly={readOnly} />
      </Card>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, GraduationCap, Briefcase, ClipboardCheck, Plus, Trash2 } from "lucide-react";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import OnboardingPessoas from "./Pessoas";

type Departamento = { id: string; sigla: string; designacao: string; responsavel?: string };
const DEPT_KEY = "upra_admin_departamentos_v1";

function DepartamentosPanel() {
  const [rows, setRows] = useState<Departamento[]>(() => {
    try { return JSON.parse(localStorage.getItem(DEPT_KEY) || "[]"); } catch { return []; }
  });
  const [sigla, setSigla] = useState("");
  const [designacao, setDesignacao] = useState("");
  const [responsavel, setResponsavel] = useState("");

  useEffect(() => { localStorage.setItem(DEPT_KEY, JSON.stringify(rows)); }, [rows]);

  const canSave = sigla.trim().length > 0 && designacao.trim().length > 0;

  const reset = () => { setSigla(""); setDesignacao(""); setResponsavel(""); };

  const onSave = () => {
    if (!canSave) return;
    const d: Departamento = {
      id: crypto.randomUUID(),
      sigla: sigla.toUpperCase().trim(),
      designacao: designacao.trim(),
      responsavel: responsavel.trim() || undefined,
    };
    setRows((prev) => [...prev, d]);
    reset();
  };

  const remove = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const gridCols = "grid-cols-[40px_0.8fr_2fr_1.4fr_48px]";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold leading-tight">Departamentos</h1>
          <p className="text-xs text-muted-foreground">Registo institucional dos departamentos da universidade.</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <Card className="p-10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold">Nenhum departamento registado</p>
            <p className="text-xs text-muted-foreground mt-0.5">Adicione departamentos para os atribuir a docentes e staff.</p>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className={`grid ${gridCols} gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b`}>
            <span></span><span>Sigla</span><span>Designação</span><span>Responsável</span><span></span>
          </div>
          <div className="divide-y">
            {rows.map((r) => (
              <div key={r.id} className={`grid ${gridCols} gap-2 px-4 py-2.5 items-center`}>
                <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-semibold">{r.sigla}</span>
                <span className="text-xs truncate">{r.designacao}</span>
                <span className="text-xs text-muted-foreground truncate">{r.responsavel || <span className="italic">—</span>}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => remove(r.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Inline add row */}
      <Card className="overflow-hidden">
        <div className={`grid ${gridCols} gap-2 px-4 py-3 items-center bg-muted/20`}>
          <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <Input
            value={sigla}
            onChange={(e) => setSigla(e.target.value.toUpperCase())}
            placeholder="Sigla"
            maxLength={8}
            className="h-9 text-xs"
          />
          <Input
            value={designacao}
            onChange={(e) => setDesignacao(e.target.value)}
            placeholder="Designação"
            className="h-9 text-xs"
          />
          <Input
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            placeholder="Responsável (opcional)"
            className="h-9 text-xs"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={onSave} disabled={!canSave} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}


export default function OnboardingRH() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as "departamentos" | "docentes" | "staff" | "conformidade") || "departamentos";

  const onChange = (v: string) => {
    const next = new URLSearchParams(params);
    next.set("tab", v);
    next.set("step", v === "departamentos" ? "rh.dep" : v === "docentes" ? "rh.doc" : v === "staff" ? "rh.staff" : "rh.conf");
    setParams(next, { replace: true });
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-4">
      <OnboardingStepBanner />
      <Tabs value={tab} onValueChange={onChange}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="departamentos" className="gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Departamentos
          </TabsTrigger>
          <TabsTrigger value="docentes" className="gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" /> Docentes
          </TabsTrigger>
          <TabsTrigger value="staff" className="gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Staff
          </TabsTrigger>
          <TabsTrigger value="conformidade" className="gap-1.5">
            <ClipboardCheck className="w-3.5 h-3.5" /> Conformidade e Multas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="departamentos" className="mt-4">
          <DepartamentosPanel />
        </TabsContent>
        <TabsContent value="docentes" className="mt-4">
          <OnboardingPessoas mode="docentes" />
        </TabsContent>
        <TabsContent value="staff" className="mt-4">
          <OnboardingPessoas mode="staff" />
        </TabsContent>
        <TabsContent value="conformidade" className="mt-4">
          <div className="p-6 text-center text-muted-foreground text-sm">
            Módulo de conformidade e multas em desenvolvimento.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

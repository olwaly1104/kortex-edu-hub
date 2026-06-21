import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, GraduationCap, Briefcase, ClipboardCheck, Plus, Trash2 } from "lucide-react";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import OnboardingPessoas from "./Pessoas";
import OnboardingRegrasPresenca from "./RegrasPresenca";

type Departamento = { id: string; sigla: string; designacao: string; responsavel?: string };
const DEPT_KEY = "upra_admin_departamentos_v1";

function DepartamentosPanel() {
  const [rows, setRows] = useState<Departamento[]>(() => {
    try { return JSON.parse(localStorage.getItem(DEPT_KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(DEPT_KEY, JSON.stringify(rows)); }, [rows]);

  const addDept = () => {
    const d: Departamento = {
      id: crypto.randomUUID(),
      sigla: "",
      designacao: "",
      responsavel: undefined,
    };
    setRows((prev) => [...prev, d]);
  };

  const upd = (id: string, patch: Partial<Departamento>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const remove = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const gridCols = "grid-cols-[100px_1.4fr_1.4fr_64px]";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 pb-1">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">Departamentos</h1>
          <p className="text-xs text-muted-foreground">Registe os departamentos institucionais da universidade.</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className={`grid ${gridCols} gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b`}>
          <span>Sigla</span><span>Designação</span><span>Responsável</span><span></span>
        </div>
        <div className="divide-y">
          {rows.map((r) => (
            <div key={r.id} className={`grid ${gridCols} gap-2 px-4 py-2 items-center`}>
              <Input
                value={r.sigla}
                onChange={(ev) => upd(r.id, { sigla: ev.target.value.toUpperCase() })}
                placeholder="Sigla"
                maxLength={8}
                className="h-8 text-xs font-mono font-semibold"
              />
              <Input
                value={r.designacao}
                onChange={(ev) => upd(r.id, { designacao: ev.target.value })}
                placeholder="Designação"
                className="h-8 text-xs"
              />
              <Input
                value={r.responsavel || ""}
                onChange={(ev) => upd(r.id, { responsavel: ev.target.value.trim() || undefined })}
                placeholder="Responsável"
                className="h-8 text-xs"
              />
              <div className="flex justify-end">
                <Button size="icon" variant="ghost" onClick={() => remove(r.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="px-4 py-8 text-xs text-muted-foreground italic text-center">Sem departamentos registados.</p>
          )}
        </div>
        <div className="border-t bg-muted/10 px-4 py-2.5">
          <Button variant="ghost" size="sm" onClick={addDept} className="h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/5">
            <Plus className="w-3.5 h-3.5" /> Adicionar departamento
          </Button>
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

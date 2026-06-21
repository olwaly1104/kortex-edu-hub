import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, GraduationCap, Briefcase, ClipboardCheck, Plus, Trash2, Pencil, Check, X } from "lucide-react";
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
  const [draft, setDraft] = useState<Departamento>({ id: "", sigla: "", designacao: "", responsavel: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(DEPT_KEY, JSON.stringify(rows)); }, [rows]);

  const canAdd = draft.sigla.trim().length > 0 && draft.designacao.trim().length > 0;

  const add = () => {
    if (!canAdd) return;
    setRows(prev => [...prev, { ...draft, id: crypto.randomUUID(), sigla: draft.sigla.toUpperCase().trim(), designacao: draft.designacao.trim() }]);
    setDraft({ id: "", sigla: "", designacao: "", responsavel: "" });
  };
  const remove = (id: string) => setRows(prev => prev.filter(r => r.id !== id));
  const update = (id: string, patch: Partial<Departamento>) => setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Dados</h3>
          <span className="ml-auto text-xs text-muted-foreground">{rows.length} departamento{rows.length === 1 ? "" : "s"}</span>
        </div>
        <div className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-2">
            <label className="text-[11px] text-muted-foreground">Sigla</label>
            <Input value={draft.sigla} onChange={e => setDraft({ ...draft, sigla: e.target.value.toUpperCase() })} placeholder="DAF" maxLength={8} className="h-9" />
          </div>
          <div className="col-span-5">
            <label className="text-[11px] text-muted-foreground">Designação</label>
            <Input value={draft.designacao} onChange={e => setDraft({ ...draft, designacao: e.target.value })} placeholder="Departamento Administrativo e Financeiro" className="h-9" />
          </div>
          <div className="col-span-3">
            <label className="text-[11px] text-muted-foreground">Responsável</label>
            <Input value={draft.responsavel} onChange={e => setDraft({ ...draft, responsavel: e.target.value })} placeholder="—" className="h-9" />
          </div>
          <div className="col-span-2">
            <Button onClick={add} disabled={!canAdd} className="w-full h-9 gap-1.5"><Plus className="w-4 h-4" />Adicionar</Button>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <div className="text-xs font-medium">Registos <span className="text-muted-foreground">({rows.length})</span></div>
        </div>
        {rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Sem departamentos registados.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/20 text-xs text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2 font-medium w-24">Sigla</th>
                <th className="text-left px-4 py-2 font-medium">Designação</th>
                <th className="text-left px-4 py-2 font-medium w-56">Responsável</th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const editing = editingId === r.id;
                return (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-2">
                      {editing ? (
                        <Input value={r.sigla} onChange={e => update(r.id, { sigla: e.target.value.toUpperCase() })} className="h-8" />
                      ) : <span className="font-mono text-xs font-semibold">{r.sigla}</span>}
                    </td>
                    <td className="px-4 py-2">
                      {editing ? (
                        <Input value={r.designacao} onChange={e => update(r.id, { designacao: e.target.value })} className="h-8" />
                      ) : r.designacao}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {editing ? (
                        <Input value={r.responsavel || ""} onChange={e => update(r.id, { responsavel: e.target.value })} className="h-8" />
                      ) : (r.responsavel || "—")}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <div className="flex gap-1 justify-end">
                        {editing ? (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}><Check className="w-3.5 h-3.5" /></Button>
                        ) : (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingId(r.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => remove(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
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

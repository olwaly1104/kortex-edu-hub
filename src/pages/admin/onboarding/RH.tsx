import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, GraduationCap, Briefcase, ClipboardCheck, Plus, Trash2, Users } from "lucide-react";
import { OnboardingStepBanner, markOnboardingStepDone } from "@/components/admin/OnboardingStepBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import OnboardingPessoas from "./Pessoas";
import OnboardingRegrasPresenca from "./RegrasPresenca";

type Departamento = { id: string; sigla: string; designacao: string; responsavel: string | null; cor: string | null };
type DocenteOpt = { id: string; nome: string; departamento: string | null };

function DepartamentosPanel() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Departamento[]>([]);
  const [docentes, setDocentes] = useState<DocenteOpt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("docentes")
        .select("id, primeiro_nome, ultimo_nome, departamento")
        .order("primeiro_nome", { ascending: true });
      setDocentes(((data || []) as any[]).map((d) => ({
        id: d.id,
        nome: `${d.primeiro_nome || ""} ${d.ultimo_nome || ""}`.trim() || "—",
        departamento: d.departamento || null,
      })));
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any)
        .from("departamentos")
        .select("id, sigla, designacao, responsavel, cor")
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) {
        console.warn("load departamentos:", error.message);
      } else {
        setRows((data || []) as Departamento[]);
        if ((data || []).length > 0) markOnboardingStepDone(user?.email, "rh.dep");
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  const addDept = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const authId = authData?.user?.id;
    if (!authId) { toast.error("Sessão expirada."); return; }
    const placeholderSigla = `D${(rows.length + 1).toString().padStart(2, "0")}`;
    const { data, error } = await (supabase as any)
      .from("departamentos")
      .insert({ owner_user_id: authId, sigla: placeholderSigla, designacao: "Novo departamento", responsavel: null, cor: "#1B3A6B" })
      .select("id, sigla, designacao, responsavel, cor")
      .single();
    if (error) { toast.error(error.message); return; }
    setRows((prev) => [...prev, data as Departamento]);
  };

  const upd = (id: string, patch: Partial<Departamento>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const persist = async (id: string, patch: Partial<Departamento>) => {
    const { error } = await (supabase as any).from("departamentos").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    markOnboardingStepDone(user?.email, "rh.dep");
  };

  const remove = async (id: string) => {
    const prev = rows;
    setRows((p) => p.filter((r) => r.id !== id));
    const { error } = await (supabase as any).from("departamentos").delete().eq("id", id);
    if (error) { toast.error(error.message); setRows(prev); }
  };

  const gridCols = "grid-cols-[100px_1.4fr_1.4fr_64px]";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
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
                onBlur={(ev) => persist(r.id, { sigla: ev.target.value.toUpperCase() })}
                placeholder="Sigla"
                maxLength={8}
                className="h-8 text-xs font-mono font-semibold"
              />
              <Input
                value={r.designacao}
                onChange={(ev) => upd(r.id, { designacao: ev.target.value })}
                onBlur={(ev) => persist(r.id, { designacao: ev.target.value })}
                placeholder="Designação"
                className="h-8 text-xs"
              />
              <Input
                value={r.responsavel || ""}
                onChange={(ev) => upd(r.id, { responsavel: ev.target.value || null })}
                onBlur={(ev) => persist(r.id, { responsavel: ev.target.value.trim() || null })}
                placeholder="Responsável do departamento"
                className="h-8 text-xs"
              />
              <div className="flex justify-end">
                <Button size="icon" variant="ghost" onClick={() => remove(r.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {!loading && rows.length === 0 && (
            <p className="px-4 py-8 text-xs text-muted-foreground italic text-center">Sem departamentos registados.</p>
          )}
          {loading && (
            <p className="px-4 py-8 text-xs text-muted-foreground italic text-center">A carregar…</p>
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
    next.set("step", v === "departamentos" ? "rh.dep" : v === "docentes" ? "rh.doc" : v === "staff" ? "rh.staff" : "rh.pres");
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
          <OnboardingRegrasPresenca />
        </TabsContent>
      </Tabs>
    </div>
  );
}

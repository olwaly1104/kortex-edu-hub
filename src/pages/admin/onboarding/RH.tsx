import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, GraduationCap, Briefcase, ClipboardCheck, Plus, Check, ChevronsUpDown } from "lucide-react";
import { RowLockControls, CardLockBadge } from "@/components/admin/RowLockControls";
import { OnboardingStepBanner, markOnboardingStepDone } from "@/components/admin/OnboardingStepBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import OnboardingPessoas from "./Pessoas";
import OnboardingRegrasPresenca from "./RegrasPresenca";

type Departamento = { id: string; sigla: string; designacao: string; responsavel: string | null; cor: string | null };
type PersonOpt = { id: string; nome: string; tipo: "Docente" | "Staff"; departamento?: string | null };

function DepartamentosPanel() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Departamento[]>([]);
  const [people, setPeople] = useState<PersonOpt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [doc, st] = await Promise.all([
        (supabase as any).from("docentes").select("id, primeiro_nome, ultimo_nome, departamento").order("primeiro_nome", { ascending: true }),
        (supabase as any).from("staff").select("id, primeiro_nome, ultimo_nome").order("primeiro_nome", { ascending: true }),
      ]);
      const docs: PersonOpt[] = ((doc.data || []) as any[]).map((d) => ({
        id: d.id, nome: `${d.primeiro_nome || ""} ${d.ultimo_nome || ""}`.trim() || "—", tipo: "Docente", departamento: d.departamento || null,
      }));
      const staff: PersonOpt[] = ((st.data || []) as any[]).map((d) => ({
        id: d.id, nome: `${d.primeiro_nome || ""} ${d.ultimo_nome || ""}`.trim() || "—", tipo: "Staff",
      }));
      setPeople([...docs, ...staff]);
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
    setEditing((p) => ({ ...p, [(data as any).id]: true }));
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

  const gridCols = "grid-cols-[110px_1.2fr_1.4fr_70px_220px]";
  const [cardEdit, setCardEdit] = useState(false);

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

      <Card className="overflow-hidden relative">
        <CardLockBadge />

        <div className={`grid ${gridCols} gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b`}>
          <span>Sigla</span><span>Designação</span><span>Responsável</span><span className="text-center">Docentes</span><span className="text-right">Ações</span>
        </div>
        <div className="divide-y">
          {rows.map((r) => {
            const selected = people.find((p) => p.nome === r.responsavel);
            const isEdit = !!editing[r.id];
            const docCount = people.filter((p) => p.tipo === "Docente" && (p.departamento || "").trim().toLowerCase() === (r.designacao || "").trim().toLowerCase()).length;
            return (
            <div key={r.id} className={`grid ${gridCols} gap-2 px-4 py-2 items-center`}>
              {isEdit ? (
                <Input
                  value={r.sigla}
                  onChange={(ev) => upd(r.id, { sigla: ev.target.value.toUpperCase() })}
                  onBlur={(ev) => persist(r.id, { sigla: ev.target.value.toUpperCase() })}
                  placeholder="Sigla"
                  maxLength={8}
                  className="h-8 text-xs font-mono font-semibold"
                />
              ) : (
                <span className="text-xs font-mono font-semibold truncate">{r.sigla || "—"}</span>
              )}
              {isEdit ? (
                <Input
                  value={r.designacao}
                  onChange={(ev) => upd(r.id, { designacao: ev.target.value })}
                  onBlur={(ev) => persist(r.id, { designacao: ev.target.value })}
                  placeholder="Designação"
                  className="h-8 text-xs"
                />
              ) : (
                <span className="text-xs truncate">{r.designacao || "—"}</span>
              )}
              {isEdit ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="h-8 text-xs justify-between font-normal">
                      <span className="truncate">{r.responsavel || "Selecionar responsável"}</span>
                      <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[280px]" align="start">
                    <Command>
                      <CommandInput placeholder="Procurar pessoa..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>Sem resultados.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem value="__none__" onSelect={() => { upd(r.id, { responsavel: null }); persist(r.id, { responsavel: null }); }}>
                            <Check className={cn("mr-2 h-3 w-3", !r.responsavel ? "opacity-100" : "opacity-0")} />
                            — Sem responsável —
                          </CommandItem>
                          {people.map((p) => (
                            <CommandItem key={`${p.tipo}-${p.id}`} value={`${p.nome} ${p.tipo}`} onSelect={() => { upd(r.id, { responsavel: p.nome }); persist(r.id, { responsavel: p.nome }); }}>
                              <Check className={cn("mr-2 h-3 w-3", selected?.id === p.id ? "opacity-100" : "opacity-0")} />
                              <span className="flex-1 truncate">{p.nome}</span>
                              <span className="text-[10px] text-muted-foreground ml-2">{p.tipo}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              ) : (
                <span className="text-xs truncate">
                  {r.responsavel || <span className="text-muted-foreground italic">—</span>}
                  {selected && <span className="ml-1 text-[10px] text-muted-foreground">({selected.tipo})</span>}
                </span>
              )}
              <div className="flex justify-center">
                <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-md bg-muted text-[11px] font-semibold tabular-nums">{docCount}</span>
              </div>
              <RowLockControls
                editing={isEdit}
                onEdit={() => setEditing((p) => ({ ...p, [r.id]: true }))}
                onConfirm={() => setEditing((p) => ({ ...p, [r.id]: false }))}
                onDelete={() => remove(r.id)}
              />
            </div>
            );
          })}
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

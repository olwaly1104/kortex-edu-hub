import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, GraduationCap, Briefcase, ClipboardCheck, Plus, Trash2, UserPlus } from "lucide-react";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import OnboardingPessoas from "./Pessoas";

type Departamento = { id: string; sigla: string; designacao: string; responsavel?: string };
const DEPT_KEY = "upra_admin_departamentos_v1";

function DepartamentoFormDialog({
  open, onOpenChange, onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (d: Departamento) => void;
}) {
  const [sigla, setSigla] = useState("");
  const [designacao, setDesignacao] = useState("");
  const [responsavel, setResponsavel] = useState("");

  const canSave = sigla.trim().length > 0 && designacao.trim().length > 0;

  const reset = () => { setSigla(""); setDesignacao(""); setResponsavel(""); };

  const save = () => {
    if (!canSave) return;
    onSave({
      id: crypto.randomUUID(),
      sigla: sigla.toUpperCase().trim(),
      designacao: designacao.trim(),
      responsavel: responsavel.trim() || undefined,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Adicionar Departamento</DialogTitle>
          <DialogDescription>Registe um novo departamento institucional.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-xs">Sigla</Label>
            <Input value={sigla} onChange={(e) => setSigla(e.target.value.toUpperCase())} placeholder="DAF" maxLength={8} className="h-9 mt-1" />
          </div>
          <div>
            <Label className="text-xs">Designação</Label>
            <Input value={designacao} onChange={(e) => setDesignacao(e.target.value)} placeholder="Departamento Administrativo e Financeiro" className="h-9 mt-1" />
          </div>
          <div>
            <Label className="text-xs">Responsável <span className="text-muted-foreground">(opcional)</span></Label>
            <Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="—" className="h-9 mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={!canSave} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DepartamentosPanel() {
  const [rows, setRows] = useState<Departamento[]>(() => {
    try { return JSON.parse(localStorage.getItem(DEPT_KEY) || "[]"); } catch { return []; }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => { localStorage.setItem(DEPT_KEY, JSON.stringify(rows)); }, [rows]);

  const onSave = (d: Departamento) => {
    setRows((prev) => [...prev, d]);
    setOpen(false);
  };
  const remove = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header — matches Docentes/Staff */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold leading-tight">Departamentos</h1>
          <p className="text-xs text-muted-foreground">Registo institucional dos departamentos da universidade.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
          <UserPlus className="w-3.5 h-3.5" /> Adicionar Departamento
        </Button>
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
          <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
            <UserPlus className="w-3.5 h-3.5" /> Adicionar Departamento
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[40px_0.8fr_2fr_1.4fr_48px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
            <span></span><span>Sigla</span><span>Designação</span><span>Responsável</span><span></span>
          </div>
          <div className="divide-y">
            {rows.map((r) => (
              <div key={r.id} className="grid grid-cols-[40px_0.8fr_2fr_1.4fr_48px] gap-2 px-4 py-2.5 items-center">
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

      <DepartamentoFormDialog open={open} onOpenChange={setOpen} onSave={onSave} />
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

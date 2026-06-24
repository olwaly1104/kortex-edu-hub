import { useMemo, useState } from "react";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, Plus, DoorOpen, Briefcase, Wrench } from "lucide-react";
import { RowLockControls } from "@/components/admin/RowLockControls";
import { toast } from "sonner";

type Tipo = "Sala" | "Gabinete" | "Instalação";

type Espaco = {
  id: string;
  edificioId: string;
  nome: string;
  tipo: Tipo;
  piso: string;
  capacidade: number;
  ocupante?: string;
};

type Edificio = {
  id: string;
  nome: string;
  codigo: string;
  pisos: number;
  endereco?: string;
};

const TIPOS: { value: Tipo; icon: typeof DoorOpen; label: string }[] = [
  { value: "Sala", icon: DoorOpen, label: "Salas" },
  { value: "Gabinete", icon: Briefcase, label: "Gabinetes" },
  { value: "Instalação", icon: Wrench, label: "Instalações" },
];

export default function OnboardingEspacos() {
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [espacos, setEspacos] = useState<Espaco[]>([]);
  const [tab, setTab] = useState<"edificios" | Tipo>("edificios");
  const [filtroEdif, setFiltroEdif] = useState<string>("all");
  const [editEdif, setEditEdif] = useState<Record<string, boolean>>({});
  const [editEsp, setEditEsp] = useState<Record<string, boolean>>({});

  const addEdificio = () => {
    const n = edificios.length + 1;
    setEdificios(prev => [...prev, { id: `e${Date.now()}`, nome: `Novo Edifício ${n}`, codigo: `E${n}`, pisos: 2, endereco: "" }]);
  };
  const updateEdif = (id: string, patch: Partial<Edificio>) =>
    setEdificios(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  const removeEdif = (id: string) => {
    if (espacos.some(s => s.edificioId === id)) { toast.error("Remova primeiro os espaços deste edifício"); return; }
    setEdificios(prev => prev.filter(e => e.id !== id));
  };

  const addEspaco = (tipo: Tipo) => {
    if (edificios.length === 0) { toast.error("Crie primeiro um edifício"); return; }
    const edif = filtroEdif !== "all" ? filtroEdif : edificios[0].id;
    setEspacos(prev => [...prev, { id: `s${Date.now()}`, edificioId: edif, nome: "", tipo, piso: "0", capacidade: tipo === "Gabinete" ? 4 : 30 }]);
  };
  const updateEspaco = (id: string, patch: Partial<Espaco>) =>
    setEspacos(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  const removeEspaco = (id: string) => setEspacos(prev => prev.filter(s => s.id !== id));

  const countsByTipo = useMemo(() => {
    const m: Record<string, number> = { Sala: 0, Gabinete: 0, "Instalação": 0 };
    espacos.forEach(s => { m[s.tipo] = (m[s.tipo] || 0) + 1; });
    return m;
  }, [espacos]);

  const renderEspacosTable = (tipo: Tipo, placeholderNome: string) => {
    const filtrados = espacos.filter(s => s.tipo === tipo && (filtroEdif === "all" || s.edificioId === filtroEdif));
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filtroEdif} onValueChange={setFiltroEdif}>
            <SelectTrigger className="h-8 text-xs w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os edifícios</SelectItem>
              {edificios.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-[11px] text-muted-foreground ml-auto">{filtrados.length} {tipo === "Instalação" ? "instalações" : tipo === "Gabinete" ? "gabinetes" : "salas"}</span>
        </div>
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[1.2fr_1fr_70px_90px_1.2fr_220px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
            <span>Edifício</span><span>Nome / Nº</span><span>Piso</span><span>Capacidade</span><span>{tipo === "Gabinete" ? "Ocupante" : "Notas"}</span><span className="text-right">Ações</span>
          </div>
          <div className="divide-y">
            {filtrados.map(s => {
              const isEdit = !!editEsp[s.id];
              return (
              <div key={s.id} className="grid grid-cols-[1.2fr_1fr_70px_90px_1.2fr_220px] gap-2 px-4 py-2 items-center">
                <Select value={s.edificioId} onValueChange={v => updateEspaco(s.id, { edificioId: v })} disabled={!isEdit}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{edificios.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
                </Select>
                <Input value={s.nome} disabled={!isEdit} onChange={ev => updateEspaco(s.id, { nome: ev.target.value })} className="h-8 text-xs" placeholder={placeholderNome} />
                <Input value={s.piso} disabled={!isEdit} onChange={ev => updateEspaco(s.id, { piso: ev.target.value })} className="h-8 text-xs" />
                <Input type="number" min={0} disabled={!isEdit} value={s.capacidade} onChange={ev => updateEspaco(s.id, { capacidade: Number(ev.target.value) })} className="h-8 text-xs" />
                <Input value={s.ocupante || ""} disabled={!isEdit} onChange={ev => updateEspaco(s.id, { ocupante: ev.target.value })} className="h-8 text-xs" placeholder={tipo === "Gabinete" ? "Pessoa ocupante" : "—"} />
                <RowLockControls
                  editing={isEdit}
                  onEdit={() => setEditEsp(p => ({ ...p, [s.id]: true }))}
                  onConfirm={() => setEditEsp(p => ({ ...p, [s.id]: false }))}
                  onDelete={() => removeEspaco(s.id)}
                />
              </div>
              );
            })}
            {filtrados.length === 0 && (
              <p className="px-4 py-8 text-xs text-muted-foreground italic text-center">Sem registos.</p>
            )}
          </div>
          <div className="border-t bg-muted/10 px-4 py-2.5">
            <Button variant="ghost" size="sm" onClick={() => addEspaco(tipo)} className="h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/5">
              <Plus className="w-3.5 h-3.5" /> Adicionar {tipo.toLowerCase()}
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <OnboardingStepBanner />

      <div className="flex items-center gap-3 pb-1">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">Edifícios e Espaços</h1>
          <p className="text-xs text-muted-foreground">Registe todos os espaços físicos: edifícios, salas, gabinetes e instalações.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-muted text-foreground flex items-center justify-center"><Building2 className="w-4 h-4" /></div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">Edifícios</p>
            <p className="text-base font-semibold leading-none">{edificios.length}</p>
          </div>
        </Card>
        {TIPOS.map(t => {
          const I = t.icon;
          return (
            <Card key={t.value} className="p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-muted text-foreground flex items-center justify-center"><I className="w-4 h-4" /></div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">{t.label}</p>
                <p className="text-base font-semibold leading-none">{countsByTipo[t.value] || 0}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="edificios" className="gap-1.5"><Building2 className="w-3.5 h-3.5" /> Edifícios</TabsTrigger>
          <TabsTrigger value="Sala" className="gap-1.5"><DoorOpen className="w-3.5 h-3.5" /> Salas</TabsTrigger>
          <TabsTrigger value="Gabinete" className="gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Gabinetes</TabsTrigger>
          <TabsTrigger value="Instalação" className="gap-1.5"><Wrench className="w-3.5 h-3.5" /> Instalações</TabsTrigger>
        </TabsList>

        <TabsContent value="edificios" className="mt-0">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1.3fr_90px_80px_1.3fr_220px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
              <span>Nome</span><span>Código</span><span>Pisos</span><span>Endereço</span><span className="text-right">Ações</span>
            </div>
            <div className="divide-y">
              {edificios.map(e => {
                const isEdit = !!editEdif[e.id];
                return (
                <div key={e.id} className="grid grid-cols-[1.3fr_90px_80px_1.3fr_220px] gap-2 px-4 py-2 items-center">
                  <Input value={e.nome} disabled={!isEdit} onChange={ev => updateEdif(e.id, { nome: ev.target.value })} className="h-8 text-xs" />
                  <Input value={e.codigo} disabled={!isEdit} onChange={ev => updateEdif(e.id, { codigo: ev.target.value.toUpperCase() })} className="h-8 text-xs" />
                  <Input type="number" min={1} max={20} disabled={!isEdit} value={e.pisos} onChange={ev => updateEdif(e.id, { pisos: Number(ev.target.value) })} className="h-8 text-xs" />
                  <Input value={e.endereco || ""} disabled={!isEdit} onChange={ev => updateEdif(e.id, { endereco: ev.target.value })} className="h-8 text-xs" placeholder="Campus, rua…" />
                  <RowLockControls
                    editing={isEdit}
                    onEdit={() => setEditEdif(p => ({ ...p, [e.id]: true }))}
                    onConfirm={() => setEditEdif(p => ({ ...p, [e.id]: false }))}
                    onDelete={() => removeEdif(e.id)}
                  />
                </div>
                );
              })}
              {edificios.length === 0 && (
                <p className="px-4 py-8 text-xs text-muted-foreground italic text-center">Sem edifícios registados.</p>
              )}
            </div>
            <div className="border-t bg-muted/10 px-4 py-2.5">
              <Button variant="ghost" size="sm" onClick={addEdificio} className="h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/5">
                <Plus className="w-3.5 h-3.5" /> Adicionar edifício
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="Sala" className="mt-0">{renderEspacosTable("Sala", "A.101")}</TabsContent>
        <TabsContent value="Gabinete" className="mt-0">{renderEspacosTable("Gabinete", "G.05")}</TabsContent>
        <TabsContent value="Instalação" className="mt-0">{renderEspacosTable("Instalação", "Ginásio / Cantina…")}</TabsContent>
      </Tabs>
    </div>
  );
}

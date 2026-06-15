import { useMemo, useState } from "react";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, Plus, Trash2, DoorOpen, Briefcase, FlaskConical, Library, Users, Coffee } from "lucide-react";
import { toast } from "sonner";

type Sala = {
  id: string;
  edificioId: string;
  nome: string;
  tipo: string;
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

const tiposSala = [
  { value: "Sala de Aula", icon: DoorOpen },
  { value: "Gabinete", icon: Briefcase },
  { value: "Laboratório", icon: FlaskConical },
  { value: "Biblioteca", icon: Library },
  { value: "Auditório", icon: Users },
  { value: "Sala de Reuniões", icon: Users },
  { value: "Espaço Comum", icon: Coffee },
];

const seedEdificios: Edificio[] = [
  { id: "e1", nome: "Edifício Central", codigo: "EC", pisos: 4, endereco: "Campus Principal" },
  { id: "e2", nome: "Edifício de Ciências", codigo: "ECI", pisos: 3, endereco: "Campus Principal" },
];

const seedSalas: Sala[] = [
  { id: "s1", edificioId: "e1", nome: "A.101", tipo: "Sala de Aula", piso: "1", capacidade: 40 },
  { id: "s2", edificioId: "e1", nome: "A.102", tipo: "Sala de Aula", piso: "1", capacidade: 35 },
  { id: "s3", edificioId: "e1", nome: "G.201", tipo: "Gabinete", piso: "2", capacidade: 2, ocupante: "Dr. Manuel Rebelo" },
  { id: "s4", edificioId: "e1", nome: "G.202", tipo: "Gabinete", piso: "2", capacidade: 2, ocupante: "Dra. Helena Vaz" },
  { id: "s5", edificioId: "e2", nome: "L.001", tipo: "Laboratório", piso: "0", capacidade: 24 },
  { id: "s6", edificioId: "e2", nome: "BIB", tipo: "Biblioteca", piso: "0", capacidade: 80 },
];

export default function OnboardingEspacos() {
  const [edificios, setEdificios] = useState<Edificio[]>(seedEdificios);
  const [salas, setSalas] = useState<Sala[]>(seedSalas);
  const [filtroEdif, setFiltroEdif] = useState<string>("all");
  const [filtroTipo, setFiltroTipo] = useState<string>("all");

  const addEdificio = () => {
    const n = edificios.length + 1;
    setEdificios(prev => [...prev, { id: `e${Date.now()}`, nome: `Novo Edifício ${n}`, codigo: `E${n}`, pisos: 2, endereco: "" }]);
  };
  const updateEdif = (id: string, patch: Partial<Edificio>) =>
    setEdificios(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  const removeEdif = (id: string) => {
    if (salas.some(s => s.edificioId === id)) { toast.error("Remova primeiro as salas deste edifício"); return; }
    setEdificios(prev => prev.filter(e => e.id !== id));
  };

  const addSala = () => {
    if (edificios.length === 0) { toast.error("Crie primeiro um edifício"); return; }
    const edif = filtroEdif !== "all" ? filtroEdif : edificios[0].id;
    setSalas(prev => [...prev, { id: `s${Date.now()}`, edificioId: edif, nome: "", tipo: filtroTipo !== "all" ? filtroTipo : "Sala de Aula", piso: "0", capacidade: 30 }]);
  };
  const updateSala = (id: string, patch: Partial<Sala>) =>
    setSalas(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  const removeSala = (id: string) => setSalas(prev => prev.filter(s => s.id !== id));

  const salasFiltradas = useMemo(() => salas.filter(s =>
    (filtroEdif === "all" || s.edificioId === filtroEdif) &&
    (filtroTipo === "all" || s.tipo === filtroTipo)
  ), [salas, filtroEdif, filtroTipo]);

  const totalsByTipo = useMemo(() => {
    const m: Record<string, number> = {};
    salas.forEach(s => { m[s.tipo] = (m[s.tipo] || 0) + 1; });
    return m;
  }, [salas]);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <OnboardingStepBanner />

      <div className="flex items-center gap-3 pb-1">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">Registar Geopontos</h1>
          <p className="text-xs text-muted-foreground">Defina os pontos GPS de entradas, edifícios e zonas de presença do campus.</p>
        </div>
        <div className="ml-auto flex gap-4 text-right">
          <div><p className="text-xs text-muted-foreground">Edifícios</p><p className="text-lg font-semibold">{edificios.length}</p></div>
          <div><p className="text-xs text-muted-foreground">Salas</p><p className="text-lg font-semibold">{salas.length}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {tiposSala.map(t => {
          const I = t.icon;
          return (
            <Card key={t.value} className="p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-muted text-foreground flex items-center justify-center"><I className="w-4 h-4" /></div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">{t.value}</p>
                <p className="text-base font-semibold leading-none">{totalsByTipo[t.value] || 0}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="salas" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="salas" className="gap-1.5"><DoorOpen className="w-3.5 h-3.5" /> Salas & Gabinetes</TabsTrigger>
          <TabsTrigger value="edificios" className="gap-1.5"><Building2 className="w-3.5 h-3.5" /> Edifícios</TabsTrigger>
        </TabsList>

        <TabsContent value="edificios" className="mt-0">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1.4fr_100px_100px_1.5fr_64px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
              <span>Nome</span><span>Código</span><span>Pisos</span><span>Endereço</span><span></span>
            </div>
            <div className="divide-y">
              {edificios.map(e => (
                <div key={e.id} className="grid grid-cols-[1.4fr_100px_100px_1.5fr_64px] gap-2 px-4 py-2 items-center">
                  <Input value={e.nome} onChange={ev => updateEdif(e.id, { nome: ev.target.value })} className="h-8 text-xs" />
                  <Input value={e.codigo} onChange={ev => updateEdif(e.id, { codigo: ev.target.value.toUpperCase() })} className="h-8 text-xs" />
                  <Input type="number" min={1} max={20} value={e.pisos} onChange={ev => updateEdif(e.id, { pisos: Number(ev.target.value) })} className="h-8 text-xs" />
                  <Input value={e.endereco || ""} onChange={ev => updateEdif(e.id, { endereco: ev.target.value })} className="h-8 text-xs" placeholder="Campus, rua…" />
                  <div className="flex justify-end">
                    <Button size="icon" variant="ghost" onClick={() => removeEdif(e.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
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

        <TabsContent value="salas" className="mt-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filtroEdif} onValueChange={setFiltroEdif}>
              <SelectTrigger className="h-8 text-xs w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os edifícios</SelectItem>
                {edificios.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="h-8 text-xs w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {tiposSala.map(t => <SelectItem key={t.value} value={t.value}>{t.value}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-[11px] text-muted-foreground ml-auto">{salasFiltradas.length} de {salas.length}</span>
          </div>

          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1.2fr_1fr_1.4fr_80px_100px_1.4fr_64px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
              <span>Edifício</span><span>Nome / Nº</span><span>Tipo</span><span>Piso</span><span>Capacidade</span><span>Ocupante / Notas</span><span></span>
            </div>
            <div className="divide-y">
              {salasFiltradas.map(s => (
                <div key={s.id} className="grid grid-cols-[1.2fr_1fr_1.4fr_80px_100px_1.4fr_64px] gap-2 px-4 py-2 items-center">
                  <Select value={s.edificioId} onValueChange={v => updateSala(s.id, { edificioId: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{edificios.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input value={s.nome} onChange={ev => updateSala(s.id, { nome: ev.target.value })} className="h-8 text-xs" placeholder="A.101" />
                  <Select value={s.tipo} onValueChange={v => updateSala(s.id, { tipo: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{tiposSala.map(t => <SelectItem key={t.value} value={t.value}>{t.value}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input value={s.piso} onChange={ev => updateSala(s.id, { piso: ev.target.value })} className="h-8 text-xs" />
                  <Input type="number" min={0} value={s.capacidade} onChange={ev => updateSala(s.id, { capacidade: Number(ev.target.value) })} className="h-8 text-xs" />
                  <Input value={s.ocupante || ""} onChange={ev => updateSala(s.id, { ocupante: ev.target.value })} className="h-8 text-xs" placeholder={s.tipo === "Gabinete" ? "Pessoa ocupante" : "—"} />
                  <div className="flex justify-end">
                    <Button size="icon" variant="ghost" onClick={() => removeSala(s.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {salasFiltradas.length === 0 && (
                <p className="px-4 py-8 text-xs text-muted-foreground italic text-center">Sem salas para os filtros selecionados.</p>
              )}
            </div>
            <div className="border-t bg-muted/10 px-4 py-2.5">
              <Button variant="ghost" size="sm" onClick={addSala} className="h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/5">
                <Plus className="w-3.5 h-3.5" /> Adicionar sala / gabinete
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

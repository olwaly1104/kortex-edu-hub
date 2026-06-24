import { useEffect, useMemo, useState } from "react";
import { OnboardingStepBanner, markOnboardingStepDone } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, Plus, DoorOpen, Briefcase, Wrench } from "lucide-react";
import { RowLockControls } from "@/components/admin/RowLockControls";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type EspacoTipo = "Sala" | "Gabinete" | "Instalação";
type Espaco = {
  id: string;
  edificioId: string;
  nome: string;
  tipo: EspacoTipo;
  piso: string;
  capacidade: number;
  notas?: string;
};
type Edificio = { id: string; sigla: string; nome: string; pisos: number; salas: number; responsavel: string | null };
type Contact = { id: string; display_name: string | null; email: string | null };

const ESPACOS_KEY = "upra:espacos";

function loadLS<T>(key: string): T[] {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : []; } catch { return []; }
}

const TIPO_LABEL: Record<EspacoTipo, string> = { Sala: "salas", Gabinete: "gabinetes", "Instalação": "instalações" };

export default function OnboardingGeopontos() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"edificios" | EspacoTipo>("edificios");

  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [espacos, setEspacos] = useState<Espaco[]>(() => loadLS<Espaco>(ESPACOS_KEY));
  const [filtroEdif, setFiltroEdif] = useState<string>("all");
  const [editEdif, setEditEdif] = useState<Record<string, boolean>>({});
  const [editEsp, setEditEsp] = useState<Record<string, boolean>>({});

  useEffect(() => { try { localStorage.setItem(ESPACOS_KEY, JSON.stringify(espacos)); } catch {} }, [espacos]);

  useEffect(() => {
    (async () => {
      const [{ data: eds }, { data: cts }] = await Promise.all([
        supabase.from("edificios").select("id, sigla, nome, pisos, salas, responsavel").order("created_at"),
        supabase.rpc("list_institution_contacts"),
      ]);
      if (eds) setEdificios(eds.map((e: any) => ({ id: e.id, sigla: e.sigla || "", nome: e.nome || "", pisos: e.pisos ?? 1, salas: e.salas ?? 0, responsavel: e.responsavel })));
      if (cts) setContacts(cts as Contact[]);
    })();
  }, [user?.id]);

  // ---- Edifícios (DB)
  const addEdif = async () => {
    if (!user?.id) return;
    const n = edificios.length + 1;
    const { data, error } = await supabase.from("edificios").insert({
      owner_user_id: user.id, sigla: `E${n}`, nome: `Novo Edifício ${n}`, pisos: 2, salas: 0, responsavel: null,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    setEdificios(p => [...p, { id: data.id, sigla: data.sigla, nome: data.nome, pisos: data.pisos, salas: data.salas, responsavel: data.responsavel }]);
  };
  const updEdif = async (id: string, patch: Partial<Edificio>) => {
    setEdificios(p => p.map(e => e.id === id ? { ...e, ...patch } : e));
    const { error } = await supabase.from("edificios").update(patch).eq("id", id);
    if (error) toast.error(error.message);
  };
  const rmEdif = async (id: string) => {
    if (espacos.some(s => s.edificioId === id)) { toast.error("Remova primeiro os espaços deste edifício"); return; }
    const { error } = await supabase.from("edificios").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setEdificios(p => p.filter(e => e.id !== id));
  };

  // ---- Espaços
  const addEspaco = (tipo: EspacoTipo) => {
    if (edificios.length === 0) { toast.error("Crie primeiro um edifício"); return; }
    const edif = filtroEdif !== "all" ? filtroEdif : edificios[0].id;
    setEspacos(p => [...p, { id: `s${Date.now()}`, edificioId: edif, nome: "", tipo, piso: "0", capacidade: tipo === "Gabinete" ? 4 : 30 }]);
  };
  const updEspaco = (id: string, patch: Partial<Espaco>) => setEspacos(p => p.map(s => s.id === id ? { ...s, ...patch } : s));
  const rmEspaco = (id: string) => setEspacos(p => p.filter(s => s.id !== id));

  const counts = useMemo(() => ({
    edif: edificios.length,
    salas: espacos.filter(s => s.tipo === "Sala").length,
    gab: espacos.filter(s => s.tipo === "Gabinete").length,
    inst: espacos.filter(s => s.tipo === "Instalação").length,
  }), [edificios, espacos]);

  const save = () => {
    markOnboardingStepDone(user?.email, "geo.reg");
    toast.success("Espaços guardados");
  };

  const renderEspacos = (tipo: EspacoTipo, placeholder: string) => {
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
          <span className="text-[11px] text-muted-foreground ml-auto">{filtrados.length} {TIPO_LABEL[tipo]}</span>
        </div>
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[1.2fr_1fr_80px_100px_1.6fr_64px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
            <span>Edifício</span><span>Nome / Nº</span><span>Piso</span><span>Capacidade</span><span>{tipo === "Gabinete" ? "Ocupante" : "Notas"}</span><span></span>
          </div>
          <div className="divide-y">
            {filtrados.map(s => (
              <div key={s.id} className="grid grid-cols-[1.2fr_1fr_80px_100px_1.6fr_64px] gap-2 px-4 py-2 items-center">
                <Select value={s.edificioId} onValueChange={v => updEspaco(s.id, { edificioId: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{edificios.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
                </Select>
                <Input value={s.nome} onChange={ev => updEspaco(s.id, { nome: ev.target.value })} className="h-8 text-xs" placeholder={placeholder} />
                <Input value={s.piso} onChange={ev => updEspaco(s.id, { piso: ev.target.value })} className="h-8 text-xs" />
                <Input type="number" min={0} value={s.capacidade} onChange={ev => updEspaco(s.id, { capacidade: Number(ev.target.value) })} className="h-8 text-xs" />
                <Input value={s.notas || ""} onChange={ev => updEspaco(s.id, { notas: ev.target.value })} className="h-8 text-xs" placeholder={tipo === "Gabinete" ? "Pessoa ocupante" : "—"} />
                <div className="flex justify-end">
                  <Button size="icon" variant="ghost" onClick={() => rmEspaco(s.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
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
      <OnboardingStepBanner stepKey="geo.reg" />

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
        {[
          { label: "Edifícios", value: counts.edif, Icon: Building2 },
          { label: "Salas", value: counts.salas, Icon: DoorOpen },
          { label: "Gabinetes", value: counts.gab, Icon: Briefcase },
          { label: "Instalações", value: counts.inst, Icon: Wrench },
        ].map(k => (
          <Card key={k.label} className="p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-muted text-foreground flex items-center justify-center"><k.Icon className="w-4 h-4" /></div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">{k.label}</p>
              <p className="text-base font-semibold leading-none">{k.value}</p>
            </div>
          </Card>
        ))}
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
            <div className="grid grid-cols-[100px_1.4fr_80px_80px_1.4fr_64px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
              <span>Sigla</span><span>Nome</span><span>Pisos</span><span>Salas</span><span>Responsável</span><span></span>
            </div>
            <div className="divide-y">
              {edificios.map(e => (
                <div key={e.id} className="grid grid-cols-[100px_1.4fr_80px_80px_1.4fr_64px] gap-2 px-4 py-2 items-center">
                  <Input value={e.sigla} onChange={ev => updEdif(e.id, { sigla: ev.target.value.toUpperCase() })} className="h-8 text-xs" />
                  <Input value={e.nome} onChange={ev => updEdif(e.id, { nome: ev.target.value })} className="h-8 text-xs" />
                  <Input type="number" min={1} max={20} value={e.pisos} onChange={ev => updEdif(e.id, { pisos: Number(ev.target.value) })} className="h-8 text-xs" />
                  <Input type="number" min={0} value={e.salas} onChange={ev => updEdif(e.id, { salas: Number(ev.target.value) })} className="h-8 text-xs" />
                  <Select value={e.responsavel ?? "none"} onValueChange={v => updEdif(e.id, { responsavel: v === "none" ? null : v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Sem responsável —</SelectItem>
                      {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.display_name || c.email}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end">
                    <Button size="icon" variant="ghost" onClick={() => rmEdif(e.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
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
              <Button variant="ghost" size="sm" onClick={addEdif} className="h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/5">
                <Plus className="w-3.5 h-3.5" /> Adicionar edifício
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="Sala" className="mt-0">{renderEspacos("Sala", "A.101")}</TabsContent>
        <TabsContent value="Gabinete" className="mt-0">{renderEspacos("Gabinete", "G.05")}</TabsContent>
        <TabsContent value="Instalação" className="mt-0">{renderEspacos("Instalação", "Ginásio / Cantina…")}</TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={save}>Guardar</Button>
      </div>
    </div>
  );
}

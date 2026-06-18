import { useEffect, useMemo, useState } from "react";
import { OnboardingStepBanner, markOnboardingStepDone } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, Plus, Trash2, Navigation, Building2, DoorOpen, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type Geoponto = {
  id: string;
  nome: string;
  latitude: string;
  longitude: string;
  raio: number;
  descricao?: string;
};

type Edificio = { id: string; nome: string; codigo: string; pisos: number; endereco?: string };
type EspacoTipo = "Sala" | "Instalação";
type Espaco = {
  id: string;
  edificioId: string;
  nome: string;
  tipo: EspacoTipo;
  piso: string;
  capacidade: number;
  notas?: string;
};

const GEOPONTOS_KEY = "upra:geopontos";
const EDIFICIOS_KEY = "upra:edificios";
const ESPACOS_KEY = "upra:espacos";

function loadLS<T>(key: string): T[] {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : []; } catch { return []; }
}

export default function OnboardingGeopontos() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"geopontos" | "edificios" | "Sala" | "Instalação">("geopontos");

  const [pontos, setPontos] = useState<Geoponto[]>(() => loadLS<Geoponto>(GEOPONTOS_KEY));
  const [edificios, setEdificios] = useState<Edificio[]>(() => loadLS<Edificio>(EDIFICIOS_KEY));
  const [espacos, setEspacos] = useState<Espaco[]>(() => loadLS<Espaco>(ESPACOS_KEY));
  const [filtroEdif, setFiltroEdif] = useState<string>("all");

  useEffect(() => { try { localStorage.setItem(GEOPONTOS_KEY, JSON.stringify(pontos)); } catch {} }, [pontos]);
  useEffect(() => { try { localStorage.setItem(EDIFICIOS_KEY, JSON.stringify(edificios)); } catch {} }, [edificios]);
  useEffect(() => { try { localStorage.setItem(ESPACOS_KEY, JSON.stringify(espacos)); } catch {} }, [espacos]);

  // ---- Geopontos
  const addPonto = () => setPontos(p => [...p, { id: `g${Date.now()}`, nome: "", latitude: "", longitude: "", raio: 50, descricao: "" }]);
  const updPonto = (id: string, patch: Partial<Geoponto>) => setPontos(p => p.map(x => x.id === id ? { ...x, ...patch } : x));
  const rmPonto = (id: string) => setPontos(p => p.filter(x => x.id !== id));
  const useCurrent = (id: string) => {
    if (!navigator.geolocation) { toast.error("Geolocalização não suportada"); return; }
    navigator.geolocation.getCurrentPosition(
      pos => updPonto(id, { latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }),
      () => toast.error("Não foi possível obter a localização atual"),
    );
  };

  // ---- Edifícios
  const addEdif = () => {
    const n = edificios.length + 1;
    setEdificios(p => [...p, { id: `e${Date.now()}`, nome: `Novo Edifício ${n}`, codigo: `E${n}`, pisos: 2, endereco: "" }]);
  };
  const updEdif = (id: string, patch: Partial<Edificio>) => setEdificios(p => p.map(e => e.id === id ? { ...e, ...patch } : e));
  const rmEdif = (id: string) => {
    if (espacos.some(s => s.edificioId === id)) { toast.error("Remova primeiro os espaços deste edifício"); return; }
    setEdificios(p => p.filter(e => e.id !== id));
  };

  // ---- Espaços (Salas/Instalações)
  const addEspaco = (tipo: EspacoTipo) => {
    if (edificios.length === 0) { toast.error("Crie primeiro um edifício"); return; }
    const edif = filtroEdif !== "all" ? filtroEdif : edificios[0].id;
    setEspacos(p => [...p, { id: `s${Date.now()}`, edificioId: edif, nome: "", tipo, piso: "0", capacidade: 30 }]);
  };
  const updEspaco = (id: string, patch: Partial<Espaco>) => setEspacos(p => p.map(s => s.id === id ? { ...s, ...patch } : s));
  const rmEspaco = (id: string) => setEspacos(p => p.filter(s => s.id !== id));

  const counts = useMemo(() => ({
    geo: pontos.length,
    edif: edificios.length,
    salas: espacos.filter(s => s.tipo === "Sala").length,
    inst: espacos.filter(s => s.tipo === "Instalação").length,
  }), [pontos, edificios, espacos]);

  const save = () => {
    markOnboardingStepDone(user?.email, "geo.reg");
    toast.success("Espaços e geopontos guardados");
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
          <span className="text-[11px] text-muted-foreground ml-auto">{filtrados.length} {tipo === "Instalação" ? "instalações" : "salas"}</span>
        </div>
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[1.2fr_1fr_80px_100px_1.6fr_64px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
            <span>Edifício</span><span>Nome / Nº</span><span>Piso</span><span>Capacidade</span><span>Notas</span><span></span>
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
                <Input value={s.notas || ""} onChange={ev => updEspaco(s.id, { notas: ev.target.value })} className="h-8 text-xs" placeholder="—" />
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
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">Geopontos, Edifícios e Espaços</h1>
          <p className="text-xs text-muted-foreground">Registe os espaços físicos da instituição e os geopontos usados para marcação de presenças.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "Geopontos", value: counts.geo, Icon: MapPin },
          { label: "Edifícios", value: counts.edif, Icon: Building2 },
          { label: "Salas", value: counts.salas, Icon: DoorOpen },
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
          <TabsTrigger value="geopontos" className="gap-1.5"><MapPin className="w-3.5 h-3.5" /> Geopontos</TabsTrigger>
          <TabsTrigger value="edificios" className="gap-1.5"><Building2 className="w-3.5 h-3.5" /> Edifícios</TabsTrigger>
          <TabsTrigger value="Sala" className="gap-1.5"><DoorOpen className="w-3.5 h-3.5" /> Salas</TabsTrigger>
          <TabsTrigger value="Instalação" className="gap-1.5"><Wrench className="w-3.5 h-3.5" /> Instalações</TabsTrigger>
        </TabsList>

        <TabsContent value="geopontos" className="mt-0">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Pontos geográficos (campus, polos) com raio de tolerância em metros.</p>
              <span className="text-[11px] text-muted-foreground tabular-nums">{pontos.length} registos</span>
            </div>
            {pontos.length === 0 ? (
              <p className="px-4 py-8 text-xs text-muted-foreground italic text-center">Sem geopontos registados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b bg-muted/30">
                      <th className="text-left font-semibold px-3 py-2">Nome</th>
                      <th className="text-left font-semibold px-3 py-2">Latitude</th>
                      <th className="text-left font-semibold px-3 py-2">Longitude</th>
                      <th className="text-left font-semibold px-3 py-2">Raio (m)</th>
                      <th className="text-left font-semibold px-3 py-2">Descrição</th>
                      <th className="w-24"></th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pontos.map(p => (
                      <tr key={p.id} className="border-b border-border/50 last:border-0">
                        <td className="px-3 py-2"><Input value={p.nome} onChange={e => updPonto(p.id, { nome: e.target.value })} placeholder="Campus Principal" className="h-8 text-xs" /></td>
                        <td className="px-3 py-2"><Input value={p.latitude} onChange={e => updPonto(p.id, { latitude: e.target.value })} placeholder="-8.838" className="h-8 text-xs w-32" /></td>
                        <td className="px-3 py-2"><Input value={p.longitude} onChange={e => updPonto(p.id, { longitude: e.target.value })} placeholder="13.234" className="h-8 text-xs w-32" /></td>
                        <td className="px-3 py-2"><Input type="number" value={p.raio} onChange={e => updPonto(p.id, { raio: Number(e.target.value) || 0 })} className="h-8 text-xs w-20" /></td>
                        <td className="px-3 py-2"><Input value={p.descricao || ""} onChange={e => updPonto(p.id, { descricao: e.target.value })} placeholder="(opcional)" className="h-8 text-xs" /></td>
                        <td className="px-2 py-2">
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => useCurrent(p.id)}>
                            <Navigation className="w-3 h-3" /> Atual
                          </Button>
                        </td>
                        <td className="px-2 py-2 text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => rmPonto(p.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="border-t bg-muted/10 px-4 py-2.5">
              <Button variant="ghost" size="sm" onClick={addPonto} className="h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/5">
                <Plus className="w-3.5 h-3.5" /> Adicionar geoponto
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="edificios" className="mt-0">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1.4fr_100px_100px_1.5fr_64px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
              <span>Nome</span><span>Código</span><span>Pisos</span><span>Endereço</span><span></span>
            </div>
            <div className="divide-y">
              {edificios.map(e => (
                <div key={e.id} className="grid grid-cols-[1.4fr_100px_100px_1.5fr_64px] gap-2 px-4 py-2 items-center">
                  <Input value={e.nome} onChange={ev => updEdif(e.id, { nome: ev.target.value })} className="h-8 text-xs" />
                  <Input value={e.codigo} onChange={ev => updEdif(e.id, { codigo: ev.target.value.toUpperCase() })} className="h-8 text-xs" />
                  <Input type="number" min={1} max={20} value={e.pisos} onChange={ev => updEdif(e.id, { pisos: Number(ev.target.value) })} className="h-8 text-xs" />
                  <Input value={e.endereco || ""} onChange={ev => updEdif(e.id, { endereco: ev.target.value })} className="h-8 text-xs" placeholder="Campus, rua…" />
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
        <TabsContent value="Instalação" className="mt-0">{renderEspacos("Instalação", "Ginásio / Cantina…")}</TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={save}>Guardar</Button>
      </div>
    </div>
  );
}

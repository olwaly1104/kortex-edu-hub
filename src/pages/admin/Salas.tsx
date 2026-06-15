import { FinHeader } from "@/pages/financas/_FinHeader";
import { Building2, Plus, Search, Trash2, DoorOpen, MapPin, Hash, Layers, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { FormSection, EmptyState } from "./Staff";

type Edificio = { id: string; nome: string; codigo: string; pisos: number; endereco: string };
type Sala = { id: string; edificioId: string; nome: string; tipo: string; piso: string; capacidade: number; ocupante?: string };

const tiposSala = ["Sala de Aula", "Gabinete", "Laboratório", "Biblioteca", "Auditório", "Sala de Reuniões", "Espaço Comum"];

const emptyEd = (): Edificio => ({ id: "", nome: "", codigo: "", pisos: 1, endereco: "" });
const emptySala = (edId = ""): Sala => ({ id: "", edificioId: edId, nome: "", tipo: "Sala de Aula", piso: "0", capacidade: 30 });

export default function AdminSalas() {
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [q, setQ] = useState("");
  const [edOpen, setEdOpen] = useState(false);
  const [salaOpen, setSalaOpen] = useState(false);
  const [edDraft, setEdDraft] = useState<Edificio>(emptyEd());
  const [salaDraft, setSalaDraft] = useState<Sala>(emptySala());

  const filtered = useMemo(() => salas.filter((s) => [s.nome, s.tipo, s.ocupante || ""].some((v) => v.toLowerCase().includes(q.toLowerCase()))), [salas, q]);
  const capacidadeTotal = salas.reduce((a, s) => a + s.capacidade, 0);

  const openNewEd = () => { setEdDraft(emptyEd()); setEdOpen(true); };
  const saveEd = () => {
    if (!edDraft.nome.trim() || !edDraft.codigo.trim()) return;
    setEdificios((p) => [...p, { ...edDraft, id: `${Date.now()}` }]);
    setEdOpen(false);
  };
  const removeEd = (id: string) => {
    setEdificios((p) => p.filter((e) => e.id !== id));
    setSalas((p) => p.filter((s) => s.edificioId !== id));
  };

  const openNewSala = () => {
    if (!edificios.length) { openNewEd(); return; }
    setSalaDraft(emptySala(edificios[0].id));
    setSalaOpen(true);
  };
  const saveSala = () => {
    if (!salaDraft.nome.trim() || !salaDraft.edificioId) return;
    setSalas((p) => [...p, { ...salaDraft, id: `${Date.now()}` }]);
    setSalaOpen(false);
  };
  const removeSala = (id: string) => setSalas((p) => p.filter((s) => s.id !== id));

  const setEd = <K extends keyof Edificio>(k: K, v: Edificio[K]) => setEdDraft((d) => ({ ...d, [k]: v }));
  const setSala = <K extends keyof Sala>(k: K, v: Sala[K]) => setSalaDraft((d) => ({ ...d, [k]: v }));

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader title="Salas e Edifícios" subtitle="Infraestrutura física da instituição" icon={<Building2 className="w-5 h-5 text-primary" />} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Edifícios" value={edificios.length} />
        <Stat label="Salas" value={salas.length} />
        <Stat label="Gabinetes" value={salas.filter((s) => s.tipo === "Gabinete").length} />
        <Stat label="Capacidade total" value={capacidadeTotal} />
      </div>

      {/* EDIFÍCIOS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Edifícios</h3>
            <p className="text-xs text-muted-foreground">{edificios.length} {edificios.length === 1 ? "edifício" : "edifícios"} registado{edificios.length === 1 ? "" : "s"}</p>
          </div>
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={openNewEd}><Plus className="w-3.5 h-3.5" /> Adicionar Edifício</Button>
        </div>

        {edificios.length === 0 ? (
          <EmptyState onAdd={openNewEd} icon={<Building2 className="w-7 h-7" />} title="Nenhum edifício registado" hint="Comece por registar os edifícios do campus para depois associar salas." cta="Adicionar Edifício" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {edificios.map((e) => {
              const numSalas = salas.filter((s) => s.edificioId === e.id).length;
              return (
                <div key={e.id} className="group rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{e.nome}</p>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{e.codigo}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {e.endereco || "Sem endereço"}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100" onClick={() => removeEd(e.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground"><Layers className="w-3 h-3" /> {e.pisos} pisos</span>
                    <span className="flex items-center gap-1 text-muted-foreground"><DoorOpen className="w-3 h-3" /> {numSalas} salas</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SALAS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Salas</h3>
            <p className="text-xs text-muted-foreground">{salas.length} sala{salas.length === 1 ? "" : "s"} · capacidade {capacidadeTotal}</p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Procurar sala..." value={q} onChange={(ev) => setQ(ev.target.value)} className="pl-8 h-9 w-56" />
            </div>
            <Button size="sm" className="h-9 gap-1" onClick={openNewSala}><Plus className="w-3.5 h-3.5" /> Adicionar Sala</Button>
          </div>
        </div>

        {salas.length === 0 ? (
          <EmptyState onAdd={openNewSala} icon={<DoorOpen className="w-7 h-7" />} title="Nenhuma sala registada" hint={edificios.length ? "Adicione salas aos edifícios existentes." : "Adicione primeiro um edifício para registar salas."} cta={edificios.length ? "Adicionar Sala" : "Adicionar Edifício"} />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left font-semibold py-2.5 px-4">Sala</th>
                  <th className="text-left font-semibold py-2.5 px-4">Edifício</th>
                  <th className="text-left font-semibold py-2.5 px-4">Tipo</th>
                  <th className="text-left font-semibold py-2.5 px-4">Piso</th>
                  <th className="text-left font-semibold py-2.5 px-4">Capacidade</th>
                  <th className="text-left font-semibold py-2.5 px-4">Ocupante</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => {
                  const ed = edificios.find((e) => e.id === s.edificioId);
                  return (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted text-foreground flex items-center justify-center"><DoorOpen className="w-4 h-4" /></div>
                          <span className="font-mono font-semibold">{s.nome}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs">{ed?.nome || "—"}</td>
                      <td className="py-3 px-4 text-xs">{s.tipo}</td>
                      <td className="py-3 px-4 text-xs tabular-nums">Piso {s.piso}</td>
                      <td className="py-3 px-4 text-xs tabular-nums">{s.capacidade} lug.</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground truncate">{s.ocupante || "—"}</td>
                      <td className="py-3 px-2">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeSala(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* DIALOG EDIFÍCIO */}
      <Dialog open={edOpen} onOpenChange={setEdOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> Adicionar Edifício</DialogTitle>
            <DialogDescription>Registe um edifício do campus universitário.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <FormSection icon={<Hash className="w-3.5 h-3.5" />} title="Identificação">
              <div className="grid grid-cols-3 gap-3">
                <div><Label className="text-xs">Código</Label>
                  <Input className="h-9 mt-1" value={edDraft.codigo} onChange={(e) => setEd("codigo", e.target.value)} placeholder="A" />
                </div>
                <div className="col-span-2"><Label className="text-xs">Nome</Label>
                  <Input className="h-9 mt-1" value={edDraft.nome} onChange={(e) => setEd("nome", e.target.value)} placeholder="Edifício Principal" />
                </div>
              </div>
            </FormSection>
            <FormSection icon={<Layers className="w-3.5 h-3.5" />} title="Estrutura">
              <div className="grid grid-cols-3 gap-3">
                <div><Label className="text-xs">Nº de pisos</Label>
                  <Input type="number" min={1} className="h-9 mt-1" value={edDraft.pisos} onChange={(e) => setEd("pisos", Number(e.target.value))} />
                </div>
                <div className="col-span-2"><Label className="text-xs">Endereço</Label>
                  <Input className="h-9 mt-1" value={edDraft.endereco} onChange={(e) => setEd("endereco", e.target.value)} placeholder="Rua, nº, cidade" />
                </div>
              </div>
            </FormSection>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdOpen(false)}>Cancelar</Button>
            <Button onClick={saveEd} disabled={!edDraft.nome.trim() || !edDraft.codigo.trim()}>Adicionar Edifício</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG SALA */}
      <Dialog open={salaOpen} onOpenChange={setSalaOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><DoorOpen className="w-5 h-5 text-primary" /> Adicionar Sala</DialogTitle>
            <DialogDescription>Registe uma sala, gabinete ou outro espaço.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <FormSection icon={<Hash className="w-3.5 h-3.5" />} title="Identificação">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Nome / Código</Label>
                  <Input className="h-9 mt-1" value={salaDraft.nome} onChange={(e) => setSala("nome", e.target.value)} placeholder="A-101" />
                </div>
                <div><Label className="text-xs">Edifício</Label>
                  <Select value={salaDraft.edificioId} onValueChange={(v) => setSala("edificioId", v)}>
                    <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent>{edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </FormSection>
            <FormSection icon={<DoorOpen className="w-3.5 h-3.5" />} title="Tipo e localização">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><Label className="text-xs">Tipo</Label>
                  <Select value={salaDraft.tipo} onValueChange={(v) => setSala("tipo", v)}>
                    <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{tiposSala.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Piso</Label>
                  <Input className="h-9 mt-1" value={salaDraft.piso} onChange={(e) => setSala("piso", e.target.value)} placeholder="0" />
                </div>
              </div>
            </FormSection>
            <FormSection icon={<Users className="w-3.5 h-3.5" />} title="Ocupação">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Capacidade (lugares)</Label>
                  <Input type="number" min={1} className="h-9 mt-1" value={salaDraft.capacidade} onChange={(e) => setSala("capacidade", Number(e.target.value))} />
                </div>
                <div><Label className="text-xs">Ocupante (opcional)</Label>
                  <Input className="h-9 mt-1" value={salaDraft.ocupante || ""} onChange={(e) => setSala("ocupante", e.target.value)} placeholder="Ex.: Decano" />
                </div>
              </div>
            </FormSection>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSalaOpen(false)}>Cancelar</Button>
            <Button onClick={saveSala} disabled={!salaDraft.nome.trim() || !salaDraft.edificioId}>Adicionar Sala</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

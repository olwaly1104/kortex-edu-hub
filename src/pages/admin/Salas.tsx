import { FinHeader } from "@/pages/financas/_FinHeader";
import { Building2, Lock, Pencil, Check, Plus, Search, Trash2, DoorOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";

type Edificio = { id: string; nome: string; codigo: string; pisos: number; endereco: string; editing?: boolean };
type Sala = { id: string; edificioId: string; nome: string; tipo: string; piso: string; capacidade: number; ocupante?: string; editing?: boolean };

const tiposSala = ["Sala de Aula", "Gabinete", "Laboratório", "Biblioteca", "Auditório", "Sala de Reuniões", "Espaço Comum"];

const initEdificios: Edificio[] = [
  { id: "e1", nome: "Edifício Central", codigo: "EC", pisos: 4, endereco: "Campus Principal" },
  { id: "e2", nome: "Edifício de Ciências", codigo: "ECI", pisos: 3, endereco: "Campus Principal" },
];

const initSalas: Sala[] = [
  { id: "s1", edificioId: "e1", nome: "A.101", tipo: "Sala de Aula", piso: "1", capacidade: 40 },
  { id: "s2", edificioId: "e1", nome: "A.102", tipo: "Sala de Aula", piso: "1", capacidade: 35 },
  { id: "s3", edificioId: "e1", nome: "G.201", tipo: "Gabinete", piso: "2", capacidade: 2, ocupante: "Dr. Manuel Rebelo" },
  { id: "s4", edificioId: "e1", nome: "G.202", tipo: "Gabinete", piso: "2", capacidade: 2, ocupante: "Dra. Helena Vaz" },
  { id: "s5", edificioId: "e2", nome: "L.001", tipo: "Laboratório", piso: "0", capacidade: 24 },
  { id: "s6", edificioId: "e2", nome: "BIB", tipo: "Biblioteca", piso: "0", capacidade: 80 },
  { id: "s7", edificioId: "e2", nome: "AUD", tipo: "Auditório", piso: "1", capacidade: 180 },
];

export default function AdminSalas() {
  const [edificios, setEdificios] = useState<Edificio[]>(initEdificios);
  const [salas, setSalas] = useState<Sala[]>(initSalas);
  const [q, setQ] = useState("");

  const updateEd = (id: string, patch: Partial<Edificio>) => setEdificios((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const updateSala = (id: string, patch: Partial<Sala>) => setSalas((p) => p.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const removeSala = (id: string) => setSalas((p) => p.filter((s) => s.id !== id));
  const addSala = () => setSalas((p) => [...p, { id: `${Date.now()}`, edificioId: edificios[0]?.id || "e1", nome: "", tipo: "Sala de Aula", piso: "0", capacidade: 30, editing: true }]);
  const addEdificio = () => setEdificios((p) => [...p, { id: `${Date.now()}`, nome: "", codigo: "", pisos: 1, endereco: "", editing: true }]);
  const removeEdificio = (id: string) => setEdificios((p) => p.filter((e) => e.id !== id));

  const filtered = useMemo(() => salas.filter((s) => [s.nome, s.tipo, s.ocupante || ""].some((v) => v.toLowerCase().includes(q.toLowerCase()))), [salas, q]);
  const capacidadeTotal = salas.reduce((a, s) => a + s.capacidade, 0);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader title="Salas e Edifícios" subtitle="Infraestrutura física da instituição" icon={<Building2 className="w-5 h-5 text-primary" />} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Edifícios</p><p className="text-2xl font-bold tabular-nums">{edificios.length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Salas</p><p className="text-2xl font-bold tabular-nums">{salas.length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Gabinetes</p><p className="text-2xl font-bold tabular-nums">{salas.filter((s) => s.tipo === "Gabinete").length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Capacidade total</p><p className="text-2xl font-bold tabular-nums">{capacidadeTotal}</p></div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Edifícios</h3>
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={addEdificio}><Plus className="w-3.5 h-3.5" /> Adicionar Edifício</Button>
        </div>
        <div className="space-y-2">
          {edificios.map((e) => (
            <div key={e.id} className="rounded-lg border border-border bg-card p-3 flex items-center gap-3 flex-wrap">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-[240px] grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
                {e.editing ? (
                  <>
                    <Input value={e.codigo} onChange={(ev) => updateEd(e.id, { codigo: ev.target.value })} placeholder="Código" className="h-8 text-xs" />
                    <Input value={e.nome} onChange={(ev) => updateEd(e.id, { nome: ev.target.value })} placeholder="Nome" className="h-8 text-xs" />
                    <Input type="number" value={e.pisos} onChange={(ev) => updateEd(e.id, { pisos: Number(ev.target.value) })} placeholder="Pisos" className="h-8 text-xs" />
                    <Input value={e.endereco} onChange={(ev) => updateEd(e.id, { endereco: ev.target.value })} placeholder="Endereço" className="h-8 text-xs" />
                  </>
                ) : (
                  <>
                    <p className="text-xs font-mono font-semibold">{e.codigo}</p>
                    <p className="text-sm font-semibold truncate">{e.nome}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">{e.pisos} pisos</p>
                    <p className="text-xs text-muted-foreground truncate">{e.endereco}</p>
                  </>
                )}
              </div>
              {!e.editing && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-muted-foreground text-[11px] font-semibold"><Lock className="w-3 h-3" /> Bloqueado</span>}
              <Button size="sm" variant={e.editing ? "default" : "outline"} className="h-8 gap-1" onClick={() => updateEd(e.id, { editing: !e.editing })}>
                {e.editing ? <><Check className="w-3.5 h-3.5" /> Concluir</> : <><Pencil className="w-3.5 h-3.5" /> Editar</>}
              </Button>
              {e.editing && (
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeEdificio(e.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Salas</h3>
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Procurar sala..." value={q} onChange={(ev) => setQ(ev.target.value)} className="pl-8 h-8 w-56" />
            </div>
            <Button size="sm" className="h-8 gap-1" onClick={addSala}><Plus className="w-3.5 h-3.5" /> Adicionar Sala</Button>
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map((s) => {
            const ed = edificios.find((e) => e.id === s.edificioId);
            return (
              <div key={s.id} className="rounded-lg border border-border bg-card p-3 flex items-center gap-3 flex-wrap">
                <div className="w-9 h-9 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0">
                  <DoorOpen className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-[240px] grid grid-cols-2 md:grid-cols-6 gap-2 items-center">
                  {s.editing ? (
                    <>
                      <Input value={s.nome} onChange={(ev) => updateSala(s.id, { nome: ev.target.value })} placeholder="Sala" className="h-8 text-xs" />
                      <Select value={s.edificioId} onValueChange={(v) => updateSala(s.id, { edificioId: v })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select value={s.tipo} onValueChange={(v) => updateSala(s.id, { tipo: v })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{tiposSala.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input value={s.piso} onChange={(ev) => updateSala(s.id, { piso: ev.target.value })} placeholder="Piso" className="h-8 text-xs" />
                      <Input type="number" value={s.capacidade} onChange={(ev) => updateSala(s.id, { capacidade: Number(ev.target.value) })} placeholder="Cap." className="h-8 text-xs" />
                      <Input value={s.ocupante || ""} onChange={(ev) => updateSala(s.id, { ocupante: ev.target.value })} placeholder="Ocupante" className="h-8 text-xs" />
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-mono font-semibold">{s.nome}</p>
                      <p className="text-xs text-muted-foreground truncate">{ed?.nome || "—"}</p>
                      <p className="text-xs">{s.tipo}</p>
                      <p className="text-xs tabular-nums">Piso {s.piso}</p>
                      <p className="text-xs tabular-nums">{s.capacidade} lug.</p>
                      <p className="text-xs text-muted-foreground truncate">{s.ocupante || "—"}</p>
                    </>
                  )}
                </div>
                {!s.editing && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-muted-foreground text-[11px] font-semibold"><Lock className="w-3 h-3" /> Bloqueado</span>}
                <Button size="sm" variant={s.editing ? "default" : "outline"} className="h-8 gap-1" onClick={() => updateSala(s.id, { editing: !s.editing })}>
                  {s.editing ? <><Check className="w-3.5 h-3.5" /> Concluir</> : <><Pencil className="w-3.5 h-3.5" /> Editar</>}
                </Button>
                {s.editing && (
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeSala(s.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

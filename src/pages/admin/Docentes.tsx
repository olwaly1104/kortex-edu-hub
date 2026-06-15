import { FinHeader } from "@/pages/financas/_FinHeader";
import { GraduationCap, Lock, Pencil, Check, Plus, Search, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { loadDocentes, saveDocentes, type DocenteRow } from "@/lib/peopleStorage";

const prefixosPool = ["Sr.", "Sra.", "Dr.", "Dra.", "Prof.", "Eng.", "Me."];
const categoriasPool = ["Assistente", "Auxiliar", "Associado", "Catedrático", "Convidado"];
const cargosPool = ["Docente", "Coordenador", "Decano", "Diretor"];

export default function AdminDocentes() {
  const [rows, setRows] = useState<DocenteRow[]>(() => loadDocentes());
  const [q, setQ] = useState("");

  useEffect(() => { saveDocentes(rows); }, [rows]);

  const update = (id: string, patch: Partial<DocenteRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));
  const add = () => setRows((prev) => [...prev, {
    id: `${Date.now()}`, prefixo: "Dr.", primeiroNome: "", ultimoNome: "",
    email: "", contacto: "", faculdade: "", categoria: "Assistente", cargo: "Docente", editing: true,
  }]);

  const filtered = useMemo(() => rows.filter((r) =>
    [r.primeiroNome, r.ultimoNome, r.email, r.faculdade, r.categoria, r.cargo].some((v) => (v || "").toLowerCase().includes(q.toLowerCase()))
  ), [rows, q]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader title="Docentes" subtitle="Corpo docente da instituição" icon={<GraduationCap className="w-5 h-5 text-primary" />} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold tabular-nums">{rows.length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Decanos</p><p className="text-2xl font-bold tabular-nums">{rows.filter((r) => r.cargo === "Decano").length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Coordenadores</p><p className="text-2xl font-bold tabular-nums">{rows.filter((r) => r.cargo === "Coordenador").length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Faculdades</p><p className="text-2xl font-bold tabular-nums">{new Set(rows.map((r) => r.faculdade).filter(Boolean)).size}</p></div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Procurar docentes..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" />
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">{filtered.length} de {rows.length}</div>
        <Button size="sm" onClick={add} className="ml-auto gap-1"><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
      </div>

      {rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <GraduationCap className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-semibold">Nenhum docente registado</p>
          <p className="text-xs text-muted-foreground mt-1">Adicione docentes para poderem ser atribuídos como decanos e coordenadores.</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-card p-3 flex items-center gap-3 flex-wrap">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-[240px] grid grid-cols-2 md:grid-cols-7 gap-2 items-center">
              {r.editing ? (
                <>
                  <Select value={r.prefixo} onValueChange={(v) => update(r.id, { prefixo: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{prefixosPool.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input value={r.primeiroNome} onChange={(e) => update(r.id, { primeiroNome: e.target.value })} placeholder="Primeiro nome" className="h-8 text-xs" />
                  <Input value={r.ultimoNome} onChange={(e) => update(r.id, { ultimoNome: e.target.value })} placeholder="Último nome" className="h-8 text-xs" />
                  <Input value={r.email} onChange={(e) => update(r.id, { email: e.target.value })} placeholder="Email" className="h-8 text-xs" />
                  <Input value={r.faculdade} onChange={(e) => update(r.id, { faculdade: e.target.value })} placeholder="Faculdade" className="h-8 text-xs" />
                  <Select value={r.categoria} onValueChange={(v) => update(r.id, { categoria: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{categoriasPool.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={r.cargo} onValueChange={(v) => update(r.id, { cargo: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{cargosPool.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold md:col-span-2 truncate">{r.prefixo} {r.primeiroNome} {r.ultimoNome}</p>
                  <p className="text-xs text-muted-foreground truncate md:col-span-2">{r.email}</p>
                  <p className="text-xs truncate">{r.faculdade || <span className="text-muted-foreground italic">Sem faculdade</span>}</p>
                  <p className="text-xs text-muted-foreground">{r.categoria}</p>
                  <span className="justify-self-start px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">{r.cargo}</span>
                </>
              )}
            </div>
            {!r.editing && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-muted-foreground text-[11px] font-semibold"><Lock className="w-3 h-3" /> Bloqueado</span>}
            <Button size="sm" variant={r.editing ? "default" : "outline"} className="h-8 gap-1" onClick={() => update(r.id, { editing: !r.editing })}>
              {r.editing ? <><Check className="w-3.5 h-3.5" /> Concluir</> : <><Pencil className="w-3.5 h-3.5" /> Editar</>}
            </Button>
            {r.editing && (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(r.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

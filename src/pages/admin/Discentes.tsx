import { FinHeader } from "@/pages/financas/_FinHeader";
import { Users, Lock, Pencil, Check, Plus, Search, Trash2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";

type Discente = { id: string; primeiroNome: string; ultimoNome: string; email: string; curso: string; ano: string; turma: string; estado: "Ativo" | "Inativo"; editing?: boolean };

const cursosPool = ["ARQ", "EC", "EI", "MED", "DIR", "ECN", "LET", "HIST", "AGR", "VET"];
const anosPool = ["1", "2", "3", "4", "5", "6"];
const turmasPool = ["A", "B", "C", "D", "E"];

const initialSeed: Discente[] = [];


export default function AdminDiscentes() {
  const [rows, setRows] = useState<Discente[]>(initialSeed);
  const [q, setQ] = useState("");

  const update = (id: string, patch: Partial<Discente>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));
  const add = () => setRows((prev) => [...prev, { id: `${Date.now()}`, primeiroNome: "", ultimoNome: "", email: "", curso: "ARQ", ano: "1", turma: "A", estado: "Ativo", editing: true }]);

  const filtered = useMemo(() => rows.filter((r) => [r.primeiroNome, r.ultimoNome, r.email, r.curso].some((v) => v.toLowerCase().includes(q.toLowerCase()))), [rows, q]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader title="Discentes" subtitle="Todos os estudantes registados na instituição" icon={<Users className="w-5 h-5 text-primary" />} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold tabular-nums">{rows.length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Ativos</p><p className="text-2xl font-bold tabular-nums text-emerald-600">{rows.filter((r) => r.estado === "Ativo").length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Cursos</p><p className="text-2xl font-bold tabular-nums">{new Set(rows.map((r) => r.curso)).size}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Turmas</p><p className="text-2xl font-bold tabular-nums">{new Set(rows.map((r) => `${r.curso}-${r.ano}${r.turma}`)).size}</p></div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Procurar discente..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" />
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">{filtered.length} de {rows.length}</div>
        <Button size="sm" onClick={add} className="ml-auto gap-1"><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
      </div>

      <div className="space-y-2">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-card p-3 flex items-center gap-3 flex-wrap">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-[240px] grid grid-cols-2 md:grid-cols-6 gap-2 items-center">
              {r.editing ? (
                <>
                  <Input value={r.primeiroNome} onChange={(e) => update(r.id, { primeiroNome: e.target.value })} placeholder="Primeiro nome" className="h-8 text-xs" />
                  <Input value={r.ultimoNome} onChange={(e) => update(r.id, { ultimoNome: e.target.value })} placeholder="Último nome" className="h-8 text-xs" />
                  <Input value={r.email} onChange={(e) => update(r.id, { email: e.target.value })} placeholder="email@upra.kor" className="h-8 text-xs md:col-span-2" />
                  <Select value={r.curso} onValueChange={(v) => update(r.id, { curso: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{cursosPool.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <Select value={r.ano} onValueChange={(v) => update(r.id, { ano: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{anosPool.map((a) => <SelectItem key={a} value={a}>{a}º</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={r.turma} onValueChange={(v) => update(r.id, { turma: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{turmasPool.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold md:col-span-2 truncate">{r.primeiroNome} {r.ultimoNome}</p>
                  <p className="text-xs text-muted-foreground truncate md:col-span-2">{r.email}</p>
                  <p className="text-xs font-mono">{r.curso}</p>
                  <p className="text-xs tabular-nums">{r.ano}º · {r.turma}</p>
                </>
              )}
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${r.estado === "Ativo" ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{r.estado}</span>
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

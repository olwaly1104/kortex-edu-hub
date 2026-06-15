import { FinHeader } from "@/pages/financas/_FinHeader";
import { UserCog, Lock, Pencil, Check, Plus, Search, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";

type StaffRow = {
  id: string; prefixo: string; primeiroNome: string; ultimoNome: string;
  email: string; contacto: string; departamento: string; funcao: string; moduloKortex: string; editing?: boolean;
};

const prefixosPool = ["Sr.", "Sra.", "Dr.", "Dra.", "Prof.", "Eng.", "Me."];
const departamentosPool = ["Académica", "Finanças", "GAP", "TI", "Recursos Humanos", "Manutenção"];
const funcoesPool = ["Assistente", "Coordenador", "Técnico", "Auxiliar", "Diretor"];
const modulosKortexPool = ["Não", "Estudante", "Professor", "Coordenador", "Decano", "Reitor", "Finanças", "Académica", "GAP", "Inscrições", "Administrador"];

const initialSeed: StaffRow[] = [
  { id: "s1", prefixo: "Sra.", primeiroNome: "Joana",   ultimoNome: "Pinto",   email: "joana.pinto@upra.kor",   contacto: "+244 923 100 001", departamento: "Académica",        funcao: "Coordenador", moduloKortex: "Académica" },
  { id: "s2", prefixo: "Sr.",  primeiroNome: "Rui",     ultimoNome: "Tavares", email: "rui.tavares@upra.kor",   contacto: "+244 923 100 002", departamento: "TI",               funcao: "Técnico",     moduloKortex: "Administrador" },
  { id: "s3", prefixo: "Dra.", primeiroNome: "Mariana", ultimoNome: "Sousa",   email: "mariana.sousa@upra.kor", contacto: "+244 923 100 003", departamento: "Finanças",         funcao: "Diretor",     moduloKortex: "Finanças" },
  { id: "s4", prefixo: "Sr.",  primeiroNome: "Paulo",   ultimoNome: "Neto",    email: "paulo.neto@upra.kor",    contacto: "+244 923 100 004", departamento: "GAP",              funcao: "Assistente",  moduloKortex: "GAP" },
  { id: "s5", prefixo: "Sra.", primeiroNome: "Helena",  ultimoNome: "Vaz",     email: "helena.vaz@upra.kor",    contacto: "+244 923 100 005", departamento: "Recursos Humanos", funcao: "Coordenador", moduloKortex: "Não" },
  { id: "s6", prefixo: "Sr.",  primeiroNome: "Tiago",   ultimoNome: "Lopes",   email: "tiago.lopes@upra.kor",   contacto: "+244 923 100 006", departamento: "Manutenção",       funcao: "Auxiliar",    moduloKortex: "Não" },
];

export default function AdminStaff() {
  const [rows, setRows] = useState<StaffRow[]>(initialSeed);
  const [q, setQ] = useState("");

  const update = (id: string, patch: Partial<StaffRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));
  const add = () => setRows((prev) => [...prev, { id: `${Date.now()}`, prefixo: "Sr.", primeiroNome: "", ultimoNome: "", email: "", contacto: "", departamento: "Académica", funcao: "Assistente", moduloKortex: "Não", editing: true }]);

  const filtered = useMemo(() => rows.filter((r) =>
    [r.primeiroNome, r.ultimoNome, r.email, r.departamento, r.funcao].some((v) => v.toLowerCase().includes(q.toLowerCase()))
  ), [rows, q]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader title="Staff" subtitle="Funcionários administrativos e técnicos" icon={<UserCog className="w-5 h-5 text-primary" />} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold tabular-nums">{rows.length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Departamentos</p><p className="text-2xl font-bold tabular-nums">{new Set(rows.map((r) => r.departamento)).size}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Com Kortex</p><p className="text-2xl font-bold tabular-nums">{rows.filter((r) => r.moduloKortex !== "Não").length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Sem Kortex</p><p className="text-2xl font-bold tabular-nums">{rows.filter((r) => r.moduloKortex === "Não").length}</p></div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Procurar staff..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" />
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">{filtered.length} de {rows.length}</div>
        <Button size="sm" onClick={add} className="ml-auto gap-1"><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
      </div>

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
                  <Select value={r.departamento} onValueChange={(v) => update(r.id, { departamento: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{departamentosPool.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={r.funcao} onValueChange={(v) => update(r.id, { funcao: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{funcoesPool.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={r.moduloKortex} onValueChange={(v) => update(r.id, { moduloKortex: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{modulosKortexPool.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold md:col-span-2 truncate">{r.prefixo} {r.primeiroNome} {r.ultimoNome}</p>
                  <p className="text-xs text-muted-foreground truncate md:col-span-2">{r.email}</p>
                  <p className="text-xs">{r.departamento}</p>
                  <p className="text-xs text-muted-foreground">{r.funcao}</p>
                  <span className={`justify-self-start px-2 py-0.5 rounded-full text-[11px] font-semibold ${r.moduloKortex === "Não" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>{r.moduloKortex}</span>
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

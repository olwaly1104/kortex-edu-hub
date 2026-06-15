import { FinHeader } from "@/pages/financas/_FinHeader";
import { Users, Plus, Search, Trash2, GraduationCap, User, Mail, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { FormSection, EmptyState } from "./Staff";

type Discente = { id: string; primeiroNome: string; ultimoNome: string; email: string; curso: string; ano: string; turma: string; estado: "Ativo" | "Inativo" };

const cursosPool = ["ARQ", "EC", "EI", "MED", "DIR", "ECN", "LET", "HIST", "AGR", "VET"];
const anosPool = ["1", "2", "3", "4", "5", "6"];
const turmasPool = ["A", "B", "C", "D", "E"];

const empty = (): Discente => ({ id: "", primeiroNome: "", ultimoNome: "", email: "", curso: "ARQ", ano: "1", turma: "A", estado: "Ativo" });

export default function AdminDiscentes() {
  const [rows, setRows] = useState<Discente[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Discente>(empty());

  const setF = <K extends keyof Discente>(k: K, v: Discente[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const openNew = () => { setDraft(empty()); setOpen(true); };
  const save = () => {
    if (!draft.primeiroNome.trim() || !draft.email.trim()) return;
    setRows((p) => [...p, { ...draft, id: `${Date.now()}` }]);
    setOpen(false);
  };
  const remove = (id: string) => setRows((p) => p.filter((r) => r.id !== id));

  const filtered = useMemo(() => rows.filter((r) => [r.primeiroNome, r.ultimoNome, r.email, r.curso].some((v) => v.toLowerCase().includes(q.toLowerCase()))), [rows, q]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader title="Discentes" subtitle="Todos os estudantes registados na instituição" icon={<Users className="w-5 h-5 text-primary" />} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total" value={rows.length} />
        <Stat label="Ativos" value={rows.filter((r) => r.estado === "Ativo").length} accent />
        <Stat label="Cursos" value={new Set(rows.map((r) => r.curso)).size} />
        <Stat label="Turmas" value={new Set(rows.map((r) => `${r.curso}-${r.ano}${r.turma}`)).size} />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Procurar discente..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" />
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">{filtered.length} de {rows.length}</div>
        <Button size="sm" onClick={openNew} className="ml-auto gap-1"><Plus className="w-3.5 h-3.5" /> Adicionar Discente</Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState onAdd={openNew} icon={<GraduationCap className="w-7 h-7" />} title="Nenhum discente registado" hint="Comece por adicionar estudantes manualmente ou via inscrições." cta="Adicionar Discente" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-semibold py-2.5 px-4">Estudante</th>
                <th className="text-left font-semibold py-2.5 px-4">Email</th>
                <th className="text-left font-semibold py-2.5 px-4">Curso</th>
                <th className="text-left font-semibold py-2.5 px-4">Ano · Turma</th>
                <th className="text-left font-semibold py-2.5 px-4">Estado</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center"><GraduationCap className="w-4 h-4" /></div>
                      <span className="font-semibold">{r.primeiroNome} {r.ultimoNome}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{r.email}</td>
                  <td className="py-3 px-4 text-xs font-mono">{r.curso}</td>
                  <td className="py-3 px-4 text-xs tabular-nums">{r.ano}º · {r.turma}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${r.estado === "Ativo" ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{r.estado}</span>
                  </td>
                  <td className="py-3 px-2">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary" /> Adicionar Discente</DialogTitle>
            <DialogDescription>O estudante poderá completar os seus restantes dados pessoais ao primeiro acesso.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <FormSection icon={<User className="w-3.5 h-3.5" />} title="Identificação">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Primeiro nome</Label>
                  <Input className="h-9 mt-1" value={draft.primeiroNome} onChange={(e) => setF("primeiroNome", e.target.value)} />
                </div>
                <div><Label className="text-xs">Último nome</Label>
                  <Input className="h-9 mt-1" value={draft.ultimoNome} onChange={(e) => setF("ultimoNome", e.target.value)} />
                </div>
              </div>
            </FormSection>

            <FormSection icon={<Mail className="w-3.5 h-3.5" />} title="Acesso">
              <Label className="text-xs">Email institucional</Label>
              <Input className="h-9 mt-1" type="email" value={draft.email} onChange={(e) => setF("email", e.target.value)} placeholder="estudante@upra.kor" />
            </FormSection>

            <FormSection icon={<BookOpen className="w-3.5 h-3.5" />} title="Matrícula">
              <div className="grid grid-cols-3 gap-3">
                <div><Label className="text-xs">Curso</Label>
                  <Select value={draft.curso} onValueChange={(v) => setF("curso", v)}>
                    <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{cursosPool.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Ano</Label>
                  <Select value={draft.ano} onValueChange={(v) => setF("ano", v)}>
                    <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{anosPool.map((a) => <SelectItem key={a} value={a}>{a}º</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Turma</Label>
                  <Select value={draft.turma} onValueChange={(v) => setF("turma", v)}>
                    <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{turmasPool.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">O bilhete de identidade e restantes dados pessoais serão preenchidos pelo próprio estudante.</p>
            </FormSection>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!draft.primeiroNome.trim() || !draft.email.trim()}>Adicionar Discente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${accent ? "text-emerald-600" : ""}`}>{value}</p>
    </div>
  );
}

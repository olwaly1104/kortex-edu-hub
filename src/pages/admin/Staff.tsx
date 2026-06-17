import { FinHeader } from "@/pages/financas/_FinHeader";
import { UserCog, Plus, Search, Trash2, User, Mail, Phone, Briefcase, Building, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { loadStaff, saveStaff, type StaffRow } from "@/lib/peopleStorage";

const prefixosPool = ["Sr.", "Sra.", "Dr.", "Dra.", "Prof.", "Eng.", "Me."];
const departamentosPool = ["Académica", "Finanças", "GAP", "TI", "Recursos Humanos", "Manutenção"];
const funcoesPool = ["Assistente", "Coordenador", "Técnico", "Auxiliar", "Diretor"];
const modulosKortexPool = ["Não", "Estudante", "Professor", "Coordenador", "Decano", "Reitor", "Finanças", "Académica", "GAP", "Inscrições", "Administrador"];

const empty = (): StaffRow => ({
  id: "", prefixo: "Sr.", primeiroNome: "", ultimoNome: "", email: "", contacto: "",
  departamento: "Académica", funcao: "Assistente", moduloKortex: "Não",
});

export default function AdminStaff() {
  const [rows, setRows] = useState<StaffRow[]>(() => loadStaff());
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<StaffRow>(empty());

  useEffect(() => { saveStaff(rows); }, [rows]);

  const setDraftField = <K extends keyof StaffRow>(k: K, v: StaffRow[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const openNew = () => { setDraft(empty()); setOpen(true); };
  const save = () => {
    if (!draft.primeiroNome.trim() || !draft.email.trim()) return;
    setRows((p) => [...p, { ...draft, id: `${Date.now()}` }]);
    setOpen(false);
  };
  const remove = (id: string) => setRows((p) => p.filter((r) => r.id !== id));

  const filtered = useMemo(() => rows.filter((r) =>
    [r.primeiroNome, r.ultimoNome, r.email, r.departamento, r.funcao].some((v) => v.toLowerCase().includes(q.toLowerCase()))
  ), [rows, q]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader title="Staff" subtitle="Funcionários administrativos e técnicos" icon={<UserCog className="w-5 h-5 text-primary" />} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total" value={rows.length} />
        <Stat label="Departamentos" value={new Set(rows.map((r) => r.departamento)).size} />
        <Stat label="Com acesso" value={rows.filter((r) => r.moduloKortex !== "Não").length} />
        <Stat label="Sem acesso" value={rows.filter((r) => r.moduloKortex === "Não").length} />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Procurar staff..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" />
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">{filtered.length} de {rows.length}</div>
        <Button size="sm" onClick={openNew} className="ml-auto gap-1"><Plus className="w-3.5 h-3.5" /> Adicionar Staff</Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState onAdd={openNew} icon={<UserCog className="w-7 h-7" />} title="Nenhum staff registado" hint="Comece por adicionar funcionários administrativos." cta="Adicionar Staff" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-semibold py-2.5 px-4">Nome</th>
                <th className="text-left font-semibold py-2.5 px-4">Contacto</th>
                <th className="text-left font-semibold py-2.5 px-4">Departamento</th>
                <th className="text-left font-semibold py-2.5 px-4">Função</th>
                <th className="text-left font-semibold py-2.5 px-4">Kortex</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center"><User className="w-4 h-4" /></div>
                      <span className="font-semibold">{r.prefixo} {r.primeiroNome} {r.ultimoNome}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{r.email}{r.contacto && <span className="block">{r.contacto}</span>}</td>
                  <td className="py-3 px-4 text-xs">{r.departamento}</td>
                  <td className="py-3 px-4 text-xs">{r.funcao}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${r.moduloKortex === "Não" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>{r.moduloKortex}</span>
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
            <DialogTitle className="flex items-center gap-2"><UserCog className="w-5 h-5 text-primary" /> Adicionar Staff</DialogTitle>
            <DialogDescription>Funcionário administrativo ou técnico da instituição.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <FormSection icon={<User className="w-3.5 h-3.5" />} title="Identificação">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-3"><Label className="text-xs">Prefixo</Label>
                  <Select value={draft.prefixo} onValueChange={(v) => setDraftField("prefixo", v)}>
                    <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{prefixosPool.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-4"><Label className="text-xs">Primeiro nome</Label>
                  <Input className="h-9 mt-1" value={draft.primeiroNome} onChange={(e) => setDraftField("primeiroNome", e.target.value)} />
                </div>
                <div className="col-span-5"><Label className="text-xs">Último nome</Label>
                  <Input className="h-9 mt-1" value={draft.ultimoNome} onChange={(e) => setDraftField("ultimoNome", e.target.value)} />
                </div>
              </div>
            </FormSection>

            <FormSection icon={<Mail className="w-3.5 h-3.5" />} title="Contacto">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Email institucional</Label>
                  <Input className="h-9 mt-1" type="email" value={draft.email} onChange={(e) => setDraftField("email", e.target.value)} placeholder="nome@upra.kor" />
                </div>
                <div><Label className="text-xs">Telefone</Label>
                  <Input className="h-9 mt-1" value={draft.contacto} onChange={(e) => setDraftField("contacto", e.target.value)} placeholder="+244 ..." />
                </div>
              </div>
            </FormSection>

            <FormSection icon={<Briefcase className="w-3.5 h-3.5" />} title="Função">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Departamento</Label>
                  <Select value={draft.departamento} onValueChange={(v) => setDraftField("departamento", v)}>
                    <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{departamentosPool.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Função</Label>
                  <Select value={draft.funcao} onValueChange={(v) => setDraftField("funcao", v)}>
                    <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{funcoesPool.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </FormSection>

            <FormSection icon={<KeyRound className="w-3.5 h-3.5" />} title="Acesso ao Kortex">
              <Select value={draft.moduloKortex} onValueChange={(v) => setDraftField("moduloKortex", v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{modulosKortexPool.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1.5">Escolha "Não" caso este funcionário não necessite de aceder ao sistema.</p>
            </FormSection>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!draft.primeiroNome.trim() || !draft.email.trim()}>Adicionar Staff</Button>
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

export function FormSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span> {title}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ icon, title, hint, cta, onAdd }: { icon: React.ReactNode; title: string; hint: string; cta: string; onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">{icon}</div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground mt-1 mb-4">{hint}</p>
      <Button size="sm" onClick={onAdd} className="gap-1"><Plus className="w-3.5 h-3.5" /> {cta}</Button>
    </div>
  );
}

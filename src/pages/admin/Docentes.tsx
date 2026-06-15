import { FinHeader } from "@/pages/financas/_FinHeader";
import { GraduationCap, Plus, Search, Trash2, User, Mail, Briefcase, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { loadDocentes, saveDocentes, type DocenteRow } from "@/lib/peopleStorage";
import { FormSection, EmptyState } from "./Staff";

const prefixosPool = ["Sr.", "Sra.", "Dr.", "Dra.", "Prof.", "Eng.", "Me."];
const categoriasPool = ["Assistente", "Auxiliar", "Associado", "Catedrático", "Convidado"];
const cargosPool = ["Docente", "Coordenador", "Decano", "Diretor"];

const empty = (): DocenteRow => ({
  id: "", prefixo: "Dr.", primeiroNome: "", ultimoNome: "", email: "", contacto: "",
  faculdade: "", categoria: "Assistente", cargo: "Docente",
});

export default function AdminDocentes() {
  const [rows, setRows] = useState<DocenteRow[]>(() => loadDocentes());
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DocenteRow>(empty());

  useEffect(() => { saveDocentes(rows); }, [rows]);

  const setF = <K extends keyof DocenteRow>(k: K, v: DocenteRow[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const openNew = () => { setDraft(empty()); setOpen(true); };
  const save = () => {
    if (!draft.primeiroNome.trim() || !draft.email.trim()) return;
    setRows((p) => [...p, { ...draft, id: `${Date.now()}` }]);
    setOpen(false);
  };
  const remove = (id: string) => setRows((p) => p.filter((r) => r.id !== id));

  const filtered = useMemo(() => rows.filter((r) =>
    [r.primeiroNome, r.ultimoNome, r.email, r.faculdade, r.categoria, r.cargo].some((v) => (v || "").toLowerCase().includes(q.toLowerCase()))
  ), [rows, q]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader title="Docentes" subtitle="Corpo docente da instituição" icon={<GraduationCap className="w-5 h-5 text-primary" />} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total" value={rows.length} />
        <Stat label="Decanos" value={rows.filter((r) => r.cargo === "Decano").length} />
        <Stat label="Coordenadores" value={rows.filter((r) => r.cargo === "Coordenador").length} />
        <Stat label="Faculdades" value={new Set(rows.map((r) => r.faculdade).filter(Boolean)).size} />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Procurar docentes..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" />
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">{filtered.length} de {rows.length}</div>
        <Button size="sm" onClick={openNew} className="ml-auto gap-1"><Plus className="w-3.5 h-3.5" /> Adicionar Docente</Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState onAdd={openNew} icon={<GraduationCap className="w-7 h-7" />} title="Nenhum docente registado" hint="Adicione docentes para os atribuir como decanos e coordenadores." cta="Adicionar Docente" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-semibold py-2.5 px-4">Docente</th>
                <th className="text-left font-semibold py-2.5 px-4">Email</th>
                <th className="text-left font-semibold py-2.5 px-4">Faculdade</th>
                <th className="text-left font-semibold py-2.5 px-4">Categoria</th>
                <th className="text-left font-semibold py-2.5 px-4">Cargo</th>
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
                  <td className="py-3 px-4 text-xs text-muted-foreground">{r.email}</td>
                  <td className="py-3 px-4 text-xs">{r.faculdade || <span className="text-muted-foreground italic">—</span>}</td>
                  <td className="py-3 px-4 text-xs">{r.categoria}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">{r.cargo}</span>
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
            <DialogTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary" /> Adicionar Docente</DialogTitle>
            <DialogDescription>Registe um membro do corpo docente da instituição.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <FormSection icon={<User className="w-3.5 h-3.5" />} title="Identificação">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-3"><Label className="text-xs">Prefixo</Label>
                  <Select value={draft.prefixo} onValueChange={(v) => setF("prefixo", v)}>
                    <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{prefixosPool.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-4"><Label className="text-xs">Primeiro nome</Label>
                  <Input className="h-9 mt-1" value={draft.primeiroNome} onChange={(e) => setF("primeiroNome", e.target.value)} />
                </div>
                <div className="col-span-5"><Label className="text-xs">Último nome</Label>
                  <Input className="h-9 mt-1" value={draft.ultimoNome} onChange={(e) => setF("ultimoNome", e.target.value)} />
                </div>
              </div>
            </FormSection>

            <FormSection icon={<Mail className="w-3.5 h-3.5" />} title="Contacto">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Email institucional</Label>
                  <Input className="h-9 mt-1" type="email" value={draft.email} onChange={(e) => setF("email", e.target.value)} placeholder="nome@upra.kor" />
                </div>
                <div><Label className="text-xs">Telefone</Label>
                  <Input className="h-9 mt-1" value={draft.contacto} onChange={(e) => setF("contacto", e.target.value)} placeholder="+244 ..." />
                </div>
              </div>
            </FormSection>

            <FormSection icon={<Briefcase className="w-3.5 h-3.5" />} title="Afiliação académica">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Faculdade</Label>
                  <Input className="h-9 mt-1" value={draft.faculdade} onChange={(e) => setF("faculdade", e.target.value)} placeholder="Ex.: Ciências Exatas" />
                </div>
                <div><Label className="text-xs">Categoria</Label>
                  <Select value={draft.categoria} onValueChange={(v) => setF("categoria", v)}>
                    <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{categoriasPool.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </FormSection>

            <FormSection icon={<Award className="w-3.5 h-3.5" />} title="Cargo institucional">
              <Select value={draft.cargo} onValueChange={(v) => setF("cargo", v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{cargosPool.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1.5">Decanos e Coordenadores ficam disponíveis nas configurações de Faculdades e Cursos.</p>
            </FormSection>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!draft.primeiroNome.trim() || !draft.email.trim()}>Adicionar Docente</Button>
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

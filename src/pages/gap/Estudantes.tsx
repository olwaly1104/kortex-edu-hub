import { FinHeader } from "@/pages/financas/_FinHeader";
import { Users, Plus, Search, Trash2, GraduationCap, User, Mail, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FormSection, EmptyState } from "@/pages/admin/Staff";
import {
  useEstudantes,
  useCursos,
  useCreateEstudante,
  useDeleteEstudante,
} from "@/lib/useInstitution";
import { toast } from "sonner";

const anosPool = ["1", "2", "3", "4", "5", "6"];
const turmasPool = ["A", "B", "C", "D", "E"];

type Draft = {
  primeiroNome: string;
  ultimoNome: string;
  curso_id: string;
  ano: string;
  turma: string;
};

const EMAIL_DOMAIN = "upra.kor";
const slug = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
const buildEmail = (primeiro: string, ultimo: string) => {
  const p = slug(primeiro);
  const u = slug(ultimo);
  if (!p && !u) return "";
  return `${[p, u].filter(Boolean).join(".")}@${EMAIL_DOMAIN}`;
};

const empty = (curso_id = ""): Draft => ({
  primeiroNome: "",
  ultimoNome: "",
  curso_id,
  ano: "1",
  turma: "A",
});

export default function GapEstudantes() {
  const navigate = useNavigate();
  const { data: rows = [], isLoading } = useEstudantes();
  const { data: cursos = [] } = useCursos();
  const createMut = useCreateEstudante();
  const deleteMut = useDeleteEstudante();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(empty());

  useEffect(() => {
    if (!draft.curso_id && cursos.length > 0) {
      setDraft((d) => ({ ...d, curso_id: (cursos[0] as any).id }));
    }
  }, [cursos, draft.curso_id]);

  const cursoCode = useMemo(() => {
    const m = new Map<string, string>();
    cursos.forEach((c: any) => m.set(c.id, c.codigo || c.nome || "—"));
    return m;
  }, [cursos]);

  const setF = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const openNew = () => {
    setDraft(empty((cursos[0] as any)?.id ?? ""));
    setOpen(true);
  };

  const save = async () => {
    if (!draft.primeiroNome.trim() || !draft.curso_id) return;
    const nome = `${draft.primeiroNome.trim()} ${draft.ultimoNome.trim()}`.trim();
    const email = buildEmail(draft.primeiroNome, draft.ultimoNome);
    if (!email) { toast.error("Não foi possível gerar email a partir do nome"); return; }
    try {
      await createMut.mutateAsync({
        curso_id: draft.curso_id,
        nome,
        email,
        ano: draft.ano,
        turma: draft.turma,
        primeiro_nome: draft.primeiroNome.trim(),
        ultimo_nome: draft.ultimoNome.trim() || null,
      });
      toast.success(`Discente adicionado · ${email}`);
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao adicionar discente");
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Discente removido");
    } catch (e: any) {
      toast.error(e?.message || "Erro ao remover");
    }
  };

  const normalized = useMemo(
    () =>
      rows.map((r: any) => {
        const parts = (r.nome || "").trim().split(/\s+/);
        return {
          id: r.id as string,
          primeiroNome: r.primeiro_nome || parts[0] || "",
          ultimoNome: r.ultimo_nome || (parts.length > 1 ? parts.slice(1).join(" ") : ""),
          email: r.email as string,
          curso: cursoCode.get(r.curso_id) || "—",
          ano: r.ano as string,
          turma: r.turma as string,
          estado: "Ativo" as const,
        };
      }),
    [rows, cursoCode],
  );

  const filtered = useMemo(
    () =>
      normalized.filter((r) =>
        [r.primeiroNome, r.ultimoNome, r.email, r.curso].some((v) =>
          String(v).toLowerCase().includes(q.toLowerCase()),
        ),
      ),
    [normalized, q],
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader
        title="Discentes"
        subtitle="Todos os estudantes registados na instituição"
        icon={<Users className="w-5 h-5 text-primary" />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total" value={normalized.length} />
        <Stat label="Ativos" value={normalized.length} accent />
        <Stat label="Cursos" value={new Set(normalized.map((r) => r.curso)).size} />
        <Stat label="Turmas" value={new Set(normalized.map((r) => `${r.curso}-${r.ano}${r.turma}`)).size} />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Procurar discente..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">
          {filtered.length} de {normalized.length}
        </div>
        <Button size="sm" onClick={openNew} className="ml-auto gap-1">
          <Plus className="w-3.5 h-3.5" /> Adicionar Discente
        </Button>
      </div>

      {isLoading ? (
        <div className="py-16 flex items-center justify-center text-sm text-muted-foreground gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> A carregar discentes…
        </div>
      ) : normalized.length === 0 ? (
        <EmptyState
          onAdd={openNew}
          icon={<GraduationCap className="w-7 h-7" />}
          title="Nenhum discente registado"
          hint="Comece por adicionar estudantes manualmente ou via inscrições."
          cta="Adicionar Discente"
        />
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
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <span className="font-semibold">
                        {r.primeiroNome} {r.ultimoNome}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{r.email}</td>
                  <td className="py-3 px-4 text-xs font-mono">{r.curso}</td>
                  <td className="py-3 px-4 text-xs tabular-nums">
                    {r.ano}º · {r.turma}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                      {r.estado}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => remove(r.id)}
                      disabled={deleteMut.isPending}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
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
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" /> Adicionar Discente
            </DialogTitle>
            <DialogDescription>
              O estudante poderá completar os seus restantes dados pessoais ao primeiro acesso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <FormSection icon={<User className="w-3.5 h-3.5" />} title="Identificação">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Primeiro nome</Label>
                  <Input
                    className="h-9 mt-1"
                    value={draft.primeiroNome}
                    onChange={(e) => setF("primeiroNome", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Último nome</Label>
                  <Input
                    className="h-9 mt-1"
                    value={draft.ultimoNome}
                    onChange={(e) => setF("ultimoNome", e.target.value)}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection icon={<Mail className="w-3.5 h-3.5" />} title="Acesso">
              <Label className="text-xs">Email institucional (gerado automaticamente)</Label>
              <div className="h-9 mt-1 px-3 flex items-center text-xs font-mono text-muted-foreground bg-muted/40 border border-input rounded-md truncate">
                {buildEmail(draft.primeiroNome, draft.ultimoNome) || `nome@${EMAIL_DOMAIN}`}
              </div>
            </FormSection>

            <FormSection icon={<BookOpen className="w-3.5 h-3.5" />} title="Matrícula">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Curso</Label>
                  <Select value={draft.curso_id} onValueChange={(v) => setF("curso_id", v)}>
                    <SelectTrigger className="h-9 mt-1">
                      <SelectValue placeholder="Selecionar…" />
                    </SelectTrigger>
                    <SelectContent>
                      {cursos.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.codigo || c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Ano</Label>
                  <Select value={draft.ano} onValueChange={(v) => setF("ano", v)}>
                    <SelectTrigger className="h-9 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {anosPool.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}º
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Turma</Label>
                  <Select value={draft.turma} onValueChange={(v) => setF("turma", v)}>
                    <SelectTrigger className="h-9 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {turmasPool.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                O bilhete de identidade e restantes dados pessoais serão preenchidos pelo próprio estudante.
              </p>
            </FormSection>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={createMut.isPending}>
              Cancelar
            </Button>
            <Button
              onClick={save}
              disabled={
                !draft.primeiroNome.trim() ||
                !draft.curso_id ||
                createMut.isPending
              }
            >
              {createMut.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> A adicionar…
                </>
              ) : (
                "Adicionar Discente"
              )}
            </Button>
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

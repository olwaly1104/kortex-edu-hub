import { useEffect, useMemo, useState } from "react";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Plus, Trash2, Users, BookOpen, Layers, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useEstudantes,
  useCursos,
  useCreateEstudante,
  useDeleteEstudante,
} from "@/lib/useInstitution";

type Draft = {
  primeiroNome: string;
  ultimoNome: string;
  curso_id: string;
  ano: string;
  turma: string;
};

const anosPool = ["1", "2", "3", "4", "5", "6"];
const turmasPool = ["A", "B", "C", "D", "E"];
const EMAIL_DOMAIN = "upra.kor";

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();

const buildEmail = (primeiro: string, ultimo: string) => {
  const p = slug(primeiro);
  const u = slug(ultimo);
  if (!p && !u) return "";
  return `${[p, u].filter(Boolean).join(".")}@${EMAIL_DOMAIN}`;
};

const emptyDraft = (curso_id = ""): Draft => ({
  primeiroNome: "",
  ultimoNome: "",
  curso_id,
  ano: "1",
  turma: "A",
});

export default function AdminDiscentes() {
  const { data: rows = [], isLoading } = useEstudantes();
  const { data: cursos = [] } = useCursos();
  const createMut = useCreateEstudante();
  const deleteMut = useDeleteEstudante();

  const [filtroCurso, setFiltroCurso] = useState<string>("all");
  const [draft, setDraft] = useState<Draft>(emptyDraft());

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

  const normalized = useMemo(
    () =>
      rows.map((r: any) => {
        const parts = (r.nome || "").trim().split(/\s+/);
        return {
          id: r.id as string,
          primeiroNome: r.primeiro_nome || parts[0] || "",
          ultimoNome: r.ultimo_nome || (parts.length > 1 ? parts.slice(1).join(" ") : ""),
          email: r.email as string,
          curso_id: r.curso_id as string,
          curso: cursoCode.get(r.curso_id) || "—",
          ano: r.ano as string,
          turma: r.turma as string,
        };
      }),
    [rows, cursoCode],
  );

  const filtered = useMemo(
    () => normalized.filter((r) => filtroCurso === "all" || r.curso_id === filtroCurso),
    [normalized, filtroCurso],
  );

  const counts = useMemo(
    () => ({
      total: normalized.length,
      cursos: new Set(normalized.map((r) => r.curso_id)).size,
      turmas: new Set(normalized.map((r) => `${r.curso_id}-${r.ano}${r.turma}`)).size,
    }),
    [normalized],
  );

  const setF = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const addRow = async () => {
    if (!draft.primeiroNome.trim() || !draft.email.trim() || !draft.curso_id) {
      toast.error("Preencha nome, email e curso");
      return;
    }
    const nome = `${draft.primeiroNome.trim()} ${draft.ultimoNome.trim()}`.trim();
    try {
      await createMut.mutateAsync({
        curso_id: draft.curso_id,
        nome,
        email: draft.email.trim(),
        ano: draft.ano,
        turma: draft.turma,
        primeiro_nome: draft.primeiroNome.trim(),
        ultimo_nome: draft.ultimoNome.trim() || null,
      });
      toast.success("Discente adicionado");
      setDraft(emptyDraft(draft.curso_id));
    } catch (e: any) {
      toast.error(e?.message || "Erro ao adicionar discente");
    }
  };

  const removeRow = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Discente removido");
    } catch (e: any) {
      toast.error(e?.message || "Erro ao remover");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <OnboardingStepBanner stepKey="dis.reg" />

      <div className="flex items-center gap-3 pb-1">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">Discentes</h1>
          <p className="text-xs text-muted-foreground">Registe todos os estudantes da instituição. Cada discente recebe acesso ao Kortex automaticamente.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "Total", value: counts.total, Icon: Users },
          { label: "Ativos", value: counts.total, Icon: GraduationCap },
          { label: "Cursos", value: counts.cursos, Icon: BookOpen },
          { label: "Turmas", value: counts.turmas, Icon: Layers },
        ].map((k) => (
          <Card key={k.label} className="p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-muted text-foreground flex items-center justify-center">
              <k.Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">{k.label}</p>
              <p className="text-base font-semibold leading-none">{k.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={filtroCurso} onValueChange={setFiltroCurso}>
          <SelectTrigger className="h-8 text-xs w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cursos</SelectItem>
            {cursos.map((c: any) => (
              <SelectItem key={c.id} value={c.id}>{c.codigo || c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-[11px] text-muted-foreground ml-auto">{filtered.length} discentes</span>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1.2fr_1fr_1.6fr_90px_70px_70px_56px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
          <span>Primeiro nome</span>
          <span>Último nome</span>
          <span>Email institucional</span>
          <span>Curso</span>
          <span>Ano</span>
          <span>Turma</span>
          <span></span>
        </div>

        <div className="divide-y">
          {isLoading ? (
            <p className="px-4 py-8 text-xs text-muted-foreground italic text-center flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> A carregar…
            </p>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-8 text-xs text-muted-foreground italic text-center">Sem discentes registados.</p>
          ) : (
            filtered.map((r) => (
              <div key={r.id} className="grid grid-cols-[1.2fr_1fr_1.6fr_90px_70px_70px_56px] gap-2 px-4 py-2 items-center">
                <span className="text-xs font-medium truncate">{r.primeiroNome}</span>
                <span className="text-xs truncate">{r.ultimoNome || "—"}</span>
                <span className="text-xs text-muted-foreground truncate">{r.email}</span>
                <span className="text-xs font-mono">{r.curso}</span>
                <span className="text-xs tabular-nums">{r.ano}º</span>
                <span className="text-xs tabular-nums">{r.turma}</span>
                <div className="flex justify-end">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeRow(r.id)}
                    disabled={deleteMut.isPending}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Inline add row */}
        <div className="border-t bg-muted/10 px-4 py-2.5 space-y-2">
          <div className="grid grid-cols-[1.2fr_1fr_1.6fr_90px_70px_70px_56px] gap-2 items-center">
            <Input
              value={draft.primeiroNome}
              onChange={(e) => setF("primeiroNome", e.target.value)}
              placeholder="Primeiro nome"
              className="h-8 text-xs"
            />
            <Input
              value={draft.ultimoNome}
              onChange={(e) => setF("ultimoNome", e.target.value)}
              placeholder="Último nome"
              className="h-8 text-xs"
            />
            <Input
              type="email"
              value={draft.email}
              onChange={(e) => setF("email", e.target.value)}
              placeholder="estudante@upra.kor"
              className="h-8 text-xs"
            />
            <Select value={draft.curso_id} onValueChange={(v) => setF("curso_id", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {cursos.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.codigo || c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={draft.ano} onValueChange={(v) => setF("ano", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{anosPool.map((a) => <SelectItem key={a} value={a}>{a}º</SelectItem>)}</SelectContent>
            </Select>
            <Select value={draft.turma} onValueChange={(v) => setF("turma", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{turmasPool.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <div />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={addRow}
            disabled={createMut.isPending}
            className="h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/5"
          >
            {createMut.isPending ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> A adicionar…</>
            ) : (
              <><Plus className="w-3.5 h-3.5" /> Adicionar discente</>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

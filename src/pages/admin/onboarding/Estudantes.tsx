import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, UserPlus, Users, GraduationCap, CheckCircle2, Mail, Loader2 } from "lucide-react";
import { RowLockControls, CardLockBadge } from "@/components/admin/RowLockControls";
import { toast } from "sonner";
import {
  useCursos,
  useEstudantes,
  useCreateEstudante,
  useBulkCreateEstudantes,
  useDeleteEstudante,
  type EstudanteInput,
} from "@/lib/useInstitution";

const turmasPool = ["A", "B", "C", "D", "E"];
const provincias = ["Luanda", "Benguela", "Huíla", "Huambo", "Cabinda", "Namibe", "Uíge", "Bié"];

const emptyNovo = {
  primeiroNome: "", ultimoNome: "", nascimento: "", genero: "", nacionalidade: "Angolana",
  bilhete: "", telemovel: "", provincia: "", municipio: "", endereco: "",
  encNome: "", encParentesco: "", encTelefone: "",
  curso_id: "", ano: "1", turma: "A",
};

function generateEmail(nomeCompleto: string) {
  return `${nomeCompleto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, ".")
    .replace(/[^a-z.]/g, "")}@upra.kor`;
}

// Minimal CSV parser. Expected headers: nome,email,curso,ano,turma
// `curso` matches against cursos.code or cursos.name.
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(/[,;]/).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(/[,;]/).map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cells[i] ?? ""; });
    return row;
  });
}

export default function OnboardingEstudantes() {
  const [params] = useSearchParams();
  const initialTab = params.get("tab") === "manual" ? "manual" : "importar";

  const { data: cursos = [], isLoading: loadingCursos } = useCursos();
  const { data: rows = [], isLoading: loadingRows } = useEstudantes();
  const createOne = useCreateEstudante();
  const createBulk = useBulkCreateEstudantes();
  const removeOne = useDeleteEstudante();

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [novo, setNovo] = useState(() => ({ ...emptyNovo }));
  const [cardEdit, setCardEdit] = useState(false);

  const cursoById = useMemo(() => {
    const m = new Map<string, { code: string; name: string }>();
    cursos.forEach((c) => m.set(c.id, { code: c.code, name: c.name }));
    return m;
  }, [cursos]);

  const totals = useMemo(() => ({
    total: rows.length,
    cursos: new Set(rows.map((r) => r.curso_id)).size,
  }), [rows]);

  const remove = (id: string) => {
    removeOne.mutate(id, {
      onSuccess: () => toast.success("Estudante removido"),
      onError: (e: any) => toast.error(e?.message ?? "Erro ao remover"),
    });
  };

  const confirmarAdicao = () => {
    if (!novo.primeiroNome.trim() || !novo.ultimoNome.trim() || !novo.nascimento || !novo.bilhete.trim()) {
      toast.error("Preencha nome, data de nascimento e bilhete de identidade");
      return;
    }
    if (!novo.curso_id) {
      toast.error("Seleccione o curso");
      return;
    }
    const nomeCompleto = `${novo.primeiroNome.trim()} ${novo.ultimoNome.trim()}`;
    const emailGerado = generateEmail(nomeCompleto);
    const payload: EstudanteInput = {
      curso_id: novo.curso_id,
      nome: nomeCompleto,
      email: emailGerado,
      ano: novo.ano,
      turma: novo.turma,
      origem: "novo",
      primeiro_nome: novo.primeiroNome.trim(),
      ultimo_nome: novo.ultimoNome.trim(),
      nascimento: novo.nascimento || null,
      genero: novo.genero || null,
      nacionalidade: novo.nacionalidade || null,
      bilhete: novo.bilhete.trim() || null,
      telemovel: novo.telemovel || null,
      provincia: novo.provincia || null,
      municipio: novo.municipio || null,
      endereco: novo.endereco || null,
      enc_nome: novo.encNome || null,
      enc_parentesco: novo.encParentesco || null,
      enc_telefone: novo.encTelefone || null,
    };
    createOne.mutate(payload, {
      onSuccess: () => {
        setNovo({ ...emptyNovo, curso_id: novo.curso_id });
        toast.success(`Estudante adicionado. Email institucional: ${emailGerado}`);
      },
      onError: (e: any) => toast.error(e?.message ?? "Erro ao adicionar estudante"),
    });
  };

  const handleFile = async (file: File) => {
    if (cursos.length === 0) {
      toast.error("Crie cursos antes de importar estudantes");
      return;
    }
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        toast.error("Ficheiro vazio ou sem cabeçalho válido");
        return;
      }
      const inputs: EstudanteInput[] = [];
      const skipped: string[] = [];
      for (const r of parsed) {
        const nome = (r["nome"] || r["name"] || "").trim();
        if (!nome) continue;
        const cursoKey = (r["curso"] || r["course"] || "").trim().toLowerCase();
        const curso = cursos.find(
          (c) => c.code.toLowerCase() === cursoKey || c.name.toLowerCase() === cursoKey,
        );
        if (!curso) { skipped.push(nome); continue; }
        const email = (r["email"] || generateEmail(nome)).trim();
        inputs.push({
          curso_id: curso.id,
          nome,
          email,
          ano: (r["ano"] || "1").trim(),
          turma: (r["turma"] || "A").trim().toUpperCase(),
          origem: "importado",
        });
      }
      if (inputs.length === 0) {
        toast.error("Nenhum estudante válido encontrado no ficheiro");
        return;
      }
      createBulk.mutate(inputs, {
        onSuccess: (data) => {
          toast.success(`${data.length} estudantes importados${skipped.length ? ` · ${skipped.length} ignorados (curso inválido)` : ""}`);
        },
        onError: (e: any) => toast.error(e?.message ?? "Erro ao importar"),
      });
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao ler ficheiro");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <OnboardingStepBanner />

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Users className="w-3.5 h-3.5" /><p className="text-xs">Estudantes</p></div><p className="text-2xl font-bold">{totals.total}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><GraduationCap className="w-3.5 h-3.5" /><p className="text-xs">Cursos</p></div><p className="text-2xl font-bold">{totals.cursos}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><CheckCircle2 className="w-3.5 h-3.5" /><p className="text-xs">Activos</p></div><p className="text-2xl font-bold text-emerald-600">{totals.total}</p></Card>
      </div>

      <Tabs defaultValue={initialTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="importar" className="gap-1.5"><Upload className="w-3.5 h-3.5" /> Importar</TabsTrigger>
          <TabsTrigger value="manual" className="gap-1.5"><UserPlus className="w-3.5 h-3.5" /> Adicionar manualmente</TabsTrigger>
        </TabsList>

        <TabsContent value="importar" className="mt-0">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold">Importação em lote</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Carregue um ficheiro CSV com as colunas <span className="font-mono">nome,email,curso,ano,turma</span>. O email institucional é gerado automaticamente quando omitido. O curso deve corresponder ao código ou nome existente.
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <Button
                onClick={() => fileRef.current?.click()}
                variant="outline"
                size="sm"
                className="gap-2 shrink-0"
                disabled={createBulk.isPending}
              >
                {createBulk.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Carregar ficheiro
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-0">
          <Card className="p-5 space-y-5">
            <div>
              <h2 className="text-sm font-semibold">Adicionar manualmente</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3 h-3" /> Todo o estudante registado recebe automaticamente email <span className="font-semibold">@upra.kor</span> e conta de utilizador no Kortex.
              </p>
            </div>

            <div className="space-y-4">
              <section className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Identificação</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">Primeiro nome *</Label><Input className="h-9" value={novo.primeiroNome} onChange={e => setNovo({ ...novo, primeiroNome: e.target.value })} /></div>
                  <div><Label className="text-xs">Último nome *</Label><Input className="h-9" value={novo.ultimoNome} onChange={e => setNovo({ ...novo, ultimoNome: e.target.value })} /></div>
                  <div><Label className="text-xs">Data de nascimento *</Label><Input type="date" className="h-9" value={novo.nascimento} onChange={e => setNovo({ ...novo, nascimento: e.target.value })} /></div>
                  <div><Label className="text-xs">Género</Label>
                    <Select value={novo.genero} onValueChange={v => setNovo({ ...novo, genero: v })}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent><SelectItem value="M">Masculino</SelectItem><SelectItem value="F">Feminino</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Bilhete de identidade *</Label><Input className="h-9" value={novo.bilhete} onChange={e => setNovo({ ...novo, bilhete: e.target.value })} /></div>
                  <div><Label className="text-xs">Nacionalidade</Label><Input className="h-9" value={novo.nacionalidade} onChange={e => setNovo({ ...novo, nacionalidade: e.target.value })} /></div>
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contacto e morada</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">Telemóvel</Label><Input className="h-9" value={novo.telemovel} onChange={e => setNovo({ ...novo, telemovel: e.target.value })} /></div>
                  <div><Label className="text-xs">Província</Label>
                    <Select value={novo.provincia} onValueChange={v => setNovo({ ...novo, provincia: v })}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{provincias.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Município</Label><Input className="h-9" value={novo.municipio} onChange={e => setNovo({ ...novo, municipio: e.target.value })} /></div>
                  <div><Label className="text-xs">Endereço</Label><Input className="h-9" value={novo.endereco} onChange={e => setNovo({ ...novo, endereco: e.target.value })} /></div>
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Encarregado</p>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label className="text-xs">Nome</Label><Input className="h-9" value={novo.encNome} onChange={e => setNovo({ ...novo, encNome: e.target.value })} /></div>
                  <div><Label className="text-xs">Parentesco</Label><Input className="h-9" value={novo.encParentesco} onChange={e => setNovo({ ...novo, encParentesco: e.target.value })} /></div>
                  <div><Label className="text-xs">Telefone</Label><Input className="h-9" value={novo.encTelefone} onChange={e => setNovo({ ...novo, encTelefone: e.target.value })} /></div>
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Matrícula</p>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label className="text-xs">Curso *</Label>
                    <Select value={novo.curso_id} onValueChange={v => setNovo({ ...novo, curso_id: v })}>
                      <SelectTrigger className="h-9"><SelectValue placeholder={loadingCursos ? "A carregar…" : (cursos.length === 0 ? "Crie cursos primeiro" : "Selecione")} /></SelectTrigger>
                      <SelectContent>{cursos.map(c => <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Ano</Label>
                    <Select value={novo.ano} onValueChange={v => setNovo({ ...novo, ano: v })}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{["1","2","3","4","5"].map(a => <SelectItem key={a} value={a}>{a}º ano</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Turma</Label>
                    <Select value={novo.turma} onValueChange={v => setNovo({ ...novo, turma: v })}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{turmasPool.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </section>
            </div>

            <div className="flex justify-end">
              <Button onClick={confirmarAdicao} className="gap-1.5" disabled={createOne.isPending}>
                {createOne.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Adicionar estudante
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="overflow-hidden relative">
        <CardLockBadge editing={cardEdit} onEdit={() => setCardEdit(true)} onConfirm={() => setCardEdit(false)} />

        <div className="px-4 py-2.5 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">Estudantes registados</h3>
          <span className="text-xs text-muted-foreground">{rows.length} {rows.length === 1 ? "estudante" : "estudantes"}</span>
        </div>
        <div className="grid grid-cols-[1fr_1.4fr_80px_60px_70px_200px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
          <span>Nome</span><span>Email</span><span>Curso</span><span>Ano</span><span>Turma</span><span className="text-right">Ações</span>
        </div>
        <div className="divide-y">
          {rows.map(r => {
            const isEdit = cardEdit;
            return (
            <div key={r.id} className="grid grid-cols-[1fr_1.4fr_80px_60px_70px_200px] gap-2 px-4 py-2 items-center text-xs">
              <span className="font-medium">{r.nome}</span>
              <span className="text-muted-foreground truncate">{r.email}</span>
              <Badge variant="outline" className="text-[10px] justify-center">{cursoById.get(r.curso_id)?.code ?? "—"}</Badge>
              <span>{r.ano}º</span>
              <span>{r.turma}</span>
              <RowLockControls editing={isEdit} onDelete={() => remove(r.id)} />
            </div>
            );
          })}
          {rows.length === 0 && !loadingRows && (
            <p className="px-4 py-8 text-xs text-muted-foreground italic text-center">Sem estudantes. Use os separadores acima para começar.</p>
          )}
          {loadingRows && (
            <p className="px-4 py-8 text-xs text-muted-foreground italic text-center">A carregar…</p>
          )}
        </div>
      </Card>
    </div>
  );
}

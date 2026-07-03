import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Upload, FileSpreadsheet, X, Check, AlertCircle,
  Trash2, Loader2, Sparkles, ArrowRight, UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useCursos, useFaculdades, useCreateEstudante } from "@/lib/useInstitution";

/* ---------------- CSV utils ---------------- */

const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQ = false;
  const t = text.replace(/\r\n?/g, "\n");
  // auto-detect delimiter
  const firstLine = t.split("\n", 1)[0] || "";
  const delim = (firstLine.match(/;/g)?.length || 0) > (firstLine.match(/,/g)?.length || 0) ? ";" : ",";
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inQ) {
      if (c === '"' && t[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === delim) { cur.push(field); field = ""; }
      else if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
      else field += c;
    }
  }
  if (field.length > 0 || cur.length > 0) { cur.push(field); rows.push(cur); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
};

const norm = (s: string) =>
  (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");

const HEADER_MAP: Record<string, string> = {
  nome: "nome_completo", nomecompleto: "nome_completo", fullname: "nome_completo", name: "nome_completo",
  primeironome: "primeiro_nome", primeiro: "primeiro_nome", firstname: "primeiro_nome",
  ultimonome: "ultimo_nome", apelido: "ultimo_nome", ultimo: "ultimo_nome", lastname: "ultimo_nome", sobrenome: "ultimo_nome",
  faculdade: "faculdade", faculty: "faculdade", sigla: "faculdade",
  curso: "curso", nomedocurso: "curso", nomecurso: "curso", codigo: "curso", codigocurso: "curso", coursecode: "curso", coursename: "curso",
  ano: "ano", year: "ano",
  turma: "turma", class: "turma",
  nascimento: "nascimento", datanascimento: "nascimento", birthdate: "nascimento",
  genero: "genero", sexo: "genero", gender: "genero",
  regime: "regime",
  telemovel: "telemovel", telefone: "telemovel", phone: "telemovel", contacto: "telemovel",
  bilhete: "bilhete", bi: "bilhete", idcard: "bilhete",
  provincia: "provincia", province: "provincia",
  municipio: "municipio",
  endereco: "endereco", morada: "endereco", address: "endereco",
};

const FIELDS = ["nome_completo","primeiro_nome","ultimo_nome","faculdade","curso","ano","turma","nascimento","genero","regime","telemovel","bilhete","provincia","municipio","endereco"] as const;
type Field = typeof FIELDS[number];

const splitName = (full: string): [string, string] => {
  const parts = (full || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return ["", ""];
  if (parts.length === 1) return [parts[0], ""];
  return [parts[0], parts.slice(1).join(" ")];
};

type Row = {
  _key: string;
  _selected: boolean;
  primeiro_nome: string;
  ultimo_nome: string;
  faculdade_id: string;   // resolved id
  curso_id: string;       // resolved id
  ano: string;
  turma: string;
  nascimento: string;
  genero: "M" | "F" | "Outro" | "";
  regime: "normal" | "bolseiro" | "";
  telemovel: string;
  bilhete: string;
  provincia: string;
  municipio: string;
  endereco: string;
};

const emptyRow = (): Row => ({
  _key: Math.random().toString(36).slice(2),
  _selected: true,
  primeiro_nome: "", ultimo_nome: "", faculdade_id: "", curso_id: "",
  ano: "", turma: "A", nascimento: "", genero: "", regime: "",
  telemovel: "", bilhete: "", provincia: "", municipio: "", endereco: "",
});

const RECOGNIZED_COLS = ["nome","faculdade","curso","ano","turma","genero","regime","telemovel","bilhete","nascimento","provincia","municipio","endereco"];

/* ---------------- component ---------------- */

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImported?: () => void;
  onSwitchToManual?: () => void;
};

export function DiscentesCsvImport({ open, onOpenChange, onImported, onSwitchToManual }: Props) {
  const { data: cursos = [] } = useCursos();
  const { data: faculdades = [] } = useFaculdades();
  const createMut = useCreateEstudante();

  const [stage, setStage] = useState<"upload" | "preview">("upload");
  const [rows, setRows] = useState<Row[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const resetAll = () => {
    setStage("upload"); setRows([]); setImporting(false); setProgress({ done: 0, total: 0 });
    if (fileRef.current) fileRef.current.value = "";
  };

  const close = () => { resetAll(); onOpenChange(false); };

  /* resolve faculdade/curso from free-text using sigla/code/name */
  const resolveFaculdade = (raw: string) => {
    const n = norm(raw);
    if (!n) return "";
    return (
      faculdades.find((f: any) => norm(f.sigla || "") === n)?.id ||
      faculdades.find((f: any) => norm(f.name || "") === n)?.id ||
      faculdades.find((f: any) => norm(f.name || "").startsWith(n))?.id || ""
    );
  };
  const resolveCurso = (raw: string, facId: string) => {
    const n = norm(raw);
    if (!n) return "";
    const pool = facId ? cursos.filter((c: any) => c.faculdade_id === facId) : cursos;
    // exact code / name → startsWith → contains either direction
    return (
      pool.find((c: any) => norm(c.code || "") === n)?.id ||
      pool.find((c: any) => norm(c.name || "") === n)?.id ||
      pool.find((c: any) => norm(c.code || "").startsWith(n) || n.startsWith(norm(c.code || "")))?.id ||
      pool.find((c: any) => norm(c.name || "").startsWith(n) || n.startsWith(norm(c.name || "")))?.id ||
      pool.find((c: any) => {
        const cn = norm(c.name || ""); const cc = norm(c.code || "");
        return (cn && (cn.includes(n) || n.includes(cn))) || (cc && (cc.includes(n) || n.includes(cc)));
      })?.id || ""
    );
  };

  const ingestText = (text: string) => {
    const table = parseCsv(text);
    if (!table.length) { toast.error("CSV vazio"); return; }
    const headers = table[0].map(norm);
    const mapping: (Field | null)[] = headers.map((h) => (HEADER_MAP[h] as Field) || (FIELDS.includes(h as Field) ? (h as Field) : null));

    const parsed: Row[] = table.slice(1).map((cells) => {
      const r = emptyRow();
      const facRaw = cells[mapping.indexOf("faculdade")] || "";
      const cursoRaw = cells[mapping.indexOf("curso")] || "";
      const nomeCompletoRaw = cells[mapping.indexOf("nome_completo")] || "";
      mapping.forEach((f, idx) => {
        if (!f) return;
        const val = (cells[idx] || "").trim();
        if (f === "faculdade" || f === "curso" || f === "nome_completo") return; // handled below
        if (f === "genero") {
          const g = val.toUpperCase();
          r.genero = g.startsWith("M") ? "M" : g.startsWith("F") ? "F" : g ? "Outro" : "";
        } else if (f === "regime") {
          const v = val.toLowerCase();
          r.regime = v.startsWith("b") ? "bolseiro" : v ? "normal" : "";
        } else {
          (r as any)[f] = val;
        }
      });
      // Smart name extraction: prefer nome_completo, else use primeiro_nome as source if it contains spaces
      if (nomeCompletoRaw.trim()) {
        const [first, last] = splitName(nomeCompletoRaw);
        r.primeiro_nome = first;
        r.ultimo_nome = last || r.ultimo_nome;
      } else if (!r.ultimo_nome && r.primeiro_nome && /\s/.test(r.primeiro_nome)) {
        const [first, last] = splitName(r.primeiro_nome);
        r.primeiro_nome = first;
        r.ultimo_nome = last;
      }
      const facId = resolveFaculdade(facRaw);
      r.faculdade_id = facId;
      r.curso_id = resolveCurso(cursoRaw, facId);
      if (!r.turma) r.turma = "A";
      if (!r.regime) r.regime = "normal";
      return r;
    });
    setRows(parsed);
    setStage("preview");
  };

  const onFile = async (f: File | null) => {
    if (!f) return;
    if (!/\.(csv|txt)$/i.test(f.name)) { toast.error("Ficheiro deve ser .csv"); return; }
    const text = await f.text();
    ingestText(text);
  };


  /* validation */
  const validate = (r: Row): string[] => {
    const errs: string[] = [];
    if (!r.primeiro_nome.trim()) errs.push("Primeiro nome");
    if (!r.ultimo_nome.trim()) errs.push("Último nome");
    if (!r.faculdade_id) errs.push("Faculdade");
    if (!r.curso_id) errs.push("Curso");
    if (!r.ano) errs.push("Ano");
    return errs;
  };

  const stats = useMemo(() => {
    let valid = 0, invalid = 0, selected = 0;
    rows.forEach((r) => {
      if (r._selected) selected++;
      if (validate(r).length === 0) valid++; else invalid++;
    });
    return { valid, invalid, selected, total: rows.length };
  }, [rows]);

  const selectedValidCount = useMemo(
    () => rows.filter((r) => r._selected && validate(r).length === 0).length,
    [rows],
  );

  const setCell = (key: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r._key === key ? { ...r, ...patch } : r)));

  const removeRow = (key: string) => setRows((rs) => rs.filter((r) => r._key !== key));
  const removeInvalid = () => setRows((rs) => rs.filter((r) => validate(r).length === 0));
  const toggleAll = (v: boolean) => setRows((rs) => rs.map((r) => ({ ...r, _selected: v })));

  /* bulk apply */
  const [bulkFac, setBulkFac] = useState("");
  const [bulkCurso, setBulkCurso] = useState("");
  const [bulkAno, setBulkAno] = useState("");
  const [bulkTurma, setBulkTurma] = useState("");
  const bulkCursos = useMemo(
    () => (bulkFac ? cursos.filter((c: any) => c.faculdade_id === bulkFac) : []),
    [cursos, bulkFac],
  );
  const bulkAnos = useMemo(() => {
    const c = cursos.find((x: any) => x.id === bulkCurso) as any;
    const n = Math.max(1, Math.min(10, Number(c?.years) || 0));
    return n > 0 ? Array.from({ length: n }, (_, i) => String(i + 1)) : [];
  }, [cursos, bulkCurso]);

  const applyBulk = () => {
    if (!bulkFac && !bulkCurso && !bulkAno && !bulkTurma) {
      toast.info("Preencha pelo menos um campo para aplicar");
      return;
    }
    setRows((rs) => rs.map((r) => {
      if (!r._selected) return r;
      const next = { ...r };
      if (bulkFac) {
        next.faculdade_id = bulkFac;
        if (bulkCurso) next.curso_id = bulkCurso;
        else if (r.curso_id) {
          const stillOk = cursos.find((c: any) => c.id === r.curso_id && c.faculdade_id === bulkFac);
          if (!stillOk) next.curso_id = "";
        }
      }
      if (bulkCurso && !bulkFac) next.curso_id = bulkCurso;
      if (bulkAno) next.ano = bulkAno;
      if (bulkTurma) next.turma = bulkTurma;
      return next;
    }));
    toast.success("Alterações aplicadas às linhas selecionadas");
  };

  const doImport = async () => {
    const toImport = rows.filter((r) => r._selected && validate(r).length === 0);
    if (!toImport.length) { toast.error("Nenhuma linha válida selecionada"); return; }
    setImporting(true);
    setProgress({ done: 0, total: toImport.length });
    let ok = 0, fail = 0;
    for (const r of toImport) {
      try {
        const nome = `${r.primeiro_nome.trim()} ${r.ultimo_nome.trim()}`.trim();
        await createMut.mutateAsync({
          curso_id: r.curso_id,
          nome,
          ano: r.ano,
          turma: r.turma || "A",
          primeiro_nome: r.primeiro_nome.trim(),
          ultimo_nome: r.ultimo_nome.trim() || null,
          nascimento: r.nascimento || null,
          genero: r.genero || "M",
          regime: r.regime || "normal",
          telemovel: r.telemovel.trim() || null,
          bilhete: r.bilhete.trim() || null,
          provincia: r.provincia.trim() || null,
          municipio: r.municipio.trim() || null,
          endereco: r.endereco.trim() || null,
        } as any);
        ok++;
      } catch (e: any) {
        console.warn("csv row failed:", e?.message);
        fail++;
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setImporting(false);
    if (ok) toast.success(`${ok} discente(s) importado(s)${fail ? ` · ${fail} falharam` : ""}`);
    else toast.error("Nenhuma linha foi importada");
    onImported?.();
    close();
  };

  /* ---------------- render ---------------- */

  if (!open) return null;

  // Upload stage → dialog. Preview stage → fullscreen.
  if (stage === "upload") {
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) close(); else onOpenChange(true); }}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-3 border-b bg-gradient-to-br from-primary/5 via-background to-background">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-sm font-bold leading-tight">Importar Discentes via CSV</DialogTitle>
                <DialogDescription className="text-[11px] leading-tight">
                  Carregue um ficheiro CSV para começar
                </DialogDescription>
              </div>
            </div>
            {onSwitchToManual && (
              <div className="pt-3">
                <ModeToggle mode="csv" onSwitchToManual={onSwitchToManual} />
              </div>
            )}
          </DialogHeader>

          <div className="px-6 py-5">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault(); setDragOver(false);
                onFile(e.dataTransfer.files?.[0] || null);
              }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl px-6 py-12 text-center cursor-pointer transition-colors ${
                dragOver ? "border-primary bg-primary/5" : "border-input hover:border-primary/60 hover:bg-muted/30"
              }`}
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold">Arraste o CSV para aqui, ou clique para escolher</p>
              <p className="text-xs text-muted-foreground mt-1">Suporta vírgula ou ponto-e-vírgula · UTF-8</p>
              <input
                ref={fileRef} type="file" accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="mt-5 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold">Colunas reconhecidas — extracção inteligente</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                Não precisa de nomes exactos. O sistema detecta variações comuns e faz a extracção automática:
                <br />
                <strong className="text-foreground">Nome</strong> → separa automaticamente primeiro e último nome ·{" "}
                <strong className="text-foreground">Faculdade</strong> → aceita sigla ou nome completo ·{" "}
                <strong className="text-foreground">Curso</strong> → reconhece código ou nome, mesmo parcial ·{" "}
                <strong className="text-foreground">Género/Regime</strong> → normaliza valores (M/F, bolseiro/normal).
              </p>
              <div className="flex flex-wrap gap-1">
                {RECOGNIZED_COLS.map((h) => (
                  <span key={h} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background border">
                    {h}
                  </span>
                ))}
              </div>
              <p className="text-[10.5px] text-muted-foreground mt-3 leading-relaxed">
                Obrigatórios: <strong>nome, faculdade, curso, ano</strong>. Os restantes podem ficar vazios e ser preenchidos depois.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
      {/* Top bar */}
      <div className="px-6 py-3 border-b bg-gradient-to-br from-primary/5 via-background to-background flex items-center gap-4">
        <button
          type="button"
          onClick={close}
          className="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Sair
        </button>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight">Importar Discentes via CSV</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Reveja e edite antes de confirmar</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatChip color="emerald" label="Válidas" value={stats.valid} />
          <StatChip color="amber" label="Com erro" value={stats.invalid} />
          <StatChip color="muted" label="Total" value={stats.total} />
        </div>
      </div>




        {stage === "preview" && (
          <>
            {/* Bulk toolbar */}
            <div className="px-6 py-3 border-b bg-muted/30 flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-semibold text-foreground uppercase tracking-wide mr-1">
                Aplicar em massa às selecionadas
              </p>
              <Select value={bulkFac} onValueChange={setBulkFac}>
                <SelectTrigger className="h-8 text-xs w-[140px]"><SelectValue placeholder="Faculdade" /></SelectTrigger>
                <SelectContent>
                  {faculdades.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.sigla || f.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={bulkCurso} onValueChange={setBulkCurso} disabled={!bulkFac}>
                <SelectTrigger className="h-8 text-xs w-[160px]"><SelectValue placeholder="Curso" /></SelectTrigger>
                <SelectContent>
                  {bulkCursos.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.code || c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={bulkAno} onValueChange={setBulkAno} disabled={!bulkCurso}>
                <SelectTrigger className="h-8 text-xs w-[90px]"><SelectValue placeholder="Ano" /></SelectTrigger>
                <SelectContent>
                  {bulkAnos.map((a) => <SelectItem key={a} value={a}>{a}º</SelectItem>)}
                </SelectContent>
              </Select>
              <Input value={bulkTurma} onChange={(e) => setBulkTurma(e.target.value.toUpperCase().slice(0, 2))}
                placeholder="Turma" className="h-8 text-xs w-[80px]" />
              <Button size="sm" onClick={applyBulk} className="h-8 gap-1 text-xs">
                <ArrowRight className="w-3.5 h-3.5" /> Aplicar
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => toggleAll(true)} className="h-8 text-[11px]">Selecionar tudo</Button>
                <Button size="sm" variant="ghost" onClick={() => toggleAll(false)} className="h-8 text-[11px]">Nenhuma</Button>
                {stats.invalid > 0 && (
                  <Button size="sm" variant="ghost" onClick={removeInvalid} className="h-8 text-[11px] text-destructive hover:text-destructive">
                    Remover inválidas
                  </Button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs border-collapse">
                <thead className="sticky top-0 bg-background z-10">
                  <tr className="border-b text-[10px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 text-left w-8"></th>
                    <th className="px-2 py-2 text-left w-8">#</th>
                    <th className="px-2 py-2 text-left">Primeiro</th>
                    <th className="px-2 py-2 text-left">Último</th>
                    <th className="px-2 py-2 text-left">Faculdade</th>
                    <th className="px-2 py-2 text-left">Curso</th>
                    <th className="px-2 py-2 text-left w-16">Ano</th>
                    <th className="px-2 py-2 text-left w-16">Turma</th>
                    <th className="px-2 py-2 text-left w-20">Regime</th>
                    <th className="px-2 py-2 text-left">Telemóvel</th>
                    <th className="px-2 py-2 text-left w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => {
                    const errs = validate(r);
                    const bad = errs.length > 0;
                    const cursoPool = r.faculdade_id ? cursos.filter((c: any) => c.faculdade_id === r.faculdade_id) : [];
                    const curso = cursos.find((c: any) => c.id === r.curso_id) as any;
                    const anos = curso ? Array.from({ length: Math.max(1, Math.min(10, Number(curso.years) || 0)) }, (_, i) => String(i + 1)) : [];
                    return (
                      <tr key={r._key}
                        className={`border-b transition-colors ${bad ? "bg-amber-50/40 hover:bg-amber-50/70" : "hover:bg-muted/30"}`}
                        title={bad ? `Falta: ${errs.join(", ")}` : ""}
                      >
                        <td className="px-3 py-1.5">
                          <Checkbox checked={r._selected} onCheckedChange={(v) => setCell(r._key, { _selected: !!v })} />
                        </td>
                        <td className="px-2 py-1.5 text-muted-foreground tabular-nums">
                          {bad ? <AlertCircle className="w-3.5 h-3.5 text-amber-600 inline-block mr-0.5" /> : <Check className="w-3.5 h-3.5 text-emerald-600 inline-block mr-0.5" />}
                          {idx + 1}
                        </td>
                        <td className="px-1 py-1">
                          <Input value={r.primeiro_nome} onChange={(e) => setCell(r._key, { primeiro_nome: e.target.value })}
                            className="h-7 text-xs border-transparent hover:border-input focus-visible:border-primary" />
                        </td>
                        <td className="px-1 py-1">
                          <Input value={r.ultimo_nome} onChange={(e) => setCell(r._key, { ultimo_nome: e.target.value })}
                            className="h-7 text-xs border-transparent hover:border-input focus-visible:border-primary" />
                        </td>
                        <td className="px-1 py-1">
                          <Select value={r.faculdade_id} onValueChange={(v) => setCell(r._key, { faculdade_id: v, curso_id: "" })}>
                            <SelectTrigger className="h-7 text-xs border-transparent hover:border-input"><SelectValue placeholder="—" /></SelectTrigger>
                            <SelectContent>
                              {faculdades.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.sigla || f.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-1 py-1">
                          <Select value={r.curso_id} onValueChange={(v) => setCell(r._key, { curso_id: v, ano: "" })} disabled={!r.faculdade_id}>
                            <SelectTrigger className="h-7 text-xs border-transparent hover:border-input"><SelectValue placeholder="—" /></SelectTrigger>
                            <SelectContent>
                              {cursoPool.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.code || c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-1 py-1">
                          <Select value={r.ano} onValueChange={(v) => setCell(r._key, { ano: v })} disabled={!anos.length}>
                            <SelectTrigger className="h-7 text-xs border-transparent hover:border-input"><SelectValue placeholder="—" /></SelectTrigger>
                            <SelectContent>{anos.map((a) => <SelectItem key={a} value={a}>{a}º</SelectItem>)}</SelectContent>
                          </Select>
                        </td>
                        <td className="px-1 py-1">
                          <Input value={r.turma} onChange={(e) => setCell(r._key, { turma: e.target.value.toUpperCase().slice(0, 2) })}
                            className="h-7 text-xs border-transparent hover:border-input focus-visible:border-primary" />
                        </td>
                        <td className="px-1 py-1">
                          <Select value={r.regime || "normal"} onValueChange={(v) => setCell(r._key, { regime: v as any })}>
                            <SelectTrigger className="h-7 text-xs border-transparent hover:border-input"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="bolseiro">Bolseiro</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-1 py-1">
                          <Input value={r.telemovel} onChange={(e) => setCell(r._key, { telemovel: e.target.value })}
                            className="h-7 text-xs border-transparent hover:border-input focus-visible:border-primary" />
                        </td>
                        <td className="px-1 py-1 text-right">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => removeRow(r._key)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t bg-background flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={resetAll} className="gap-1.5">
                <X className="w-3.5 h-3.5" /> Cancelar
              </Button>
              {importing && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> A importar {progress.done}/{progress.total}
                </div>
              )}
              <div className="ml-auto flex items-center gap-3">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground tabular-nums">{selectedValidCount}</strong> pronto(s) para importar
                </p>
                <Button size="sm" onClick={doImport} disabled={importing || selectedValidCount === 0} className="gap-1.5">
                  {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Importar {selectedValidCount}
                </Button>
              </div>
            </div>
          </>
        )}
    </div>
  );
}

function StatChip({ label, value, color }: { label: string; value: number; color: "emerald" | "amber" | "muted" }) {
  const cls = color === "emerald"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : color === "amber"
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-muted text-muted-foreground border-border";
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md border ${cls}`}>
      {label} <span className="tabular-nums ml-1">{value}</span>
    </span>
  );
}

export function ModeToggle({
  mode,
  onSwitchToManual,
  onSwitchToCsv,
}: {
  mode: "manual" | "csv";
  onSwitchToManual?: () => void;
  onSwitchToCsv?: () => void;
}) {
  const btn = (active: boolean) =>
    `flex-1 h-8 inline-flex items-center justify-center gap-1.5 text-[11.5px] font-semibold rounded-md transition-colors ${
      active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
    }`;
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted border w-full max-w-[320px]">
      <button type="button" className={btn(mode === "manual")} onClick={onSwitchToManual}>
        <UserPlus className="w-3.5 h-3.5" /> Manual
      </button>
      <button type="button" className={btn(mode === "csv")} onClick={onSwitchToCsv}>
        <FileSpreadsheet className="w-3.5 h-3.5" /> Importar CSV
      </button>
    </div>
  );
}

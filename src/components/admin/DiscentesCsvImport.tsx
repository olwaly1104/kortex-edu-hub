import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Upload, FileSpreadsheet, X, Check, AlertCircle,
  Trash2, Loader2, Sparkles, UserPlus, Eye,
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
  prefixo: "prefixo", titulo: "prefixo", tratamento: "prefixo",
  primeironome: "primeiro_nome", primeiro: "primeiro_nome", firstname: "primeiro_nome",
  ultimonome: "ultimo_nome", apelido: "ultimo_nome", ultimo: "ultimo_nome", lastname: "ultimo_nome", sobrenome: "ultimo_nome",
  faculdade: "faculdade", faculty: "faculdade", sigla: "faculdade",
  curso: "curso", nomedocurso: "curso", nomecurso: "curso", codigo: "curso", codigocurso: "curso", coursecode: "curso", coursename: "curso",
  ano: "ano", year: "ano", anocurricular: "ano",
  nascimento: "nascimento", datanascimento: "nascimento", birthdate: "nascimento",
  genero: "genero", sexo: "genero", gender: "genero",
  regime: "regime",
  telemovel: "telemovel", telefone: "telemovel", phone: "telemovel", contacto: "telemovel",
  email: "email", emailinstitucional: "email", mail: "email",
  bilhete: "bilhete", bi: "bilhete", idcard: "bilhete", identificacao: "bilhete", identificação: "bilhete", identidade: "bilhete",
  provincia: "provincia", province: "provincia",
  municipio: "municipio",
  endereco: "endereco", morada: "endereco", address: "endereco",
  // Encarregado de educação
  encnome: "enc_nome", encarregado: "enc_nome", encarregadonome: "enc_nome", nomeencarregado: "enc_nome",
  encprimeironome: "enc_primeiro", encprimeiro: "enc_primeiro",
  encultimonome: "enc_ultimo", encultimo: "enc_ultimo", encapelido: "enc_ultimo",
  encparentesco: "enc_parentesco", parentesco: "enc_parentesco",
  enctelefone: "enc_telefone", enctelemovel: "enc_telefone", telefoneencarregado: "enc_telefone",
  encemail: "enc_email", emailencarregado: "enc_email",
  encbi: "enc_bilhete", encbilhete: "enc_bilhete", bibencarregado: "enc_bilhete",
};

const FIELDS = ["nome_completo","prefixo","primeiro_nome","ultimo_nome","faculdade","curso","ano","nascimento","genero","regime","telemovel","email","bilhete","provincia","municipio","endereco","enc_nome","enc_primeiro","enc_ultimo","enc_parentesco","enc_telefone","enc_email","enc_bilhete"] as const;
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
  prefixo: string;
  primeiro_nome: string;
  ultimo_nome: string;
  faculdade_id: string;   // resolved id
  curso_id: string;       // resolved id
  ano: string;
  nascimento: string;
  genero: "M" | "F" | "Outro" | "";
  regime: "normal" | "bolseiro" | "";
  telemovel: string;
  email: string;
  bilhete: string;
  provincia: string;
  municipio: string;
  endereco: string;
  enc_primeiro: string;
  enc_ultimo: string;
  enc_parentesco: string;
  enc_telefone: string;
  enc_email: string;
  enc_bilhete: string;
};

const emptyRow = (): Row => ({
  _key: Math.random().toString(36).slice(2),
  _selected: true,
  prefixo: "", primeiro_nome: "", ultimo_nome: "", faculdade_id: "", curso_id: "",
  ano: "", nascimento: "", genero: "", regime: "",
  telemovel: "", email: "", bilhete: "", provincia: "", municipio: "", endereco: "",
  enc_primeiro: "", enc_ultimo: "", enc_parentesco: "", enc_telefone: "", enc_email: "", enc_bilhete: "",
});

const RECOGNIZED_COLS = ["nome","prefixo","faculdade","curso","ano","genero","regime","telemovel","email","bilhete","nascimento","provincia","municipio","morada","enc_nome","enc_parentesco","enc_telefone","enc_email","enc_bilhete"];

// Smart header resolution: try exact HEADER_MAP first, then direct field name,
// then substring signals (e.g. "n_identificacao", "bilhete de identidade", "num bi").
const HEADER_SIGNALS: [RegExp, Field][] = [
  [/(^|[^a-z])(bi|cc|nif)([^a-z]|$)/, "bilhete"],
  [/bilhete|identidade|identifica|documento(?!s)|^doc$/, "bilhete"],
  [/nomecompleto|fullname|^nome$|^name$/, "nome_completo"],
  [/primeiro|firstname/, "primeiro_nome"],
  [/ultimo|apelido|sobrenome|lastname/, "ultimo_nome"],
  [/faculdade|faculty/, "faculdade"],
  [/curso|course/, "curso"],
  [/^ano$|anocurric|year/, "ano"],
  [/nascimento|birth/, "nascimento"],
  [/genero|sexo|gender/, "genero"],
  [/regime|bolseir/, "regime"],
  [/telemovel|telefone|contacto|phone|celular|movel/, "telemovel"],
  [/email|mail/, "email"],
  [/provincia|province/, "provincia"],
  [/municipio|concelho/, "municipio"],
  [/endereco|morada|address|rua/, "endereco"],
  [/^enc.*parentesco|^parentesco/, "enc_parentesco"],
  [/^enc.*(tel|phone|contacto)/, "enc_telefone"],
  [/^enc.*mail/, "enc_email"],
  [/^enc.*(bi|bilhete|identifica)/, "enc_bilhete"],
  [/^enc.*primeiro/, "enc_primeiro"],
  [/^enc.*ultimo/, "enc_ultimo"],
  [/^enc.*nome$|encarregado/, "enc_nome"],
];

const resolveHeader = (h: string): Field | null => {
  if (!h) return null;
  if (HEADER_MAP[h]) return HEADER_MAP[h] as Field;
  if ((FIELDS as readonly string[]).includes(h)) return h as Field;
  for (const [re, field] of HEADER_SIGNALS) if (re.test(h)) return field;
  return null;
};

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
  const [parsing, setParsing] = useState(false);
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
  const backToUpload = () => { setStage("upload"); };
  const openPreview = () => { setStage("preview"); };

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
    const mapping: (Field | null)[] = headers.map((h) => resolveHeader(h));

    const parsed: Row[] = table.slice(1).map((cells) => {
      const r = emptyRow();
      const facRaw = cells[mapping.indexOf("faculdade")] || "";
      const cursoRaw = cells[mapping.indexOf("curso")] || "";
      const nomeCompletoRaw = cells[mapping.indexOf("nome_completo")] || "";
      const encNomeRaw = cells[mapping.indexOf("enc_nome" as Field)] || "";
      mapping.forEach((f, idx) => {
        if (!f) return;
        const val = (cells[idx] || "").trim();
        if (f === "faculdade" || f === "curso" || f === "nome_completo" || f === ("enc_nome" as Field)) return; // handled below
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
      // Encarregado: split full name if provided as one field
      if (encNomeRaw.trim() && !r.enc_primeiro && !r.enc_ultimo) {
        const [first, last] = splitName(encNomeRaw);
        r.enc_primeiro = first;
        r.enc_ultimo = last;
      }
      const facId = resolveFaculdade(facRaw);
      r.faculdade_id = facId;
      r.curso_id = resolveCurso(cursoRaw, facId);
      if (!r.regime) r.regime = "normal";
      return r;
    });
    setRows(parsed);
    setStage("preview");
  };

  const onFile = async (f: File | null) => {
    if (!f) return;
    if (!/\.(csv|txt)$/i.test(f.name)) { toast.error("Ficheiro deve ser .csv"); return; }
    setParsing(true);
    try {
      const text = await f.text();
      // Yield to the browser so the loading UI can paint before heavy sync parse.
      await new Promise((r) => setTimeout(r, 30));
      ingestText(text);
      // Keep the spinner rotating until the preview table has committed to the DOM.
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await new Promise((r) => setTimeout(r, 400));
    } catch (e: any) {
      toast.error(e?.message || "Falha ao processar CSV");
    } finally {
      setParsing(false);
    }
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

  /* bulk apply — auto-applies on every change */
  const [bulkFac, setBulkFac] = useState("");
  const [bulkCurso, setBulkCurso] = useState("");
  const [bulkAno, setBulkAno] = useState("");
  const bulkCursos = useMemo(
    () => (bulkFac ? cursos.filter((c: any) => c.faculdade_id === bulkFac) : cursos),
    [cursos, bulkFac],
  );
  const bulkAnos = useMemo(() => {
    const c = cursos.find((x: any) => x.id === bulkCurso) as any;
    const n = Math.max(1, Math.min(10, Number(c?.years) || 6));
    return Array.from({ length: n }, (_, i) => String(i + 1));
  }, [cursos, bulkCurso]);

  const applyBulkFaculdade = (id: string) => {
    setBulkFac(id);
    setBulkCurso("");
    setBulkAno("");
    setRows((rs) => rs.map((r) => {
      if (!r._selected) return r;
      const next = { ...r, faculdade_id: id };
      if (r.curso_id) {
        const stillOk = cursos.find((c: any) => c.id === r.curso_id && c.faculdade_id === id);
        if (!stillOk) { next.curso_id = ""; next.ano = ""; }
      }
      return next;
    }));
  };
  const applyBulkCurso = (id: string) => {
    setBulkCurso(id);
    setBulkAno("");
    const curso = cursos.find((c: any) => c.id === id) as any;
    setRows((rs) => rs.map((r) => {
      if (!r._selected) return r;
      const next = { ...r, curso_id: id };
      if (curso?.faculdade_id) next.faculdade_id = curso.faculdade_id;
      // reset ano if it's out of range for the new curso
      const maxYears = Math.max(1, Math.min(10, Number(curso?.years) || 0));
      if (r.ano && maxYears && Number(r.ano) > maxYears) next.ano = "";
      return next;
    }));
  };
  const applyBulkAno = (v: string) => {
    setBulkAno(v);
    setRows((rs) => rs.map((r) => (r._selected ? { ...r, ano: v } : r)));
  };
  const confirmBulk = () => {
    setBulkFac(""); setBulkCurso(""); setBulkAno("");
    toast.success("Alterações confirmadas");
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
          turma: "A",
          prefixo: r.prefixo.trim() || null,
          primeiro_nome: r.primeiro_nome.trim(),
          ultimo_nome: r.ultimo_nome.trim() || null,
          nascimento: r.nascimento || null,
          genero: r.genero || "M",
          regime: r.regime || "normal",
          telemovel: r.telemovel.trim() || null,
          email: r.email.trim() || null,
          bilhete: r.bilhete.trim() || null,
          provincia: r.provincia.trim() || null,
          municipio: r.municipio.trim() || null,
          endereco: r.endereco.trim() || null,
          enc_primeiro_nome: r.enc_primeiro.trim() || null,
          enc_ultimo_nome: r.enc_ultimo.trim() || null,
          enc_parentesco: r.enc_parentesco.trim() || null,
          enc_telefone: r.enc_telefone.trim() || null,
          enc_email: r.enc_email.trim() || null,
          enc_bilhete: r.enc_bilhete.trim() || null,
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
        <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[92vh] flex flex-col">
          <DialogHeader className="px-5 pt-4 pb-3 border-b bg-gradient-to-br from-primary/5 via-background to-background shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
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
              <div className="pt-2.5">
                <ModeToggle mode="csv" onSwitchToManual={onSwitchToManual} />
              </div>
            )}
          </DialogHeader>

          <div className="px-5 py-4 overflow-y-auto flex-1">
            {rows.length > 0 && !parsing && (
              <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-emerald-900">CSV carregado</p>
                  <p className="text-[11px] text-emerald-800/80">
                    {stats.total} linha(s) · {stats.valid} válida(s) · {stats.invalid} com erro
                  </p>
                </div>
                <Button size="sm" onClick={openPreview} className="h-8 gap-1.5 text-xs">
                  <Eye className="w-3.5 h-3.5" /> Ver preview
                </Button>
                <Button size="sm" variant="ghost" onClick={resetAll} className="h-8 text-xs text-muted-foreground">
                  Limpar
                </Button>
              </div>
            )}

            <div
              onDragOver={(e) => { if (!parsing) { e.preventDefault(); setDragOver(true); } }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                if (parsing) return;
                e.preventDefault(); setDragOver(false);
                onFile(e.dataTransfer.files?.[0] || null);
              }}
              onClick={() => { if (!parsing) fileRef.current?.click(); }}
              className={`relative border-2 border-dashed rounded-xl px-4 py-6 text-center transition-colors ${
                parsing ? "border-primary bg-primary/5 cursor-wait" :
                dragOver ? "border-primary bg-primary/5 cursor-pointer" :
                "border-input hover:border-primary/60 hover:bg-muted/30 cursor-pointer"
              }`}
            >
              {parsing ? (
                <>
                  <div className="w-11 h-11 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <p className="text-sm font-semibold">A processar CSV…</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">A extrair nomes, faculdades, cursos e anos</p>
                </>
              ) : (
                <>
                  <div className="w-11 h-11 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold">
                    {rows.length > 0 ? "Substituir CSV — arraste ou clique" : "Arraste o CSV ou clique para escolher"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Vírgula ou ponto-e-vírgula · UTF-8</p>
                </>
              )}
              <input
                ref={fileRef} type="file" accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="mt-3 rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <p className="text-[11px] font-semibold">Colunas reconhecidas — extracção inteligente</p>
              </div>
              <p className="text-[10.5px] text-muted-foreground leading-relaxed mb-2">
                <strong className="text-foreground">Nome</strong> → primeiro/último ·{" "}
                <strong className="text-foreground">Faculdade</strong> → nome ou sigla ·{" "}
                <strong className="text-foreground">Curso</strong> → nome ou código ·{" "}
                <strong className="text-foreground">Ano</strong> → 1, 2, 3… ·{" "}
                <strong className="text-foreground">Género/Regime</strong> → M/F, bolseiro/normal.
              </p>
              <div className="flex flex-wrap gap-1">
                {RECOGNIZED_COLS.map((h) => (
                  <span key={h} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background border">
                    {h}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                Obrigatórios: <strong>nome, faculdade, curso, ano</strong>. A turma é atribuída depois.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-fade-in">
      {/* Top bar */}
      <div className="px-6 py-3 border-b bg-gradient-to-br from-primary/5 via-background to-background flex items-center gap-4">
        <button
          type="button"
          onClick={backToUpload}
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
              <Select value={bulkFac} onValueChange={applyBulkFaculdade}>
                <SelectTrigger className="h-8 text-xs w-[180px]"><SelectValue placeholder="Faculdade" /></SelectTrigger>
                <SelectContent>
                  {faculdades.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={bulkCurso} onValueChange={applyBulkCurso}>
                <SelectTrigger className="h-8 text-xs w-[180px]"><SelectValue placeholder="Curso" /></SelectTrigger>
                <SelectContent>
                  {bulkCursos.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name || c.code}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={bulkAno} onValueChange={applyBulkAno}>
                <SelectTrigger className="h-8 text-xs w-[90px]"><SelectValue placeholder="Ano" /></SelectTrigger>
                <SelectContent>
                  {bulkAnos.map((a) => <SelectItem key={a} value={a}>{a}º</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={confirmBulk} className="h-8 gap-1 text-xs" disabled={!bulkFac && !bulkCurso && !bulkAno}>
                <Check className="w-3.5 h-3.5" /> Confirmar
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
                    <th className="px-2 py-2 text-left">Primeiro</th>
                    <th className="px-2 py-2 text-left">Último</th>
                    <th className="px-2 py-2 text-left">Bilhete</th>
                    <th className="px-2 py-2 text-left">Faculdade</th>
                    <th className="px-2 py-2 text-left">Curso</th>
                    <th className="px-2 py-2 text-left w-16">Ano</th>
                    <th className="px-2 py-2 text-left w-20">Regime</th>
                    <th className="px-2 py-2 text-left">Telemóvel</th>
                    <th className="px-2 py-2 text-left">Morada</th>
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
                          <div className="flex items-center gap-1.5">
                            <Checkbox checked={r._selected} onCheckedChange={(v) => setCell(r._key, { _selected: !!v })} />
                            {bad
                              ? <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              : <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
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
                          <Input value={r.bilhete} onChange={(e) => setCell(r._key, { bilhete: e.target.value })}
                            placeholder="—"
                            className="h-7 text-xs border-transparent hover:border-input focus-visible:border-primary font-mono" />
                        </td>
                        <td className="px-1 py-1">
                          <Select value={r.faculdade_id} onValueChange={(v) => setCell(r._key, { faculdade_id: v, curso_id: "" })}>
                            <SelectTrigger className="h-7 text-xs border-transparent hover:border-input"><SelectValue placeholder="—" /></SelectTrigger>
                            <SelectContent>
                              {faculdades.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-1 py-1">
                          <Select value={r.curso_id} onValueChange={(v) => setCell(r._key, { curso_id: v, ano: "" })} disabled={!r.faculdade_id}>
                            <SelectTrigger className="h-7 text-xs border-transparent hover:border-input"><SelectValue placeholder="—" /></SelectTrigger>
                            <SelectContent>
                              {cursoPool.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name || c.code}</SelectItem>)}
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
                        <td className="px-1 py-1">
                          <Input value={r.endereco} onChange={(e) => setCell(r._key, { endereco: e.target.value })}
                            placeholder="Endereço"
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
    </div>,
    document.body,
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

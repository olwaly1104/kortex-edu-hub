import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Settings2, Plus, Pencil, Trash2, ArrowLeft, ChevronRight,
  GraduationCap, BookOpen, FileText, Receipt, ClipboardCheck, AlertTriangle, Building2,
} from "lucide-react";
import { formatCurrency } from "@/data/financeModuleData";
import { reitorFaculties } from "@/data/institutionData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type TipoReceita =
  | "Propina mensal"
  | "Matrícula"
  | "Emolumento"
  | "Taxa"
  | "Serviço Académico"
  | "Candidatura"
  | "Multa";

const TIPOS: TipoReceita[] = [
  "Propina mensal", "Matrícula", "Emolumento", "Taxa", "Serviço Académico", "Candidatura", "Multa",
];

interface ReceitaRow {
  id: string;
  nome: string;
  tipo: TipoReceita;
  escopo: string; // "geral" or course id
  valor: number;
}

const ALL_COURSES = reitorFaculties.flatMap(f =>
  f.courses.map(c => ({ id: c.id, code: c.code, name: c.name, facultyId: f.id, facultyName: f.name }))
);

const courseLabel = (id: string) => {
  if (id === "geral") return "Geral — todos os cursos";
  const c = ALL_COURSES.find(x => x.id === id);
  return c ? `${c.code} — ${c.name}` : id;
};

const seedPropina = (f: string) =>
  f.includes("Medicina") ? 65000 : f.includes("Arquitectura") ? 52000 : f.includes("Direito") ? 48000 : f.includes("Economia") ? 45000 : 38000;

const initialRows = (): ReceitaRow[] => {
  const perCurso: ReceitaRow[] = ALL_COURSES.map(c => ({
    id: `prop-${c.id}`,
    nome: `Propina mensal — ${c.name}`,
    tipo: "Propina mensal",
    escopo: c.id,
    valor: seedPropina(c.facultyName),
  }));
  const matriculas: ReceitaRow[] = reitorFaculties.map(f => ({
    id: `matr-${f.id}`,
    nome: `Matrícula — ${f.name}`,
    tipo: "Matrícula",
    escopo: "geral",
    valor: f.name.includes("Medicina") ? 35000 : (f.name.includes("Arquitectura") || f.name.includes("Direito")) ? 30000 : 25000,
  }));
  const gerais: ReceitaRow[] = [
    { id: "emo-1", nome: "Emissão de Declaração", tipo: "Emolumento", escopo: "geral", valor: 2500 },
    { id: "emo-2", nome: "Certificado de Habilitações", tipo: "Emolumento", escopo: "geral", valor: 5000 },
    { id: "emo-3", nome: "Histórico Académico", tipo: "Emolumento", escopo: "geral", valor: 3500 },
    { id: "ser-1", nome: "Requerimento de Exame Especial", tipo: "Serviço Académico", escopo: "geral", valor: 7500 },
    { id: "ser-2", nome: "Pedido de Equivalência", tipo: "Serviço Académico", escopo: "geral", valor: 12000 },
    { id: "ser-3", nome: "Reapreciação de Prova", tipo: "Serviço Académico", escopo: "geral", valor: 8000 },
    { id: "tax-1", nome: "Taxa de Inscrição em Exame", tipo: "Taxa", escopo: "geral", valor: 3000 },
    { id: "tax-2", nome: "Taxa de Emissão de 2ª Via de Cartão", tipo: "Taxa", escopo: "geral", valor: 2000 },
    { id: "can-1", nome: "Candidatura — Licenciatura", tipo: "Candidatura", escopo: "geral", valor: 15000 },
    { id: "can-2", nome: "Candidatura — Mestrado", tipo: "Candidatura", escopo: "geral", valor: 20000 },
    { id: "mul-1", nome: "Multa por atraso de propina (por mês)", tipo: "Multa", escopo: "geral", valor: 5000 },
    { id: "mul-2", nome: "Multa por falta a exame sem justificação", tipo: "Multa", escopo: "geral", valor: 7500 },
    { id: "mul-3", nome: "Multa por entrega tardia de documentos", tipo: "Multa", escopo: "geral", valor: 3000 },
    { id: "mul-4", nome: "Multa por extravio de cartão de estudante", tipo: "Multa", escopo: "geral", valor: 4000 },
    { id: "mul-5", nome: "Multa por danos em equipamento", tipo: "Multa", escopo: "geral", valor: 15000 },
  ];
  return [...gerais, ...matriculas, ...perCurso];
};

interface SectionDef {
  key: string;
  title: string;
  description: string;
  tipos: TipoReceita[];
  defaultTipo: TipoReceita;
  icon: typeof GraduationCap;
  accent: string;
  chip: string;
}

const SECTIONS: SectionDef[] = [
  { key: "propinas", title: "Propinas", description: "Valor mensal por curso, organizado por faculdade.",
    tipos: ["Propina mensal"], defaultTipo: "Propina mensal",
    icon: GraduationCap, accent: "text-blue-700", chip: "bg-blue-50 border-blue-200 text-blue-700" },
  { key: "emolumentos", title: "Emolumentos", description: "Matrícula, documentos e certificados oficiais.",
    tipos: ["Emolumento", "Matrícula"], defaultTipo: "Emolumento",
    icon: FileText, accent: "text-emerald-700", chip: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { key: "servicos", title: "Serviços Académicos e Taxas", description: "Pedidos académicos e taxas administrativas pontuais.",
    tipos: ["Serviço Académico", "Taxa"], defaultTipo: "Serviço Académico",
    icon: BookOpen, accent: "text-violet-700", chip: "bg-violet-50 border-violet-200 text-violet-700" },
  { key: "candidatura", title: "Candidaturas", description: "Taxas de candidatura para processos de admissão.",
    tipos: ["Candidatura"], defaultTipo: "Candidatura",
    icon: ClipboardCheck, accent: "text-pink-700", chip: "bg-pink-50 border-pink-200 text-pink-700" },
  { key: "multas", title: "Multas", description: "Penalizações aplicáveis por incumprimento ou atraso.",
    tipos: ["Multa"], defaultTipo: "Multa",
    icon: AlertTriangle, accent: "text-red-700", chip: "bg-red-50 border-red-200 text-red-700" },
];

const tipoChip: Record<TipoReceita, string> = {
  "Propina mensal": "bg-blue-50 text-blue-700 border-blue-200",
  "Matrícula": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Emolumento": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Taxa": "bg-amber-50 text-amber-700 border-amber-200",
  "Serviço Académico": "bg-violet-50 text-violet-700 border-violet-200",
  "Candidatura": "bg-pink-50 text-pink-700 border-pink-200",
  "Multa": "bg-red-50 text-red-700 border-red-200",
};

type SectionFilter = "todos" | "propinas" | "emolumentos" | "servicos" | "candidatura" | "multas";

const FILTERS: { key: SectionFilter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "propinas", label: "Propinas" },
  { key: "emolumentos", label: "Emolumentos" },
  { key: "servicos", label: "Serviços e Taxas" },
  { key: "candidatura", label: "Candidaturas" },
  { key: "multas", label: "Multas" },
];

export default function ConfigurarReceitas() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setRows] = useState<ReceitaRow[]>(initialRows);

  const [filter, setFilter] = useState<SectionFilter>("todos");
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);

  const [openSection, setOpenSection] = useState<SectionDef | null>(null);
  const [editing, setEditing] = useState<ReceitaRow | null>(null);
  const [form, setForm] = useState<ReceitaRow>({ id: "", nome: "", tipo: "Taxa", escopo: "geral", valor: 0 });
  const [confirmDel, setConfirmDel] = useState<ReceitaRow | null>(null);
  const [inlineEdit, setInlineEdit] = useState<{ id: string; valor: string } | null>(null);

  const bySection = useMemo(() => {
    const map: Record<string, ReceitaRow[]> = {};
    for (const s of SECTIONS) map[s.key] = rows.filter(r => s.tipos.includes(r.tipo));
    return map;
  }, [rows]);

  // Propinas drill-down: faculty stats
  const facultyStats = useMemo(() => {
    return reitorFaculties.map(f => {
      const courseIds = new Set(f.courses.map(c => c.id));
      const propinas = rows.filter(r => r.tipo === "Propina mensal" && courseIds.has(r.escopo));
      const avg = propinas.length ? Math.round(propinas.reduce((s, r) => s + r.valor, 0) / propinas.length) : 0;
      const min = propinas.length ? Math.min(...propinas.map(r => r.valor)) : 0;
      const max = propinas.length ? Math.max(...propinas.map(r => r.valor)) : 0;
      return { id: f.id, name: f.name, courseCount: f.courses.length, avg, min, max };
    });
  }, [rows]);

  const openNew = (s: SectionDef) => {
    setOpenSection(s);
    setEditing(null);
    setForm({ id: "", nome: "", tipo: s.defaultTipo, escopo: "geral", valor: 0 });
  };
  const openEdit = (s: SectionDef, r: ReceitaRow) => {
    setOpenSection(s);
    setEditing(r);
    setForm({ ...r });
  };
  const close = () => { setOpenSection(null); setEditing(null); };

  const save = () => {
    if (!form.nome.trim() || form.valor < 0) {
      toast({ title: "Dados incompletos", description: "Preencha o nome e um valor válido.", variant: "destructive" });
      return;
    }
    if (editing) {
      setRows(rs => rs.map(r => r.id === editing.id ? { ...form, id: editing.id } : r));
      toast({ title: "Receita actualizada", description: form.nome });
    } else {
      setRows(rs => [{ ...form, id: `r-${Date.now()}` }, ...rs]);
      toast({ title: "Receita criada", description: form.nome });
    }
    close();
  };

  const remove = () => {
    if (!confirmDel) return;
    setRows(rs => rs.filter(r => r.id !== confirmDel.id));
    toast({ title: "Receita removida", description: confirmDel.nome });
    setConfirmDel(null);
  };

  const commitInline = () => {
    if (!inlineEdit) return;
    const v = Number(inlineEdit.valor) || 0;
    setRows(rs => rs.map(r => r.id === inlineEdit.id ? { ...r, valor: v } : r));
    setInlineEdit(null);
  };

  const visibleSections = filter === "todos" ? SECTIONS : SECTIONS.filter(s => s.key === filter);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => navigate("/financas/dashboard")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-primary" /> Configurador Financeiro
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Gere as propinas, emolumentos, serviços, candidaturas e multas cobrados pela instituição.
          </p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-fit flex-wrap">
        {FILTERS.map(b => (
          <Button
            key={b.key}
            variant="ghost"
            size="sm"
            onClick={() => { setFilter(b.key); setSelectedFaculty(null); }}
            className={cn(
              "text-xs h-7 px-3 rounded-md",
              filter === b.key ? "bg-background shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {b.label}
          </Button>
        ))}
      </div>

      {/* Sections */}
      {visibleSections.map(section => {
        const items = bySection[section.key];
        const Icon = section.icon;

        // Special drill-down for Propinas
        if (section.key === "propinas") {
          const selected = selectedFaculty ? reitorFaculties.find(f => f.id === selectedFaculty) : null;
          return (
            <Card key={section.key} className="p-5">
              <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={cn("w-4 h-4", section.accent)} />
                  <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                  <span className="text-[11px] text-muted-foreground tabular-nums">· {items.length} cursos</span>
                  <span className="text-xs text-muted-foreground truncate hidden md:inline">— {section.description}</span>
                </div>
                {selected && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setSelectedFaculty(null)}>
                    <ArrowLeft className="w-3.5 h-3.5" /> Faculdades
                  </Button>
                )}
              </div>

              {!selected ? (
                <div className="grid sm:grid-cols-2 gap-2">
                  {facultyStats.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFaculty(f.id)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/40 transition text-left group"
                    >
                      <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {f.courseCount} cursos · {formatCurrency(f.min)} – {formatCurrency(f.max)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Média</p>
                        <p className="text-sm font-semibold text-foreground tabular-nums">{formatCurrency(f.avg)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  <div className="pb-3 mb-1">
                    <p className="text-xs text-muted-foreground">Faculdade</p>
                    <p className="text-sm font-semibold text-foreground">{selected.name}</p>
                  </div>
                  {selected.courses.map(c => {
                    const r = rows.find(x => x.tipo === "Propina mensal" && x.escopo === c.id);
                    if (!r) return null;
                    const editingInline = inlineEdit?.id === r.id;
                    return (
                      <div key={c.id} className="flex items-center gap-3 py-2.5 group">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                          <p className="text-[11px] text-muted-foreground">{c.code} · Propina mensal</p>
                        </div>
                        {editingInline ? (
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              autoFocus
                              value={inlineEdit!.valor}
                              onChange={e => setInlineEdit({ ...inlineEdit!, valor: e.target.value })}
                              onKeyDown={e => { if (e.key === "Enter") commitInline(); if (e.key === "Escape") setInlineEdit(null); }}
                              className="h-8 w-28 text-sm text-right tabular-nums"
                            />
                            <Button size="sm" className="h-8" onClick={commitInline}>OK</Button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => setInlineEdit({ id: r.id, valor: String(r.valor) })}
                              className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap px-2 py-1 rounded hover:bg-muted transition"
                              title="Clique para editar valor"
                            >
                              {formatCurrency(r.valor)}
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-md"
                              onClick={() => openEdit(section, r)}
                              title="Editar detalhes"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        }

        // Default section rendering
        return (
          <Card key={section.key} className="p-5">
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={cn("w-4 h-4", section.accent)} />
                <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                <span className="text-[11px] text-muted-foreground tabular-nums">· {items.length}</span>
                <span className="text-xs text-muted-foreground truncate hidden md:inline">— {section.description}</span>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => openNew(section)}>
                <Plus className="w-3.5 h-3.5" /> Novo
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-3">Sem itens configurados.</p>
            ) : (
              <div className="divide-y divide-border">
                {items.map(r => (
                  <div
                    key={r.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openEdit(section, r)}
                    onKeyDown={(e) => { if (e.key === "Enter") openEdit(section, r); }}
                    className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-md cursor-pointer hover:bg-muted/50 transition group"
                    title="Clique para editar"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.nome}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium", tipoChip[r.tipo])}>
                          {r.tipo}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">{courseLabel(r.escopo)}</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
                      {formatCurrency(r.valor)}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md"
                        onClick={(e) => { e.stopPropagation(); openEdit(section, r); }}
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md text-destructive hover:text-destructive opacity-60 hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); setConfirmDel(r); }}
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}

      {/* Edit / Create dialog */}
      <Dialog open={!!openSection} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar item" : `Novo item — ${openSection?.title ?? ""}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Designação</label>
              <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex.: Certificado de Habilitações" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                <Select value={form.tipo} onValueChange={(v: TipoReceita) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(openSection?.tipos ?? TIPOS).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Valor (Kz)</label>
                <Input type="number" min={0} value={form.valor}
                  onChange={e => setForm({ ...form, valor: Number(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Aplica-se a</label>
              <Select value={form.escopo} onValueChange={v => setForm({ ...form, escopo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="geral">Geral — todos os cursos</SelectItem>
                  {reitorFaculties.map(f => (
                    <div key={f.id}>
                      <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{f.name}</div>
                      {f.courses.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={save}>{editing ? "Guardar" : "Adicionar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Remover item?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            {confirmDel?.nome}. Esta acção não pode ser desfeita.
          </p>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button variant="destructive" onClick={remove}>Remover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <span className="hidden"><Receipt /></span>
    </div>
  );
}

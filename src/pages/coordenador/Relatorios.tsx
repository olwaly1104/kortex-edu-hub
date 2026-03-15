import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FolderOpen, Folder, FileText, Download, Search, ChevronRight,
  Users, GraduationCap, BookOpen, TrendingUp, BarChart3, Clock,
  FileSpreadsheet, File, Grid3X3, List, X, Eye, Star,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────
interface DriveFile {
  id: string;
  name: string;
  type: "pdf" | "csv";
  frequency: "mensal" | "semestral" | "anual";
  size: string;
  generatedAt: string;
  status: "gerado" | "pendente";
}

interface DriveNode {
  id: string;
  name: string;
  icon?: React.ElementType;
  iconColor?: string;
  children?: DriveNode[];
  files?: DriveFile[];
}

// ─── Data Generators ─────────────────────────────────────
const AY = "2025/2026";
const PAY = "2024/2025";
const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

let fileCounter = 0;
const mkFile = (name: string, type: "pdf" | "csv", freq: "mensal" | "semestral" | "anual", size: string): DriveFile => ({
  id: `f-${fileCounter++}`,
  name, type, frequency: freq, size,
  generatedAt: freq === "anual" ? "2025" : freq === "semestral" ? AY : "Mar 2025",
  status: Math.random() > 0.12 ? "gerado" : "pendente",
});

const desempMonthFiles = () => [
  mkFile("Relatório de Desempenho Geral", "pdf", "mensal", "245 KB"),
  mkFile("Estudantes em Risco", "pdf", "mensal", "128 KB"),
  mkFile("Assiduidade", "pdf", "mensal", "156 KB"),
  mkFile("Relatório Financeiro", "pdf", "mensal", "198 KB"),
];
const desempSemFiles = () => [
  mkFile("Relatório de Desempenho Geral", "pdf", "semestral", "567 KB"),
  mkFile("Notas e Aprovações", "pdf", "semestral", "434 KB"),
  mkFile("Estudantes em Risco", "pdf", "semestral", "312 KB"),
  mkFile("Assiduidade", "pdf", "semestral", "289 KB"),
  mkFile("Cadeiras Críticas", "pdf", "semestral", "245 KB"),
  mkFile("Relatório Financeiro", "pdf", "semestral", "378 KB"),
];
const desempAnualFiles = () => [
  mkFile("Relatório de Desempenho Geral", "pdf", "anual", "1.2 MB"),
  mkFile("Notas e Aprovações", "pdf", "anual", "890 KB"),
  mkFile("Estudantes em Risco", "pdf", "anual", "456 KB"),
  mkFile("Assiduidade", "pdf", "anual", "534 KB"),
  mkFile("Progressão e Retenção", "pdf", "anual", "678 KB"),
  mkFile("Cadeiras Críticas", "pdf", "anual", "345 KB"),
  mkFile("Relatório Financeiro", "pdf", "anual", "567 KB"),
];

const mkMonths = (filesFn: () => DriveFile[]): DriveNode[] =>
  months.map(m => ({ id: `m-${m}-${fileCounter++}`, name: `${m} ${AY}`, files: filesFn() }));
const mkSems = (filesFn: () => DriveFile[]): DriveNode[] => [
  { id: `sem1-${fileCounter++}`, name: `Semestre 1 ${AY}`, files: filesFn() },
  { id: `sem2-${fileCounter++}`, name: `Semestre 2 ${AY}`, files: filesFn() },
];
const mkAnual = (filesFn: () => DriveFile[]): DriveNode[] => [
  { id: `anual-${fileCounter++}`, name: AY, files: filesFn() },
];
const mkPeriods = (mFn: () => DriveFile[], sFn: () => DriveFile[], aFn: () => DriveFile[]): DriveNode[] => [
  { id: `mensal-${fileCounter++}`, name: "Mensal", children: mkMonths(mFn) },
  { id: `semestral-${fileCounter++}`, name: "Semestral", children: mkSems(sFn) },
  { id: `anual-${fileCounter++}`, name: "Anual", children: mkAnual(aFn) },
];

const anos = ["1º Ano", "2º Ano", "3º Ano"];
const turmas = ["Turma A", "Turma B", "Turma C"];
const cadeiras = ["Matemática", "Física", "Química", "Programação", "Estatística", "Economia"];
const docenteNames = ["Prof. Silva", "Prof. Santos", "Prof. Mendes", "Prof. Costa", "Prof. Oliveira"];
const estudanteNames = ["Ana Silva", "João Santos", "Maria Costa", "Pedro Mendes", "Carla Oliveira", "Bruno Ferreira"];

const cadMonthF = () => [mkFile("Relatório da Cadeira", "pdf", "mensal", "178 KB"), mkFile("Assiduidade", "csv", "mensal", "67 KB")];
const cadSemF = () => [mkFile("Relatório da Cadeira", "pdf", "semestral", "345 KB"), mkFile("Notas e Resultados", "pdf", "semestral", "289 KB"), mkFile("Avaliações e Tarefas", "csv", "semestral", "156 KB")];
const cadAnualF = () => [mkFile("Relatório da Cadeira", "pdf", "anual", "678 KB"), mkFile("Notas e Resultados", "pdf", "anual", "534 KB"), mkFile("Avaliações e Tarefas", "csv", "anual", "345 KB"), mkFile("Comparação com Anos Anteriores", "pdf", "anual", "456 KB")];

const docMonthF = () => [mkFile("Relatório do Docente", "pdf", "mensal", "156 KB"), mkFile("Assiduidade", "csv", "mensal", "45 KB")];
const docSemF = () => [mkFile("Relatório do Docente", "pdf", "semestral", "312 KB"), mkFile("Desempenho das Turmas", "pdf", "semestral", "267 KB"), mkFile("Carga Horária", "csv", "semestral", "89 KB")];
const docAnualF = () => [mkFile("Relatório do Docente", "pdf", "anual", "567 KB"), mkFile("Desempenho das Turmas", "pdf", "anual", "456 KB"), mkFile("Carga Horária", "csv", "anual", "123 KB"), mkFile("Avaliação de Desempenho", "pdf", "anual", "345 KB")];

const estMonthF = () => [mkFile("Relatório do Estudante", "pdf", "mensal", "134 KB"), mkFile("Assiduidade", "csv", "mensal", "23 KB")];
const estSemF = () => [mkFile("Relatório do Estudante", "pdf", "semestral", "289 KB"), mkFile("Notas", "pdf", "semestral", "178 KB"), mkFile("Assiduidade", "csv", "semestral", "56 KB"), mkFile("Situação Financeira", "pdf", "semestral", "123 KB")];
const estAnualF = () => [mkFile("Relatório do Estudante", "pdf", "anual", "456 KB"), mkFile("Notas", "pdf", "anual", "345 KB"), mkFile("Assiduidade", "csv", "anual", "89 KB"), mkFile("Situação Financeira", "pdf", "anual", "178 KB"), mkFile("Progressão Académica", "pdf", "anual", "234 KB")];

const gerMonthF = () => [mkFile("Relatório de Desempenho Geral do Curso", "pdf", "mensal", "312 KB"), mkFile("Estudantes em Risco", "pdf", "mensal", "156 KB"), mkFile("Relatório Financeiro", "pdf", "mensal", "198 KB")];
const gerSemF = () => [mkFile("Relatório de Desempenho Geral do Curso", "pdf", "semestral", "678 KB"), mkFile("Notas e Aprovações", "pdf", "semestral", "456 KB"), mkFile("Relatório Financeiro", "pdf", "semestral", "345 KB"), mkFile("Relatório de Docentes", "pdf", "semestral", "289 KB")];
const gerAnualF = () => [mkFile("Relatório Anual 360 do Curso", "pdf", "anual", "2.1 MB"), mkFile("Notas e Aprovações", "pdf", "anual", "890 KB"), mkFile("Progressão e Retenção", "pdf", "anual", "567 KB"), mkFile("Relatório Financeiro", "pdf", "anual", "456 KB"), mkFile("Relatório de Docentes", "pdf", "anual", "345 KB")];

const mkAnoLetivo = (children: DriveNode[]): DriveNode[] => [
  { id: `ay-${AY}-${fileCounter++}`, name: `Ano Letivo ${AY}`, children },
  { id: `ay-${PAY}-${fileCounter++}`, name: `Ano Letivo ${PAY}`, children: [] },
];

const driveTree: DriveNode[] = [
  {
    id: "desempenho", name: "Desempenho Académico", icon: TrendingUp, iconColor: "text-primary",
    children: mkAnoLetivo([
      ...anos.map(a => ({ id: `da-${a}-${fileCounter++}`, name: a, children: mkPeriods(desempMonthFiles, desempSemFiles, desempAnualFiles) })),
      ...turmas.map(t => ({ id: `dt-${t}-${fileCounter++}`, name: t, children: mkPeriods(desempMonthFiles, desempSemFiles, desempAnualFiles) })),
    ]),
  },
  {
    id: "cadeiras", name: "Cadeiras do Curso", icon: BookOpen, iconColor: "text-accent",
    children: mkAnoLetivo(
      cadeiras.map(c => ({ id: `cad-${c}-${fileCounter++}`, name: c, children: mkPeriods(cadMonthF, cadSemF, cadAnualF) }))
    ),
  },
  {
    id: "docentes", name: "Docentes do Curso", icon: GraduationCap, iconColor: "text-secondary",
    children: mkAnoLetivo(
      docenteNames.map(d => ({ id: `doc-${d}-${fileCounter++}`, name: d, children: mkPeriods(docMonthF, docSemF, docAnualF) }))
    ),
  },
  {
    id: "estudantes", name: "Estudantes do Curso", icon: Users, iconColor: "text-primary",
    children: mkAnoLetivo(
      estudanteNames.map(e => ({ id: `est-${e}-${fileCounter++}`, name: e, children: mkPeriods(estMonthF, estSemF, estAnualF) }))
    ),
  },
  {
    id: "geral", name: "Geral", icon: BarChart3, iconColor: "text-accent",
    children: mkAnoLetivo(mkPeriods(gerMonthF, gerSemF, gerAnualF)),
  },
];

function collectFiles(node: DriveNode): DriveFile[] {
  return [...(node.files || []), ...(node.children || []).flatMap(collectFiles)];
}
function countItems(node: DriveNode): number {
  return (node.children?.length || 0) + (node.files?.length || 0);
}
const allDriveFiles = driveTree.flatMap(collectFiles);

// ─── Component ───────────────────────────────────────────
export default function CoordenadorRelatorios() {
  const [path, setPath] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [typeFilter, setTypeFilter] = useState<"all" | "pdf" | "csv">("all");

  const resolveNode = useCallback((): DriveNode | null => {
    let nodes = driveTree;
    let current: DriveNode | null = null;
    for (const seg of path) {
      const found = nodes.find(n => n.id === seg);
      if (!found) return null;
      current = found;
      nodes = found.children || [];
    }
    return current;
  }, [path]);

  const currentNode = resolveNode();
  const children = currentNode?.children || (path.length === 0 ? driveTree : []);
  const files = currentNode?.files || [];

  const breadcrumbs = useMemo(() => {
    const crumbs: { label: string; pathTo: string[] }[] = [{ label: "O Meu Curso", pathTo: [] }];
    let nodes = driveTree;
    const acc: string[] = [];
    for (const seg of path) {
      const found = nodes.find(n => n.id === seg);
      if (!found) break;
      acc.push(seg);
      crumbs.push({ label: found.name, pathTo: [...acc] });
      nodes = found.children || [];
    }
    return crumbs;
  }, [path]);

  const filteredFiles = useMemo(() => {
    let f = files;
    if (typeFilter !== "all") f = f.filter(x => x.type === typeFilter);
    if (search) f = f.filter(x => x.name.toLowerCase().includes(search.toLowerCase()));
    return f;
  }, [files, typeFilter, search]);

  const filteredChildren = useMemo(() => {
    if (!search) return children;
    return children.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [children, search]);

  const globalResults = useMemo(() => {
    if (!search || path.length > 0) return [];
    return allDriveFiles.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).slice(0, 20);
  }, [search, path]);

  const nav = (id: string) => { setPath(p => [...p, id]); setSearch(""); setTypeFilter("all"); };
  const navTo = (p: string[]) => { setPath(p); setSearch(""); };

  const handleExport = (file: DriveFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toast({ title: `A exportar ${file.type.toUpperCase()}`, description: file.name });
  };

  const isRoot = path.length === 0;
  const hasFiles = filteredFiles.length > 0;
  const hasFolders = filteredChildren.length > 0;

  return (
    <div className="flex h-[calc(100vh)] overflow-hidden">
      {/* ─── Sidebar ─── */}
      <div className="w-[220px] shrink-0 border-r border-border bg-card overflow-y-auto">
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-bold text-foreground">O Meu Curso</span>
          </div>
          <div className="space-y-0.5">
            {driveTree.map(node => {
              const Icon = node.icon || Folder;
              const isActive = path[0] === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => { setPath([node.id]); setSearch(""); }}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground/70 hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{node.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Storage info */}
        <div className="px-4 py-4 mt-4 border-t border-border">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
            <span>{allDriveFiles.length} relatórios</span>
            <span>Auto-gerado</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary/60 w-[35%]" />
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <div className="shrink-0 border-b border-border bg-card px-5 py-3 flex items-center gap-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-0.5 text-sm min-w-0 flex-1">
            {breadcrumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-0.5 shrink-0">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 mx-0.5" />}
                <button
                  onClick={() => navTo(c.pathTo)}
                  className={`transition-colors max-w-[160px] truncate ${
                    i === breadcrumbs.length - 1 ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              </span>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Pesquisar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-muted/40 border-transparent focus:border-border"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-md border border-border overflow-hidden">
            <button onClick={() => setViewMode("grid")} className={`p-1.5 transition-colors ${viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setViewMode("list")} className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Type Filter */}
          {!isRoot && (
            <div className="flex items-center rounded-md border border-border overflow-hidden">
              {(["all", "pdf", "csv"] as const).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    typeFilter === t ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "all" ? "Todos" : t.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-background">
          {/* Global search results */}
          {isRoot && search && (
            <div className="p-5">
              {globalResults.length > 0 ? (
                <>
                  <p className="text-xs text-muted-foreground mb-3">{globalResults.length} resultado{globalResults.length !== 1 ? "s" : ""}</p>
                  <div className="space-y-px rounded-lg border border-border overflow-hidden bg-card">
                    {globalResults.map(file => (
                      <FileRow key={file.id} file={file} onExport={handleExport} />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState text="Nenhum resultado encontrado" sub="Tente outro termo de pesquisa" />
              )}
            </div>
          )}

          {/* Root view */}
          {isRoot && !search && (
            <div className="p-5 space-y-6">
              {/* Quick Access */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" /> Acesso Rápido
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {allDriveFiles.filter(f => f.status === "gerado").slice(0, 4).map(file => (
                    <button
                      key={file.id}
                      onClick={() => handleExport(file)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors text-left group"
                    >
                      <FileIcon type={file.type} small />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">{file.size}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Folders */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3">Pastas</p>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {driveTree.map(node => (
                      <FolderCard key={node.id} node={node} onClick={() => nav(node.id)} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden bg-card divide-y divide-border">
                    {driveTree.map(node => (
                      <FolderRow key={node.id} node={node} onClick={() => nav(node.id)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Folder contents */}
          {!isRoot && (
            <div className="p-5 space-y-5">
              {/* Subfolders */}
              {hasFolders && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">
                    Pastas
                  </p>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {filteredChildren.map(node => (
                        <FolderCard key={node.id} node={node} onClick={() => nav(node.id)} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border overflow-hidden bg-card divide-y divide-border">
                      {filteredChildren.map(node => (
                        <FolderRow key={node.id} node={node} onClick={() => nav(node.id)} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Files */}
              {hasFiles && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">
                    Ficheiros
                  </p>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {filteredFiles.map(file => (
                        <FileCard key={file.id} file={file} onExport={handleExport} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border overflow-hidden bg-card">
                      <div className="grid grid-cols-[1fr,80px,80px,80px,70px,36px] gap-2 px-4 py-2 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                        <span>Nome</span><span>Tipo</span><span>Estado</span><span>Data</span><span>Tamanho</span><span />
                      </div>
                      <div className="divide-y divide-border">
                        {filteredFiles.map(file => (
                          <FileRow key={file.id} file={file} onExport={handleExport} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!hasFolders && !hasFiles && (
                <EmptyState text="Sem relatórios ainda" sub="Os relatórios serão gerados automaticamente" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponents ───────────────────────────────────────

function FolderCard({ node, onClick }: { node: DriveNode; onClick: () => void }) {
  const Icon = node.icon || Folder;
  const count = countItems(node);
  return (
    <button onClick={onClick} className="text-left group">
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-[hsl(213,60%,97%)] transition-all">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-muted/50 shrink-0 ${node.iconColor || "text-muted-foreground"}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-foreground truncate">{node.name}</p>
          <p className="text-[11px] text-muted-foreground">{count} item{count !== 1 ? "s" : ""}</p>
        </div>
      </div>
    </button>
  );
}

function FolderRow({ node, onClick }: { node: DriveNode; onClick: () => void }) {
  const Icon = node.icon || Folder;
  const count = countItems(node);
  return (
    <button onClick={onClick} className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-[hsl(213,60%,97%)] transition-colors">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50 shrink-0 ${node.iconColor || "text-muted-foreground"}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-[13px] font-medium text-foreground flex-1 truncate">{node.name}</p>
      <span className="text-[11px] text-muted-foreground">{count} item{count !== 1 ? "s" : ""}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
    </button>
  );
}

function FileCard({ file, onExport }: { file: DriveFile; onExport: (f: DriveFile, e?: React.MouseEvent) => void }) {
  return (
    <div
      className="p-3.5 rounded-xl border border-border bg-card hover:bg-[hsl(213,60%,97%)] transition-all cursor-pointer group"
      onClick={() => onExport(file)}
    >
      <div className="flex items-start gap-3">
        <FileIcon type={file.type} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-foreground leading-snug">{file.name}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <FreqBadge freq={file.frequency} />
            <StatusDot status={file.status} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{file.generatedAt} · {file.size}</p>
        </div>
      </div>
      <div className="mt-3 pt-2.5 border-t border-border flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 flex-1" onClick={e => onExport(file, e)}>
          <Download className="w-3 h-3" /> Exportar
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" onClick={e => { e.stopPropagation(); onExport(file, e); }}>
          <Eye className="w-3 h-3" /> Ver
        </Button>
      </div>
    </div>
  );
}

function FileRow({ file, onExport }: { file: DriveFile; onExport: (f: DriveFile, e?: React.MouseEvent) => void }) {
  return (
    <div
      className="grid grid-cols-[1fr,80px,80px,80px,70px,36px] gap-2 items-center px-4 py-2.5 hover:bg-[hsl(213,60%,97%)] transition-colors cursor-pointer group"
      onClick={() => onExport(file)}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <FileIcon type={file.type} small />
        <p className="text-[13px] font-medium text-foreground truncate">{file.name}</p>
      </div>
      <FreqBadge freq={file.frequency} />
      <StatusDot status={file.status} />
      <span className="text-[11px] text-muted-foreground">{file.generatedAt}</span>
      <span className="text-[11px] text-muted-foreground">{file.size}</span>
      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => onExport(file, e)}>
        <Download className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

function FileIcon({ type, small }: { type: "pdf" | "csv"; small?: boolean }) {
  const sz = small ? "w-7 h-7" : "w-9 h-9";
  const icon = small ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className={`${sz} rounded-lg flex items-center justify-center shrink-0 ${
      type === "pdf" ? "bg-destructive/10" : "bg-accent/10"
    }`}>
      {type === "pdf" ? <File className={`${icon} text-destructive`} /> : <FileSpreadsheet className={`${icon} text-accent`} />}
    </div>
  );
}

function FreqBadge({ freq }: { freq: "mensal" | "semestral" | "anual" }) {
  const map = {
    mensal: { bg: "bg-[hsl(175,50%,92%)]", text: "text-[hsl(175,80%,28%)]", label: "Mensal" },
    semestral: { bg: "bg-[hsl(270,50%,93%)]", text: "text-[hsl(270,50%,40%)]", label: "Semestral" },
    anual: { bg: "bg-[hsl(30,70%,92%)]", text: "text-[hsl(30,70%,35%)]", label: "Anual" },
  };
  const s = map[freq];
  return <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${s.bg} ${s.text}`}>{s.label}</span>;
}

function StatusDot({ status }: { status: "gerado" | "pendente" }) {
  return (
    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
      <span className={`w-1.5 h-1.5 rounded-full ${status === "gerado" ? "bg-accent" : "bg-muted-foreground/40"}`} />
      {status === "gerado" ? "Gerado" : "Pendente"}
    </span>
  );
}

function EmptyState({ text, sub }: { text: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
        <FolderOpen className="w-7 h-7 text-muted-foreground/30" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
      <p className="text-xs text-muted-foreground/50 mt-1">{sub}</p>
    </div>
  );
}

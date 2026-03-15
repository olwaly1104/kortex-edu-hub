import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3, FolderOpen, Folder, FileText, Download, Search,
  ChevronRight, Users, GraduationCap, BookOpen,
  Award, Wallet, TrendingUp, Clock, X,
  FileSpreadsheet, File, Grid3X3, List, Bell,
  Eye, ChevronDown,
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

// ─── Helpers ─────────────────────────────────────────────
const Y = 2025;
const AY = `${Y}/${Y + 1}`;
const PAY = `${Y - 1}/${Y}`;
const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const mkFile = (name: string, type: "pdf" | "csv", freq: "mensal" | "semestral" | "anual", size: string): DriveFile => ({
  id: `${name}-${freq}-${Math.random().toString(36).slice(2, 8)}`,
  name, type, frequency: freq, size,
  generatedAt: freq === "anual" ? `${Y}` : freq === "semestral" ? `${AY}` : `Mar ${Y}`,
  status: Math.random() > 0.15 ? "gerado" : "pendente",
});

// Monthly report files for Desempenho
const desempenhoMonthFiles: DriveFile[] = [
  mkFile("Relatório de Desempenho Geral", "pdf", "mensal", "245 KB"),
  mkFile("Estudantes em Risco", "pdf", "mensal", "128 KB"),
  mkFile("Assiduidade", "pdf", "mensal", "156 KB"),
  mkFile("Relatório Financeiro", "pdf", "mensal", "198 KB"),
];
const desempenhoSemFiles: DriveFile[] = [
  mkFile("Relatório de Desempenho Geral", "pdf", "semestral", "567 KB"),
  mkFile("Notas e Aprovações", "pdf", "semestral", "434 KB"),
  mkFile("Estudantes em Risco", "pdf", "semestral", "312 KB"),
  mkFile("Assiduidade", "pdf", "semestral", "289 KB"),
  mkFile("Cadeiras Críticas", "pdf", "semestral", "245 KB"),
  mkFile("Relatório Financeiro", "pdf", "semestral", "378 KB"),
];
const desempenhoAnualFiles: DriveFile[] = [
  mkFile("Relatório de Desempenho Geral", "pdf", "anual", "1.2 MB"),
  mkFile("Notas e Aprovações", "pdf", "anual", "890 KB"),
  mkFile("Estudantes em Risco", "pdf", "anual", "456 KB"),
  mkFile("Assiduidade", "pdf", "anual", "534 KB"),
  mkFile("Progressão e Retenção", "pdf", "anual", "678 KB"),
  mkFile("Cadeiras Críticas", "pdf", "anual", "345 KB"),
  mkFile("Relatório Financeiro", "pdf", "anual", "567 KB"),
];

const mkMonthFolders = (files: DriveFile[]): DriveNode[] =>
  months.map(m => ({ id: `month-${m}`, name: `${m} ${AY}`, files: files.map(f => ({ ...f, id: `${f.id}-${m}`, generatedAt: `${m} ${Y}` })) }));

const mkSemFolders = (files: DriveFile[]): DriveNode[] => [
  { id: "sem1", name: `Semestre 1 ${AY}`, files: files.map(f => ({ ...f, id: `${f.id}-s1` })) },
  { id: "sem2", name: `Semestre 2 ${AY}`, files: files.map(f => ({ ...f, id: `${f.id}-s2` })) },
];

const mkAnualFolder = (files: DriveFile[]): DriveNode[] => [
  { id: "anual-yr", name: AY, files },
];

const mkPeriodFolders = (mFiles: DriveFile[], sFiles: DriveFile[], aFiles: DriveFile[]): DriveNode[] => [
  { id: "mensal", name: "Mensal", icon: Clock, children: mkMonthFolders(mFiles) },
  { id: "semestral", name: "Semestral", icon: BarChart3, children: mkSemFolders(sFiles) },
  { id: "anual", name: "Anual", icon: TrendingUp, children: mkAnualFolder(aFiles) },
];

// Year + Turma structure for Desempenho
const anos = ["1º Ano", "2º Ano", "3º Ano"];
const turmas = ["Turma A", "Turma B", "Turma C"];

const mkYearTurmaChildren = (): DriveNode[] => [
  ...anos.map(a => ({
    id: `ano-${a}`, name: a, icon: BookOpen as React.ElementType,
    children: mkPeriodFolders(desempenhoMonthFiles, desempenhoSemFiles, desempenhoAnualFiles),
  })),
  ...turmas.map(t => ({
    id: `turma-${t}`, name: t, icon: Users as React.ElementType,
    children: mkPeriodFolders(desempenhoMonthFiles, desempenhoSemFiles, desempenhoAnualFiles),
  })),
];

// Cadeiras
const cadeiras = ["Matemática", "Física", "Química", "Programação", "Estatística", "Economia"];
const cadeiraMonthFiles: DriveFile[] = [
  mkFile("Relatório da Cadeira", "pdf", "mensal", "178 KB"),
  mkFile("Assiduidade", "csv", "mensal", "67 KB"),
];
const cadeiraSemFiles: DriveFile[] = [
  mkFile("Relatório da Cadeira", "pdf", "semestral", "345 KB"),
  mkFile("Notas e Resultados", "pdf", "semestral", "289 KB"),
  mkFile("Avaliações e Tarefas", "csv", "semestral", "156 KB"),
];
const cadeiraAnualFiles: DriveFile[] = [
  mkFile("Relatório da Cadeira", "pdf", "anual", "678 KB"),
  mkFile("Notas e Resultados", "pdf", "anual", "534 KB"),
  mkFile("Avaliações e Tarefas", "csv", "anual", "345 KB"),
  mkFile("Comparação com Anos Anteriores", "pdf", "anual", "456 KB"),
];

// Docentes
const docentes = ["Prof. Silva", "Prof. Santos", "Prof. Mendes", "Prof. Costa", "Prof. Oliveira"];
const docenteMonthFiles: DriveFile[] = [
  mkFile("Relatório do Docente", "pdf", "mensal", "156 KB"),
  mkFile("Assiduidade", "csv", "mensal", "45 KB"),
];
const docenteSemFiles: DriveFile[] = [
  mkFile("Relatório do Docente", "pdf", "semestral", "312 KB"),
  mkFile("Desempenho das Turmas", "pdf", "semestral", "267 KB"),
  mkFile("Carga Horária", "csv", "semestral", "89 KB"),
];
const docenteAnualFiles: DriveFile[] = [
  mkFile("Relatório do Docente", "pdf", "anual", "567 KB"),
  mkFile("Desempenho das Turmas", "pdf", "anual", "456 KB"),
  mkFile("Carga Horária", "csv", "anual", "123 KB"),
  mkFile("Avaliação de Desempenho", "pdf", "anual", "345 KB"),
];

// Estudantes
const estudantes = ["Ana Silva", "João Santos", "Maria Costa", "Pedro Mendes", "Carla Oliveira", "Bruno Ferreira"];
const estudanteMonthFiles: DriveFile[] = [
  mkFile("Relatório do Estudante", "pdf", "mensal", "134 KB"),
  mkFile("Assiduidade", "csv", "mensal", "23 KB"),
];
const estudanteSemFiles: DriveFile[] = [
  mkFile("Relatório do Estudante", "pdf", "semestral", "289 KB"),
  mkFile("Notas", "pdf", "semestral", "178 KB"),
  mkFile("Assiduidade", "csv", "semestral", "56 KB"),
  mkFile("Situação Financeira", "pdf", "semestral", "123 KB"),
];
const estudanteAnualFiles: DriveFile[] = [
  mkFile("Relatório do Estudante", "pdf", "anual", "456 KB"),
  mkFile("Notas", "pdf", "anual", "345 KB"),
  mkFile("Assiduidade", "csv", "anual", "89 KB"),
  mkFile("Situação Financeira", "pdf", "anual", "178 KB"),
  mkFile("Progressão Académica", "pdf", "anual", "234 KB"),
];

// Geral
const geralMonthFiles: DriveFile[] = [
  mkFile("Relatório de Desempenho Geral do Curso", "pdf", "mensal", "312 KB"),
  mkFile("Estudantes em Risco", "pdf", "mensal", "156 KB"),
  mkFile("Relatório Financeiro", "pdf", "mensal", "198 KB"),
];
const geralSemFiles: DriveFile[] = [
  mkFile("Relatório de Desempenho Geral do Curso", "pdf", "semestral", "678 KB"),
  mkFile("Notas e Aprovações", "pdf", "semestral", "456 KB"),
  mkFile("Relatório Financeiro", "pdf", "semestral", "345 KB"),
  mkFile("Relatório de Docentes", "pdf", "semestral", "289 KB"),
];
const geralAnualFiles: DriveFile[] = [
  mkFile("Relatório Anual 360 do Curso", "pdf", "anual", "2.1 MB"),
  mkFile("Notas e Aprovações", "pdf", "anual", "890 KB"),
  mkFile("Progressão e Retenção", "pdf", "anual", "567 KB"),
  mkFile("Relatório Financeiro", "pdf", "anual", "456 KB"),
  mkFile("Relatório de Docentes", "pdf", "anual", "345 KB"),
];

// ─── Full Drive Tree ─────────────────────────────────────
const driveTree: DriveNode[] = [
  {
    id: "desempenho", name: "Desempenho Académico", icon: TrendingUp, iconColor: "text-primary",
    children: [
      { id: `ay-${AY}`, name: `Ano Letivo ${AY}`, children: mkYearTurmaChildren() },
      { id: `ay-${PAY}`, name: `Ano Letivo ${PAY}`, children: mkYearTurmaChildren() },
    ],
  },
  {
    id: "cadeiras", name: "Cadeiras do Curso", icon: BookOpen, iconColor: "text-accent",
    children: [
      {
        id: `cad-ay-${AY}`, name: `Ano Letivo ${AY}`,
        children: cadeiras.map(c => ({
          id: `cad-${c}`, name: c, icon: BookOpen as React.ElementType,
          children: mkPeriodFolders(cadeiraMonthFiles, cadeiraSemFiles, cadeiraAnualFiles),
        })),
      },
    ],
  },
  {
    id: "docentes", name: "Docentes do Curso", icon: GraduationCap, iconColor: "text-secondary",
    children: [
      {
        id: `doc-ay-${AY}`, name: `Ano Letivo ${AY}`,
        children: docentes.map(d => ({
          id: `doc-${d}`, name: d, icon: GraduationCap as React.ElementType,
          children: mkPeriodFolders(docenteMonthFiles, docenteSemFiles, docenteAnualFiles),
        })),
      },
    ],
  },
  {
    id: "estudantes", name: "Estudantes do Curso", icon: Users, iconColor: "text-primary",
    children: [
      {
        id: `est-ay-${AY}`, name: `Ano Letivo ${AY}`,
        children: estudantes.map(e => ({
          id: `est-${e}`, name: e, icon: Users as React.ElementType,
          children: mkPeriodFolders(estudanteMonthFiles, estudanteSemFiles, estudanteAnualFiles),
        })),
      },
    ],
  },
  {
    id: "geral", name: "Geral", icon: BarChart3, iconColor: "text-accent",
    children: [
      {
        id: `ger-ay-${AY}`, name: `Ano Letivo ${AY}`,
        children: mkPeriodFolders(geralMonthFiles, geralSemFiles, geralAnualFiles),
      },
    ],
  },
];

// ─── Collect all files recursively ───────────────────────
function collectFiles(node: DriveNode): DriveFile[] {
  const own = node.files || [];
  const nested = (node.children || []).flatMap(collectFiles);
  return [...own, ...nested];
}
const allDriveFiles = driveTree.flatMap(collectFiles);

// ─── Frequency Badge ─────────────────────────────────────
function FreqBadge({ freq }: { freq: "mensal" | "semestral" | "anual" }) {
  const cls = freq === "mensal"
    ? "bg-[hsl(175,60%,92%)] text-[hsl(175,84%,25%)]"
    : freq === "semestral"
    ? "bg-[hsl(270,60%,93%)] text-[hsl(270,60%,40%)]"
    : "bg-[hsl(30,80%,92%)] text-[hsl(30,80%,35%)]";
  const label = freq === "mensal" ? "Mensal" : freq === "semestral" ? "Semestral" : "Anual";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${cls}`}>{label}</span>;
}

function StatusBadge({ status }: { status: "gerado" | "pendente" }) {
  return status === "gerado"
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/10 text-accent">Auto-gerado</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">Pendente</span>;
}

// ─── Component ───────────────────────────────────────────
export default function CoordenadorRelatorios() {
  const [path, setPath] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [typeFilter, setTypeFilter] = useState<"all" | "pdf" | "csv">("all");

  // Resolve current node from path
  const resolveNode = useCallback((): DriveNode | null => {
    let nodes = driveTree;
    let current: DriveNode | null = null;
    for (const segment of path) {
      const found = nodes.find(n => n.id === segment);
      if (!found) return null;
      current = found;
      nodes = found.children || [];
    }
    return current;
  }, [path]);

  const currentNode = resolveNode();
  const currentChildren = currentNode?.children || (path.length === 0 ? driveTree : []);
  const currentFiles = currentNode?.files || [];

  // Build breadcrumb labels
  const breadcrumbs = useMemo(() => {
    const crumbs: { label: string; pathTo: string[] }[] = [{ label: "O Meu Curso", pathTo: [] }];
    let nodes = driveTree;
    const accumulated: string[] = [];
    for (const segment of path) {
      const found = nodes.find(n => n.id === segment);
      if (!found) break;
      accumulated.push(segment);
      crumbs.push({ label: found.name, pathTo: [...accumulated] });
      nodes = found.children || [];
    }
    return crumbs;
  }, [path]);

  // Filter files
  const displayFiles = useMemo(() => {
    let files = currentFiles;
    if (typeFilter !== "all") files = files.filter(f => f.type === typeFilter);
    if (search && path.length > 0) files = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
    return files;
  }, [currentFiles, typeFilter, search, path]);

  // Filter children (folders)
  const displayChildren = useMemo(() => {
    if (!search || path.length > 0) return currentChildren;
    // Global search: show matching files
    return currentChildren;
  }, [currentChildren, search, path]);

  // Global search results
  const globalResults = useMemo(() => {
    if (!search || path.length > 0) return [];
    const q = search.toLowerCase();
    return allDriveFiles.filter(f => f.name.toLowerCase().includes(q));
  }, [search, path]);

  const navigateTo = (nodeId: string) => {
    setPath(prev => [...prev, nodeId]);
    setSearch("");
    setTypeFilter("all");
  };

  const navigateToBreadcrumb = (pathTo: string[]) => {
    setPath(pathTo);
    setSearch("");
  };

  const handleExport = (file: DriveFile) => {
    toast({
      title: `A exportar ${file.type.toUpperCase()}...`,
      description: file.name,
    });
  };

  const folderCount = (node: DriveNode): number => {
    return collectFiles(node).length;
  };

  // Recent files (last 4)
  const recentFiles = allDriveFiles.filter(f => f.status === "gerado").slice(0, 4);

  const isRoot = path.length === 0;

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in max-w-[1400px]">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FolderOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">Relatórios</h1>
            <p className="text-xs text-muted-foreground">{allDriveFiles.length} relatórios auto-gerados</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">3</span>
          </Button>
        </div>
      </div>

      {/* Breadcrumb + Search + View Toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm flex-1 min-w-0">
          {breadcrumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1 shrink-0">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />}
              <button
                onClick={() => navigateToBreadcrumb(c.pathTo)}
                className={`transition-colors truncate max-w-[180px] ${
                  i === breadcrumbs.length - 1
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            </span>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Pesquisar relatórios..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm bg-card"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View & Filter */}
        {!isRoot && (
          <>
            <div className="flex items-center border border-border rounded-lg overflow-hidden bg-card">
              {(["all", "pdf", "csv"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 text-[11px] font-medium transition-colors ${
                    typeFilter === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t === "all" ? "Todos" : t.toUpperCase()}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex items-center border border-border rounded-lg overflow-hidden bg-card">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Search Results */}
      {isRoot && search && globalResults.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {globalResults.length} resultado{globalResults.length !== 1 ? "s" : ""}
          </p>
          <Card className="overflow-hidden divide-y divide-border">
            {globalResults.slice(0, 20).map(file => (
              <div key={file.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[hsl(213,60%,97%)] transition-colors group cursor-pointer">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  file.type === "pdf" ? "bg-destructive/10" : "bg-accent/10"
                }`}>
                  {file.type === "pdf" ? <File className="w-4 h-4 text-destructive" /> : <FileSpreadsheet className="w-4 h-4 text-accent" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground">{file.generatedAt} · {file.size}</p>
                </div>
                <FreqBadge freq={file.frequency} />
                <StatusBadge status={file.status} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleExport(file)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </Card>
        </div>
      )}

      {isRoot && search && globalResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum relatório encontrado</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Tente outro termo de pesquisa</p>
        </div>
      )}

      {/* Root: Recently Opened */}
      {isRoot && !search && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Acedidos Recentemente
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentFiles.map(file => (
              <Card
                key={file.id}
                className="p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
                onClick={() => handleExport(file)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    file.type === "pdf" ? "bg-destructive/10" : "bg-accent/10"
                  }`}>
                    {file.type === "pdf" ? <File className="w-5 h-5 text-destructive" /> : <FileSpreadsheet className="w-5 h-5 text-accent" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-foreground leading-tight line-clamp-2">{file.name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <FreqBadge freq={file.frequency} />
                      <span className="text-[10px] text-muted-foreground">{file.size}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Root: Main Folders */}
      {isRoot && !search && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Pastas
          </p>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {driveTree.map(node => {
                const Icon = node.icon || Folder;
                const count = folderCount(node);
                return (
                  <button key={node.id} onClick={() => navigateTo(node.id)} className="text-left group">
                    <Card className="p-5 h-full hover:shadow-md hover:border-primary/20 transition-all duration-200 group-hover:-translate-y-0.5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-muted/60 ${node.iconColor || "text-primary"}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-foreground leading-tight">{node.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-1.5">{count} relatório{count !== 1 ? "s" : ""}</p>
                    </Card>
                  </button>
                );
              })}
            </div>
          ) : (
            <Card className="overflow-hidden divide-y divide-border">
              {driveTree.map(node => {
                const Icon = node.icon || Folder;
                const count = folderCount(node);
                return (
                  <button
                    key={node.id}
                    onClick={() => navigateTo(node.id)}
                    className="flex items-center gap-4 px-4 py-3.5 w-full text-left hover:bg-[hsl(213,60%,97%)] transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-muted/60 shrink-0 ${node.iconColor || "text-primary"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{node.name}</p>
                      <p className="text-[11px] text-muted-foreground">{count} relatório{count !== 1 ? "s" : ""}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                  </button>
                );
              })}
            </Card>
          )}
        </div>
      )}

      {/* Inside Folder: Subfolders */}
      {!isRoot && displayChildren.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {displayChildren.length} pasta{displayChildren.length !== 1 ? "s" : ""}
          </p>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {displayChildren.map(node => {
                const Icon = node.icon || Folder;
                const count = folderCount(node);
                return (
                  <button key={node.id} onClick={() => navigateTo(node.id)} className="text-left group">
                    <Card className="p-4 h-full hover:shadow-md hover:border-primary/20 transition-all duration-200 group-hover:-translate-y-0.5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-muted/60 text-muted-foreground">
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-[13px] font-semibold text-foreground leading-tight">{node.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{count} item{count !== 1 ? "s" : ""}</p>
                    </Card>
                  </button>
                );
              })}
            </div>
          ) : (
            <Card className="overflow-hidden divide-y divide-border">
              {displayChildren.map(node => {
                const Icon = node.icon || Folder;
                const count = folderCount(node);
                return (
                  <button
                    key={node.id}
                    onClick={() => navigateTo(node.id)}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-[hsl(213,60%,97%)] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted/60 text-muted-foreground shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-foreground">{node.name}</p>
                      <p className="text-[11px] text-muted-foreground">{count} item{count !== 1 ? "s" : ""}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                  </button>
                );
              })}
            </Card>
          )}
        </div>
      )}

      {/* Inside Folder: Files */}
      {!isRoot && displayFiles.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {displayFiles.length} relatório{displayFiles.length !== 1 ? "s" : ""}
          </p>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayFiles.map(file => (
                <Card
                  key={file.id}
                  className="p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
                  onClick={() => handleExport(file)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      file.type === "pdf" ? "bg-destructive/10" : "bg-accent/10"
                    }`}>
                      {file.type === "pdf" ? <File className="w-5 h-5 text-destructive" /> : <FileSpreadsheet className="w-5 h-5 text-accent" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-foreground leading-tight">{file.name}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <FreqBadge freq={file.frequency} />
                        <StatusBadge status={file.status} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5">{file.generatedAt} · {file.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <Button variant="outline" size="sm" className="h-7 text-xs flex-1 gap-1.5" onClick={(e) => { e.stopPropagation(); handleExport(file); }}>
                      <Download className="w-3 h-3" /> Exportar {file.type.toUpperCase()}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5" onClick={(e) => { e.stopPropagation(); handleExport(file); }}>
                      <Eye className="w-3 h-3" /> Ver
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              {/* List Header */}
              <div className="grid grid-cols-[1fr,100px,100px,90px,80px,40px] gap-2 px-4 py-2 border-b border-border bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Nome</span>
                <span>Frequência</span>
                <span>Estado</span>
                <span>Data</span>
                <span>Tamanho</span>
                <span></span>
              </div>
              <div className="divide-y divide-border">
                {displayFiles.map(file => (
                  <div
                    key={file.id}
                    className="grid grid-cols-[1fr,100px,100px,90px,80px,40px] gap-2 items-center px-4 py-3 hover:bg-[hsl(213,60%,97%)] transition-colors cursor-pointer group"
                    onClick={() => handleExport(file)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        file.type === "pdf" ? "bg-destructive/10" : "bg-accent/10"
                      }`}>
                        {file.type === "pdf" ? <File className="w-4 h-4 text-destructive" /> : <FileSpreadsheet className="w-4 h-4 text-accent" />}
                      </div>
                      <p className="text-[13px] font-medium text-foreground truncate">{file.name}</p>
                    </div>
                    <FreqBadge freq={file.frequency} />
                    <StatusBadge status={file.status} />
                    <span className="text-[11px] text-muted-foreground">{file.generatedAt}</span>
                    <span className="text-[11px] text-muted-foreground">{file.size}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); handleExport(file); }}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isRoot && displayChildren.length === 0 && displayFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Sem relatórios ainda</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Os relatórios serão gerados automaticamente</p>
        </div>
      )}
    </div>
  );
}

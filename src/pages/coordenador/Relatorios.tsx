import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3, FolderOpen, Folder, FileText, Download, Search,
  ChevronRight, Users, GraduationCap, BookOpen,
  Award, Wallet, TrendingUp, Clock,
  FileSpreadsheet, File, ArrowLeft, Grid3X3, List,
  Filter,
} from "lucide-react";

interface ReportFile {
  id: string;
  name: string;
  type: "pdf" | "csv";
  size: string;
  date: string;
  description: string;
  category: string;
}

interface ReportFolder {
  id: string;
  name: string;
  icon: React.ElementType;
  colorClass: string;
  subfolders: { id: string; name: string; files: ReportFile[] }[];
}

const Y = new Date().getFullYear();
const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const cm = months[new Date().getMonth()];
const pm = months[new Date().getMonth() - 1] || "Dezembro";

const folders: ReportFolder[] = [
  {
    id: "estudantes", name: "Estudantes", icon: Users, colorClass: "text-primary bg-primary/10",
    subfolders: [
      { id: "est-m", name: "Mensal", files: [
        { id:"e1", name:`Desempenho Geral Estudantes — ${cm} ${Y}`, type:"pdf", size:"245 KB", date:`${cm} ${Y}`, description:"Média, presença e aprovação por estudante", category:"Estudantes" },
        { id:"e2", name:`Estudantes em Risco — ${cm} ${Y}`, type:"pdf", size:"128 KB", date:`${cm} ${Y}`, description:"Estudantes com média < 10 ou presença < 75%", category:"Estudantes" },
        { id:"e3", name:`Registo de Presenças — ${cm} ${Y}`, type:"csv", size:"89 KB", date:`${cm} ${Y}`, description:"Presenças detalhadas por cadeira e turma", category:"Estudantes" },
        { id:"e4", name:`Desempenho Geral Estudantes — ${pm} ${Y}`, type:"pdf", size:"241 KB", date:`${pm} ${Y}`, description:"Média, presença e aprovação por estudante", category:"Estudantes" },
        { id:"e5", name:`Registo de Presenças — ${pm} ${Y}`, type:"csv", size:"87 KB", date:`${pm} ${Y}`, description:"Presenças detalhadas por cadeira e turma", category:"Estudantes" },
      ]},
      { id: "est-a", name: "Anual", files: [
        { id:"e6", name:`Resumo Anual Estudantes — ${Y}`, type:"pdf", size:"1.2 MB", date:`${Y}`, description:"Rankings, estatísticas e visão completa do ano", category:"Estudantes" },
        { id:"e7", name:`Base de Dados Estudantes — ${Y}`, type:"csv", size:"456 KB", date:`${Y}`, description:"Exportação completa de dados e notas", category:"Estudantes" },
        { id:"e8", name:`Aprovação por Ano Curricular — ${Y}`, type:"pdf", size:"312 KB", date:`${Y}`, description:"Comparação entre 1º, 2º, 3º e 4º ano", category:"Estudantes" },
      ]},
    ],
  },
  {
    id: "docentes", name: "Docentes", icon: GraduationCap, colorClass: "text-secondary bg-secondary/10",
    subfolders: [
      { id: "doc-m", name: "Mensal", files: [
        { id:"d1", name:`Desempenho Docentes — ${cm} ${Y}`, type:"pdf", size:"198 KB", date:`${cm} ${Y}`, description:"Presença, entrega e média dos estudantes por docente", category:"Docentes" },
        { id:"d2", name:`Carga Horária — ${cm} ${Y}`, type:"csv", size:"45 KB", date:`${cm} ${Y}`, description:"Horas, turmas e cadeiras por docente", category:"Docentes" },
        { id:"d3", name:`Desempenho Docentes — ${pm} ${Y}`, type:"pdf", size:"195 KB", date:`${pm} ${Y}`, description:"Presença, entrega e média dos estudantes por docente", category:"Docentes" },
      ]},
      { id: "doc-a", name: "Anual", files: [
        { id:"d4", name:`Avaliação Anual Docentes — ${Y}`, type:"pdf", size:"890 KB", date:`${Y}`, description:"Avaliação completa com métricas de qualidade", category:"Docentes" },
        { id:"d5", name:`Dados Docentes — ${Y}`, type:"csv", size:"123 KB", date:`${Y}`, description:"Exportação de dados de desempenho", category:"Docentes" },
      ]},
    ],
  },
  {
    id: "cadeiras", name: "Cadeiras & Avaliações", icon: BookOpen, colorClass: "text-accent bg-accent/10",
    subfolders: [
      { id: "cad-m", name: "Mensal", files: [
        { id:"c1", name:`Resultados Avaliações — ${cm} ${Y}`, type:"pdf", size:"345 KB", date:`${cm} ${Y}`, description:"Notas médias e distribuição por avaliação", category:"Cadeiras" },
        { id:"c2", name:`Dados Avaliações — ${cm} ${Y}`, type:"csv", size:"156 KB", date:`${cm} ${Y}`, description:"Dados detalhados de todas as avaliações", category:"Cadeiras" },
      ]},
      { id: "cad-a", name: "Anual", files: [
        { id:"c3", name:`Resumo por Cadeira — ${Y}`, type:"pdf", size:"567 KB", date:`${Y}`, description:"Desempenho por cadeira com comparação entre turmas", category:"Cadeiras" },
        { id:"c4", name:`Pautas Finais Oficiais — ${Y}`, type:"pdf", size:"1.8 MB", date:`${Y}`, description:"Pautas oficiais de todas as cadeiras", category:"Cadeiras" },
        { id:"c5", name:`Exportação Pautas — ${Y}`, type:"csv", size:"678 KB", date:`${Y}`, description:"Dados completos de todas as pautas finais", category:"Cadeiras" },
      ]},
    ],
  },
  {
    id: "notas", name: "Notas & Classificações", icon: Award, colorClass: "text-primary bg-primary/10",
    subfolders: [
      { id: "not-m", name: "Mensal", files: [
        { id:"n1", name:`Distribuição de Notas — ${cm} ${Y}`, type:"pdf", size:"267 KB", date:`${cm} ${Y}`, description:"Histograma e estatísticas por cadeira e ano", category:"Notas" },
        { id:"n2", name:`Rankings Estudantes — ${cm} ${Y}`, type:"pdf", size:"189 KB", date:`${cm} ${Y}`, description:"Top performers e classificações", category:"Notas" },
        { id:"n3", name:`Exportação Notas — ${cm} ${Y}`, type:"csv", size:"234 KB", date:`${cm} ${Y}`, description:"Todas as notas lançadas no mês", category:"Notas" },
      ]},
      { id: "not-a", name: "Anual", files: [
        { id:"n4", name:`Análise Anual de Notas — ${Y}`, type:"pdf", size:"1.1 MB", date:`${Y}`, description:"Análise estatística completa do ano", category:"Notas" },
        { id:"n5", name:`Pauta Geral do Curso — ${Y}`, type:"pdf", size:"2.3 MB", date:`${Y}`, description:"Classificações finais oficiais", category:"Notas" },
      ]},
    ],
  },
  {
    id: "financeiro", name: "Financeiro", icon: Wallet, colorClass: "text-secondary bg-secondary/10",
    subfolders: [
      { id: "fin-m", name: "Mensal", files: [
        { id:"f1", name:`Propinas & Pagamentos — ${cm} ${Y}`, type:"pdf", size:"178 KB", date:`${cm} ${Y}`, description:"Estado de pagamentos por estudante", category:"Financeiro" },
        { id:"f2", name:`Dados Financeiros — ${cm} ${Y}`, type:"csv", size:"67 KB", date:`${cm} ${Y}`, description:"Exportação financeira do mês", category:"Financeiro" },
      ]},
      { id: "fin-a", name: "Anual", files: [
        { id:"f3", name:`Resumo Financeiro — ${Y}`, type:"pdf", size:"456 KB", date:`${Y}`, description:"Balanço de receitas e pagamentos", category:"Financeiro" },
      ]},
    ],
  },
  {
    id: "geral", name: "Curso — Geral", icon: TrendingUp, colorClass: "text-accent bg-accent/10",
    subfolders: [
      { id: "ger-m", name: "Mensal", files: [
        { id:"g1", name:`Resumo Executivo — ${cm} ${Y}`, type:"pdf", size:"312 KB", date:`${cm} ${Y}`, description:"Síntese com KPIs principais do curso", category:"Geral" },
      ]},
      { id: "ger-s", name: "Semestral", files: [
        { id:"g2", name:`Relatório 1º Semestre — ${Y}`, type:"pdf", size:"2.1 MB", date:`${Y}`, description:"Relatório completo do semestre", category:"Geral" },
      ]},
      { id: "ger-a", name: "Anual", files: [
        { id:"g3", name:`Relatório Anual do Curso — ${Y}`, type:"pdf", size:"4.5 MB", date:`${Y}`, description:"Documento oficial do ano lectivo", category:"Geral" },
        { id:"g4", name:`Indicadores de Qualidade — ${Y}`, type:"pdf", size:"678 KB", date:`${Y}`, description:"Métricas de qualidade e acreditação", category:"Geral" },
      ]},
    ],
  },
];

const allFiles = folders.flatMap(f => f.subfolders.flatMap(sf => sf.files));

function TypeBadge({ type }: { type: "pdf" | "csv" }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
      type === "pdf" ? "bg-destructive/8 text-destructive" : "bg-accent/8 text-accent"
    }`}>
      {type === "pdf" ? <File className="w-3 h-3" /> : <FileSpreadsheet className="w-3 h-3" />}
      {type}
    </span>
  );
}

export default function CoordenadorRelatorios() {
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [activeSubfolder, setActiveSubfolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [typeFilter, setTypeFilter] = useState<"all" | "pdf" | "csv">("all");

  const folder = activeFolder ? folders.find(f => f.id === activeFolder) : null;
  const subfolder = folder && activeSubfolder ? folder.subfolders.find(sf => sf.id === activeSubfolder) : null;

  const currentFiles = useMemo(() => {
    let files: ReportFile[] = [];
    if (subfolder) files = subfolder.files;
    else if (folder) files = folder.subfolders.flatMap(sf => sf.files);
    else files = [];

    if (typeFilter !== "all") files = files.filter(f => f.type === typeFilter);
    if (search) files = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase()));
    return files;
  }, [folder, subfolder, typeFilter, search]);

  // Search across everything when no folder is active
  const globalSearchResults = useMemo(() => {
    if (!search || activeFolder) return [];
    return allFiles.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase()));
  }, [search, activeFolder]);

  const handleExport = (file: ReportFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    // Toast simulation
    const el = document.createElement("div");
    el.className = "fixed bottom-5 right-5 bg-card border border-border rounded-xl shadow-xl px-5 py-3.5 z-50 flex items-center gap-3 animate-fade-in";
    el.innerHTML = `<div class="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0"><svg class="w-4 h-4" style="color:hsl(var(--accent))" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg></div><div><p class="text-sm font-medium" style="color:hsl(var(--foreground))">A exportar ${file.type.toUpperCase()}...</p><p class="text-xs" style="color:hsl(var(--muted-foreground))">${file.name}</p></div>`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity 300ms"; setTimeout(() => el.remove(), 300); }, 2500);
  };

  // Breadcrumb
  const crumbs: { label: string; onClick: () => void }[] = [
    { label: "Relatórios", onClick: () => { setActiveFolder(null); setActiveSubfolder(null); } },
  ];
  if (folder) crumbs.push({ label: folder.name, onClick: () => { setActiveSubfolder(null); } });
  if (subfolder) crumbs.push({ label: subfolder.name, onClick: () => {} });

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Relatórios</h1>
            <p className="text-xs text-muted-foreground">{allFiles.length} documentos · Gerados automaticamente</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[11px] gap-1.5 font-normal">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Actualizado hoje
        </Badge>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Pesquisar relatórios..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <div className="flex-1" />
        {(activeFolder) && (
          <>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              {(["all","pdf","csv"] as const).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 text-[11px] font-medium transition-colors ${typeFilter === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                  {t === "all" ? "Todos" : t.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={`p-1.5 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Breadcrumb */}
      {activeFolder && (
        <div className="flex items-center gap-1 text-xs">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              <button onClick={c.onClick} className={`transition-colors ${i === crumbs.length - 1 ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                {c.label}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Global search results */}
      {!activeFolder && search && globalSearchResults.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <p className="text-xs font-medium text-muted-foreground">{globalSearchResults.length} resultado{globalSearchResults.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="divide-y divide-border">
            {globalSearchResults.map(file => (
              <div key={file.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${file.type === "pdf" ? "bg-destructive/8" : "bg-accent/8"}`}>
                  {file.type === "pdf" ? <File className="w-4 h-4 text-destructive" /> : <FileSpreadsheet className="w-4 h-4 text-accent" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{file.category} · {file.description}</p>
                </div>
                <TypeBadge type={file.type} />
                <span className="text-[11px] text-muted-foreground hidden sm:inline">{file.size}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => handleExport(file, e)}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Root: Folder Grid */}
      {!activeFolder && !search && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {folders.map(f => {
            const count = f.subfolders.reduce((s, sf) => s + sf.files.length, 0);
            return (
              <button key={f.id} onClick={() => setActiveFolder(f.id)} className="group text-left">
                <Card className="p-4 h-full hover:shadow-md hover:border-primary/20 transition-all duration-200 group-hover:-translate-y-0.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${f.colorClass}`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[13px] font-semibold text-foreground leading-tight">{f.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{count} ficheiro{count !== 1 ? "s" : ""}</p>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      {/* Root: Recent Files */}
      {!activeFolder && !search && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Recentes
          </p>
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {allFiles.filter(f => f.date.includes(cm)).slice(0, 10).map(file => (
                <div key={file.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${file.type === "pdf" ? "bg-destructive/8" : "bg-accent/8"}`}>
                    {file.type === "pdf" ? <File className="w-3.5 h-3.5 text-destructive" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-accent" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{file.description}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground hidden lg:inline shrink-0">{file.category}</span>
                  <TypeBadge type={file.type} />
                  <span className="text-[11px] text-muted-foreground shrink-0 hidden sm:inline">{file.size}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => handleExport(file, e)}>
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Inside a folder */}
      {folder && !subfolder && (
        <>
          {/* Subfolder cards */}
          <div className="flex gap-3">
            {folder.subfolders.map(sf => (
              <button key={sf.id} onClick={() => setActiveSubfolder(sf.id)} className="group text-left">
                <Card className="px-4 py-3 hover:shadow-md hover:border-primary/20 transition-all duration-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Folder className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{sf.name}</p>
                    <p className="text-[11px] text-muted-foreground">{sf.files.length} ficheiro{sf.files.length !== 1 ? "s" : ""}</p>
                  </div>
                </Card>
              </button>
            ))}
          </div>

          {/* All files in folder */}
          {viewMode === "list" ? (
            <Card className="overflow-hidden">
              <div className="divide-y divide-border">
                {currentFiles.map(file => (
                  <div key={file.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${file.type === "pdf" ? "bg-destructive/8" : "bg-accent/8"}`}>
                      {file.type === "pdf" ? <File className="w-4 h-4 text-destructive" /> : <FileSpreadsheet className="w-4 h-4 text-accent" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{file.description}</p>
                    </div>
                    <TypeBadge type={file.type} />
                    <span className="text-[11px] text-muted-foreground shrink-0 hidden sm:inline">{file.size}</span>
                    <span className="text-[11px] text-muted-foreground shrink-0 hidden md:inline">{file.date}</span>
                    <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => handleExport(file, e)}>
                      <Download className="w-3 h-3" /> Exportar
                    </Button>
                  </div>
                ))}
                {currentFiles.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum ficheiro encontrado.</div>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {currentFiles.map(file => (
                <Card key={file.id} className="p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200 group cursor-pointer" onClick={() => handleExport(file)}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${file.type === "pdf" ? "bg-destructive/8" : "bg-accent/8"}`}>
                    {file.type === "pdf" ? <File className="w-5 h-5 text-destructive" /> : <FileSpreadsheet className="w-5 h-5 text-accent" />}
                  </div>
                  <p className="text-[12px] font-semibold text-foreground leading-tight line-clamp-2 mb-1.5">{file.name}</p>
                  <div className="flex items-center gap-2">
                    <TypeBadge type={file.type} />
                    <span className="text-[10px] text-muted-foreground">{file.size}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Inside a subfolder */}
      {subfolder && (
        viewMode === "list" ? (
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {currentFiles.map(file => (
                <div key={file.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${file.type === "pdf" ? "bg-destructive/8" : "bg-accent/8"}`}>
                    {file.type === "pdf" ? <File className="w-4 h-4 text-destructive" /> : <FileSpreadsheet className="w-4 h-4 text-accent" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{file.description}</p>
                  </div>
                  <TypeBadge type={file.type} />
                  <span className="text-[11px] text-muted-foreground shrink-0 hidden sm:inline">{file.size}</span>
                  <span className="text-[11px] text-muted-foreground shrink-0 hidden md:inline">{file.date}</span>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => handleExport(file, e)}>
                    <Download className="w-3 h-3" /> Exportar
                  </Button>
                </div>
              ))}
              {currentFiles.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum ficheiro encontrado.</div>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentFiles.map(file => (
              <Card key={file.id} className="p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200 group cursor-pointer" onClick={() => handleExport(file)}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${file.type === "pdf" ? "bg-destructive/8" : "bg-accent/8"}`}>
                  {file.type === "pdf" ? <File className="w-5 h-5 text-destructive" /> : <FileSpreadsheet className="w-5 h-5 text-accent" />}
                </div>
                <p className="text-[12px] font-semibold text-foreground leading-tight line-clamp-2 mb-1.5">{file.name}</p>
                <div className="flex items-center gap-2">
                  <TypeBadge type={file.type} />
                  <span className="text-[10px] text-muted-foreground">{file.size}</span>
                </div>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}

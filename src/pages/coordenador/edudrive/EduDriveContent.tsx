import { useState, useMemo } from "react";
import { ChevronRight, Search, X, Grid3X3, List, Bell, Pin, Clock, Upload, ArrowUpDown, Filter, Eye, Download, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DriveNode, DriveFile, Frequency } from "./types";
import { driveTree, resolveNode, buildBreadcrumbs, allFiles, seedNotifications, seedRecent, seedPinned } from "./data";
import { FolderIcon, FileIcon, StatusBadge, FrequencyBadge } from "./components";

type ViewMode = "grid" | "list";
type SortBy = "name" | "date" | "type";
type FilterBy = "all" | "mensal" | "semestral" | "anual" | "documentos";

interface ContentProps {
  currentPath: string[];
  onNavigate: (path: string[]) => void;
  onSelectFile: (file: DriveFile) => void;
  selectedFile: DriveFile | null;
}

export default function EduDriveContent({ currentPath, onNavigate, onSelectFile, selectedFile }: ContentProps) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [filterBy, setFilterBy] = useState<FilterBy>("all");
  const [showNotifs, setShowNotifs] = useState(false);

  const node = resolveNode(currentPath);
  const crumbs = buildBreadcrumbs(currentPath);
  const isRoot = currentPath.length === 0;

  const folders = node?.children || (isRoot ? driveTree : []);
  const files = node?.files || [];

  const q = search.toLowerCase();

  const filteredFolders = search ? folders.filter(f => f.name.toLowerCase().includes(q)) : folders;

  const filteredFiles = useMemo(() => {
    let ff = search ? files.filter(f => f.name.toLowerCase().includes(q)) : files;
    if (filterBy !== "all") {
      if (filterBy === "documentos") ff = ff.filter(f => f.isDocument);
      else ff = ff.filter(f => f.frequency === filterBy);
    }
    ff = [...ff].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "date") return (b.generatedAt || "").localeCompare(a.generatedAt || "");
      return a.fileType.localeCompare(b.fileType);
    });
    return ff;
  }, [files, search, q, filterBy, sortBy]);

  const globalResults = useMemo(() => {
    if (!isRoot || !search) return [];
    return allFiles.filter(f => f.name.toLowerCase().includes(q)).slice(0, 15);
  }, [isRoot, search, q]);

  const unreadNotifs = seedNotifications.filter(n => !n.read).length;

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-background">
      {/* ─── Top Bar ─── */}
      <div className="shrink-0 px-6 pt-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-0.5 text-[13px] min-w-0 overflow-x-auto">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-0.5 shrink-0">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 mx-0.5" />}
                <button onClick={() => onNavigate(c.pathIds)} className={`hover:underline underline-offset-2 truncate max-w-[160px] ${i === crumbs.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {c.label}
                </button>
              </span>
            ))}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-4.5 h-4.5 text-muted-foreground" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">{unreadNotifs}</span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-10 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border"><p className="text-[13px] font-semibold text-foreground">Notificações</p></div>
                <div className="max-h-64 overflow-y-auto">
                  {seedNotifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b border-border/50 ${!n.read ? "bg-primary/5" : ""}`}>
                      <p className="text-[12px] text-foreground">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{n.createdAt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input placeholder="Pesquisar ficheiros e pastas…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs border-border bg-card" />
            {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>}
          </div>

          {/* View Toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button onClick={() => setView("grid")} className={`p-1.5 transition-colors ${view === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setView("list")} className={`p-1.5 transition-colors ${view === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}><List className="w-4 h-4" /></button>
          </div>

          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)} className="h-8 px-2 text-xs border border-border rounded-lg bg-card text-foreground">
            <option value="name">Nome</option>
            <option value="date">Data</option>
            <option value="type">Tipo</option>
          </select>

          {/* Filter */}
          <select value={filterBy} onChange={e => setFilterBy(e.target.value as FilterBy)} className="h-8 px-2 text-xs border border-border rounded-lg bg-card text-foreground">
            <option value="all">Todos</option>
            <option value="mensal">Mensal</option>
            <option value="semestral">Semestral</option>
            <option value="anual">Anual</option>
            <option value="documentos">Documentos</option>
          </select>
        </div>
      </div>

      {/* ─── Content Area ─── */}
      <div className="flex-1 overflow-y-auto px-6 py-4">

        {/* Global search results */}
        {isRoot && search && globalResults.length > 0 && (
          <Section label={`${globalResults.length} resultado${globalResults.length > 1 ? "s" : ""}`}>
            <FileList files={globalResults} view="list" onSelect={onSelectFile} selectedId={selectedFile?.id} />
          </Section>
        )}
        {isRoot && search && globalResults.length === 0 && <EmptyState message="Nenhum resultado encontrado" sub="Tente pesquisar com outros termos" />}

        {/* Root: Pinned + Recent + Folders */}
        {isRoot && !search && (
          <>
            {/* Pinned */}
            {seedPinned.length > 0 && (
              <Section label="Fixados" icon={<Pin className="w-3 h-3" />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {seedPinned.map(p => (
                    <button key={p.file.id} onClick={() => onSelectFile(p.file)}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-lg border border-border hover:border-primary/20 hover:bg-[hsl(213,100%,97%)] transition-all text-left group">
                      <FileIcon file={p.file} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium text-foreground truncate">{p.file.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{p.pathLabel}</p>
                      </div>
                      <Pin className="w-3 h-3 text-primary shrink-0" fill="currentColor" />
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {/* Recent */}
            <Section label="Recentes" icon={<Clock className="w-3 h-3" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {seedRecent.map(r => (
                  <button key={r.file.id} onClick={() => onSelectFile(r.file)}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/40 transition-all text-left group">
                    <FileIcon file={r.file} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-foreground truncate">{r.file.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[10px] text-muted-foreground truncate">{r.pathLabel}</p>
                        <span className="text-[10px] text-muted-foreground/50">·</span>
                        <span className="text-[10px] text-muted-foreground/70 shrink-0">{r.openedAt}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Section>
          </>
        )}

        {/* Folders */}
        {(isRoot ? !search : true) && filteredFolders.length > 0 && (
          <Section label={isRoot ? "Pastas" : undefined}>
            {view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredFolders.map(f => (
                  <button key={f.id} onClick={() => onNavigate([...currentPath, f.id])}
                    className="flex items-center gap-3 px-3.5 py-3.5 rounded-lg border border-transparent hover:border-border hover:bg-muted/40 hover:shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all text-left group">
                    <FolderIcon className="w-10 h-8 shrink-0" isDocument={f.isDocumentFolder} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-foreground truncate">{f.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {(f.children?.length || 0) + (f.files?.length || 0)} itens
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground/40 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <table className="w-full text-left">
                <thead><tr className="border-b border-border text-[11px] text-muted-foreground">
                  <th className="py-2 font-medium">Nome</th>
                  <th className="py-2 font-medium w-20">Itens</th>
                  <th className="py-2 w-8"></th>
                </tr></thead>
                <tbody>
                  {filteredFolders.map(f => (
                    <tr key={f.id} onClick={() => onNavigate([...currentPath, f.id])} className="border-b border-border/50 hover:bg-muted/40 cursor-pointer transition-colors">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <FolderIcon className="w-8 h-6 shrink-0" isDocument={f.isDocumentFolder} />
                          <span className="text-[13px] font-medium text-foreground">{f.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-[12px] text-muted-foreground">{(f.children?.length || 0) + (f.files?.length || 0)}</td>
                      <td><ChevronRight className="w-4 h-4 text-muted-foreground/30" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>
        )}

        {/* Files */}
        {filteredFiles.length > 0 && (
          <Section label={filteredFolders.length > 0 ? "Ficheiros" : undefined}>
            <FileList files={filteredFiles} view={view} onSelect={onSelectFile} selectedId={selectedFile?.id} />
          </Section>
        )}

        {/* Empty */}
        {!isRoot && filteredFolders.length === 0 && filteredFiles.length === 0 && (
          <EmptyState
            message={node?.isDocumentFolder ? "Nenhum documento carregado" : "Sem relatórios ainda"}
            sub={node?.isDocumentFolder ? "Carregue documentos para esta pasta" : "Os relatórios serão gerados automaticamente"}
            showUpload={node?.isDocumentFolder}
          />
        )}
      </div>
    </div>
  );
}

// ─── Sub components ──────────────────────────────────────
function Section({ label, icon, children }: { label?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      {label && (
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          {icon} {label}
        </p>
      )}
      {children}
    </div>
  );
}

function FileList({ files, view, onSelect, selectedId }: { files: DriveFile[]; view: ViewMode; onSelect: (f: DriveFile) => void; selectedId?: string }) {
  if (view === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {files.map(f => (
          <button key={f.id} onClick={() => onSelect(f)}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-lg border transition-all text-left group
              ${selectedId === f.id ? "border-primary/30 bg-[hsl(213,100%,97%)]" : "border-transparent hover:border-border hover:bg-muted/40 hover:shadow-[0_1px_3px_rgba(0,0,0,0.08)]"}
            `}>
            <FileIcon file={f} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-foreground truncate">{f.name}</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <FrequencyBadge frequency={f.frequency} />
                <StatusBadge status={f.status} />
              </div>
              {f.generatedAt && <p className="text-[10px] text-muted-foreground mt-1">{f.generatedAt} · {f.size}</p>}
            </div>
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <table className="w-full text-left">
      <thead><tr className="border-b border-border text-[11px] text-muted-foreground">
        <th className="py-2 font-medium">Nome</th>
        <th className="py-2 font-medium w-24">Frequência</th>
        <th className="py-2 font-medium w-28">Estado</th>
        <th className="py-2 font-medium w-28">Gerado</th>
        <th className="py-2 font-medium w-20">Tamanho</th>
        <th className="py-2 w-24"></th>
      </tr></thead>
      <tbody>
        {files.map(f => (
          <tr key={f.id} onClick={() => onSelect(f)}
            className={`border-b border-border/50 cursor-pointer transition-colors group
              ${selectedId === f.id ? "bg-[hsl(213,100%,97%)]" : "hover:bg-muted/40"}
            `}>
            <td className="py-2.5">
              <div className="flex items-center gap-2.5">
                <FileIcon file={f} size="sm" />
                <span className="text-[13px] font-medium text-foreground">{f.name}</span>
              </div>
            </td>
            <td className="py-2.5"><FrequencyBadge frequency={f.frequency} /></td>
            <td className="py-2.5"><StatusBadge status={f.status} /></td>
            <td className="py-2.5 text-[12px] text-muted-foreground">{f.generatedAt || "—"}</td>
            <td className="py-2.5 text-[12px] text-muted-foreground">{f.size}</td>
            <td className="py-2.5">
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Share2 className="w-3.5 h-3.5" /></Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EmptyState({ message, sub, showUpload }: { message: string; sub: string; showUpload?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <FolderIcon className="w-16 h-12 opacity-20 mb-4" />
      <p className="text-sm font-medium text-foreground/60">{message}</p>
      <p className="text-xs text-muted-foreground/50 mt-1">{sub}</p>
      {showUpload && (
        <Button variant="outline" size="sm" className="mt-4 gap-2">
          <Upload className="w-4 h-4" /> Carregar Documento
        </Button>
      )}
    </div>
  );
}

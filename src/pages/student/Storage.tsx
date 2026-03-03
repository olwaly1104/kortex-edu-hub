import { storageFiles, lessons, disciplines } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { HardDrive, Search, Upload, Folder, FileText, Table2, Presentation, Image, File, MoreVertical, List, LayoutGrid, Share2, Trash2, Video, ChevronRight, ArrowLeft, Plus, BookOpen } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const icons: Record<string, React.ElementType> = {
  folder: Folder, document: FileText, spreadsheet: Table2, presentation: Presentation, pdf: FileText, image: Image, other: File,
};

type FilterId = "all" | "folders" | "shared" | "document" | "spreadsheet" | "presentation" | "lessons" | "contents" | "trash";

const filters: { id: FilterId; label: string; icon?: React.ElementType }[] = [
  { id: "all", label: "Todos" },
  { id: "lessons", label: "Aulas", icon: Video },
  { id: "contents", label: "Conteúdos", icon: BookOpen },
  { id: "folders", label: "Pastas", icon: Folder },
  
  { id: "shared", label: "Partilhados", icon: Share2 },
  { id: "trash", label: "Lixo", icon: Trash2 },
  { id: "document", label: "Word", icon: FileText },
  { id: "spreadsheet", label: "Excel", icon: Table2 },
  { id: "presentation", label: "PowerPoint", icon: Presentation },
];

export default function StudentStorage() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);
  // For "all" view: when user clicks a discipline folder, show sub-folders
  const [allViewDiscipline, setAllViewDiscipline] = useState<string | null>(null);
  // Sub-folder inside a discipline in "all" view: "lessons" or "contents"
  const [allViewSubFolder, setAllViewSubFolder] = useState<"lessons" | "contents" | null>(null);
  const usedGB = 4.2;
  const totalGB = 10;

  // Build filtered file list for all filters
  const getFilteredFiles = () => {
    if (activeFilter === "folders") return storageFiles.filter(f => f.type === "folder" && !f.deleted);
    if (activeFilter === "shared") return storageFiles.filter(f => f.shared && !f.deleted);
    if (activeFilter === "trash") return storageFiles.filter(f => f.deleted);
    if (activeFilter === "document" || activeFilter === "spreadsheet" || activeFilter === "presentation")
      return storageFiles.filter(f => f.type === activeFilter && !f.deleted);
    return storageFiles.filter(f => !f.deleted);
  };
  const filtered = getFilteredFiles();
  const filterLabel = filters.find(f => f.id === activeFilter)?.label || "Todos";

  const disciplinesWithContent = disciplines.filter(d => lessons.some(l => l.disciplineId === d.id));
  const selectedDiscLessons = selectedDiscipline ? lessons.filter(l => l.disciplineId === selectedDiscipline) : [];
  const selectedDisc = selectedDiscipline ? disciplines.find(d => d.id === selectedDiscipline) : null;

  // For "all" view discipline drill-down
  const allViewDiscObj = allViewDiscipline ? disciplines.find(d => d.id === allViewDiscipline) : null;
  const allViewDiscLessons = allViewDiscipline ? lessons.filter(l => l.disciplineId === allViewDiscipline) : [];

  const handleFilterClick = (id: FilterId) => {
    setActiveFilter(activeFilter === id ? "all" : id);
    setSelectedDiscipline(null);
    setAllViewDiscipline(null);
    setAllViewSubFolder(null);
  };

  // Render discipline carousel (shared between lessons, contents, and all view)
  const renderDisciplineCarousel = (onClick: (id: string) => void) => (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {disciplinesWithContent.map(d => {
        const lessonCount = lessons.filter(l => l.disciplineId === d.id).length;
        const contentCount = lessons.filter(l => l.disciplineId === d.id).flatMap(l => l.materials).length;
        return (
          <Card
            key={d.id}
            className="p-3 w-[200px] shrink-0 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-3"
            onClick={() => onClick(d.id)}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: d.color + "20", color: d.color }}>
              <Folder className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{d.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{lessonCount} aulas · {contentCount} ficheiros</p>
            </div>
          </Card>
        );
      })}
    </div>
  );

  // Render lessons list for a discipline
  const renderLessons = (discLessons: typeof lessons) => (
    <div className="space-y-2">
      {discLessons.map(l => (
        <Link key={l.id} to={`/student/disciplines/${l.disciplineId}/lessons/${l.id}`}>
          <Card className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer">
            <Video className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Aula {l.number}: {l.title}</p>
              <p className="text-[11px] text-muted-foreground">{l.professor} • {l.duration}</p>
            </div>
            <span className="text-xs text-muted-foreground">{l.date}</span>
          </Card>
        </Link>
      ))}
    </div>
  );

  // Render contents/materials for a discipline
  const renderContents = (discLessons: typeof lessons) => {
    const allMaterials = discLessons.flatMap(l => l.materials.map((m, i) => ({ ...m, lessonNumber: l.number, lessonId: l.id, idx: i })));
    return (
      <div className="space-y-2">
        {allMaterials.map((m, i) => (
          <Card key={`${m.lessonId}-${m.idx}`} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer">
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
              <p className="text-[11px] text-muted-foreground">Aula {m.lessonNumber} • {m.type.toUpperCase()}</p>
            </div>
          </Card>
        ))}
        {allMaterials.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">Sem conteúdos disponíveis.</div>
        )}
      </div>
    );
  };

  // Render file list
  const renderFileList = () => (
    viewMode === "list" ? (
      <Card>
        <div className="divide-y">
          {filtered.map(f => {
            const Icon = icons[f.type] || File;
            return (
              <div key={f.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer">
                <Icon className={cn("w-5 h-5 shrink-0", f.type === "folder" ? "text-secondary" : "text-primary")} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                  {f.shared && f.sharedBy && <p className="text-[11px] text-muted-foreground">Partilhado por {f.sharedBy}</p>}
                </div>
                <span className="text-xs text-muted-foreground">{f.date}</span>
                <span className="text-xs text-muted-foreground w-16 text-right">{f.size || "—"}</span>
                <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0"><MoreVertical className="w-4 h-4" /></Button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">Nenhum ficheiro encontrado.</div>
          )}
        </div>
      </Card>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map(f => {
          const Icon = icons[f.type] || File;
          return (
            <Card key={f.id} className="p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow cursor-pointer">
              <Icon className={cn("w-10 h-10", f.type === "folder" ? "text-secondary" : "text-primary")} />
              <p className="text-sm font-medium text-foreground text-center truncate w-full">{f.name}</p>
              <p className="text-xs text-muted-foreground">{f.size || "Pasta"}</p>
              {f.shared && f.sharedBy && <p className="text-[10px] text-muted-foreground">por {f.sharedBy}</p>}
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-muted-foreground">Nenhum ficheiro encontrado.</div>
        )}
      </div>
    )
  );

  // Determine main content
  const renderContent = () => {
    // Drill-down: discipline selected for lessons
    if ((activeFilter === "lessons") && selectedDiscipline) {
      return (
        <div className="space-y-3">
          <button onClick={() => setSelectedDiscipline(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar às cadeiras
          </button>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-secondary" />
            <h2 className="text-sm font-semibold text-foreground">{selectedDisc?.name} — Aulas Gravadas</h2>
          </div>
          {renderLessons(selectedDiscLessons)}
        </div>
      );
    }

    // Drill-down: discipline selected for contents
    if (activeFilter === "contents" && selectedDiscipline) {
      return (
        <div className="space-y-3">
          <button onClick={() => setSelectedDiscipline(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar às cadeiras
          </button>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-secondary" />
            <h2 className="text-sm font-semibold text-foreground">{selectedDisc?.name} — Conteúdos</h2>
          </div>
          {renderContents(selectedDiscLessons)}
        </div>
      );
    }

    // "All" view sub-folder drill-down
    if (activeFilter === "all" && allViewDiscipline && allViewSubFolder) {
      return (
        <div className="space-y-3">
          <button onClick={() => setAllViewSubFolder(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar a {allViewDiscObj?.name}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-secondary" />
            <h2 className="text-sm font-semibold text-foreground">
              {allViewDiscObj?.name} — {allViewSubFolder === "lessons" ? "Aulas Gravadas" : "Conteúdos"}
            </h2>
          </div>
          {allViewSubFolder === "lessons" ? renderLessons(allViewDiscLessons) : renderContents(allViewDiscLessons)}
        </div>
      );
    }

    // "All" view discipline picked — show sub-folders
    if (activeFilter === "all" && allViewDiscipline) {
      return (
        <div className="space-y-3">
          <button onClick={() => setAllViewDiscipline(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-primary" />
            <h2 className="text-sm font-semibold text-foreground">{allViewDiscObj?.name}</h2>
          </div>
          <div className="space-y-2">
            <Card className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setAllViewSubFolder("lessons")}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <Video className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Aulas Gravadas</p>
                <p className="text-[11px] text-muted-foreground">{allViewDiscLessons.length} aula{allViewDiscLessons.length !== 1 ? "s" : ""}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Card>
            <Card className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setAllViewSubFolder("contents")}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Conteúdos</p>
                <p className="text-[11px] text-muted-foreground">{allViewDiscLessons.flatMap(l => l.materials).length} ficheiro{allViewDiscLessons.flatMap(l => l.materials).length !== 1 ? "s" : ""}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Card>
          </div>
        </div>
      );
    }

    // Default for ALL filters: discipline carousel + recentes file list
    const carouselOnClick = activeFilter === "all"
      ? (id: string) => setAllViewDiscipline(id)
      : (id: string) => setSelectedDiscipline(id);

    return (
      <>
        {/* Discipline carousel */}
        <div className="mb-5 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-primary" />
            <h2 className="text-sm font-semibold text-foreground">Cadeiras</h2>
            <span className="text-[11px] text-muted-foreground">({disciplinesWithContent.length})</span>
          </div>
          {renderDisciplineCarousel(carouselOnClick)}
        </div>

        {/* Recentes */}
        <div className="space-y-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-secondary" />
            <h2 className="text-sm font-semibold text-foreground">Recentes{activeFilter !== "all" ? ` — ${filterLabel}` : ""}</h2>
          </div>
        </div>
        {renderFileList()}
      </>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <HardDrive className="w-6 h-6 text-primary" /> Armazenamento
        </h1>
        <Button className="gap-2" size="sm"><Upload className="w-4 h-4" />Carregar ficheiro</Button>
      </div>

      {/* Storage usage card */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-foreground">Espaço utilizado</p>
            <p className="text-xs text-muted-foreground mt-0.5">{usedGB} GB de {totalGB} GB utilizados</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{Math.round((usedGB / totalGB) * 100)}%</p>
          </div>
        </div>
        <Progress value={(usedGB / totalGB) * 100} className="h-2 mb-3" />
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" />Documentos · 1.8 GB</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary" />Gravações · 1.6 GB</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-muted-foreground/30" />Outros · 0.8 GB</span>
          </div>
          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-7">
            <Plus className="w-3 h-3" />Obter mais espaço
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          {filters.slice(0, 6).map(f => (
            <button
              key={f.id}
              onClick={() => handleFilterClick(f.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
                activeFilter === f.id ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {f.icon && <f.icon className="w-3.5 h-3.5" />}
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.slice(6).map(f => (
            <button
              key={f.id}
              onClick={() => handleFilterClick(f.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
                activeFilter === f.id ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {f.icon && <f.icon className="w-3.5 h-3.5" />}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar ficheiros..." className="pl-9" />
        </div>
        <div className="flex bg-muted rounded-lg p-0.5">
          <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-md", viewMode === "list" ? "bg-card shadow-sm" : "")}><List className="w-4 h-4" /></button>
          <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-md", viewMode === "grid" ? "bg-card shadow-sm" : "")}><LayoutGrid className="w-4 h-4" /></button>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}

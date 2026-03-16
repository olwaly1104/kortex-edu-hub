import { BarChart3, BookOpen, Users, GraduationCap, Wallet, FileText } from "lucide-react";
import { driveTree } from "./data";

const rootIcons: Record<string, React.ReactNode> = {
  "bar-chart": <BarChart3 className="w-4 h-4" />,
  "book-open": <BookOpen className="w-4 h-4" />,
  "users": <Users className="w-4 h-4" />,
  "graduation-cap": <GraduationCap className="w-4 h-4" />,
  "wallet": <Wallet className="w-4 h-4" />,
  "file-text": <FileText className="w-4 h-4" />,
};

interface SidebarProps {
  currentPath: string[];
  onNavigate: (path: string[]) => void;
}

export default function EduDriveSidebar({ currentPath, onNavigate }: SidebarProps) {
  const activeRootId = currentPath[0];

  return (
    <div className="w-[260px] shrink-0 border-r border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">UAN</span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground truncate">EduDrive</p>
            <p className="text-[10px] text-muted-foreground truncate">Engenharia Informática</p>
          </div>
        </div>
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
            2025/2026
          </span>
        </div>
      </div>

      <div className="border-t border-border mx-3" />

      {/* Fixed root folders */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {driveTree.map(node => {
          const active = activeRootId === node.id;
          return (
            <button
              key={node.id}
              onClick={() => onNavigate([node.id])}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-colors
                ${active ? "bg-primary text-primary-foreground font-medium" : "text-foreground/80 hover:bg-muted"}
              `}
            >
              <span className={active ? "text-primary-foreground" : "text-muted-foreground"}>
                {node.icon ? rootIcons[node.icon] : null}
              </span>
              <span className="truncate">{node.name}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-[11px] font-bold">MD</span>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-foreground truncate">Manuel Domingos</p>
            <span className="text-[10px] text-muted-foreground">Coordenador</span>
          </div>
        </div>
      </div>
    </div>
  );
}

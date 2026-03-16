import { useState, useMemo } from "react";
import { ChevronRight, BarChart3, BookOpen, Users, GraduationCap, Wallet, FileText } from "lucide-react";
import { DriveNode } from "./types";
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
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Auto-expand nodes in current path
  const autoExpanded = useMemo(() => {
    const set = new Set<string>();
    const acc: string[] = [];
    for (const seg of currentPath) { acc.push(seg); set.add(acc.join("/")); }
    return set;
  }, [currentPath]);

  const isExpanded = (id: string, depth: string[]) => {
    const key = [...depth, id].join("/");
    return expanded.has(key) || autoExpanded.has(key);
  };

  const toggle = (id: string, depth: string[]) => {
    const key = [...depth, id].join("/");
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const isActive = (nodeId: string) => currentPath[currentPath.length - 1] === nodeId;

  const renderNode = (node: DriveNode, depth: string[], level: number) => {
    const hasChildren = node.children && node.children.length > 0;
    const open = isExpanded(node.id, depth);
    const active = isActive(node.id);
    const pathToNode = [...depth, node.id];

    // Build the path IDs for navigation
    const navPath = buildNavPath(node.id);

    return (
      <div key={node.id}>
        <button
          onClick={() => {
            if (hasChildren) toggle(node.id, depth);
            onNavigate(navPath);
          }}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-colors group
            ${active ? "bg-primary text-primary-foreground font-medium" : "text-foreground/80 hover:bg-muted"}
          `}
          style={{ paddingLeft: `${8 + level * 16}px` }}
        >
          {hasChildren ? (
            <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""} ${active ? "text-primary-foreground/70" : "text-muted-foreground"}`} />
          ) : (
            <span className="w-3.5 shrink-0" />
          )}
          {level === 0 && node.icon && (
            <span className={active ? "text-primary-foreground" : "text-muted-foreground"}>
              {rootIcons[node.icon]}
            </span>
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {hasChildren && open && (
          <div>
            {node.children!.map(child => renderNode(child, pathToNode, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Build navigation path from node id by traversing the tree
  const buildNavPath = (targetId: string): string[] => {
    const search = (nodes: DriveNode[], acc: string[]): string[] | null => {
      for (const n of nodes) {
        const p = [...acc, n.id];
        if (n.id === targetId) return p;
        if (n.children) {
          const found = search(n.children, p);
          if (found) return found;
        }
      }
      return null;
    };
    return search(driveTree, []) || [];
  };

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

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {driveTree.map(node => renderNode(node, [], 0))}
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

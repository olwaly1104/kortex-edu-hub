import { Loader2, AlertCircle, Pin, Zap, ChevronRight } from "lucide-react";
import type { DriveFile, DriveNode, FileStatus, Frequency } from "./types";

// ─── Status Badge ────────────────────────────────────────
const statusConfig: Record<FileStatus, { label: string; className: string; icon?: React.ReactNode }> = {
  gerado: { label: "Auto Gerado", className: "bg-[hsl(142,71%,45%)]/10 text-[hsl(142,71%,35%)]", icon: <Zap className="w-3 h-3" /> },
  agendado: { label: "Em Progresso", className: "bg-primary/10 text-primary", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  a_gerar: { label: "A Gerar", className: "bg-[hsl(210,80%,55%)]/10 text-[hsl(210,80%,45%)]", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  dados_insuficientes: { label: "Dados Insuficientes", className: "bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,40%)]", icon: <AlertCircle className="w-3 h-3" /> },
  erro: { label: "Erro", className: "bg-destructive/10 text-destructive", icon: <AlertCircle className="w-3 h-3" /> },
};

export function StatusBadge({ status }: { status: FileStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.className}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Frequency Badge ─────────────────────────────────────
const freqConfig: Record<Frequency, { label: string; className: string }> = {
  mensal: { label: "Mensal", className: "bg-[hsl(175,84%,32%)]/10 text-[hsl(175,84%,28%)]" },
  semestral: { label: "Semestral", className: "bg-[hsl(271,91%,65%)]/10 text-[hsl(271,55%,45%)]" },
  anual: { label: "Anual", className: "bg-[hsl(38,92%,50%)]/10 text-[hsl(38,80%,35%)]" },
};

export function FrequencyBadge({ frequency }: { frequency?: Frequency }) {
  if (!frequency) return null;
  const cfg = freqConfig[frequency];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.className}`}>{cfg.label}</span>;
}

// ─── File Type Icon (Google Drive style) ─────────────────
const fileTypeConfig: Record<string, { color: string; bg: string; label: string; corner: string }> = {
  pdf: { color: "hsl(0,72%,51%)", bg: "hsl(0,72%,96%)", label: "PDF", corner: "hsl(0,72%,42%)" },
  csv: { color: "hsl(142,71%,40%)", bg: "hsl(142,71%,96%)", label: "CSV", corner: "hsl(142,71%,32%)" },
  docx: { color: "hsl(217,91%,50%)", bg: "hsl(217,91%,96%)", label: "DOC", corner: "hsl(217,91%,40%)" },
  xlsx: { color: "hsl(142,71%,35%)", bg: "hsl(142,71%,95%)", label: "XLS", corner: "hsl(142,71%,28%)" },
};

export function FileIcon({ file, size = "md" }: { file: DriveFile; size?: "sm" | "md" }) {
  const cfg = fileTypeConfig[file.fileType] || fileTypeConfig.pdf;
  const s = size === "sm" ? { w: 36, h: 44 } : { w: 40, h: 48 };
  const labelSize = size === "sm" ? "8" : "9";

  return (
    <svg width={s.w} height={s.h} viewBox={`0 0 ${s.w} ${s.h}`} fill="none" className="shrink-0">
      {/* Document body */}
      <rect x="1" y="1" width={s.w - 2} height={s.h - 2} rx="3" fill={cfg.bg} stroke={cfg.color} strokeWidth="1.2" opacity="0.9" />
      {/* Folded corner */}
      <path d={`M${s.w - 10} 1L${s.w - 1} 10`} stroke={cfg.color} strokeWidth="1.2" opacity="0.5" />
      <path d={`M${s.w - 10} 1v6a3 3 0 003 3h6`} fill={cfg.bg} stroke={cfg.color} strokeWidth="1.2" opacity="0.7" />
      {/* Lines decoration */}
      <line x1="7" y1={s.h * 0.4} x2={s.w - 12} y2={s.h * 0.4} stroke={cfg.color} strokeWidth="1" opacity="0.2" />
      <line x1="7" y1={s.h * 0.4 + 4} x2={s.w - 16} y2={s.h * 0.4 + 4} stroke={cfg.color} strokeWidth="1" opacity="0.15" />
      <line x1="7" y1={s.h * 0.4 + 8} x2={s.w - 20} y2={s.h * 0.4 + 8} stroke={cfg.color} strokeWidth="1" opacity="0.1" />
      {/* Type label */}
      <rect x="4" y={s.h - 15} width={s.w - 8} height="12" rx="2" fill={cfg.color} opacity="0.9" />
      <text x={s.w / 2} y={s.h - 6} textAnchor="middle" fill="white" fontSize={labelSize} fontWeight="700" fontFamily="system-ui">{cfg.label}</text>
    </svg>
  );
}

// ─── Folder Icon (Google Drive style) ────────────────────
export function FolderIcon({ className, isDocument }: { className?: string; isDocument?: boolean }) {
  const mainColor = isDocument ? "hsl(var(--muted-foreground))" : "hsl(210,70%,55%)";
  const lightColor = isDocument ? "hsl(var(--muted-foreground) / 0.15)" : "hsl(210,70%,92%)";
  const midColor = isDocument ? "hsl(var(--muted-foreground) / 0.25)" : "hsl(210,70%,82%)";

  return (
    <svg viewBox="0 0 48 40" fill="none" className={className || "w-10 h-8"}>
      {/* Back tab */}
      <path d="M6 6a3 3 0 013-3h8.76a3 3 0 012.35 1.14L22.5 7H39a3 3 0 013 3v1H6V6z" fill={midColor} />
      {/* Main body */}
      <rect x="3" y="9" width="42" height="28" rx="3" fill={lightColor} stroke={mainColor} strokeWidth="1" opacity="0.6" />
      {/* Front face */}
      <rect x="3" y="13" width="42" height="24" rx="3" fill={mainColor} opacity="0.18" />
      <rect x="3" y="13" width="42" height="24" rx="3" stroke={mainColor} strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}

// ─── Pin Icon Button ────────────────────────────────────
export function PinButton({ pinned, onClick }: { pinned: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button onClick={onClick} className={`p-1 rounded hover:bg-muted transition-colors ${pinned ? "text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"}`}>
      <Pin className="w-3.5 h-3.5" fill={pinned ? "currentColor" : "none"} />
    </button>
  );
}

// ─── Folder stats helper ────────────────────────────────
function countDeep(node: { children?: { children?: any[]; files?: any[] }[]; files?: any[] }): { folders: number; files: number } {
  const folders = node.children?.length || 0;
  const files = node.files?.length || 0;
  return { folders, files };
}

export function FolderMeta({ node }: { node: { children?: any[]; files?: any[] } }) {
  const { folders, files } = countDeep(node);
  const parts: string[] = [];
  if (folders > 0) parts.push(`${folders} pasta${folders !== 1 ? "s" : ""}`);
  if (files > 0) parts.push(`${files} ficheiro${files !== 1 ? "s" : ""}`);
  return <span className="text-[10px] text-muted-foreground">{parts.join(" · ") || "Vazio"}</span>;
}

import { File, FileSpreadsheet, FileText, Table2, Loader2, AlertCircle, Clock, CheckCircle2, Pin, Zap } from "lucide-react";
import type { DriveFile, FileStatus, Frequency } from "./types";

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

// ─── File Type Icon ──────────────────────────────────────
export function FileIcon({ file, size = "md" }: { file: DriveFile; size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-9 h-9" : "w-10 h-10";
  const is = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const configs: Record<string, { bg: string; text: string; label: string }> = {
    pdf: { bg: "bg-destructive/8", text: "text-destructive", label: "PDF" },
    csv: { bg: "bg-[hsl(175,84%,32%)]/8", text: "text-[hsl(175,84%,32%)]", label: "CSV" },
    docx: { bg: "bg-primary/8", text: "text-primary", label: "DOC" },
    xlsx: { bg: "bg-[hsl(142,71%,45%)]/8", text: "text-[hsl(142,71%,35%)]", label: "XLS" },
  };
  const iconMap: Record<string, React.ReactNode> = {
    pdf: <File className={is} />,
    csv: <Table2 className={is} />,
    docx: <FileText className={is} />,
    xlsx: <FileSpreadsheet className={is} />,
  };
  const cfg = configs[file.fileType] || configs.pdf;
  return (
    <div className={`${s} rounded-lg flex flex-col items-center justify-center shrink-0 ${cfg.bg} ${cfg.text} relative`}>
      {iconMap[file.fileType] || iconMap.pdf}
      <span className="text-[7px] font-bold uppercase tracking-wider mt-0.5 leading-none">{cfg.label}</span>
    </div>
  );
}

// ─── Folder Icon (SVG) ──────────────────────────────────
export function FolderIcon({ className, isDocument }: { className?: string; isDocument?: boolean }) {
  const color = isDocument ? "hsl(var(--muted-foreground))" : "hsl(var(--primary))";
  return (
    <svg viewBox="0 0 48 40" fill="none" className={className || "w-10 h-8"}>
      <path d="M4 8a4 4 0 014-4h10.34a4 4 0 013.12 1.5L24 8.5h16a4 4 0 014 4V32a4 4 0 01-4 4H8a4 4 0 01-4-4V8z" fill={color} opacity="0.15" />
      <path d="M4 12.5h40V32a4 4 0 01-4 4H8a4 4 0 01-4-4V12.5z" fill={color} opacity="0.3" />
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

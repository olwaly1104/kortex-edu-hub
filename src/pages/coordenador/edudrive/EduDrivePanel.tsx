import { useState } from "react";
import { X, Download, Share2, Clock, Eye, Upload, RefreshCw, Calendar, FileText, BarChart3, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DriveFile } from "./types";
import { FileIcon, StatusBadge, FrequencyBadge } from "./components";
import { toast } from "@/hooks/use-toast";

type Tab = "visualizar" | "exportar" | "historico" | "partilhar";

interface PanelProps {
  file: DriveFile;
  onClose: () => void;
}

export default function EduDrivePanel({ file, onClose }: PanelProps) {
  const [tab, setTab] = useState<Tab>("visualizar");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "visualizar", label: "Visualizar", icon: <Eye className="w-3.5 h-3.5" /> },
    { key: "exportar", label: "Exportar", icon: <Download className="w-3.5 h-3.5" /> },
    { key: "historico", label: "Histórico", icon: <Clock className="w-3.5 h-3.5" /> },
    { key: "partilhar", label: "Partilhar", icon: <Share2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="w-[360px] shrink-0 border-l border-border bg-card flex flex-col h-full animate-in slide-in-from-right-5 duration-200">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 mb-2">
              <FileIcon file={file} size="sm" />
              <p className="text-[14px] font-semibold text-foreground truncate">{file.name}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <FrequencyBadge frequency={file.frequency} />
              <StatusBadge status={file.status} />
            </div>
            {file.generatedAt && (
              <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {file.generatedAt} · {file.size}
              </p>
            )}
            {file.isDocument && file.uploadedBy && (
              <p className="text-[11px] text-muted-foreground mt-2">
                Carregado por {file.uploadedBy} {file.version && `· v${file.version}`}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-5">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium border-b-2 transition-colors
              ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}
            `}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {tab === "visualizar" && <PreviewTab file={file} />}
        {tab === "exportar" && <ExportTab file={file} />}
        {tab === "historico" && <HistoryTab file={file} />}
        {tab === "partilhar" && <ShareTab file={file} />}
      </div>

      {/* Bottom Action */}
      <div className="px-5 py-4 border-t border-border">
        {file.isDocument ? (
          <Button className="w-full gap-2" variant="outline">
            <Upload className="w-4 h-4" /> Upload Nova Versão
          </Button>
        ) : file.status === "agendado" ? (
          <div>
            <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Próxima geração: 01 Abr 2026
            </p>
            <Button className="w-full gap-2" onClick={() => toast({ title: "A gerar relatório…", description: file.name })}>
              <RefreshCw className="w-4 h-4" /> Gerar Agora
            </Button>
          </div>
        ) : file.status === "erro" ? (
          <Button className="w-full gap-2" variant="destructive" onClick={() => toast({ title: "A tentar novamente…", description: file.name })}>
            <RefreshCw className="w-4 h-4" /> Tentar Novamente
          </Button>
        ) : (
          <Button className="w-full gap-2" onClick={() => toast({ title: "A gerar relatório…", description: file.name })}>
            <RefreshCw className="w-4 h-4" /> Gerar Agora
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Preview Tab ─────────────────────────────────────────
function PreviewTab({ file }: { file: DriveFile }) {
  if (file.status !== "gerado") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <FileText className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-[13px] font-medium text-foreground/60">Pré-visualização indisponível</p>
        <p className="text-[11px] text-muted-foreground mt-1">
          {file.status === "agendado" ? "Este relatório ainda não foi gerado" : "Gere o relatório para visualizar"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mock chart */}
      <div className="rounded-lg border border-border p-4">
        <p className="text-[11px] font-medium text-muted-foreground mb-3">Resumo</p>
        <div className="grid grid-cols-2 gap-3">
          <MiniStat label="Estudantes" value="45" />
          <MiniStat label="Média Geral" value="14.2" />
          <MiniStat label="Taxa Aprovação" value="78%" />
          <MiniStat label="Assiduidade" value="89%" />
        </div>
      </div>

      {/* Mock bar chart */}
      <div className="rounded-lg border border-border p-4">
        <p className="text-[11px] font-medium text-muted-foreground mb-3">Distribuição de Notas</p>
        <div className="flex items-end gap-1.5 h-20">
          {[30, 45, 70, 85, 60, 40, 20].map((h, i) => (
            <div key={i} className="flex-1 bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[9px] text-muted-foreground">0-4</span>
          <span className="text-[9px] text-muted-foreground">18-20</span>
        </div>
      </div>

      {/* Mock table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <p className="text-[11px] font-medium text-muted-foreground px-4 py-2.5 bg-muted/30">Top 5 Estudantes</p>
        {["Ana Tchissola — 18.5", "João Cambuta — 17.8", "Maria Fernandes — 17.2", "Carlos Lopes — 16.9", "Teresa Neto — 16.5"].map((s, i) => (
          <div key={i} className="px-4 py-2 border-t border-border/50 text-[12px] text-foreground flex justify-between">
            <span>{s.split("—")[0]}</span>
            <span className="font-medium">{s.split("—")[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/30 px-3 py-2.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-[16px] font-semibold text-foreground mt-0.5">{value}</p>
    </div>
  );
}

// ─── Export Tab ──────────────────────────────────────────
function ExportTab({ file }: { file: DriveFile }) {
  return (
    <div className="space-y-3">
      <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => toast({ title: "A exportar PDF", description: file.name })}>
        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center"><FileText className="w-4 h-4 text-destructive" /></div>
        <div className="text-left"><p className="text-[12px] font-medium">Download PDF</p><p className="text-[10px] text-muted-foreground">{file.size}</p></div>
      </Button>
      <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => toast({ title: "A exportar CSV", description: file.name })}>
        <div className="w-8 h-8 rounded-lg bg-[hsl(142,71%,45%)]/10 flex items-center justify-center"><Table2 className="w-4 h-4 text-[hsl(142,71%,35%)]" /></div>
        <div className="text-left"><p className="text-[12px] font-medium">Download CSV</p><p className="text-[10px] text-muted-foreground">Dados tabulares</p></div>
      </Button>
    </div>
  );
}

// ─── History Tab ─────────────────────────────────────────
function HistoryTab({ file }: { file: DriveFile }) {
  const versions = file.status === "gerado" ? [
    { date: "15 Mar 2026, 00:05", size: file.size },
    { date: "15 Fev 2026, 00:03", size: "167 KB" },
    { date: "15 Jan 2026, 00:04", size: "154 KB" },
  ] : [];

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="w-8 h-8 text-muted-foreground/30 mb-3" />
        <p className="text-[13px] text-foreground/60">Sem histórico</p>
        <p className="text-[11px] text-muted-foreground mt-1">Nenhuma versão anterior disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {versions.map((v, i) => (
        <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
          <div>
            <p className="text-[12px] font-medium text-foreground">Versão {versions.length - i}</p>
            <p className="text-[10px] text-muted-foreground">{v.date} · {v.size}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}

// ─── Share Tab ───────────────────────────────────────────
function ShareTab({ file }: { file: DriveFile }) {
  const roles = ["Decano", "Reitoria", "Área Académica"];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-medium text-muted-foreground mb-2">Copiar link</p>
        <div className="flex gap-2">
          <div className="flex-1 h-8 px-3 rounded-lg border border-border bg-muted/30 flex items-center">
            <p className="text-[11px] text-muted-foreground truncate">https://edudrive.uan.ao/r/{file.id}</p>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast({ title: "Link copiado!" })}>
            Copiar
          </Button>
        </div>
      </div>
      <div>
        <p className="text-[11px] font-medium text-muted-foreground mb-2">Enviar para</p>
        <div className="space-y-2">
          {roles.map(role => (
            <button key={role} onClick={() => toast({ title: `Enviado para ${role}`, description: file.name })}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
              <span className="text-[12px] text-foreground">{role}</span>
              <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

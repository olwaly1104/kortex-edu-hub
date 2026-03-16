import { useState } from "react";
import { X, Download, Share2, Clock, Eye, Upload, RefreshCw, Calendar, FileText, BarChart3, Table2, Copy } from "lucide-react";
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
            <div className="flex items-center gap-3 mb-3">
              <FileIcon file={file} />
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-foreground truncate leading-tight">{file.name}</p>
                {file.generatedAt && (
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {file.generatedAt} · {file.size}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <FrequencyBadge frequency={file.frequency} />
              <StatusBadge status={file.status} />
            </div>
            {file.isDocument && file.uploadedBy && (
              <p className="text-[11px] text-muted-foreground mt-2">
                Carregado por {file.uploadedBy} {file.version && `· v${file.version}`}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-muted/20">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold border-b-2 transition-colors
              ${tab === t.key ? "border-primary text-primary bg-background" : "border-transparent text-muted-foreground hover:text-foreground"}
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
          <Button className="w-full gap-2 h-10" variant="outline">
            <Upload className="w-4 h-4" /> Upload Nova Versão
          </Button>
        ) : file.status === "agendado" ? (
          <div>
            <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Próxima geração automática prevista
            </p>
            <Button className="w-full gap-2 h-10" onClick={() => toast({ title: "A gerar relatório…", description: file.name })}>
              <RefreshCw className="w-4 h-4" /> Gerar Agora
            </Button>
          </div>
        ) : file.status === "erro" ? (
          <Button className="w-full gap-2 h-10" variant="destructive" onClick={() => toast({ title: "A tentar novamente…", description: file.name })}>
            <RefreshCw className="w-4 h-4" /> Tentar Novamente
          </Button>
        ) : (
          <Button className="w-full gap-2 h-10" onClick={() => toast({ title: "A gerar relatório…", description: file.name })}>
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
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <FileText className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-[13px] font-semibold text-foreground/60">Pré-visualização indisponível</p>
        <p className="text-[11px] text-muted-foreground mt-1.5 max-w-[200px]">
          {file.status === "agendado" ? "Este relatório está em progresso e será gerado automaticamente" : "Gere o relatório para visualizar"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border p-4">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resumo</p>
        <div className="grid grid-cols-2 gap-2.5">
          <MiniStat label="Estudantes" value="45" />
          <MiniStat label="Média Geral" value="14.2" />
          <MiniStat label="Taxa Aprovação" value="78%" />
          <MiniStat label="Assiduidade" value="89%" />
        </div>
      </div>

      <div className="rounded-xl border border-border p-4">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Distribuição de Notas</p>
        <div className="flex items-end gap-1.5 h-20">
          {[30, 45, 70, 85, 60, 40, 20].map((h, i) => (
            <div key={i} className="flex-1 bg-primary/20 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[9px] text-muted-foreground">0-4</span>
          <span className="text-[9px] text-muted-foreground">18-20</span>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5 bg-muted/30">Top 5 Estudantes</p>
        {["Ana Tchissola — 18.5", "João Cambuta — 17.8", "Maria Fernandes — 17.2", "Carlos Lopes — 16.9", "Teresa Neto — 16.5"].map((s, i) => (
          <div key={i} className="px-4 py-2.5 border-t border-border/50 text-[12px] text-foreground flex justify-between">
            <span className="font-medium">{s.split("—")[0]}</span>
            <span className="font-bold text-primary">{s.split("—")[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 px-3.5 py-3">
      <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
      <p className="text-lg font-bold text-foreground mt-0.5">{value}</p>
    </div>
  );
}

// ─── Export Tab ──────────────────────────────────────────
function ExportTab({ file }: { file: DriveFile }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Formatos disponíveis</p>
      <button
        onClick={() => toast({ title: "A exportar PDF", description: file.name })}
        className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-border bg-background hover:border-primary/20 hover:shadow-sm transition-all text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-destructive" />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-foreground">Download PDF</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{file.size} · Formato documento</p>
        </div>
        <Download className="w-4 h-4 text-muted-foreground" />
      </button>
      <button
        onClick={() => toast({ title: "A exportar CSV", description: file.name })}
        className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-border bg-background hover:border-primary/20 hover:shadow-sm transition-all text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-[hsl(142,71%,45%)]/10 flex items-center justify-center shrink-0">
          <Table2 className="w-5 h-5 text-[hsl(142,71%,35%)]" />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-foreground">Download CSV</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Dados tabulares</p>
        </div>
        <Download className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}

// ─── History Tab ─────────────────────────────────────────
function HistoryTab({ file }: { file: DriveFile }) {
  const versions = file.status === "gerado" ? [
    { date: "15 Mar 2026, 00:05", size: file.size, current: true },
    { date: "15 Fev 2026, 00:03", size: "167 KB", current: false },
    { date: "15 Jan 2026, 00:04", size: "154 KB", current: false },
  ] : [];

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Clock className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-[13px] font-semibold text-foreground/60">Sem histórico</p>
        <p className="text-[11px] text-muted-foreground mt-1.5">Nenhuma versão anterior disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Versões anteriores</p>
      {versions.map((v, i) => (
        <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${v.current ? "border-primary/20 bg-primary/5" : "border-border hover:bg-muted/30"}`}>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-semibold text-foreground">Versão {versions.length - i}</p>
              {v.current && <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Actual</span>}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{v.date} · {v.size}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
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
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Copiar link</p>
        <div className="flex gap-2">
          <div className="flex-1 h-9 px-3 rounded-xl border border-border bg-muted/30 flex items-center">
            <p className="text-[11px] text-muted-foreground truncate">https://edudrive.uan.ao/r/{file.id}</p>
          </div>
          <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 rounded-xl shrink-0" onClick={() => toast({ title: "Link copiado!" })}>
            <Copy className="w-3.5 h-3.5" /> Copiar
          </Button>
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Enviar para</p>
        <div className="space-y-1.5">
          {roles.map(role => (
            <button key={role} onClick={() => toast({ title: `Enviado para ${role}`, description: file.name })}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border hover:border-primary/20 hover:shadow-sm transition-all">
              <span className="text-[12px] font-medium text-foreground">{role}</span>
              <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

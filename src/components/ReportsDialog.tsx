import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Loader2, Download, Eye } from "lucide-react";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// Current month index (0-based), simulating April 2026
const CURRENT_MONTH = new Date().getMonth(); // 0=Jan

interface ReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string; // e.g. "Cadeiras do Curso", "Estudantes do Curso"
  reportPrefix: string; // e.g. "Relatório de Cadeiras"
}

export default function ReportsDialog({ open, onOpenChange, title, reportPrefix }: ReportsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            Relatórios — {title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground">Ano Lectivo 2024/2025 · Relatórios mensais</p>

        <div className="rounded-lg border border-border overflow-hidden mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Mês</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Relatório</th>
                <th className="text-center p-3 font-medium text-muted-foreground text-xs">Estado</th>
                <th className="text-center p-3 font-medium text-muted-foreground text-xs">Acção</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((month, idx) => {
                const isAvailable = idx <= CURRENT_MONTH;
                return (
                  <tr key={month} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-foreground font-medium">{month}</td>
                    <td className="p-3 text-muted-foreground text-xs">{reportPrefix} — {month}</td>
                    <td className="p-3 text-center">
                      {isAvailable ? (
                        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-[10px] gap-1">
                          <CheckCircle className="w-3 h-3" /> Gerado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Em Progresso
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {isAvailable ? (
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-primary hover:text-primary hover:bg-primary/10">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

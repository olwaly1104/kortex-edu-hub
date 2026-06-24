import { useState, type ReactNode } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TabelaInfracoes } from "./TabelaInfracoes";

/**
 * Drop-in replacement for the legacy "Tabela de Multas (PDF)" button.
 * Opens a dialog with the live "Tabela de Infrações" sourced from
 * Admin → Conformidade & Multas (no "Aplica a" column).
 */
export function TabelaInfracoesButton({
  label = "Tabela de Infrações",
  size = "sm",
  variant = "outline",
  className = "text-xs h-7 gap-1.5 rounded-lg",
  icon = <FileText className="w-3.5 h-3.5" />,
  fullWidth = false,
}: {
  label?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "outline" | "ghost" | "default";
  className?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`${className} ${fullWidth ? "w-full justify-start" : ""}`}
        >
          {icon}
          <span className="truncate">{label}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tabela de Infrações</DialogTitle>
        </DialogHeader>
        <TabelaInfracoes title="Quadro Oficial de Infrações" description="Tabela definida em Conformidade & Multas. Aplica-se a docentes e staff." />
      </DialogContent>
    </Dialog>
  );
}

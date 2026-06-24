import { Button } from "@/components/ui/button";
import { Lock, LockOpen, Pencil, Check, Trash2 } from "lucide-react";

/**
 * Slim per-row controls: shows only a Trash button while the card is in edit mode.
 * Kept for backwards-compatibility with pages that still pass editing/onDelete.
 */
export function RowLockControls({
  editing,
  onDelete,
  deleteMsg = "Tem a certeza que pretende eliminar este registo? Esta acção é irreversível.",
  className = "",
}: {
  editing: boolean;
  onEdit?: () => void;
  onConfirm?: () => void;
  onDelete?: () => void;
  size?: "xs" | "sm";
  saveMsg?: string;
  deleteMsg?: string;
  hideBadge?: boolean;
  className?: string;
}) {
  if (!editing || !onDelete) return <div className={className} />;
  return (
    <div className={`flex items-center justify-end ${className}`} onClick={(e) => e.stopPropagation()}>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm(deleteMsg)) onDelete();
        }}
        title="Eliminar"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

/**
 * Card-level header chip placed at the top-right of a configurator Card.
 * Shows a "Bloqueado / Desbloqueado" badge and an "Editar / Confirmar" toggle button.
 * When `editing` / `onEdit` / `onConfirm` are omitted, falls back to a static "Bloqueado" badge.
 */
export function CardLockBadge({
  editing,
  onEdit,
  onConfirm,
  saveMsg = "Confirmar as alterações?",
  className = "",
}: {
  editing?: boolean;
  onEdit?: () => void;
  onConfirm?: () => void;
  saveMsg?: string;
  className?: string;
}) {
  const interactive = typeof editing === "boolean" && onEdit && onConfirm;
  return (
    <div className={`flex items-center justify-end gap-1.5 px-3 py-2 border-b bg-muted/20 ${className}`}>
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
          editing
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {editing ? <LockOpen className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
        {editing ? "Desbloqueado" : "Bloqueado"}
      </span>
      {interactive && (
        <Button
          size="sm"
          variant={editing ? "default" : "outline"}
          className={`h-7 px-2 text-[11px] gap-1 ${editing ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
          onClick={() => {
            if (editing) {
              if (window.confirm(saveMsg)) onConfirm!();
            } else {
              onEdit!();
            }
          }}
        >
          {editing ? <><Check className="w-3 h-3" /> Confirmar</> : <><Pencil className="w-3 h-3" /> Editar</>}
        </Button>
      )}
    </div>
  );
}

export function useRowEditing<T extends string | number>() {
  return new Map<T, boolean>();
}

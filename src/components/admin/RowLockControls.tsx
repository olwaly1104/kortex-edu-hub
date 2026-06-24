import { Button } from "@/components/ui/button";
import { Lock, Pencil, Check, Trash2 } from "lucide-react";

/**
 * Standard row controls used across all configurator tables:
 *  - "Bloqueado/Desbloqueado" badge (visual lock)
 *  - "Editar/Confirmar" button — toggles per-row editing state
 *  - Trash button (only while editing)
 * Both Confirmar and Trash trigger a window.confirm before invoking the callback.
 */
export function RowLockControls({
  editing,
  onEdit,
  onConfirm,
  onDelete,
  size = "sm",
  saveMsg = "Confirmar as alterações a este registo?",
  deleteMsg = "Tem a certeza que pretende eliminar este registo? Esta acção é irreversível.",
  hideBadge = false,
  className = "",
}: {
  editing: boolean;
  onEdit: () => void;
  onConfirm: () => void;
  onDelete?: () => void;
  size?: "xs" | "sm";
  saveMsg?: string;
  deleteMsg?: string;
  hideBadge?: boolean;
  className?: string;
}) {
  const btnH = size === "xs" ? "h-7" : "h-7";
  return (
    <div className={`flex items-center gap-1.5 justify-end ${className}`} onClick={(e) => e.stopPropagation()}>

      <Button
        size="sm"
        variant={editing ? "default" : "outline"}
        className={`gap-1 ${btnH} px-2 text-[11px] ${editing ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          if (editing) {
            if (window.confirm(saveMsg)) onConfirm();
          } else {
            onEdit();
          }
        }}
      >
        {editing ? <><Check className="w-3 h-3" /> Confirmar</> : <><Pencil className="w-3 h-3" /> Editar</>}
      </Button>
      {editing && onDelete && (
        <Button
          size="icon"
          variant="ghost"
          className={`${btnH} w-7 text-muted-foreground hover:text-destructive`}
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(deleteMsg)) onDelete();
          }}
          title="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}

/** Single "Bloqueado" badge placed at the top-right of a configurator Card. */
export function CardLockBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`absolute top-2 right-3 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted text-muted-foreground border ${className}`}
    >
      <Lock className="w-2.5 h-2.5" /> Bloqueado
    </span>
  );
}

/** Convenience hook: per-row editing state keyed by id. */
export function useRowEditing<T extends string | number>() {
  const map = new Map<T, boolean>();
  return map;
}


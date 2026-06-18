import { cn } from "@/lib/utils";
import { GraduationCap, BookOpen, Briefcase, Building2, Crown, Wallet, FileText, HeartHandshake, ClipboardList, Shield, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ModuloKey =
  | "estudante" | "professor" | "coordenador" | "decano" | "reitor"
  | "financas" | "academica" | "gap" | "inscricoes" | "admin";

const MAP: Record<ModuloKey, { label: string; icon: LucideIcon; className: string }> = {
  estudante:   { label: "Estudante",    icon: GraduationCap,   className: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20" },
  professor:   { label: "Professor",    icon: BookOpen,        className: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20" },
  coordenador: { label: "Coordenador",  icon: Briefcase,       className: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20" },
  decano:      { label: "Decano",       icon: Building2,       className: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20" },
  reitor:      { label: "Reitor",       icon: Crown,           className: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20" },
  financas:    { label: "Finanças",     icon: Wallet,          className: "bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20" },
  academica:   { label: "Académica",    icon: FileText,        className: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20" },
  gap:         { label: "GAP",          icon: HeartHandshake,  className: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20" },
  inscricoes:  { label: "Inscrições",   icon: ClipboardList,   className: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20" },
  admin:       { label: "Admin",        icon: Shield,          className: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:ring-slate-500/25" },
};

export function ModuleTag({
  modulo, size = "sm", className,
}: { modulo?: string | null; size?: "xs" | "sm"; className?: string }) {
  if (!modulo) return null;
  const key = modulo.toLowerCase() as ModuloKey;
  const meta = MAP[key] ?? { label: modulo, icon: User, className: "bg-muted text-muted-foreground ring-border" };
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium tracking-tight ring-1 ring-inset whitespace-nowrap",
        size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
        meta.className,
        className,
      )}
    >
      <Icon className={size === "xs" ? "w-2.5 h-2.5" : "w-3 h-3"} />
      {meta.label}
    </span>
  );
}

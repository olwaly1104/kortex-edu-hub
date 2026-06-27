// Finanças announcement metadata. Live data is loaded from the `anuncios` table
// via the `useAnuncios` hook; this module only exports the visual type metadata.

export type AnnType = "urgente" | "evento" | "academico" | "geral";

export interface FinAnn {
  id: string;
  title: string;
  content: string;
  type: AnnType;
  date: string;
  author: string;
  department: string;
  cta?: "inscrever" | null;
  ctaDeadline?: string;
  ctaDeadlineTime?: string;
  ctaLink?: string;
  isMine?: boolean;
}

export const TYPE_META: Record<AnnType, { label: string; chip: string; dot: string; soft: string; text: string }> = {
  urgente:   { label: "Urgente",   chip: "bg-red-50 text-red-700 border-red-200",         dot: "bg-red-500",    soft: "bg-red-50",    text: "text-red-700" },
  evento:    { label: "Evento",    chip: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500", soft: "bg-violet-50", text: "text-violet-700" },
  academico: { label: "Académico", chip: "bg-blue-50 text-blue-700 border-blue-200",       dot: "bg-blue-500",   soft: "bg-blue-50",   text: "text-blue-700" },
  geral:     { label: "Geral",     chip: "bg-slate-50 text-slate-700 border-slate-200",    dot: "bg-slate-400",  soft: "bg-slate-50",  text: "text-slate-700" },
};

export const FIN_ANUNCIOS: FinAnn[] = [];

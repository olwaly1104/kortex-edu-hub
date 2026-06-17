// Reusable colored sigla badge for a Faculdade. Use this in every table/row
// that displays a faculdade entry so the color is consistent across the app.
import { useFaculdades } from "@/lib/useInstitution";

function readableText(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#ffffff";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0f172a" : "#ffffff";
}

type Props = {
  sigla?: string | null;
  color?: string | null;
  faculdadeId?: string | null;
  className?: string;
};

export function FaculdadeSiglaTag({ sigla, color, faculdadeId, className = "" }: Props) {
  const facsQ = useFaculdades();
  const resolved = faculdadeId
    ? facsQ.data?.find((f) => f.id === faculdadeId)
    : undefined;
  const s = (sigla ?? resolved?.sigla ?? "").toString();
  const c = (color ?? (resolved as any)?.color ?? "#475569") as string;
  if (!s) return null;
  return (
    <span
      className={`inline-flex items-center justify-center h-5 px-2 rounded-md text-[10px] font-bold tracking-wider shadow-sm ${className}`}
      style={{ backgroundColor: c, color: readableText(c) }}
      title="Faculdade"
    >
      {s}
    </span>
  );
}

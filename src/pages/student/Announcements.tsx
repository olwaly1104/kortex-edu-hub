import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";
import { useAnuncios, formatAnuncioDate } from "@/hooks/useAnuncios";

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  evento: { bg: "bg-secondary text-secondary-foreground", label: "Evento" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
  financas: { bg: "bg-accent text-accent-foreground", label: "Finanças" },
};

export default function StudentAnnouncements() {
  const { items, loading } = useAnuncios();

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-secondary" /> Anúncios
        </h1>
        <p className="text-muted-foreground mt-1">
          {loading ? "A carregar…" : `${items.length} ${items.length === 1 ? "anúncio" : "anúncios"}`}
        </p>
      </div>

      <div className="space-y-4">
        {items.map((ann) => {
          const style = typeStyles[ann.type] || typeStyles.geral;
          return (
            <Card key={ann.id} className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <Badge className={style.bg}>{style.label}</Badge>
                <span className="text-xs text-muted-foreground shrink-0">{formatAnuncioDate(ann.created_at)}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{ann.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{ann.content}</p>
              {ann.author && <p className="text-xs text-muted-foreground mt-3">— {ann.author}</p>}
            </Card>
          );
        })}
        {!loading && items.length === 0 && (
          <Card className="p-10 text-center text-sm text-muted-foreground border-dashed">
            Ainda não existem anúncios publicados.
          </Card>
        )}
      </div>
    </div>
  );
}

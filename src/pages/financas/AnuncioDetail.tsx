import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FIN_ANUNCIOS, TYPE_META } from "@/data/financasAnunciosData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Calendar as CalendarIcon, Building2, User as UserIcon,
  CheckCircle2, Megaphone, Share2, Printer, ChevronRight, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FinancasAnuncioDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subscribed, setSubscribed] = useState(false);

  const ann = useMemo(() => FIN_ANUNCIOS.find(a => a.id === id), [id]);

  const related = useMemo(
    () => ann ? FIN_ANUNCIOS.filter(a => a.id !== ann.id && a.department === ann.department).slice(0, 4) : [],
    [ann]
  );

  if (!ann) {
    return (
      <div className="p-6 lg:p-8 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/financas/anuncios")} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Anúncios
        </Button>
        <Card className="p-10 text-center">
          <Megaphone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Anúncio não encontrado.</p>
        </Card>
      </div>
    );
  }

  const m = TYPE_META[ann.type];
  const initials = (ann.author || ann.department).split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in max-w-5xl">
      {/* Breadcrumb / back */}
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <Link to="/financas/anuncios" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Anúncios
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium truncate">{ann.title}</span>
      </div>

      <Card className="overflow-hidden">
        <div className="flex">
          <div className={cn("w-1.5 shrink-0", m.dot)} />
          <div className="flex-1">
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-border bg-gradient-to-r from-primary/[0.03] to-transparent">
              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                <Badge variant="outline" className={cn("text-[10px] font-semibold gap-1 px-1.5", m.chip)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", m.dot)} />
                  {m.label}
                </Badge>
                <Link
                  to={`/financas/anuncios?dep=${encodeURIComponent(ann.department)}`}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border border-border bg-muted/40 text-foreground hover:bg-muted hover:border-primary/30 transition-colors"
                >
                  <Building2 className="w-2.5 h-2.5" />{ann.department}
                </Link>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border border-border bg-card text-muted-foreground tabular-nums">
                  <CalendarIcon className="w-2.5 h-2.5" />{ann.date}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground leading-tight">{ann.title}</h1>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[11px] font-semibold flex items-center justify-center">
                  {initials || <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <div className="leading-tight">
                  <p className="text-[12px] font-medium text-foreground">{ann.author}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> Publicado a {ann.date}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <article className="prose prose-sm max-w-none">
                <p className="text-[15px] leading-7 text-foreground whitespace-pre-line">{ann.content}</p>
              </article>

              {ann.cta === "inscrever" && (
                <div className="mt-6 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Inscrições abertas</p>
                    <p className="text-xs text-muted-foreground">Confirme a sua participação neste anúncio.</p>
                  </div>
                  {subscribed ? (
                    <Badge variant="outline" className="text-[11px] gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 h-8 px-3">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Inscrito
                    </Badge>
                  ) : (
                    <Button size="sm" className="h-8 gap-1.5" onClick={() => setSubscribed(true)}>
                      <CheckCircle2 className="w-4 h-4" /> Inscrever-me
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]">
                  <Share2 className="w-3.5 h-3.5" /> Partilhar
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]">
                  <Printer className="w-3.5 h-3.5" /> Imprimir
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/financas/anuncios")} className="gap-1.5 text-[11px] h-8">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar à lista
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Related */}
      {related.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" />
            Outros anúncios de <span className="text-primary">{ann.department}</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {related.map(r => {
              const rm = TYPE_META[r.type];
              return (
                <Link key={r.id} to={`/financas/anuncios/${r.id}`}
                  className="block rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all">
                  <div className="flex">
                    <div className={cn("w-1 shrink-0 rounded-l-lg", rm.dot)} />
                    <div className="p-3 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant="outline" className={cn("text-[9px] font-semibold px-1.5", rm.chip)}>{rm.label}</Badge>
                        <span className="text-[10px] text-muted-foreground tabular-nums ml-auto">{r.date}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground line-clamp-1">{r.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{r.content}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

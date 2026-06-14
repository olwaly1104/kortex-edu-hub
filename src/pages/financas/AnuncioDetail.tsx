import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FIN_ANUNCIOS, TYPE_META } from "@/data/financasAnunciosData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Calendar as CalendarIcon, Building2, User as UserIcon,
  CheckCircle2, Megaphone, ChevronRight, Clock, FileText, Tag, Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FinancasAnuncioDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
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
      {/* Top bar: breadcrumb + document */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground min-w-0">
          <Link to="/financas/anuncios" className="hover:text-foreground flex items-center gap-1 shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" /> Anúncios
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-foreground font-medium truncate">{ann.title}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-[11px] shrink-0"
          onClick={() => toast({ title: "Documento gerado", description: `Anuncio-${ann.id.toUpperCase()}.pdf` })}
        >
          <FileText className="w-3.5 h-3.5" /> Documento
        </Button>
      </div>

      {/* Main card */}
      <Card className="overflow-hidden">
        <div className="flex">
          <div className={cn("w-1.5 shrink-0", m.dot)} />
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="px-7 pt-6 pb-5 border-b border-border bg-gradient-to-r from-primary/[0.04] via-primary/[0.015] to-transparent">
              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                <Badge variant="outline" className={cn("text-[10px] font-semibold gap-1 px-1.5", m.chip)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", m.dot)} />
                  {m.label}
                </Badge>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-muted-foreground tabular-nums uppercase tracking-wider">
                  <Hash className="w-2.5 h-2.5" />{ann.id}
                </span>
              </div>
              <h1 className="text-[26px] font-bold text-foreground leading-tight tracking-tight">{ann.title}</h1>

              {/* Meta grid */}
              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 border-t border-border/60 pt-4">
                <MetaField
                  icon={<UserIcon className="w-3 h-3" />}
                  label="Publicado por"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center">
                        {initials}
                      </span>
                      {ann.author}
                    </span>
                  }
                />
                <MetaField
                  icon={<Building2 className="w-3 h-3" />}
                  label="Departamento"
                  value={
                    <Link
                      to={`/financas/anuncios?dep=${encodeURIComponent(ann.department)}`}
                      className="text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors"
                    >
                      {ann.department}
                    </Link>
                  }
                />
                <MetaField
                  icon={<Tag className="w-3 h-3" />}
                  label="Categoria"
                  value={m.label}
                />
                <MetaField
                  icon={<CalendarIcon className="w-3 h-3" />}
                  label="Data de publicação"
                  value={<span className="tabular-nums">{ann.date}</span>}
                />
              </div>
            </div>

            {/* Body */}
            <div className="px-7 py-7">
              <article className="max-w-none">
                <p className="text-[15px] leading-7 text-foreground whitespace-pre-line">{ann.content}</p>
              </article>

              {ann.cta === "inscrever" && (
                <div className="mt-7 rounded-lg border border-primary/25 bg-primary/[0.04] p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-primary">Inscrições abertas</p>
                      <p className="text-sm font-semibold text-foreground">Confirme a sua participação</p>
                      {ann.ctaDeadline && (
                        <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mt-1">
                          <Clock className="w-3 h-3" />
                          Data limite: <span className="font-semibold text-foreground tabular-nums">{ann.ctaDeadline}{ann.ctaDeadlineTime ? ` - ${ann.ctaDeadlineTime}` : ""}</span>
                        </p>
                      )}
                    </div>
                    {subscribed ? (
                      <Badge variant="outline" className="text-[11px] gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 h-9 px-3">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Inscrito
                      </Badge>
                    ) : (
                      <Button size="sm" className="h-9 gap-1.5" onClick={() => setSubscribed(true)}>
                        <CheckCircle2 className="w-4 h-4" /> Inscrever-me
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-7 py-3 border-t border-border bg-muted/20 flex items-center justify-end">
              <Button variant="ghost" size="sm" onClick={() => navigate("/financas/anuncios")} className="gap-1.5 text-[11px] h-8">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar à lista
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Related */}
      {related.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary" />
              Outros anúncios de <span className="text-primary">{ann.department}</span>
            </h2>
            <Link
              to={`/financas/anuncios?dep=${encodeURIComponent(ann.department)}`}
              className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              Ver todos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {related.map(r => {
              const rm = TYPE_META[r.type];
              const rInitials = (r.author || r.department).split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
              return (
                <Link
                  key={r.id}
                  to={`/financas/anuncios/${r.id}`}
                  className="group block rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className="flex">
                    <div className={cn("w-1 shrink-0 rounded-l-lg", rm.dot)} />
                    <div className="p-4 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Badge variant="outline" className={cn("text-[9px] font-semibold px-1.5", rm.chip)}>{rm.label}</Badge>
                        <span className="text-[10px] text-muted-foreground tabular-nums ml-auto flex items-center gap-1">
                          <CalendarIcon className="w-2.5 h-2.5" />{r.date}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{r.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{r.content}</p>
                      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/60">
                        <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[8px] font-bold flex items-center justify-center">
                          {rInitials}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">{r.author}</span>
                      </div>
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

function MetaField({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[9.5px] uppercase tracking-[0.14em] font-semibold text-muted-foreground/80 flex items-center gap-1 mb-1">
        {icon}{label}
      </p>
      <div className="text-[12.5px] font-medium text-foreground truncate">{value}</div>
    </div>
  );
}

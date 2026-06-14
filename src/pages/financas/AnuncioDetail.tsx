import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FIN_ANUNCIOS, TYPE_META } from "@/data/financasAnunciosData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Calendar as CalendarIcon, Building2, User as UserIcon,
  CheckCircle2, Megaphone, ChevronRight, Clock, FileText, Tag,
  Users, Share2, Eye, Download,
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
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <Megaphone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Anúncio não encontrado.</p>
        </div>
      </div>
    );
  }

  const m = TYPE_META[ann.type];
  const initials = (ann.author || ann.department).split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  const sharedWith = [
    { name: "Reitoria", role: "Gestão Institucional", access: "Visualizar" },
    { name: ann.author, role: ann.department, access: "Editar" },
    { name: "Departamento Financeiro", role: "Equipa", access: "Visualizar" },
    { name: "Coordenação Académica", role: "Equipa", access: "Visualizar" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground min-w-0">
        <Link to="/financas/anuncios" className="hover:text-foreground flex items-center gap-1 shrink-0">
          <ArrowLeft className="w-3.5 h-3.5" /> Anúncios
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-foreground font-medium truncate">{ann.title}</span>
      </div>

      {/* Main document card */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Header: title + document pill */}
        <div className="px-6 pt-5 pb-5 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Badge variant="outline" className={cn("text-[10px] font-semibold gap-1 px-2 py-0.5 uppercase tracking-wider mb-2", m.chip)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", m.dot)} />
                {m.label}
              </Badge>
              <h1 className="text-[24px] font-bold text-foreground leading-tight tracking-tight">{ann.title}</h1>
            </div>

            {/* Document pill (GAP-style) */}
            <div className="inline-flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-md border border-border bg-background shadow-sm shrink-0">
              <div className="w-6 h-6 rounded bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                <FileText className="w-3 h-3 text-red-600" />
              </div>
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-[11px] font-semibold text-foreground tabular-nums">Anuncio-{ann.id.toUpperCase()}</span>
                <span className="text-[9px] tracking-[0.02em] text-muted-foreground font-medium">Gerado automaticamente</span>
              </div>
              <span className="self-stretch w-px bg-border mx-0.5" />

              <Dialog>
                <DialogTrigger asChild>
                  <button type="button" className="inline-flex items-center gap-1 px-1 h-5 rounded text-[10px] text-primary hover:bg-muted font-medium transition-colors" title="Partilhas">
                    <Users className="w-3 h-3" /> {sharedWith.length}
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-base flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-primary" /> Partilhado com {sharedWith.length} pessoas
                    </DialogTitle>
                    <DialogDescription className="text-[12px]">
                      Pessoas com acesso ao documento <span className="font-medium text-foreground">Anuncio-{ann.id.toUpperCase()}</span>.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 mt-2">
                    {sharedWith.map((p, i) => {
                      const ini = p.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
                      return (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-muted/20">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold ring-1 ring-primary/15 shrink-0">
                            {ini}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{p.role}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 shrink-0">{p.access}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>

              <button
                type="button"
                onClick={() => toast({ title: "Pré-visualização", description: `Anuncio-${ann.id.toUpperCase()}` })}
                className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Ver documento"
              >
                <Eye className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => toast({ title: "Documento exportado", description: `Anuncio-${ann.id.toUpperCase()}.pdf` })}
                className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Exportar"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Meta strip */}
        <div className="px-6 py-3 border-b border-border bg-muted/20 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <MetaCell
            icon={<UserIcon className="w-3 h-3" />}
            label="Publicado por"
            value={
              <span className="inline-flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center ring-1 ring-primary/15">
                  {initials}
                </span>
                <span className="truncate">{ann.author}</span>
              </span>
            }
          />
          <MetaCell
            icon={<Building2 className="w-3 h-3" />}
            label="Departamento"
            value={
              <Link
                to={`/financas/anuncios?dep=${encodeURIComponent(ann.department)}`}
                className="hover:text-primary hover:underline underline-offset-2 truncate"
              >
                {ann.department}
              </Link>
            }
          />
          <MetaCell
            icon={<CalendarIcon className="w-3 h-3" />}
            label="Publicação"
            value={<span className="tabular-nums">{ann.date}</span>}
          />
          {ann.ctaDeadline ? (
            <MetaCell
              icon={<Clock className="w-3 h-3" />}
              label="Data limite"
              value={
                <span className="tabular-nums font-semibold">
                  {ann.ctaDeadline}{ann.ctaDeadlineTime ? ` · ${ann.ctaDeadlineTime}` : ""}
                </span>
              }
            />
          ) : (
            <MetaCell
              icon={<Tag className="w-3 h-3" />}
              label="Referência"
              value={
                <button
                  type="button"
                  onClick={() => { navigator.clipboard?.writeText(ann.id); toast({ title: "ID copiado", description: ann.id }); }}
                  className="font-mono tabular-nums hover:text-primary"
                >
                  {ann.id.toUpperCase()}
                </button>
              }
            />
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <article className="max-w-3xl">
            <p className="text-[15px] leading-7 text-foreground whitespace-pre-line">{ann.content}</p>
          </article>

          {ann.cta === "inscrever" && (
            <div className="mt-6 max-w-3xl rounded-lg border border-primary/25 bg-primary/[0.04] p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-primary">Inscrições abertas</p>
                  <p className="text-sm font-semibold text-foreground">Confirme a sua participação</p>
                  {ann.ctaDeadline && (
                    <p className="text-[12px] text-muted-foreground flex items-center gap-1.5">
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
      </div>
    </div>


  );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[9.5px] uppercase tracking-[0.14em] font-semibold text-muted-foreground/80 flex items-center gap-1 mb-1.5">
        {icon}{label}
      </p>
      <div className="min-w-0">{value}</div>
    </div>
  );
}

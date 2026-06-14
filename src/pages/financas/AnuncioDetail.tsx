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
  Users, Share2, Eye, Download, Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FinancasAnuncioDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscribed, setSubscribed] = useState(false);

  const ann = useMemo(() => FIN_ANUNCIOS.find(a => a.id === id), [id]);


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
        {/* Standard bar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-muted/20 text-[10px] uppercase tracking-[0.12em] font-semibold">
          <span className="text-primary">Ano Letivo 2024/2025</span>
          <span className="text-muted-foreground/40">·</span>
          <Link to="/financas/anuncios" className="text-muted-foreground hover:text-foreground transition-colors">Anúncios</Link>
          <span className="text-muted-foreground/40">·</span>
          <span className="font-mono text-foreground normal-case tracking-normal">{ann.id.toUpperCase()}</span>
        </div>

        {/* Header: title + ID/Document pill */}
        <div className="px-6 pt-5 pb-5 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="text-[10.5px] font-semibold px-2 py-0.5 gap-1.5 uppercase tracking-wider">
                  <span className={cn("w-1.5 h-1.5 rounded-full", m.dot)} />
                  {m.label}
                </Badge>
                <Link
                  to={`/financas/anuncios?dep=${encodeURIComponent(ann.department)}`}
                  className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2 py-0.5 rounded-md border border-border bg-background hover:bg-muted hover:text-primary uppercase tracking-wider text-foreground transition-colors"
                >
                  <Building2 className="w-3 h-3" />
                  {ann.department}
                </Link>
              </div>
              <h1 className="text-[24px] font-bold text-foreground leading-tight tracking-tight">{ann.title}</h1>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => { navigator.clipboard?.writeText(ann.id); toast({ title: "ID copiado", description: ann.id }); }}
                className="inline-flex items-center px-2 py-0.5 rounded-md border border-border bg-background hover:bg-muted text-[11px] font-mono font-semibold text-foreground transition-colors"
              >
                {ann.id.toUpperCase()}
              </button>
              <div className="inline-flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-md border border-border bg-background shadow-sm">
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
        </div>

        <div className="grid md:grid-cols-[1fr_280px] divide-x divide-border">
          {/* LEFT — descrição body */}
          <div className="p-6 min-w-0 space-y-6">
            <div>
              <h2 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-muted-foreground mb-3">Conteúdo</h2>
              <article className="max-w-none">
                <p className="text-[14.5px] leading-7 text-foreground whitespace-pre-line">{ann.content}</p>
              </article>
            </div>

            {ann.cta === "inscrever" && (
              <div className="rounded-lg border border-primary/25 bg-primary/[0.04] px-4 py-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-primary mb-0.5">Inscrições abertas</p>
                    <h3 className="text-[15px] font-bold text-foreground leading-tight">{ann.title}</h3>
                    {ann.ctaDeadline && (
                      <p className="text-[11.5px] text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        Data limite:&nbsp;<span className="font-semibold text-foreground tabular-nums">{ann.ctaDeadline}{ann.ctaDeadlineTime ? ` · ${ann.ctaDeadlineTime}` : ""}</span>
                      </p>
                    )}
                  </div>
                  {subscribed ? (
                    <Badge variant="outline" className="text-[11px] gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 h-8 px-2.5 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Inscrito
                    </Badge>
                  ) : (
                    <Button size="sm" className="h-8 px-3 gap-1.5 text-[12px] shrink-0" onClick={() => setSubscribed(true)}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Inscrever-me
                    </Button>
                  )}
                </div>
              </div>
            )}



            {/* Anexos */}
            {(() => {
              const attachments = ann.cta === "inscrever"
                ? [{ name: "Programa-detalhado.pdf", size: "312 KB" }]
                : [];
              return (
                <div>
                  <h2 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Paperclip className="w-3 h-3" /> Anexos
                    <span className="text-muted-foreground/70 normal-case tracking-normal font-medium">({attachments.length})</span>
                  </h2>
                  {attachments.length === 0 ? (
                    <div className="rounded-md border border-dashed border-border px-3 py-4 text-center text-[12px] text-muted-foreground">
                      Sem anexos
                    </div>
                  ) : (
                    <div className="rounded-md border border-border divide-y divide-border overflow-hidden">
                      {attachments.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-background hover:bg-muted/40 transition-colors">
                          <div className="w-7 h-7 rounded bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5 text-red-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12.5px] font-semibold text-foreground truncate">{f.name}</p>
                            <p className="text-[10.5px] text-muted-foreground tabular-nums">PDF · {f.size}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[11px] gap-1"
                              onClick={() => toast({ title: "Pré-visualização", description: f.name })}
                            >
                              <Eye className="w-3 h-3" /> Ver
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[11px] gap-1"
                              onClick={() => toast({ title: "Download iniciado", description: f.name })}
                            >
                              <Download className="w-3 h-3" /> Descarregar
                            </Button>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* RIGHT — Dados */}
          <aside className="p-5 bg-muted/15">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-3">Dados</p>
            <div className="divide-y divide-border/60">
              <div className="pb-3">
                <MetaCell
                  icon={<CalendarIcon className="w-3 h-3" />}
                  label="Data de publicação"
                  value={<span className="tabular-nums">{ann.date}</span>}
                />
              </div>
              <div className="py-3">
                <MetaCell
                  icon={<UserIcon className="w-3 h-3" />}
                  label="Publicado por"
                  value={<span className="truncate">{ann.author}</span>}
                />
              </div>
              <div className="py-3">
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
              </div>
              <div className="py-3">
                <MetaCell
                  icon={<Tag className="w-3 h-3" />}
                  label="Categoria"
                  value={m.label}
                />
              </div>
              {ann.cta === "inscrever" && ann.ctaDeadline && (
                <div className="py-3">
                  <MetaCell
                    icon={<Clock className="w-3 h-3" />}
                    label="Limite de inscrição"
                    value={<span className="tabular-nums">{ann.ctaDeadline}{ann.ctaDeadlineTime ? ` - ${ann.ctaDeadlineTime}` : ""}</span>}
                  />
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>

    </div>



  );
}

function MetaCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[9.5px] uppercase tracking-[0.14em] font-semibold text-muted-foreground/80 flex items-center gap-1 mb-1">
        {icon}{label}
      </p>
      <div className="text-[12px] font-medium text-foreground min-w-0 truncate">{value}</div>
    </div>
  );
}

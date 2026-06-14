import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Megaphone, Search, Plus, CheckCircle2, Calendar as CalendarIcon,
  User as UserIcon, Building2, Trash2, GraduationCap, CalendarDays,
  Clock, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FIN_ANUNCIOS, TYPE_META, type AnnType, type FinAnn } from "@/data/financasAnunciosData";
import { useFinAnunciosUnread } from "@/hooks/useFinAnunciosUnread";


const TODAY_LABEL = "14/02/2024";

/* parse "dd/mm/yyyy" → nice "14 Fev 2024" */
const MONTHS_PT_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
function prettyDate(dmy: string) {
  const [d, m, y] = dmy.split("/").map(Number);
  if (!d || !m || !y) return dmy;
  return `${String(d).padStart(2,"0")} ${MONTHS_PT_SHORT[m-1]} ${y}`;
}

type Scope = "todos" | "departamento" | "meus";

export default function FinancasAnuncios() {
  const { user } = useAuth();
  const [items, setItems] = useState<FinAnn[]>(FIN_ANUNCIOS);
  const [scope, setScope] = useState<Scope>("todos");
  const [typeFilter, setTypeFilter] = useState<AnnType | "todos">("todos");
  const [deptFilter, setDeptFilter] = useState<string>("todos");
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [subscribed, setSubscribed] = useState<Set<string>>(new Set());
  const { isRead, markRead } = useFinAnunciosUnread();


  const [form, setForm] = useState<Omit<FinAnn, "id" | "author" | "isMine" | "date">>({
    title: "", content: "", type: "geral",
    department: "Departamento Financeiro", cta: null,
  });
  const [hasCta, setHasCta] = useState(false);


  const handleCreate = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    const next: FinAnn = {
      ...form,
      cta: hasCta ? "inscrever" : null,
      id: `mine-${Date.now()}`,
      author: user?.name ?? "Eu",
      date: TODAY_LABEL,
      isMine: true,
    };
    setItems(prev => [next, ...prev]);
    setOpenCreate(false);
    setForm({ title: "", content: "", type: "geral", department: "Departamento Financeiro", cta: null });
    setHasCta(false);
  };

  const handleDelete = (id: string) => setItems(prev => prev.filter(a => a.id !== id));

  const departments = useMemo(
    () => Array.from(new Set(items.map(i => i.department).filter(Boolean))) as string[],
    [items]
  );

  const filtered = useMemo(() => {
    return items.filter(a => {
      if (scope === "departamento" && a.department !== "Departamento Financeiro") return false;
      if (scope === "meus" && !a.isMine) return false;
      if (typeFilter !== "todos" && a.type !== typeFilter) return false;
      if (deptFilter !== "todos" && a.department !== deptFilter) return false;
      if (search && !(a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
  }, [items, scope, typeFilter, deptFilter, search]);

  const todayCount = items.filter(a => a.date === TODAY_LABEL).length;
  const meusCount = items.filter(a => a.isMine).length;
  const deptCount = items.filter(a => a.department === "Departamento Financeiro").length;

  const scopeTabs: { key: Scope; label: string; count: number }[] = [
    { key: "todos", label: "Todos", count: items.length },
    { key: "departamento", label: "Departamento Financeiro", count: deptCount },
    { key: "meus", label: "Os meus", count: meusCount },
  ];

  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const liveTime = `${String(now.getHours()).padStart(2, "0")}h:${String(now.getMinutes()).padStart(2, "0")}min:${String(now.getSeconds()).padStart(2, "0")}s`;
  const todayLabel = new Date().toLocaleDateString("pt-PT", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
  const ANO_LETIVO = "2024 / 2025";

  return (
    <div className="p-6 lg:p-8 animate-fade-in space-y-6">
      {/* ── Header (matches Início / Calendário) ── */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 space-y-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold text-primary">
              <GraduationCap className="w-3.5 h-3.5" />
              Ano Letivo <span className="font-bold tabular-nums">{ANO_LETIVO}</span>
            </span>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2 leading-tight">
                <Megaphone className="w-5 h-5 text-primary" /> Anúncios
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Comunicações institucionais e do Departamento Financeiro.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="inline-flex items-stretch rounded-md border border-border bg-card overflow-hidden text-[11px] uppercase tracking-wider font-medium shadow-sm">
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-foreground capitalize">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />{todayLabel}
              </span>
              <span className="w-px bg-border" />
              <span className="flex items-center gap-1.5 px-2.5 py-1 font-mono tabular-nums text-primary bg-muted/30">
                <Clock className="w-3.5 h-3.5" />{liveTime}
              </span>
            </div>
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-1.5 text-xs shadow-md hover:shadow-lg transition-shadow">
                  <Plus className="w-4 h-4" /> Criar Anúncio
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader><DialogTitle>Novo anúncio</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Título</Label>
                    <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título do anúncio" />
                  </div>
                  <div>
                    <Label className="text-xs">Conteúdo</Label>
                    <Textarea rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Detalhes do anúncio…" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Categoria</Label>
                      <Select value={form.type} onValueChange={(v: AnnType) => setForm({ ...form, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="geral">Geral</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                          <SelectItem value="evento">Evento</SelectItem>
                          <SelectItem value="academico">Académico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Destinatários</Label>
                      <Select value={form.department} onValueChange={v => setForm({ ...form, department: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Departamento Financeiro">Departamento Financeiro</SelectItem>
                          <SelectItem value="Toda a Instituição">Toda a Instituição</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <label className="flex items-start gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-3 cursor-pointer">
                    <Checkbox checked={hasCta} onCheckedChange={v => setHasCta(!!v)} className="mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Incluir botão de inscrição</p>
                      <p className="text-[11px] text-muted-foreground">Permite aos destinatários inscreverem-se diretamente neste anúncio.</p>
                    </div>
                  </label>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpenCreate(false)}>Cancelar</Button>
                  <Button onClick={handleCreate}>Publicar anúncio</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* ── Controls ─────────────────────────────── */}
      <Card className="p-3 space-y-3">
        <div className="flex bg-muted/60 rounded-lg p-0.5 overflow-x-auto w-fit">
          {scopeTabs.map(t => (
            <button key={t.key} onClick={() => setScope(t.key)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                scope === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {t.label}
              <span className={cn("text-[10px] px-1.5 rounded-full tabular-nums",
                scope === t.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar anúncios…"
              className="pl-9 h-9 text-sm border-border"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v: AnnType | "todos") => setTypeFilter(v)}>
            <SelectTrigger className="w-[170px] h-9 text-xs">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as categorias</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
              <SelectItem value="evento">Evento</SelectItem>
              <SelectItem value="academico">Académico</SelectItem>
              <SelectItem value="geral">Geral</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[210px] h-9 text-xs">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os departamentos</SelectItem>
              {departments.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>





      {/* ── Feed ────────────────────────────────── */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <Card className="p-10 text-center">
            <Megaphone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum anúncio corresponde aos filtros.</p>
          </Card>
        ) : filtered.map(a => {
          const m = TYPE_META[a.type];
          const isSub = subscribed.has(a.id);
          const initials = (a.author || a.department).split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
          const unread = !a.isMine && !isRead(a.id);
          return (
            <AnnouncementCard key={a.id} id={a.id} unread={unread} onSeen={markRead}>
              <Card className={cn(
                "group overflow-hidden hover:shadow-md transition-all",
                unread ? "border-primary/40 bg-primary/[0.025] shadow-sm" : "opacity-80 hover:opacity-100 hover:border-primary/30"
              )}>

              <div className="flex">
                <div className={cn("w-1 shrink-0", m.dot)} />
                <div className="flex-1 p-4">
                  {/* top meta: sender + date */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                        {initials || <UserIcon className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-semibold text-foreground truncate">
                        {a.author || a.department}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground shrink-0 tabular-nums">
                      <CalendarDays className="w-3.5 h-3.5" />{prettyDate(a.date)}
                    </span>
                  </div>

                  {/* divider between meta and body */}
                  <div className="border-t border-border/60 mb-3" />

                  {/* body */}
                  <Link to={`/financas/anuncios/${a.id}`} onClick={() => markRead(a.id)} className="block group/title">
                    <h3 className="text-[15px] font-semibold text-foreground leading-snug mb-1 group-hover/title:text-primary transition-colors">
                      {a.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {a.content.length > 200 ? a.content.slice(0, 200).trimEnd() + "…" : a.content}
                    </p>
                  </Link>

                  {/* compact CTA */}
                  {a.cta === "inscrever" && (
                    <div className="mt-3 inline-flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/[0.04] pl-3 pr-2 py-2 max-w-full">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-primary leading-none">Inscrições abertas</p>
                        {a.ctaDeadline && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 leading-none">
                            <Clock className="w-3 h-3" />
                            Data limite:&nbsp;<span className="font-semibold text-foreground tabular-nums">{a.ctaDeadline}{a.ctaDeadlineTime ? ` · ${a.ctaDeadlineTime}` : ""}</span>
                          </p>
                        )}
                      </div>
                      {isSub ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md h-7 px-2 text-[11px] font-semibold shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Inscrito
                        </span>
                      ) : (
                        <button
                          onClick={() => setSubscribed(s => new Set(s).add(a.id))}
                          className="inline-flex items-center gap-1 bg-primary text-primary-foreground rounded-md h-7 px-3 text-[11px] font-semibold hover:bg-primary/90 transition-colors shrink-0"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Inscrever-me
                        </button>
                      )}
                    </div>
                  )}


                  {/* footer: category + actions */}
                  <div className="flex items-center justify-between gap-1.5 mt-3 pt-2.5 border-t border-border/60">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className={cn("text-[10px] font-semibold gap-1 px-1.5", m.chip)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", m.dot)} />
                        {m.label}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => setScope("todos")}
                        title={`Ver anúncios de ${a.department}`}
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border border-border bg-muted/40 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-colors text-foreground/80"
                      >
                        <Building2 className="w-2.5 h-2.5" />{a.department}
                      </button>
                      {a.isMine && (
                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 px-1.5">
                          Criado por mim
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {a.isMine && (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(a.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button asChild size="sm" variant="outline" className="h-7 text-[11px] gap-1.5 px-2.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
                        <Link to={`/financas/anuncios/${a.id}`} onClick={() => markRead(a.id)}>
                          Ver detalhes <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
              </Card>
            </AnnouncementCard>
          );
        })}
      </div>
    </div>
  );
}

function AnnouncementCard({
  id, unread, onSeen, children,
}: { id: string; unread: boolean; onSeen: (id: string) => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!unread || !ref.current) return;
    const el = ref.current;
    let timer: number | undefined;
    const obs = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting && e.intersectionRatio >= 0.6) {
          timer = window.setTimeout(() => onSeen(id), 700);
        } else if (timer) {
          window.clearTimeout(timer);
          timer = undefined;
        }
      }
    }, { threshold: [0, 0.6, 1] });
    obs.observe(el);
    return () => {
      obs.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [id, unread, onSeen]);

  return (
    <div ref={ref} className="relative">
      {children}
    </div>
  );
}




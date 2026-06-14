import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { announcements as baseAnnouncements } from "@/data/mockData";
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
  User as UserIcon, Building2, Sparkles, Trash2, GraduationCap, Inbox, UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AnnType = "urgente" | "evento" | "academico" | "geral";

interface FinAnn {
  id: string;
  title: string;
  content: string;
  type: AnnType;
  date: string;          // dd/mm/yyyy
  author: string;
  department: string;    // e.g. "Departamento Financeiro" | "Direcção Académica"
  cta?: "inscrever" | null;
  ctaLink?: string;
  isMine?: boolean;
}

const TODAY_LABEL = "14/02/2024";

const TYPE_META: Record<AnnType, { label: string; chip: string; dot: string }> = {
  urgente:   { label: "Urgente",   chip: "bg-red-50 text-red-700 border-red-200",         dot: "bg-red-500" },
  evento:    { label: "Evento",    chip: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  academico: { label: "Académico", chip: "bg-blue-50 text-blue-700 border-blue-200",       dot: "bg-blue-500" },
  geral:     { label: "Geral",     chip: "bg-slate-50 text-slate-700 border-slate-200",    dot: "bg-slate-400" },
};

/* Seed with shared + finance-specific anúncios */
const SEED: FinAnn[] = [
  ...baseAnnouncements.map((a, i) => ({
    ...a,
    department: i % 2 === 0 ? "Direcção Académica" : "Reitoria",
    cta: i === 2 ? ("inscrever" as const) : null,
  })),
  { id: "f1", title: "Formação: Novas regras IVA 2024", content: "Sessão de formação obrigatória sobre as alterações fiscais em vigor. Aberta a inscrições para toda a equipa do Departamento Financeiro.", type: "evento", date: "14/02/2024", author: "Dr. Manuel Sousa", department: "Departamento Financeiro", cta: "inscrever" },
  { id: "f2", title: "Fecho contabilístico de Janeiro concluído", content: "O processo de encerramento contabilístico de Janeiro foi finalizado. Relatórios disponíveis no EduDrive Financeiro.", type: "geral", date: "14/02/2024", author: "Departamento Financeiro", department: "Departamento Financeiro" },
  { id: "f3", title: "Reunião extraordinária — Orçamento 2025", content: "Convocados todos os responsáveis para reunião extraordinária dia 20/02 às 10h00.", type: "urgente", date: "14/02/2024", author: "Reitoria", department: "Reitoria" },
  { id: "f4", title: "Workshop: Gestão de Tesouraria", content: "Workshop facultativo para a equipa financeira. Inscrições até 22/02.", type: "evento", date: "13/02/2024", author: "Departamento Financeiro", department: "Departamento Financeiro", cta: "inscrever" },
];

type Scope = "todos" | "departamento" | "meus";

export default function FinancasAnuncios() {
  const { user } = useAuth();
  const [items, setItems] = useState<FinAnn[]>(SEED);
  const [scope, setScope] = useState<Scope>("todos");
  const [typeFilter, setTypeFilter] = useState<AnnType | "todos">("todos");
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [subscribed, setSubscribed] = useState<Set<string>>(new Set());

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

  const filtered = useMemo(() => {
    return items.filter(a => {
      if (scope === "departamento" && a.department !== "Departamento Financeiro") return false;
      if (scope === "meus" && !a.isMine) return false;
      if (typeFilter !== "todos" && a.type !== typeFilter) return false;
      if (search && !(a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
  }, [items, scope, typeFilter, search]);

  const todayCount = items.filter(a => a.date === TODAY_LABEL).length;
  const meusCount = items.filter(a => a.isMine).length;
  const deptCount = items.filter(a => a.department === "Departamento Financeiro").length;

  const scopeTabs: { key: Scope; label: string; count: number }[] = [
    { key: "todos", label: "Todos", count: items.length },
    { key: "departamento", label: "Departamento Financeiro", count: deptCount },
    { key: "meus", label: "Os meus", count: meusCount },
  ];

  const todayLabel = new Date().toLocaleDateString("pt-PT", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
  const anoLetivo = "2024 / 2025";

  const stats = [
    { label: "Novos hoje", value: todayCount, icon: Sparkles, tone: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "Departamento Financeiro", value: deptCount, icon: Building2, tone: "text-primary bg-primary/5 border-primary/10" },
    { label: "Meus anúncios", value: meusCount, icon: UserCircle2, tone: "text-violet-600 bg-violet-50 border-violet-100" },
    { label: "Total", value: items.length, icon: Inbox, tone: "text-slate-600 bg-slate-50 border-slate-100" },
  ];

  return (
    <div className="p-6 lg:p-8 animate-fade-in space-y-6">
      {/* ── Header ──────────────────────────────── */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
              <span className="flex items-center gap-1 capitalize">
                <CalendarIcon className="w-3.5 h-3.5" />
                {todayLabel}
              </span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Ano Letivo {anoLetivo}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-primary" /> Anúncios
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Comunicações institucionais e do Departamento Financeiro.
            </p>
          </div>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 gap-1.5 text-xs">
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

        {/* Square stat tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {stats.map(s => (
            <div key={s.label} className={cn("rounded-xl border bg-card p-3 flex items-center gap-3", s.tone.split(" ").filter(c => c.startsWith("border")).join(" "))}>
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", s.tone)}>
                <s.icon className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-foreground leading-none">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1 truncate">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar anúncios por título ou conteúdo…"
            className="pl-10 h-11 text-sm bg-card border-border"
          />
        </div>

        {/* Scope tabs + Category filter */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex bg-muted/60 rounded-lg p-0.5 self-start overflow-x-auto">
            {scopeTabs.map(t => (
              <button key={t.key} onClick={() => setScope(t.key)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                  scope === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {t.label}
                <span className={cn("text-[10px] px-1.5 rounded-full",
                  scope === t.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <Select value={typeFilter} onValueChange={(v: AnnType | "todos") => setTypeFilter(v)}>
            <SelectTrigger className="w-[180px] h-9 text-xs bg-card">
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
        </div>
      </div>


      {/* ── Feed ────────────────────────────────── */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-10 text-center">
            <Megaphone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum anúncio corresponde aos filtros.</p>
          </Card>
        ) : filtered.map(a => {
          const m = TYPE_META[a.type];
          const isSub = subscribed.has(a.id);
          return (
            <Card key={a.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex">
                <div className={cn("w-1 shrink-0", m.dot)} />
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={cn("text-[10px] font-medium", m.chip)}>{m.label}</Badge>
                      <Badge variant="outline" className="text-[10px] bg-muted/40 gap-1">
                        <Building2 className="w-2.5 h-2.5" />{a.department}
                      </Badge>
                      {a.isMine && <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">Criado por mim</Badge>}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                      <CalendarIcon className="w-3 h-3" />{a.date}
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1.5 leading-tight">{a.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a.content}</p>
                  <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border">
                    {a.author && a.author !== a.department ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <UserIcon className="w-3 h-3" />
                        <span className="font-medium text-foreground">{a.author}</span>
                      </div>
                    ) : <div />}
                    <div className="flex items-center gap-2">
                      {a.cta === "inscrever" && (
                        isSub ? (
                          <Badge className="text-[10px] gap-1 bg-emerald-100 text-emerald-700 border-emerald-200 border">
                            <CheckCircle2 className="w-3 h-3" /> Inscrito
                          </Badge>
                        ) : (
                          <Button size="sm" className="h-7 text-[11px] gap-1" onClick={() => setSubscribed(s => new Set(s).add(a.id))}>
                            <CheckCircle2 className="w-3 h-3" /> Inscrever
                          </Button>
                        )
                      )}
                      {a.isMine && (
                        <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(a.id)}>
                          <Trash2 className="w-3 h-3" /> Apagar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

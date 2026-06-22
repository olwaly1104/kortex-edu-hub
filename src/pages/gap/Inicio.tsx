import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FinHeader } from "@/pages/financas/_FinHeader";
import { LayoutDashboard, HelpCircle, CalendarDays, ClipboardList, Users, ClipboardCheck, Clock, MapPin, FileText, UsersRound, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type AgendaItem = {
  id: string;
  type: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  categoria: string | null;
};

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const TYPE_DOT: Record<string, string> = {
  reuniao: "bg-blue-500",
  prazo: "bg-amber-500",
  pessoal: "bg-violet-500",
  feriado: "bg-red-500",
  ferias: "bg-emerald-500",
  outro: "bg-slate-400",
};
const TYPE_LABEL: Record<string, string> = {
  reuniao: "Reunião",
  prazo: "Prazo",
  pessoal: "Pessoal",
  feriado: "Feriado",
  ferias: "Férias",
  outro: "Outro",
};
const ICON_FOR: Record<string, typeof Clock> = {
  reuniao: UsersRound,
  prazo: FileText,
  pessoal: User,
};

export default function GapInicio() {
  const { user } = useAuth();
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data, error } = await supabase
        .from("calendario_events")
        .select("id,type,title,start_time,end_time,location,categoria")
        .eq("event_date", todayStr())
        .order("start_time", { ascending: true });
      if (!mounted) return;
      if (!error) setAgenda(data ?? []);
      setLoading(false);
    };
    load();
    const channel = supabase
      .channel("gap-inicio-agenda")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "calendario_events", filter: `event_date=eq.${todayStr()}` },
        () => load(),
      )
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  const presencaPill = (
    <div className="inline-flex items-stretch rounded-md border border-border bg-card overflow-hidden text-[11px] uppercase tracking-wider font-medium shadow-sm">
      <span className="flex items-center gap-1.5 px-2.5 py-1 text-foreground">
        <ClipboardCheck className="w-3.5 h-3.5 text-muted-foreground" />
        Minha Presença
      </span>
      <span className="w-px bg-border" />
      <span className="flex items-center gap-1.5 px-2.5 py-1 tabular-nums font-semibold text-primary bg-muted/30 tracking-tight">
        0%
      </span>
    </div>
  );
  const kpis = [
    { label: "Solicitações", value: 0, icon: HelpCircle },
    { label: "Agenda de hoje", value: agenda.length, icon: CalendarDays },
    { label: "Candidaturas", value: 0, icon: ClipboardList },
    { label: "Discentes activos", value: 0, icon: Users },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <FinHeader
        title={`Bom dia, ${user?.name?.split(" ").pop() || "GAP"}`}
        subtitle="Cockpit do Gabinete de Apoio ao Discente"
        icon={<LayoutDashboard className="w-5 h-5" />}
        right={presencaPill}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => {
          const I = k.icon;
          return (
            <div key={k.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <I className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold tabular-nums">{k.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="rounded-xl border border-border bg-card p-5">
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Agenda de Hoje</h2>
            <Link to="/gap/calendario" className="text-[10px] uppercase tracking-wide text-primary hover:underline">
              {agenda.length} {agenda.length === 1 ? "item" : "itens"}
            </Link>
          </header>

          {loading ? (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              A carregar…
            </div>
          ) : agenda.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              Sem compromissos para hoje.{" "}
              <Link to="/gap/calendario" className="text-primary hover:underline">Adicionar à agenda →</Link>
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border">
              {agenda.map(item => {
                const key = (item.categoria || item.type || "outro").toLowerCase();
                const Icon = ICON_FOR[key] ?? Clock;
                const time = item.start_time
                  ? item.start_time.slice(0, 5) + (item.end_time ? ` – ${item.end_time.slice(0, 5)}` : "")
                  : "Todo o dia";
                return (
                  <li key={item.id} className="flex items-center gap-3 px-3 py-2.5">
                    <span className={`w-1.5 h-8 rounded-full shrink-0 ${TYPE_DOT[key] ?? TYPE_DOT.outro}`} />
                    <div className="w-9 h-9 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span>
                        {item.location && (
                          <span className="inline-flex items-center gap-1 truncate"><MapPin className="w-3 h-3" /> {item.location}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
                      {TYPE_LABEL[key] ?? "Outro"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Solicitações Pendentes</h2>
            <span className="text-xs font-semibold text-primary tabular-nums">0</span>
          </header>
          <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Sem pedidos pendentes.
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <header className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Candidaturas Activas</h2>
          <span className="text-xs font-semibold text-primary tabular-nums">0</span>
        </header>
        <div className="rounded-md border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
          Sem candidaturas em curso.
        </div>
      </section>
    </div>
  );
}

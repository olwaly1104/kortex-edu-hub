import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUid } from "@/hooks/useAuthUid";
import { useInstitutionContacts } from "@/hooks/useInstitutionContacts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, MessageSquare, Search, Plus, Phone, Video, MoreVertical, Paperclip, Users, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "@/components/chat/EmojiPicker";
import { GifPicker } from "@/components/chat/GifPicker";
import { CallDialog } from "@/components/chat/CallDialog";
import { ModuleTag } from "@/components/chat/ModuleTag";

interface Conversation {
  id: string;
  is_group: boolean;
  updated_at: string;
  other_id?: string;
  other_name?: string;
  other_modulo?: string | null;
  last_message?: string;
}
interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at?: string | null;
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "?";

const moduloLabel = (m?: string | null) => {
  if (!m) return "";
  const map: Record<string, string> = {
    student: "Estudante",
    professor: "Professor",
    coordenador: "Coordenador",
    decano: "Decano",
    reitor: "Reitor",
    financas: "Finanças",
    academica: "Académica",
    gap: "GAP",
    admin: "Admin",
  };
  return map[m] ?? m;
};

function formatLastSeen(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "visto agora mesmo";
  if (diffMin < 60) return `visto há ${diffMin} min`;
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const hhmm = d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `visto hoje às ${hhmm}`;
  if (isYesterday) return `visto ontem às ${hhmm}`;
  return `visto em ${d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" })} às ${hhmm}`;
}

export default function StudentChat() {
  const uid = useAuthUid();
  const { contacts } = useInstitutionContacts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("conversation"));
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [contactQuery, setContactQuery] = useState("");
  const [tab, setTab] = useState<"chats" | "chamadas" | "grupos">("chats");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [call, setCall] = useState<{ mode: "audio" | "video"; name: string } | null>(null);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const [lastSeen, setLastSeen] = useState<Record<string, string | null>>({});
  const [userRoles, setUserRoles] = useState<Record<string, string | null>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadConversations = async () => {
    if (!uid) return;
    const { data: parts } = await (supabase as any)
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", uid);
    const convIds = (parts ?? []).map((p: any) => p.conversation_id);
    if (convIds.length === 0) {
      setConversations([]);
      return;
    }
    const { data: convs } = await (supabase as any)
      .from("conversations")
      .select("id,is_group,updated_at")
      .in("id", convIds)
      .order("updated_at", { ascending: false });

    const enriched: Conversation[] = [];
    for (const c of convs ?? []) {
      let other_id: string | undefined;
      let other_name = c.is_group ? "Grupo" : "Conversa";
      let other_modulo: string | null = null;
      if (!c.is_group) {
        const { data: others } = await (supabase as any)
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", c.id);
        const otherId = (others ?? []).find((o: any) => o.user_id !== uid)?.user_id;
        if (otherId) {
          other_id = otherId;
          const match = contacts.find((ct) => ct.id === otherId);
          if (match) {
            other_name = match.display_name;
            other_modulo = match.modulo;
          }
          if (!other_modulo) {
            if (!match) {
              const { data: name } = await (supabase as any).rpc("get_user_name", { _user_id: otherId });
              other_name = name ?? other_name;
            }
            const { data: roleRow } = await (supabase as any)
              .from("user_roles")
              .select("role")
              .eq("user_id", otherId)
              .order("created_at", { ascending: true })
              .limit(1)
              .maybeSingle();
            other_modulo = roleRow?.role ?? null;
          }
        }
      }
      const { data: last } = await (supabase as any)
        .from("messages")
        .select("body")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1);
      enriched.push({
        ...c,
        other_id,
        other_name,
        other_modulo,
        last_message: last?.[0]?.body,
      });
    }
    setConversations(enriched);
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, contacts.length]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    (async () => {
      const { data } = await (supabase as any)
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedId)
        .order("created_at");
      setMessages(data ?? []);
    })();
    const channel = (supabase as any)
      .channel(`messages:${selectedId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedId}` },
        (payload: any) => setMessages((m) => [...m, payload.new]),
      )
      .subscribe();
    return () => {
      (supabase as any).removeChannel(channel);
    };
  }, [selectedId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, selectedId]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedId]);

  // Presence + last-seen heartbeat
  useEffect(() => {
    if (!uid) return;
    let mounted = true;

    const touch = () => (supabase as any).rpc("touch_last_seen");
    touch();
    const interval = setInterval(touch, 30000);

    const channel = (supabase as any).channel("online-users", {
      config: { presence: { key: uid } },
    });
    channel
      .on("presence", { event: "sync" }, () => {
        if (!mounted) return;
        const state = channel.presenceState() as Record<string, unknown>;
        setOnlineIds(new Set(Object.keys(state)));
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    const handleUnload = () => { (supabase as any).rpc("touch_last_seen"); };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      (supabase as any).rpc("touch_last_seen");
      (supabase as any).removeChannel(channel);
    };
  }, [uid]);

  // Fetch presence (role + last_seen) for all contacts AND conversation partners
  useEffect(() => {
    const ids = new Set<string>();
    contacts.forEach((c) => ids.add(c.id));
    conversations.forEach((c) => { if (c.other_id) ids.add(c.other_id); });
    if (ids.size === 0) return;
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any).rpc("get_users_presence", { _ids: Array.from(ids) });
      if (cancelled || !data) return;
      const seen: Record<string, string | null> = {};
      const roles: Record<string, string | null> = {};
      for (const p of data as Array<{ id: string; role: string | null; last_seen_at: string | null }>) {
        seen[p.id] = p.last_seen_at;
        roles[p.id] = p.role;
      }
      setLastSeen(seen);
      setUserRoles(roles);
    })();
    return () => { cancelled = true; };
  }, [contacts, conversations]);

  const send = async () => {
    if (!draft.trim() || !selectedId || !uid) return;
    const content = draft.trim();
    setDraft("");
    await (supabase as any)
      .from("messages")
      .insert({ conversation_id: selectedId, sender_id: uid, body: content });
    loadConversations();
  };

  const startWith = async (userId: string) => {
    const { data } = await (supabase as any).rpc("get_or_create_dm", { _other_user_id: userId });
    if (data) {
      setSelectedId(data);
      setSearchParams({ conversation: data });
      await loadConversations();
    }
  };

  const filteredConvs = useMemo(
    () =>
      conversations
        .filter((c) => (tab === "grupos" ? c.is_group : !c.is_group))
        .filter((c) => (c.other_name ?? "").toLowerCase().includes(query.toLowerCase())),
    [conversations, query, tab],
  );

  const filteredContacts = useMemo(
    () =>
      contacts.filter((c) =>
        c.display_name.toLowerCase().includes(contactQuery.toLowerCase()),
      ),
    [contacts, contactQuery],
  );

  // Contacts matching the main search that are NOT already in the visible conversations list.
  const searchableContacts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || tab !== "chats") return [];
    const existingIds = new Set(conversations.filter((c) => !c.is_group).map((c) => c.other_id));
    return contacts.filter(
      (c) => !existingIds.has(c.id) && c.display_name.toLowerCase().includes(q),
    );
  }, [contacts, conversations, query, tab]);

  const selected = conversations.find((c) => c.id === selectedId);

  const grouped = useMemo(() => {
    const groups: { label: string; items: Message[] }[] = [];
    for (const m of messages) {
      const d = new Date(m.created_at);
      const label = d.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.items.push(m);
      else groups.push({ label, items: [m] });
    }
    return groups;
  }, [messages]);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex bg-background">
      {/* Conversations column */}
      <aside className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-sm leading-tight">Mensagens</h2>
                <p className="text-[11px] text-muted-foreground">{conversations.length} conversa{conversations.length === 1 ? "" : "s"}</p>
              </div>
            </div>
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8"><Plus className="w-4 h-4" /></Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-0">
                <div className="p-2 border-b border-border space-y-2">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold px-1">
                    Iniciar conversa
                  </p>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={contactQuery}
                      onChange={(e) => setContactQuery(e.target.value)}
                      placeholder="Escolher utilizador…"
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </div>
                <ScrollArea className="max-h-72">
                  {filteredContacts.length === 0 ? (
                    <p className="p-4 text-center text-xs text-muted-foreground">Sem contactos.</p>
                  ) : (
                    filteredContacts.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { startWith(c.id); setPickerOpen(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center gap-3"
                      >
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="text-[10px] bg-muted text-foreground font-medium">
                            {initials(c.display_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p className="text-sm font-medium truncate">{c.display_name}</p>
                            <ModuleTag modulo={c.modulo} size="xs" />
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex bg-muted/50 rounded-lg p-0.5">
            {([
              { k: "chats", label: "Chats", icon: MessageSquare },
              { k: "chamadas", label: "Chamadas", icon: PhoneCall },
              { k: "grupos", label: "Grupos", icon: Users },
            ] as const).map((t) => {
              const Icon = t.icon;
              const active = tab === t.k;
              return (
                <button
                  key={t.k}
                  onClick={() => { setTab(t.k); setSelectedId(null); }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                    active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {tab !== "chamadas" && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tab === "grupos" ? "Pesquisar grupos…" : "Pesquisar conversas, utilizadores…"}
                className="pl-8 h-9 text-sm"
              />
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          {tab === "chamadas" ? (
            <div className="p-8 text-center">
              <PhoneCall className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">Sem chamadas recentes.</p>
            </div>
          ) : filteredConvs.length === 0 && searchableContacts.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">
                {query ? "Sem resultados" : tab === "grupos" ? "Sem grupos." : "Sem conversas. Use + para iniciar."}
              </p>
            </div>
          ) : (
            <>
              {filteredConvs.length > 0 && (
                <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Conversas
                </div>
              )}
              {filteredConvs.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedId(c.id);
                    setSearchParams({ conversation: c.id });
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 border-b border-border/60 hover:bg-muted/40 transition-colors flex gap-3 items-center",
                    selectedId === c.id && "bg-muted",
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                        {initials(c.other_name ?? "?")}
                      </AvatarFallback>
                    </Avatar>
                    {c.other_id && onlineIds.has(c.other_id) && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-sm font-medium truncate">{c.other_name}</p>
                        <ModuleTag modulo={c.other_modulo ?? (c.other_id ? userRoles[c.other_id] : null)} size="xs" />
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(c.updated_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {c.last_message ?? "Sem mensagens"}
                    </p>
                  </div>
                </button>
              ))}
              {searchableContacts.length > 0 && (
                <>
                  <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                    Utilizadores
                  </div>
                  {searchableContacts.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => startWith(u.id)}
                      className="w-full text-left px-3 py-2.5 border-b border-border/60 hover:bg-muted/40 transition-colors flex gap-3 items-center"
                    >
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarFallback className="text-xs bg-muted text-foreground font-medium">
                          {initials(u.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-sm font-medium truncate">{u.display_name}</p>
                          <ModuleTag modulo={u.modulo} size="xs" />
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          Iniciar conversa
                        </p>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </>
          )}
        </ScrollArea>
      </aside>

      {/* Thread */}
      <section className="flex-1 flex flex-col bg-muted/10">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-center px-8">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-1">As suas mensagens</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Seleccione uma conversa ou inicie uma nova a partir do painel de contactos à direita.
              </p>
            </div>
          </div>
        ) : (
          <>
            <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {initials(selected.other_name ?? "?")}
                    </AvatarFallback>
                  </Avatar>
                  {selected.other_id && onlineIds.has(selected.other_id) && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold leading-tight">{selected.other_name}</p>
                    <ModuleTag modulo={selected.other_modulo} size="xs" />
                  </div>
                  {selected.other_id && (
                    <p className={cn(
                      "text-[11px] leading-tight mt-0.5",
                      onlineIds.has(selected.other_id) ? "text-emerald-600 font-medium" : "text-muted-foreground"
                    )}>
                      {onlineIds.has(selected.other_id) ? "online" : formatLastSeen(lastSeen[selected.other_id])}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button onClick={() => setCall({ mode: "audio", name: selected.other_name ?? "Contacto" })} variant="ghost" size="icon" className="h-8 w-8"><Phone className="w-4 h-4" /></Button>
                <Button onClick={() => setCall({ mode: "video", name: selected.other_name ?? "Contacto" })} variant="ghost" size="icon" className="h-8 w-8"><Video className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
              </div>
            </header>
            {call && (
              <CallDialog open={!!call} onClose={() => setCall(null)} name={call.name} mode={call.mode} />
            )}

            <div ref={scrollRef} className="flex-1 overflow-auto px-6 py-4 space-y-4">
              {grouped.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground mt-10">
                  Inicie a conversa enviando uma mensagem.
                </div>
              ) : (
                grouped.map((g) => (
                  <div key={g.label} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-border/60" />
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{g.label}</span>
                      <div className="flex-1 h-px bg-border/60" />
                    </div>
                    {g.items.map((m) => {
                      const own = m.sender_id === uid;
                      return (
                        <div key={m.id} className={cn("flex", own ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "rounded-2xl px-3.5 py-2 text-sm max-w-[65%] shadow-sm",
                              own
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-card border border-border rounded-bl-md",
                            )}
                          >
                            <p
                              className={cn(
                                "text-[10px] font-semibold mb-0.5",
                                own ? "text-primary-foreground/80" : "text-primary",
                              )}
                            >
                              {own ? "Eu" : selected.other_name}
                            </p>
                            {/^https?:\/\/\S+\.(gif|png|jpe?g|webp)(\?\S*)?$/i.test(m.body) ? (
                              <img src={m.body} alt="gif" className="rounded-lg max-w-full max-h-60 object-contain" />
                            ) : (
                              <p className="whitespace-pre-wrap break-words">{m.body}</p>
                            )}
                            <p
                              className={cn(
                                "text-[10px] mt-1",
                                own ? "text-primary-foreground/70" : "text-muted-foreground",
                              )}
                            >
                              {new Date(m.created_at).toLocaleTimeString("pt-PT", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border bg-card p-3">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"><Paperclip className="w-4 h-4" /></Button>
                <GifPicker onPick={(url) => {
                  if (!selectedId || !uid) return;
                  (supabase as any).from("messages").insert({ conversation_id: selectedId, sender_id: uid, body: url }).then(() => loadConversations());
                }} />
                <EmojiPicker onPick={(e) => setDraft((d) => d + e)} />
                <Input
                  ref={inputRef}
                  placeholder="Escrever mensagem…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                  className="h-9"
                />
                <Button onClick={send} disabled={!draft.trim()} size="icon" className="h-9 w-9 shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

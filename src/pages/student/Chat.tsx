import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useInstitutionContacts } from "@/hooks/useInstitutionContacts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, MessageSquare, Search, Plus, Phone, Video, MoreVertical, Smile, Paperclip, Users, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";

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
  content: string;
  created_at: string;
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

export default function StudentChat() {
  const { user } = useAuth();
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadConversations = async () => {
    if (!user) return;
    const { data: parts } = await (supabase as any)
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);
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
        const otherId = (others ?? []).find((o: any) => o.user_id !== user.id)?.user_id;
        if (otherId) {
          other_id = otherId;
          const match = contacts.find((ct) => ct.id === otherId);
          if (match) {
            other_name = match.display_name;
            other_modulo = match.modulo;
          } else {
            const { data: prof } = await (supabase as any)
              .from("profiles")
              .select("display_name")
              .eq("id", otherId)
              .maybeSingle();
            other_name = prof?.display_name ?? other_name;
          }
        }
      }
      const { data: last } = await (supabase as any)
        .from("messages")
        .select("content")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1);
      enriched.push({
        ...c,
        other_id,
        other_name,
        other_modulo,
        last_message: last?.[0]?.content,
      });
    }
    setConversations(enriched);
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, contacts.length]);

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

  const send = async () => {
    if (!draft.trim() || !selectedId || !user) return;
    const content = draft.trim();
    setDraft("");
    await (supabase as any)
      .from("messages")
      .insert({ conversation_id: selectedId, sender_id: user.id, content });
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
                <div className="p-2 border-b border-border">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={contactQuery}
                      onChange={(e) => setContactQuery(e.target.value)}
                      placeholder="Pesquisar contactos…"
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
                          <p className="text-sm font-medium truncate">{c.display_name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{moduloLabel(c.modulo)}</p>
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
                placeholder={tab === "grupos" ? "Pesquisar grupos…" : "Pesquisar conversas…"}
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
          ) : filteredConvs.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">
                {query ? "Sem resultados" : tab === "grupos" ? "Sem grupos." : "Sem conversas. Use + para iniciar."}
              </p>
            </div>
          ) : (
            filteredConvs.map((c) => (
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
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                    {initials(c.other_name ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{c.other_name}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(c.updated_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {c.other_modulo && (
                      <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-normal">
                        {moduloLabel(c.other_modulo)}
                      </Badge>
                    )}
                    <p className="text-[11px] text-muted-foreground truncate flex-1">
                      {c.last_message ?? "Sem mensagens"}
                    </p>
                  </div>
                </div>
              </button>
            ))
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
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                    {initials(selected.other_name ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold leading-tight">{selected.other_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {moduloLabel(selected.other_modulo)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Video className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
              </div>
            </header>

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
                      const own = m.sender_id === user?.id;
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
                            <p className="whitespace-pre-wrap break-words">{m.content}</p>
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
                <Input
                  ref={inputRef}
                  placeholder="Escrever mensagem…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                  className="h-9"
                />
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"><Smile className="w-4 h-4" /></Button>
                <Button onClick={send} disabled={!draft.trim()} size="icon" className="h-9 w-9 shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Contacts column */}
      <aside className="w-72 border-l border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Contactos</h3>
            <span className="text-[11px] text-muted-foreground">{contacts.length}</span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={contactQuery}
              onChange={(e) => setContactQuery(e.target.value)}
              placeholder="Pesquisar…"
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filteredContacts.length === 0 ? (
            <p className="p-6 text-center text-xs text-muted-foreground">Sem contactos.</p>
          ) : (
            filteredContacts.map((c) => (
              <button
                key={c.id}
                onClick={() => startWith(c.id)}
                className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors flex items-center gap-3 border-b border-border/40"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-[10px] bg-muted text-foreground font-medium">
                    {initials(c.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.display_name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {moduloLabel(c.modulo)}
                  </p>
                </div>
                <Plus className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            ))
          )}
        </ScrollArea>
      </aside>
    </div>
  );
}

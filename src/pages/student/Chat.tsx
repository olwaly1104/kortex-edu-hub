import { useEffect, useState, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useInstitutionContacts } from "@/hooks/useInstitutionContacts";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Conversation { id: string; is_group: boolean; updated_at: string; other_name?: string }
interface Message { id: string; conversation_id: string; sender_id: string; content: string; created_at: string }

export default function StudentChat() {
  const { user } = useAuth();
  const { contacts } = useInstitutionContacts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("conversation"));
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [showNew, setShowNew] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    if (!user) return;
    const { data: parts } = await (supabase as any)
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);
    const convIds = (parts ?? []).map((p: any) => p.conversation_id);
    if (convIds.length === 0) { setConversations([]); return; }
    const { data: convs } = await (supabase as any)
      .from("conversations").select("id,is_group,updated_at").in("id", convIds).order("updated_at", { ascending: false });
    // resolve other participant for DMs
    const enriched: Conversation[] = [];
    for (const c of (convs ?? [])) {
      let name = c.is_group ? "Grupo" : "Conversa";
      if (!c.is_group) {
        const { data: others } = await (supabase as any)
          .from("conversation_participants").select("user_id").eq("conversation_id", c.id);
        const otherId = (others ?? []).find((o: any) => o.user_id !== user.id)?.user_id;
        if (otherId) {
          const { data: prof } = await (supabase as any).from("profiles").select("display_name").eq("id", otherId).maybeSingle();
          name = prof?.display_name ?? name;
        }
      }
      enriched.push({ ...c, other_name: name });
    }
    setConversations(enriched);
  };

  useEffect(() => { loadConversations(); }, [user?.id]);

  useEffect(() => {
    if (!selectedId) { setMessages([]); return; }
    (async () => {
      const { data } = await (supabase as any).from("messages").select("*").eq("conversation_id", selectedId).order("created_at");
      setMessages(data ?? []);
    })();
    const channel = (supabase as any).channel(`messages:${selectedId}`).on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedId}` },
      (payload: any) => setMessages((m) => [...m, payload.new]),
    ).subscribe();
    return () => { (supabase as any).removeChannel(channel); };
  }, [selectedId]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [messages.length]);

  const send = async () => {
    if (!draft.trim() || !selectedId || !user) return;
    await (supabase as any).from("messages").insert({ conversation_id: selectedId, sender_id: user.id, content: draft.trim() });
    setDraft("");
  };

  const startWith = async (userId: string) => {
    const { data } = await (supabase as any).rpc("get_or_create_dm", { _other_user_id: userId });
    if (data) {
      setShowNew(false);
      setSelectedId(data);
      setSearchParams({ conversation: data });
      await loadConversations();
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex">
      <aside className="w-72 border-r border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm">Conversas</h2>
          <Button size="sm" variant="ghost" onClick={() => setShowNew((v) => !v)} className="h-7 gap-1"><Plus className="w-3.5 h-3.5" />Nova</Button>
        </div>
        {showNew && (
          <div className="p-2 border-b border-border max-h-60 overflow-auto">
            {contacts.length === 0 ? (
              <p className="text-[12px] text-muted-foreground p-3">Sem contactos.</p>
            ) : contacts.map((c) => (
              <button key={c.id} onClick={() => startWith(c.id)} className="w-full text-left px-2 py-1.5 rounded hover:bg-muted text-sm flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-muted-foreground" />{c.display_name}
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
              Sem conversas. Clique em "Nova" para começar.
            </div>
          ) : conversations.map((c) => (
            <button key={c.id} onClick={() => { setSelectedId(c.id); setSearchParams({ conversation: c.id }); }} className={cn("w-full text-left p-3 border-b border-border hover:bg-muted/50", selectedId === c.id && "bg-muted")}>
              <p className="text-sm font-medium truncate">{c.other_name}</p>
              <p className="text-[11px] text-muted-foreground">{new Date(c.updated_at).toLocaleString("pt-PT")}</p>
            </button>
          ))}
        </div>
      </aside>
      <section className="flex-1 flex flex-col">
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Seleccione uma conversa.</div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-2 bg-muted/20">
              {messages.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground mt-10">Sem mensagens nesta conversa.</p>
              ) : messages.map((m) => {
                const own = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={cn("flex", own ? "justify-end" : "justify-start")}>
                    <div className={cn("rounded-2xl px-3.5 py-2 text-sm max-w-[70%]", own ? "bg-primary text-primary-foreground" : "bg-card border border-border")}>
                      {m.content}
                      <p className={cn("text-[10px] mt-1 opacity-70", own ? "text-primary-foreground" : "text-muted-foreground")}>{new Date(m.created_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border bg-background p-3 flex gap-2">
              <Input placeholder="Escrever mensagem…" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
              <Button onClick={send} disabled={!draft.trim()} className="gap-1.5"><Send className="w-4 h-4" />Enviar</Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Phone, Video, Send, Mic, MicOff, VideoIcon, VideoOff, PhoneOff, LogOut, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type Profile = { id: string; display_name: string; email: string | null };
type Message = { id: string; conversation_id: string; sender_id: string; body: string; created_at: string };
type CallState = { open: boolean; name: string; medium: "voice" | "video"; phase: "ringing" | "ongoing" };

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function AuthGate({ onSignedIn }: { onSignedIn: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { display_name: name || email.split("@")[0] },
            emailRedirectTo: `${window.location.origin}/student/chat`,
          },
        });
        if (error) throw error;
        toast.success("Conta criada — já podes conversar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onSignedIn();
    } catch (err: any) {
      toast.error(err.message || "Erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1"><MessageSquare className="w-5 h-5 text-primary" /><h2 className="text-lg font-bold">Chat UPRA</h2></div>
        <p className="text-xs text-muted-foreground mb-5">
          {mode === "signin" ? "Entra para conversar em tempo real." : "Cria uma conta para começar."}
        </p>
        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <Input placeholder="Nome a apresentar" value={name} onChange={e => setName(e.target.value)} />
          )}
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Palavra-passe" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "A processar..." : mode === "signin" ? "Entrar" : "Criar conta"}
          </Button>
        </form>
        <button onClick={() => setMode(m => m === "signin" ? "signup" : "signin")} className="text-xs text-primary hover:underline mt-4 w-full text-center">
          {mode === "signin" ? "Não tens conta? Criar conta" : "Já tens conta? Entrar"}
        </button>
      </div>
    </div>
  );
}

export default function StudentChat() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setAuthReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!authReady) return <div className="h-screen flex items-center justify-center text-sm text-muted-foreground">A carregar...</div>;
  if (!user) return <AuthGate onSignedIn={() => { /* state will update via listener */ }} />;
  return <ChatRoom user={user} />;
}

function ChatRoom({ user }: { user: User }) {
  const [contacts, setContacts] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [call, setCall] = useState<CallState>({ open: false, name: "", medium: "voice", phase: "ringing" });
  const [callSeconds, setCallSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load all other profiles
  useEffect(() => {
    supabase.from("profiles").select("id, display_name, email").neq("id", user.id).order("display_name")
      .then(({ data, error }) => { if (error) toast.error(error.message); else setContacts(data || []); });
  }, [user.id]);

  // When contact selected → ensure DM conversation
  useEffect(() => {
    if (!selected) { setConvId(null); setMessages([]); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("get_or_create_dm", { _other_user_id: selected.id });
      if (cancelled) return;
      if (error) { toast.error(error.message); return; }
      setConvId(data as string);
    })();
    return () => { cancelled = true; };
  }, [selected]);

  // Load messages + realtime subscription
  useEffect(() => {
    if (!convId) return;
    let cancelled = false;
    supabase.from("messages").select("*").eq("conversation_id", convId).order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) toast.error(error.message); else setMessages(data || []);
      });

    const channel = supabase.channel(`messages:${convId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${convId}` },
        (payload) => { setMessages(prev => prev.some(m => m.id === (payload.new as Message).id) ? prev : [...prev, payload.new as Message]); })
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [convId]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages.length]);

  // Call timer
  useEffect(() => {
    if (!call.open || call.phase !== "ongoing") return;
    const t = setInterval(() => setCallSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [call.open, call.phase]);
  useEffect(() => {
    if (!call.open || call.phase !== "ringing") return;
    const t = setTimeout(() => setCall(c => ({ ...c, phase: "ongoing" })), 6000);
    return () => clearTimeout(t);
  }, [call.open, call.phase]);

  const sendMessage = async () => {
    const text = body.trim();
    if (!text || !convId) return;
    setBody("");
    const { error } = await supabase.from("messages").insert({ conversation_id: convId, sender_id: user.id, body: text });
    if (error) { toast.error(error.message); setBody(text); }
  };

  const startCall = (name: string, medium: "voice" | "video") => {
    setMuted(false); setCamOff(false); setCallSeconds(0);
    setCall({ open: true, name, medium, phase: "ringing" });
    toast.success(medium === "video" ? `A chamar ${name} (vídeo)...` : `A chamar ${name}...`);
  };
  const endCall = () => {
    const wasRinging = call.phase === "ringing";
    setCall(c => ({ ...c, open: false }));
    if (wasRinging) toast(`Chamada cancelada · ${call.name} não atendeu`);
    else toast(`Chamada terminada · ${Math.floor(callSeconds / 60).toString().padStart(2, "0")}:${(callSeconds % 60).toString().padStart(2, "0")}`);
  };

  const signOut = async () => { await supabase.auth.signOut(); toast("Sessão de chat terminada"); };
  const mmss = `${Math.floor(callSeconds / 60).toString().padStart(2, "0")}:${(callSeconds % 60).toString().padStart(2, "0")}`;
  const filtered = contacts.filter(c => c.display_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-screen flex animate-fade-in">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col shrink-0 bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Chat</h2>
            <Button variant="ghost" size="icon" onClick={signOut} title="Terminar sessão de chat"><LogOut className="w-4 h-4" /></Button>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2 truncate">Ligado como {user.email}</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar contactos..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8 px-4">
              {contacts.length === 0 ? "Sem outros utilizadores ainda. Cria uma segunda conta noutro browser para começar a conversar." : "Nenhum contacto encontrado."}
            </p>
          ) : filtered.map(c => (
            <button key={c.id} onClick={() => setSelected(c)}
              className={cn("w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left",
                selected?.id === c.id && "bg-muted")}>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {c.display_name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{c.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">{c.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="flex items-center justify-between px-5 py-3 border-b bg-card">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {selected.display_name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selected.display_name}</p>
                  <p className="text-[11px] text-muted-foreground">{selected.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => startCall(selected.display_name, "voice")}><Phone className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => startCall(selected.display_name, "video")}><Video className="w-4 h-4" /></Button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3 bg-muted/30">
              {messages.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">Sem mensagens. Envia a primeira.</p>
              ) : messages.map(msg => {
                const isOwn = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={cn("flex", isOwn && "justify-end")}>
                    <div className={cn("max-w-[70%] rounded-2xl px-4 py-2.5",
                      isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card text-foreground rounded-bl-md shadow-sm")}>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                      <p className={cn("text-[10px] mt-1", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>{formatTime(msg.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-4 py-3 border-t bg-card flex items-center gap-2">
              <Input placeholder="Escrever mensagem..." value={body} onChange={e => setBody(e.target.value)} className="flex-1"
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
              <Button size="icon" disabled={!body.trim() || !convId} onClick={sendMessage}><Send className="w-4 h-4" /></Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <MessageSquare className="w-10 h-10 opacity-40" />
            <p className="text-sm">Seleccione um contacto para começar.</p>
          </div>
        )}
      </div>

      {/* Call dialog (mock — voz/vídeo real requer LiveKit) */}
      <Dialog open={call.open} onOpenChange={(o) => { if (!o) endCall(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{call.medium === "video" ? "Videochamada" : "Chamada de voz"}</DialogTitle>
            <DialogDescription>{call.phase === "ringing" ? "A chamar… (a tocar)" : `Em curso · ${mmss}`}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 py-6">
            <div className={cn("w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary",
              call.phase === "ringing" && "animate-pulse ring-4 ring-primary/30")}>
              {call.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-foreground">{call.name}</p>
            <p className="text-xs text-muted-foreground">{call.phase === "ringing" ? "A tocar…" : `Em chamada · ${mmss}`}</p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant={muted ? "default" : "outline"} size="icon" className="rounded-full" onClick={() => setMuted(m => !m)}>
              {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            {call.medium === "video" && (
              <Button variant={camOff ? "default" : "outline"} size="icon" className="rounded-full" onClick={() => setCamOff(c => !c)}>
                {camOff ? <VideoOff className="w-4 h-4" /> : <VideoIcon className="w-4 h-4" />}
              </Button>
            )}
            <Button variant="destructive" size="icon" className="rounded-full" onClick={endCall}><PhoneOff className="w-4 h-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInstitutionContacts } from "@/hooks/useInstitutionContacts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Inbox,
  Send,
  FileText,
  Trash2,
  Star,
  Search,
  PenSquare,
  Paperclip,
  Reply,
  Forward,
  Archive,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Folder = "inbox" | "sent" | "drafts" | "starred" | "trash";

interface EmailMessage {
  id: string;
  folder: Folder;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "?";

const STORAGE_KEY = "upra.email.mailbox.v1";

const loadMailbox = (): EmailMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

const saveMailbox = (m: EmailMessage[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  } catch {}
};

const FOLDERS: { key: Folder; label: string; icon: typeof Inbox }[] = [
  { key: "inbox", label: "Caixa de entrada", icon: Inbox },
  { key: "starred", label: "Com estrela", icon: Star },
  { key: "sent", label: "Enviados", icon: Send },
  { key: "drafts", label: "Rascunhos", icon: FileText },
  { key: "trash", label: "Lixo", icon: Trash2 },
];

export default function StudentEmail() {
  const { user } = useAuth();
  const { contacts } = useInstitutionContacts();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTo = searchParams.get("to");

  const [folder, setFolder] = useState<Folder>("inbox");
  const [mailbox, setMailbox] = useState<EmailMessage[]>(() => loadMailbox());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  useEffect(() => {
    saveMailbox(mailbox);
  }, [mailbox]);

  useEffect(() => {
    if (initialTo) {
      setComposeTo(initialTo);
      setComposeOpen(true);
      searchParams.delete("to");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTo]);

  const counts = useMemo(() => {
    const c: Record<Folder, number> = {
      inbox: 0,
      sent: 0,
      drafts: 0,
      starred: 0,
      trash: 0,
    };
    for (const m of mailbox) {
      if (m.starred && m.folder !== "trash") c.starred++;
      c[m.folder]++;
    }
    return c;
  }, [mailbox]);

  const unreadInbox = useMemo(
    () => mailbox.filter((m) => m.folder === "inbox" && !m.read).length,
    [mailbox],
  );

  const list = useMemo(() => {
    let items = mailbox;
    if (folder === "starred") items = items.filter((m) => m.starred && m.folder !== "trash");
    else items = items.filter((m) => m.folder === folder);
    if (query) {
      const q = query.toLowerCase();
      items = items.filter(
        (m) =>
          m.subject.toLowerCase().includes(q) ||
          m.from.toLowerCase().includes(q) ||
          m.body.toLowerCase().includes(q),
      );
    }
    return items.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [mailbox, folder, query]);

  const selected = mailbox.find((m) => m.id === selectedId) ?? null;

  const openMail = (m: EmailMessage) => {
    setSelectedId(m.id);
    if (!m.read) {
      setMailbox((mb) => mb.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
    }
  };

  const toggleStar = (id: string) => {
    setMailbox((mb) => mb.map((x) => (x.id === id ? { ...x, starred: !x.starred } : x)));
  };

  const moveToTrash = (id: string) => {
    setMailbox((mb) => mb.map((x) => (x.id === id ? { ...x, folder: "trash" } : x)));
    if (selectedId === id) setSelectedId(null);
  };

  const resetCompose = () => {
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
  };

  const sendMail = () => {
    if (!composeTo.trim()) return;
    const msg: EmailMessage = {
      id: crypto.randomUUID(),
      folder: "sent",
      from: user?.email ?? "eu@upra.kor",
      fromEmail: user?.email ?? "eu@upra.kor",
      to: composeTo.trim(),
      subject: composeSubject.trim() || "(sem assunto)",
      body: composeBody,
      date: new Date().toISOString(),
      read: true,
      starred: false,
    };
    setMailbox((mb) => [msg, ...mb]);
    setComposeOpen(false);
    resetCompose();
    setFolder("sent");
    setSelectedId(msg.id);
  };

  const saveDraft = () => {
    if (!composeTo && !composeSubject && !composeBody) {
      setComposeOpen(false);
      return;
    }
    const msg: EmailMessage = {
      id: crypto.randomUUID(),
      folder: "drafts",
      from: user?.email ?? "eu@upra.kor",
      fromEmail: user?.email ?? "eu@upra.kor",
      to: composeTo,
      subject: composeSubject || "(sem assunto)",
      body: composeBody,
      date: new Date().toISOString(),
      read: true,
      starred: false,
    };
    setMailbox((mb) => [msg, ...mb]);
    setComposeOpen(false);
    resetCompose();
  };

  const reply = () => {
    if (!selected) return;
    setComposeTo(selected.fromEmail);
    setComposeSubject(selected.subject.startsWith("Re:") ? selected.subject : `Re: ${selected.subject}`);
    setComposeBody(`\n\n---\nDe: ${selected.from}\n${selected.body}`);
    setComposeOpen(true);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex bg-background">
      {/* Folders */}
      <aside className="w-60 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm leading-tight">Email</h2>
              <p className="text-[11px] text-muted-foreground">
                {unreadInbox > 0 ? `${unreadInbox} por ler` : "Caixa em dia"}
              </p>
            </div>
          </div>
          <Button onClick={() => setComposeOpen(true)} className="w-full h-9 gap-2">
            <PenSquare className="w-4 h-4" />
            Novo email
          </Button>
        </div>
        <nav className="p-2 flex-1">
          {FOLDERS.map((f) => {
            const Icon = f.icon;
            const active = folder === f.key;
            const c = counts[f.key];
            return (
              <button
                key={f.key}
                onClick={() => {
                  setFolder(f.key);
                  setSelectedId(null);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  active ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted/50",
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{f.label}</span>
                {c > 0 && (
                  <span className={cn("text-[10px]", active ? "text-primary" : "text-muted-foreground")}>
                    {c}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Message list */}
      <aside className="w-96 border-r border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar emails…"
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {list.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">Sem emails nesta pasta.</p>
            </div>
          ) : (
            list.map((m) => (
              <button
                key={m.id}
                onClick={() => openMail(m)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border/60 hover:bg-muted/40 transition-colors",
                  selectedId === m.id && "bg-muted",
                  !m.read && folder === "inbox" && "bg-primary/[0.03]",
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                      {initials(folder === "sent" || folder === "drafts" ? m.to : m.from)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className={cn("text-sm truncate", !m.read && folder === "inbox" ? "font-semibold" : "font-medium")}>
                        {folder === "sent" || folder === "drafts" ? m.to : m.from}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(m.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                    <p className={cn("text-xs truncate", !m.read && folder === "inbox" ? "font-medium" : "text-foreground/80")}>
                      {m.subject}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{m.body || "(sem conteúdo)"}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </aside>

      {/* Reader */}
      <section className="flex-1 flex flex-col bg-muted/10">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-center px-8">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-1">Caixa de correio</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Seleccione um email para o ler ou escreva uma nova mensagem.
              </p>
            </div>
          </div>
        ) : (
          <>
            <header className="h-14 border-b border-border bg-card px-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={reply} className="h-8 gap-1.5">
                  <Reply className="w-3.5 h-3.5" />
                  Responder
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5">
                  <Forward className="w-3.5 h-3.5" />
                  Encaminhar
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5">
                  <Archive className="w-3.5 h-3.5" />
                  Arquivar
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleStar(selected.id)}
                >
                  <Star
                    className={cn(
                      "w-4 h-4",
                      selected.starred ? "fill-amber-400 text-amber-400" : "text-muted-foreground",
                    )}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveToTrash(selected.id)}
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </header>

            <ScrollArea className="flex-1">
              <div className="max-w-3xl mx-auto p-8">
                <div className="mb-6">
                  <h1 className="text-xl font-semibold mb-3">{selected.subject}</h1>
                  <Badge variant="secondary" className="text-[10px]">
                    {FOLDERS.find((f) => f.key === selected.folder)?.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 pb-5 mb-5 border-b border-border">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {initials(selected.from)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{selected.from}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Para: {selected.to} •{" "}
                      {new Date(selected.date).toLocaleString("pt-PT", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {selected.body || <span className="text-muted-foreground italic">(sem conteúdo)</span>}
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </section>

      {/* Compose dialog */}
      <Dialog open={composeOpen} onOpenChange={(o) => (o ? setComposeOpen(true) : saveDraft())}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo email</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Para</label>
              <Input
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                placeholder="email@upra.kor"
                list="contacts-list"
                className="mt-1"
              />
              <datalist id="contacts-list">
                {contacts.map((c) => (
                  <option key={c.id} value={c.email ?? ""}>
                    {c.display_name}
                  </option>
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Assunto</label>
              <Input
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Assunto do email"
                className="mt-1"
              />
            </div>
            <div>
              <Textarea
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Escreva a sua mensagem…"
                rows={10}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Paperclip className="w-3.5 h-3.5" />
              Anexar
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={saveDraft}>
              Guardar rascunho
            </Button>
            <Button onClick={sendMail} disabled={!composeTo.trim()} className="gap-1.5">
              <Send className="w-3.5 h-3.5" />
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

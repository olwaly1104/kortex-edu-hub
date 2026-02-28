import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { emailMessages, disciplines } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Search, Star, Send, Inbox, FileText, Trash2, PenSquare, Paperclip, StarOff, Reply, Forward, X, MailOpen, Archive, Download, ReplyAll, Printer, MoreHorizontal, Share2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type Folder = "inbox" | "starred" | "sent" | "drafts" | "trash";
type EmailFilter = "all" | "unread" | "read" | "attachments";

// Internal directory — all @upra.kor addresses map to profiles
const internalDirectory: Record<string, string> = {
  "2934@upra.kor": "João Miguel Fernandes",
  "prof.silva@upra.kor": "Prof. António Silva",
  "prof.ferreira@upra.kor": "Prof. Pedro Ferreira",
  "academico@upra.kor": "Serviços Académicos",
  "estagios@upra.kor": "Gabinete de Estágios",
  "biblioteca@upra.kor": "Biblioteca",
};

function resolveProfile(email: string): { name: string; email: string } {
  return { name: internalDirectory[email] || email, email };
}

const folders = [
  { id: "inbox" as Folder, label: "Caixa de Entrada", icon: Inbox, count: 4 },
  { id: "starred" as Folder, label: "Favoritos", icon: Star, count: 0 },
  { id: "sent" as Folder, label: "Enviados", icon: Send, count: 0 },
  { id: "drafts" as Folder, label: "Rascunhos", icon: FileText, count: 0 },
  { id: "trash" as Folder, label: "Lixo", icon: Trash2, count: 0 },
];

const filterOptions: { id: EmailFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "unread", label: "Não lidos" },
  { id: "read", label: "Lidos" },
  { id: "attachments", label: "Com anexo" },
];

function SquareCheck({ checked, indeterminate, className, ...props }: { checked?: boolean; indeterminate?: boolean; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked ? "true" : "false"}
      tabIndex={0}
      className={cn(
        "w-[16px] h-[16px] rounded-[3px] border-[1.5px] flex items-center justify-center cursor-pointer transition-all shrink-0",
        checked || indeterminate
          ? "bg-primary border-primary text-primary-foreground"
          : "border-muted-foreground/40 hover:border-primary",
        className
      )}
      {...props}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {indeterminate && !checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2.5 5H7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

export default function StudentEmail() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFolder, setActiveFolder] = useState<Folder>("inbox");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<EmailFilter>("all");

  const initialTo = searchParams.get("to") || "";
  const [composing, setComposing] = useState(!!initialTo);
  const [composeTo, setComposeTo] = useState(initialTo);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  const folderEmails = activeFolder === "starred"
    ? emailMessages.filter(e => e.starred)
    : emailMessages.filter(e => e.folder === activeFolder);

  const searched = searchQuery
    ? folderEmails.filter(e => e.subject.toLowerCase().includes(searchQuery.toLowerCase()) || e.from.toLowerCase().includes(searchQuery.toLowerCase()))
    : folderEmails;

  const filtered = searched.filter(e => {
    if (activeFilter === "unread") return !e.read;
    if (activeFilter === "read") return e.read;
    if (activeFilter === "attachments") return e.attachments && e.attachments.length > 0;
    return true;
  });

  const selectedEmail = emailMessages.find(e => e.id === selectedId);
  const activeFolderData = folders.find(f => f.id === activeFolder);

  const allChecked = filtered.length > 0 && filtered.every(e => checkedIds.has(e.id));
  const someChecked = filtered.some(e => checkedIds.has(e.id));

  const toggleAll = () => {
    if (allChecked) setCheckedIds(new Set());
    else setCheckedIds(new Set(filtered.map(e => e.id)));
  };

  const toggleOne = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setCheckedIds(new Set());

  const openCompose = (to?: string) => {
    setComposing(true);
    setComposeTo(to || "");
    setComposeSubject("");
    setComposeBody("");
    setSelectedId(null);
    if (searchParams.has("to")) {
      searchParams.delete("to");
      setSearchParams(searchParams, { replace: true });
    }
  };

  const closeCompose = () => {
    setComposing(false);
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
  };

  // List panel width changes when detail is open
  const listWidth = selectedId && !composing ? "w-[380px] min-w-[320px]" : "flex-1";

  return (
    <div className="h-[calc(100vh-0px)] flex animate-fade-in overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 border-r flex flex-col shrink-0 bg-muted/30">
        <div className="p-4 space-y-3">
          <Button className="w-full gap-2" size="sm" onClick={() => openCompose()}>
            <Mail className="w-4 h-4" /> Novo Email
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Pesquisar..."
              className="pl-8 h-8 text-xs bg-muted/50 border-transparent focus:border-border focus:bg-background"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => { setActiveFolder(f.id); setSelectedId(null); setComposing(false); clearSelection(); setActiveFilter("all"); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                activeFolder === f.id && !composing ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <f.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{f.label}</span>
              {f.count > 0 && <span className="text-xs font-bold">{f.count}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main area: compose OR list+detail */}
      {composing ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 px-5 py-3 border-b bg-card">
            <Button variant="ghost" size="icon" onClick={closeCompose}>
              <X className="w-4 h-4" />
            </Button>
            <h2 className="text-sm font-semibold text-foreground">Novo Email</h2>
            <div className="flex-1" />
            <Button size="sm" className="gap-2" disabled={!composeTo.trim() || !composeSubject.trim()}>
              <Send className="w-3.5 h-3.5" /> Enviar
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground w-12 shrink-0">Para:</label>
                <Input value={composeTo} onChange={e => setComposeTo(e.target.value)} placeholder="email@exemplo.com" className="h-9" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground w-12 shrink-0">Assunto:</label>
                <Input value={composeSubject} onChange={e => setComposeSubject(e.target.value)} placeholder="Assunto do email" className="h-9" />
              </div>
            </div>
            <Textarea value={composeBody} onChange={e => setComposeBody(e.target.value)} placeholder="Escreva a sua mensagem..." className="min-h-[300px] resize-none" />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Paperclip className="w-3.5 h-3.5" /> Anexar ficheiro
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Email list panel */}
          <div className={cn("flex flex-col bg-background border-r shrink-0 transition-all", listWidth)}>
            {/* Header */}
            <div className="border-b bg-card px-4 py-3">
              <div className="flex items-center gap-3">
                {activeFolderData && (
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <activeFolderData.icon className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-foreground">{activeFolderData?.label}</h2>
                  <p className="text-xs text-muted-foreground">{filtered.length} email{filtered.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2.5 px-4 py-2 border-b bg-muted/20">
              <SquareCheck
                checked={allChecked}
                indeterminate={someChecked && !allChecked}
                onClick={toggleAll}
                onKeyDown={e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggleAll(); } }}
              />
              <span className="text-xs text-muted-foreground">
                {someChecked ? `${checkedIds.size} selecionado${checkedIds.size !== 1 ? "s" : ""}` : "Selecionar todos"}
              </span>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1">
                {filterOptions.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                      activeFilter === f.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {someChecked && (
                <>
                  <div className="w-px h-4 bg-border ml-auto" />
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Marcar como lido">
                      <MailOpen className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Favorito">
                      <Star className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Arquivar">
                      <Archive className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" title="Eliminar">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-0.5" />
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={clearSelection}>
                      <X className="w-3 h-3 mr-1" /> Limpar
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Email list */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length > 0 ? (
                <div className="divide-y border-b">
                  {filtered.map(email => (
                    <div
                      key={email.id}
                      onClick={() => setSelectedId(email.id)}
                      className={cn(
                        "flex items-center gap-2.5 px-4 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors group",
                        !email.read && "bg-primary/[0.06] border-l-[3px] border-l-primary",
                        email.read && "border-l-[3px] border-l-transparent",
                        checkedIds.has(email.id) && "bg-primary/[0.08]",
                        selectedId === email.id && "bg-primary/10 !border-l-secondary"
                      )}
                    >
                      <SquareCheck
                        checked={checkedIds.has(email.id)}
                        onClick={e => { e.stopPropagation(); toggleOne(email.id); }}
                        onKeyDown={e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); e.stopPropagation(); toggleOne(email.id); } }}
                        className={cn(!checkedIds.has(email.id) && "border-muted-foreground/30 group-hover:border-muted-foreground/50")}
                      />

                      <button onClick={e => e.stopPropagation()} className="shrink-0">
                        {email.starred
                          ? <Star className="w-4 h-4 fill-warning text-warning" />
                          : <Star className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                        }
                      </button>

                      {(() => {
                        const disc = disciplines.find(d => d.professorEmail === email.fromEmail);
                        const avatar = (
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                            !email.read ? "bg-primary/15 text-primary ring-2 ring-primary/20" : "bg-muted text-muted-foreground",
                            disc && "cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
                          )}>
                            {email.from.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </div>
                        );
                        const discDot = disc ? (
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: disc.color }} />
                        ) : null;
                        return (
                          <>
                            {disc ? (
                              <div onClick={e => { e.stopPropagation(); navigate(`/student/disciplines/${disc.id}`); }}>
                                {avatar}
                              </div>
                            ) : avatar}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-[13px] truncate",
                                  !email.read && "font-semibold text-foreground",
                                  email.read && (email.from.startsWith("Prof.") || /^[A-Z][a-zà-ú]+ [A-Z]/.test(email.from)
                                    ? "italic text-foreground/90"
                                    : "text-foreground/70")
                                )}>
                                  {email.from}
                                </span>
                                {discDot}
                                {!email.read && !disc && (
                                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                )}
                                <span className="ml-auto text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                                  {email.date} - {email.time}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={cn(
                                  "text-[13px] truncate",
                                  !email.read ? "font-bold text-foreground" : "font-semibold text-foreground"
                                )}>
                                  {email.subject}
                                </span>
                              </div>
                              <p className={cn(
                                "text-[12px] truncate",
                                !email.read ? "text-foreground/60" : "text-muted-foreground"
                              )}>
                                {email.preview}
                              </p>
                              {email.attachments && email.attachments.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto max-w-full">
                                  {email.attachments.map((att, i) => (
                                    <div
                                      key={i}
                                      onClick={e => { e.stopPropagation(); }}
                                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-primary/20 bg-primary/[0.04] hover:bg-primary/[0.08] cursor-pointer transition-colors shrink-0"
                                    >
                                      <FileText className="w-3 h-3 text-primary shrink-0" />
                                      <span className="text-[11px] font-medium text-foreground truncate max-w-[120px]">{att.name}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center py-20">
                  <div className="text-center">
                    <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {activeFilter !== "all" ? "Nenhum email com este filtro" : "Nenhum email encontrado"}
                    </p>
                    {activeFilter !== "all" && (
                      <button onClick={() => setActiveFilter("all")} className="text-xs text-primary mt-2 hover:underline">
                        Limpar filtro
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detail panel — only visible when email selected */}
          {selectedEmail && (
            <div className="flex-1 flex flex-col bg-background">
              {/* Toolbar */}
              <div className="flex items-center gap-1 px-5 py-2.5 border-b bg-card">
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setSelectedId(null)} title="Fechar">
                  <X className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button variant="ghost" size="icon" className="w-8 h-8" title="Responder"><Reply className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" title="Responder a todos"><ReplyAll className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" title="Reencaminhar"><Forward className="w-4 h-4" /></Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button variant="ghost" size="icon" className="w-8 h-8" title="Arquivar"><Archive className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" title="Eliminar"><Trash2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" title="Favorito">
                  {selectedEmail.starred ? <Star className="w-4 h-4 fill-warning text-warning" /> : <Star className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" title="Chat" onClick={() => navigate("/student/chat")}>
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <div className="flex-1" />
                <Button variant="ghost" size="icon" className="w-8 h-8" title="Imprimir"><Printer className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" title="Mais opções"><MoreHorizontal className="w-4 h-4" /></Button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Header card — De / Para / Assunto */}
                <div className="mx-5 mt-5 rounded-lg border bg-card">
                  {/* Subject row */}
                  <div className="px-5 py-3.5 border-b">
                    <h2 className="text-lg font-bold text-foreground leading-snug">{selectedEmail.subject}</h2>
                  </div>

                  {/* Meta rows */}
                  <div className="px-5 py-3 space-y-2.5 text-sm">
                    {/* De */}
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground w-14 shrink-0 text-xs font-semibold uppercase tracking-wide">De:</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                          {selectedEmail.from.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <span className="font-medium text-foreground truncate">{selectedEmail.from}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">&lt;{selectedEmail.fromEmail}&gt;</span>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {selectedEmail.date} - {selectedEmail.time}
                      </span>
                    </div>

                    {/* Para */}
                    {(() => {
                      const toProfile = resolveProfile(selectedEmail.to);
                      return (
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground w-14 shrink-0 text-xs font-semibold uppercase tracking-wide">Para:</span>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                              {toProfile.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                            </div>
                            <span className="font-medium text-foreground truncate">{toProfile.name}</span>
                            <span className="text-xs text-muted-foreground hidden sm:inline">&lt;{toProfile.email}&gt;</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Body — clear separation */}
                <div className="mx-5 mt-4 mb-4 rounded-lg border bg-card px-5 py-5">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{selectedEmail.body}</p>

                  {/* Attachments inside body card */}
                  {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                    <div className="mt-5 pt-4 border-t space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Anexos ({selectedEmail.attachments.length})</p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {selectedEmail.attachments.map((att, i) => (
                          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-primary/15 bg-primary/[0.03] hover:bg-primary/[0.06] cursor-pointer transition-colors shrink-0 min-w-[220px]">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{att.name}</p>
                              <p className="text-[11px] text-muted-foreground">{att.size}</p>
                            </div>
                            <div className="flex gap-0.5 shrink-0">
                              <Button variant="ghost" size="icon" className="w-7 h-7" title="Partilhar">
                                <Share2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="w-7 h-7" title="Descarregar">
                                <Download className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick reply actions */}
                <div className="mx-5 mb-5 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Reply className="w-3.5 h-3.5" /> Responder
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <ReplyAll className="w-3.5 h-3.5" /> Responder a todos
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Forward className="w-3.5 h-3.5" /> Reencaminhar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

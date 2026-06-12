import { useState } from "react";
import { chatConversations, chatMessages } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Phone, Video, Send, Paperclip, Smile, Mic, PhoneIncoming, PhoneOutgoing, PhoneMissed, VideoIcon, Users, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const callLog = [
  { id: "cl1", name: "Prof. António Silva", type: "incoming" as const, medium: "voice" as const, time: "14:20", date: "Hoje", duration: "5:32" },
  { id: "cl2", name: "Maria Silva", type: "outgoing" as const, medium: "video" as const, time: "11:05", date: "Hoje", duration: "12:48" },
  { id: "cl3", name: "Prof. Pedro Ferreira", type: "missed" as const, medium: "voice" as const, time: "09:30", date: "Ontem", duration: null },
  { id: "cl4", name: "Grupo Matemática II", type: "outgoing" as const, medium: "video" as const, time: "16:00", date: "Ontem", duration: "45:10" },
  { id: "cl5", name: "Prof. António Silva", type: "incoming" as const, medium: "voice" as const, time: "10:15", date: "10/02", duration: "3:05" },
];

const callIcons = { incoming: PhoneIncoming, outgoing: PhoneOutgoing, missed: PhoneMissed };
const callColors = { incoming: "text-accent", outgoing: "text-primary", missed: "text-destructive" };

// Map conversation names to emails for the email button
const nameToEmail: Record<string, string> = {
  "Prof. António Silva": "prof.silva@upra.kor",
  "Maria Silva": "3012@upra.kor",
  "Prof. Pedro Ferreira": "prof.ferreira@upra.kor",
};

type Tab = "chats" | "calls" | "groups";

export default function StudentChat() {
  const [selectedId, setSelectedId] = useState(chatConversations[0]?.id || "");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<Tab>("chats");
  const navigate = useNavigate();
  const selected = chatConversations.find(c => c.id === selectedId);
  const messages = chatMessages.filter(m => m.conversationId === selectedId);

  const directChats = chatConversations.filter(c => !c.isGroup);
  const groupChats = chatConversations.filter(c => c.isGroup);
  const displayList = tab === "groups" ? groupChats : tab === "chats" ? directChats : [];

  const goToEmail = () => {
    if (selected) {
      const email = nameToEmail[selected.name] || "";
      navigate(`/student/email?to=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="h-screen flex animate-fade-in">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col shrink-0 bg-card">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-foreground mb-3">Chat</h2>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar..." className="pl-9 h-9" />
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["chats", "calls", "groups"] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn("flex-1 text-xs font-medium py-1.5 rounded-md transition-colors", tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                {t === "chats" ? "Conversas" : t === "calls" ? "Chamadas" : "Grupos"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {tab === "calls" ? (
            callLog.map(call => {
              const CallIcon = callIcons[call.type];
              return (
                <div key={call.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {call.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{call.name}</p>
                    <div className="flex items-center gap-1.5 text-xs">
                      <CallIcon className={cn("w-3 h-3", callColors[call.type])} />
                      <span className={cn(call.type === "missed" ? "text-destructive" : "text-muted-foreground")}>
                        {call.date}, {call.time}
                      </span>
                      {call.duration && <span className="text-muted-foreground">• {call.duration}</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    {call.medium === "video" ? <VideoIcon className="w-4 h-4 text-muted-foreground" /> : <Phone className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                </div>
              );
            })
          ) : (
            displayList.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left",
                  selectedId === conv.id && "bg-muted"
                )}
              >
                <div className="relative shrink-0">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold", conv.isGroup ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary")}>
                    {conv.isGroup ? <Users className="w-5 h-5" /> : conv.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  {conv.online && !conv.isGroup && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent border-2 border-card" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-foreground truncate">{conv.name}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{conv.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="flex items-center justify-between px-5 py-3 border-b bg-card">
              <div className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold", selected.isGroup ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary")}>
                  {selected.isGroup ? <Users className="w-5 h-5" /> : selected.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selected.name}</p>
                  <p className="text-[11px] text-muted-foreground">{selected.isGroup ? "Grupo" : selected.online ? "🟢 Online" : "Offline"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={goToEmail}><Mail className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon"><Phone className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon"><Video className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-muted/30">
              {messages.map(msg => (
                <div key={msg.id} className={cn("flex", msg.isOwn && "justify-end")}>
                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5",
                    msg.isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card text-foreground rounded-bl-md shadow-sm"
                  )}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={cn("text-[10px] mt-1", msg.isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {msg.time} {msg.isOwn && (msg.read ? "✓✓" : "✓")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t bg-card flex items-center gap-2">
              <Button variant="ghost" size="icon"><Smile className="w-5 h-5 text-muted-foreground" /></Button>
              <Button variant="ghost" size="icon"><Paperclip className="w-5 h-5 text-muted-foreground" /></Button>
              <Input
                placeholder="Escrever mensagem..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="flex-1"
                onKeyDown={e => { if (e.key === "Enter" && message.trim()) setMessage(""); }}
              />
              <Button variant="ghost" size="icon"><Mic className="w-5 h-5 text-muted-foreground" /></Button>
              <Button size="icon" disabled={!message.trim()}><Send className="w-4 h-4" /></Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Seleccione uma conversa para começar.
          </div>
        )}
      </div>
    </div>
  );
}

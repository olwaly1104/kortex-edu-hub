import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { calendarEvents, disciplines } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Video, Clock, Calendar, MapPin, User, Users, Monitor, Wifi, MessageSquare, Hand, Mic, MicOff, Camera, CameraOff, ScreenShare, Settings, Volume2 } from "lucide-react";
import { useState } from "react";

export default function ClassLobby() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get("eventId");
  const event = calendarEvents.find(e => e.id === eventId);
  const disc = event ? disciplines.find(d => d.name === event.discipline) : null;

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  if (!event) {
    return (
      <div className="p-8 text-muted-foreground">
        <Link to="/student/calendar" className="text-primary hover:underline">← Voltar ao Calendário</Link>
        <p className="mt-4">Aula não encontrada.</p>
      </div>
    );
  }

  const waitingParticipants = [
    { name: "João Fernandes", initials: "JF", online: true },
    { name: "Maria Silva", initials: "MS", online: true },
    { name: "Pedro Nascimento", initials: "PN", online: true },
    { name: "Ana Gomes", initials: "AG", online: false },
    { name: "Carlos Santos", initials: "CS", online: true },
    { name: "Rita Oliveira", initials: "RO", online: false },
    { name: "Bruno Costa", initials: "BC", online: true },
    { name: "Sofia Martins", initials: "SM", online: true },
    { name: "Tiago Almeida", initials: "TA", online: true },
    { name: "Inês Pereira", initials: "IP", online: false },
    { name: "Diogo Ferreira", initials: "DF", online: true },
    { name: "Beatriz Lopes", initials: "BL", online: true },
    { name: "Miguel Rodrigues", initials: "MR", online: false },
    { name: "Catarina Sousa", initials: "CT", online: true },
    { name: "André Mendes", initials: "AM", online: true },
    { name: "Mariana Ribeiro", initials: "MR", online: true },
    { name: "Rui Carvalho", initials: "RC", online: false },
    { name: "Leonor Pinto", initials: "LP", online: true },
    { name: "Hugo Araújo", initials: "HA", online: true },
    { name: "Clara Monteiro", initials: "CM", online: false },
    { name: "Filipe Teixeira", initials: "FT", online: true },
    { name: "Marta Correia", initials: "MC", online: true },
    { name: "Gonçalo Dias", initials: "GD", online: true },
    { name: "Luísa Neves", initials: "LN", online: false },
    { name: "Tomás Moreira", initials: "TM", online: true },
    { name: "Sara Baptista", initials: "SB", online: true },
    { name: "Daniel Vieira", initials: "DV", online: false },
    { name: "Eva Cunha", initials: "EC", online: true },
    { name: "Francisco Lima", initials: "FL", online: true },
    { name: "Joana Cardoso", initials: "JC", online: true },
    { name: "Vasco Henriques", initials: "VH", online: true },
  ];

  const onlineCount = waitingParticipants.filter(p => p.online).length;

  return (
    <div className="p-6 lg:p-8 animate-fade-in max-w-6xl mx-auto">
      <Link to="/student/calendar" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5">
        <ArrowLeft className="w-4 h-4" /> Voltar ao Calendário
      </Link>

      {/* Header with title + details inline */}
      <Card className="p-5 mb-6 border">
        <div className="flex items-start gap-4 flex-wrap lg:flex-nowrap">
          {/* Left: icon + title */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary">
              <Video className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[11px] font-medium text-accent">Em Directo</span>
              </div>
              <h1 className="text-xl font-bold text-foreground truncate">{event.title}</h1>
              <Badge variant="outline" className="text-[10px] mt-1 w-fit" style={{ color: disc?.color, borderColor: (disc?.color || '') + "60" }}>Aula 5/12</Badge>
            </div>
          </div>

          {/* Right: quick details */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary/60" />
              <p className="font-medium text-foreground">{event.professor}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary/60" />
              <p className="font-medium text-foreground">{event.date.split("-").reverse().join("/")}</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary/60" />
              <p className="font-medium text-foreground">{event.startTime} – {event.endTime}</p>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary/60" />
              <p className="font-medium text-foreground">{event.room}</p>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-primary/60" />
              <p className="font-medium text-foreground">Online</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Video preview + controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Camera preview */}
          <Card className="aspect-video bg-muted/10 flex items-center justify-center relative overflow-hidden border">
            <div className="text-center">
              {camOn ? (
                <>
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <User className="w-12 h-12 text-primary/60" />
                  </div>
                  <p className="text-sm text-muted-foreground">Pré-visualização da câmara</p>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 rounded-full bg-muted/40 flex items-center justify-center mx-auto mb-3">
                    <CameraOff className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">Câmara desligada</p>
                </>
              )}
            </div>
            {/* Status indicator */}
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 border">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[11px] font-medium text-foreground">A aguardar início</span>
              </div>
            </div>
            {/* Participant count overlay */}
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 border">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] font-medium text-foreground">{onlineCount} online</span>
              </div>
            </div>
          </Card>

          {/* Controls bar */}
          <Card className="p-3 border">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {/* Primary: Chat, Hand, Screen share */}
              <Button variant="outline" size="icon" className="w-10 h-10 rounded-full" title="Chat da Aula">
                <MessageSquare className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="w-10 h-10 rounded-full" title="Levantar a Mão">
                <Hand className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="w-10 h-10 rounded-full" title="Partilhar Ecrã">
                <ScreenShare className="w-4 h-4" />
              </Button>

              <div className="w-px h-7 bg-border mx-1" />

              {/* Media controls */}
              <Button
                variant={micOn ? "outline" : "destructive"}
                size="icon"
                className="w-11 h-11 rounded-full"
                onClick={() => setMicOn(!micOn)}
                title={micOn ? "Desligar microfone" : "Ligar microfone"}
              >
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              <Button
                variant={camOn ? "outline" : "destructive"}
                size="icon"
                className="w-11 h-11 rounded-full"
                onClick={() => setCamOn(!camOn)}
                title={camOn ? "Desligar câmara" : "Ligar câmara"}
              >
                {camOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
              </Button>
              <Button variant="outline" size="icon" className="w-10 h-10 rounded-full" title="Áudio">
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="w-10 h-10 rounded-full" title="Definições">
                <Settings className="w-4 h-4" />
              </Button>

              <div className="w-px h-7 bg-border mx-1" />

              {/* Join button */}
              <Button size="lg" className="gap-2 px-8 rounded-full">
                <Video className="w-5 h-5" /> Entrar na Aula
              </Button>
            </div>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Participants */}
          <Card className="p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Participantes</h3>
              <Badge variant="outline" className="text-[10px]">
                <Users className="w-3 h-3 mr-1" /> {onlineCount}/{waitingParticipants.length}
              </Badge>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-0.5 pr-1">
              {waitingParticipants.map((p, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                      {p.initials}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${p.online ? "bg-accent" : "bg-muted-foreground/30"}`} />
                  </div>
                  <p className="text-xs font-medium text-foreground truncate flex-1 min-w-0">{p.name}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

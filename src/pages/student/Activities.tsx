import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Users, Calendar, MapPin, Clock, Music, Palette, Code,
  Dumbbell, BookOpen, Heart, ChevronRight, Trophy, Gamepad2, Camera,
  Eye, UserPlus, UserMinus, Star, Target, CalendarDays, Info, Search, CheckCircle,
  Mic, Globe, Lightbulb, Landmark, Rocket, FlaskConical, Wifi, Building, Ticket,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Club {
  id: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  icon: React.ElementType;
  members: number;
  maxMembers: number;
  schedule: string;
  location: string;
  leader: string;
  joined: boolean;
  highlights: string[];
  nextSession: string;
}

interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  spotsLeft: number;
  registered: boolean;
  organizer: string;
  past?: boolean;
  price?: number;
  mode: 'presencial' | 'online';
}

const initialClubs: Club[] = [
  {
    id: "1", name: "Clube de Futebol", shortDesc: "Treinos semanais e torneios inter-universitários.",
    fullDesc: "O Clube de Futebol da UPAngola reúne estudantes apaixonados pelo desporto. Participamos em treinos regulares, torneios inter-universitários e amistosos. Todos os níveis são bem-vindos — o importante é a vontade de jogar e fazer parte da equipa!",
    icon: Dumbbell, members: 34, maxMembers: 40, schedule: "Ter & Qui · 17:00–19:00", location: "Campo Desportivo",
    leader: "Carlos Mendes", joined: true, highlights: ["Campeões inter-universitários 2025", "Treinos com treinador profissional"],
    nextSession: "Terça, 25 Fev · 17:00",
  },
  {
    id: "2", name: "Grupo de Teatro", shortDesc: "Encenação de peças teatrais ao longo do semestre.",
    fullDesc: "Exploramos a arte dramática através da escrita, encenação e produção de peças originais e adaptações. Ao longo do semestre, preparamos uma apresentação final aberta à comunidade universitária.",
    icon: Music, members: 18, maxMembers: 25, schedule: "Qua · 16:00–18:30", location: "Sala de Artes",
    leader: "Ana Beatriz", joined: false, highlights: ["Peça anual no auditório principal", "Workshops de expressão corporal"],
    nextSession: "Quarta, 26 Fev · 16:00",
  },
  {
    id: "3", name: "Clube de Programação", shortDesc: "Hackathons, desafios de código e projectos colaborativos.",
    fullDesc: "Espaço para estudantes que querem ir além da sala de aula. Organizamos hackathons internos, participamos em competições nacionais e desenvolvemos projectos open-source. Linguagens e frameworks variados — traz o teu portátil e a tua curiosidade!",
    icon: Code, members: 27, maxMembers: 35, schedule: "Sex · 15:00–17:00", location: "Lab. Informática 3",
    leader: "Miguel Santos", joined: true, highlights: ["1º lugar Hackathon Luanda 2025", "Projectos open-source activos"],
    nextSession: "Sexta, 28 Fev · 15:00",
  },
  {
    id: "4", name: "Clube de Leitura", shortDesc: "Debates sobre obras literárias angolanas e internacionais.",
    fullDesc: "Cada mês escolhemos um livro para ler e debater em grupo. Alternamos entre autores angolanos, lusófonos e internacionais. É um espaço descontraído para quem gosta de ler e trocar ideias.",
    icon: BookOpen, members: 15, maxMembers: 20, schedule: "Seg · 16:30–18:00", location: "Biblioteca — Sala 2",
    leader: "Joana Fernandes", joined: false, highlights: ["Leitura mensal com debate", "Visitas de autores convidados"],
    nextSession: "Segunda, 24 Fev · 16:30",
  },
  {
    id: "5", name: "Artes Visuais", shortDesc: "Pintura, escultura e exposições artísticas.",
    fullDesc: "Dedicado a todas as formas de expressão visual — pintura, desenho, escultura, fotografia e arte digital. Organizamos exposições semestrais e workshops com artistas locais.",
    icon: Palette, members: 12, maxMembers: 20, schedule: "Sáb · 10:00–12:00", location: "Atelier do Campus",
    leader: "Teresa Gomes", joined: false, highlights: ["Exposição semestral", "Materiais fornecidos pelo clube"],
    nextSession: "Sábado, 1 Mar · 10:00",
  },
  {
    id: "6", name: "Voluntariado Social", shortDesc: "Acções comunitárias e projectos de impacto social.",
    fullDesc: "Realizamos acções de voluntariado em comunidades de Luanda — desde apoio escolar a campanhas de sensibilização. É uma forma de dar de volta à comunidade enquanto desenvolves competências de liderança.",
    icon: Heart, members: 42, maxMembers: 60, schedule: "Sáb · 09:00–13:00", location: "Vários locais",
    leader: "Pedro Almeida", joined: false, highlights: ["Parceria com 5 ONGs locais", "+200 horas de voluntariado em 2025"],
    nextSession: "Sábado, 1 Mar · 09:00",
  },
  {
    id: "7", name: "Basquetebol", shortDesc: "Treinos e jogos na liga universitária.",
    fullDesc: "Equipa competitiva de basquetebol que participa na liga universitária de Luanda. Treinos focados em técnica, táctica e condição física. Aberto a todos os níveis.",
    icon: Trophy, members: 22, maxMembers: 25, schedule: "Seg & Qua · 17:30–19:00", location: "Pavilhão Desportivo",
    leader: "Ricardo Costa", joined: true, highlights: ["Liga universitária activa", "Equipamento fornecido"],
    nextSession: "Segunda, 24 Fev · 17:30",
  },
  {
    id: "8", name: "Gaming & Esports", shortDesc: "Torneios de gaming e competições online.",
    fullDesc: "Comunidade de gamers da UPAngola. Organizamos torneios internos de FIFA, Valorant e League of Legends, e representamos a universidade em competições inter-universitárias de esports.",
    icon: Gamepad2, members: 30, maxMembers: 50, schedule: "Sex · 18:00–20:00", location: "Sala Multimédia",
    leader: "Tiago Neves", joined: false, highlights: ["Torneios mensais", "Equipa de esports competitiva"],
    nextSession: "Sexta, 28 Fev · 18:00",
  },
  {
    id: "9", name: "Fotografia", shortDesc: "Workshops e saídas fotográficas pelo campus.",
    fullDesc: "Aprende técnicas de fotografia, edição e composição. Fazemos saídas fotográficas regulares e organizamos uma exposição anual com os melhores trabalhos dos membros.",
    icon: Camera, members: 16, maxMembers: 20, schedule: "Sáb · 14:00–16:00", location: "Campus & Exterior",
    leader: "Márcia Silva", joined: false, highlights: ["Exposição anual de fotografia", "Workshops de edição"],
    nextSession: "Sábado, 1 Mar · 14:00",
  },
  {
    id: "10", name: "Clube de Música", shortDesc: "Ensaios, jam sessions e concertos no campus.",
    fullDesc: "Espaço para músicos de todos os géneros e níveis. Organizamos ensaios semanais, jam sessions abertas e um concerto semestral. Instrumentos disponíveis na sala de ensaios.",
    icon: Mic, members: 20, maxMembers: 30, schedule: "Qui · 16:00–18:00", location: "Sala de Música",
    leader: "Sofia Lopes", joined: false, highlights: ["Concerto semestral", "Instrumentos disponíveis"],
    nextSession: "Quinta, 27 Fev · 16:00",
  },
  {
    id: "11", name: "Clube de Línguas", shortDesc: "Prática de inglês, francês e mandarim entre estudantes.",
    fullDesc: "Sessões de conversação em diferentes idiomas, com falantes nativos e estudantes avançados. Ideal para quem quer melhorar competências linguísticas de forma descontraída.",
    icon: Globe, members: 25, maxMembers: 35, schedule: "Ter · 16:00–17:30", location: "Sala B12",
    leader: "Luísa Cardoso", joined: false, highlights: ["Conversação com nativos", "Certificados de participação"],
    nextSession: "Terça, 25 Fev · 16:00",
  },
  {
    id: "12", name: "Empreendedorismo", shortDesc: "Ideação, pitch e desenvolvimento de startups universitárias.",
    fullDesc: "Desenvolve a tua ideia de negócio com mentoria de empreendedores locais. Organizamos workshops de pitch, sessões de ideação e uma competição anual de startups.",
    icon: Rocket, members: 28, maxMembers: 40, schedule: "Qua · 17:00–19:00", location: "Sala de Inovação",
    leader: "André Domingos", joined: false, highlights: ["Competição anual de startups", "Mentoria com empresários"],
    nextSession: "Quarta, 26 Fev · 17:00",
  },
  {
    id: "13", name: "Clube de Ciências", shortDesc: "Experiências, debates científicos e feiras de ciência.",
    fullDesc: "Para curiosos e apaixonados pela ciência. Realizamos experiências práticas, debates sobre temas científicos actuais e organizamos a feira de ciência anual da universidade.",
    icon: FlaskConical, members: 14, maxMembers: 25, schedule: "Sex · 14:00–16:00", location: "Lab. Ciências",
    leader: "Marta Reis", joined: false, highlights: ["Feira de ciência anual", "Experiências práticas semanais"],
    nextSession: "Sexta, 28 Fev · 14:00",
  },
  {
    id: "14", name: "Clube de Inovação Social", shortDesc: "Soluções criativas para desafios sociais em Angola.",
    fullDesc: "Projectos colaborativos focados em resolver problemas reais das comunidades angolanas através de design thinking e inovação social. Parcerias com ONGs e instituições públicas.",
    icon: Lightbulb, members: 19, maxMembers: 30, schedule: "Sáb · 10:00–12:30", location: "Sala de Projectos",
    leader: "Helena Tavares", joined: false, highlights: ["Parcerias com ONGs", "Design thinking aplicado"],
    nextSession: "Sábado, 1 Mar · 10:00",
  },
  {
    id: "15", name: "Clube de História & Cultura", shortDesc: "Visitas a museus, tertúlias e debates sobre cultura angolana.",
    fullDesc: "Exploramos a riqueza cultural e histórica de Angola e do mundo. Organizamos visitas a museus, tertúlias com historiadores e debates sobre identidade cultural.",
    icon: Landmark, members: 11, maxMembers: 20, schedule: "Seg · 15:00–16:30", location: "Biblioteca — Auditório",
    leader: "Manuel Joaquim", joined: false, highlights: ["Visitas culturais mensais", "Tertúlias com historiadores"],
    nextSession: "Segunda, 24 Fev · 15:00",
  },
];

const initialEvents: SchoolEvent[] = [
  // Past events
  { id: "p1", title: "Workshop de Design Thinking", description: "Sessão prática de design thinking aplicado a problemas reais.", date: "8 Jan 2026", time: "14:00–17:00", location: "Sala de Inovação", spotsLeft: 0, registered: true, organizer: "Clube de Empreendedorismo", past: true, mode: 'presencial', price: 1500 },
  { id: "p2", title: "Palestra: Cibersegurança", description: "Introdução à segurança digital e protecção de dados.", date: "22 Jan 2026", time: "10:00–12:00", location: "Auditório A", spotsLeft: 0, registered: true, organizer: "Clube de Programação", past: true, mode: 'online' },
  { id: "p3", title: "Torneio de Xadrez", description: "Competição inter-turmas de xadrez rápido.", date: "5 Fev 2026", time: "15:00–18:00", location: "Biblioteca — Sala 1", spotsLeft: 0, registered: true, organizer: "Associação de Estudantes", past: true, mode: 'presencial' },
  // Upcoming events
  { id: "1", title: "Hackathon UPAngola 2026", description: "48h de desenvolvimento de soluções tecnológicas para problemas reais de Angola.", date: "15 Mar 2026", time: "09:00–21:00", location: "Auditório A", spotsLeft: 12, registered: true, organizer: "Clube de Programação", price: 2500, mode: 'online' },
  { id: "2", title: "Torneio de Futebol Inter-Turmas", description: "Competição entre turmas de todos os cursos da universidade.", date: "22 Mar 2026", time: "14:00–18:00", location: "Campo Desportivo", spotsLeft: 0, registered: false, organizer: "Clube de Futebol", mode: 'presencial' },
  { id: "3", title: "Exposição de Arte Estudantil", description: "Mostra de trabalhos artísticos dos estudantes.", date: "28 Mar 2026", time: "10:00–16:00", location: "Galeria do Campus", spotsLeft: 50, registered: false, organizer: "Artes Visuais", price: 800, mode: 'presencial' },
  { id: "4", title: "Palestra: IA em África", description: "O futuro da inteligência artificial no continente africano.", date: "5 Abr 2026", time: "15:00–17:00", location: "Auditório B", spotsLeft: 30, registered: false, organizer: "Departamento de Informática", price: 15000, mode: 'online' },
  { id: "5", title: "Semana Académica 2026", description: "Palestras, workshops e actividades culturais durante uma semana.", date: "14–18 Abr 2026", time: "Todo o dia", location: "Campus Principal", spotsLeft: 200, registered: false, organizer: "Associação de Estudantes", mode: 'online' },
  { id: "6", title: "Feira de Emprego & Estágios", description: "Conecta-te com empresas e encontra oportunidades de estágio.", date: "25 Abr 2026", time: "09:00–16:00", location: "Praça Central", spotsLeft: 150, registered: false, organizer: "Gabinete de Carreiras", price: 5000, mode: 'presencial' },
];

export default function Activities() {
  const [clubs, setClubs] = useState(initialClubs);
  const [events, setEvents] = useState(initialEvents);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);
  const [search, setSearch] = useState("");
  const [mySearch, setMySearch] = useState("");

  const toggleClub = (id: string) => {
    setClubs(prev => prev.map(c =>
      c.id === id ? { ...c, joined: !c.joined, members: c.joined ? c.members - 1 : c.members + 1 } : c
    ));
    if (selectedClub?.id === id) {
      setSelectedClub(prev => prev ? { ...prev, joined: !prev.joined, members: prev.joined ? prev.members - 1 : prev.members + 1 } : null);
    }
  };

  const toggleEvent = (id: string) => {
    setEvents(prev => prev.map(e =>
      e.id === id ? { ...e, registered: !e.registered, spotsLeft: e.registered ? e.spotsLeft + 1 : e.spotsLeft - 1 } : e
    ));
  };

  const joinedClubs = clubs.filter(c => c.joined).length;
  const registeredEvents = events.filter(e => e.registered).length;

  const renderClubCard = (club: Club) => {
    const Icon = club.icon;
    const isFull = club.members >= club.maxMembers && !club.joined;
    return (
      <Card key={club.id} className="group hover:shadow-md transition-all border-border/60 h-full">
        <CardContent className="p-0 h-full flex flex-col">
          <div className="h-1 rounded-t-lg bg-gradient-to-r from-primary/60 to-primary/20" />
          <div className="p-4 flex flex-col flex-1">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm text-foreground leading-tight">{club.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />{club.members}/{club.maxMembers}
                  </span>
                  {club.joined && (
                    <Badge className="text-[10px] bg-success/10 text-success border-0 px-1.5 py-0">Inscrito</Badge>
                  )}
                  {isFull && (
                    <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30 px-1.5 py-0">Cheio</Badge>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-3">{club.shortDesc}</p>
            <div className="space-y-1 mt-3 flex-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3 h-3 shrink-0 text-muted-foreground/70" />{club.schedule}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3 h-3 shrink-0 text-muted-foreground/70" />{club.location}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Star className="w-3 h-3 shrink-0 text-muted-foreground/70" />{club.leader}
              </p>
            </div>
            <div className="flex gap-2 pt-3 mt-auto">
              <Button size="sm" variant="outline" onClick={() => setSelectedClub(club)} className="flex-1 text-xs h-8">
                <Eye className="w-3.5 h-3.5 mr-1.5" />Ver Detalhes
              </Button>
              <Button
                size="sm"
                variant={club.joined ? "destructive" : "default"}
                onClick={() => toggleClub(club.id)}
                disabled={isFull}
                className="flex-1 text-xs h-8"
              >
                {club.joined ? <><UserMinus className="w-3.5 h-3.5 mr-1.5" />Sair</> : <><UserPlus className="w-3.5 h-3.5 mr-1.5" />Inscrever</>}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  const renderEventCard = (event: SchoolEvent) => (
    <Card key={event.id} className={`hover:shadow-md transition-shadow border-border/60 ${event.past ? "opacity-70" : ""}`}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="hidden sm:flex w-14 h-14 rounded-xl bg-primary/10 flex-col items-center justify-center shrink-0">
            <span className="text-[10px] font-medium text-primary uppercase">
              {event.date.split(" ")[1]?.slice(0, 3)}
            </span>
            <span className="text-lg font-bold text-primary leading-none">
              {event.date.split(" ")[0]?.replace("–", "")}
            </span>
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm text-foreground">{event.title}</h3>
              {event.registered && !event.past && (
                <Badge className="text-[10px] px-2 py-0.5 bg-primary text-primary-foreground border-0 rounded-full font-semibold">Inscrito</Badge>
              )}
              {event.past && (
                <Badge className="text-[10px] bg-muted text-muted-foreground border-0">Concluído</Badge>
              )}
              {/* Mode badge — always next to title */}
              {event.mode === 'online'
                ? <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full border-primary/40 text-primary gap-1 flex items-center">
                    <Wifi className="w-2.5 h-2.5" /> Online
                  </Badge>
                : <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full border-muted-foreground/30 text-muted-foreground gap-1 flex items-center">
                    <Building className="w-2.5 h-2.5" /> Presencial
                  </Badge>
              }
            </div>
            <p className="text-xs text-muted-foreground">{event.description}</p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{event.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>
              <span className="flex items-center gap-1"><Info className="w-3 h-3" />{event.organizer}</span>
            </div>
            {/* Price pill — non-past only */}
            {!event.past && (
              event.price ? (
                <div className="flex items-center gap-1.5 w-fit rounded-md px-2.5 py-1 bg-secondary/10">
                  <Ticket className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span className="text-sm font-bold text-secondary">
                    {new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2 }).format(event.price)} Kz
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 w-fit rounded-md px-2.5 py-1 bg-accent/10">
                  <Ticket className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-sm font-semibold text-accent">Gratuito</span>
                </div>
              )
            )}
          </div>

          {!event.past && (
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-medium ${event.spotsLeft === 0 && !event.registered ? "text-destructive" : "text-muted-foreground"}`}>
                {event.spotsLeft === 0 && !event.registered ? "Esgotado" : `${event.spotsLeft} vagas`}
              </span>
              <Button size="sm" variant="outline" onClick={() => setSelectedEvent(event)} className="text-xs h-8">
                <Eye className="w-3.5 h-3.5 mr-1.5" />Ver Detalhes
              </Button>
              <Button
                size="sm"
                variant={event.registered ? "destructive" : "default"}
                onClick={() => toggleEvent(event.id)}
                disabled={event.spotsLeft === 0 && !event.registered}
                className="text-xs h-8"
              >
                {event.registered ? <><UserMinus className="w-3.5 h-3.5 mr-1.5" />Cancelar</> : <><UserPlus className="w-3.5 h-3.5 mr-1.5" />Inscrever</>}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Extra Curriculares</h1>
          <p className="text-sm text-muted-foreground mt-1">Clubes e eventos da universidade.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span><strong className="text-foreground">{joinedClubs}</strong> clubes</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4 text-secondary" />
            <span><strong className="text-foreground">{registeredEvents}</strong> eventos</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="clubes" className="space-y-5">
        <TabsList>
          <TabsTrigger value="clubes">Clubes</TabsTrigger>
          <TabsTrigger value="eventos">Eventos</TabsTrigger>
        </TabsList>

        {/* ── CLUBES ── */}
        <TabsContent value="clubes" className="space-y-6">
          {/* Meus Clubes */}
          {clubs.filter(c => c.joined).length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Star className="w-4 h-4 text-secondary" />Meus Clubes
                </h2>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar meus clubes..."
                    value={mySearch}
                    onChange={e => setMySearch(e.target.value)}
                    className="pl-9 h-8 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const filtered = clubs.filter(c => c.joined && c.name.toLowerCase().includes(mySearch.toLowerCase()));
                  return filtered.length > 0
                    ? filtered.map(club => renderClubCard(club))
                    : <p className="col-span-full text-sm text-muted-foreground text-center py-8">Nenhum clube encontrado.</p>;
                })()}
              </div>
            </div>
          )}

          {/* Explorar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />Explorar Clubes
              </h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar clubes..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-8 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                const filtered = clubs.filter(c => !c.joined && c.name.toLowerCase().includes(search.toLowerCase()));
                return filtered.length > 0
                  ? filtered.map(club => renderClubCard(club))
                  : <p className="col-span-full text-sm text-muted-foreground text-center py-8">Nenhum clube encontrado.</p>;
              })()}
            </div>
          </div>
        </TabsContent>

        {/* ── EVENTOS ── */}
        <TabsContent value="eventos" className="space-y-6">
          {/* Meus Eventos (registered, upcoming) */}
          {events.filter(e => e.registered && !e.past).length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Star className="w-4 h-4 text-secondary" />Meus Eventos
              </h2>
              <div className="space-y-3">
                {events.filter(e => e.registered && !e.past).map(event => renderEventCard(event))}
              </div>
            </div>
          )}

          {/* Próximos Eventos (not registered, upcoming) */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />Próximos Eventos
            </h2>
            <div className="space-y-3">
              {events.filter(e => !e.registered && !e.past).length > 0
                ? events.filter(e => !e.registered && !e.past).map(event => renderEventCard(event))
                : <p className="text-sm text-muted-foreground text-center py-8">Estás inscrito em todos os eventos!</p>
              }
            </div>
          </div>

          {/* Eventos Passados */}
          {events.filter(e => e.past).length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />Eventos Passados
              </h2>
              <div className="space-y-3">
                {events.filter(e => e.past).map(event => renderEventCard(event))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── CLUB DETAIL DIALOG ── */}
      <Dialog open={!!selectedClub} onOpenChange={() => setSelectedClub(null)}>
        {selectedClub && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <selectedClub.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg">{selectedClub.name}</DialogTitle>
                  <DialogDescription className="text-xs">
                    Coordenado por {selectedClub.leader}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* About */}
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedClub.fullDesc}</p>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3 space-y-0.5">
                  <p className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider">Membros</p>
                  <p className="text-sm font-semibold text-foreground">{selectedClub.members} / {selectedClub.maxMembers}</p>
                </div>
                <div className="rounded-lg border border-border p-3 space-y-0.5">
                  <p className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider">Próxima Sessão</p>
                  <p className="text-sm font-semibold text-foreground">{selectedClub.nextSession.split("·")[0]?.trim()}</p>
                </div>
                <div className="rounded-lg border border-border p-3 space-y-0.5">
                  <p className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider">Horário</p>
                  <p className="text-sm font-semibold text-foreground">{selectedClub.schedule}</p>
                </div>
                <div className="rounded-lg border border-border p-3 space-y-0.5">
                  <p className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider">Local</p>
                  <p className="text-sm font-semibold text-foreground">{selectedClub.location}</p>
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-secondary" />Destaques
                </p>
                <ul className="space-y-1.5">
                  {selectedClub.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Target className="w-3 h-3 mt-0.5 text-accent shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <Button
                className="w-full"
                variant={selectedClub.joined ? "destructive" : "default"}
                onClick={() => toggleClub(selectedClub.id)}
                disabled={selectedClub.members >= selectedClub.maxMembers && !selectedClub.joined}
              >
                {selectedClub.joined ? (
                  <><UserMinus className="w-4 h-4 mr-2" />Sair do Clube</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" />Inscrever-me no Clube</>
                )}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ── EVENT DETAIL DIALOG ── */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg">{selectedEvent.title}</DialogTitle>
                  <DialogDescription className="text-xs">
                    Organizado por {selectedEvent.organizer}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedEvent.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3 space-y-0.5">
                  <p className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider">Data</p>
                  <p className="text-sm font-semibold text-foreground">{selectedEvent.date}</p>
                </div>
                <div className="rounded-lg border border-border p-3 space-y-0.5">
                  <p className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider">Horário</p>
                  <p className="text-sm font-semibold text-foreground">{selectedEvent.time}</p>
                </div>
                <div className="rounded-lg border border-border p-3 space-y-0.5">
                  <p className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider">Local</p>
                  <p className="text-sm font-semibold text-foreground">{selectedEvent.location}</p>
                </div>
                <div className="rounded-lg border border-border p-3 space-y-0.5">
                  <p className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider">Vagas</p>
                  <p className={`text-sm font-semibold ${selectedEvent.spotsLeft === 0 && !selectedEvent.registered ? "text-destructive" : "text-foreground"}`}>
                    {selectedEvent.spotsLeft === 0 && !selectedEvent.registered ? "Esgotado" : `${selectedEvent.spotsLeft} disponíveis`}
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                variant={selectedEvent.registered ? "destructive" : "default"}
                onClick={() => {
                  toggleEvent(selectedEvent.id);
                  setSelectedEvent(prev => prev ? { ...prev, registered: !prev.registered, spotsLeft: prev.registered ? prev.spotsLeft + 1 : prev.spotsLeft - 1 } : null);
                }}
                disabled={selectedEvent.spotsLeft === 0 && !selectedEvent.registered}
              >
                {selectedEvent.registered ? (
                  <><UserMinus className="w-4 h-4 mr-2" />Cancelar Inscrição</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" />Inscrever-me no Evento</>
                )}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

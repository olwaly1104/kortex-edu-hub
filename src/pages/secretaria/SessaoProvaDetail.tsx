import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sessoesProva, candidaturas, estadoColors, estadoLabels } from "@/data/admissoesData";
import {
  ArrowLeft, CalendarDays, Clock, MapPin, Users, Phone, Mail,
  GraduationCap, CheckCircle, Eye,
} from "lucide-react";

export default function SessaoProvaDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const session = sessoesProva.find(s => s.id === sessionId);

  if (!session) return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
      <p className="text-muted-foreground text-center py-12">Sessão não encontrada.</p>
    </div>
  );

  const sessionCandidates = candidaturas.filter(c => session.candidatosIds.includes(c.id));
  const now = new Date();
  const isPast = new Date(session.data) < now;
  const occupancy = Math.round((session.candidatosIds.length / session.capacidadeMax) * 100);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      {/* Session Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-foreground">{session.nome}</h1>
              <Badge variant={isPast ? "outline" : "default"} className="text-xs">
                {isPast ? "Realizada" : "Agendada"}
              </Badge>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> {new Date(session.data).toLocaleDateString("pt-AO")}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {session.hora}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {session.sala}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Período</p>
            <p className="text-sm font-medium text-foreground">{session.periodo}</p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{session.candidatosIds.length}</p>
              <p className="text-xs text-muted-foreground">Convocados</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{session.capacidadeMax}</p>
              <p className="text-xs text-muted-foreground">Capacidade Máx.</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${occupancy >= 90 ? "bg-red-100" : "bg-green-100"}`}>
              <CheckCircle className={`w-4 h-4 ${occupancy >= 90 ? "text-red-600" : "text-green-600"}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{occupancy}%</p>
              <p className="text-xs text-muted-foreground">Ocupação</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Candidates Table */}
      <Card>
        <div className="p-4 border-b">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Candidatos Convocados
            <Badge variant="outline" className="text-[10px]">{sessionCandidates.length}</Badge>
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidato</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>1ª Opção</TableHead>
              <TableHead>Estado</TableHead>
              {isPast && <TableHead>Nota</TableHead>}
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessionCandidates.map(c => (
              <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/secretaria/admissoes/candidaturas/${c.id}`)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {c.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.nome}</p>
                      <p className="text-xs text-muted-foreground">{c.bi}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.telefone}</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>
                </TableCell>
                <TableCell className="text-sm">{c.cursoOpcao1}</TableCell>
                <TableCell>
                  <Badge className={`text-[10px] ${estadoColors[c.estado]}`}>{estadoLabels[c.estado]}</Badge>
                </TableCell>
                {isPast && (
                  <TableCell className="text-sm font-medium">
                    {c.nota !== undefined ? `${c.nota}/20` : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                )}
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {sessionCandidates.length === 0 && (
              <TableRow><TableCell colSpan={isPast ? 7 : 6} className="text-center text-muted-foreground py-8">Nenhum candidato convocado para esta sessão.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

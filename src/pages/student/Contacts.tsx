import { contacts, currentStudent } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, User, Building, Clock, BookOpen, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function StudentContacts() {
  const navigate = useNavigate();
  const apoio = contacts.filter(c => c.category === "apoio");
  const professors = contacts.filter(c => c.category === "professor");
  const colleagues = contacts.filter(c => c.category === "colega");

  const goToChat = (contact: typeof contacts[0]) => {
    navigate("/student/chat");
  };

  const goToEmail = (contact: typeof contacts[0]) => {
    navigate(`/student/email?to=${encodeURIComponent(contact.email)}`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Contactos</h1>
      </div>

      {/* Student's own contact card */}
      <Card className="p-5 border-l-4 border-l-primary">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">{currentStudent.name}</p>
            <p className="text-xs text-muted-foreground">{currentStudent.email}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="outline" className="text-[10px]">{currentStudent.course}</Badge>
              <Badge variant="outline" className="text-[10px]">{currentStudent.year}º Ano</Badge>
              <Badge variant="outline" className="text-[10px]">Turma 24B</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => navigate("/student/email")}><Mail className="w-3.5 h-3.5" />Email</Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => navigate("/student/chat")}><MessageSquare className="w-3.5 h-3.5" />Chat</Button>
        </div>
      </Card>

      {/* Support contacts */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Apoio ao Estudante</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apoio.map(c => (
            <Card key={c.id} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground truncate">{c.email}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => goToEmail(c)}><Mail className="w-3.5 h-3.5" /></Button>
                <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => goToChat(c)}><MessageSquare className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Professors */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Os Meus Professores</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {professors.map(c => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                  <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
                    {c.discipline && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{c.discipline}</span>}
                    {c.classDays && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.classDays}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => goToEmail(c)}><Mail className="w-3.5 h-3.5" />Email</Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => goToChat(c)}><MessageSquare className="w-3.5 h-3.5" />Chat</Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Colleagues */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Colegas de Turma · <span className="text-muted-foreground font-normal text-sm">Engenharia Informática — 2º Ano — Turma 24B</span></h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colleagues.map(c => (
            <Card key={c.id} className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
                {c.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground truncate">{c.email}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => goToEmail(c)}><Mail className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => goToChat(c)}><MessageSquare className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
import { contacts } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, User, Building, Clock, BookOpen, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfessorContacts() {
  const navigate = useNavigate();
  const apoio = contacts.filter(c => c.category === "apoio");
  // Other professors (excluding self — Prof. António Silva)
  const otherProfessors = contacts.filter(c => c.category === "professor" && c.name !== "Prof. António Silva");

  const goToChat = () => navigate("/professor/chat");
  const goToEmail = (email: string) => navigate(`/professor/email?to=${encodeURIComponent(email)}`);

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Contactos</h1>
      </div>

      {/* Support */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Apoio ao Docente</h2>
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
                <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => goToEmail(c.email)}><Mail className="w-3.5 h-3.5" /></Button>
                <Button variant="outline" size="icon" className="w-8 h-8" onClick={goToChat}><MessageSquare className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Fellow professors */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Colegas Docentes</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {otherProfessors.map(c => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6 text-accent" />
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
                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => goToEmail(c.email)}><Mail className="w-3.5 h-3.5" />Email</Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={goToChat}><MessageSquare className="w-3.5 h-3.5" />Chat</Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Administration contacts */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Direcção e Coordenação</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Direcção Académica", email: "direcao@upra.kor", role: "Direcção" },
            { name: "Coordenação de Eng. Informática", email: "coord.informatica@upra.kor", role: "Coordenação" },
            { name: "Coordenador de Curso", email: "coordenador.curso@upra.kor", role: "Coordenador" },
            { name: "Departamento de Matemática", email: "dept.matematica@upra.kor", role: "Departamento" },
            { name: "Recursos Humanos", email: "rh@upra.kor", role: "RH" },
            { name: "Gabinete de Qualidade", email: "qualidade@upra.kor", role: "Qualidade" },
          ].map((c, i) => (
            <Card key={i} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground truncate">{c.email}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => goToEmail(c.email)}><Mail className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

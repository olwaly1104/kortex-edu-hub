import { allTurmas } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { GraduationCap, ChevronRight, Users } from "lucide-react";

export default function ProfessorDisciplines() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <GraduationCap className="w-6 h-6 text-primary" /> As Minhas Turmas
      </h1>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Turma</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead className="text-center">Ano</TableHead>
              <TableHead className="text-center">Estudantes</TableHead>
              <TableHead className="text-right">Acção</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allTurmas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-sm text-muted-foreground">
                  Ainda não tem turmas atribuídas.
                </TableCell>
              </TableRow>
            ) : (
              allTurmas.map((turma) => (
                <TableRow key={turma.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{turma.name}</TableCell>
                  <TableCell className="text-muted-foreground">{turma.course}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[10px]">{turma.year}º</Badge>
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    <span className="inline-flex items-center gap-1 text-sm"><Users className="w-3.5 h-3.5 text-muted-foreground" />{turma.students}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/professor/turma/${turma.id}`} className="inline-flex items-center text-xs text-primary hover:underline">
                      Abrir <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

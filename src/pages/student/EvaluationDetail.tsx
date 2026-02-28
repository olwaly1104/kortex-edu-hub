import { useParams, Link, useSearchParams } from "react-router-dom";
import { grades, disciplines, lessons } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap, Calendar, Clock, MapPin, BookOpen, FileText, Monitor, Upload, Download, Eye, CheckCircle2 } from "lucide-react";

export default function EvaluationDetail() {
  const { disciplineId } = useParams();
  const [searchParams] = useSearchParams();
  const evalIndex = Number(searchParams.get("index") || 0);

  const disc = disciplines.find(d => d.id === disciplineId);
  const gradeData = grades.find(g => g.disciplineId === disciplineId);
  const evaluation = gradeData?.evaluations[evalIndex];

  const discLessons = lessons.filter(l => l.disciplineId === disciplineId);
  const allMaterials = discLessons.flatMap(l => l.materials);

  if (!disc || !evaluation) return (
    <div className="p-8 text-muted-foreground">
      <Link to="/student/grades" className="text-primary hover:underline">← Voltar</Link>
      <p className="mt-4">Avaliação não encontrada.</p>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <Link to={`/student/disciplines/${disciplineId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a {disc.name}
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: disc.color + "20", color: disc.color }}>
          <GraduationCap className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <Badge className="text-xs mb-1" style={{ background: disc.color + "20", color: disc.color, border: "none" }}>{disc.name}</Badge>
          <h1 className="text-2xl font-bold text-foreground">{evaluation.name}</h1>
          <p className="text-muted-foreground mt-1">{evaluation.description}</p>
        </div>
      </div>


      {/* Info row: 4 boxes - Data, Modalidade, Nota (with peso inside) , Duração */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Calendar className="w-3.5 h-3.5" />Data</div>
          <p className="text-sm font-medium text-foreground">{evaluation.date}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            {evaluation.modality === "online" ? <Monitor className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
            Modalidade
          </div>
          <p className="text-sm font-medium text-foreground">{evaluation.modality === "online" ? "Online (na app)" : "Presencial"}</p>
          {evaluation.room && <p className="text-xs text-muted-foreground mt-0.5">{evaluation.room}</p>}
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Nota</p>
          {evaluation.published && evaluation.grade !== null ? (
            <div>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-semibold ${evaluation.grade >= 10 ? "text-accent" : "text-destructive"}`}>{evaluation.grade}</span>
                <span className="text-xs text-muted-foreground">/ {evaluation.maxGrade}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Peso: {evaluation.weight}%</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">Não publicada</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Peso: {evaluation.weight}%</p>
            </div>
          )}
        </Card>
        {evaluation.duration && (
          <Card className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Clock className="w-3.5 h-3.5" />Duração</div>
            <p className="text-sm font-medium text-foreground">{evaluation.duration}</p>
          </Card>
        )}
      </div>

      {/* Description + Conteúdo Relevante + Entrega (all connected) */}
      <Card className="p-5 space-y-5">
        <div>
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Descrição</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{evaluation.description}</p>
        </div>

        {allMaterials.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Conteúdo Relevante
            </h3>
            <div className="space-y-2">
              {allMaterials.slice(0, 4).map((mat, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <FileText className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{mat.name}</p>
                    <p className="text-xs text-muted-foreground">{mat.type.toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Eye className="w-4 h-4" /></button>
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Download className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Entrega integrated - for online evaluations */}
        {evaluation.modality === "online" && (
          <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><Upload className="w-4 h-4 text-primary" />
              {evaluation.name.toLowerCase().includes("exame") || evaluation.name.toLowerCase().includes("teste")
                ? "Upload Exame" : "Upload Tarefa"}
            </h3>
            {evaluation.published && evaluation.grade !== null && (
              <div className="flex items-center gap-1.5 text-accent">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-medium">Entregue</span>
              </div>
            )}
          </div>
            {evaluation.published && evaluation.grade !== null ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                <FileText className="w-5 h-5 text-accent shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{evaluation.name.replace(/\s+/g, "_")}.pdf</p>
                  <p className="text-xs text-muted-foreground">Entregue em {evaluation.date}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Eye className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Download className="w-4 h-4" /></button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">Arraste o ficheiro ou clique para carregar</p>
                <Button className="gap-2"><Upload className="w-4 h-4" />Carregar ficheiro</Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
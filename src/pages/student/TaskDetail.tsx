import { useParams, Link, useSearchParams } from "react-router-dom";
import { lessons, disciplines } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ClipboardList, Calendar, CheckCircle, AlertCircle, Monitor, MapPin, BookOpen, FileText, Upload, Download, Eye, Share2, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TaskDetail() {
  const { disciplineId } = useParams();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("taskId");

  const disc = disciplines.find(d => d.id === disciplineId);
  const allTasks = lessons.filter(l => l.disciplineId === disciplineId).flatMap(l => l.tasks.map(t => ({ ...t, lessonNumber: l.number, lessonTitle: l.title, materials: l.materials })));
  const task = allTasks.find(t => t.id === taskId);

  if (!disc || !task) return (
    <div className="p-8 text-muted-foreground">
      <Link to={`/student/disciplines/${disciplineId}`} className="text-primary hover:underline">← Voltar</Link>
      <p className="mt-4">Tarefa não encontrada.</p>
    </div>
  );

  const statusConfig = {
    entregue: { color: "bg-accent text-accent-foreground", icon: CheckCircle, label: "Entregue" },
    atrasada: { color: "bg-destructive text-destructive-foreground", icon: AlertCircle, label: "Atrasada" },
    pendente: { color: "bg-secondary/10 text-secondary", icon: ClipboardList, label: "Pendente" },
  };

  const sc = statusConfig[task.status];

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <Link to={`/student/disciplines/${disciplineId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a {disc.name}
      </Link>

      {/* Unified header + description card */}
      <Card className="p-4 border">
        {/* Title row */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            task.status === "entregue" ? "bg-accent/10" : task.status === "atrasada" ? "bg-destructive/10" : "bg-secondary/10"
          }`}>
            <sc.icon className={`w-4 h-4 ${
              task.status === "entregue" ? "text-accent" : task.status === "atrasada" ? "text-destructive" : "text-secondary"
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <Badge variant="outline" className="text-[10px]" style={{ color: disc.color, borderColor: disc.color + "60" }}>{disc.name}</Badge>
              {task.status === "entregue" && (
                <Badge variant="outline" className="text-[10px] text-accent border-accent/30 gap-1">
                  <CheckCircle className="w-3 h-3" /> Entregue
                </Badge>
              )}
              {task.status === "atrasada" && (
                <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30 gap-1">
                  <AlertCircle className="w-3 h-3" /> Atrasada
                </Badge>
              )}
              {task.status === "pendente" && (
                <Badge variant="outline" className="text-[10px] text-secondary border-secondary/30 gap-1">
                  <Clock className="w-3 h-3" /> Pendente
                </Badge>
              )}
            </div>
            <h1 className="text-lg font-bold text-foreground leading-tight">{task.title}</h1>
          </div>
        </div>

        {/* Info rows */}
        <div className="border-t pt-3 space-y-1">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-24">Prazo</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-24 ml-auto text-right">Modalidade</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-24 text-right">Nota</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="font-semibold text-foreground">{task.assignedDate} – {task.dueDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm ml-auto">
              {task.modality === "online" ? <Monitor className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
              <span className="font-medium text-foreground">{task.modality === "online" ? "Online" : "Presencial"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm w-24 justify-end">
              <Award className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              {task.grade != null ? (
                <span className="font-bold text-foreground">
                  <span className={task.grade >= 10 ? "text-accent" : "text-destructive"}>{task.grade}</span>
                  <span className="text-muted-foreground font-normal">/20</span>
                  {task.weight ? <span className="text-muted-foreground font-normal text-xs"> · {task.weight}%</span> : null}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  —{task.weight ? <span className="text-xs"> · {task.weight}%</span> : null}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description inside same card */}
        <div className="border-t mt-3 pt-3">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm"><FileText className="w-4 h-4 text-primary" /> Descrição da Tarefa</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>

          {task.modality === "online" && (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-lg border border-primary/15 bg-primary/[0.03]">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Guia da Tarefa</p>
                <p className="text-[11px] text-muted-foreground">PDF · Instruções detalhadas</p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Ver"><Eye className="w-4 h-4" /></button>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Descarregar"><Download className="w-4 h-4" /></button>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Partilhar"><Share2 className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>

        {/* Conteúdo Relevante */}
        {task.materials && task.materials.length > 0 && (
          <div className="border-t mt-3 pt-3">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-primary" /> Conteúdo Relevante
            </h3>
            <div className="space-y-2">
              {task.materials.map((mat, i) => (
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

        {/* Upload Tarefa */}
        {task.modality === "online" && (
          <div className="border-t mt-3 pt-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm"><Upload className="w-4 h-4 text-primary" /> Upload Tarefa</h3>
              {task.status === "entregue" && (
                <div className="flex items-center gap-1.5 text-accent">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Entregue</span>
                </div>
              )}
            </div>
            {task.status === "entregue" ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{task.title.replace(/\s+/g, "_")}.pdf</p>
                  <p className="text-xs text-muted-foreground">Entregue em {task.dueDate}</p>
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
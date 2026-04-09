import { useParams, Link, useSearchParams } from "react-router-dom";
import { lessons, disciplines } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ClipboardList, Calendar, CheckCircle, AlertCircle, Monitor, MapPin, BookOpen, FileText, Upload, Download, Eye, Share2, Clock, Award, User } from "lucide-react";
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
    entregue: { color: "text-accent", bg: "bg-accent/10", border: "border-accent/20", label: "Entregue", icon: CheckCircle },
    atrasada: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20", label: "Atrasada", icon: AlertCircle },
    pendente: { color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/20", label: "Pendente", icon: Clock },
  };

  const sc = statusConfig[task.status];

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <Link to={`/student/disciplines/${disciplineId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a {disc.name}
      </Link>

      {/* Header card with gradient */}
      <Card className="p-5 bg-gradient-to-r from-primary/6 to-transparent border">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
            <ClipboardList className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-lg font-bold text-foreground leading-tight">{task.title}</h1>
              <Badge variant="outline" className={`text-[10px] gap-1 ${sc.color} ${sc.border}`}>
                <sc.icon className="w-3 h-3" /> {sc.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] gap-1">
                <BookOpen className="w-3 h-3" /> {disc.name}
              </Badge>
              <Badge variant="outline" className="text-[10px] gap-1">
                <User className="w-3 h-3" /> {disc.professor}
              </Badge>
            </div>
          </div>
        </div>

        {/* KPI grid inside header */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/50">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Data de Início</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {task.assignedDate}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Data de Entrega</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {task.dueDate}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Modalidade</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              {task.modality === "online" ? <Monitor className="w-3.5 h-3.5 text-muted-foreground" /> : <MapPin className="w-3.5 h-3.5 text-muted-foreground" />}
              {task.modality === "online" ? "Online" : "Presencial"}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Nota</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <Award className="w-3.5 h-3.5 text-muted-foreground" />
              {task.grade != null ? (
                <span>
                  <span className={task.grade >= 10 ? "text-accent" : "text-destructive"}>{task.grade}</span>
                  <span className="text-muted-foreground font-normal">/{task.weight ? `20 · ${task.weight}%` : "20"}</span>
                </span>
              ) : (
                <span className="text-muted-foreground font-normal">—{task.weight ? ` · ${task.weight}%` : ""}</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Descrição & Guia */}
      <Card className="p-5 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
          <FileText className="w-4 h-4 text-primary" /> Descrição & Guia da Tarefa
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/15 bg-primary/[0.03]">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Guia_da_Tarefa_{task.title.replace(/\s+/g, "_")}.pdf</p>
            <p className="text-[11px] text-muted-foreground">PDF · Instruções detalhadas e critérios de avaliação</p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Ver"><Eye className="w-4 h-4" /></button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Descarregar"><Download className="w-4 h-4" /></button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Partilhar"><Share2 className="w-4 h-4" /></button>
          </div>
        </div>
      </Card>

      {/* Conteúdo Relevante */}
      {task.materials && task.materials.length > 0 && (
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
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
        </Card>
      )}

      {task.modality === "online" && (
        <Card className="p-5">
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
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
              <FileText className="w-5 h-5 text-accent shrink-0" />
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
        </Card>
      )}
    </div>
  );
}

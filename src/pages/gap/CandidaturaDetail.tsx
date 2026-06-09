import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { candidaturas, estadoColors, estadoLabels } from "@/data/admissoesData";
import {
  ArrowLeft, Phone, Mail, FileText, CheckCircle2, Circle, Clock,
  GraduationCap, CreditCard, User, MapPin, BookOpen, CalendarDays, ClipboardCheck, Check, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_DEFS = [
  { n: 1, title: "Dados Pessoais", sub: "Identificação, documento e foto", icon: User },
  { n: 2, title: "Morada & Contactos", sub: "Endereço, contactos e encarregado", icon: MapPin },
  { n: 3, title: "Formação", sub: "Histórico do ensino secundário", icon: GraduationCap },
  { n: 4, title: "Curso", sub: "Faculdades e cursos por ordem de escolha", icon: BookOpen },
  { n: 5, title: "Entrevista", sub: "Marcação da data de entrevista", icon: CalendarDays },
  { n: 6, title: "Curso Preparatório", sub: "Opcional — escolha da sessão", icon: ClipboardCheck },
  { n: 7, title: "Revisão & Submissão", sub: "Confirmação final do candidato", icon: Check },
];

export default function GapCandidaturaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const c = candidaturas.find(x => x.id === id);

  if (!c) return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
      <p className="text-muted-foreground text-center py-12">Candidatura não encontrada.</p>
    </div>
  );

  const opcoes = [c.cursoOpcao1, c.cursoOpcao2, c.cursoOpcao3].filter(Boolean);
  const docsEntregues = c.documentos.filter(d => d.entregue).length;

  // Derive completion per step from the candidatura data
  const certificadoOk = c.documentos.some(d => d.nome.toLowerCase().includes("certificado") && d.entregue);
  const declaracaoOk = c.documentos.some(d => d.nome.toLowerCase().includes("notas") && d.entregue);
  const biOk = c.documentos.some(d => d.nome.toLowerCase().includes("bilhete") && d.entregue);

  const isComplete = (n: number): boolean => {
    switch (n) {
      case 1: return Boolean(c.nome && c.bi && biOk);
      case 2: return Boolean(c.email && c.telefone);
      case 3: return certificadoOk && declaracaoOk;
      case 4: return Boolean(c.cursoOpcao1);
      case 5: return c.estado !== "incompleto";
      case 6: return true; // opcional — sempre considerado preenchido
      case 7: return c.estado === "aprovado" || c.estado === "pendente" || c.estado === "reprovado";
      default: return false;
    }
  };

  const completedCount = STEP_DEFS.filter(s => isComplete(s.n)).length;
  const pct = Math.round((completedCount / STEP_DEFS.length) * 100);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      {/* Header Card — sem botões de contacto */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              {c.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{c.nome}</h1>
              <p className="text-sm text-muted-foreground font-mono">{c.bi}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {c.telefone}</span>
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {c.email}</span>
              </div>
            </div>
          </div>
          <Badge className={`border-0 ${estadoColors[c.estado]}`}>{estadoLabels[c.estado]}</Badge>
        </div>
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {opcoes.map((o, i) => (
            <Badge key={i} variant="outline" className="text-xs gap-1"><GraduationCap className="w-3 h-3" /> {i + 1}ª: {o}</Badge>
          ))}
          <Badge variant="outline" className="text-xs">{c.periodo}</Badge>
          <Badge variant="outline" className="text-xs">Docs {docsEntregues}/{c.documentos.length}</Badge>
          {c.nota !== undefined && <Badge variant="outline" className="text-xs">Nota: {c.nota}/20</Badge>}
        </div>
      </Card>

      {/* Etapas do Processo */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Etapas do Processo de Candidatura</h3>
          <div className="flex items-center gap-3">
            <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-medium text-foreground tabular-nums">
              {completedCount}/{STEP_DEFS.length}
            </span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {STEP_DEFS.map(s => {
            const done = isComplete(s.n);
            const Icon = s.icon;
            return (
              <div key={s.n} className="flex items-center gap-4 px-5 py-3.5">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold",
                  done ? "bg-green-50 text-green-600" : "bg-muted text-muted-foreground"
                )}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">{s.n}. {s.title}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    done
                      ? "bg-green-50 text-green-600 border-green-200"
                      : "bg-yellow-50 text-yellow-600 border-yellow-200"
                  )}
                >
                  {done ? "Completo" : "Pendente"}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> Linha do Tempo
            </h3>
          </div>
          <div className="p-5">
            <div className="relative pl-6 space-y-4">
              {c.historico.map((h, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  {i < c.historico.length - 1 && <div className="absolute -left-[18px] top-4 w-px h-full bg-border" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] border-0 ${estadoColors[h.para]}`}>{estadoLabels[h.para]}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(h.data).toLocaleDateString("pt-AO")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">por {h.responsavel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Documents */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" /> Documentos ({docsEntregues}/{c.documentos.length})
            </h3>
          </div>
          <div className="divide-y divide-border">
            {c.documentos.map((d, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  {d.entregue
                    ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                    : <Circle className="w-4 h-4 text-muted-foreground/40" />}
                  <span className="text-sm text-foreground">{d.nome}</span>
                </div>
                <Badge variant="outline" className={cn(
                  "text-[10px]",
                  d.entregue
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-red-50 text-red-600 border-red-200"
                )}>
                  {d.entregue ? "Entregue" : "Em falta"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pagamento */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Pagamento
          </h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Estado</p>
            <Badge variant="outline" className={`text-xs ${c.pagamento.estado === "confirmado" ? "bg-green-50 text-green-600 border-green-200" : "bg-yellow-50 text-yellow-600 border-yellow-200"}`}>
              {c.pagamento.estado === "confirmado" ? "Confirmado" : "Pendente"}
            </Badge>
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Referência</p>
            <p className="text-sm font-medium text-foreground font-mono">{c.pagamento.referencia}</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Valor</p>
            <p className="text-sm font-medium text-foreground">{c.pagamento.valor.toLocaleString("pt-AO")} Kz</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Comprovativo</p>
            {c.pagamento.comprovativo ? (
              <Button variant="outline" size="sm" className="gap-1 text-xs h-7"><Eye className="w-3 h-3" /> Ver</Button>
            ) : (
              <span className="text-sm text-muted-foreground">Não submetido</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

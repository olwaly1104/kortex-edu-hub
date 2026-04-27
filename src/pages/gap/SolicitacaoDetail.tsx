import { useParams, useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Clock, FileText, MessageSquare, Mail, Phone, Check, X, Hourglass, Send,
  Eye, Download, Users, Share2, CheckCircle2, Paperclip, FileImage, FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  solicitacoes, Categoria,
  estadoSolicitacaoConfig, destinoConfig, tipoConfig, categoriaConfig,
} from "@/data/gapData";

const estadoDot: Record<string, string> = {
  recebida: "bg-amber-500",
  em_execucao: "bg-sky-500",
  concluida: "bg-emerald-500",
  rejeitada: "bg-destructive",
};

export default function GapSolicitacaoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const selected = solicitacoes.find(s => s.id === id);

  if (!selected) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Solicitação não encontrada.</p>
        <Button onClick={() => navigate("/gap/solicitacoes")} className="mt-4" variant="outline">Voltar</Button>
      </div>
    );
  }

  const st = estadoSolicitacaoConfig[selected.estado];
  const dest = destinoConfig[selected.destino];
  const tipoCfg = tipoConfig[selected.tipo];
  const dSub = new Date(selected.dataSubmissao);
  const dConc = selected.dataConclusao ? new Date(selected.dataConclusao) : null;
  const fmt = (d: Date) => d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
  const fmtT = (d: Date) => d.toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });
  const initials = selected.estudante.split(" ").slice(0, 2).map(n => n[0]).join("");

  // Anexos do estudante — usa anexos definidos ou deriva do tipo/descrição
  type Anexo = { nome: string; tamanho: string; tipo: "pdf" | "image" | "doc" | "sheet" };
  const anexos: Anexo[] = (() => {
    if (selected.anexos && selected.anexos.length > 0) {
      return selected.anexos.map(a => ({
        nome: a.nome,
        tamanho: "—",
        tipo: a.nome.toLowerCase().endsWith(".jpg") || a.nome.toLowerCase().endsWith(".png") ? "image"
          : a.nome.toLowerCase().endsWith(".xlsx") || a.nome.toLowerCase().endsWith(".csv") ? "sheet"
          : a.nome.toLowerCase().endsWith(".docx") ? "doc"
          : "pdf",
      }));
    }
    const desc = selected.descricao.toLowerCase();
    const tipo = selected.tipo;
    const list: Anexo[] = [];
    if (desc.includes("comprovativo") || tipo.includes("pagamento") || selected.destino === "Financeiro") {
      list.push({ nome: `Comprovativo-pagamento-${selected.matricula}.pdf`, tamanho: "184 KB", tipo: "pdf" });
    }
    if (desc.includes("atestado") || desc.includes("internad") || tipo.includes("justificacao")) {
      list.push({ nome: "Atestado-medico.pdf", tamanho: "212 KB", tipo: "pdf" });
    }
    if (tipo.includes("declaracao") || tipo.includes("certificado")) {
      list.push({ nome: `BI-${selected.matricula}.jpg`, tamanho: "356 KB", tipo: "image" });
    }
    if (tipo.includes("homologacao") || tipo.includes("transferencia")) {
      list.push(
        { nome: "Historico-academico.pdf", tamanho: "498 KB", tipo: "pdf" },
        { nome: "Plano-curricular.pdf", tamanho: "276 KB", tipo: "pdf" },
      );
    }
    return list;
  })();

  const anexoIcon = (t: Anexo["tipo"]) => {
    if (t === "image") return { Icon: FileImage, cls: "bg-violet-50 border-violet-200 text-violet-600" };
    if (t === "sheet") return { Icon: FileSpreadsheet, cls: "bg-emerald-50 border-emerald-200 text-emerald-600" };
    if (t === "doc") return { Icon: FileText, cls: "bg-sky-50 border-sky-200 text-sky-600" };
    return { Icon: FileText, cls: "bg-red-50 border-red-200 text-red-600" };
  };


  const submetida = selected.historico.find(h => h.accao.toLowerCase().includes("submetida"));
  const encaminhada = selected.historico.find(h => h.accao.toLowerCase().includes("encaminhada"));
  const executada = selected.historico.find(h => {
    const a = h.accao.toLowerCase();
    return a.includes("concluída") || a.includes("concluida") || a.includes("executada");
  });

  type Step = { label: string; data?: string; actor?: string; nota?: string; aside?: string; tone: "submitted" | "forwarded" | "accepted" | "rejected" | "executed" | "pending" | "scheduled" };
  const steps: Step[] = [];

  // 1) Submetida
  steps.push({
    label: "Solicitação submetida",
    data: submetida?.data,
    actor: submetida?.actor ?? "Portal do Estudante",
    tone: "submitted",
  });

  // (encaminhamento é automático — omitido do histórico)

  // 3) Aceite / rejeitada / aguarda
  if (selected.estado === "rejeitada") {
    const rej = selected.historico.slice().reverse().find(h => h.accao.toLowerCase().includes("rejeit"));
    steps.push({ label: "Solicitação rejeitada", data: rej?.data, actor: rej?.actor ?? selected.responsavelDestino, nota: rej?.nota, tone: "rejected" });
  } else if (selected.estado === "em_execucao" || selected.estado === "concluida") {
    const aceite = selected.historico.find(h => {
      const a = h.accao.toLowerCase();
      return !a.includes("submetida") && !a.includes("encaminhada") && !a.includes("concluí") && !a.includes("conclui") && !a.includes("executada") && !a.includes("rejeit");
    });
    steps.push({ label: "Solicitação aceite", data: aceite?.data, actor: aceite?.actor ?? selected.responsavelDestino, nota: aceite?.nota, tone: "accepted" });
  } else {
    // Acceptance prevision — one day before the conclusion target (15/12/2025)
    const baseAccept = new Date("2025-12-14");
    const hojeA = new Date(); hojeA.setHours(0, 0, 0, 0);
    const diffA = Math.ceil((baseAccept.getTime() - hojeA.getTime()) / 86400000);
    let asideAccept: string;
    if (diffA < 0) {
      asideAccept = `${Math.abs(diffA)} ${Math.abs(diffA) === 1 ? "dia" : "dias"} em atraso`;
    } else if (diffA === 0) {
      asideAccept = "Prazo termina hoje";
    } else {
      asideAccept = `Faltam ${diffA} ${diffA === 1 ? "dia" : "dias"}`;
    }
    steps.push({
      label: `Aguarda aceitação · prevista ${fmt(baseAccept)}`,
      actor: selected.responsavelDestino ?? dest.label,
      aside: asideAccept,
      tone: "scheduled",
    });
  }

  // 4) Concluída / prevista
  if (selected.estado === "concluida") {
    steps.push({ label: "Concluída", data: executada?.data, actor: executada?.actor ?? selected.responsavelDestino, nota: executada?.nota, tone: "executed" });
  } else if (selected.estado === "rejeitada") {
    steps.push({ label: "Sem conclusão", actor: "Pedido encerrado por rejeição", tone: "pending" });
  } else {
    // Conclusão prevista — fixed institutional target
    const base = new Date("2025-12-15");
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const diff = Math.ceil((base.getTime() - hoje.getTime()) / 86400000);
    let aside: string;
    if (diff < 0) {
      aside = `${Math.abs(diff)} ${Math.abs(diff) === 1 ? "dia" : "dias"} em atraso`;
    } else if (diff === 0) {
      aside = "Prazo termina hoje";
    } else {
      aside = `Faltam ${diff} ${diff === 1 ? "dia" : "dias"}`;
    }
    steps.push({
      label: `Conclusão prevista · ${fmt(base)}`,
      actor: selected.responsavelDestino ?? dest.label,
      aside,
      tone: "scheduled",
    });
  }

  const nodeCls: Record<Step["tone"], string> = {
    submitted: "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    forwarded: "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    accepted: "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    rejected: "bg-destructive text-destructive-foreground ring-4 ring-destructive/15",
    executed: "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    scheduled: "bg-amber-500 text-white ring-4 ring-amber-500/15",
    pending: "bg-background border-2 border-dashed border-border text-muted-foreground",
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/gap/solicitacoes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a Solicitações
      </Link>

      <Card className="overflow-hidden p-0 gap-0">
        {/* Top bar — breadcrumb */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-muted/20 text-[10px] uppercase tracking-[0.12em] font-semibold">
          <span className="text-primary">Ano Lectivo 2024/2025</span>
          <span className="text-muted-foreground/40">·</span>
          <Link to="/gap/solicitacoes" className="text-muted-foreground hover:text-foreground transition-colors">Solicitações</Link>
          <span className="text-muted-foreground/40">·</span>
          <span className="font-mono text-foreground normal-case tracking-normal">{selected.id}</span>
        </div>

        {/* Title block with date tile (mirrors Agendamento detail) */}
        <div className="px-6 pt-5 pb-5 space-y-4">
          <div className="flex items-start gap-5">
            {/* Date tile */}
            <div className="shrink-0 w-[68px] rounded-lg border border-border overflow-hidden bg-background text-center">
              <div className="bg-primary/90 py-1">
                <p className="text-[10px] uppercase tracking-[0.15em] text-primary-foreground font-bold">
                  {dSub.toLocaleDateString("pt-PT", { month: "short" }).replace(".", "")}
                </p>
              </div>
              <div className="py-1.5">
                <p className="text-[28px] leading-none font-bold text-foreground tabular-nums tracking-tight">
                  {String(dSub.getDate()).padStart(2, "0")}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mt-1 capitalize">
                  {dSub.toLocaleDateString("pt-PT", { weekday: "short" }).replace(".", "").slice(0, 3)}
                </p>
              </div>
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground">
                  {tipoCfg?.label ?? selected.tipo}
                </h1>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard?.writeText(selected.id); toast({ title: "ID copiado", description: selected.id }); }}
                  className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md border border-border bg-background hover:bg-muted text-[11px] font-mono font-semibold text-foreground transition-colors"
                >
                  {selected.id}
                </button>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider gap-1", st.color)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", estadoDot[selected.estado])} />
                  {st.label}
                </Badge>
                {tipoCfg && (() => {
                  const catCfg = categoriaConfig[tipoCfg.categoria as Categoria];
                  const CatIcon = catCfg?.icon;
                  return (
                    <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider gap-1", catCfg?.color)}>
                      {CatIcon && <CatIcon className="w-3 h-3" />}
                      {tipoCfg.categoria}
                    </Badge>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Documento Institucional gerado — abaixo do título, em destaque */}
          <Dialog>
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg border border-border bg-muted/25">
              <div className="w-9 h-9 rounded-md bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-semibold text-foreground leading-tight truncate">
                    Pedido-{selected.id}
                  </p>
                  <Badge variant="outline" className="text-[9px] font-semibold px-1.5 py-0 h-4 uppercase tracking-wider bg-background">
                    Documento Institucional
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 inline-flex items-center gap-1.5">
                  <span>Gerado automaticamente</span>
                  <span className="text-muted-foreground/40">·</span>
                  <DialogTrigger asChild>
                    <button type="button" className="inline-flex items-center gap-1 text-primary hover:underline font-medium">
                      <Users className="w-3 h-3" /> 4 partilhas
                    </button>
                  </DialogTrigger>
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1 bg-background">
                    <Eye className="w-3 h-3" /> Ver
                  </Button>
                </DialogTrigger>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-[11px] gap-1 bg-background"
                  onClick={() => toast({ title: "Documento exportado", description: `Pedido-${selected.id}` })}
                >
                  <Download className="w-3 h-3" /> Exportar
                </Button>
              </div>
            </div>

            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-primary" /> Partilhado com 4 pessoas
                </DialogTitle>
                <DialogDescription className="text-[12px]">
                  Pessoas com acesso ao documento <span className="font-medium text-foreground">Pedido-{selected.id}</span>.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 mt-2">
                {[
                  { name: "Prof. Dr. António Mendes", role: "Reitor", access: "Visualizar" },
                  { name: selected.responsavelDestino?.split(" · ")[0] ?? dest.label, role: `Responsável ${dest.label}`, access: "Editar" },
                  { name: selected.estudante, role: "Estudante", access: "Visualizar" },
                  { name: "Coordenação Académica", role: "Equipa", access: "Visualizar" },
                ].map((p, i) => {
                  const ini = p.name.split(" ").slice(0, 2).map(n => n[0]).join("");
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-muted/20">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold ring-1 ring-primary/15 shrink-0">
                        {ini}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{p.role}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 shrink-0">{p.access}</Badge>
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </div>


        {/* 2-column body */}
        <div className="grid md:grid-cols-[280px_1fr] divide-x divide-border border-t border-border">
          {/* LEFT — estudante + meta */}
          <aside className="p-5 space-y-5 bg-muted/15">
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2">Estudante</p>
              <button
                type="button"
                onClick={() => navigate(`/gap/estudantes/${selected.matricula}`)}
                className="flex items-start gap-3 w-full text-left hover:bg-muted/40 -mx-2 px-2 py-1.5 rounded-md transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-xs ring-1 ring-primary/15">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground leading-tight hover:text-primary transition-colors">{selected.estudante}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{selected.matricula}</p>
                </div>
              </button>
              <div className="flex items-center gap-2 mt-3">
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1.5 flex-1">
                  <MessageSquare className="w-3 h-3" /> Chat
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1.5 flex-1">
                  <Mail className="w-3 h-3" /> Email
                </Button>
              </div>
              <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Ano</span>
                  <span className="text-[11px] font-medium text-foreground">{selected.ano}º</span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Curso</span>
                  <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[150px]">{selected.curso}</span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Faculdade</span>
                  <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[150px]">{selected.faculdade}</span>
                </div>
              </div>
            </div>

            {/* Responsável */}
            <div className="pt-4 border-t border-border">
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2">Responsável</p>
              {selected.responsavelDestino ? (() => {
                const respFull = selected.responsavelDestino;
                const [respName, respRole] = respFull.split(" · ");
                // Numeric institutional user id derived deterministically from name
                let hash = 0;
                for (let i = 0; i < respName.length; i++) hash = (hash * 31 + respName.charCodeAt(i)) >>> 0;
                const userId = String(100000 + (hash % 900000));
                return (
                  <>
                    <button
                      type="button"
                      onClick={() => toast({ title: "Perfil do responsável", description: "Abertura do perfil institucional em breve." })}
                      className="flex items-start gap-3 w-full text-left hover:bg-muted/40 -mx-2 px-2 py-1.5 rounded-md transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-xs ring-1 ring-primary/15">
                        {respName.split(" ").slice(0, 2).map(n => n[0]).join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors truncate">
                          {respName}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono tabular-nums">{userId}</p>
                      </div>
                    </button>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <Button variant="outline" size="sm" className="h-7 px-1 text-[11px] gap-1">
                        <MessageSquare className="w-3 h-3" /> Chat
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 px-1 text-[11px] gap-1">
                        <Mail className="w-3 h-3" /> Email
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 px-1 text-[11px] gap-1">
                        <Phone className="w-3 h-3" /> Ligar
                      </Button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                      {selected.destino === "Faculdade" && (
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Faculdade</span>
                          <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[150px]">{selected.faculdade}</span>
                        </div>
                      )}
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Departamento</span>
                        <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[150px]">{dest.label}</span>
                      </div>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Posição</span>
                        <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[150px]">{respRole ?? "Profissional"}</span>
                      </div>
                    </div>
                  </>
                );
              })() : (
                <p className="text-[12px] text-muted-foreground italic">A atribuir</p>
              )}
            </div>

          </aside>

          {/* RIGHT — detalhes + descrição + doc + histórico */}
          <main className="p-6 space-y-6 min-w-0">
            {/* Resumo */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Resumo</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-4">
                <FactItem label="Submetido" value={fmt(dSub)} />
                <FactItem label="Hora" value={fmtT(dSub)} />
                <FactItem label="Destino" value={dest.label} />
                <FactItem label="Responsável" value={selected.responsavelDestino ? selected.responsavelDestino.split(" · ")[0] : "A atribuir"} />
              </div>
            </section>

            <div className="border-t border-border" />

            {/* Detalhes do Pedido — descrição (corpo) + anexos (chips) */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Detalhes do Pedido</h3>
              </div>

              {/* Descrição — corpo de email, sem caixa */}
              <p className="text-[13.5px] text-foreground/90 leading-[1.65] whitespace-pre-line">
                {selected.descricao}
              </p>

              {/* Anexos — lista discreta tipo email */}
              {anexos.length > 0 && (
                <div className="mt-5 pt-4 border-t border-dashed border-border">
                  <div className="flex items-center gap-1.5 mb-2.5 text-muted-foreground">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">
                      {anexos.length} {anexos.length === 1 ? "anexo" : "anexos"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {anexos.map((a, i) => {
                      const { Icon, cls } = anexoIcon(a.tipo);
                      return (
                        <div
                          key={i}
                          className="group inline-flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-md border border-border bg-muted/30 hover:bg-muted/50 transition-colors max-w-full"
                        >
                          <div className={cn("w-7 h-7 rounded border flex items-center justify-center shrink-0", cls)}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex items-baseline gap-1.5">
                            <span className="text-[12px] font-medium text-foreground truncate max-w-[180px]">{a.nome}</span>
                            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{a.tamanho}</span>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0 ml-1">
                            <button
                              type="button"
                              onClick={() => toast({ title: "A abrir anexo", description: a.nome })}
                              className="w-6 h-6 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                              title="Ver"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toast({ title: "Anexo descarregado", description: a.nome })}
                              className="w-6 h-6 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                              title="Descarregar"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <div className="border-t border-border" />


            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Histórico</h3>
              </div>
              <ol className="space-y-0">
                {steps.map((s, i) => {
                  const isLast = i === steps.length - 1;
                  const Icon =
                    s.tone === "rejected" ? X :
                    s.tone === "scheduled" ? Hourglass :
                    s.tone === "forwarded" ? Send :
                    s.tone === "pending" ? null :
                    Check;
                  return (
                    <li key={i} className="flex gap-3 relative">
                      <div className="flex flex-col items-center shrink-0 w-5">
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center mt-0.5 z-10", nodeCls[s.tone])}>
                          {Icon && <Icon className="w-3 h-3" strokeWidth={3} />}
                        </div>
                        {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className={cn("flex-1 min-w-0", !isLast && "pb-5")}>
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">{s.label}</p>
                          {s.data && <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">{s.data}</span>}
                        </div>
                        {s.actor && <p className="text-[11px] text-muted-foreground mt-0.5">{s.actor}</p>}
                        {s.aside && (
                          <p className={cn(
                            "mt-1.5 text-[11px] italic",
                            s.aside.includes("atraso") ? "text-red-600 font-semibold not-italic" : "text-muted-foreground/90"
                          )}>{s.aside}</p>
                        )}
                        {s.nota && <p className="mt-2 text-xs text-foreground/75 leading-relaxed pl-3 border-l-2 border-border">{s.nota}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </main>
        </div>
      </Card>
    </div>
  );
}

function FactItem({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">{label}</p>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="text-sm font-semibold text-primary hover:underline leading-tight truncate text-left block max-w-full"
        >
          {value}
        </button>
      ) : (
        <p className="text-sm font-semibold text-foreground leading-tight truncate">{value}</p>
      )}
    </div>
  );
}

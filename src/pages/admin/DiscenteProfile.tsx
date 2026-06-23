import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Mail, MessageCircle, Users, Phone, MapPin, UserCheck, Calendar,
  GraduationCap, FileText, Building2, IdCard, Loader2, Award, Eye, Download,
  Wallet, Receipt, CircleDollarSign, CheckCircle2, Clock, AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useEstudantes, useCursos, useFaculdades, usePropinas } from "@/lib/useInstitution";
import DiscenteDocPreview from "./DiscenteDocPreview";

const fmtAOA = (n: number) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "AOA", maximumFractionDigits: 0 }).format(n || 0);

function useSignedUrl(path: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    if (!path) { setUrl(null); return; }
    supabase.storage.from("discentes").createSignedUrl(path, 3600).then(({ data }) => {
      if (alive) setUrl(data?.signedUrl || null);
    });
    return () => { alive = false; };
  }, [path]);
  return url;
}

export default function AdminDiscenteProfile() {
  const { discenteId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: rows = [], isLoading } = useEstudantes();
  const { data: cursos = [] } = useCursos();
  const { data: faculdades = [] } = useFaculdades();
  const { data: propinas = [] } = usePropinas();
  const [docOpen, setDocOpen] = useState(false);

  const student = useMemo(() => rows.find((r: any) => r.id === discenteId) as any, [rows, discenteId]);
  const curso = useMemo(() => cursos.find((c: any) => c.id === student?.curso_id) as any, [cursos, student]);
  const faculdade = useMemo(() => faculdades.find((f: any) => f.id === curso?.faculdade_id) as any, [faculdades, curso]);
  const propina = useMemo(() => propinas.find((p: any) => p.curso_id === student?.curso_id) as any, [propinas, student]);

  const fotoUrl = useSignedUrl(student?.foto_url || null);

  if (isLoading) {
    return (
      <div className="p-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> A carregar perfil…
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <p className="text-muted-foreground text-center py-12">Discente não encontrado.</p>
      </div>
    );
  }

  const cursoName = curso?.name || curso?.nome || "—";
  const cursoCode = curso?.code || curso?.codigo || "";
  const facName = faculdade?.sigla || faculdade?.name || "—";
  const displayId = `DISC-${(student.id as string).slice(0, 8).toUpperCase()}`;
  const dataMatricula = student.created_at
    ? new Date(student.created_at).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

  // Encarregado: split full name into Primeiro / Último for display
  const encParts = (student.enc_nome || "").trim().split(/\s+/).filter(Boolean);
  const encPrimeiro = encParts[0] || "";
  const encUltimo = encParts.length > 1 ? encParts.slice(1).join(" ") : "";

  const initials = (student.nome || "?")
    .split(/\s+/).filter(Boolean).slice(0, 2).map((p: string) => p[0]?.toUpperCase()).join("");

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
      </div>

      {/* Identity header */}
      <Card className="overflow-hidden p-0">

        <div className="grid lg:grid-cols-[1.6fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-border">
          <div className="p-6 relative">
            {/* Auto-generated matrícula document */}
            <div className="absolute top-4 right-4 flex items-center gap-2 rounded-lg border border-border bg-background/80 backdrop-blur px-2.5 py-1.5 shadow-sm">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] font-semibold text-foreground tabular-nums">{displayId}</p>
                <p className="text-[9px] text-muted-foreground">Gerado automaticamente</p>
              </div>
              <div className="flex items-center gap-1 ml-1">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setDocOpen(true)} title="Pré-visualizar">
                  <Eye className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setDocOpen(true)} title="Descarregar">
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-full bg-muted overflow-hidden shrink-0 ring-2 ring-border flex items-center justify-center text-xl font-semibold text-muted-foreground">
                {fotoUrl ? <img src={fotoUrl} alt={student.nome} className="w-full h-full object-cover" /> : initials}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">Perfil do Discente</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                    <GraduationCap className="w-3 h-3 mr-1" /> Discente
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-foreground leading-tight mt-1.5">{student.nome}</h1>
                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                  <Link to="/admin/faculdades-cursos" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold border border-primary/20 hover:bg-primary/15 transition-colors">
                    <Building2 className="w-3 h-3" /> {facName}
                  </Link>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                    <GraduationCap className="w-3 h-3" /> {cursoCode || cursoName}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground text-[11px] font-semibold border border-border">
                    <Calendar className="w-3 h-3" /> {student.ano}º Ano
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground text-[11px] font-semibold border border-border">
                    <Users className="w-3 h-3" /> Turma {student.turma}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                    <MessageCircle className="w-3.5 h-3.5" /> Chat
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-6 grid grid-cols-2 gap-4 content-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Regime</p>
              <div className="mt-1.5">
                <Badge variant="outline" className={cn("text-xs px-2 py-0.5",
                  student.regime === "bolseiro" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-muted text-muted-foreground border-border")}>
                  {student.regime === "bolseiro" ? "Bolseiro" : "Normal"}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Estado Académico</p>
              <div className="mt-1.5">
                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200">Activo</Badge>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Estado Financeiro</p>
              <div className="mt-1.5">
                <Badge variant="outline" className={cn("text-xs px-2 py-0.5",
                  student.regime === "bolseiro" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200")}>
                  {student.regime === "bolseiro" ? "Isento (Bolseiro)" : "Regularizado"}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Presença</p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: "92%" }} />
                </div>
                <span className="text-xs font-semibold tabular-nums text-emerald-700">92%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>



      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="overview" className="text-xs">Visão Geral</TabsTrigger>
          <TabsTrigger value="documentos" className="text-xs">Documentos</TabsTrigger>
          <TabsTrigger value="financas" className="text-xs">Finanças</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <SectionCard title="Informações Pessoais" icon={<UserCheck className="w-4 h-4" />}>
              <InfoRow label="Email" value={student.email || "—"} icon={<Mail className="w-4 h-4 text-primary" />} />
              <InfoRow label="Telemóvel" value={student.telemovel || "—"} icon={<Phone className="w-4 h-4 text-primary" />} />
              <InfoRow label="Data de Nascimento" value={student.nascimento || "—"} icon={<Calendar className="w-4 h-4 text-primary" />} />
              <InfoRow label="Género" value={student.genero === "M" ? "Masculino" : student.genero === "F" ? "Feminino" : (student.genero || "—")} icon={<UserCheck className="w-4 h-4 text-primary" />} />
              <InfoRow label="Nº Bilhete de Identidade" value={student.bilhete || "—"} icon={<IdCard className="w-4 h-4 text-primary" />} />
              <InfoRow label="Morada" value={[student.endereco, student.municipio, student.provincia].filter(Boolean).join(", ") || "—"} icon={<MapPin className="w-4 h-4 text-primary" />} />
            </SectionCard>

            <SectionCard title="Informações Académicas" icon={<GraduationCap className="w-4 h-4" />}>
              <InfoRow label="Curso" value={cursoName} icon={<GraduationCap className="w-4 h-4 text-primary" />} />
              <InfoRow label="Faculdade" value={facName} icon={<Building2 className="w-4 h-4 text-primary" />} />
              <InfoRow label="Ano Curricular" value={`${student.ano}º Ano`} icon={<Calendar className="w-4 h-4 text-primary" />} />
              <InfoRow label="Turma" value={`Turma ${student.turma}`} icon={<Users className="w-4 h-4 text-primary" />} />
              <InfoRow label="Regime" value={student.regime === "bolseiro" ? "Bolseiro" : "Normal"} icon={<Award className="w-4 h-4 text-primary" />} />
              <InfoRow label="Matrícula" value={displayId} icon={<IdCard className="w-4 h-4 text-primary" />} />
              <InfoRow label="ID do Estudante" value={student.id} icon={<IdCard className="w-4 h-4 text-primary" />} />
              <InfoRow label="Data de Matriculação" value={dataMatricula} icon={<Calendar className="w-4 h-4 text-primary" />} />
            </SectionCard>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <SectionCard title="Encarregado de Educação" icon={<UserCheck className="w-4 h-4" />}>
              <InfoRow label="Primeiro nome" value={encPrimeiro || "—"} icon={<UserCheck className="w-4 h-4 text-primary" />} />
              <InfoRow label="Último nome" value={encUltimo || "—"} icon={<UserCheck className="w-4 h-4 text-primary" />} />
              <InfoRow label="Parentesco" value={student.enc_parentesco || "—"} icon={<Users className="w-4 h-4 text-primary" />} />
              <InfoRow label="Contacto telefónico" value={student.enc_telefone || "—"} icon={<Phone className="w-4 h-4 text-primary" />} />
            </SectionCard>

            <SectionCard title="Localização" icon={<MapPin className="w-4 h-4" />}>
              <InfoRow label="Província" value={student.provincia || "—"} icon={<MapPin className="w-4 h-4 text-primary" />} />
              <InfoRow label="Município" value={student.municipio || "—"} icon={<MapPin className="w-4 h-4 text-primary" />} />
              <InfoRow label="Endereço" value={student.endereco || "—"} icon={<Building2 className="w-4 h-4 text-primary" />} />
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4">
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Documentação Anexa
              </h3>
            </div>
            <div className="divide-y divide-border">
              <DocRow label="Bilhete de Identidade" path={student.bilhete_url} icon={<IdCard className="w-4 h-4 text-primary" />} />
              <DocRow label="Certificado Ensino Médio" path={student.certificado_url} icon={<FileText className="w-4 h-4 text-primary" />} />
              <DocRow label="BI do Encarregado" path={student.enc_bilhete_url} icon={<IdCard className="w-4 h-4 text-primary" />} />
              <DocRow label="Fotografia" path={student.foto_url} icon={<UserCheck className="w-4 h-4 text-primary" />} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="financas" className="space-y-4">
          {(() => {
            const isBolseiro = student.regime === "bolseiro";
            const valorMensal = Number(propina?.valor_mensal || 0);
            const imposto = Number(propina?.imposto || 0);
            const totalMensal = valorMensal + (valorMensal * imposto) / 100;
            const totalAnual = totalMensal * 12;
            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      <Wallet className="w-3.5 h-3.5" /> Propina Mensal
                    </div>
                    <p className="text-2xl font-bold tabular-nums mt-2">
                      {isBolseiro ? "Isento" : fmtAOA(valorMensal)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {isBolseiro ? "Regime de Bolsa" : "Mensal"}
                    </p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      <CircleDollarSign className="w-3.5 h-3.5" /> Propina Anual
                    </div>
                    <p className="text-2xl font-bold tabular-nums mt-2">
                      {isBolseiro ? fmtAOA(0) : fmtAOA(valorMensal * 12)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">12 mensalidades</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      <Receipt className="w-3.5 h-3.5" /> Multas
                    </div>
                    <p className="text-2xl font-bold tabular-nums mt-2">{fmtAOA(0)}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Sem multas</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      <Receipt className="w-3.5 h-3.5" /> Estado
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className={cn("text-xs px-2 py-0.5",
                        isBolseiro ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-accent/10 text-accent border-accent/30")}>
                        {isBolseiro ? "Bolseiro" : "Regularizado"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">Sem pendências</p>
                  </Card>
                </div>


                <SectionCard title="Plano Financeiro" icon={<Wallet className="w-4 h-4" />}>
                  <InfoRow label="Regime" value={isBolseiro ? "Bolseiro" : "Normal"} icon={<Award className="w-4 h-4 text-primary" />} />
                  <InfoRow label="Curso" value={cursoName} icon={<GraduationCap className="w-4 h-4 text-primary" />} />
                  <InfoRow label="Propina mensal" value={isBolseiro ? "Isento" : (propina ? fmtAOA(valorMensal) : "—")} icon={<Wallet className="w-4 h-4 text-primary" />} />
                  <InfoRow label="Prazo" value="—" icon={<Calendar className="w-4 h-4 text-primary" />} />
                  <InfoRow label="Data de matriculação" value={dataMatricula} icon={<Calendar className="w-4 h-4 text-primary" />} />
                </SectionCard>

                {(() => {
                  // Ano lectivo: Setembro → Junho (10 meses)
                  const MESES = ["Set", "Out", "Nov", "Dez", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
                  const monthsPaid = 0;
                  const totalMeses = MESES.length;
                  const pct = Math.round((monthsPaid / totalMeses) * 100);
                  const valorPago = isBolseiro ? 0 : valorMensal * monthsPaid;
                  const valorTotalAno = valorMensal * totalMeses;
                  const valorRestante = Math.max(0, valorTotalAno - valorPago);

                  return (
                    <Card className="overflow-hidden">
                      <div className="p-4 border-b bg-muted/30 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <CircleDollarSign className="w-4 h-4 text-primary" /> Progresso de Pagamento — Ano Lectivo
                        </h3>
                        <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5",
                          isBolseiro ? "bg-amber-50 text-amber-700 border-amber-200" :
                          pct >= 100 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          "bg-blue-50 text-blue-700 border-blue-200")}>
                          {isBolseiro ? "Bolseiro · isento" : `${monthsPaid} de ${totalMeses} mensalidades`}
                        </Badge>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Pago: <span className="font-semibold text-foreground tabular-nums">{fmtAOA(valorPago)}</span></span>
                            <span className="text-muted-foreground">Total ano: <span className="font-semibold text-foreground tabular-nums">{fmtAOA(valorTotalAno)}</span></span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                            <div className={cn("h-full transition-all", isBolseiro ? "bg-amber-400" : "bg-emerald-500")} style={{ width: `${isBolseiro ? 100 : pct}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold tabular-nums text-foreground">{isBolseiro ? 100 : pct}%</span>
                            <span className="text-muted-foreground">Em falta: <span className="font-semibold text-foreground tabular-nums">{fmtAOA(isBolseiro ? 0 : valorRestante)}</span></span>
                          </div>
                        </div>

                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
                          {MESES.map((m, i) => {
                            const paid = isBolseiro || i < monthsPaid;
                            const current = !isBolseiro && i === monthsPaid;
                            return (
                              <div key={m} className={cn(
                                "rounded-md border text-center py-1.5 text-[10px] font-semibold",
                                paid ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                current ? "bg-blue-50 text-blue-700 border-blue-200" :
                                "bg-muted/40 text-muted-foreground border-border"
                              )} title={m}>
                                {m}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Card>
                  );
                })()}

                {(() => {
                  const MESES_FULL = ["Setembro", "Outubro", "Novembro", "Dezembro", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho"];
                  const now = new Date();
                  const month = now.getMonth();
                  const monthsPaid = 0;
                  const refYear = month >= 8 ? now.getFullYear() : now.getFullYear() - 1;
                  const refYear = month >= 8 ? now.getFullYear() : now.getFullYear() - 1;

                  const history = MESES_FULL.map((nome, i) => {
                    const ano = i <= 3 ? refYear : refYear + 1; // Set-Dez do ano refYear, resto do seguinte
                    const paid = isBolseiro || i < monthsPaid;
                    const current = !isBolseiro && i === monthsPaid;
                    const status: "pago" | "pendente" | "futuro" | "bolseiro" =
                      isBolseiro ? "bolseiro" : paid ? "pago" : current ? "pendente" : "futuro";
                    return { nome, ano, status };
                  });

                  return (
                    <Card className="overflow-hidden">
                      <div className="p-4 border-b bg-muted/30">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-primary" /> Histórico de Pagamentos
                        </h3>
                      </div>
                      <div className="divide-y divide-border">
                        {history.map((h) => {
                          const meta =
                            h.status === "pago" ? { label: "Pago", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle2 } :
                            h.status === "pendente" ? { label: "Pendente", cls: "bg-amber-50 text-amber-700 border-amber-200", Icon: Clock } :
                            h.status === "bolseiro" ? { label: "Isento", cls: "bg-amber-50 text-amber-700 border-amber-200", Icon: Award } :
                            { label: "Futuro", cls: "bg-muted text-muted-foreground border-border", Icon: AlertCircle };
                          const Icon = meta.Icon;
                          const valor = h.status === "bolseiro" ? "Isento" : fmtAOA(valorMensal);
                          return (
                            <div key={`${h.nome}-${h.ano}`} className="flex items-center justify-between px-5 py-3 gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <Calendar className="w-4 h-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-foreground truncate">{h.nome} {h.ano}</p>
                                  <p className="text-[11px] text-muted-foreground tabular-nums">{valor}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className={cn("text-[10px] gap-1 px-2 py-0.5", meta.cls)}>
                                <Icon className="w-3 h-3" /> {meta.label}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })()}
              </>
            );
          })()}
        </TabsContent>
      </Tabs>

      <Dialog open={docOpen} onOpenChange={setDocOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[92vh] p-0 gap-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Ficha do Discente {displayId}</DialogTitle>
            <DialogDescription>Pré-visualização do documento institucional gerado automaticamente.</DialogDescription>
          </DialogHeader>
          <DiscenteDocPreview
            discente={student}
            fotoSrc={fotoUrl}
            cursoName={cursoName}
            cursoCode={cursoCode}
            faculdadeName={facName}
            displayId={displayId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">{icon}{title}</h3>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </Card>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">{icon}</div>
        <p className="text-sm text-muted-foreground truncate">{label}</p>
      </div>
      <p className="text-sm font-semibold text-foreground text-right truncate">{value}</p>
    </div>
  );
}

function DocRow({ label, path, icon }: { label: string; path: string | null; icon: React.ReactNode }) {
  const open = async () => {
    if (!path) return;
    const { data } = await supabase.storage.from("discentes").createSignedUrl(path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };
  return (
    <div className="flex items-center justify-between px-5 py-3 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">{icon}</div>
        <p className="text-sm text-muted-foreground truncate">{label}</p>
      </div>
      {path ? (
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={open}>
          <FileText className="w-3 h-3" /> Abrir
        </Button>
      ) : (
        <span className="text-xs text-muted-foreground italic">Não anexado</span>
      )}
    </div>
  );
}

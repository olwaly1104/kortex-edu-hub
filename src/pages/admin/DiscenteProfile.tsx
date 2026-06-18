import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft, Mail, MessageCircle, BookOpen, Award, Users, Phone, MapPin,
  UserCheck, Calendar, GraduationCap, CheckCircle, Wallet, FileText,
  CreditCard, AlertCircle, Hash, Building2, IdCard, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useEstudantes, useCursos, useFaculdades } from "@/lib/useInstitution";

const fmtAOA = (n: number) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "AOA", maximumFractionDigits: 0 }).format(n);

const financeStateMap = {
  regularizado: { label: "Regularizado", cls: "bg-accent/15 text-accent border-accent/30" },
  atencao: { label: "Atenção", cls: "bg-muted text-muted-foreground border-border" },
  por_regularizar: { label: "Por Regularizar", cls: "bg-destructive/15 text-destructive border-destructive/30" },
} as const;

function getFinanceiro(id: string, name: string) {
  const seed = (id.charCodeAt(id.length - 1) || 0) % 4;
  const propinaMensal = 45000;
  const mesesPagos = 8 + (seed % 3);
  const mesesTotal = 10;
  const emDivida = mesesTotal - mesesPagos;
  const valorDivida = emDivida * propinaMensal;
  const estado: keyof typeof financeStateMap =
    emDivida === 0 ? "regularizado" : emDivida >= 2 ? "por_regularizar" : "atencao";
  return {
    matricula: `MAT-${id.slice(0, 8).toUpperCase()}-2024`,
    plano: "Mensal · Ano Letivo 2024/25",
    propinaMensal,
    mesesPagos,
    mesesTotal,
    emDivida,
    valorDivida,
    valorPago: mesesPagos * propinaMensal,
    proximaFatura: { mes: "Junho 2026", valor: propinaMensal, venc: "05/06/2026" },
    ultimoPagamento: { mes: "Maio 2026", valor: propinaMensal, data: "03/05/2026", metodo: "Transferência" },
    estado,
    titular: name,
    iban: "AO06 0040 0000 1234 5678 9012 3",
  };
}

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
  const { data: rows = [], isLoading } = useEstudantes();
  const { data: cursos = [] } = useCursos();
  const { data: faculdades = [] } = useFaculdades();

  const student = useMemo(() => rows.find((r: any) => r.id === discenteId) as any, [rows, discenteId]);
  const curso = useMemo(() => cursos.find((c: any) => c.id === student?.curso_id) as any, [cursos, student]);
  const faculdade = useMemo(() => faculdades.find((f: any) => f.id === curso?.faculdade_id) as any, [faculdades, curso]);

  const fin = useMemo(() => student ? getFinanceiro(student.id, student.nome) : null, [student]);
  const fotoUrl = useSignedUrl(student?.foto_url || null);

  if (isLoading) {
    return (
      <div className="p-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> A carregar perfil…
      </div>
    );
  }

  if (!student || !fin) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <p className="text-muted-foreground text-center py-12">Discente não encontrado.</p>
      </div>
    );
  }

  const fs = financeStateMap[fin.estado];
  const finPct = Math.round((fin.mesesPagos / fin.mesesTotal) * 100);
  const cursoName = curso?.name || curso?.nome || "—";
  const cursoCode = curso?.code || curso?.codigo || "";
  const facName = faculdade?.sigla || faculdade?.name || "—";

  const initials = (student.nome || "?")
    .split(/\s+/).filter(Boolean).slice(0, 2).map((p: string) => p[0]?.toUpperCase()).join("");

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      {/* Identity header */}
      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[1.6fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-border">
          <div className="p-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-full bg-muted overflow-hidden shrink-0 ring-2 ring-border flex items-center justify-center text-xl font-semibold text-muted-foreground">
                {fotoUrl ? <img src={fotoUrl} alt={student.nome} className="w-full h-full object-cover" /> : initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">Perfil do Discente</p>
                <h1 className="text-2xl font-bold text-foreground leading-tight mt-1">{student.nome}</h1>
                <p className="text-xs text-muted-foreground mt-1.5">
                  <Link to="/admin/faculdades-cursos" className="hover:text-foreground transition-colors">
                    {cursoCode ? `${cursoCode} · ` : ""}{cursoName}
                  </Link>
                  <span className="mx-1.5 text-muted-foreground/40">·</span>
                  {student.ano}º Ano · Turma {student.turma}
                </p>
                <div className="flex items-center gap-2 mt-4">
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
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Ano · Turma</p>
              <p className="text-2xl font-bold tabular-nums mt-1">{student.ano}<span className="text-sm text-muted-foreground font-normal">º · {student.turma}</span></p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Estado</p>
              <div className="mt-1.5">
                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-accent/10 text-accent border-accent/30">Activo</Badge>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Situação Financeira</p>
              <div className="mt-1.5">
                <Badge variant="outline" className={cn("text-xs px-2 py-0.5", fs.cls)}>
                  <Wallet className="w-3 h-3 mr-1" /> {fs.label}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="overview" className="text-xs">Visão Geral</TabsTrigger>
          <TabsTrigger value="documentos" className="text-xs">Documentos</TabsTrigger>
          <TabsTrigger value="financeiro" className="text-xs">Financeiro</TabsTrigger>
        </TabsList>

        {/* === Visão Geral === */}
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
              <InfoRow label="Nº de Matrícula" value={fin.matricula} icon={<Hash className="w-4 h-4 text-primary" />} />
            </SectionCard>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <SectionCard title="Encarregado de Educação" icon={<UserCheck className="w-4 h-4" />}>
              <InfoRow label="Nome" value={student.enc_nome || "—"} icon={<UserCheck className="w-4 h-4 text-primary" />} />
              <InfoRow label="Parentesco" value={student.enc_parentesco || "—"} icon={<Users className="w-4 h-4 text-primary" />} />
              <InfoRow label="Contacto telefónico" value={student.enc_telefone || "—"} icon={<Phone className="w-4 h-4 text-primary" />} />
            </SectionCard>

            <SectionCard title="Localização" icon={<MapPin className="w-4 h-4" />}>
              <InfoRow label="Província" value={student.provincia || "—"} icon={<MapPin className="w-4 h-4 text-primary" />} />
              <InfoRow label="Município" value={student.municipio || "—"} icon={<MapPin className="w-4 h-4 text-primary" />} />
              <InfoRow label="Endereço" value={student.endereco || "—"} icon={<Building2 className="w-4 h-4 text-primary" />} />
            </SectionCard>
          </div>

          {/* Estado Financeiro destaque */}
          <Card className="overflow-hidden p-0">
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" /> Estado Financeiro
              </h3>
              <Badge variant="outline" className={cn("text-[10px]", fs.cls)}>{fs.label}</Badge>
            </div>
            <div className="grid sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <FinKpi label="Valor Pago" value={fmtAOA(fin.valorPago)} sub={`${fin.mesesPagos}/${fin.mesesTotal} meses`} tone="accent" />
              <FinKpi label="Por Regularizar" value={fmtAOA(fin.valorDivida)} sub={fin.emDivida > 0 ? `${fin.emDivida} meses pendentes` : "Tudo em dia"} tone={fin.valorDivida > 0 ? "destructive" : "neutral"} />
              <FinKpi label="Propina Mensal" value={fmtAOA(fin.propinaMensal)} sub={fin.plano} tone="neutral" />
              <FinKpi label="Próxima Fatura" value={fmtAOA(fin.proximaFatura.valor)} sub={`Vence ${fin.proximaFatura.venc}`} tone="neutral" />
            </div>
            <div className="px-4 py-3 border-t border-border bg-muted/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Plano de Pagamentos · Ano Letivo</span>
                <span className="text-xs font-semibold text-foreground tabular-nums">{finPct}% concluído</span>
              </div>
              <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full", fin.estado === "por_regularizar" ? "bg-destructive" : fin.estado === "atencao" ? "bg-muted-foreground/60" : "bg-accent")} style={{ width: `${finPct}%` }} />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* === Documentos === */}
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

        {/* === Financeiro === */}
        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
            <Card className="overflow-hidden p-0">
              <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" /> Resumo Financeiro
                </h3>
                <Badge variant="outline" className={cn("text-[10px]", fs.cls)}>{fs.label}</Badge>
              </div>
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
                <FinKpi label="Valor Pago" value={fmtAOA(fin.valorPago)} sub={`${fin.mesesPagos}/${fin.mesesTotal} meses`} tone="accent" />
                <FinKpi label="Por Regularizar" value={fmtAOA(fin.valorDivida)} sub={fin.emDivida > 0 ? `${fin.emDivida} meses` : "Em dia"} tone={fin.valorDivida > 0 ? "destructive" : "neutral"} />
              </div>
              <div className="px-4 py-3 border-t border-border bg-muted/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Plano de Pagamentos</span>
                  <span className="text-xs font-semibold text-foreground tabular-nums">{finPct}%</span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full", fin.estado === "por_regularizar" ? "bg-destructive" : fin.estado === "atencao" ? "bg-muted-foreground/60" : "bg-accent")} style={{ width: `${finPct}%` }} />
                </div>
              </div>
            </Card>

            <SectionCard title="Dados do Plano" icon={<CreditCard className="w-4 h-4" />}>
              <InfoRow label="Matrícula" value={fin.matricula} icon={<Hash className="w-4 h-4 text-primary" />} />
              <InfoRow label="Plano" value={fin.plano} icon={<Calendar className="w-4 h-4 text-primary" />} />
              <InfoRow label="Propina Mensal" value={fmtAOA(fin.propinaMensal)} icon={<Wallet className="w-4 h-4 text-primary" />} />
              <InfoRow label="Titular" value={fin.titular} icon={<UserCheck className="w-4 h-4 text-primary" />} />
              <InfoRow label="IBAN Conta" value={fin.iban} icon={<CreditCard className="w-4 h-4 text-primary" />} />
            </SectionCard>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <SectionCard title="Próxima Fatura" icon={<AlertCircle className="w-4 h-4" />}>
              <InfoRow label="Referência" value={fin.proximaFatura.mes} icon={<Calendar className="w-4 h-4 text-primary" />} />
              <InfoRow label="Valor" value={fmtAOA(fin.proximaFatura.valor)} icon={<Wallet className="w-4 h-4 text-primary" />} />
              <InfoRow label="Data de Vencimento" value={fin.proximaFatura.venc} icon={<Calendar className="w-4 h-4 text-primary" />} />
            </SectionCard>

            <SectionCard title="Último Pagamento" icon={<CheckCircle className="w-4 h-4" />}>
              <InfoRow label="Referência" value={fin.ultimoPagamento.mes} icon={<Calendar className="w-4 h-4 text-primary" />} />
              <InfoRow label="Valor" value={fmtAOA(fin.ultimoPagamento.valor)} icon={<Wallet className="w-4 h-4 text-primary" />} />
              <InfoRow label="Data de Pagamento" value={fin.ultimoPagamento.data} icon={<Calendar className="w-4 h-4 text-primary" />} />
              <InfoRow label="Método" value={fin.ultimoPagamento.metodo} icon={<CreditCard className="w-4 h-4 text-primary" />} />
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
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

function FinKpi({ label, value, sub, tone }: { label: string; value: string | number; sub?: string; tone: "accent" | "destructive" | "neutral" }) {
  const cls = tone === "accent" ? "text-accent" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="p-4">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className={cn("text-xl font-bold tabular-nums mt-1.5", cls)}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
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

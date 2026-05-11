import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { inscricoesRecent } from "@/data/inscricoesData";
import {
  ArrowLeft, User, MapPin, ShieldCheck, BookOpen, FileText,
  Phone, Mail, Calendar, IdCard, Eye, CheckCircle2, XCircle, FileSearch, Share2, Award,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-3 text-[12.5px] py-1.5 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium text-right truncate">{value || "—"}</span>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
      </div>
      <div className="px-4 py-2">{children}</div>
    </Card>
  );
}

export default function CandidatoDetail() {
  const { ref } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const c = inscricoesRecent.find(x => x.ref === ref);

  if (!c) {
    return (
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        <Button variant="ghost" onClick={() => navigate("/inscricoes")} className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <p className="text-muted-foreground text-center py-12 text-sm">Candidato não encontrado.</p>
      </div>
    );
  }

  const docsEntregues = c.documentos.filter(d => d.entregue).length;
  const initials = c.nome.split(" ").map(n => n[0]).slice(0, 2).join("");
  const aprovado = c.notaSessao !== undefined && c.notaSessao >= 10;
  const estadoCls =
    c.estado === "Aprovada"  ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    c.estado === "Reprovada" ? "bg-red-50 text-red-700 border-red-200" :
    c.estado === "Em análise"? "bg-amber-50 text-amber-700 border-amber-200" :
                               "bg-blue-50 text-blue-700 border-blue-200";

  const partilhar = async () => {
    const url = `${window.location.origin}/inscricoes/candidato/${c.ref}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Candidato ${c.ref}`, text: c.nome, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copiado", description: "Ligação para o candidato copiada." });
      }
    } catch { /* noop */ }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-6">
      {/* Back */}
      <Button variant="ghost" onClick={() => navigate("/inscricoes")} className="gap-2 -ml-2 h-8 text-[12px]">
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao painel
      </Button>

      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{c.nome}</h1>
              <p className="text-[12px] text-muted-foreground font-mono mt-0.5">{c.ref}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1"><IdCard className="w-3.5 h-3.5" /> {c.bi}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {c.telemovel}</span>
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {c.email}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className={`border ${estadoCls}`}>{c.estado}</Badge>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-8 text-[12px] gap-1.5" onClick={partilhar}>
                <Share2 className="w-3.5 h-3.5" /> Partilhar
              </Button>
              <Button
                size="sm"
                className="h-8 text-[12px] gap-1.5"
                onClick={() => navigate(`/inscricoes/candidato/${c.ref}/documento`)}
              >
                <FileSearch className="w-3.5 h-3.5" /> Ver documento
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t">
          <div>
            <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground font-medium">Curso (1ª opção)</p>
            <p className="text-[13px] font-semibold text-foreground mt-1">{c.curso}</p>
          </div>
          <div>
            <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground font-medium">Faculdade</p>
            <p className="text-[13px] font-semibold text-foreground mt-1">{c.faculdade}</p>
          </div>
          <div>
            <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground font-medium">Sessão</p>
            <p className="text-[13px] font-semibold text-foreground mt-1">{c.sessao}</p>
            {c.dataProva && (
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {new Date(c.dataProva).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            )}
          </div>
          <div>
            <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground font-medium">Submetida em</p>
            <p className="text-[13px] font-semibold text-foreground mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {c.data}
            </p>
          </div>
          <div>
            <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1">
              <Award className="w-3 h-3" /> Nota da Sessão
            </p>
            {c.notaSessao !== undefined ? (
              <p className={`text-[15px] font-bold mt-1 tabular-nums ${aprovado ? "text-emerald-700" : "text-red-700"}`}>
                {c.notaSessao.toFixed(1)}<span className="text-[11px] text-muted-foreground font-medium"> / 20</span>
              </p>
            ) : (
              <p className="text-[12px] text-muted-foreground/60 italic mt-1.5">Por realizar</p>
            )}
          </div>
        </div>
      </Card>

      {/* Two-column data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section icon={User} title="Dados Pessoais">
          <Row label="Nome completo" value={c.nome} />
          <Row label="Bilhete de Identidade" value={c.bi} />
          <Row label="Data de nascimento" value={c.nascimento} />
          <Row label="Género" value={c.genero} />
          <Row label="Naturalidade" value={c.naturalidade} />
          <Row label="Nacionalidade" value={c.nacionalidade} />
        </Section>

        <Section icon={MapPin} title="Contactos & Morada">
          <Row label="Email" value={c.email} />
          <Row label="Telemóvel" value={c.telemovel} />
          <Row label="Província" value={c.provincia} />
          <Row label="Município" value={c.municipio} />
          <Row label="Endereço" value={c.endereco} />
        </Section>

        <Section icon={ShieldCheck} title="Encarregado de Educação">
          <Row label="Nome" value={c.encNome} />
          <Row label="BI" value={c.encBi} />
          <Row label="Parentesco" value={c.encParentesco} />
          <Row label="Telefone" value={c.encTelefone} />
          <Row label="Email" value={c.encEmail} />
        </Section>

        <Section icon={BookOpen} title="Curso & Sessão">
          <Row label="Faculdade" value={c.faculdade} />
          <Row label="1ª opção" value={c.curso} />
          <Row label="2ª opção" value={c.curso2} />
          <Row label="Sessão de prova" value={c.sessao} />
          <Row label="Preparatório" value={c.preparatorio ? "Sim" : "Não"} />
          <Row label="Data da prova" value={c.dataProva} />
          <Row label="Nota obtida" value={c.notaSessao !== undefined ? `${c.notaSessao.toFixed(1)} / 20` : undefined} />
        </Section>

        <Section icon={FileText} title={`Documentos (${docsEntregues}/${c.documentos.length})`}>
          <div className="divide-y divide-border/40">
            {c.documentos.map(d => (
              <div key={d.key} className="flex items-center justify-between py-2 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {d.entregue
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    : <XCircle className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-[12.5px] text-foreground truncate">{d.label}</p>
                    {d.ficheiro && <p className="text-[10.5px] text-muted-foreground truncate">{d.ficheiro}</p>}
                  </div>
                </div>
                {d.entregue
                  ? <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1"><Eye className="w-3 h-3" /> Ver</Button>
                  : <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Em falta</Badge>}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

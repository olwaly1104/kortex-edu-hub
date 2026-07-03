import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Mail, MessageCircle, Users, Phone, MapPin, UserCheck, Calendar,
  GraduationCap, FileText, Building2, IdCard, Award, BookOpen, Briefcase, Eye, Download, Pencil,
} from "lucide-react";
import { loadDocentes, saveDocentes, type DocenteRow } from "@/lib/peopleStorage";
import { useAuth } from "@/contexts/AuthContext";
import { ModuleTag } from "@/components/chat/ModuleTag";
import { DocenteFormDialog } from "@/components/admin/DocenteFormDialog";
import DocenteDocPreview from "./DocenteDocPreview";

export default function AdminDocenteProfile() {
  const { docenteId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rowsVersion, setRowsVersion] = useState(0);
  const rows = useMemo(() => loadDocentes(), [rowsVersion]);
  const docente = useMemo(() => rows.find((r) => r.id === docenteId), [rows, docenteId]);
  const [docOpen, setDocOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const canEdit = user?.role === "admin" || user?.email?.toLowerCase() === docente?.email?.toLowerCase();



  if (!docente) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <p className="text-muted-foreground text-center py-12">Docente não encontrado.</p>
      </div>
    );
  }

  const fullName = `${docente.prefixo || ""} ${docente.primeiroNome} ${docente.ultimoNome}`.trim();
  const initials = `${docente.primeiroNome?.[0] || ""}${docente.ultimoNome?.[0] || ""}`.toUpperCase();
  const displayId = `DOC-${(docente.id || "00000000").slice(0, 8).toUpperCase()}`;
  const genero = docente.genero === "M" ? "Masculino" : docente.genero === "F" ? "Feminino" : (docente.genero || "—");

  const isCoordenador =
    /coordenador/i.test(docente.cargo || "") ||
    /coordenador/i.test(docente.moduloKortex || "") ||
    /coordenador/i.test((docente as any).categoria || "");

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        {canEdit && (
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} className="gap-1.5 h-8">
            <Pencil className="w-3.5 h-3.5" /> Editar
          </Button>
        )}
      </div>

      {/* Identity header */}
      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[1.6fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-border">
          <div className="p-6 relative">
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
                {docente.fotoDataUrl ? <img src={docente.fotoDataUrl} alt={fullName} className="w-full h-full object-cover" /> : initials || <UserCheck className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">Perfil do Docente</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                    <GraduationCap className="w-3 h-3 mr-1" /> Docente
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-foreground leading-tight mt-1.5">{fullName}</h1>
                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                  {docente.faculdade && (
                    <Link to="/admin/faculdades-cursos" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold border border-primary/20 hover:bg-primary/15 transition-colors">
                      <Building2 className="w-3 h-3" /> {docente.faculdade}
                    </Link>
                  )}
                  {docente.departamento && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                      <Briefcase className="w-3 h-3" /> {docente.departamento}
                    </span>
                  )}
                  {docente.curso && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                      <BookOpen className="w-3 h-3" /> {docente.curso}
                    </span>
                  )}
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
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Módulo Kortex</p>
              <div className="mt-1.5"><ModuleTag modulo={docente.moduloKortex} /></div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Contrato</p>
              <p className="text-sm font-semibold mt-1.5">{docente.contrato || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Estado</p>
              <div className="mt-1.5">
                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">Ativo</Badge>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Minha Presença</p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: "94%" }} />
                </div>
                <span className="text-xs font-semibold tabular-nums text-emerald-700">94%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="overview" className="text-xs">Visão Geral</TabsTrigger>
          <TabsTrigger value="academica" className="text-xs">Formação</TabsTrigger>
          <TabsTrigger value="documentos" className="text-xs">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <SectionCard title="Informações Pessoais" icon={<UserCheck className="w-4 h-4" />}>
              <InfoRow label="Email institucional" value={docente.email || "—"} icon={<Mail className="w-4 h-4 text-primary" />} />
              <InfoRow label="Telemóvel" value={docente.contacto || "—"} icon={<Phone className="w-4 h-4 text-primary" />} />
              <InfoRow label="Data de Nascimento" value={docente.nascimento || "—"} icon={<Calendar className="w-4 h-4 text-primary" />} />
              <InfoRow label="Género" value={genero} icon={<UserCheck className="w-4 h-4 text-primary" />} />
              <InfoRow label="Nº Bilhete de Identidade" value={docente.bilhete || "—"} icon={<IdCard className="w-4 h-4 text-primary" />} />
              <InfoRow label="Província" value={docente.provincia || "—"} icon={<MapPin className="w-4 h-4 text-primary" />} />
              <InfoRow label="Município" value={docente.municipio || "—"} icon={<MapPin className="w-4 h-4 text-primary" />} />
              <InfoRow label="Endereço" value={docente.endereco || "—"} icon={<Building2 className="w-4 h-4 text-primary" />} />
            </SectionCard>

            <SectionCard title="Afiliação Institucional" icon={<GraduationCap className="w-4 h-4" />}>
              <InfoRow label="Faculdade" value={docente.faculdade || "—"} icon={<Building2 className="w-4 h-4 text-primary" />} />
              <InfoRow label="Curso" value={docente.curso || "—"} icon={<BookOpen className="w-4 h-4 text-primary" />} />
              <InfoRow label="Departamento" value={docente.departamento || "—"} icon={<Briefcase className="w-4 h-4 text-primary" />} />
              <InfoRow label="Cargo" value={docente.cargo || "—"} icon={<Users className="w-4 h-4 text-primary" />} />
              <InfoRow label="Contrato" value={docente.contrato || "—"} icon={<FileText className="w-4 h-4 text-primary" />} />
              <InfoRow label="ID do Docente" value={docente.id} icon={<IdCard className="w-4 h-4 text-primary" />} />
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="academica" className="space-y-4">
          <SectionCard title="Formação Académica" icon={<BookOpen className="w-4 h-4" />}>
            <InfoRow label="Grau máximo" value={docente.grau || "—"} icon={<Award className="w-4 h-4 text-primary" />} />
            <InfoRow label="Curso" value={docente.especialidade || "—"} icon={<BookOpen className="w-4 h-4 text-primary" />} />
            <InfoRow label="Instituição de formação" value={docente.instituicaoFormacao || "—"} icon={<Building2 className="w-4 h-4 text-primary" />} />
            <InfoRow label="Anos de docência" value={docente.anosExperiencia ? `${docente.anosExperiencia} anos` : "—"} icon={<Calendar className="w-4 h-4 text-primary" />} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4">
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Documentação Anexa
              </h3>
            </div>
            <div className="divide-y divide-border">
              <DocFileRow label="Bilhete de Identidade" fileName={docente.bilheteFileName} icon={<IdCard className="w-4 h-4 text-primary" />} />
              <DocFileRow label="Curriculum Vitae (CV)" fileName={docente.cvFileName} icon={<FileText className="w-4 h-4 text-primary" />} />
              <DocFileRow label={docente.grau ? `Diploma de ${docente.grau}` : "Diploma académico"} fileName={docente.diplomaFileName} icon={<Award className="w-4 h-4 text-primary" />} />
              <DocFileRow label="Fotografia" fileName={docente.fotoDataUrl ? "foto.jpg" : ""} icon={<UserCheck className="w-4 h-4 text-primary" />} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={docOpen} onOpenChange={setDocOpen}>
        <DialogContent className="max-w-5xl p-0 h-[92vh] overflow-hidden">
          <DialogTitle className="sr-only">Perfil do Docente — {fullName}</DialogTitle>
          <DocenteDocPreview docente={docente} displayId={displayId} />
        </DialogContent>
      </Dialog>

      {canEdit && (
        <DocenteFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          initial={docente}
          onSave={(updated: DocenteRow) => {
            const all = loadDocentes();
            const next = all.map((r) => (r.id === docente.id ? { ...updated, id: docente.id } : r));
            saveDocentes(next);
            setEditOpen(false);
            setRowsVersion((v) => v + 1);
          }}
        />
      )}
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

function DocFileRow({ label, fileName, icon }: { label: string; fileName?: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">{icon}</div>
        <p className="text-sm text-muted-foreground truncate">{label}</p>
      </div>
      {fileName ? (
        <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5 truncate max-w-[200px]">{fileName}</span>
      ) : (
        <span className="text-xs text-muted-foreground italic">Não anexado</span>
      )}
    </div>
  );
}

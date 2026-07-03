import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Mail, MessageCircle, Phone, MapPin, UserCheck, Calendar,
  FileText, Building2, IdCard, Briefcase, Eye, Download, Users,
} from "lucide-react";
import { loadStaff, type StaffRow } from "@/lib/peopleStorage";
import { ModuleTag } from "@/components/chat/ModuleTag";
import StaffDocPreview from "./StaffDocPreview";

type StaffRowExtra = StaffRow & {
  nascimento?: string;
  genero?: "M" | "F" | "Outro";
  bilhete?: string;
  bilheteFileName?: string;
  fotoDataUrl?: string;
  provincia?: string;
  municipio?: string;
  endereco?: string;
  cvFileName?: string;
};

export default function AdminStaffProfile() {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const rows = useMemo(() => loadStaff() as StaffRowExtra[], []);
  const staff = useMemo(() => rows.find((r) => r.id === staffId), [rows, staffId]);
  const [docOpen, setDocOpen] = useState(false);

  if (!staff) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <p className="text-muted-foreground text-center py-12">Staff não encontrado.</p>
      </div>
    );
  }

  const fullName = `${staff.prefixo || ""} ${staff.primeiroNome} ${staff.ultimoNome}`.trim();
  const initials = `${staff.primeiroNome?.[0] || ""}${staff.ultimoNome?.[0] || ""}`.toUpperCase();
  const displayId = `STF-${(staff.id || "00000000").slice(0, 8).toUpperCase()}`;
  const genero = staff.genero === "M" ? "Masculino" : staff.genero === "F" ? "Feminino" : (staff.genero || "—");

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
      </div>

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
                {staff.fotoDataUrl ? <img src={staff.fotoDataUrl} alt={fullName} className="w-full h-full object-cover" /> : initials || <UserCheck className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">Perfil do Staff</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                    <Users className="w-3 h-3 mr-1" /> Staff
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-foreground leading-tight mt-1.5">{fullName}</h1>
                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                  {staff.departamento && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                      <Briefcase className="w-3 h-3" /> {staff.departamento}
                    </span>
                  )}
                  {staff.funcao && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground text-[11px] font-semibold border border-border">
                      {staff.funcao}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7"><MessageCircle className="w-3.5 h-3.5" /> Chat</Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7"><Mail className="w-3.5 h-3.5" /> Email</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-6 grid grid-cols-2 gap-4 content-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Módulo Kortex</p>
              <div className="mt-1.5"><ModuleTag modulo={staff.moduloKortex} /></div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Função</p>
              <p className="text-sm font-semibold mt-1.5">{staff.funcao || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Departamento</p>
              <p className="text-sm font-semibold mt-1.5">{staff.departamento || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">ID</p>
              <p className="text-xs font-mono mt-1.5 truncate">{displayId}</p>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="overview" className="text-xs">Visão Geral</TabsTrigger>
          <TabsTrigger value="documentos" className="text-xs">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <SectionCard title="Informações Pessoais" icon={<UserCheck className="w-4 h-4" />}>
              <InfoRow label="Email institucional" value={staff.email || "—"} icon={<Mail className="w-4 h-4 text-primary" />} />
              <InfoRow label="Telemóvel" value={staff.contacto || "—"} icon={<Phone className="w-4 h-4 text-primary" />} />
              <InfoRow label="Data de Nascimento" value={staff.nascimento || "—"} icon={<Calendar className="w-4 h-4 text-primary" />} />
              <InfoRow label="Género" value={genero} icon={<UserCheck className="w-4 h-4 text-primary" />} />
              <InfoRow label="Nº Bilhete de Identidade" value={staff.bilhete || "—"} icon={<IdCard className="w-4 h-4 text-primary" />} />
              <InfoRow label="Província" value={staff.provincia || "—"} icon={<MapPin className="w-4 h-4 text-primary" />} />
              <InfoRow label="Município" value={staff.municipio || "—"} icon={<MapPin className="w-4 h-4 text-primary" />} />
              <InfoRow label="Endereço" value={staff.endereco || "—"} icon={<Building2 className="w-4 h-4 text-primary" />} />
            </SectionCard>

            <SectionCard title="Afiliação Institucional" icon={<Building2 className="w-4 h-4" />}>
              <InfoRow label="Departamento" value={staff.departamento || "—"} icon={<Briefcase className="w-4 h-4 text-primary" />} />
              <InfoRow label="Função" value={staff.funcao || "—"} icon={<UserCheck className="w-4 h-4 text-primary" />} />
              <InfoRow label="ID do Staff" value={staff.id} icon={<IdCard className="w-4 h-4 text-primary" />} />
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
              <DocFileRow label="Bilhete de Identidade" fileName={staff.bilheteFileName} icon={<IdCard className="w-4 h-4 text-primary" />} />
              <DocFileRow label="Curriculum Vitae (CV)" fileName={staff.cvFileName} icon={<FileText className="w-4 h-4 text-primary" />} />
              <DocFileRow label="Fotografia" fileName={staff.fotoDataUrl ? "foto.jpg" : ""} icon={<UserCheck className="w-4 h-4 text-primary" />} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={docOpen} onOpenChange={setDocOpen}>
        <DialogContent className="max-w-5xl p-0 h-[92vh] overflow-hidden">
          <DialogTitle className="sr-only">Perfil do Staff — {fullName}</DialogTitle>
          <StaffDocPreview staff={staff} displayId={displayId} />
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

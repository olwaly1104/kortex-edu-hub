import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { onboardingKey, profileKey, pushProfile } from "@/lib/onboardingStorage";
import {
  ShieldCheck, Building2, Mail, Phone, Globe, MapPin, Calendar, GraduationCap,
  Users, Briefcase, Settings2, Save, IdCard, Hash,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useFaculdades, useCursos } from "@/lib/useInstitution";
import { loadDocentes, loadStaff } from "@/lib/peopleStorage";

type Instituicao = {
  nomeOficial: string; sigla: string; nif: string; fundacao: string; natureza: string;
  reitor: string; promotor: string;
  email: string; telefone: string; website: string; morada: string;
  logoDataUrl?: string;
};

const EMPTY: Instituicao = {
  nomeOficial: "", sigla: "", nif: "", fundacao: "", natureza: "",
  reitor: "", promotor: "",
  email: "", telefone: "", website: "", morada: "", logoDataUrl: "",
};

function currentSiteUrl(): string {
  try {
    const { protocol, hostname } = window.location;
    // On Lovable preview hostnames like "id-preview--<uuid>.lovable.app",
    // return the corresponding published URL "<uuid>.lovable.app".
    const previewPrefix = "id-preview--";
    const published = hostname.startsWith(previewPrefix)
      ? hostname.slice(previewPrefix.length)
      : hostname;
    return `${protocol}//${published}`;
  } catch {
    return "";
  }
}


function loadInitial(email?: string | null): Instituicao {
  const PROFILE_KEY = profileKey(email);
  const STORAGE = onboardingKey(email);
  const defaultWebsite = currentSiteUrl();
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      const parsed = { ...EMPTY, ...JSON.parse(saved) };
      // Always sync website to the current published URL of this account
      parsed.website = defaultWebsite;
      return parsed;
    }
  } catch { /* ignore */ }
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) {
      const parsed = JSON.parse(raw);
      const d = parsed?.dados || {};
      return {
        ...EMPTY,
        nomeOficial: d.nome || "",
        sigla: d.sigla || "",
        nif: d.nif || "",
        natureza: d.tipo || "",
        email: d.email || "",
        telefone: d.telefone || "",
        website: defaultWebsite,
        morada: [d.endereco, d.municipio, d.provincia].filter(Boolean).join(", "),
        logoDataUrl: d.logoDataUrl || "",
      };
    }
  } catch { /* ignore */ }
  return { ...EMPTY, website: defaultWebsite };
}

export default function AdminPerfil() {
  const { user } = useAuth();
  const PROFILE_KEY = profileKey(user?.email);
  const [instituicao, setInstituicao] = useState<Instituicao>(() => loadInitial(user?.email));

  const facsQ = useFaculdades();
  const cursosQ = useCursos();
  const [peopleCounts, setPeopleCounts] = useState(() => ({
    docentes: loadDocentes().length,
    staff: loadStaff().length,
  }));
  useEffect(() => {
    const refresh = () => setPeopleCounts({ docentes: loadDocentes().length, staff: loadStaff().length });
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const site = currentSiteUrl();
    if (instituicao.website !== site) {
      setInstituicao((prev) => ({ ...prev, website: site }));
      return;
    }
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(instituicao)); } catch { /* ignore */ }
    pushProfile(user?.email, instituicao);
  }, [instituicao, PROFILE_KEY, user?.email]);

  const emailValid = /^[^\s@]+@[^\s@]+\.com$/i.test((instituicao.email || "").trim());

  const handleSave = () => {
    if (!instituicao.nomeOficial.trim()) {
      toast.error("Nome oficial é obrigatório");
      return;
    }
    if (!emailValid) {
      toast.error("Email institucional é obrigatório e deve terminar em .com");
      return;
    }
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(instituicao)); } catch { /* ignore */ }
    pushProfile(user?.email, instituicao);
    toast.success("Dados da instituição atualizados");
  };

  const stats = [
    { label: "Faculdades", value: facsQ.data?.length ?? 0, icon: Building2 },
    { label: "Cursos", value: cursosQ.data?.length ?? 0, icon: GraduationCap },
    { label: "Docentes", value: peopleCounts.docentes, icon: Users },
    { label: "Staff", value: peopleCounts.staff, icon: Briefcase },
  ];

  const nomeDisplay = instituicao.nomeOficial || "Instituição sem nome";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header institucional */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="w-20 h-20 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              {instituicao.logoDataUrl ? (
                <img src={instituicao.logoDataUrl} alt="Logo" className="w-full h-full object-contain bg-white" />
              ) : (
                <ShieldCheck className="w-10 h-10" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Badge variant="outline" className="mb-2 gap-1 text-[10px]"><Settings2 className="w-3 h-3" /> Administração da plataforma</Badge>
              <h1 className="text-2xl font-bold leading-tight">{nomeDisplay}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Perfil institucional · Conta de {user?.name || "Administrador"} — controla toda a configuração do portal da instituição.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                {instituicao.sigla && <span className="inline-flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> {instituicao.sigla}</span>}
                {instituicao.nif && <span className="inline-flex items-center gap-1.5"><IdCard className="w-3.5 h-3.5" /> NIF {instituicao.nif}</span>}
                {instituicao.fundacao && <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Desde {instituicao.fundacao}</span>}
                {instituicao.natureza && <span className="inline-flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {instituicao.natureza}</span>}
              </div>
            </div>
            <Button onClick={handleSave} size="sm" className="gap-1.5"><Save className="w-3.5 h-3.5" /> Guardar alterações</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0">
          {stats.map(s => {
            const I = s.icon;
            return (
              <div key={s.label} className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted text-foreground flex items-center justify-center">
                  <I className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold leading-none mt-0.5">{s.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Identificação institucional */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Identificação Institucional</h2>
        </div>
        <Separator />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome oficial</Label>
            <Input value={instituicao.nomeOficial} onChange={e => setInstituicao({ ...instituicao, nomeOficial: e.target.value })} className="h-9" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Sigla</Label>
              <Input value={instituicao.sigla} onChange={e => setInstituicao({ ...instituicao, sigla: e.target.value })} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">NIF</Label>
              <Input value={instituicao.nif} onChange={e => setInstituicao({ ...instituicao, nif: e.target.value })} className="h-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Ano de fundação</Label>
            <Input value={instituicao.fundacao} onChange={e => setInstituicao({ ...instituicao, fundacao: e.target.value })} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Natureza</Label>
            <Input value={instituicao.natureza} onChange={e => setInstituicao({ ...instituicao, natureza: e.target.value })} className="h-9" />
          </div>
        </div>
      </Card>

      {/* Liderança */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Liderança</h2>
        </div>
        <Separator />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Reitor</Label>
            <Input value={instituicao.reitor} onChange={e => setInstituicao({ ...instituicao, reitor: e.target.value })} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Presidente do Conselho de Administração</Label>
            <Input value={instituicao.presidenteCA} onChange={e => setInstituicao({ ...instituicao, presidenteCA: e.target.value })} className="h-9" />
          </div>
        </div>
      </Card>

      {/* Contactos */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Contactos</h2>
        </div>
        <Separator />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email institucional *</Label>
            <Input
              type="email"
              value={instituicao.email}
              onChange={e => setInstituicao({ ...instituicao, email: e.target.value })}
              placeholder="contacto@instituicao.com"
              className={`h-9 ${instituicao.email && !emailValid ? "border-destructive" : ""}`}
            />
            {instituicao.email && !emailValid && (
              <p className="text-[10px] text-destructive">Deve ser um email válido terminado em .com</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5"><Phone className="w-3 h-3" /> Telefone</Label>
            <Input value={instituicao.telefone} onChange={e => setInstituicao({ ...instituicao, telefone: e.target.value })} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5"><Globe className="w-3 h-3" /> Website</Label>
            <Input
              value={currentSiteUrl()}
              readOnly
              className="h-9 bg-muted/40 cursor-not-allowed"
              title="Ligado automaticamente ao site publicado desta conta"
            />
            <p className="text-[10px] text-muted-foreground">Ligado automaticamente ao site publicado desta conta.</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Morada</Label>
            <Input value={instituicao.morada} onChange={e => setInstituicao({ ...instituicao, morada: e.target.value })} className="h-9" />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-1.5"><Save className="w-4 h-4" /> Guardar alterações</Button>
      </div>
    </div>
  );
}

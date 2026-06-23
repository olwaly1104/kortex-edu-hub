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
  Users, Briefcase, Settings2, Save, IdCard, Hash, Pencil, X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useFaculdades, useCursos } from "@/lib/useInstitution";
import { loadDocentes, loadStaff } from "@/lib/peopleStorage";
import { supabase } from "@/integrations/supabase/client";

type Instituicao = {
  nomeLegal: string; nomeOficial: string; sigla: string; nif: string; fundacao: string; natureza: string;
  reitor: string; promotor: string;
  email: string; telefone: string; website: string; morada: string;
  logoDataUrl?: string;
};

const EMPTY: Instituicao = {
  nomeLegal: "", nomeOficial: "", sigla: "", nif: "", fundacao: "", natureza: "",
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


function readOnboardingDados(email?: string | null): any {
  try {
    const raw = localStorage.getItem(onboardingKey(email));
    if (!raw) return {};
    return JSON.parse(raw)?.dados || {};
  } catch { return {}; }
}

function loadInitial(email?: string | null): Instituicao {
  const PROFILE_KEY = profileKey(email);
  const defaultWebsite = currentSiteUrl();
  const onb = readOnboardingDados(email);
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      const parsed = { ...EMPTY, ...JSON.parse(saved) };
      parsed.website = defaultWebsite;
      // Backfill from onboarding when profile fields are still empty
      if (!parsed.logoDataUrl && onb.logoDataUrl) parsed.logoDataUrl = onb.logoDataUrl;
      if (!parsed.nif && onb.nif) parsed.nif = onb.nif;
      if (!parsed.sigla && onb.sigla) parsed.sigla = onb.sigla;
      if (!parsed.nomeLegal && onb.nomeLegal) parsed.nomeLegal = onb.nomeLegal;
      if (!parsed.nomeOficial && onb.nome) parsed.nomeOficial = onb.nome;
      return parsed;
    }
  } catch { /* ignore */ }
  return {
    ...EMPTY,
    nomeLegal: onb.nomeLegal || "",
    nomeOficial: onb.nome || "",
    sigla: onb.sigla || "",
    nif: onb.nif || "",
    natureza: onb.tipo || "",
    email: onb.email || "",
    telefone: onb.telefone || "",
    website: defaultWebsite,
    morada: [onb.endereco, onb.municipio, onb.provincia].filter(Boolean).join(", "),
    logoDataUrl: onb.logoDataUrl || "",
  };
}

export default function AdminPerfil() {
  const { user } = useAuth();
  const PROFILE_KEY = profileKey(user?.email);
  const [instituicao, setInstituicao] = useState<Instituicao>(() => loadInitial(user?.email));
  const [editing, setEditing] = useState(false);
  const [snapshot, setSnapshot] = useState<Instituicao | null>(null);

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

  // Hydrate Nome Legal / NIF from the real database, and backfill the DB
  // from local values when they exist there but not yet in the database.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.rpc("get_institution_fiscal");
        const row = Array.isArray(data) ? data[0] : data;
        const dbNome = row?.nome_legal ?? "";
        const dbNif = row?.nif ?? "";
        // If DB is empty but we have local values, push them up so all
        // institution modules (Finanças, etc.) see the same data.
        const localNome = (instituicao.nomeLegal || "").trim();
        const localNif = (instituicao.nif || "").trim();
        const needsBackfill = (!dbNome && localNome) || (!dbNif && localNif);
        if (needsBackfill) {
          const { data: auth } = await supabase.auth.getUser();
          const uid = auth?.user?.id;
          if (uid) {
            await supabase.from("profiles").update({
              nome_legal: localNome || dbNome || null,
              nif: localNif || dbNif || null,
            }).eq("id", uid);
          }
        }
        setInstituicao((prev) => ({
          ...prev,
          nomeLegal: dbNome || prev.nomeLegal,
          nif: dbNif || prev.nif,
        }));
      } catch { /* ignore */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const emailValid = /^[^\s@]+@[^\s@]+\.com$/i.test((instituicao.email || "").trim());
  const locked = !editing;

  const handleEdit = () => {
    setSnapshot(instituicao);
    setEditing(true);
  };
  const handleCancel = () => {
    if (snapshot) setInstituicao(snapshot);
    setSnapshot(null);
    setEditing(false);
  };
  const handleSave = async () => {
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
    // Persist fiscal identifiers (Nome Legal & NIF) into the real database
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (uid) {
        await supabase
          .from("profiles")
          .update({ nome_legal: instituicao.nomeLegal || null, nif: instituicao.nif || null })
          .eq("id", uid);
      }
    } catch { /* ignore */ }
    setSnapshot(null);
    setEditing(false);
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
            <label className={`w-20 h-20 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm overflow-hidden group relative ${locked ? "cursor-not-allowed" : "cursor-pointer"}`} title={locked ? "Clique em Editar para alterar o logo" : "Carregar / substituir logo"}>
              {instituicao.logoDataUrl ? (
                <img src={instituicao.logoDataUrl} alt="Logo" className="w-full h-full object-contain bg-white" />
              ) : (
                <ShieldCheck className="w-10 h-10" />
              )}
              {!locked && (
                <span className="absolute inset-0 bg-black/40 text-white text-[10px] uppercase tracking-wide font-semibold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">Substituir</span>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={locked}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const dataUrl = String(reader.result || "");
                    setInstituicao((prev) => ({ ...prev, logoDataUrl: dataUrl }));
                    toast.success("Logo atualizado");
                  };
                  reader.readAsDataURL(f);
                }}
              />
            </label>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Identificação Institucional</h2>
          </div>
          {locked ? (
            <Button onClick={handleEdit} size="sm" variant="outline" className="gap-1.5"><Pencil className="w-3.5 h-3.5" /> Editar</Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button onClick={handleCancel} size="sm" variant="outline" className="gap-1.5"><X className="w-3.5 h-3.5" /> Cancelar</Button>
              <Button onClick={handleSave} size="sm" className="gap-1.5"><Save className="w-3.5 h-3.5" /> Guardar</Button>
            </div>
          )}
        </div>
        <Separator />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome legal</Label>
            <Input
              value={instituicao.nomeLegal}
              onChange={e => setInstituicao({ ...instituicao, nomeLegal: e.target.value })}
              onBlur={() => { (supabase.rpc as any)("set_institution_fiscal", { _nome_legal: instituicao.nomeLegal || "", _nif: instituicao.nif || "" }); }}
              className={`h-9 ${locked ? "bg-muted/40 cursor-not-allowed" : ""}`}
              readOnly={locked}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">NIF</Label>
            <Input
              value={instituicao.nif}
              onChange={e => setInstituicao({ ...instituicao, nif: e.target.value })}
              onBlur={() => { (supabase.rpc as any)("set_institution_fiscal", { _nome_legal: instituicao.nomeLegal || "", _nif: instituicao.nif || "" }); }}
              className={`h-9 ${locked ? "bg-muted/40 cursor-not-allowed" : ""}`}
              readOnly={locked}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Nome da instituição</Label>
            <Input value={instituicao.nomeOficial} onChange={e => setInstituicao({ ...instituicao, nomeOficial: e.target.value })} className={`h-9 ${locked ? "bg-muted/40 cursor-not-allowed" : ""}`} readOnly={locked} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Sigla</Label>
            <Input value={instituicao.sigla} onChange={e => setInstituicao({ ...instituicao, sigla: e.target.value })} className={`h-9 ${locked ? "bg-muted/40 cursor-not-allowed" : ""}`} readOnly={locked} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Ano de fundação</Label>
            <Input value={instituicao.fundacao} onChange={e => setInstituicao({ ...instituicao, fundacao: e.target.value })} className={`h-9 ${locked ? "bg-muted/40 cursor-not-allowed" : ""}`} readOnly={locked} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Natureza</Label>
            <Input value={instituicao.natureza} onChange={e => setInstituicao({ ...instituicao, natureza: e.target.value })} className={`h-9 ${locked ? "bg-muted/40 cursor-not-allowed" : ""}`} readOnly={locked} />
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
              readOnly={locked}
              className={`h-9 ${instituicao.email && !emailValid ? "border-destructive" : ""} ${locked ? "bg-muted/40 cursor-not-allowed" : ""}`}
            />
            {instituicao.email && !emailValid && (
              <p className="text-[10px] text-destructive">Deve ser um email válido terminado em .com</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5"><Phone className="w-3 h-3" /> Telefone</Label>
            <Input value={instituicao.telefone} onChange={e => setInstituicao({ ...instituicao, telefone: e.target.value })} className={`h-9 ${locked ? "bg-muted/40 cursor-not-allowed" : ""}`} readOnly={locked} />
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
            <Input value={instituicao.morada} onChange={e => setInstituicao({ ...instituicao, morada: e.target.value })} className={`h-9 ${locked ? "bg-muted/40 cursor-not-allowed" : ""}`} readOnly={locked} />
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
            <Input value={instituicao.reitor} onChange={e => setInstituicao({ ...instituicao, reitor: e.target.value })} className={`h-9 ${locked ? "bg-muted/40 cursor-not-allowed" : ""}`} readOnly={locked} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Promotor</Label>
            <Input value={instituicao.promotor} onChange={e => setInstituicao({ ...instituicao, promotor: e.target.value })} className={`h-9 ${locked ? "bg-muted/40 cursor-not-allowed" : ""}`} readOnly={locked} />
          </div>
        </div>
      </Card>

    </div>
  );
}

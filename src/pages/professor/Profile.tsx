import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen,
  GraduationCap, Building2, UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type DocenteRow = {
  prefixo: string | null; primeiro_nome: string; ultimo_nome: string;
  email: string | null; contacto: string | null; endereco: string | null;
  nascimento: string | null; departamento: string | null; faculdade: string | null;
  especialidade: string | null; grau: string | null; instituicao_formacao: string | null;
  anos_experiencia: string | null; cargo: string | null; categoria: string | null;
  foto_data_url: string | null;
};

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="text-sm font-semibold text-foreground">{value || "—"}</p>
    </div>
  );
}

export default function ProfessorProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<DocenteRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("docentes")
        .select("prefixo,primeiro_nome,ultimo_nome,email,contacto,endereco,nascimento,departamento,faculdade,especialidade,grau,instituicao_formacao,anos_experiencia,cargo,categoria,foto_data_url")
        .eq("email", user.email)
        .maybeSingle();
      if (!cancelled) { setDoc(data as DocenteRow | null); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  const fullName = doc
    ? `${doc.prefixo ? doc.prefixo + " " : ""}${doc.primeiro_nome} ${doc.ultimo_nome}`.trim()
    : user?.name || "Docente";

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-primary" /> Meu Perfil
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Informações pessoais e académicas</p>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">A carregar…</Card>
      ) : !doc ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Ainda não existe um registo de docente associado à sua conta.
        </Card>
      ) : (
        <>
          <Card className="px-5 py-4 border-l-4 border-l-primary">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                {doc.foto_data_url ? (
                  <img src={doc.foto_data_url} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <UserCheck className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-foreground">{fullName}</h2>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  {doc.faculdade && <Badge variant="outline" className="text-[10px] gap-1"><BookOpen className="w-3 h-3" /> {doc.faculdade}</Badge>}
                  {doc.departamento && <Badge variant="outline" className="text-[10px]">Dept. {doc.departamento}</Badge>}
                  {doc.cargo && <Badge variant="outline" className="text-[10px]">{doc.cargo}</Badge>}
                </div>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground">Informações Pessoais</h3>
            </div>
            <div className="divide-y divide-border">
              <InfoRow icon={Mail} label="Email" value={doc.email ?? ""} />
              <InfoRow icon={Phone} label="Telemóvel" value={doc.contacto ?? ""} />
              <InfoRow icon={MapPin} label="Morada" value={doc.endereco ?? ""} />
              <InfoRow icon={Calendar} label="Data de Nascimento" value={doc.nascimento ?? ""} />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground">Informação Académica</h3>
            </div>
            <div className="divide-y divide-border">
              <InfoRow icon={Building2} label="Faculdade" value={doc.faculdade ?? ""} />
              <InfoRow icon={Building2} label="Departamento" value={doc.departamento ?? ""} />
              <InfoRow icon={GraduationCap} label="Grau" value={doc.grau ?? ""} />
              <InfoRow icon={BookOpen} label="Curso / Especialidade" value={doc.especialidade ?? ""} />
              <InfoRow icon={Building2} label="Instituição de Formação" value={doc.instituicao_formacao ?? ""} />
              <InfoRow icon={Calendar} label="Anos de Docência" value={doc.anos_experiencia ?? ""} />
              <InfoRow icon={UserCheck} label="Categoria" value={doc.categoria ?? ""} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

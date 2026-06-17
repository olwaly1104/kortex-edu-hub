import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Users, GraduationCap, BookOpen, Layers, Building2, Wallet,
  ClipboardList, HelpCircle, FileText, ShieldCheck,
} from "lucide-react";

type Modulo = {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  routes: string[];
};

const MODULOS: Modulo[] = [
  { key: "estudante", label: "Estudante", description: "Portal académico do estudante: cadeiras, tarefas, notas, finanças pessoais.", icon: <GraduationCap className="w-4 h-4" />, routes: ["/student"] },
  { key: "professor", label: "Professor", description: "Gestão de turmas, aulas, tarefas, avaliações e notas.", icon: <BookOpen className="w-4 h-4" />, routes: ["/professor"] },
  { key: "coordenador", label: "Coordenador de Curso", description: "Supervisão de um curso, anos, turmas, docentes e relatórios.", icon: <Users className="w-4 h-4" />, routes: ["/coordenador"] },
  { key: "decano", label: "Decano", description: "Supervisão de uma faculdade: cursos, coordenadores e indicadores.", icon: <Building2 className="w-4 h-4" />, routes: ["/decano"] },
  { key: "reitor", label: "Reitor", description: "Visão institucional global: faculdades, decanos, finanças.", icon: <ShieldCheck className="w-4 h-4" />, routes: ["/reitor"] },
  { key: "financas", label: "Finanças", description: "Receitas, despesas, salários, orçamentos e configuração de propinas.", icon: <Wallet className="w-4 h-4" />, routes: ["/financas"] },
  { key: "academica", label: "Académica", description: "Criação de ano lectivo, cadeiras, turmas, exames e admissões.", icon: <FileText className="w-4 h-4" />, routes: ["/areaacademica"] },
  { key: "gap", label: "GAP", description: "Gabinete de Apoio ao Discente: solicitações, agendamentos, candidaturas.", icon: <HelpCircle className="w-4 h-4" />, routes: ["/gap"] },
  { key: "inscricoes", label: "Inscrições", description: "Portal público de candidatura de novos estudantes.", icon: <ClipboardList className="w-4 h-4" />, routes: ["/inscricoes"] },
  { key: "admin", label: "Administrador", description: "Gestão da instituição, contas, sistema e módulos.", icon: <Layers className="w-4 h-4" />, routes: ["/admin"] },
];

export default function AdminModulos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const institutionId = user?.id;
  const [settings, setSettings] = useState<Record<string, { enabled: boolean }>>({});
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const [{ data: ms }, { data: roles }] = await Promise.all([
        (supabase as any).from("module_settings").select("modulo, enabled"),
        (supabase as any).from("user_roles").select("role"),
      ]);
      const map: Record<string, { enabled: boolean }> = {};
      (ms ?? []).forEach((r: any) => { map[r.modulo] = { enabled: r.enabled }; });
      setSettings(map);
      const counts: Record<string, number> = {};
      (roles ?? []).forEach((r: any) => { counts[r.role] = (counts[r.role] ?? 0) + 1; });
      setRoleCounts(counts);
    })();
  }, []);

  const toggle = async (key: string, enabled: boolean) => {
    if (!institutionId) return;
    setSettings((s) => ({ ...s, [key]: { enabled } }));
    const { error } = await (supabase as any)
      .from("module_settings")
      .upsert({ institution_id: institutionId, modulo: key, enabled }, { onConflict: "institution_id,modulo" });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: enabled ? "Módulo activado" : "Módulo desactivado", description: key });
    }
  };

  const isEnabled = (key: string) => settings[key]?.enabled ?? true;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Roles e Permissões</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestão dos perfis (roles) e permissões da plataforma: descrição, rotas expostas, utilizadores ligados e activação por instituição.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {MODULOS.map((m) => {
          const count = roleCounts[m.key] ?? 0;
          const enabled = isEnabled(m.key);
          return (
            <Card key={m.key} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {m.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm">{m.label}</h3>
                    <p className="text-[12.5px] text-muted-foreground mt-0.5 leading-snug">{m.description}</p>
                  </div>
                </div>
                <Switch checked={enabled} onCheckedChange={(v) => toggle(m.key, v)} />
              </div>
              <div className="mt-4 flex items-center gap-2 text-[11px]">
                <Badge variant="outline">{count} utilizador{count === 1 ? "" : "es"}</Badge>
                {m.routes.map((r) => (
                  <Badge key={r} variant="secondary" className="font-mono">{r}</Badge>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

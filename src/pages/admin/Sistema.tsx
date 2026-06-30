import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { isFullOnboardingComplete } from "@/components/admin/OnboardingStepBanner";
import { Building2, Database, ShieldCheck, Users, HardDrive, CheckCircle2, Clock } from "lucide-react";

const TOTAL_BYTES = 50 * 1024 * 1024 * 1024; // 50 GB cap

const fmtBytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

async function walkBucket(bucket: string, prefix = ""): Promise<number> {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error || !data) return 0;
  let total = 0;
  for (const item of data) {
    if (item.id === null || item.metadata == null) {
      // folder
      total += await walkBucket(bucket, prefix ? `${prefix}/${item.name}` : item.name);
    } else {
      total += (item.metadata as any)?.size || 0;
    }
  }
  return total;
}

export default function AdminSistema() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ profiles: 0, roles: 0 });
  const [loaded, setLoaded] = useState(false);
  const [usedBytes, setUsedBytes] = useState<number | null>(null);
  const onboardingDone = isFullOnboardingComplete(user?.email);

  useEffect(() => {
    (async () => {
      const [p, r] = await Promise.all([
        (supabase as any).from("profiles").select("id", { count: "exact", head: true }),
        (supabase as any).from("user_roles").select("id", { count: "exact", head: true }),
      ]);
      setCounts({ profiles: p.count ?? 0, roles: r.count ?? 0 });
      setLoaded(true);
      const bytes = await walkBucket("discentes").catch(() => 0);
      setUsedBytes(bytes);
    })();
  }, []);

  const pct = usedBytes == null ? 0 : Math.min(100, (usedBytes / TOTAL_BYTES) * 100);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Sistema</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Estado da instituição, integrações e parâmetros gerais da plataforma.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={<Users className="w-4 h-4" />} label="Perfis" value={counts.profiles} loaded={loaded} />
        <KPI icon={<ShieldCheck className="w-4 h-4" />} label="Acessos atribuídos" value={counts.roles} loaded={loaded} />
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HardDrive className="w-4 h-4" />
              <span>Armazenamento</span>
            </div>
            <span className="font-semibold tabular-nums text-foreground">
              {usedBytes == null ? "—" : `${fmtBytes(usedBytes)} / 50 GB`}
            </span>
          </div>
          <Progress value={pct} className="h-1.5 mt-3" />
          <p className="text-[10px] text-muted-foreground mt-1.5 tabular-nums">{pct.toFixed(2)}% utilizado</p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Estado da Instituição</p>
            <h2 className="text-lg font-semibold mt-1">
              {onboardingDone ? "Ano lectivo activo" : "Em onboarding"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {onboardingDone
                ? "A configuração inicial foi concluída. A plataforma opera em modo lectivo."
                : "Complete a configuração da instituição para activar o ano lectivo."}
            </p>
          </div>
          <Badge variant={onboardingDone ? "default" : "outline"} className="gap-1.5">
            {onboardingDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            {onboardingDone ? "Concluído" : "Onboarding"}
          </Badge>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Integrações</p>
          <h2 className="text-lg font-semibold mt-1">Backend & Serviços</h2>
        </div>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Row icon={<Database className="w-4 h-4" />} label="Base de dados" status="Online" tone="ok" />
          <Row icon={<ShieldCheck className="w-4 h-4" />} label="Autenticação" status="Activa" tone="ok" />
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Conta da Instituição</p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <Info label="Administrador" value={user?.email ?? "—"} />
          <Info label="Identificador" value={user?.id ?? "—"} mono />
        </div>
      </Card>
    </div>
  );
}

function KPI({ icon, label, value, loaded }: { icon: React.ReactNode; label: string; value: number; loaded: boolean }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-2xl font-bold mt-1 tabular-nums">{loaded ? value : "—"}</p>
    </Card>
  );
}
function Row({ icon, label, status, tone }: { icon: React.ReactNode; label: string; status: string; tone: "ok" | "warn" }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 text-sm font-medium">{icon}{label}</div>
      <Badge variant={tone === "ok" ? "default" : "outline"}>{status}</Badge>
    </div>
  );
}
function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
      <p className={`text-sm mt-1 ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</p>
    </div>
  );
}

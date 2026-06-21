import { useState, useMemo } from "react";
import { markOnboardingStepDone } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, GraduationCap, Briefcase, Trash2, User, Users, BookOpen, Award, Medal } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { provisionKortexUser } from "@/lib/accountProvisioning";
import {
  loadDocentes, saveDocentes,
  loadStaff, saveStaff,
  type DocenteRow, type StaffRow,
} from "@/lib/peopleStorage";
import { DocenteFormDialog } from "@/components/admin/DocenteFormDialog";
import { StaffFormDialog } from "@/components/admin/StaffFormDialog";

type Mode = "docentes" | "staff";

export default function OnboardingPessoas({ mode }: { mode: Mode }) {
  const { user } = useAuth();
  if (mode === "docentes") return <DocentesOnboardingPanel userEmail={user?.email} />;
  return <StaffOnboardingPanel userEmail={user?.email} />;
}

/* ---------------- Shared header ---------------- */

function PageHeader({
  icon: Icon, title, subtitle, count, ctaLabel, onCta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  count: number;
  ctaLabel: string;
  onCta: () => void;
}) {
  return (
    <div className="space-y-3">
      {/* Dados (title) above */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold leading-tight">{title}</h1>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {/* Registos left · CTA right */}
      <div className="flex items-center gap-3 border-y border-border/60 py-1.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Registos</span>
          <span className="text-sm font-bold tabular-nums leading-none">{count}</span>
        </div>
        <Button size="sm" onClick={onCta} className="ml-auto gap-1.5">
          <UserPlus className="w-3.5 h-3.5" /> {ctaLabel}
        </Button>
      </div>
    </div>
  );
}

function EmptyPanel({
  icon: Icon, title, hint, ctaLabel, onCta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint: string;
  ctaLabel: string;
  onCta: () => void;
}) {
  return (
    <Card className="p-10 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
      </div>
      <Button size="sm" onClick={onCta} className="gap-1.5">
        <UserPlus className="w-3.5 h-3.5" /> {ctaLabel}
      </Button>
    </Card>
  );
}

/* ---------------- Docentes ---------------- */

function DocentesOnboardingPanel({ userEmail }: { userEmail?: string | null }) {
  const [rows, setRows] = useState<DocenteRow[]>(() => loadDocentes());
  const [open, setOpen] = useState(false);

  const persist = (next: DocenteRow[]) => {
    setRows(next);
    saveDocentes(next);
    window.dispatchEvent(new Event("storage"));
  };

  const onSave = async (row: DocenteRow) => {
    persist([...rows, row]);
    setOpen(false);
    try {
      await provisionKortexUser({
        name: `${row.primeiroNome} ${row.ultimoNome}`.trim(),
        email: row.email,
        modulo: "professor",
      });
    } catch (e: any) {
      console.warn("provision docente failed:", e?.message);
    }
    markOnboardingStepDone(userEmail, "rh.doc");
    toast.success(`Docente ${row.primeiroNome} adicionado`);
  };

  const remove = (id: string) => persist(rows.filter((r) => r.id !== id));

  const docenteCounts = useMemo(() => ({
    total: rows.length,
    licenciados: rows.filter(r => r.grau === "Licenciatura").length,
    mestres: rows.filter(r => r.grau === "Mestrado").length,
    doutorados: rows.filter(r => r.grau === "Doutoramento" || r.grau === "Agregação").length,
  }), [rows]);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        icon={GraduationCap}
        title="Docentes"
        subtitle="Registo completo do corpo docente. O email institucional @upra.kor é gerado automaticamente."
        count={rows.length}
        ctaLabel="Adicionar Docente"
        onCta={() => setOpen(true)}
      />

      {/* Dados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "Total", value: docenteCounts.total, Icon: Users },
          { label: "Licenciados", value: docenteCounts.licenciados, Icon: BookOpen },
          { label: "Mestres", value: docenteCounts.mestres, Icon: Award },
          { label: "Doutorados", value: docenteCounts.doutorados, Icon: Medal },
        ].map((k) => (
          <Card key={k.label} className="p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-muted text-foreground flex items-center justify-center">
              <k.Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">{k.label}</p>
              <p className="text-base font-semibold leading-none">{k.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyPanel
          icon={GraduationCap}
          title="Nenhum docente registado"
          hint="Adicione docentes para os atribuir a faculdades, cursos e cargos."
          ctaLabel="Adicionar Docente"
          onCta={() => setOpen(true)}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[40px_1.4fr_1.4fr_1fr_1fr_0.9fr_0.9fr_48px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
            <span></span><span>Docente</span><span>Email</span><span>Faculdade</span><span>Departamento</span><span>Grau</span><span>Cargo</span><span></span>
          </div>
          <div className="divide-y">
            {rows.map((r) => (
              <div key={r.id} className="grid grid-cols-[40px_1.4fr_1.4fr_1fr_1fr_0.9fr_0.9fr_48px] gap-2 px-4 py-2.5 items-center">
                <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex items-center justify-center text-muted-foreground">
                  {r.fotoDataUrl ? <img src={r.fotoDataUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
                </div>
                <span className="text-xs font-medium truncate">{r.prefixo} {r.primeiroNome} {r.ultimoNome}</span>
                <span className="text-xs text-muted-foreground truncate font-mono">{r.email}</span>
                <span className="text-xs truncate">{r.faculdade || <span className="text-muted-foreground italic">—</span>}</span>
                <span className="text-xs truncate">{r.departamento || <span className="text-muted-foreground italic">—</span>}</span>
                <span className="text-xs">{r.grau || "—"}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary w-fit">{r.cargo}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => remove(r.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <DocenteFormDialog open={open} onOpenChange={setOpen} onSave={onSave} />
    </div>
  );
}

/* ---------------- Staff ---------------- */

type StaffRowExtra = StaffRow & { fotoDataUrl?: string };

function StaffOnboardingPanel({ userEmail }: { userEmail?: string | null }) {
  const [rows, setRows] = useState<StaffRowExtra[]>(() => loadStaff() as StaffRowExtra[]);
  const [open, setOpen] = useState(false);

  const persist = (next: StaffRowExtra[]) => {
    setRows(next);
    saveStaff(next);
    window.dispatchEvent(new Event("storage"));
  };

  const onSave = async (row: StaffRowExtra) => {
    persist([...rows, row]);
    setOpen(false);
    try {
      await provisionKortexUser({
        name: `${row.primeiroNome} ${row.ultimoNome}`.trim(),
        email: row.email,
        modulo: row.moduloKortex || "academica",
      });
    } catch (e: any) {
      console.warn("provision staff failed:", e?.message);
    }
    markOnboardingStepDone(userEmail, "rh.staff");
    toast.success(`Funcionário ${row.primeiroNome} adicionado`);
  };

  const remove = (id: string) => persist(rows.filter((r) => r.id !== id));

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        icon={Briefcase}
        title="Staff"
        subtitle="Registo do pessoal administrativo. O email institucional @upra.kor é gerado automaticamente."
        count={rows.length}
        ctaLabel="Adicionar Staff"
        onCta={() => setOpen(true)}
      />

      {rows.length === 0 ? (
        <EmptyPanel
          icon={Briefcase}
          title="Nenhum funcionário registado"
          hint="Adicione funcionários para atribuir departamentos e funções."
          ctaLabel="Adicionar Staff"
          onCta={() => setOpen(true)}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[40px_1.4fr_1.4fr_1fr_0.9fr_0.9fr_48px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
            <span></span><span>Funcionário</span><span>Email</span><span>Departamento</span><span>Função</span><span>Módulo</span><span></span>
          </div>
          <div className="divide-y">
            {rows.map((r) => (
              <div key={r.id} className="grid grid-cols-[40px_1.4fr_1.4fr_1fr_0.9fr_0.9fr_48px] gap-2 px-4 py-2.5 items-center">
                <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex items-center justify-center text-muted-foreground">
                  {r.fotoDataUrl ? <img src={r.fotoDataUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
                </div>
                <span className="text-xs font-medium truncate">{r.prefixo} {r.primeiroNome} {r.ultimoNome}</span>
                <span className="text-xs text-muted-foreground truncate font-mono">{r.email}</span>
                <span className="text-xs truncate">{r.departamento || <span className="text-muted-foreground italic">—</span>}</span>
                <span className="text-xs truncate">{r.funcao || "—"}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary w-fit capitalize">{r.moduloKortex || "—"}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => remove(r.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <StaffFormDialog open={open} onOpenChange={setOpen} onSave={onSave} />
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { markOnboardingStepDone } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, User, Plus } from "lucide-react";
import { RowLockControls, CardLockBadge } from "@/components/admin/RowLockControls";

import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { provisionKortexUser } from "@/lib/accountProvisioning";
import {
  loadDocentes, saveDocentes, syncDocentesFromDb,
  loadStaff, saveStaff, syncStaffFromDb,
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
  icon: Icon, title, subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 pb-1">
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-semibold leading-tight">{title}</h1>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

/* ---------------- Docentes ---------------- */

function DocentesOnboardingPanel({ userEmail }: { userEmail?: string | null }) {
  const [rows, setRows] = useState<DocenteRow[]>(() => loadDocentes());
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { syncDocentesFromDb().then(setRows); }, []);

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
        modulo: row.moduloKortex || "professor",
      });
    } catch (e: any) {
      console.warn("provision docente failed:", e?.message);
    }
    markOnboardingStepDone(userEmail, "rh.doc");
    toast.success(`Docente ${row.primeiroNome} adicionado`);
  };

  const remove = (id: string) => persist(rows.filter((r) => r.id !== id));

  const [cardEdit, setCardEdit] = useState(false);
  const gridCols = "grid-cols-[40px_1.2fr_1.3fr_0.9fr_0.9fr_0.8fr_0.8fr_220px]";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        icon={GraduationCap}
        title="Docentes"
        subtitle="Registo completo do corpo docente. O email institucional @upra.kor é gerado automaticamente."
      />

      <Card className="overflow-hidden relative">
        <CardLockBadge editing={cardEdit} onEdit={() => setCardEdit(true)} onConfirm={() => setCardEdit(false)} />

        <div className={`grid ${gridCols} gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b`}>
          <span></span><span>Docente</span><span>Email</span><span>Faculdade</span><span>Departamento</span><span>Grau</span><span>Cargo</span><span></span>
        </div>
        <div className="divide-y">
          {rows.map((r) => (
            <div
              key={r.id}
              className={`grid ${gridCols} gap-2 px-4 py-2.5 items-center hover:bg-muted/30 cursor-pointer transition-colors`}
              onClick={() => navigate(`/admin/docentes/${r.id}`)}
            >
              <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex items-center justify-center text-muted-foreground">
                {r.fotoDataUrl ? <img src={r.fotoDataUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
              </div>
              <span className="text-xs font-medium truncate">{r.prefixo} {r.primeiroNome} {r.ultimoNome}</span>
              <span className="text-xs text-muted-foreground truncate font-mono">{r.email}</span>
              <span className="text-xs truncate">{r.faculdade || <span className="text-muted-foreground italic">—</span>}</span>
              <span className="text-xs truncate">{r.departamento || <span className="text-muted-foreground italic">—</span>}</span>
              <span className="text-xs">{r.grau || "—"}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary w-fit">{r.cargo}</span>
              <RowLockControls editing={cardEdit} onDelete={() => remove(r.id)} />
            </div>
          ))}
          {rows.length === 0 && (
            <p className="px-4 py-8 text-xs text-muted-foreground italic text-center">Sem docentes registados.</p>
          )}
        </div>
        <div className="border-t bg-muted/10 px-4 py-2.5">
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/5">
            <Plus className="w-3.5 h-3.5" /> Adicionar docente
          </Button>
        </div>
      </Card>

      <DocenteFormDialog open={open} onOpenChange={setOpen} onSave={onSave} />
    </div>
  );
}

/* ---------------- Staff ---------------- */

type StaffRowExtra = StaffRow & { fotoDataUrl?: string };

function StaffOnboardingPanel({ userEmail }: { userEmail?: string | null }) {
  const [rows, setRows] = useState<StaffRowExtra[]>(() => loadStaff() as StaffRowExtra[]);
  const [open, setOpen] = useState(false);

  useEffect(() => { syncStaffFromDb().then((r) => setRows(r as StaffRowExtra[])); }, []);

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

  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const gridCols = "grid-cols-[40px_1.2fr_1.3fr_0.9fr_0.8fr_0.8fr_220px]";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        icon={Briefcase}
        title="Staff"
        subtitle="Registo do pessoal administrativo. O email institucional @upra.kor é gerado automaticamente."
      />

      <Card className="overflow-hidden relative">
        <CardLockBadge />

        <div className={`grid ${gridCols} gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b`}>
          <span></span><span>Funcionário</span><span>Email</span><span>Departamento</span><span>Função</span><span>Módulo</span><span className="text-right">Ações</span>
        </div>
        <div className="divide-y">
          {rows.map((r) => (
            <div key={r.id} className={`grid ${gridCols} gap-2 px-4 py-2.5 items-center`}>
              <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex items-center justify-center text-muted-foreground">
                {r.fotoDataUrl ? <img src={r.fotoDataUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
              </div>
              <span className="text-xs font-medium truncate">{r.prefixo} {r.primeiroNome} {r.ultimoNome}</span>
              <span className="text-xs text-muted-foreground truncate font-mono">{r.email}</span>
              <span className="text-xs truncate">{r.departamento || <span className="text-muted-foreground italic">—</span>}</span>
              <span className="text-xs truncate">{r.funcao || "—"}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary w-fit capitalize">{r.moduloKortex || "—"}</span>
              <RowLockControls
                editing={!!editing[r.id]}
                onEdit={() => setEditing((p) => ({ ...p, [r.id]: true }))}
                onConfirm={() => setEditing((p) => ({ ...p, [r.id]: false }))}
                onDelete={() => remove(r.id)}
              />
            </div>
          ))}
          {rows.length === 0 && (
            <p className="px-4 py-8 text-xs text-muted-foreground italic text-center">Sem funcionários registados.</p>
          )}
        </div>
        <div className="border-t bg-muted/10 px-4 py-2.5">
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/5">
            <Plus className="w-3.5 h-3.5" /> Adicionar staff
          </Button>
        </div>
      </Card>

      <StaffFormDialog open={open} onOpenChange={setOpen} onSave={onSave} />
    </div>
  );
}

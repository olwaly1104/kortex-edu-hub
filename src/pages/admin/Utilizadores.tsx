import { useEffect, useMemo, useState } from "react";
import { FinHeader } from "@/pages/financas/_FinHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Users, Plus, Search, Trash2, ShieldCheck, Loader2, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  modulo: string;
  createdAt: number;
};

const STORAGE_KEY = "upra_admin_users_v1";

const MODULOS: { value: string; label: string }[] = [
  { value: "admin", label: "Admin (Onboarding institucional)" },
  { value: "estudante", label: "Estudante" },
  { value: "professor", label: "Professor" },
  { value: "coordenador", label: "Coordenador de Curso" },
  { value: "decano", label: "Decano" },
  { value: "reitor", label: "Reitor" },
  { value: "financas", label: "Finanças" },
  { value: "academica", label: "Académica" },
  { value: "gap", label: "GAP" },
  { value: "inscricoes", label: "Inscrições" },
];

const moduloLabel = (v: string) => MODULOS.find((m) => m.value === v)?.label || v;

const loadUsers = (): StoredUser[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};
const saveUsers = (rows: StoredUser[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); } catch { /* noop */ }
};

export default function AdminUtilizadores() {
  const { user } = useAuth();
  const [rows, setRows] = useState<StoredUser[]>(() => loadUsers());
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", modulo: "estudante" });

  useEffect(() => { saveUsers(rows); }, [rows]);

  // Always show the current admin at the top, merged with the locally tracked accounts.
  const allUsers: StoredUser[] = useMemo(() => {
    const seed: StoredUser[] = user
      ? [{ id: "current-admin", name: user.name, email: user.email, modulo: "admin", createdAt: 0 }]
      : [];
    const extras = rows.filter((r) => r.email.toLowerCase() !== (user?.email || "").toLowerCase());
    return [...seed, ...extras];
  }, [rows, user]);

  const filtered = useMemo(() => allUsers.filter((u) =>
    [u.name, u.email, moduloLabel(u.modulo)].some((v) => v.toLowerCase().includes(q.toLowerCase()))
  ), [allUsers, q]);

  const byModulo = useMemo(() => {
    const m: Record<string, number> = {};
    allUsers.forEach((u) => { m[u.modulo] = (m[u.modulo] || 0) + 1; });
    return m;
  }, [allUsers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setErr("Preencha nome, email e palavra-passe.");
      return;
    }
    if (form.password.length < 6) {
      setErr("Palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }
    setSubmitting(true);
    try {
      let userId: string | undefined;
      if (isPreviewHost()) {
        // Preview (Lovable editor) → não cria conta real no backend.
        console.info("[utilizadores] preview host: skipping backend signUp");
        userId = `local-${Date.now()}`;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: { display_name: form.name.trim(), modulo: form.modulo },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) { setErr(error.message); setSubmitting(false); return; }
        userId = data.user?.id;
        if (userId) {
          const { error: roleErr } = await supabase.from("user_roles" as any).insert({
            user_id: userId, role: form.modulo,
          } as any);
          if (roleErr) console.warn("user_roles insert failed:", roleErr.message);
        }
      }
      const newRow: StoredUser = {
        id: userId || `${Date.now()}`,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        modulo: form.modulo,
        createdAt: Date.now(),
      };
      setRows((prev) => [...prev, newRow]);
      setForm({ name: "", email: "", password: "", modulo: "estudante" });
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = (id: string) => {
    if (id === "current-admin") return;
    if (!confirm("Remover utilizador desta lista? (A conta na cloud não será apagada.)")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader
        title="Utilizadores"
        subtitle="Todas as contas de acesso ao Kortex da instituição"
        icon={<Users className="w-5 h-5 text-primary" />}
        right={
          <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Adicionar utilizador
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label="Total" value={allUsers.length} />
        <Kpi label="Admins" value={byModulo.admin || 0} />
        <Kpi label="Estudantes" value={byModulo.estudante || 0} />
        <Kpi label="Staff & Docentes" value={
          (byModulo.professor || 0) + (byModulo.coordenador || 0) + (byModulo.decano || 0) +
          (byModulo.reitor || 0) + (byModulo.financas || 0) + (byModulo.academica || 0) +
          (byModulo.gap || 0) + (byModulo.inscricoes || 0)
        } />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Procurar por nome, email ou módulo..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" />
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">{filtered.length} de {allUsers.length}</div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
          <div className="col-span-4">Utilizador</div>
          <div className="col-span-4">Email</div>
          <div className="col-span-3">Módulo</div>
          <div className="col-span-1 text-right">Ações</div>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            Nenhum utilizador encontrado.
          </div>
        )}
        {filtered.map((u) => (
          <div key={u.id} className="grid grid-cols-12 px-4 py-3 items-center border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
            <div className="col-span-4 flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {u.id === "current-admin" ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{u.name}</p>
                {u.id === "current-admin" && <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">Sessão atual</p>}
              </div>
            </div>
            <div className="col-span-4 text-xs text-muted-foreground truncate font-mono">{u.email}</div>
            <div className="col-span-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
                {moduloLabel(u.modulo)}
              </span>
            </div>
            <div className="col-span-1 flex justify-end">
              {u.id !== "current-admin" && (
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(u.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar utilizador</DialogTitle>
            <DialogDescription>Cria uma conta real ligada à cloud. O módulo escolhido define o painel a que o utilizador acede.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="u-modulo">Módulo</Label>
              <select id="u-modulo" value={form.modulo} onChange={(e) => setForm({ ...form, modulo: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                {MODULOS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-name">Nome a apresentar</Label>
              <Input id="u-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Maria Santos" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-email">Email</Label>
              <Input id="u-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="utilizador@instituicao.ao" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-password">Palavra-passe (mín. 6)</Label>
              <Input id="u-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </div>
            {err && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{err}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancelar</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A criar…</> : "Criar utilizador"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

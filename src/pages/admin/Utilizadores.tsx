import { useEffect, useMemo, useState } from "react";
import { FinHeader } from "@/pages/financas/_FinHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Users, Plus, Search, Trash2, ShieldCheck, Loader2, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingStepBanner, markOnboardingStepDone } from "@/components/admin/OnboardingStepBanner";
import { provisionKortexUser } from "@/lib/accountProvisioning";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  modulo: string;
  createdAt: number;
};

const STORAGE_KEY = "upra_admin_users_v1";

const MODULOS: { value: string; label: string }[] = [
  { value: "admin", label: "Admin (Instituição)" },
  { value: "coordenador", label: "Coordenador de Curso" },
  { value: "professor", label: "Professor" },
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
  const [form, setForm] = useState({ primeiroNome: "", ultimoNome: "", password: "", modulo: "coordenador" });

  // Institution email domain inferred from current admin's email (e.g. admin@upra.kor → upra.kor)
  const instDomain = useMemo(() => {
    const e = (user?.email || "").trim().toLowerCase();
    const at = e.indexOf("@");
    return at > -1 ? e.slice(at + 1) : "instituicao.kor";
  }, [user?.email]);

  const slug = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "").trim();

  const autoEmail = useMemo(() => {
    const p = slug(form.primeiroNome);
    const u = slug(form.ultimoNome);
    if (!p && !u) return "";
    return `${[p, u].filter(Boolean).join(".")}@${instDomain}`;
  }, [form.primeiroNome, form.ultimoNome, instDomain]);

  useEffect(() => { saveUsers(rows); }, [rows]);

  // Live source of truth: every profile in this institution (returned by the
  // list_institution_contacts RPC). This catches accounts created from any
  // page — Utilizadores dialog, Estudantes onboarding, etc.
  const [serverRows, setServerRows] = useState<StoredUser[]>([]);
  const refetchServer = async () => {
    const { data, error } = await supabase.rpc("list_institution_contacts");
    if (error || !Array.isArray(data)) return;
    const mapped = (data as any[]).map((r) => ({
        id: r.id,
        name: r.display_name || r.email,
        email: r.email,
        modulo: r.modulo || "estudante",
        createdAt: 0,
      }));
    setServerRows(mapped);
    if (mapped.length > 0) markOnboardingStepDone(user?.email, "est.imp");
  };
  useEffect(() => { refetchServer(); }, [user?.id]);

  // Merge: current admin (top) → server profiles → any local-only extras.
  const allUsers: StoredUser[] = useMemo(() => {
    const seed: StoredUser[] = user
      ? [{ id: "current-admin", name: user.name, email: user.email, modulo: "admin", createdAt: 0 }]
      : [];
    const seen = new Set<string>([user?.email?.toLowerCase() || ""]);
    const merged: StoredUser[] = [...seed];
    for (const r of serverRows) {
      const k = r.email.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push(r);
    }
    for (const r of rows) {
      const k = r.email.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push(r);
    }
    return merged;
  }, [rows, serverRows, user]);


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
    const fullName = `${form.primeiroNome.trim()} ${form.ultimoNome.trim()}`.trim();
    if (!form.primeiroNome.trim() || !form.ultimoNome.trim() || !form.password) {
      setErr("Preencha primeiro nome, último nome e palavra-passe.");
      return;
    }
    if (!autoEmail) {
      setErr("Email não pôde ser gerado a partir do nome.");
      return;
    }
    if (form.password.length < 6) {
      setErr("Palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await provisionKortexUser({ email: autoEmail, password: form.password, name: fullName, modulo: form.modulo });
      const newRow: StoredUser = {
        id: created.id,
        name: created.name,
        email: created.email,
        modulo: created.modulo,
        createdAt: Date.now(),
      };
      setRows((prev) => [...prev, newRow]);
      markOnboardingStepDone(user?.email, "est.imp");
      setForm({ primeiroNome: "", ultimoNome: "", password: "", modulo: "coordenador" });
      setOpen(false);
      refetchServer();
    } catch (e: any) {
      setErr(e?.message ?? "Falha ao criar utilizador.");
    } finally {
      setSubmitting(false);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const remove = async (id: string, email: string) => {
    if (id === "current-admin") return;
    if (!confirm("Eliminar definitivamente este utilizador? A conta e o acesso ao portal serão removidos da cloud.")) return;
    setDeletingId(id);
    try {
      const { data, error } = await supabase.functions.invoke("admin-delete-user", { body: { user_id: id } });
      const serverError = (data && typeof data === "object" && "error" in data) ? (data as any).error : null;
      if (error || serverError) {
        alert("Falha ao eliminar: " + (serverError || error?.message || "erro desconhecido"));
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
      try {
        const { removeDevCred } = await import("@/lib/devCreds");
        removeDevCred(email);
      } catch { /* ignore */ }
      refetchServer();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <OnboardingStepBanner />
      <FinHeader
        title="Utilizadores"
        subtitle="Todas as contas de acesso ao portal da instituição"
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
        <Kpi label="Coordenadores" value={byModulo.coordenador || 0} />
        <Kpi label="Staff & Docentes" value={
          (byModulo.professor || 0) + (byModulo.decano || 0) +
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
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(u.id, u.email)} disabled={deletingId === u.id}>
                  {deletingId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="u-pnome">Primeiro nome</Label>
                <Input id="u-pnome" value={form.primeiroNome} onChange={(e) => setForm({ ...form, primeiroNome: e.target.value })} placeholder="Ex: Maria" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="u-unome">Último nome</Label>
                <Input id="u-unome" value={form.ultimoNome} onChange={(e) => setForm({ ...form, ultimoNome: e.target.value })} placeholder="Ex: Santos" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-email">Email (gerado automaticamente)</Label>
              <Input id="u-email" type="email" value={autoEmail} readOnly className="bg-muted/40 font-mono text-xs" placeholder={`primeiro.ultimo@${instDomain}`} />
              <p className="text-[10px] text-muted-foreground">Domínio da instituição: <span className="font-mono">@{instDomain}</span></p>
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

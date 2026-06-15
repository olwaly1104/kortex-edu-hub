import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2, ShieldAlert, LogOut } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onDone: () => void;
}

export default function AlterarPalavraPasse({ onDone }: Props) {
  const { logout, user } = useAuth();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (pw.length < 6) { setErr("Mínimo 6 caracteres."); return; }
    if (pw !== pw2) { setErr("As palavras-passe não coincidem."); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) { setErr(error.message); return; }
      const { data: u } = await supabase.auth.getUser();
      if (u.user?.id) {
        await (supabase.from("profiles" as any) as any)
          .update({ must_change_password: false })
          .eq("id", u.user.id);
      }
      toast.success("Palavra-passe atualizada.");
      onDone();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Definir nova palavra-passe</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">
          <ShieldAlert className="w-4 h-4 mt-px shrink-0" />
          <p>A sua conta foi criada pelo administrador. Por segurança, defina a sua própria palavra-passe antes de continuar.</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nova palavra-passe</Label>
            <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Confirmar palavra-passe</Label>
            <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} className="h-10" />
          </div>
          {err && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{err}</p>}
          <Button type="submit" disabled={loading} className="w-full h-10">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A guardar…</> : "Guardar nova palavra-passe"}
          </Button>
        </form>
        <button onClick={logout} className="w-full text-xs text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1.5">
          <LogOut className="w-3.5 h-3.5" /> Terminar sessão
        </button>
      </div>
    </div>
  );
}

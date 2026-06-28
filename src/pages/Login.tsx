import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Globe, Loader2 } from "lucide-react";
import logoUpra from "@/assets/logo-upra.asset.json";
import { supabase } from "@/integrations/supabase/client";

const ROLE_ROUTE: Record<string, string> = {
  admin: "/admin",
  estudante: "/student",
  professor: "/professor",
  coordenador: "/coordenador",
  decano: "/decano",
  reitor: "/reitor",
  financas: "/financas",
  academica: "/secretaria",
  gap: "/gap",
  inscricoes: "/inscricoes",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email || !password) {
      setError("Por favor preencha todos os campos.");
      return;
    }
    setSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (signInError) {
        setError(signInError.message || "Credenciais inválidas.");
        return;
      }
      const userId = signInData.user?.id;
      let role = "estudante";
      if (userId) {
        const { data: roleRow } = await supabase
          .from("user_roles" as any)
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();
        if (roleRow && (roleRow as any).role) role = (roleRow as any).role;
      }
      const accountEmail = signInData.user?.email || normalizedEmail;
      const displayName = (signInData.user?.user_metadata as any)?.display_name;
      login(accountEmail, password, { sourceEmail: accountEmail, displayName, role });
      navigate(ROLE_ROUTE[role] ?? "/student");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-secondary" />
          <div className="absolute bottom-32 right-16 w-56 h-56 rounded-full bg-accent" />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-secondary" />
        </div>
        <div className="relative z-10 text-center">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-28 h-28 rounded-2xl bg-primary-foreground flex items-center justify-center p-3 shadow-xl">
              <img src={logoUpra.url} alt="UPRA" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-primary-foreground tracking-wide">UPRA</h1>
              <p className="text-sm text-primary-foreground/80 mt-1">Universidade Privada de Angola</p>
            </div>
          </div>
          <p className="text-xl text-primary-foreground/90 max-w-md leading-relaxed">
            Portal Académico
          </p>
          <p className="mt-4 text-primary-foreground/70 max-w-sm mx-auto">
            Acesso integrado para estudantes, docentes e gestão institucional.
          </p>
          <Link to="/site" className="inline-block mt-8">
            <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 gap-2">
              <Globe className="w-4 h-4" /> Visitar website
            </Button>
          </Link>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center p-1.5">
              <img src={logoUpra.url} alt="UPRA" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">UPRA</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Portal Académico</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Bem-vindo</h2>
            <p className="text-muted-foreground mt-1">Entre com as suas credenciais para aceder ao portal da UPRA.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email institucional</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@upra.kor"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(c) => setRemember(!!c)}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Lembrar-me
                </Label>
              </div>
              <button type="button" className="text-sm text-primary hover:underline">
                Esqueceu a palavra-passe?
              </button>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
            )}
            {info && !error && (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-md">{info}</p>
            )}

            <Button type="submit" disabled={submitting} className="w-full h-11 text-base font-semibold">
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A entrar...</> : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-xs text-muted-foreground px-2">
              As contas são criadas pela administração da UPRA. Se ainda não tem acesso, contacte os serviços académicos.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

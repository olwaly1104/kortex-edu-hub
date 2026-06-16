import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Globe, Building2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import logoUpra from "@/assets/logo-upra.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { onboardingKey, isOnboardingCompleteFor, pushOnboarding } from "@/lib/onboardingStorage";
import { loadDevCreds, saveDevCred, removeDevCred, type DevCred } from "@/lib/devCreds";
import { KeyRound, Copy, Trash2 } from "lucide-react";

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

  // Registo de Instituição dialog
  const [signupOpen, setSignupOpen] = useState(false);
  const [suNome, setSuNome] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suEmailManuallyEdited, setSuEmailManuallyEdited] = useState(false);
  const [suPassword, setSuPassword] = useState("");
  const [suError, setSuError] = useState("");
  const [suLoading, setSuLoading] = useState(false);

  // Auto-fill institutional email as admin@<slug>.kor
  useEffect(() => {
    if (!suNome.trim() || suEmailManuallyEdited) return;
    const slug = suNome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    if (slug) setSuEmail(`admin@${slug}.kor`);
  }, [suNome, suEmailManuallyEdited]);

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
      // Hydrate the in-app shell using the role
      login(accountEmail, password, { sourceEmail: accountEmail, displayName });
      if (role === "admin" && !isOnboardingCompleteFor(accountEmail)) {
        navigate("/admin/onboarding");
        return;
      }
      navigate(ROLE_ROUTE[role] ?? "/student");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuError("");
    if (!suNome.trim() || !suEmail.trim() || !suPassword) {
      setSuError("Preencha todos os campos.");
      return;
    }
    if (suPassword.length < 6) {
      setSuError("Palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }
    setSuLoading(true);
    try {
      const emailTrim = suEmail.trim();
      const { data: suData, error: signUpError } = await supabase.auth.signUp({
        email: emailTrim,
        password: suPassword,
        options: {
          data: { display_name: suNome.trim(), modulo: "admin" },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (signUpError) {
        setSuError(signUpError.message || "Não foi possível registar a instituição.");
        return;
      }
      const userId = suData.user?.id;
      if (userId) {
        const { error: roleErr } = await supabase.from("user_roles" as any).insert({
          user_id: userId,
          role: "admin",
        } as any);
        if (roleErr) console.warn("user_roles insert failed:", roleErr.message);
      }
      saveDevCred({ email: emailTrim, password: suPassword, modulo: "admin", name: suNome.trim() });
      // Pre-seed local onboarding entry so onboarding flow knows the institution name.
      try {
        const onboardingState = {
          dados: {
            nome: suNome.trim(),
            tipo: "",
            sigla: "",
            provincia: "",
            municipio: "",
            endereco: "",
            telefone: "",
            email: emailTrim,
            nif: "",
            logoDataUrl: "",
          },
          completed: false,
        };
        localStorage.setItem(onboardingKey(emailTrim), JSON.stringify(onboardingState));
        pushOnboarding(emailTrim, onboardingState);
      } catch {
        /* ignore */
      }
      setSignupOpen(false);
      setEmail(emailTrim);
      setPassword(suPassword);
      setInfo("Instituição registada. Inicie sessão para concluir o onboarding institucional.");
      setSuNome("");
      setSuEmail("");
      setSuPassword("");
      setSuEmailManuallyEdited(false);
    } finally {
      setSuLoading(false);
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
              <img src={logoUpra.url} alt="Kortex" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-primary-foreground tracking-wide">Kortex</h1>
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
              <img src={logoUpra.url} alt="Kortex" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Kortex</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Portal Académico</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Bem-vindo</h2>
            <p className="text-muted-foreground mt-1">Entre com as suas credenciais para aceder à plataforma.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email institucional</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@minha-instituicao.kor"
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
              Apenas contas reais. Para começar, registe a sua instituição — depois crie todos os utilizadores a partir do painel da instituição.
            </p>
            <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="default" size="sm" className="gap-2">
                  <Building2 className="w-4 h-4" /> Registo de Instituição
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Registo de Instituição</DialogTitle>
                  <DialogDescription>
                    Crie a conta principal da sua instituição no Kortex. Esta conta gere toda a instituição e cria os restantes utilizadores (estudantes, docentes, coordenadores, decanos, reitor, finanças, académica, GAP, inscrições).
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="su-nome">Nome da instituição</Label>
                    <Input
                      id="su-nome"
                      value={suNome}
                      onChange={(e) => setSuNome(e.target.value)}
                      placeholder="Ex: Universidade Privada de Angola"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-email">Email do administrador da instituição</Label>
                    <Input
                      id="su-email"
                      type="email"
                      value={suEmail}
                      onChange={(e) => { setSuEmailManuallyEdited(true); setSuEmail(e.target.value); }}
                      placeholder="admin@minha-instituicao.kor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-password">Palavra-passe (mín. 6)</Label>
                    <Input
                      id="su-password"
                      type="password"
                      value={suPassword}
                      onChange={(e) => setSuPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  {suError && (
                    <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{suError}</p>
                  )}
                  <Button type="submit" disabled={suLoading} className="w-full">
                    {suLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A registar...</> : "Registar instituição"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Globe, KeyRound, UserPlus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import logoUpra from "@/assets/logo-upra.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { onboardingKey, isOnboardingCompleteFor } from "@/lib/onboardingStorage";

const DEMO_PASSWORD = "olwaly";
const DEMO_ACCOUNTS: { role: string; email: string }[] = [
  { role: "Admin — Onboarding institucional", email: "admin@upra.kor" },
  { role: "Estudante", email: "2934@upra.kor" },
  { role: "Professor", email: "prof.silva@upra.kor" },
  { role: "Coordenador de Curso", email: "coordcurso@upra.kor" },
  { role: "Decano", email: "decano@upra.kor" },
  { role: "Reitor", email: "reitor@upra.kor" },
  { role: "Académica", email: "academica@upra.kor" },
  { role: "Finanças", email: "financas@upra.kor" },
  { role: "GAP", email: "gap@upra.kor" },
  { role: "Inscrições", email: "inscricoes@upra.kor" },
  { role: "Área Académica 2", email: "areaacademica2@upra.kor" },
];

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

  // Signup dialog state
  const [signupOpen, setSignupOpen] = useState(false);
  const [suModulo, setSuModulo] = useState<string>("admin");
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suEmailManuallyEdited, setSuEmailManuallyEdited] = useState(false);
  const [suPassword, setSuPassword] = useState("");
  const [suError, setSuError] = useState("");
  const [suLoading, setSuLoading] = useState(false);

  // Auto-fill email as modulo@nome-a-apresentar.kor
  useEffect(() => {
    if (!suName.trim() || suEmailManuallyEdited) return;
    const normalized = suName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    if (normalized) {
      setSuEmail(`${suModulo}@${normalized}.kor`);
    }
  }, [suModulo, suName, suEmailManuallyEdited]);

  const isOnboardingDone = (forEmail: string) => {
    return isOnboardingCompleteFor(forEmail);
  };

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
      // Try real account first; if a .kor demo email is not registered, fall back to local demo auth.
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (signInError) {
        if (normalizedEmail.endsWith(".kor")) {
          const result = login(normalizedEmail, password);
          if (!result.ok) {
            setError(result.error || "Não foi possível iniciar sessão.");
            return;
          }
          if (normalizedEmail.startsWith("admin")) {
            navigate(isOnboardingDone(normalizedEmail) ? "/admin" : "/admin/onboarding");
          }
          return;
        }
        setError(signInError.message || "Credenciais inválidas.");
        return;
      }
      // Look up role from user_roles, then open the matching demo shell
      const userId = signInData.user?.id;
      let modulo: string = (signInData.user?.user_metadata as any)?.modulo || "estudante";
      if (userId) {
        const { data: roleRow } = await supabase
          .from("user_roles" as any)
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();
        if (roleRow && (roleRow as any).role) modulo = (roleRow as any).role;
      }
      const MODULE_TO_DEMO: Record<string, { email: string; path: string }> = {
        admin:        { email: "admin@upra.kor",          path: "/admin" },
        estudante:    { email: "2934@upra.kor",           path: "/student" },
        professor:    { email: "prof.silva@upra.kor",     path: "/professor" },
        coordenador:  { email: "coordcurso@upra.kor",     path: "/coordenador" },
        decano:       { email: "decano@upra.kor",         path: "/decano" },
        reitor:       { email: "reitor@upra.kor",         path: "/reitor" },
        financas:     { email: "financas@upra.kor",       path: "/financas" },
        academica:    { email: "academica@upra.kor",      path: "/secretaria" },
        gap:          { email: "gap@upra.kor",            path: "/gap" },
        inscricoes:   { email: "inscricoes@upra.kor",     path: "/inscricoes" },
      };
      const target = MODULE_TO_DEMO[modulo] ?? MODULE_TO_DEMO.estudante;
      const accountEmail = signInData.user?.email || email;
      const displayName = (signInData.user?.user_metadata as any)?.display_name;
      login(target.email, "olwaly", { sourceEmail: accountEmail, displayName });
      // Admin (real cloud account): always run institutional onboarding (ficha de inscrição)
      // before the inicio, until it's marked completed.
      if (modulo === "admin" && !isOnboardingDone(accountEmail)) {
        navigate("/admin/onboarding");
        return;
      }
      navigate(target.path);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuError("");
    if (!suModulo || !suName.trim() || !suEmail.trim() || !suPassword) {
      setSuError("Preencha todos os campos.");
      return;
    }
    if (suPassword.length < 6) {
      setSuError("Palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }
    setSuLoading(true);
    const { data: suData, error: signUpError } = await supabase.auth.signUp({
      email: suEmail.trim(),
      password: suPassword,
      options: {
        data: { display_name: suName.trim(), modulo: suModulo },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (signUpError) {
      setSuLoading(false);
      setSuError(signUpError.message || "Não foi possível criar conta.");
      return;
    }
    // Assign role
    const userId = suData.user?.id;
    if (userId) {
      const { error: roleErr } = await supabase.from("user_roles" as any).insert({
        user_id: userId,
        role: suModulo,
      } as any);
      if (roleErr) console.warn("user_roles insert failed:", roleErr.message);
    }
    // For admin: pre-complete institutional onboarding using the name supplied at signup,
    // so the user is never asked to register again on the next sign-in.
    if (suModulo === "admin") {
      try {
        const onboardingState = {
          dados: { nome: suName.trim(), tipo: "", sigla: "", provincia: "", municipio: "", endereco: "", telefone: "", email: suEmail.trim(), nif: "", logoDataUrl: "" },
          completed: true,
        };
        localStorage.setItem(onboardingKey(suEmail.trim()), JSON.stringify(onboardingState));
      } catch { /* ignore */ }
    }
    setSuLoading(false);
    setSignupOpen(false);
    setEmail(suEmail.trim());
    setPassword(suPassword);
    setInfo(`Conta ${suModulo} criada. Inicie sessão para entrar.`);
    setSuName(""); setSuEmail(""); setSuPassword("");
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
              <Globe className="w-4 h-4" /> Visitar website da UPRA
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
            <h2 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h2>
            <p className="text-muted-foreground mt-1">Entre com as suas credenciais para aceder à plataforma.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email institucional</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@escola.kor"
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

          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Email <span className="font-medium">.kor</span> para perfis demo, ou crie uma conta Cloud para testar o chat em tempo real.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="gap-2">
                    <KeyRound className="w-4 h-4" /> Ver credenciais de demo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Credenciais de demonstração</DialogTitle>
                    <DialogDescription>
                      Palavra-passe para todos os perfis: <span className="font-mono font-semibold text-foreground">{DEMO_PASSWORD}</span>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-80 overflow-y-auto divide-y rounded-md border">
                    {DEMO_ACCOUNTS.map((a) => (
                      <button
                        key={a.email}
                        type="button"
                        onClick={() => { setEmail(a.email); setPassword(DEMO_PASSWORD); }}
                        className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                      >
                        <div className="text-sm font-medium text-foreground">{a.role}</div>
                        <div className="text-xs text-muted-foreground font-mono">{a.email}</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Clique numa conta para preencher automaticamente.</p>
                </DialogContent>
              </Dialog>

              <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="default" size="sm" className="gap-2">
                    <UserPlus className="w-4 h-4" /> Criar conta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Criar conta</DialogTitle>
                    <DialogDescription>
                      Cria uma conta real ligada à Lovable Cloud. O módulo escolhido define o painel a que o utilizador acede.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="su-modulo">Módulo</Label>
                      <select
                        id="su-modulo"
                        value={suModulo}
                        onChange={(e) => setSuModulo(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="admin">Admin (Onboarding institucional)</option>
                        <option value="estudante">Estudante</option>
                        <option value="professor">Professor</option>
                        <option value="coordenador">Coordenador de Curso</option>
                        <option value="decano">Decano</option>
                        <option value="reitor">Reitor</option>
                        <option value="financas">Finanças</option>
                        <option value="academica">Académica</option>
                        <option value="gap">GAP</option>
                        <option value="inscricoes">Inscrições</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-name">Nome a apresentar</Label>
                      <Input id="su-name" value={suName} onChange={(e) => setSuName(e.target.value)} placeholder="Ex: Maria Santos" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-email">Email</Label>
                      <Input
                        id="su-email"
                        type="email"
                        value={suEmail}
                        onChange={(e) => { setSuEmailManuallyEdited(true); setSuEmail(e.target.value); }}
                        placeholder="modulo@nome.kor"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-password">Palavra-passe (mín. 6)</Label>
                      <Input id="su-password" type="password" value={suPassword} onChange={(e) => setSuPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                    {suError && (
                      <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{suError}</p>
                    )}
                    <Button type="submit" disabled={suLoading} className="w-full">
                      {suLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A criar...</> : "Criar conta"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

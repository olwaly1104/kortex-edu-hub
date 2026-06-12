import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Globe, KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import logoUpra from "@/assets/logo-upra.asset.json";

const DEMO_PASSWORD = "olwaly";
const DEMO_ACCOUNTS: { role: string; email: string }[] = [
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Por favor preencha todos os campos.");
      return;
    }
    if (!email.endsWith(".kor")) {
      setError("Email deve terminar em .kor");
      return;
    }
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error || "Não foi possível iniciar sessão.");
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

            <Button type="submit" className="w-full h-11 text-base font-semibold">
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Use o seu email institucional terminado em <span className="font-medium">.kor</span>.
            </p>
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
          </div>
        </div>
      </div>
    </div>
  );
}

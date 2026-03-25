import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Eye, EyeOff } from "lucide-react";

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
    login(email, password);
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
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <GraduationCap className="w-9 h-9 text-secondary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-primary-foreground">Kortex</h1>
              <p className="text-lg text-primary-foreground/80">Educação</p>
            </div>
          </div>
          <p className="text-xl text-primary-foreground/90 max-w-md leading-relaxed">
            A sua sala de aula digital
          </p>
          <p className="mt-6 text-primary-foreground/60 max-w-sm">
            Plataforma completa para escolas e universidades angolanas. Tudo num só lugar.
          </p>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Kortex</h1>
              <p className="text-sm text-muted-foreground">Educação</p>
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

          <div className="mt-8 text-center space-y-1">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Dica:</span> Use qualquer palavra-passe com os emails abaixo:
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">2934@upra.kor</span> (Estudante) · <span className="font-medium">prof.silva@upra.kor</span> (Professor)
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">coordcurso@upra.kor</span> (Coord. Curso) · <span className="font-medium">decano@upra.kor</span> (Decano)
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">reitoria@upra.kor</span> (Reitoria) · <span className="font-medium">secretaria@upra.kor</span> (Secretaria)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

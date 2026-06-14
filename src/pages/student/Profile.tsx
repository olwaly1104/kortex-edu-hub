import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, BookOpen, Calendar, Camera, Bell, Moon, Globe, Lock, Shield, Eye, CheckCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import placeholderStudent from "@/assets/placeholder-student.jpg";

export default function StudentProfile() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [showOnline, setShowOnline] = useState(true);

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-6">Perfil</h1>

      <div className="grid lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Profile card */}
        <Card className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                <img src={placeholderStudent} alt="Foto do estudante" className="w-full h-full object-cover" loading="lazy" width={80} height={80} />
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.course} — {user?.year}º Ano</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {[
              { icon: Mail, label: "Email", value: user?.email },
              { icon: User, label: "Nome Completo", value: user?.name },
              { icon: BookOpen, label: "Curso", value: user?.course },
              { icon: Calendar, label: "Ano", value: `${user?.year}º Ano` },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 py-3 border-b last:border-0">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground w-32">{item.label}</span>
                <span className="text-sm font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>

          <Button variant="outline" className="mt-6">Editar Perfil</Button>
        </Card>

        {/* Settings card */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-5">Definições</h2>

          <div className="space-y-1">
            {/* Aparência */}
            <div className="pb-4 mb-4 border-b">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Aparência</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Moon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Modo Escuro</span>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Idioma</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Português</span>
                </div>
              </div>
            </div>

            {/* Notificações */}
            <div className="pb-4 mb-4 border-b">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Notificações</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Notificações Push</span>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Notificações por Email</span>
                  </div>
                  <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                </div>
              </div>
            </div>

            {/* Segurança & Privacidade */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Segurança & Privacidade</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Autenticação 2 Fatores</span>
                  </div>
                  <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Mostrar Online</span>
                  </div>
                  <Switch checked={showOnline} onCheckedChange={setShowOnline} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Alterar Palavra-passe</span>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-7">Alterar</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { User, Mail, BookOpen, Calendar, Camera, Bell, Moon, Globe, Lock, Shield, Eye, CheckCircle, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import placeholderStudent from "@/assets/placeholder-student.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [showOnline, setShowOnline] = useState(true);

  // Editar Perfil dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editSaving, setEditSaving] = useState(false);

  // Alterar palavra-passe dialog
  const [pwOpen, setPwOpen] = useState(false);
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (editOpen) {
      setEditName(user?.name || "");
      setEditEmail(user?.email || "");
    }
  }, [editOpen, user?.name, user?.email]);

  const handleSaveProfile = async () => {
    const name = editName.trim();
    const email = editEmail.trim().toLowerCase();
    if (!name) { toast.error("Nome é obrigatório."); return; }
    if (!email) { toast.error("Email é obrigatório."); return; }
    setEditSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getUser();
      const uid = sessionData.user?.id;
      if (!uid) { toast.error("Sessão expirada. Inicie sessão novamente."); return; }

      // Update auth user (email + metadata)
      const authPatch: { data: Record<string, unknown>; email?: string } = {
        data: { display_name: name },
      };
      if (email && email !== (sessionData.user?.email || "").toLowerCase()) authPatch.email = email;
      const { error: authErr } = await supabase.auth.updateUser(authPatch);
      if (authErr) { toast.error(authErr.message || "Não foi possível atualizar a conta."); return; }

      // Update profile row
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ display_name: name, email })
        .eq("id", uid);
      if (profErr) { toast.error(profErr.message || "Não foi possível atualizar o perfil."); return; }

      updateUser({ name, email });
      toast.success(authPatch.email ? "Perfil atualizado. Confirme o novo email na sua caixa de entrada." : "Perfil atualizado.");
      setEditOpen(false);
    } finally {
      setEditSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (pwNew.length < 6) { toast.error("Palavra-passe deve ter pelo menos 6 caracteres."); return; }
    if (pwNew !== pwConfirm) { toast.error("As palavras-passe não coincidem."); return; }
    setPwSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwNew });
      if (error) { toast.error(error.message || "Não foi possível alterar a palavra-passe."); return; }
      toast.success("Palavra-passe alterada com sucesso.");
      setPwOpen(false);
      setPwNew(""); setPwConfirm("");
    } finally {
      setPwSaving(false);
    }
  };

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
              <p className="text-muted-foreground">{user?.course} {user?.year ? `— ${user.year}º Ano` : ""}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {[
              { icon: Mail, label: "Email", value: user?.email },
              { icon: User, label: "Nome Completo", value: user?.name },
              ...(user?.course ? [{ icon: BookOpen, label: "Curso", value: user.course }] : []),
              ...(user?.year ? [{ icon: Calendar, label: "Ano", value: `${user.year}º Ano` }] : []),
              ...(user?.presence ? [{ icon: CheckCircle, label: "Presença", value: user.presence, color: "text-emerald-600" }] : []),
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 py-3 border-b last:border-0">
                <item.icon className={`w-4 h-4 ${"color" in item && item.color ? item.color : "text-muted-foreground"}`} />
                <span className="text-sm text-muted-foreground w-32">{item.label}</span>
                <span className="text-sm font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>

          <Button variant="outline" className="mt-6" onClick={() => setEditOpen(true)}>Editar Perfil</Button>
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
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setPwOpen(true)}>Alterar</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Editar Perfil dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>Atualize o seu nome e email. As alterações são guardadas na base de dados.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ep-name">Nome completo</Label>
              <Input id="ep-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ep-email">Email</Label>
              <Input id="ep-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              <p className="text-xs text-muted-foreground">Se alterar o email, poderá ser necessário confirmá-lo.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editSaving}>Cancelar</Button>
            <Button onClick={handleSaveProfile} disabled={editSaving}>
              {editSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A guardar...</> : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alterar palavra-passe dialog */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Palavra-passe</DialogTitle>
            <DialogDescription>Defina uma nova palavra-passe com pelo menos 6 caracteres.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pw-new">Nova palavra-passe</Label>
              <Input id="pw-new" type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw-confirm">Confirmar nova palavra-passe</Label>
              <Input id="pw-confirm" type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwOpen(false)} disabled={pwSaving}>Cancelar</Button>
            <Button onClick={handleChangePassword} disabled={pwSaving}>
              {pwSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A alterar...</> : "Alterar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

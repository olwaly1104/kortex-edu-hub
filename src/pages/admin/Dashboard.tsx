import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Users, BookOpen, Video, BarChart3, Settings, ChevronRight, AlertTriangle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    { icon: Users, label: "Total Estudantes", value: "1,247", color: "text-primary bg-primary/10" },
    { icon: Users, label: "Total Professores", value: "86", color: "text-accent bg-accent/10" },
    { icon: BookOpen, label: "Disciplinas", value: "142", color: "text-secondary bg-secondary/10" },
    { icon: Video, label: "Aulas Gravadas", value: "3,891", color: "text-primary bg-primary/10" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Painel de Administração 🏫</h1>
        <p className="text-muted-foreground mt-1">Bem-vindo, {user?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" /> Actividade Recente
          </h2>
          <div className="space-y-3">
            {[
              { text: "Prof. Silva carregou 3 novas aulas de Matemática II", time: "Há 2 horas" },
              { text: "15 novos estudantes registados", time: "Há 5 horas" },
              { text: "Notas de Programação II publicadas", time: "Ontem" },
              { text: "Prof. Santos actualizou materiais de Física", time: "Ontem" },
              { text: "Backup automático do sistema concluído", time: "Há 2 dias" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                <p className="text-sm text-foreground flex-1">{item.text}</p>
                <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-secondary" /> Alertas
            </h3>
            <div className="space-y-2">
              {[
                { text: "23 estudantes com presença < 75%", type: "warning" },
                { text: "5 disciplinas sem materiais", type: "info" },
                { text: "Backup pendente há 3 dias", type: "error" },
              ].map((alert, i) => (
                <div key={i} className={`text-xs p-2.5 rounded-lg ${
                  alert.type === "error" ? "bg-destructive/10 text-destructive" :
                  alert.type === "warning" ? "bg-secondary/10 text-secondary" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {alert.text}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-3">Acesso Rápido</h3>
            <div className="space-y-2">
              {[
                { label: "Gerir Utilizadores", path: "/admin/users", icon: Users },
                { label: "Relatórios", path: "/admin/reports", icon: BarChart3 },
                { label: "Configurações", path: "/admin/settings", icon: Settings },
              ].map(a => (
                <Link key={a.path} to={a.path} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors">
                  <a.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground flex-1">{a.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, User, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useInstitutionContacts } from "@/hooks/useInstitutionContacts";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ModuleTag } from "@/components/chat/ModuleTag";

export default function Contacts() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { contacts, loading } = useInstitutionContacts();
  const base = pathname.split("/")[1] ? `/${pathname.split("/")[1]}` : "/student";

  const startChat = async (userId: string) => {
    const { data } = await (supabase as any).rpc("get_or_create_dm", { _other_user_id: userId });
    if (data) navigate(`${base}/chat?conversation=${data}`);
    else navigate(`${base}/chat`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contactos</h1>
          <p className="text-sm text-muted-foreground">Todos os membros da instituição. Os contactos são adicionados automaticamente quando uma nova conta é criada.</p>
        </div>
      </div>

      {loading ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">A carregar contactos…</Card>
      ) : contacts.length === 0 ? (
        <EmptyState
          title="Sem contactos"
          description="Ainda não existem outros membros na instituição. Assim que o administrador criar novas contas, elas aparecerão aqui."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contacts.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">{c.display_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.email ?? "—"}</p>
                  {c.modulo && <Badge variant="outline" className="text-[10px] mt-2 capitalize">{c.modulo}</Badge>}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => navigate(`${base}/email?to=${encodeURIComponent(c.email ?? "")}`)}>
                  <Mail className="w-3.5 h-3.5" />Email
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => startChat(c.id)}>
                  <MessageSquare className="w-3.5 h-3.5" />Chat
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {user && (
        <p className="text-[11px] text-muted-foreground text-center">
          Sessão: {user.email}
        </p>
      )}
    </div>
  );
}

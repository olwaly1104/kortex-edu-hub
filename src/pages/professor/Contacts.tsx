import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MessageSquare, User, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useInstitutionContacts } from "@/hooks/useInstitutionContacts";
import { ModuleTag } from "@/components/chat/ModuleTag";

export default function ProfessorContacts() {
  const navigate = useNavigate();
  const { contacts, loading } = useInstitutionContacts();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter(c =>
      c.display_name.toLowerCase().includes(term) ||
      (c.email ?? "").toLowerCase().includes(term) ||
      (c.modulo ?? "").toLowerCase().includes(term)
    );
  }, [q, contacts]);

  const goToChat = () => navigate("/professor/chat");
  const goToEmail = (email: string) => navigate(`/professor/email?to=${encodeURIComponent(email)}`);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Contactos</h1>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar por nome, email ou módulo…" className="pl-9" />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">A carregar…</p>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          {contacts.length === 0 ? "Ainda não existem contactos na instituição." : "Sem resultados."}
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{c.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">{c.email ?? "—"}</p>
                {c.modulo && <div className="mt-1"><ModuleTag modulo={c.modulo} /></div>}
              </div>
              <div className="flex gap-1.5 shrink-0">
                {c.email && (
                  <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => goToEmail(c.email!)}>
                    <Mail className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button variant="outline" size="icon" className="w-8 h-8" onClick={goToChat}>
                  <MessageSquare className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

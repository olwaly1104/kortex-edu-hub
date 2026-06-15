import { FinHeader } from "@/pages/financas/_FinHeader";
import { UserCog, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type StaffRow = {
  id: string; prefixo: string; primeiroNome: string; ultimoNome: string;
  email: string; contacto: string; departamento: string; funcao: string; moduloKortex: string;
};

const seed: StaffRow[] = [
  { id: "s1", prefixo: "Sra.", primeiroNome: "Joana",  ultimoNome: "Pinto",   email: "joana.pinto@upra.kor",   contacto: "+244 923 100 001", departamento: "Académica",      funcao: "Coordenador", moduloKortex: "Académica" },
  { id: "s2", prefixo: "Sr.",  primeiroNome: "Rui",    ultimoNome: "Tavares", email: "rui.tavares@upra.kor",   contacto: "+244 923 100 002", departamento: "TI",             funcao: "Técnico",     moduloKortex: "Administrador" },
  { id: "s3", prefixo: "Dra.", primeiroNome: "Mariana",ultimoNome: "Sousa",   email: "mariana.sousa@upra.kor", contacto: "+244 923 100 003", departamento: "Finanças",       funcao: "Diretor",     moduloKortex: "Finanças" },
  { id: "s4", prefixo: "Sr.",  primeiroNome: "Paulo",  ultimoNome: "Neto",    email: "paulo.neto@upra.kor",    contacto: "+244 923 100 004", departamento: "GAP",            funcao: "Assistente",  moduloKortex: "GAP" },
  { id: "s5", prefixo: "Sra.", primeiroNome: "Helena", ultimoNome: "Vaz",     email: "helena.vaz@upra.kor",    contacto: "+244 923 100 005", departamento: "Recursos Humanos", funcao: "Coordenador", moduloKortex: "Não" },
  { id: "s6", prefixo: "Sr.",  primeiroNome: "Tiago",  ultimoNome: "Lopes",   email: "tiago.lopes@upra.kor",   contacto: "+244 923 100 006", departamento: "Manutenção",     funcao: "Auxiliar",    moduloKortex: "Não" },
];

export default function AdminStaff() {
  const [q, setQ] = useState("");
  const rows = useMemo(() => seed.filter((r) =>
    [r.primeiroNome, r.ultimoNome, r.email, r.departamento, r.funcao].some((v) => v.toLowerCase().includes(q.toLowerCase()))
  ), [q]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader
        title="Staff"
        subtitle="Funcionários administrativos e técnicos"
        icon={<UserCog className="w-5 h-5 text-primary" />}
        right={<Link to="/admin/onboarding/staff"><Button size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" /> Registar Staff</Button></Link>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold tabular-nums">{seed.length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Departamentos</p><p className="text-2xl font-bold tabular-nums">{new Set(seed.map(r=>r.departamento)).size}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Com Kortex</p><p className="text-2xl font-bold tabular-nums">{seed.filter(r=>r.moduloKortex!=="Não").length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Sem Kortex</p><p className="text-2xl font-bold tabular-nums">{seed.filter(r=>r.moduloKortex==="Não").length}</p></div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Procurar staff..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" />
          </div>
          <div className="text-xs text-muted-foreground tabular-nums">{rows.length} de {seed.length}</div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-semibold px-4 py-2.5">Nome</th>
              <th className="text-left font-semibold px-4 py-2.5">Email</th>
              <th className="text-left font-semibold px-4 py-2.5">Contacto</th>
              <th className="text-left font-semibold px-4 py-2.5">Departamento</th>
              <th className="text-left font-semibold px-4 py-2.5">Função</th>
              <th className="text-left font-semibold px-4 py-2.5">Módulo Kortex</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="px-4 py-2.5 font-medium">{r.prefixo} {r.primeiroNome} {r.ultimoNome}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{r.email}</td>
                <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{r.contacto}</td>
                <td className="px-4 py-2.5">{r.departamento}</td>
                <td className="px-4 py-2.5">{r.funcao}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${r.moduloKortex==="Não"?"bg-muted text-muted-foreground":"bg-primary/10 text-primary"}`}>{r.moduloKortex}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

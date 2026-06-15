import { FinHeader } from "@/pages/financas/_FinHeader";
import { Building2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type Edificio = { id: string; nome: string; codigo: string; pisos: number; endereco: string };
type Sala = { id: string; edificioId: string; nome: string; tipo: string; piso: string; capacidade: number; ocupante?: string };

const edificios: Edificio[] = [
  { id: "e1", nome: "Edifício Central", codigo: "EC", pisos: 4, endereco: "Campus Principal" },
  { id: "e2", nome: "Edifício de Ciências", codigo: "ECI", pisos: 3, endereco: "Campus Principal" },
];

const salas: Sala[] = [
  { id: "s1", edificioId: "e1", nome: "A.101", tipo: "Sala de Aula", piso: "1", capacidade: 40 },
  { id: "s2", edificioId: "e1", nome: "A.102", tipo: "Sala de Aula", piso: "1", capacidade: 35 },
  { id: "s3", edificioId: "e1", nome: "G.201", tipo: "Gabinete", piso: "2", capacidade: 2, ocupante: "Dr. Manuel Rebelo" },
  { id: "s4", edificioId: "e1", nome: "G.202", tipo: "Gabinete", piso: "2", capacidade: 2, ocupante: "Dra. Helena Vaz" },
  { id: "s5", edificioId: "e2", nome: "L.001", tipo: "Laboratório", piso: "0", capacidade: 24 },
  { id: "s6", edificioId: "e2", nome: "BIB", tipo: "Biblioteca", piso: "0", capacidade: 80 },
  { id: "s7", edificioId: "e2", nome: "AUD", tipo: "Auditório", piso: "1", capacidade: 180 },
];

export default function AdminSalas() {
  const [q, setQ] = useState("");
  const rows = useMemo(() => salas.filter((s) =>
    [s.nome, s.tipo, s.ocupante || ""].some((v) => v.toLowerCase().includes(q.toLowerCase()))
  ), [q]);

  const capacidadeTotal = salas.reduce((a, s) => a + s.capacidade, 0);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader
        title="Salas e Edifícios"
        subtitle="Infraestrutura física da instituição"
        icon={<Building2 className="w-5 h-5 text-primary" />}
        right={<Link to="/admin/onboarding/espacos"><Button size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" /> Gerir Espaços</Button></Link>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Edifícios</p><p className="text-2xl font-bold tabular-nums">{edificios.length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Salas</p><p className="text-2xl font-bold tabular-nums">{salas.length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Gabinetes</p><p className="text-2xl font-bold tabular-nums">{salas.filter(s=>s.tipo==="Gabinete").length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Capacidade total</p><p className="text-2xl font-bold tabular-nums">{capacidadeTotal}</p></div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-muted/30">
          <h3 className="text-sm font-bold text-foreground">Edifícios</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-semibold px-4 py-2.5">Código</th>
              <th className="text-left font-semibold px-4 py-2.5">Nome</th>
              <th className="text-right font-semibold px-4 py-2.5">Pisos</th>
              <th className="text-left font-semibold px-4 py-2.5">Endereço</th>
              <th className="text-right font-semibold px-4 py-2.5">Salas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {edificios.map((e) => (
              <tr key={e.id} className="hover:bg-muted/30">
                <td className="px-4 py-2.5 font-mono text-xs font-semibold">{e.codigo}</td>
                <td className="px-4 py-2.5 font-medium">{e.nome}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{e.pisos}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{e.endereco}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{salas.filter(s=>s.edificioId===e.id).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Procurar sala..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" />
          </div>
          <div className="text-xs text-muted-foreground tabular-nums">{rows.length} de {salas.length}</div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-semibold px-4 py-2.5">Sala</th>
              <th className="text-left font-semibold px-4 py-2.5">Edifício</th>
              <th className="text-left font-semibold px-4 py-2.5">Tipo</th>
              <th className="text-left font-semibold px-4 py-2.5">Piso</th>
              <th className="text-right font-semibold px-4 py-2.5">Capacidade</th>
              <th className="text-left font-semibold px-4 py-2.5">Ocupante</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((s) => {
              const ed = edificios.find((e) => e.id === s.edificioId);
              return (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold">{s.nome}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{ed?.nome || "—"}</td>
                  <td className="px-4 py-2.5">{s.tipo}</td>
                  <td className="px-4 py-2.5 tabular-nums">{s.piso}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{s.capacidade}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{s.ocupante || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

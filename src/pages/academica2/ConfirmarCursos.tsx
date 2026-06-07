import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cursoTemplates } from "@/data/academica2Data";
import { GraduationCap, CheckCircle2, Check, Pencil, UserCog, Building2, ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";

const coordenadoresPool = [
  "Dr. Fábio Costa", "Dra. Marta Lopes", "Dr. Hugo Faria", "Dra. Sílvia Antunes",
  "Dr. Tomás Henriques", "Dra. Sara Quintas", "Dr. Rui Pinto", "Dra. Helena Vaz",
];

type CursoState = {
  confirmed: boolean;
  editing: boolean;
  name: string;
  coordenador: string;
  estudantesEsperados: number;
  years: number;
};

export default function ConfirmarCursos() {
  const [search, setSearch] = useState("");
  const [cursosState, setCursosState] = useState<Record<string, CursoState>>(() =>
    Object.fromEntries(cursoTemplates.map(c => [c.id, {
      confirmed: false, editing: false, name: c.name,
      coordenador: c.coordenador, estudantesEsperados: c.estudantesEsperados, years: c.years,
    }])) as Record<string, CursoState>
  );
  const update = (id: string, patch: Partial<CursoState>) =>
    setCursosState(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const confirmAll = () => {
    setCursosState(prev => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, { ...v, confirmed: true, editing: false }])) as Record<string, CursoState>);
    toast.success("Todos os cursos confirmados");
  };

  const confirmed = Object.values(cursosState).filter(c => c.confirmed).length;
  const filtered = cursoTemplates.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <Link to="/areaacademica/criador" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3 h-3" /> Voltar ao Criador
        </Link>
        <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <Badge className="mb-2 gap-1"><GraduationCap className="w-3 h-3" /> Passo 1 de 5</Badge>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" /> Confirmar Cursos
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Validar catálogo de cursos e atribuir coordenador a cada curso.</p>
          </div>
          <Button onClick={confirmAll} className="gap-2"><Check className="w-4 h-4" /> Confirmar Todos</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Cursos</p><p className="text-2xl font-bold">{cursoTemplates.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Confirmados</p><p className="text-2xl font-bold text-emerald-600">{confirmed}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Pendentes</p><p className="text-2xl font-bold text-amber-600">{cursoTemplates.length - confirmed}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Coordenadores</p><p className="text-2xl font-bold">{new Set(Object.values(cursosState).map(c => c.coordenador)).size}</p></Card>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Pesquisar curso…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(c => {
          const s = cursosState[c.id];
          return (
            <Card key={c.id} className={`p-4 transition ${s.confirmed ? "border-emerald-300 bg-emerald-50/40" : ""}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  {s.editing ? (
                    <Input value={s.name} onChange={e => update(c.id, { name: e.target.value })} className="h-8 text-sm font-semibold mb-1" />
                  ) : (
                    <p className="text-sm font-semibold truncate">{s.name}</p>
                  )}
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Building2 className="w-3 h-3" /> {c.faculty}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-[10px]">{c.code}</Badge>
                  {s.confirmed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <Label className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                    <UserCog className="w-3 h-3" /> Coordenador
                  </Label>
                  {s.editing ? (
                    <Select value={s.coordenador} onValueChange={v => update(c.id, { coordenador: v })}>
                      <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{coordenadoresPool.map(co => <SelectItem key={co} value={co}>{co}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-medium mt-0.5">{s.coordenador}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Anos</Label>
                    {s.editing ? (
                      <Input type="number" value={s.years} onChange={e => update(c.id, { years: +e.target.value })} className="h-8 text-xs mt-1" />
                    ) : <p className="text-sm mt-0.5">{s.years}</p>}
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Vagas est.</Label>
                    {s.editing ? (
                      <Input type="number" value={s.estudantesEsperados} onChange={e => update(c.id, { estudantesEsperados: +e.target.value })} className="h-8 text-xs mt-1" />
                    ) : <p className="text-sm mt-0.5">~{s.estudantesEsperados}</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Button size="sm" variant="outline" className="flex-1 gap-1 h-8 text-xs"
                  onClick={() => update(c.id, { editing: !s.editing })}>
                  <Pencil className="w-3 h-3" /> {s.editing ? "Concluir" : "Editar"}
                </Button>
                <Button size="sm" className={`flex-1 gap-1 h-8 text-xs ${s.confirmed ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                  onClick={() => update(c.id, { confirmed: !s.confirmed, editing: false })}>
                  <Check className="w-3 h-3" /> {s.confirmed ? "Confirmado" : "Confirmar"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" asChild><Link to="/areaacademica/criador">Cancelar</Link></Button>
        <Button asChild className="gap-2">
          <Link to="/areaacademica/criador/cadeiras">Avançar para Gerar Cadeiras <ArrowLeft className="w-4 h-4 rotate-180" /></Link>
        </Button>
      </div>
    </div>
  );
}

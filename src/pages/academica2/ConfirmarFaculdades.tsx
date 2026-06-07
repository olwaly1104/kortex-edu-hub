import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cursoTemplates } from "@/data/academica2Data";
import { Building2, Check, ArrowLeft, UserCog, GraduationCap, Users, ChevronRight, Pencil } from "lucide-react";
import { toast } from "sonner";

const decanosPool = [
  "Dr. Manuel Rebelo",
  "Dra. Helena Vaz",
  "Dr. Eduardo Pinto",
  "Dra. Cristina Marques",
  "Dr. Joaquim Sousa",
];

interface FacState {
  id: string;
  name: string;
  decano: string;
  confirmed: boolean;
  editing: boolean;
}

const initialFaculdades: FacState[] = [
  { id: "exatas", name: "Faculdade de Ciências Exatas", decano: "Dr. Manuel Rebelo", confirmed: false, editing: false },
  { id: "saude", name: "Faculdade de Ciências da Saúde", decano: "Dra. Helena Vaz", confirmed: false, editing: false },
  { id: "sociais", name: "Faculdade de Ciências Sociais", decano: "Dr. Eduardo Pinto", confirmed: false, editing: false },
];

export default function ConfirmarFaculdades() {
  const [faculdades, setFaculdades] = useState<FacState[]>(initialFaculdades);

  const cursosPorFaculdade = useMemo(() => {
    const map: Record<string, typeof cursoTemplates> = {};
    cursoTemplates.forEach(c => {
      const key = c.faculty;
      if (!map[key]) map[key] = [] as any;
      (map[key] as any).push(c);
    });
    return map;
  }, []);

  const update = (id: string, patch: Partial<FacState>) =>
    setFaculdades(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));

  const confirmAll = () => {
    setFaculdades(prev => prev.map(f => ({ ...f, confirmed: true, editing: false })));
    toast.success("Faculdades confirmadas");
  };

  const confirmedCount = faculdades.filter(f => f.confirmed).length;
  const totalCursos = cursoTemplates.length;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <Link to="/areaacademica/criador" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3 h-3" /> Voltar ao Criador
        </Link>
        <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <Badge className="mb-2 gap-1"><Building2 className="w-3 h-3" /> Passo 1 de 6</Badge>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" /> Confirmar Faculdades
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Validar as faculdades da universidade, o decano responsável e os cursos que ficam sob cada uma.
            </p>
          </div>
          <Button onClick={confirmAll} className="gap-2"><Check className="w-4 h-4" /> Confirmar Todas</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Faculdades</p><p className="text-2xl font-bold">{faculdades.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Decanos</p><p className="text-2xl font-bold">{faculdades.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Cursos Alocados</p><p className="text-2xl font-bold">{totalCursos}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Confirmadas</p><p className="text-2xl font-bold text-emerald-600">{confirmedCount}/{faculdades.length}</p></Card>
      </div>

      <div className="space-y-4">
        {faculdades.map(f => {
          const cursos = cursosPorFaculdade[f.name] ?? [];
          return (
            <Card key={f.id} className={`overflow-hidden transition ${f.confirmed ? "border-emerald-300" : ""}`}>
              <div className={`px-5 py-4 border-b flex items-center justify-between flex-wrap gap-3 ${f.confirmed ? "bg-emerald-50/40" : "bg-muted/20"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    {f.editing ? (
                      <Input value={f.name} onChange={e => update(f.id, { name: e.target.value })} className="h-8 text-sm font-semibold mb-1" />
                    ) : (
                      <p className="text-base font-semibold truncate">{f.name}</p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {cursos.length} cursos</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cursos.reduce((a, c) => a + c.estudantesEsperados, 0)} estudantes est.</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card">
                    <UserCog className="w-3.5 h-3.5 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground leading-tight">Decano</p>
                      {f.editing ? (
                        <Select value={f.decano} onValueChange={v => update(f.id, { decano: v })}>
                          <SelectTrigger className="h-6 text-xs border-0 px-0 shadow-none focus:ring-0"><SelectValue /></SelectTrigger>
                          <SelectContent>{decanosPool.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : (
                        <p className="text-xs font-semibold leading-tight">{f.decano}</p>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1 h-8" onClick={() => update(f.id, { editing: !f.editing })}>
                    <Pencil className="w-3 h-3" /> {f.editing ? "Concluir" : "Editar"}
                  </Button>
                  <Button size="sm" className={`gap-1 h-8 ${f.confirmed ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                    onClick={() => update(f.id, { confirmed: !f.confirmed, editing: false })}>
                    <Check className="w-3 h-3" /> {f.confirmed ? "Confirmada" : "Confirmar"}
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Cursos da Faculdade</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {cursos.map(c => (
                    <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-md border bg-card hover:bg-muted/30 transition">
                      <span className="inline-flex items-center justify-center h-5 min-w-[34px] px-1 rounded bg-primary text-primary-foreground text-[10px] font-bold">{c.code}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{c.years} anos · ~{c.estudantesEsperados} estudantes</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" asChild><Link to="/areaacademica/criador">Voltar</Link></Button>
        <Button asChild className="gap-2"><Link to="/areaacademica/criador/cursos">Próximo: Confirmar Cursos <ChevronRight className="w-4 h-4" /></Link></Button>
      </div>
    </div>
  );
}

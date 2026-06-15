import { useMemo, useState } from "react";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, UserPlus, Trash2, Users, GraduationCap, Briefcase, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Mode = "docentes" | "staff";

type Person = {
  id: string;
  nome: string;
  email: string;
  // docente
  faculdade?: string;
  cadeira?: string;
  grau?: string;
  // staff
  departamento?: string;
  funcao?: string;
};

const faculdadesPool = ["Ciências Exatas", "Ciências da Saúde", "Ciências Sociais"];
const cadeirasPool   = ["Matemática I", "Algoritmos", "Anatomia", "Direito Civil", "Microeconomia"];
const grausPool      = ["Licenciado", "Mestre", "Doutor", "Pós-doc"];

const departamentosPool = ["Académica", "Finanças", "GAP", "TI", "Recursos Humanos", "Manutenção"];
const funcoesPool       = ["Assistente", "Coordenador", "Técnico", "Auxiliar", "Diretor"];

export default function OnboardingPessoas({ mode }: { mode: Mode }) {
  const isDoc = mode === "docentes";

  const seed: Person[] = isDoc
    ? [
        { id: "d1", nome: "Prof. Sofia Martins", email: "sofia.martins@upra.kor", faculdade: faculdadesPool[0], cadeira: "Matemática I", grau: "Doutor" },
        { id: "d2", nome: "Prof. Carlos Mendes", email: "carlos.mendes@upra.kor", faculdade: faculdadesPool[1], cadeira: "Anatomia",     grau: "Mestre" },
      ]
    : [
        { id: "s1", nome: "Joana Pinto",  email: "joana.pinto@upra.kor",  departamento: "Académica", funcao: "Coordenador" },
        { id: "s2", nome: "Rui Tavares",  email: "rui.tavares@upra.kor",  departamento: "TI",        funcao: "Técnico" },
      ];

  const [rows, setRows] = useState<Person[]>(seed);
  const [draft, setDraft] = useState<Person>(
    isDoc
      ? { id: "", nome: "", email: "", faculdade: faculdadesPool[0], cadeira: cadeirasPool[0], grau: grausPool[2] }
      : { id: "", nome: "", email: "", departamento: departamentosPool[0], funcao: funcoesPool[0] }
  );

  const totals = useMemo(() => ({
    total: rows.length,
    grupos: isDoc
      ? new Set(rows.map(r => r.faculdade)).size
      : new Set(rows.map(r => r.departamento)).size,
  }), [rows, isDoc]);

  const add = () => {
    if (!draft.nome.trim() || !draft.email.trim()) { toast.error("Nome e email obrigatórios"); return; }
    setRows(prev => [...prev, { ...draft, id: String(Date.now()) }]);
    setDraft({ ...draft, id: "", nome: "", email: "" });
    toast.success(`${isDoc ? "Docente" : "Funcionário"} adicionado`);
  };
  const remove = (id: string) => setRows(prev => prev.filter(r => r.id !== id));
  const update = (id: string, patch: Partial<Person>) => setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  const simulateImport = () => {
    const generated: Person[] = Array.from({ length: 8 }).map((_, i) => isDoc
      ? { id: `id-${Date.now()}-${i}`, nome: `Prof. Importado ${i + 1}`, email: `docente${i + 1}@upra.kor`, faculdade: faculdadesPool[i % faculdadesPool.length], cadeira: cadeirasPool[i % cadeirasPool.length], grau: grausPool[i % grausPool.length] }
      : { id: `is-${Date.now()}-${i}`, nome: `Staff Importado ${i + 1}`, email: `staff${i + 1}@upra.kor`,    departamento: departamentosPool[i % departamentosPool.length], funcao: funcoesPool[i % funcoesPool.length] }
    );
    setRows(prev => [...prev, ...generated]);
    toast.success(`${generated.length} ${isDoc ? "docentes" : "funcionários"} importados`);
  };

  const HeaderIcon = isDoc ? GraduationCap : Briefcase;
  const grid = isDoc
    ? "grid-cols-[1fr_1.2fr_1fr_1fr_110px_40px]"
    : "grid-cols-[1fr_1.4fr_1fr_1fr_40px]";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <OnboardingStepBanner />

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Users className="w-3.5 h-3.5" /><p className="text-xs">{isDoc ? "Docentes" : "Staff"}</p></div><p className="text-2xl font-bold">{totals.total}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><HeaderIcon className="w-3.5 h-3.5" /><p className="text-xs">{isDoc ? "Faculdades" : "Departamentos"}</p></div><p className="text-2xl font-bold">{totals.grupos}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><CheckCircle2 className="w-3.5 h-3.5" /><p className="text-xs">Activos</p></div><p className="text-2xl font-bold text-emerald-600">{totals.total}</p></Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold">Importação em lote</h2>
            <p className="text-xs text-muted-foreground">Carregue ficheiro CSV/Excel para registar todos de uma vez.</p>
          </div>
          <Button onClick={simulateImport} className="gap-2"><FileSpreadsheet className="w-4 h-4" /> Importar ficheiro</Button>
        </div>
        <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground bg-muted/20">
          <Upload className="w-6 h-6 mx-auto mb-2" />
          Arraste o ficheiro aqui ou clique em <span className="font-semibold text-foreground">Importar ficheiro</span>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold mb-3">Adicionar manualmente</h2>
        <div className={`grid grid-cols-1 md:${isDoc ? "grid-cols-6" : "grid-cols-5"} gap-2`}>
          <Input className="h-9 md:col-span-2" placeholder="Nome completo" value={draft.nome} onChange={e => setDraft({ ...draft, nome: e.target.value })} />
          <Input className="h-9 md:col-span-2" placeholder="Email institucional" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} />
          {isDoc ? (
            <>
              <Select value={draft.faculdade} onValueChange={v => setDraft({ ...draft, faculdade: v })}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Faculdade" /></SelectTrigger>
                <SelectContent>{faculdadesPool.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={add} className="h-9 gap-1"><UserPlus className="w-4 h-4" /> Adicionar</Button>
            </>
          ) : (
            <Button onClick={add} className="h-9 gap-1"><UserPlus className="w-4 h-4" /> Adicionar</Button>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className={`grid ${grid} gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b`}>
          <span>Nome</span><span>Email</span>
          {isDoc ? (<><span>Faculdade</span><span>Cadeira</span><span>Grau</span></>) : (<><span>Departamento</span><span>Função</span></>)}
          <span></span>
        </div>
        <div className="divide-y">
          {rows.map(r => (
            <div key={r.id} className={`grid ${grid} gap-2 px-4 py-2 items-center`}>
              <Input value={r.nome} onChange={e => update(r.id, { nome: e.target.value })} className="h-8 text-xs" />
              <Input value={r.email} onChange={e => update(r.id, { email: e.target.value })} className="h-8 text-xs" />
              {isDoc ? (
                <>
                  <Select value={r.faculdade} onValueChange={v => update(r.id, { faculdade: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{faculdadesPool.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={r.cadeira} onValueChange={v => update(r.id, { cadeira: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{cadeirasPool.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={r.grau} onValueChange={v => update(r.id, { grau: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{grausPool.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <Select value={r.departamento} onValueChange={v => update(r.id, { departamento: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{departamentosPool.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={r.funcao} onValueChange={v => update(r.id, { funcao: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{funcoesPool.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </>
              )}
              <Button size="icon" variant="ghost" onClick={() => remove(r.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="px-4 py-6 text-xs text-muted-foreground italic text-center">
              Sem registos. Use <Badge variant="outline" className="mx-1">Importar ficheiro</Badge> ou adicione manualmente.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

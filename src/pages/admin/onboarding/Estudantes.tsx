import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, UserPlus, Trash2, Users, GraduationCap, Layers, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Row = { id: string; nome: string; email: string; curso: string; ano: string; turma: string; valid: boolean };

const cursosPool = ["ARQ", "ENG", "MED", "DIR", "ECO"];
const turmasPool = ["A", "B", "C", "D", "E"];

const seedRows: Row[] = [
  { id: "1", nome: "Ana Silva",      email: "ana.silva@upra.kor",     curso: "ARQ", ano: "1", turma: "A", valid: true },
  { id: "2", nome: "Bruno Costa",    email: "bruno.costa@upra.kor",   curso: "ENG", ano: "1", turma: "B", valid: true },
  { id: "3", nome: "Carla Mendes",   email: "carla.mendes@upra.kor",  curso: "MED", ano: "2", turma: "A", valid: true },
];

export default function OnboardingEstudantes() {
  const [params] = useSearchParams();
  const initialTab = params.get("tab") === "validar" ? "validar" : "importar";

  const [rows, setRows] = useState<Row[]>(seedRows);
  const [draft, setDraft] = useState({ nome: "", email: "", curso: "ARQ", ano: "1", turma: "A" });

  const totals = useMemo(() => ({
    total: rows.length,
    validos: rows.filter(r => r.valid).length,
    cursos: new Set(rows.map(r => r.curso)).size,
  }), [rows]);

  const addManual = () => {
    if (!draft.nome.trim() || !draft.email.trim()) { toast.error("Nome e email obrigatórios"); return; }
    setRows(prev => [...prev, { id: String(Date.now()), ...draft, valid: true }]);
    setDraft({ nome: "", email: "", curso: "ARQ", ano: "1", turma: "A" });
    toast.success("Estudante adicionado");
  };

  const remove = (id: string) => setRows(prev => prev.filter(r => r.id !== id));
  const update = (id: string, patch: Partial<Row>) => setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  const simulateImport = () => {
    const generated: Row[] = Array.from({ length: 12 }).map((_, i) => ({
      id: `imp-${Date.now()}-${i}`,
      nome: `Estudante Importado ${i + 1}`,
      email: `estudante${i + 1}@upra.kor`,
      curso: cursosPool[i % cursosPool.length],
      ano: String((i % 4) + 1),
      turma: turmasPool[i % turmasPool.length],
      valid: true,
    }));
    setRows(prev => [...prev, ...generated]);
    toast.success(`${generated.length} estudantes importados`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <OnboardingStepBanner />

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Users className="w-3.5 h-3.5" /><p className="text-xs">Estudantes</p></div><p className="text-2xl font-bold">{totals.total}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><CheckCircle2 className="w-3.5 h-3.5" /><p className="text-xs">Válidos</p></div><p className="text-2xl font-bold text-emerald-600">{totals.validos}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><GraduationCap className="w-3.5 h-3.5" /><p className="text-xs">Cursos</p></div><p className="text-2xl font-bold">{totals.cursos}</p></Card>
      </div>

      <Tabs defaultValue={initialTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="importar" className="gap-1.5"><Upload className="w-3.5 h-3.5" /> Importar</TabsTrigger>
          <TabsTrigger value="validar" className="gap-1.5"><Layers className="w-3.5 h-3.5" /> Validar matrículas</TabsTrigger>
        </TabsList>

        <TabsContent value="importar" className="space-y-4 mt-0">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold">Importação em lote</h2>
                <p className="text-xs text-muted-foreground">Carregue um ficheiro CSV/Excel com colunas: nome, email, curso, ano, turma.</p>
              </div>
              <Button onClick={simulateImport} className="gap-2"><FileSpreadsheet className="w-4 h-4" /> Importar ficheiro</Button>
            </div>
            <div className="border-2 border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground bg-muted/20">
              <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              Arraste o ficheiro aqui ou clique em <span className="font-semibold text-foreground">Importar ficheiro</span>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-3">Adicionar manualmente</h2>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
              <Input className="md:col-span-2 h-9" placeholder="Nome completo" value={draft.nome} onChange={e => setDraft({ ...draft, nome: e.target.value })} />
              <Input className="md:col-span-2 h-9" placeholder="Email institucional" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} />
              <Select value={draft.curso} onValueChange={v => setDraft({ ...draft, curso: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{cursosPool.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={addManual} className="h-9 gap-1"><UserPlus className="w-4 h-4" /> Adicionar</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="validar" className="space-y-4 mt-0">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1fr_1.4fr_90px_70px_80px_40px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
              <span>Nome</span><span>Email</span><span>Curso</span><span>Ano</span><span>Turma</span><span></span>
            </div>
            <div className="divide-y">
              {rows.map(r => (
                <div key={r.id} className="grid grid-cols-[1fr_1.4fr_90px_70px_80px_40px] gap-2 px-4 py-2 items-center">
                  <Input value={r.nome} onChange={e => update(r.id, { nome: e.target.value })} className="h-8 text-xs" />
                  <Input value={r.email} onChange={e => update(r.id, { email: e.target.value })} className="h-8 text-xs" />
                  <Select value={r.curso} onValueChange={v => update(r.id, { curso: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{cursosPool.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={r.ano} onValueChange={v => update(r.id, { ano: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{["1","2","3","4","5"].map(c => <SelectItem key={c} value={c}>{c}º</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={r.turma} onValueChange={v => update(r.id, { turma: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{turmasPool.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" onClick={() => remove(r.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              {rows.length === 0 && (
                <p className="px-4 py-6 text-xs text-muted-foreground italic text-center">Sem estudantes. Use o separador <Badge variant="outline" className="mx-1">Importar</Badge> para começar.</p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useMemo, useState } from "react";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, FileSpreadsheet, UserPlus, Trash2, Users, GraduationCap, Briefcase, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";

type Mode = "docentes" | "staff";

type Person = {
  id: string;
  prefixo?: string;
  nome: string;
  email: string;
  contacto?: string;
  grau?: string;
  departamento?: string;
  funcao?: string;
};

const prefixosPool = ["Sr.", "Sra.", "Dr.", "Dra.", "Prof.", "Eng.", "Me."];

const grausPool      = ["Licenciado", "Mestre", "Doutor", "Pós-doc"];

const departamentosPool = ["Académica", "Finanças", "GAP", "TI", "Recursos Humanos", "Manutenção"];
const funcoesPool       = ["Assistente", "Coordenador", "Técnico", "Auxiliar", "Diretor"];

export default function OnboardingPessoas({ mode }: { mode: Mode }) {
  const isDoc = mode === "docentes";

  const seed: Person[] = isDoc
    ? [
        { id: "d1", prefixo: "Prof.", nome: "Sofia Martins", email: "sofia.martins@upra.kor", contacto: "+244 923 000 001", grau: "Doutor" },
        { id: "d2", prefixo: "Prof.", nome: "Carlos Mendes", email: "carlos.mendes@upra.kor", contacto: "+244 923 000 002", grau: "Mestre" },
      ]
    : [
        { id: "s1", prefixo: "Sra.", nome: "Joana Pinto", email: "joana.pinto@upra.kor", contacto: "+244 923 100 001", departamento: "Académica", funcao: "Coordenador" },
        { id: "s2", prefixo: "Sr.", nome: "Rui Tavares", email: "rui.tavares@upra.kor", contacto: "+244 923 100 002", departamento: "TI", funcao: "Técnico" },
      ];

  const [rows, setRows] = useState<Person[]>(seed);
  const emptyDraft: Person = isDoc
    ? { id: "", prefixo: "", nome: "", email: "", contacto: "", grau: grausPool[2] }
    : { id: "", prefixo: "", nome: "", email: "", contacto: "", departamento: departamentosPool[0], funcao: funcoesPool[0] };
  const [draft, setDraft] = useState<Person>(emptyDraft);
  const [primeiroNome, setPrimeiroNome] = useState("");
  const [ultimoNome, setUltimoNome] = useState("");

  const totals = useMemo(() => ({
    total: rows.length,
    grupos: isDoc ? new Set(rows.map(r => r.grau)).size : new Set(rows.map(r => r.departamento)).size,
  }), [rows, isDoc]);

  const add = () => {
    if (!primeiroNome.trim() || !ultimoNome.trim()) { toast.error("Primeiro e último nome são obrigatórios"); return; }
    const nome = `${primeiroNome.trim()} ${ultimoNome.trim()}`;
    const emailBase = `${primeiroNome.trim().toLowerCase()}.${ultimoNome.trim().toLowerCase()}`.normalize("NFD").replace(/[^a-z.]/g, "");
    const email = `${emailBase}@upra.kor`;
    setRows(prev => [...prev, { ...draft, nome, email, id: String(Date.now()) }]);
    setDraft(emptyDraft);
    setPrimeiroNome("");
    setUltimoNome("");
    toast.success(`${isDoc ? "Docente" : "Funcionário"} adicionado. Email gerado: ${email}`);
  };
  const remove = (id: string) => setRows(prev => prev.filter(r => r.id !== id));
  const update = (id: string, patch: Partial<Person>) => setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  const simulateImport = () => {
    const generated: Person[] = Array.from({ length: 8 }).map((_, i) => isDoc
      ? { id: `id-${Date.now()}-${i}`, prefixo: "Prof.", nome: `Importado ${i + 1}`, email: `docente${i + 1}@upra.kor`, contacto: `+244 923 200 00${i}`, grau: grausPool[i % grausPool.length] }
      : { id: `is-${Date.now()}-${i}`, prefixo: "Sr.", nome: `Staff Importado ${i + 1}`, email: `staff${i + 1}@upra.kor`, contacto: `+244 923 300 00${i}`, departamento: departamentosPool[i % departamentosPool.length], funcao: funcoesPool[i % funcoesPool.length] }
    );
    setRows(prev => [...prev, ...generated]);
    toast.success(`${generated.length} ${isDoc ? "docentes" : "funcionários"} importados`);
  };

  const HeaderIcon = isDoc ? GraduationCap : Briefcase;
  const grid = isDoc
    ? "grid-cols-[90px_1.2fr_1.4fr_1fr_1fr_40px]"
    : "grid-cols-[90px_1fr_1.4fr_1fr_1fr_1fr_40px]";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <OnboardingStepBanner />

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Users className="w-3.5 h-3.5" /><p className="text-xs">{isDoc ? "Docentes" : "Staff"}</p></div><p className="text-2xl font-bold">{totals.total}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><HeaderIcon className="w-3.5 h-3.5" /><p className="text-xs">{isDoc ? "Faculdades" : "Departamentos"}</p></div><p className="text-2xl font-bold">{totals.grupos}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><CheckCircle2 className="w-3.5 h-3.5" /><p className="text-xs">Activos</p></div><p className="text-2xl font-bold text-emerald-600">{totals.total}</p></Card>
      </div>

      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="manual" className="gap-1.5"><UserPlus className="w-3.5 h-3.5" /> Adicionar manualmente</TabsTrigger>
          <TabsTrigger value="importar" className="gap-1.5"><Upload className="w-3.5 h-3.5" /> Importar</TabsTrigger>
        </TabsList>

        <TabsContent value="importar" className="mt-0">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold">Importação em lote</h2>
                <p className="text-xs text-muted-foreground">Carregue um ficheiro CSV/Excel para registar todos de uma vez.</p>
              </div>
              <Button onClick={simulateImport} className="gap-2"><FileSpreadsheet className="w-4 h-4" /> Importar ficheiro</Button>
            </div>
            <div className="border-2 border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground bg-muted/20">
              <Upload className="w-6 h-6 mx-auto mb-2" />
              Arraste o ficheiro aqui ou clique em <span className="font-semibold text-foreground">Importar ficheiro</span>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-0">
          <Card className="p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Adicionar manualmente</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3 h-3" /> O email <span className="font-semibold">@upra.kor</span> é gerado automaticamente após confirmação.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Nome completo *</Label>
                <Input className="h-9" placeholder="Ex: Maria Silva" value={draft.nome} onChange={e => setDraft({ ...draft, nome: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Contacto</Label>
                <Input className="h-9" placeholder="+244 ..." value={draft.contacto || ""} onChange={e => setDraft({ ...draft, contacto: e.target.value })} />
              </div>
              {isDoc ? (
                <div>
                  <Label className="text-xs">Grau académico</Label>
                  <Select value={draft.grau} onValueChange={v => setDraft({ ...draft, grau: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{grausPool.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ) : (
                <>
                  <div>
                    <Label className="text-xs">Departamento</Label>
                    <Select value={draft.departamento} onValueChange={v => setDraft({ ...draft, departamento: v })}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{departamentosPool.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Função</Label>
                    <Select value={draft.funcao} onValueChange={v => setDraft({ ...draft, funcao: v })}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{funcoesPool.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={add} className="gap-1.5"><UserPlus className="w-4 h-4" /> Adicionar</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="overflow-hidden">
        <div className="px-4 py-2.5 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">{isDoc ? "Docentes registados" : "Staff registado"}</h3>
          <span className="text-xs text-muted-foreground">{rows.length} {rows.length === 1 ? "registo" : "registos"}</span>
        </div>
        <div className={`grid ${grid} gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b`}>
          <span>Nome</span><span>Email</span>
          {isDoc ? (<><span>Contacto</span><span>Grau</span></>) : (<><span>Contacto</span><span>Departamento</span><span>Função</span></>)}
          <span></span>
        </div>
        <div className="divide-y">
          {rows.map(r => (
            <div key={r.id} className={`grid ${grid} gap-2 px-4 py-2 items-center`}>
              <Input value={r.nome} onChange={e => update(r.id, { nome: e.target.value })} className="h-8 text-xs" />
              <Input value={r.email} readOnly disabled className="h-8 text-xs bg-muted/40 cursor-not-allowed" />
              <Input value={r.contacto || ""} onChange={e => update(r.id, { contacto: e.target.value })} className="h-8 text-xs" placeholder="+244 ..." />
              {isDoc ? (
                <Select value={r.grau} onValueChange={v => update(r.id, { grau: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{grausPool.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
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
            <p className="px-4 py-8 text-xs text-muted-foreground italic text-center">Sem registos. Use os separadores acima para começar.</p>
          )}
        </div>
      </Card>

    </div>
  );
}

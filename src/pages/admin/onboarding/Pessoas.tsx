import { useState } from "react";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, UserPlus, GraduationCap, Briefcase } from "lucide-react";
import { toast } from "sonner";

type Mode = "docentes" | "staff";

type Person = {
  id: string;
  prefixo?: string;
  primeiroNome: string;
  ultimoNome: string;
  email: string;
  contacto?: string;
  grau?: string;
  departamento?: string;
  funcao?: string;
  moduloKortex?: string;
};

const prefixosPool = ["Sr.", "Sra.", "Dr.", "Dra.", "Prof.", "Eng.", "Me."];
const grausPool = ["Licenciado", "Mestre", "Doutor", "Pós-doc"];
const departamentosPool = ["Académica", "Finanças", "GAP", "TI", "Recursos Humanos", "Manutenção"];
const funcoesPool = ["Assistente", "Coordenador", "Técnico", "Auxiliar", "Diretor"];
const modulosKortexPool = ["Estudante", "Professor", "Coordenador", "Decano", "Reitor", "Finanças", "Académica", "GAP", "Inscrições", "Administrador"];

const emailFrom = (pn: string, un: string) => {
  if (!pn.trim() || !un.trim()) return "";
  const base = `${pn.trim().toLowerCase()}.${un.trim().toLowerCase()}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z.]/g, "");
  return `${base}@upra.kor`;
};

export default function OnboardingPessoas({ mode }: { mode: Mode }) {
  const isDoc = mode === "docentes";

  const seed: Person[] = isDoc
    ? [
        { id: "d1", prefixo: "Prof.", primeiroNome: "Sofia", ultimoNome: "Martins", email: "sofia.martins@upra.kor", contacto: "+244 923 000 001", grau: "Doutor", moduloKortex: "Professor" },
        { id: "d2", prefixo: "Prof.", primeiroNome: "Carlos", ultimoNome: "Mendes", email: "carlos.mendes@upra.kor", contacto: "+244 923 000 002", grau: "Mestre", moduloKortex: "Professor" },
      ]
    : [
        { id: "s1", prefixo: "Sra.", primeiroNome: "Joana", ultimoNome: "Pinto", email: "joana.pinto@upra.kor", contacto: "+244 923 100 001", departamento: "Académica", funcao: "Coordenador", moduloKortex: "Académica" },
        { id: "s2", prefixo: "Sr.", primeiroNome: "Rui", ultimoNome: "Tavares", email: "rui.tavares@upra.kor", contacto: "+244 923 100 002", departamento: "TI", funcao: "Técnico", moduloKortex: "Administrador" },
      ];

  const [rows, setRows] = useState<Person[]>(seed);

  const addEmptyRow = () => {
    const novo: Person = isDoc
      ? { id: String(Date.now()), prefixo: "", primeiroNome: "", ultimoNome: "", email: "", contacto: "", grau: grausPool[2], moduloKortex: "Professor" }
      : { id: String(Date.now()), prefixo: "", primeiroNome: "", ultimoNome: "", email: "", contacto: "", departamento: departamentosPool[0], funcao: funcoesPool[0], moduloKortex: "Académica" };
    setRows(prev => [...prev, novo]);
  };

  const update = (id: string, patch: Partial<Person>) => setRows(prev => prev.map(r => {
    if (r.id !== id) return r;
    const next = { ...r, ...patch };
    if (patch.primeiroNome !== undefined || patch.ultimoNome !== undefined) {
      next.email = emailFrom(next.primeiroNome, next.ultimoNome);
    }
    return next;
  }));

  const simulateImport = () => {
    const generated: Person[] = Array.from({ length: 8 }).map((_, i) => {
      const n = i + 1;
      if (isDoc) {
        return {
          id: `id-${Date.now()}-${i}`,
          prefixo: "Prof.",
          primeiroNome: "Importado",
          ultimoNome: `${n}`,
          email: `docente${n}@upra.kor`,
          contacto: `+244 923 200 00${i}`,
          grau: grausPool[i % grausPool.length],
        };
      }
      return {
        id: `is-${Date.now()}-${i}`,
        prefixo: "Sr.",
        primeiroNome: "Staff",
        ultimoNome: `Importado ${n}`,
        email: `staff${n}@upra.kor`,
        contacto: `+244 923 300 00${i}`,
        departamento: departamentosPool[i % departamentosPool.length],
        funcao: funcoesPool[i % funcoesPool.length],
      };
    });
    setRows(prev => [...prev, ...generated]);
    toast.success(`${generated.length} ${isDoc ? "docentes" : "funcionários"} importados`);
  };

  const HeaderIcon = isDoc ? GraduationCap : Briefcase;
  const grid = isDoc
    ? "grid-cols-[80px_1fr_1fr_1.4fr_1fr_1fr_1.2fr]"
    : "grid-cols-[80px_1fr_1fr_1.4fr_1fr_1fr_1fr_1.2fr]";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <OnboardingStepBanner />

      <div className="flex items-center gap-3 pb-1">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <HeaderIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">{isDoc ? "Docentes" : "Staff"}</h1>
          <p className="text-xs text-muted-foreground">Registe {isDoc ? "os docentes" : "o pessoal administrativo"}. O email institucional <span className="font-medium text-foreground">@upra.kor</span> é gerado automaticamente.</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-muted-foreground">Registos</p>
          <p className="text-lg font-semibold">{rows.length}</p>
        </div>
      </div>

      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="manual" className="gap-1.5"><UserPlus className="w-3.5 h-3.5" /> Adicionar manualmente</TabsTrigger>
          <TabsTrigger value="importar" className="gap-1.5"><Upload className="w-3.5 h-3.5" /> Importar</TabsTrigger>
        </TabsList>

        <TabsContent value="importar" className="mt-0 space-y-4">
          <div className="flex items-center gap-3">
            <Button onClick={simulateImport} variant="outline" className="gap-2 h-9">
              <Upload className="w-4 h-4" /> Carregar CSV
            </Button>
            <span className="text-[11px] text-muted-foreground">Ficheiro .csv ou .xlsx</span>
          </div>

          <Card className="overflow-hidden">
            <div className={`grid ${grid} gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b`}>
              <span>Prefixo</span><span>Primeiro nome</span><span>Último nome</span><span>Email</span>
              {isDoc ? (<><span>Contacto</span><span>Grau</span></>) : (<><span>Contacto</span><span>Departamento</span><span>Função</span></>)}
              <span>Módulo Kortex</span>
            </div>
            <div className="divide-y">
              {rows.map(r => (
                <div key={r.id} className={`grid ${grid} gap-2 px-4 py-2 items-center`}>
                  <Select value={r.prefixo || ""} onValueChange={v => update(r.id, { prefixo: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>{prefixosPool.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input value={r.primeiroNome} onChange={e => update(r.id, { primeiroNome: e.target.value })} className="h-8 text-xs" placeholder="Primeiro" />
                  <Input value={r.ultimoNome} onChange={e => update(r.id, { ultimoNome: e.target.value })} className="h-8 text-xs" placeholder="Último" />
                  <Input value={r.email} readOnly disabled className="h-8 text-xs bg-muted/40 cursor-not-allowed" placeholder="auto @upra.kor" />
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
                  <div className="flex justify-end">
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <p className="px-4 py-8 text-xs text-muted-foreground italic text-center">Sem registos. Clique em adicionar para começar.</p>
              )}
            </div>
            <div className="border-t bg-muted/10 px-4 py-2.5">
              <Button variant="ghost" size="sm" onClick={addEmptyRow} className="h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/5">
                <UserPlus className="w-3.5 h-3.5" /> Adicionar {isDoc ? "docente" : "funcionário"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-0">
          <Card className="overflow-hidden">
            <div className={`grid ${grid} gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b`}>
              <span>Prefixo</span><span>Primeiro nome</span><span>Último nome</span><span>Email</span>
              {isDoc ? (<><span>Contacto</span><span>Grau</span></>) : (<><span>Contacto</span><span>Departamento</span><span>Função</span></>)}
              <span></span>
            </div>
            <div className="divide-y">
              {rows.map(r => (
                <div key={r.id} className={`grid ${grid} gap-2 px-4 py-2 items-center`}>
                  <Select value={r.prefixo || ""} onValueChange={v => update(r.id, { prefixo: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>{prefixosPool.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input value={r.primeiroNome} onChange={e => update(r.id, { primeiroNome: e.target.value })} className="h-8 text-xs" placeholder="Primeiro" />
                  <Input value={r.ultimoNome} onChange={e => update(r.id, { ultimoNome: e.target.value })} className="h-8 text-xs" placeholder="Último" />
                  <Input value={r.email} readOnly disabled className="h-8 text-xs bg-muted/40 cursor-not-allowed" placeholder="auto @upra.kor" />
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
                  <div className="flex justify-end">
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <p className="px-4 py-8 text-xs text-muted-foreground italic text-center">Sem registos. Clique em adicionar para começar.</p>
              )}
            </div>
            <div className="border-t bg-muted/10 px-4 py-2.5">
              <Button variant="ghost" size="sm" onClick={addEmptyRow} className="h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/5">
                <UserPlus className="w-3.5 h-3.5" /> Adicionar {isDoc ? "docente" : "funcionário"}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

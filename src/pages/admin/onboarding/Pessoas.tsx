import { useState } from "react";
import { OnboardingStepBanner, markOnboardingStepDone } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, UserPlus, GraduationCap, Briefcase, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { provisionKortexUser } from "@/lib/accountProvisioning";
import { loadDocentes, saveDocentes, saveStaff, type DocenteRow } from "@/lib/peopleStorage";
import { DocenteFormDialog } from "@/components/admin/DocenteFormDialog";

type Mode = "docentes" | "staff";


type Person = {
  id: string;
  prefixo?: string;
  primeiroNome: string;
  ultimoNome: string;
  genero?: string;
  email: string;
  contacto?: string;
  grau?: string;
  departamento?: string;
  funcao?: string;
  kortex?: boolean;
};

const prefixosPool = ["Sr.", "Sra.", "Dr.", "Dra.", "Prof.", "Eng.", "Me."];
const generosPool = ["Masculino", "Feminino"];
const grausPool = ["Licenciado", "Mestre", "Doutor", "Pós-doc"];
const departamentosPool = ["Académica", "Finanças", "GAP", "TI", "Recursos Humanos", "Manutenção"];
const funcoesPool = ["Assistente", "Coordenador", "Técnico", "Auxiliar", "Diretor"];

const emailFrom = (pn: string, un: string) => {
  if (!pn.trim() || !un.trim()) return "";
  const base = `${pn.trim().toLowerCase()}.${un.trim().toLowerCase()}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z.]/g, "");
  return `${base}@upra.kor`;
};

export default function OnboardingPessoas({ mode }: { mode: Mode }) {
  const { user } = useAuth();
  const isDoc = mode === "docentes";
  const [saving, setSaving] = useState(false);

  const seed: Person[] = [];


  const [rows, setRows] = useState<Person[]>(seed);

  const addEmptyRow = () => {
    const novo: Person = isDoc
      ? { id: String(Date.now()), prefixo: "", primeiroNome: "", ultimoNome: "", genero: "", email: "", contacto: "", grau: grausPool[2], kortex: true }
      : { id: String(Date.now()), prefixo: "", primeiroNome: "", ultimoNome: "", genero: "", email: "", contacto: "", departamento: departamentosPool[0], funcao: funcoesPool[0], kortex: true };
    setRows(prev => [...prev, novo]);
  };

  const update = (id: string, patch: Partial<Person>) => setRows(prev => prev.map(r => {
    if (r.id !== id) return r;
    const next = { ...r, ...patch };
    if (patch.primeiroNome !== undefined || patch.ultimoNome !== undefined || patch.kortex !== undefined) {
      next.email = next.kortex ? emailFrom(next.primeiroNome, next.ultimoNome) : "";
    }
    return next;
  }));

  const simulateImport = () => {
    const generated: Person[] = Array.from({ length: 8 }).map((_, i) => {
      const n = i + 1;
      const pn = isDoc ? "Importado" : "Staff";
      const un = isDoc ? `${n}` : `Importado ${n}`;
      if (isDoc) {
        return {
          id: `id-${Date.now()}-${i}`,
          prefixo: "Prof.",
          primeiroNome: pn,
          ultimoNome: un,
          genero: i % 2 === 0 ? "Masculino" : "Feminino",
          email: emailFrom(pn, un),
          contacto: `+244 923 200 00${i}`,
          grau: grausPool[i % grausPool.length],
          kortex: true,
        };
      }
      return {
        id: `is-${Date.now()}-${i}`,
        prefixo: "Sr.",
        primeiroNome: pn,
        ultimoNome: un,
        genero: i % 2 === 0 ? "Masculino" : "Feminino",
        email: emailFrom(pn, un),
        contacto: `+244 923 300 00${i}`,
        departamento: departamentosPool[i % departamentosPool.length],
        funcao: funcoesPool[i % funcoesPool.length],
        kortex: true,
      };
    });
    setRows(prev => [...prev, ...generated]);
    toast.success(`${generated.length} ${isDoc ? "docentes" : "funcionários"} importados`);
  };

  const staffModulo = (departamento?: string) => {
    const d = (departamento || "").toLowerCase();
    if (d.includes("fin")) return "financas";
    if (d.includes("gap")) return "gap";
    if (d.includes("acad")) return "academica";
    return "academica";
  };

  const saveAll = async () => {
    const valid = rows.filter((r) => r.primeiroNome.trim() && r.ultimoNome.trim());
    if (valid.length === 0) { toast.error("Adicione pelo menos um registo válido"); return; }
    setSaving(true);
    try {
      if (isDoc) {
        saveDocentes(valid.map((r) => ({
          id: r.id,
          prefixo: r.prefixo || "Prof.",
          primeiroNome: r.primeiroNome,
          ultimoNome: r.ultimoNome,
          email: r.email,
          contacto: r.contacto || "",
          faculdade: "",
          categoria: r.grau || "Assistente",
          cargo: "Docente",
        })));
      } else {
        saveStaff(valid.map((r) => ({
          id: r.id,
          prefixo: r.prefixo || "Sr.",
          primeiroNome: r.primeiroNome,
          ultimoNome: r.ultimoNome,
          email: r.email,
          contacto: r.contacto || "",
          departamento: r.departamento || departamentosPool[0],
          funcao: r.funcao || funcoesPool[0],
          moduloKortex: r.kortex ? staffModulo(r.departamento) : "Não",
        })));
      }
      await Promise.all(valid.filter((r) => r.kortex && r.email).map((r) => provisionKortexUser({
        name: `${r.primeiroNome} ${r.ultimoNome}`.trim(),
        email: r.email,
        modulo: isDoc ? "professor" : staffModulo(r.departamento),
      }).catch((e) => console.warn("provision pessoa failed:", e?.message))));
      markOnboardingStepDone(user?.email, isDoc ? "rh.doc" : "rh.staff");
      window.dispatchEvent(new Event("storage"));
      toast.success(`${valid.length} ${isDoc ? "docentes" : "funcionários"} guardados`);
    } finally {
      setSaving(false);
    }
  };

  const HeaderIcon = isDoc ? GraduationCap : Briefcase;
  // Columns order: Prefixo | Primeiro | Último | Género | Contacto | (Grau | (Dept | Função)) | Módulo | Email (auto)
  const grid = isDoc
    ? "grid-cols-[80px_1fr_1fr_0.9fr_1fr_1fr_1.1fr_1.4fr]"
    : "grid-cols-[80px_1fr_1fr_0.9fr_1fr_1fr_1fr_1.1fr_1.4fr]";

  const HeaderRow = () => (
    <div className={`grid ${grid} gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b`}>
      <span>Prefixo</span><span>Primeiro nome</span><span>Último nome</span><span>Género</span><span>Contacto</span>
      {isDoc ? (<span>Grau</span>) : (<><span>Departamento</span><span>Função</span></>)}
      <span>Kortex?</span>
      <span>Email <span className="normal-case text-[9px] text-muted-foreground/70">(auto)</span></span>
    </div>
  );

  const Row = ({ r }: { r: Person }) => (
    <div key={r.id} className={`grid ${grid} gap-2 px-4 py-2 items-center`}>
      <Select value={r.prefixo || ""} onValueChange={v => update(r.id, { prefixo: v })}>
        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
        <SelectContent>{prefixosPool.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
      </Select>
      <Input value={r.primeiroNome} onChange={e => update(r.id, { primeiroNome: e.target.value })} className="h-8 text-xs" placeholder="Primeiro" />
      <Input value={r.ultimoNome} onChange={e => update(r.id, { ultimoNome: e.target.value })} className="h-8 text-xs" placeholder="Último" />
      <Select value={r.genero || ""} onValueChange={v => update(r.id, { genero: v })}>
        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
        <SelectContent>{generosPool.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
      </Select>
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
      <Select value={r.kortex ? "sim" : "nao"} onValueChange={v => update(r.id, { kortex: v === "sim" })}>
        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="sim">Sim</SelectItem>
          <SelectItem value="nao">Não</SelectItem>
        </SelectContent>
      </Select>
      <Input value={r.kortex ? r.email : "—"} readOnly disabled className="h-8 text-xs bg-muted/40 cursor-not-allowed" placeholder={r.kortex ? "auto @upra.kor" : "sem acesso"} />
    </div>
  );

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
            <HeaderRow />
            <div className="divide-y">
              {rows.map(r => <Row key={r.id} r={r} />)}
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
            <HeaderRow />
            <div className="divide-y">
              {rows.map(r => <Row key={r.id} r={r} />)}
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

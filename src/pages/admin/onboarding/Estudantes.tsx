import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, UserPlus, Trash2, Users, GraduationCap, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Row = { id: string; nome: string; email: string; curso: string; ano: string; turma: string; origem?: "novo" | "existente" | "importado" };

const cursosPool = ["ARQ", "ENG", "MED", "DIR", "ECO"];
const turmasPool = ["A", "B", "C", "D", "E"];
const provincias = ["Luanda", "Benguela", "Huíla", "Huambo", "Cabinda", "Namibe", "Uíge", "Bié"];

const seedRows: Row[] = [
  { id: "1", nome: "Ana Silva",    email: "ana.silva@upra.kor",   curso: "ARQ", ano: "1", turma: "A", origem: "importado" },
  { id: "2", nome: "Bruno Costa",  email: "bruno.costa@upra.kor", curso: "ENG", ano: "1", turma: "B", origem: "importado" },
  { id: "3", nome: "Carla Mendes", email: "carla.mendes@upra.kor",curso: "MED", ano: "2", turma: "A", origem: "importado" },
];

const existentesPool = [
  { id: "ex-1", nome: "Diogo Pereira",  email: "diogo.pereira@upra.kor",  cursoAtual: "DIR", ano: "2" },
  { id: "ex-2", nome: "Eunice Lopes",   email: "eunice.lopes@upra.kor",   cursoAtual: "ECO", ano: "3" },
  { id: "ex-3", nome: "Fábio Antunes",  email: "fabio.antunes@upra.kor",  cursoAtual: "ENG", ano: "1" },
  { id: "ex-4", nome: "Gisela Tavares", email: "gisela.tavares@upra.kor", cursoAtual: "ARQ", ano: "2" },
];

const emptyNovo = {
  primeiroNome: "", ultimoNome: "", nascimento: "", genero: "", nacionalidade: "Angolana",
  bilhete: "", telemovel: "", provincia: "", municipio: "", endereco: "",
  encNome: "", encParentesco: "", encTelefone: "",
  curso: "ARQ", ano: "1", turma: "A",
};

export default function OnboardingEstudantes() {
  const [params] = useSearchParams();
  const initialTab = params.get("tab") === "manual" ? "manual" : "importar";

  const [rows, setRows] = useState<Row[]>(seedRows);
  const [novo, setNovo] = useState(emptyNovo);

  const totals = useMemo(() => ({
    total: rows.length,
    cursos: new Set(rows.map(r => r.curso)).size,
  }), [rows]);

  const remove = (id: string) => setRows(prev => prev.filter(r => r.id !== id));

  const confirmarAdicao = () => {
    if (!novo.primeiroNome.trim() || !novo.ultimoNome.trim() || !novo.nascimento || !novo.bilhete.trim()) {
      toast.error("Preencha nome, data de nascimento e bilhete de identidade");
      return;
    }
    const nomeCompleto = `${novo.primeiroNome.trim()} ${novo.ultimoNome.trim()}`;
    const emailGerado = `${nomeCompleto.toLowerCase().replace(/\s+/g, ".").normalize("NFD").replace(/[^a-z.]/g, "")}@upra.kor`;
    setRows(prev => [...prev, {
      id: String(Date.now()),
      nome: nomeCompleto,
      email: emailGerado,
      curso: novo.curso, ano: novo.ano, turma: novo.turma,
      origem: "novo",
    }]);
    setNovo(emptyNovo);
    toast.success(`Estudante adicionado. Email institucional: ${emailGerado}`);
  };

  const simulateImport = () => {
    const generated: Row[] = Array.from({ length: 12 }).map((_, i) => ({
      id: `imp-${Date.now()}-${i}`,
      nome: `Estudante Importado ${i + 1}`,
      email: `estudante${i + 1}@upra.kor`,
      curso: cursosPool[i % cursosPool.length],
      ano: String((i % 4) + 1),
      turma: turmasPool[i % turmasPool.length],
      origem: "importado",
    }));
    setRows(prev => [...prev, ...generated]);
    toast.success(`${generated.length} estudantes importados`);
  };




  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <OnboardingStepBanner />

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Users className="w-3.5 h-3.5" /><p className="text-xs">Estudantes</p></div><p className="text-2xl font-bold">{totals.total}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><GraduationCap className="w-3.5 h-3.5" /><p className="text-xs">Cursos</p></div><p className="text-2xl font-bold">{totals.cursos}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><CheckCircle2 className="w-3.5 h-3.5" /><p className="text-xs">Activos</p></div><p className="text-2xl font-bold text-emerald-600">{totals.total}</p></Card>
      </div>

      <Tabs defaultValue={initialTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="importar" className="gap-1.5"><Upload className="w-3.5 h-3.5" /> Importar</TabsTrigger>
          <TabsTrigger value="manual" className="gap-1.5"><UserPlus className="w-3.5 h-3.5" /> Adicionar manualmente</TabsTrigger>
        </TabsList>

        <TabsContent value="importar" className="mt-0">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold">Importação em lote</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Carregue um ficheiro CSV ou Excel. O email institucional é gerado automaticamente.</p>
              </div>
              <Button onClick={simulateImport} variant="outline" size="sm" className="gap-2 shrink-0">
                <Upload className="w-4 h-4" /> Carregar ficheiro
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-0">
          <Card className="p-5 space-y-5">
            <div>
              <h2 className="text-sm font-semibold">Adicionar manualmente</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3 h-3" /> O email <span className="font-semibold">@upra.kor</span> é gerado automaticamente após confirmação.
              </p>
            </div>

            <div className="space-y-4">
              <section className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Identificação</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">Primeiro nome *</Label><Input className="h-9" value={novo.primeiroNome} onChange={e => setNovo({ ...novo, primeiroNome: e.target.value })} /></div>
                  <div><Label className="text-xs">Último nome *</Label><Input className="h-9" value={novo.ultimoNome} onChange={e => setNovo({ ...novo, ultimoNome: e.target.value })} /></div>
                  <div><Label className="text-xs">Data de nascimento *</Label><Input type="date" className="h-9" value={novo.nascimento} onChange={e => setNovo({ ...novo, nascimento: e.target.value })} /></div>
                  <div><Label className="text-xs">Género</Label>
                    <Select value={novo.genero} onValueChange={v => setNovo({ ...novo, genero: v })}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent><SelectItem value="M">Masculino</SelectItem><SelectItem value="F">Feminino</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Bilhete de identidade *</Label><Input className="h-9" value={novo.bilhete} onChange={e => setNovo({ ...novo, bilhete: e.target.value })} /></div>
                  <div><Label className="text-xs">Nacionalidade</Label><Input className="h-9" value={novo.nacionalidade} onChange={e => setNovo({ ...novo, nacionalidade: e.target.value })} /></div>
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contacto e morada</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">Telemóvel</Label><Input className="h-9" value={novo.telemovel} onChange={e => setNovo({ ...novo, telemovel: e.target.value })} /></div>
                  <div><Label className="text-xs">Província</Label>
                    <Select value={novo.provincia} onValueChange={v => setNovo({ ...novo, provincia: v })}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{provincias.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Município</Label><Input className="h-9" value={novo.municipio} onChange={e => setNovo({ ...novo, municipio: e.target.value })} /></div>
                  <div><Label className="text-xs">Endereço</Label><Input className="h-9" value={novo.endereco} onChange={e => setNovo({ ...novo, endereco: e.target.value })} /></div>
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Encarregado</p>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label className="text-xs">Nome</Label><Input className="h-9" value={novo.encNome} onChange={e => setNovo({ ...novo, encNome: e.target.value })} /></div>
                  <div><Label className="text-xs">Parentesco</Label><Input className="h-9" value={novo.encParentesco} onChange={e => setNovo({ ...novo, encParentesco: e.target.value })} /></div>
                  <div><Label className="text-xs">Telefone</Label><Input className="h-9" value={novo.encTelefone} onChange={e => setNovo({ ...novo, encTelefone: e.target.value })} /></div>
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Matrícula</p>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label className="text-xs">Curso</Label>
                    <Select value={novo.curso} onValueChange={v => setNovo({ ...novo, curso: v })}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{cursosPool.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Ano</Label>
                    <Select value={novo.ano} onValueChange={v => setNovo({ ...novo, ano: v })}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{["1","2","3","4","5"].map(a => <SelectItem key={a} value={a}>{a}º ano</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Turma</Label>
                    <Select value={novo.turma} onValueChange={v => setNovo({ ...novo, turma: v })}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{turmasPool.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </section>
            </div>

            <div className="flex justify-end">
              <Button onClick={confirmarAdicao} className="gap-1.5"><UserPlus className="w-4 h-4" /> Adicionar estudante</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="overflow-hidden">
        <div className="px-4 py-2.5 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">Estudantes registados</h3>
          <span className="text-xs text-muted-foreground">{rows.length} {rows.length === 1 ? "estudante" : "estudantes"}</span>
        </div>
        <div className="grid grid-cols-[1fr_1.4fr_80px_70px_80px_40px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
          <span>Nome</span><span>Email</span><span>Curso</span><span>Ano</span><span>Turma</span><span></span>
        </div>
        <div className="divide-y">
          {rows.map(r => (
            <div key={r.id} className="grid grid-cols-[1fr_1.4fr_80px_70px_80px_40px] gap-2 px-4 py-2 items-center text-xs">
              <span className="font-medium">{r.nome}</span>
              <span className="text-muted-foreground truncate">{r.email}</span>
              <Badge variant="outline" className="text-[10px] justify-center">{r.curso}</Badge>
              <span>{r.ano}º</span>
              <span>{r.turma}</span>
              <Button size="icon" variant="ghost" onClick={() => remove(r.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="px-4 py-8 text-xs text-muted-foreground italic text-center">Sem estudantes. Use os separadores acima para começar.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

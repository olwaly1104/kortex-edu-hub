import { FinHeader } from "@/pages/financas/_FinHeader";
import {
  GraduationCap, Plus, Search, Trash2, User, Mail, Briefcase, Award,
  Camera, Upload, Check, X, FileText, IdCard, MapPin, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadDocentes, saveDocentes, type DocenteRow, type Grau } from "@/lib/peopleStorage";
import { EmptyState } from "./Staff";

const prefixosPool = ["Sr.", "Sra.", "Dr.", "Dra.", "Prof.", "Eng.", "Me."];
const categoriasPool = ["Assistente", "Auxiliar", "Associado", "Catedrático", "Convidado"];
const cargosPool = ["Docente", "Coordenador", "Decano", "Diretor"];
const grausPool: Grau[] = ["Licenciatura", "Mestrado", "Doutoramento", "Agregação"];
const PROVINCIAS = [
  "Bengo","Benguela","Bié","Cabinda","Cuando Cubango","Cuanza Norte","Cuanza Sul","Cunene",
  "Huambo","Huíla","Luanda","Lunda Norte","Lunda Sul","Malanje","Moxico","Namibe","Uíge","Zaire",
];

const EMAIL_DOMAIN = "upra.kor";
const slug = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
const buildEmail = (p: string, u: string) => {
  const a = slug(p), b = slug(u);
  if (!a && !b) return "";
  return `${[a, b].filter(Boolean).join(".")}@${EMAIL_DOMAIN}`;
};

const diplomaLabel = (g?: Grau) =>
  g ? `Diploma de ${g}` : "Diploma académico";

const empty = (): DocenteRow => ({
  id: "", prefixo: "Dr.", primeiroNome: "", ultimoNome: "", email: "", contacto: "",
  faculdade: "", categoria: "Assistente", cargo: "Docente",
  nascimento: "", genero: "M", bilhete: "", bilheteFileName: "", fotoDataUrl: "",
  provincia: "", municipio: "", endereco: "",
  grau: "Licenciatura", especialidade: "", instituicaoFormacao: "", anosExperiencia: "",
  cvFileName: "", diplomaFileName: "",
});

export default function AdminDocentes() {
  const [rows, setRows] = useState<DocenteRow[]>(() => loadDocentes());
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DocenteRow>(empty());
  const fotoInput = useRef<HTMLInputElement>(null);
  const biInput = useRef<HTMLInputElement>(null);
  const cvInput = useRef<HTMLInputElement>(null);
  const diplomaInput = useRef<HTMLInputElement>(null);

  useEffect(() => { saveDocentes(rows); }, [rows]);

  const setF = <K extends keyof DocenteRow>(k: K, v: DocenteRow[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const openNew = () => { setDraft(empty()); setOpen(true); };

  const previewEmail = buildEmail(draft.primeiroNome, draft.ultimoNome);

  const onFoto = (f: File | null) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setF("fotoDataUrl", String(reader.result || ""));
    reader.readAsDataURL(f);
  };

  const save = () => {
    if (!draft.primeiroNome.trim() || !previewEmail) return;
    setRows((p) => [...p, { ...draft, email: previewEmail, id: `${Date.now()}` }]);
    setOpen(false);
  };
  const remove = (id: string) => setRows((p) => p.filter((r) => r.id !== id));

  const filtered = useMemo(() => rows.filter((r) =>
    [r.primeiroNome, r.ultimoNome, r.email, r.faculdade, r.categoria, r.cargo, r.grau].some((v) => (v || "").toLowerCase().includes(q.toLowerCase()))
  ), [rows, q]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader title="Docentes" subtitle="Corpo docente da instituição" icon={<GraduationCap className="w-5 h-5 text-primary" />} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total" value={rows.length} />
        <Stat label="Decanos" value={rows.filter((r) => r.cargo === "Decano").length} />
        <Stat label="Coordenadores" value={rows.filter((r) => r.cargo === "Coordenador").length} />
        <Stat label="Faculdades" value={new Set(rows.map((r) => r.faculdade).filter(Boolean)).size} />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Procurar docentes..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" />
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">{filtered.length} de {rows.length}</div>
        <Button size="sm" onClick={openNew} className="ml-auto gap-1"><Plus className="w-3.5 h-3.5" /> Adicionar Docente</Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState onAdd={openNew} icon={<GraduationCap className="w-7 h-7" />} title="Nenhum docente registado" hint="Adicione docentes para os atribuir como decanos e coordenadores." cta="Adicionar Docente" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-semibold py-2.5 px-4">Docente</th>
                <th className="text-left font-semibold py-2.5 px-4">Email</th>
                <th className="text-left font-semibold py-2.5 px-4">Faculdade</th>
                <th className="text-left font-semibold py-2.5 px-4">Grau</th>
                <th className="text-left font-semibold py-2.5 px-4">Categoria</th>
                <th className="text-left font-semibold py-2.5 px-4">Cargo</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden">
                        {r.fotoDataUrl ? <img src={r.fotoDataUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
                      </div>
                      <span className="font-semibold">{r.prefixo} {r.primeiroNome} {r.ultimoNome}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{r.email}</td>
                  <td className="py-3 px-4 text-xs">{r.faculdade || <span className="text-muted-foreground italic">—</span>}</td>
                  <td className="py-3 px-4 text-xs">{r.grau || <span className="text-muted-foreground italic">—</span>}</td>
                  <td className="py-3 px-4 text-xs">{r.categoria}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">{r.cargo}</span>
                  </td>
                  <td className="py-3 px-2">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary" /> Adicionar Docente</DialogTitle>
            <DialogDescription>Preencha o registo completo do docente. O email institucional é gerado automaticamente.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* 1. Identificação */}
            <section>
              <SectionTitle index={1} icon={<User className="w-3.5 h-3.5" />} title="Identificação Pessoal" hint="Foto, nome e documento de identidade" />
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => fotoInput.current?.click()}
                  className="w-20 h-20 shrink-0 rounded-lg border-2 border-dashed border-input bg-background flex items-center justify-center overflow-hidden hover:border-primary hover:bg-primary/5 transition"
                >
                  {draft.fotoDataUrl ? (
                    <img src={draft.fotoDataUrl} alt="foto" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span className="text-[9px]">Foto</span>
                    </div>
                  )}
                  <input ref={fotoInput} type="file" accept="image/*" className="hidden" onChange={(e) => onFoto(e.target.files?.[0] || null)} />
                </button>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 flex-1">
                  <Field label="Prefixo">
                    <Select value={draft.prefixo} onValueChange={(v) => setF("prefixo", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{prefixosPool.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Primeiro nome">
                    <Input className="h-8 text-xs" value={draft.primeiroNome} onChange={(e) => setF("primeiroNome", e.target.value)} placeholder="Ana" />
                  </Field>
                  <Field label="Último nome">
                    <Input className="h-8 text-xs" value={draft.ultimoNome} onChange={(e) => setF("ultimoNome", e.target.value)} placeholder="Silva" />
                  </Field>
                  <Field label="Data de nascimento">
                    <Input className="h-8 text-xs" type="date" value={draft.nascimento || ""} onChange={(e) => setF("nascimento", e.target.value)} />
                  </Field>
                  <Field label="Género">
                    <Select value={draft.genero || "M"} onValueChange={(v) => setF("genero", v as DocenteRow["genero"])}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Feminino</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Nº Bilhete de Identidade">
                    <Input className="h-8 text-xs" value={draft.bilhete || ""} onChange={(e) => setF("bilhete", e.target.value)} placeholder="00000000XX000" />
                  </Field>
                </div>
              </div>
            </section>

            {/* 2. Contacto */}
            <section>
              <SectionTitle index={2} icon={<Mail className="w-3.5 h-3.5" />} title="Contacto & Email Institucional" hint="Telefone pessoal e email gerado automaticamente" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Field label="Telemóvel">
                  <Input className="h-8 text-xs" value={draft.contacto} onChange={(e) => setF("contacto", e.target.value)} placeholder="+244 9XX XXX XXX" />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Email institucional">
                    <div className="h-8 px-2.5 flex items-center justify-between gap-2 text-[11px] bg-muted/40 border border-input rounded-md">
                      <span className="truncate font-mono text-foreground/80">{previewEmail || `nome.apelido@${EMAIL_DOMAIN}`}</span>
                      <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold shrink-0">Auto</span>
                    </div>
                  </Field>
                </div>
              </div>
            </section>

            {/* 3. Morada */}
            <section>
              <SectionTitle index={3} icon={<MapPin className="w-3.5 h-3.5" />} title="Morada de Residência" hint="Localização atual do docente" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Field label="Província">
                  <Select value={draft.provincia || ""} onValueChange={(v) => setDraft((d) => ({ ...d, provincia: v, municipio: "" }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>{PROVINCIAS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Município">
                  <Input className="h-8 text-xs" value={draft.municipio || ""} onChange={(e) => setF("municipio", e.target.value)} placeholder="—" />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Endereço">
                    <Input className="h-8 text-xs" value={draft.endereco || ""} onChange={(e) => setF("endereco", e.target.value)} placeholder="Rua, bairro, nº" />
                  </Field>
                </div>
              </div>
            </section>

            {/* 4. Afiliação */}
            <section>
              <SectionTitle index={4} icon={<Briefcase className="w-3.5 h-3.5" />} title="Afiliação Académica" hint="Faculdade, categoria e cargo institucional" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Field label="Faculdade">
                  <Input className="h-8 text-xs" value={draft.faculdade} onChange={(e) => setF("faculdade", e.target.value)} placeholder="Ex.: Ciências Exatas" />
                </Field>
                <Field label="Categoria">
                  <Select value={draft.categoria} onValueChange={(v) => setF("categoria", v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{categoriasPool.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Cargo institucional">
                  <Select value={draft.cargo} onValueChange={(v) => setF("cargo", v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{cargosPool.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">Decanos e Coordenadores ficam disponíveis nas configurações de Faculdades e Cursos.</p>
            </section>

            {/* 5. Formação académica */}
            <section>
              <SectionTitle index={5} icon={<BookOpen className="w-3.5 h-3.5" />} title="Formação Académica" hint="Grau máximo concluído e área de especialidade" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Field label="Grau académico">
                  <Select value={draft.grau || "Licenciatura"} onValueChange={(v) => setF("grau", v as Grau)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{grausPool.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Especialidade">
                  <Input className="h-8 text-xs" value={draft.especialidade || ""} onChange={(e) => setF("especialidade", e.target.value)} placeholder="Ex.: Arquitectura" />
                </Field>
                <Field label="Instituição">
                  <Input className="h-8 text-xs" value={draft.instituicaoFormacao || ""} onChange={(e) => setF("instituicaoFormacao", e.target.value)} placeholder="Universidade que conferiu o grau" />
                </Field>
                <Field label="Anos de experiência">
                  <Input className="h-8 text-xs" type="number" min="0" value={draft.anosExperiencia || ""} onChange={(e) => setF("anosExperiencia", e.target.value)} placeholder="0" />
                </Field>
              </div>
            </section>

            {/* 6. Documentação */}
            <section>
              <SectionTitle index={6} icon={<Award className="w-3.5 h-3.5" />} title="Documentação Anexa" hint="CV, diploma e bilhete de identidade" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Field label="Bilhete de Identidade">
                  <FileButton fileName={draft.bilheteFileName} onPick={(f) => setF("bilheteFileName", f?.name || "")} inputRef={biInput} accept="image/*,application/pdf" Icon={IdCard} />
                </Field>
                <Field label="Curriculum Vitae (CV)">
                  <FileButton fileName={draft.cvFileName} onPick={(f) => setF("cvFileName", f?.name || "")} inputRef={cvInput} accept="application/pdf,.doc,.docx" Icon={FileText} />
                </Field>
                <Field label={diplomaLabel(draft.grau)}>
                  <FileButton fileName={draft.diplomaFileName} onPick={(f) => setF("diplomaFileName", f?.name || "")} inputRef={diplomaInput} accept="image/*,application/pdf" Icon={Award} />
                </Field>
              </div>
            </section>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!draft.primeiroNome.trim() || !previewEmail} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Adicionar Docente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</Label>
      {children}
    </div>
  );
}

function SectionTitle({ index, icon, title, hint }: { index: number; icon: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/60">
      <span className="w-5 h-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">{index}</span>
      <span className="text-primary">{icon}</span>
      <div className="flex items-baseline gap-2 min-w-0">
        <h3 className="text-xs font-semibold text-foreground">{title}</h3>
        {hint && <span className="text-[10px] text-muted-foreground truncate">— {hint}</span>}
      </div>
    </div>
  );
}

function FileButton({
  fileName, onPick, inputRef, accept, Icon,
}: {
  fileName?: string;
  onPick: (f: File | null) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  accept: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex-1 h-8 px-2 rounded-md border text-[11px] flex items-center gap-1.5 truncate transition ${fileName ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-dashed border-input bg-background text-muted-foreground hover:border-primary hover:text-primary"}`}
      >
        {fileName ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Upload className="w-3.5 h-3.5 shrink-0" />}
        <span className="truncate">{fileName || "Carregar ficheiro"}</span>
        <Icon className="w-3.5 h-3.5 ml-auto shrink-0 opacity-70" />
      </button>
      {fileName && (
        <button
          type="button"
          onClick={() => { onPick(null); if (inputRef.current) inputRef.current.value = ""; }}
          className="h-8 w-8 rounded-md border border-input bg-background text-muted-foreground hover:text-destructive flex items-center justify-center"
          aria-label="Remover"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] || null)}
      />
    </div>
  );
}

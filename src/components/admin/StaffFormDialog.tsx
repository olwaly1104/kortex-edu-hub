import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Briefcase, Plus, User, Mail, Camera, Upload, Check, X, FileText, IdCard, MapPin, Building2,
} from "lucide-react";
import { toast } from "sonner";
import { type StaffRow } from "@/lib/peopleStorage";
import { supabase } from "@/integrations/supabase/client";

const MODULOS_STAFF = [
  { value: "academica", label: "Académica" },
  { value: "financas", label: "Finanças" },
  { value: "gap", label: "GAP" },
  { value: "inscricoes", label: "Inscrições" },
];

const prefixosPool = ["Sr.", "Sra.", "Dr.", "Dra.", "Eng.", "Me."];
const PROVINCIAS = [
  "Bengo","Benguela","Bié","Cabinda","Cuando Cubango","Cuanza Norte","Cuanza Sul","Cunene",
  "Huambo","Huíla","Luanda","Lunda Norte","Lunda Sul","Malanje","Moxico","Namibe","Uíge","Zaire",
];
const EMAIL_DOMAIN = "upra.kor";

const slug = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
export const buildStaffEmail = (p: string, u: string) => {
  const a = slug(p), b = slug(u);
  if (!a && !b) return "";
  return `${[a, b].filter(Boolean).join(".")}@${EMAIL_DOMAIN}`;
};

const moduloFromDepartamento = (d?: string) => {
  const x = (d || "").toLowerCase();
  if (x.includes("fin")) return "financas";
  if (x.includes("gap")) return "gap";
  if (x.includes("acad")) return "academica";
  return "academica";
};

// StaffRow extras kept locally via fields already present, plus optional file fields are not part of StaffRow type.
type StaffDraft = StaffRow & {
  nascimento?: string;
  genero?: "M" | "F" | "Outro";
  bilhete?: string;
  bilheteFileName?: string;
  fotoDataUrl?: string;
  provincia?: string;
  municipio?: string;
  endereco?: string;
  cvFileName?: string;
};

export const emptyStaff = (): StaffDraft => ({
  id: "", prefixo: "Sr.", primeiroNome: "", ultimoNome: "", email: "", contacto: "",
  departamento: "", funcao: "", moduloKortex: "academica",
  nascimento: "", genero: "M", bilhete: "", bilheteFileName: "", fotoDataUrl: "",
  provincia: "", municipio: "", endereco: "", cvFileName: "",
});

export function StaffFormDialog({
  open, onOpenChange, onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (row: StaffRow & { fotoDataUrl?: string }) => void;
}) {
  const [draft, setDraft] = useState<StaffDraft>(emptyStaff());
  const [departamentos, setDepartamentos] = useState<{ id: string; designacao: string; sigla: string }[]>([]);
  const fotoInput = useRef<HTMLInputElement>(null);
  const biInput = useRef<HTMLInputElement>(null);
  const cvInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data, error } = await (supabase as any)
        .from("departamentos")
        .select("id, designacao, sigla")
        .order("designacao", { ascending: true });
      if (!error && data) setDepartamentos(data);
    })();
  }, [open]);

  const setF = <K extends keyof StaffDraft>(k: K, v: StaffDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const previewEmail = useMemo(() => buildStaffEmail(draft.primeiroNome, draft.ultimoNome), [draft.primeiroNome, draft.ultimoNome]);

  const onFoto = (f: File | null) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setF("fotoDataUrl", String(reader.result || ""));
    reader.readAsDataURL(f);
  };

  const requiredOk =
    !!draft.prefixo &&
    !!draft.primeiroNome.trim() &&
    !!draft.ultimoNome.trim() &&
    !!draft.nascimento &&
    !!draft.genero &&
    !!(draft.bilhete || "").trim() &&
    !!draft.departamento &&
    !!draft.funcao.trim() &&
    !!draft.contacto.trim() &&
    !!draft.provincia &&
    !!(draft.municipio || "").trim() &&
    !!(draft.endereco || "").trim() &&
    !!draft.moduloKortex;

  const handleSave = () => {
    if (!requiredOk || !previewEmail) {
      toast.error("Preencha todos os campos obrigatórios (exceto Documentação Anexa)");
      return;
    }
    onSave({
      ...draft,
      email: previewEmail,
      id: draft.id || `${Date.now()}`,
      moduloKortex: draft.moduloKortex || moduloFromDepartamento(draft.departamento),
    });
    setDraft(emptyStaff());
  };

  const submitSimplificado = () => {
    if (!requiredOk) { toast.error("Preencha primeiro e último nome"); return; }
    if (!window.confirm("Tem a certeza que pretende criar este staff?")) return;
    handleSave();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setDraft(emptyStaff()); onOpenChange(v); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b bg-gradient-to-br from-primary/5 via-background to-background">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold">Adicionar Staff</DialogTitle>
                <DialogDescription className="text-[12px]">
                  Apenas o nome é necessário. A conta Kortex é criada de imediato — restantes dados podem ser editados depois no perfil.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Conta Simplificada */}
          <section className="space-y-3">
            <div className="grid grid-cols-[110px_1fr_1fr] gap-3">
              <Field label="Prefixo">
                <Select value={draft.prefixo} onValueChange={(v) => setF("prefixo", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{prefixosPool.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Primeiro nome *">
                <Input autoFocus value={draft.primeiroNome} onChange={(e) => setF("primeiroNome", e.target.value)} placeholder="João" className="h-9 text-sm" />
              </Field>
              <Field label="Último nome *">
                <Input value={draft.ultimoNome} onChange={(e) => setF("ultimoNome", e.target.value)} placeholder="Silva" className="h-9 text-sm" />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Módulo Kortex *">
                <Select value={draft.moduloKortex || "academica"} onValueChange={(v) => setF("moduloKortex", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MODULOS_STAFF.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Email Kortex (auto)">
                <div className="h-9 px-2.5 flex items-center justify-between gap-2 text-[12px] bg-muted/30 border border-input rounded-md">
                  <span className="truncate font-mono text-foreground/90">{previewEmail || `nome.apelido@${EMAIL_DOMAIN}`}</span>
                  <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold shrink-0">Auto</span>
                </div>
              </Field>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-muted-foreground">Restantes campos podem ser editados depois.</span>
              <Button size="sm" onClick={submitSimplificado} disabled={!requiredOk} className="h-7 px-2.5 text-[11px] gap-1">
                <Plus className="w-3 h-3" /> Criar simplificado
              </Button>
            </div>
          </section>

          <div className="space-y-6 border-t pt-4">
            <p className="text-[11px] text-muted-foreground -mt-1">
              Restantes campos são opcionais — podem ser editados depois no perfil do staff.
            </p>
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
                  <Input className="h-8 text-xs" value={draft.primeiroNome} onChange={(e) => setF("primeiroNome", e.target.value)} placeholder="João" />
                </Field>
                <Field label="Último nome">
                  <Input className="h-8 text-xs" value={draft.ultimoNome} onChange={(e) => setF("ultimoNome", e.target.value)} placeholder="Silva" />
                </Field>
                <Field label="Data de nascimento">
                  <Input className="h-8 text-xs" type="date" value={draft.nascimento || ""} onChange={(e) => setF("nascimento", e.target.value)} />
                </Field>
                <Field label="Género">
                  <Select value={draft.genero || "M"} onValueChange={(v) => setF("genero", v as StaffDraft["genero"])}>
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

          <section>
            <SectionTitle index={3} icon={<MapPin className="w-3.5 h-3.5" />} title="Morada de Residência" hint="Localização atual do funcionário" />
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

          <section>
            <SectionTitle index={4} icon={<Building2 className="w-3.5 h-3.5" />} title="Afiliação Institucional" hint="Departamento e função do funcionário" />
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
              <Field label="Departamento">
                <Select value={draft.departamento} onValueChange={(v) => setF("departamento", v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={departamentos.length ? "Selecionar" : "Sem departamentos"} /></SelectTrigger>
                  <SelectContent>
                    {departamentos.map((d) => (
                      <SelectItem key={d.id} value={d.designacao}>{d.designacao}{d.sigla ? ` (${d.sigla})` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Função">
                <Input className="h-8 text-xs" value={draft.funcao} onChange={(e) => setF("funcao", e.target.value)} placeholder="Ex.: Assistente Administrativo" />
              </Field>
            </div>
          </section>

          <section>
            <SectionTitle index={5} icon={<FileText className="w-3.5 h-3.5" />} title="Documentação Anexa" hint="Bilhete de identidade e CV" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Field label="Bilhete de Identidade">
                <FileButton fileName={draft.bilheteFileName} onPick={(f) => setF("bilheteFileName", f?.name || "")} inputRef={biInput} accept="image/*,application/pdf" Icon={IdCard} />
              </Field>
              <Field label="Curriculum Vitae (CV)">
                <FileButton fileName={draft.cvFileName} onPick={(f) => setF("cvFileName", f?.name || "")} inputRef={cvInput} accept="application/pdf,.doc,.docx" Icon={FileText} />
              </Field>
            </div>
          </section>
          </div>
        </div>

        <DialogFooter className="px-6 pb-5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!requiredOk || !previewEmail} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Adicionar Staff
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

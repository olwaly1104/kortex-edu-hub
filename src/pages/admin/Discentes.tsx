import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  GraduationCap, Plus, Trash2, Users, BookOpen, Layers, Loader2,
  Camera, Upload, FileText, IdCard, Check, X, Search,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  useEstudantes,
  useCursos,
  useFaculdades,
  useCreateEstudante,
  useDeleteEstudante,
} from "@/lib/useInstitution";

type Regime = "bolseiro" | "normal";
type Genero = "M" | "F" | "Outro";

type Draft = {
  fotoFile: File | null;
  fotoPreview: string;
  primeiroNome: string;
  ultimoNome: string;
  nascimento: string;
  genero: Genero;
  regime: Regime;
  telemovel: string;
  bilhete: string;
  bilheteFile: File | null;
  certificadoFile: File | null;
  provincia: string;
  municipio: string;
  endereco: string;
  enc_primeiro_nome: string;
  enc_ultimo_nome: string;
  enc_parentesco: string;
  enc_telefone: string;
  encBilheteFile: File | null;
  faculdade_id: string;
  curso_id: string;
  ano: string;
  turma: string;
};

const anosPool = ["1", "2", "3", "4", "5", "6"];
const turmasPool = ["A", "B", "C", "D", "E"];
const EMAIL_DOMAIN = "upra.kor";

const PROVINCIAS = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango", "Cuanza Norte",
  "Cuanza Sul", "Cunene", "Huambo", "Huíla", "Luanda", "Lunda Norte",
  "Lunda Sul", "Malanje", "Moxico", "Namibe", "Uíge", "Zaire",
];

const MUNICIPIOS: Record<string, string[]> = {
  "Luanda": ["Luanda", "Belas", "Cacuaco", "Cazenga", "Kilamba Kiaxi", "Talatona", "Viana"],
  "Benguela": ["Benguela", "Baía Farta", "Bocoio", "Catumbela", "Cubal", "Ganda", "Lobito"],
  "Bié": ["Kuito", "Andulo", "Chinguar", "Cunhinga", "Nharêa"],
  "Cabinda": ["Cabinda", "Belize", "Buco Zau", "Cacongo"],
  "Cunene": ["Ondjiva", "Cahama", "Cuanhama", "Curoca", "Namacunde", "Cuvelai"],
  "Huambo": ["Huambo", "Bailundo", "Caála", "Ecunha", "Londuimbali", "Ucuma"],
  "Huíla": ["Lubango", "Caconda", "Caluquembe", "Chibia", "Humpata", "Jamba", "Matala"],
  "Lunda Norte": ["Dundo", "Cambulo", "Chitato", "Cuango", "Luvuca"],
  "Lunda Sul": ["Saurimo", "Cacolo", "Dala", "Muconda"],
  "Malanje": ["Malanje", "Cacuso", "Calandula", "Cambundi-Catembo", "Kunda-dia-Base", "Massango"],
  "Namibe": ["Namibe", "Bibala", "Camucoio", "Tombua"],
  "Uíge": ["Uíge", "Ambuíla", "Bembe", "Maquela do Zombo", "Mucaba", "Negage"],
  "Zaire": ["Mbanza Kongo", "Cuimba", "Luvo", "Nóqui", "Soyo", "Tomboco"],
  "Bengo": ["Caxito", "Ambriz", "Bula Atumba", "Dande", "Dembos", "Nambuangongo", "Pango-Aluquém"],
  "Cuanza Norte": ["Ndalatando", "Ambaca", "Banga", "Bolongongo", "Cambambe", "Golungo Alto"],
  "Cuanza Sul": ["Sumbe", "Amboim", "Cassongue", "Conda", "Ebo", "Mussende", "Porto Amboim", "Quibala", "Quilenda", "Seles"],
  "Cuando Cubango": ["Menongue", "Calai", "Changar", "Cuchi", "Cuito Cuanavale", "Dirico", "Mavinga", "Nancova", "Rivungo"],
  "Moxico": ["Luena", "Alto Zambeze", "Cameia", "Léua", "Luau", "Luchazes"],
};

const slug = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim();

const buildEmail = (primeiro: string, ultimo: string) => {
  const p = slug(primeiro);
  const u = slug(ultimo);
  if (!p && !u) return "";
  return `${[p, u].filter(Boolean).join(".")}@${EMAIL_DOMAIN}`;
};

const emptyDraft = (faculdade_id = "", curso_id = ""): Draft => ({
  fotoFile: null,
  fotoPreview: "",
  primeiroNome: "",
  ultimoNome: "",
  nascimento: "",
  genero: "M",
  regime: "normal",
  telemovel: "",
  bilhete: "",
  bilheteFile: null,
  certificadoFile: null,
  provincia: "",
  municipio: "",
  endereco: "",
  enc_primeiro_nome: "",
  enc_ultimo_nome: "",
  enc_parentesco: "",
  enc_telefone: "",
  encBilheteFile: null,
  faculdade_id,
  curso_id,
  ano: "1",
  turma: "A",
});

async function uploadDoc(file: File, prefix: string, email: string): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const safeEmail = email.replace(/[^a-z0-9.@_-]/gi, "_");
  const path = `${safeEmail}/${prefix}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("discentes").upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return path;
}

export default function AdminDiscentes() {
  const navigate = useNavigate();
  const { data: rows = [], isLoading } = useEstudantes();
  const { data: cursos = [] } = useCursos();
  const { data: faculdades = [] } = useFaculdades();
  const createMut = useCreateEstudante();
  const deleteMut = useDeleteEstudante();

  const [searchTerm, setSearchTerm] = useState("");
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const fotoInput = useRef<HTMLInputElement>(null);
  const biInput = useRef<HTMLInputElement>(null);
  const certInput = useRef<HTMLInputElement>(null);
  const encBiInput = useRef<HTMLInputElement>(null);

  // Cursos scoped to the selected faculdade.
  const cursosDaFac = useMemo(
    () => (draft.faculdade_id ? cursos.filter((c: any) => c.faculdade_id === draft.faculdade_id) : []),
    [cursos, draft.faculdade_id],
  );

  // Initialise faculdade → curso defaults.
  useEffect(() => {
    if (!draft.faculdade_id && faculdades.length > 0) {
      setDraft((d) => ({ ...d, faculdade_id: (faculdades[0] as any).id }));
    }
  }, [faculdades, draft.faculdade_id]);

  useEffect(() => {
    if (!draft.faculdade_id) return;
    const validCurso = cursosDaFac.find((c: any) => c.id === draft.curso_id);
    if (!validCurso) {
      setDraft((d) => ({ ...d, curso_id: cursosDaFac[0]?.id || "" }));
    }
  }, [cursosDaFac, draft.faculdade_id, draft.curso_id]);

  const cursoCode = useMemo(() => {
    const m = new Map<string, string>();
    cursos.forEach((c: any) => m.set(c.id, c.codigo || c.nome || "—"));
    return m;
  }, [cursos]);

  const cursoFacSigla = useMemo(() => {
    const facMap = new Map<string, string>();
    faculdades.forEach((f: any) => facMap.set(f.id, f.sigla || f.codigo || f.nome || "—"));
    const m = new Map<string, string>();
    cursos.forEach((c: any) => m.set(c.id, facMap.get(c.faculdade_id) || "—"));
    return m;
  }, [cursos, faculdades]);

  const normalized = useMemo(
    () =>
      rows.map((r: any) => {
        const parts = (r.nome || "").trim().split(/\s+/);
        return {
          id: r.id as string,
          primeiroNome: r.primeiro_nome || parts[0] || "",
          ultimoNome: r.ultimo_nome || (parts.length > 1 ? parts.slice(1).join(" ") : ""),
          email: r.email as string,
          curso_id: r.curso_id as string,
          curso: cursoCode.get(r.curso_id) || "—",
          faculdadeSigla: cursoFacSigla.get(r.curso_id) || "—",
          ano: r.ano as string,
          turma: r.turma as string,
          nascimento: (r.nascimento as string) || "",
          regime: ((r.regime as string) || "normal") as Regime,
          telemovel: (r.telemovel as string) || "",
          provincia: (r.provincia as string) || "",
          foto_url: (r.foto_url as string) || null,
          bilhete_url: (r.bilhete_url as string) || null,
          certificado_url: (r.certificado_url as string) || null,
        };
      }),
    [rows, cursoCode, cursoFacSigla],
  );


  const filtered = useMemo(
    () => normalized.filter((r) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        r.primeiroNome.toLowerCase().includes(q) ||
        r.ultimoNome.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.curso.toLowerCase().includes(q) ||
        r.faculdadeSigla.toLowerCase().includes(q) ||
        r.telemovel.toLowerCase().includes(q)
      );
    }),
    [normalized, searchTerm],
  );

  const counts = useMemo(
    () => ({
      total: normalized.length,
      bolseiros: normalized.filter((r) => r.regime === "bolseiro").length,
      cursos: new Set(normalized.map((r) => r.curso_id)).size,
      turmas: new Set(normalized.map((r) => `${r.curso_id}-${r.ano}${r.turma}`)).size,
    }),
    [normalized],
  );

  const setF = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const previewEmail = buildEmail(draft.primeiroNome, draft.ultimoNome);

  const onFoto = (f: File | null) => {
    if (!f) return;
    setDraft((d) => ({ ...d, fotoFile: f, fotoPreview: URL.createObjectURL(f) }));
  };

  const addRow = async () => {
    if (!draft.primeiroNome.trim() || !draft.curso_id) {
      toast.error("Preencha primeiro nome e curso");
      return;
    }
    if (!previewEmail) {
      toast.error("Não foi possível gerar email a partir do nome");
      return;
    }
    setUploading(true);
    try {
      let foto_url: string | null = null;
      let bilhete_url: string | null = null;
      let certificado_url: string | null = null;
      let enc_bilhete_url: string | null = null;
      if (draft.fotoFile) foto_url = await uploadDoc(draft.fotoFile, "foto", previewEmail);
      if (draft.bilheteFile) bilhete_url = await uploadDoc(draft.bilheteFile, "bi", previewEmail);
      if (draft.certificadoFile) certificado_url = await uploadDoc(draft.certificadoFile, "certificado", previewEmail);
      if (draft.encBilheteFile) enc_bilhete_url = await uploadDoc(draft.encBilheteFile, "enc-bi", previewEmail);

      const nome = `${draft.primeiroNome.trim()} ${draft.ultimoNome.trim()}`.trim();
      await createMut.mutateAsync({
        curso_id: draft.curso_id,
        nome,
        email: previewEmail,
        ano: draft.ano,
        turma: draft.turma,
        primeiro_nome: draft.primeiroNome.trim(),
        ultimo_nome: draft.ultimoNome.trim() || null,
        nascimento: draft.nascimento || null,
        genero: draft.genero,
        regime: draft.regime,
        telemovel: draft.telemovel.trim() || null,
        bilhete: draft.bilhete.trim() || null,
        provincia: draft.provincia.trim() || null,
        municipio: draft.municipio.trim() || null,
        endereco: draft.endereco.trim() || null,
        enc_nome: `${draft.enc_primeiro_nome.trim()} ${draft.enc_ultimo_nome.trim()}`.trim() || null,
        enc_parentesco: draft.enc_parentesco.trim() || null,
        enc_telefone: draft.enc_telefone.trim() || null,
        foto_url,
        bilhete_url,
        certificado_url,
        enc_bilhete_url,
      });
      toast.success(`Discente adicionado · ${previewEmail}`);
      setDraft(emptyDraft(draft.faculdade_id, draft.curso_id));
      if (fotoInput.current) fotoInput.current.value = "";
      if (biInput.current) biInput.current.value = "";
      if (certInput.current) certInput.current.value = "";
      if (encBiInput.current) encBiInput.current.value = "";
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao adicionar discente");
    } finally {
      setUploading(false);
    }
  };

  const removeRow = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Discente removido");
    } catch (e: any) {
      toast.error(e?.message || "Erro ao remover");
    }
  };

  const openDoc = async (path: string) => {
    const { data, error } = await supabase.storage.from("discentes").createSignedUrl(path, 300);
    if (error || !data?.signedUrl) {
      toast.error("Não foi possível abrir o documento");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const GRID = "grid grid-cols-[36px_1fr_1fr_100px_90px_70px_1fr_60px_60px_70px_110px_56px] gap-2 px-4 py-2 items-center";

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">

      <div className="flex items-center gap-3 pb-1">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">Discentes</h1>
          <p className="text-xs text-muted-foreground">Registo completo do estudante. Email institucional é gerado automaticamente.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "Total", value: counts.total, Icon: Users },
          { label: "Bolseiros", value: counts.bolseiros, Icon: GraduationCap },
          { label: "Cursos", value: counts.cursos, Icon: BookOpen },
          { label: "Turmas", value: counts.turmas, Icon: Layers },
        ].map((k) => (
          <Card key={k.label} className="p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-muted text-foreground flex items-center justify-center">
              <k.Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">{k.label}</p>
              <p className="text-base font-semibold leading-none">{k.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Pesquisar discente…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 text-xs pl-8 w-[260px]"
          />
        </div>
        <span className="text-[11px] text-muted-foreground">{filtered.length} discentes</span>
        <Button size="sm" onClick={() => setOpen(true)} className="ml-auto gap-1">
          <Plus className="w-3.5 h-3.5" /> Adicionar Discente
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-10 flex items-center justify-center text-xs text-muted-foreground italic gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> A carregar…
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold">Nenhum discente registado</p>
            <p className="text-xs text-muted-foreground mt-0.5">Adicione discentes para os atribuir a cursos e turmas.</p>
          </div>
          <Button size="sm" onClick={() => setOpen(true)} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> Adicionar Discente
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className={`${GRID} text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b !py-2`}>
            <span></span>
            <span>Primeiro</span>
            <span>Último</span>
            <span>Nascimento</span>
            <span>Telemóvel</span>
            <span>Faculdade</span>
            <span>Curso</span>
            <span>Ano</span>
            <span>Turma</span>
            <span>Regime</span>
            <span>Docs</span>
            <span></span>

          </div>

          <div className="divide-y">
            {filtered.map((r) => (
              <div
                key={r.id}
                className={`${GRID} cursor-pointer hover:bg-muted/40 transition-colors`}
                onClick={() => navigate(`/admin/discentes/${r.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") navigate(`/admin/discentes/${r.id}`); }}
              >
                <Avatar path={r.foto_url} name={`${r.primeiroNome} ${r.ultimoNome}`} />
                <span className="text-xs font-medium truncate">{r.primeiroNome}</span>
                <span className="text-xs truncate">{r.ultimoNome || "—"}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{r.nascimento || "—"}</span>
                <span className="text-xs tabular-nums truncate">{r.telemovel || "—"}</span>
                <span className="text-xs font-mono font-semibold">{r.faculdadeSigla}</span>
                <span className="text-xs font-mono">{r.curso}</span>
                <span className="text-xs tabular-nums">{r.ano}º</span>
                <span className="text-xs tabular-nums">{r.turma}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold w-fit ${r.regime === "bolseiro" ? "bg-amber-50 text-amber-700" : "bg-muted text-muted-foreground"}`}>
                  {r.regime === "bolseiro" ? "Bolseiro" : "Normal"}
                </span>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <DocPill label="BI" path={r.bilhete_url} onOpen={openDoc} Icon={IdCard} />
                  <DocPill label="Cert" path={r.certificado_url} onOpen={openDoc} Icon={FileText} />
                </div>
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeRow(r.id)}
                    disabled={deleteMut.isPending}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" /> Adicionar Discente
            </DialogTitle>
            <DialogDescription>Preencha os dados do estudante. O email institucional é gerado automaticamente.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* 1. Identificação Pessoal */}
            <section>
              <SectionTitle index={1} title="Identificação Pessoal" hint="Dados do estudante e documento de identidade" />
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => fotoInput.current?.click()}
                  className="w-20 h-20 shrink-0 rounded-lg border-2 border-dashed border-input bg-background flex items-center justify-center overflow-hidden hover:border-primary hover:bg-primary/5 transition"
                >
                  {draft.fotoPreview ? (
                    <img src={draft.fotoPreview} alt="foto" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span className="text-[9px]">Foto</span>
                    </div>
                  )}
                  <input
                    ref={fotoInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFoto(e.target.files?.[0] || null)}
                  />
                </button>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 flex-1">
                  <Field label="Primeiro nome">
                    <Input value={draft.primeiroNome} onChange={(e) => setF("primeiroNome", e.target.value)} placeholder="Ana" className="h-8 text-xs" />
                  </Field>
                  <Field label="Último nome">
                    <Input value={draft.ultimoNome} onChange={(e) => setF("ultimoNome", e.target.value)} placeholder="Silva" className="h-8 text-xs" />
                  </Field>
                  <Field label="Data de nascimento">
                    <Input type="date" value={draft.nascimento} onChange={(e) => setF("nascimento", e.target.value)} className="h-8 text-xs" />
                  </Field>
                  <Field label="Género">
                    <Select value={draft.genero} onValueChange={(v) => setF("genero", v as Genero)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Feminino</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Nº Bilhete de Identidade">
                    <Input value={draft.bilhete} onChange={(e) => setF("bilhete", e.target.value)} placeholder="00000000XX000" className="h-8 text-xs" />
                  </Field>
                </div>
              </div>
            </section>

            {/* 2. Enquadramento Académico */}
            <section>
              <SectionTitle index={2} title="Enquadramento Académico" hint="Faculdade, curso, ano, turma e regime de inscrição" />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <Field label="Faculdade">
                  <Select value={draft.faculdade_id} onValueChange={(v) => setF("faculdade_id", v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {faculdades.map((f: any) => (
                        <SelectItem key={f.id} value={f.id}>{f.sigla || f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Curso">
                  <Select value={draft.curso_id} onValueChange={(v) => setF("curso_id", v)} disabled={cursosDaFac.length === 0}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={cursosDaFac.length === 0 ? "Sem cursos" : "—"} />
                    </SelectTrigger>
                    <SelectContent>
                      {cursosDaFac.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.code || c.codigo || c.name || c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Ano">
                  <Select value={draft.ano} onValueChange={(v) => setF("ano", v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{anosPool.map((a) => <SelectItem key={a} value={a}>{a}º</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Turma">
                  <Select value={draft.turma} onValueChange={(v) => setF("turma", v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{turmasPool.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Regime">
                  <Select value={draft.regime} onValueChange={(v) => setF("regime", v as Regime)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bolseiro">Bolseiro</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </section>

            {/* 3. Contacto & Email */}
            <section>
              <SectionTitle index={3} title="Contacto & Email Institucional" hint="Telemóvel pessoal e email gerado automaticamente" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Field label="Telemóvel">
                  <Input value={draft.telemovel} onChange={(e) => setF("telemovel", e.target.value)} placeholder="+244 9XX XXX XXX" className="h-8 text-xs" />
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

            {/* 4. Morada */}
            <section>
              <SectionTitle index={4} title="Morada de Residência" hint="Localização atual do estudante" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Field label="Província">
                  <Select value={draft.provincia} onValueChange={(v) => setDraft((d) => ({ ...d, provincia: v, municipio: "" }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {PROVINCIAS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Município">
                  <Select value={draft.municipio} onValueChange={(v) => setF("municipio", v)} disabled={!draft.provincia}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={draft.provincia ? "—" : "Escolha província"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(MUNICIPIOS[draft.provincia] || []).map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <div className="md:col-span-2">
                  <Field label="Endereço">
                    <Input value={draft.endereco} onChange={(e) => setF("endereco", e.target.value)} placeholder="Rua, bairro, nº" className="h-8 text-xs" />
                  </Field>
                </div>
              </div>
            </section>

            {/* 5. Encarregado */}
            <section>
              <SectionTitle index={5} title="Encarregado de Educação" hint="Pessoa responsável pelo estudante" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Field label="Primeiro nome">
                  <Input value={draft.enc_primeiro_nome} onChange={(e) => setF("enc_primeiro_nome", e.target.value)} placeholder="João" className="h-8 text-xs" />
                </Field>
                <Field label="Último nome">
                  <Input value={draft.enc_ultimo_nome} onChange={(e) => setF("enc_ultimo_nome", e.target.value)} placeholder="Silva" className="h-8 text-xs" />
                </Field>
                <Field label="Parentesco">
                  <Input value={draft.enc_parentesco} onChange={(e) => setF("enc_parentesco", e.target.value)} placeholder="Pai / Mãe / Tutor" className="h-8 text-xs" />
                </Field>
                <Field label="Contacto telefónico">
                  <Input value={draft.enc_telefone} onChange={(e) => setF("enc_telefone", e.target.value)} placeholder="+244 9XX XXX XXX" className="h-8 text-xs" />
                </Field>
              </div>
            </section>

            {/* 6. Documentação */}
            <section>
              <SectionTitle index={6} title="Documentação Anexa" hint="Carregue os ficheiros em PDF ou imagem" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Field label="Bilhete de Identidade">
                  <FileButton
                    file={draft.bilheteFile}
                    onPick={(f) => setF("bilheteFile", f)}
                    inputRef={biInput}
                    accept="image/*,application/pdf"
                    Icon={IdCard}
                  />
                </Field>
                <Field label="Certificado Ensino Médio">
                  <FileButton
                    file={draft.certificadoFile}
                    onPick={(f) => setF("certificadoFile", f)}
                    inputRef={certInput}
                    accept="image/*,application/pdf"
                    Icon={FileText}
                  />
                </Field>
                <Field label="BI do Encarregado">
                  <FileButton
                    file={draft.encBilheteFile}
                    onPick={(f) => setF("encBilheteFile", f)}
                    inputRef={encBiInput}
                    accept="image/*,application/pdf"
                    Icon={IdCard}
                  />
                </Field>
              </div>
            </section>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={addRow}
              disabled={uploading || createMut.isPending || !draft.primeiroNome.trim() || !draft.curso_id}
              className="gap-1.5"
            >
              {(uploading || createMut.isPending) ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> A guardar…</>
              ) : (
                <><Plus className="w-3.5 h-3.5" /> Adicionar Discente</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

function SectionTitle({ index, title, hint }: { index: number; title: string; hint?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/60">
      <span className="w-5 h-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">{index}</span>
      <div className="flex items-baseline gap-2 min-w-0">
        <h3 className="text-xs font-semibold text-foreground">{title}</h3>
        {hint && <span className="text-[10px] text-muted-foreground truncate">— {hint}</span>}
      </div>
    </div>
  );
}

function FileButton({
  file, onPick, inputRef, accept, Icon,
}: {
  file: File | null;
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
        className={`flex-1 h-8 px-2 rounded-md border text-[11px] flex items-center gap-1.5 truncate transition ${file ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-dashed border-input bg-background text-muted-foreground hover:border-primary hover:text-primary"}`}
      >
        {file ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Upload className="w-3.5 h-3.5 shrink-0" />}
        <span className="truncate">{file ? file.name : "Carregar ficheiro"}</span>
        <Icon className="w-3.5 h-3.5 ml-auto shrink-0 opacity-70" />
      </button>
      {file && (
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

function DocPill({
  label, path, onOpen, Icon,
}: {
  label: string;
  path: string | null;
  onOpen: (p: string) => void;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  if (!path) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
        <Icon className="w-2.5 h-2.5" /> {label}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onOpen(path)}
      className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold"
    >
      <Icon className="w-2.5 h-2.5" /> {label}
    </button>
  );
}

function Avatar({ path, name }: { path: string | null; name: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    if (!path) { setUrl(null); return; }
    supabase.storage.from("discentes").createSignedUrl(path, 3600).then(({ data }) => {
      if (mounted) setUrl(data?.signedUrl || null);
    });
    return () => { mounted = false; };
  }, [path]);
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
  return (
    <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
      {url ? <img src={url} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { onboardingKey, readOnboardingStateFor, pushOnboarding } from "@/lib/onboardingStorage";
import { Building2, Loader2, Upload, CheckCircle2 } from "lucide-react";

interface OnboardingState {
  dados: { nome: string; tipo: string; sigla: string; provincia: string; municipio: string; endereco: string; telefone: string; email: string; nif: string; logoDataUrl: string };
  completed: boolean;
}

const initial: OnboardingState = {
  dados: { nome: "", tipo: "", sigla: "", provincia: "", municipio: "", endereco: "", telefone: "", email: "", nif: "", logoDataUrl: "" },
  completed: false,
};

const TIPO_OPTS = ["Universidade", "Instituto Superior Politécnico", "Instituto Superior", "Escola Superior", "Academia"];

const PROVINCIAS_MUNICIPIOS: Record<string, string[]> = {
  "Bengo": ["Ambriz", "Bula-Atumba", "Dande", "Dembos", "Kabiri", "Kiwaba-Kiazi", "Muxima", "Nambuangongo", "Pango-Aluquém", "Quiculungo", "Songo"],
  "Benguela": ["Balombo", "Benguela", "Baía Farta", "Bocoio", "Caimbambo", "Catumbela", "Chongoroi", "Cubal", "Ganda", "Lobito", "Sumbe"],
  "Bié": ["Andulo", "Camacupa", "Catabola", "Chinguar", "Chitembo", "Cuemba", "Cunhinga", "Cuito", "Nharea"],
  "Cabinda": ["Belize", "Buco Zau", "Cabinda", "Cacongo", "Miconje"],
  "Cuando Cubango": ["Calai", "Cuangar", "Cuchi", "Dirico", "Longa", "Mavinga", "Menongue", "Nancova", "Rivungo"],
  "Cuanza Norte": ["Ambaca", "Banga", "Bolongongo", "Bom Jesus", "Cazengo", "Golungo Alto", "Kambambe", "Lucala", "Quiculungo", "Samba-Cajú"],
  "Cuanza Sul": ["Amboim", "Cassangue", "Conda", "Ebo", "Libolo", "Mussende", "Porto Amboim", "Quibala", "Quilenda", "Seles", "Sumbe"],
  "Cunene": ["Cahama", "Cuvelai", "Curoca", "Kuroka", "Kuvelai", "Namacunde", "Ombadja", "Ondjiva", "Tchibote"],
  "Huambo": ["Bailundo", "Caála", "Catchiungo", "Chicala-Choloanga", "Chinjenje", "Ekunha", "Huambo", "Londuimbali", "Longonjo", "Mungo"],
  "Huíla": ["Caconda", "Caluquembe", "Chibia", "Chicomba", "Chipindo", "Gambos", "Humpata", "Jamba", "Kuvango", "Lubango", "Matala", "Quilengues", "Quipungo"],
  "Inhambane": ["Funhalouro", "Govuro", "Homoine", "Inhambane", "Inhassoro", "Jangamo", "Mabote", "Massinga", "Maxixe", "Morrumbene", "Panda", "Vilanculos", "Zavala"],
  "Luanda": ["Belas", "Cacuaco", "Cazenga", "Icolo e Bengo", "Luanda", "Quilamba-Kiaxi", "Quissama", "Talatona", "Viana"],
  "Lunda Norte": ["Cambulo", "Capenda-Camulemba", "Caungula", "Chitato", "Cuango", "Cuilo", "Lóvua", "Lubalo", "Lucapa", "Xá-Muteba"],
  "Lunda Sul": ["Cacolo", "Dala", "Muconda", "Saurimo"],
  "Malange": ["Cacolo", "Calandula", "Cambundi-Catembo", "Cangandala", "Capunda-Camulemba", "Cunda-Dia-Baze", "Kiwaba-Kiazi", "Luquembo", "Malange", "Marimba", "Massango", "Mucari", "Quela", "Quirima"],
  "Moxico": ["Alto Zambeze", "Bundas", "Cameia", "Chavuma", "Cuando", "Léua", "Luacano", "Luchazes", "Luvale", "Moxico"],
  "Namibe": ["Bibala", "Camacuio", "Moçâmedes", "Tombwa", "Virei"],
  "Nígera": ["Cuimba", "M'Bimba", "Nóqui", "Nzeto", "Soyo", "Tomboco"],
  "Uíge": ["Ambuíla", "Bembe", "Buengas", "Bungo", "Damba", "Maquela do Zombo", "Milunga", "Mucaba", "Negage", "Puri", "Quimbele", "Quitexe", "Sanza-Pombo", "Santa Cruz", "Uíge", "Vista Alegre"],
  "Zaire": ["Cuimba", "M'Banza Kongo", "Noqui", "Nzeto", "Soyo", "Tomboco"],
};

const PROVINCIAS_OPTS = Object.keys(PROVINCIAS_MUNICIPIOS).sort();


export default function AdminOnboarding() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const STORAGE = onboardingKey(user?.email);
  const [state, setState] = useState<OnboardingState>(() => {
    return readOnboardingStateFor(initial, user?.email);
  });
  const [success, setSuccess] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state, STORAGE]);

  const setDados = (patch: Partial<OnboardingState["dados"]>) =>
    setState((s) => ({ ...s, dados: { ...s.dados, ...patch } }));

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setDados({ logoDataUrl: String(reader.result || "") });
    reader.readAsDataURL(file);
  };

  const canSubmit = state.dados.nome.trim().length > 0;

  const activate = () => {
    if (!canSubmit) return;
    setActivating(true);
    setTimeout(() => {
      const nome = state.dados.nome.trim() || "Instituição";
      const next = { ...state, completed: true };
      setState(next);
      updateUser({ name: nome });
      try { localStorage.setItem(STORAGE, JSON.stringify(next)); } catch { /* ignore */ }
      setActivating(false);
      setSuccess(true);
    }, 900);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-card border border-border rounded-2xl shadow-xl p-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">A sua instituição está ativa.</h1>
          <p className="text-muted-foreground mb-6">
            {state.dados.nome} foi criada com sucesso. A configuração detalhada (informação académica, calendário, finanças, GAP e área académica) é feita a partir do painel de administração pelas equipas responsáveis.
          </p>
          <Button size="lg" className="w-full" onClick={() => navigate("/admin")}>
            Entrar no portal de administração
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar — Kortex branding */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-foreground text-background flex items-center justify-center shrink-0 font-black text-[13px] tracking-tight">K</div>
            <div className="text-[14px] font-bold text-foreground tracking-tight">kortex</div>
            <span className="hidden md:inline-block w-px h-4 bg-border mx-1" />
            <span className="hidden md:inline text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium">Onboarding inicial</span>
          </div>
          <div className="hidden sm:block text-[11px] text-muted-foreground">{user?.email}</div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6 text-center">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-primary">Passo 1 de 1</div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-1">Registo da Instituição</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Comece por identificar a sua instituição. A configuração detalhada (cursos, calendário, finanças, GAP, área académica) será feita depois no painel de administração.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2 flex items-center gap-4 p-4 rounded-lg border border-dashed border-border bg-muted/30">
              <div className="w-20 h-20 rounded-lg bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
                {state.dados.logoDataUrl
                  ? <img src={state.dados.logoDataUrl} alt="Logo" className="w-full h-full object-contain" />
                  : <Building2 className="w-8 h-8 text-muted-foreground" />}
              </div>
              <div className="flex-1">
                <Label className="text-sm font-semibold">Logótipo da instituição</Label>
                <p className="text-xs text-muted-foreground mb-2">PNG, JPG ou SVG. Recomendado quadrado.</p>
                <label className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted">
                  <Upload className="w-4 h-4" /> Carregar logótipo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
                </label>
              </div>
            </div>
            <Field label="Nome da universidade *">
              <Input value={state.dados.nome} onChange={(e) => setDados({ nome: e.target.value })} placeholder="Universidade Privada de Angola" />
            </Field>
            <Field label="Tipo de instituição">
              <Select value={state.dados.tipo} onValueChange={(v) => setDados({ tipo: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
                <SelectContent>{TIPO_OPTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Sigla"><Input value={state.dados.sigla} onChange={(e) => setDados({ sigla: e.target.value })} placeholder="UPRA" /></Field>
            <Field label="NIF"><Input value={state.dados.nif} onChange={(e) => setDados({ nif: e.target.value })} placeholder="5417000000" /></Field>
            <Field label="Província">
              <Select value={state.dados.provincia} onValueChange={(v) => setDados({ provincia: v, municipio: "" })}>
                <SelectTrigger><SelectValue placeholder="Selecionar província" /></SelectTrigger>
                <SelectContent>{PROVINCIAS_OPTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Município">
              <Select value={state.dados.municipio} onValueChange={(v) => setDados({ municipio: v })} disabled={!state.dados.provincia}>
                <SelectTrigger><SelectValue placeholder={state.dados.provincia ? "Selecionar município" : "Escolha a província primeiro"} /></SelectTrigger>
                <SelectContent>{(PROVINCIAS_MUNICIPIOS[state.dados.provincia] || []).map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Endereço" full>
              <Input value={state.dados.endereco} onChange={(e) => setDados({ endereco: e.target.value })} placeholder="Rua, número, bairro" />
            </Field>
            <Field label="Telefone"><Input value={state.dados.telefone} onChange={(e) => setDados({ telefone: e.target.value })} placeholder="+244 000 000 000" /></Field>
            <Field label="Email institucional"><Input type="email" value={state.dados.email} onChange={(e) => setDados({ email: e.target.value })} placeholder="contacto@instituicao.ao" /></Field>
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
            <Button variant="outline" size="lg" onClick={() => { logout(); navigate("/"); }}>
              Voltar
            </Button>
            <Button size="lg" onClick={activate} disabled={!canSubmit || activating} className="min-w-[200px]">
              {activating ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A ativar…</>) : "Ativar instituição"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2 space-y-1.5" : "space-y-1.5"}>
      <Label className="text-xs font-semibold text-foreground">{label}</Label>
      {children}
    </div>
  );
}

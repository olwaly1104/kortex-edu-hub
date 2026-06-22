import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Camera, User, Mail, Phone, MapPin, FileText, Upload, Trash2, CheckCircle2,
  IdCard, BadgeCheck, Briefcase, Save,
} from "lucide-react";
import { toast } from "sonner";

const PROVINCIAS_MUNICIPIOS: Record<string, string[]> = {
  "Luanda": ["Luanda", "Belas", "Cazenga", "Cacuaco", "Viana", "Talatona", "Icolo e Bengo", "Quiçama"],
  "Benguela": ["Benguela", "Lobito", "Catumbela", "Baía Farta", "Cubal", "Ganda"],
  "Huambo": ["Huambo", "Caála", "Bailundo", "Catchiungo", "Ekunha"],
  "Huíla": ["Lubango", "Humpata", "Chibia", "Matala", "Caconda"],
  "Bié": ["Kuito", "Andulo", "Camacupa", "Catabola"],
  "Cabinda": ["Cabinda", "Buco-Zau", "Cacongo", "Belize"],
  "Cuanza Norte": ["N'dalatando", "Cazengo", "Golungo Alto"],
  "Cuanza Sul": ["Sumbe", "Porto Amboim", "Gabela"],
  "Cunene": ["Ondjiva", "Cahama", "Curoca"],
  "Malanje": ["Malanje", "Cacuso", "Calandula"],
  "Moxico": ["Luena", "Camanongue", "Cameia"],
  "Namibe": ["Moçâmedes", "Tômbwa", "Bibala"],
  "Uíge": ["Uíge", "Negage", "Maquela do Zombo"],
  "Zaire": ["Mbanza Kongo", "Soyo", "N'zeto"],
};

export default function GapMeuPerfil() {
  const fileInputPhoto = useRef<HTMLInputElement>(null);
  const fileInputCv = useRef<HTMLInputElement>(null);
  const fileInputId = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [form, setForm] = useState({
    primeiroNome: "Yolanda",
    ultimoNome: "Leitão",
    email: "yolanda.leitao@upra.kor",
    telefone: "+244 923 456 789",
    cargo: "Coordenadora GAP",
    bi: "004567890LA041",
    provincia: "Luanda",
    municipio: "Talatona",
    endereco: "Rua das Acácias, n.º 142, Bairro Talatona",
    bio: "Coordenadora do Gabinete de Apoio ao Discente. Responsável pela gestão de candidaturas, atendimentos e acompanhamento de estudantes.",
  });

  const [cv, setCv] = useState<{ name: string; size: number; uploadedAt: string } | null>(null);
  const [docId, setDocId] = useState<{ name: string; size: number; uploadedAt: string } | null>(null);

  const update = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Selecione uma imagem válida."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem máxima de 5 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setPhoto(String(reader.result)); toast.success("Fotografia actualizada."); };
    reader.readAsDataURL(file);
  };

  const onCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Ficheiro máximo de 10 MB."); return; }
    setCv({ name: file.name, size: file.size, uploadedAt: new Date().toISOString().slice(0, 10) });
    toast.success("CV carregado.");
  };

  const onIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Ficheiro máximo de 10 MB."); return; }
    setDocId({ name: file.name, size: file.size, uploadedAt: new Date().toISOString().slice(0, 10) });
    toast.success("Documento de identificação carregado.");
  };

  const fmtSize = (b: number) => b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

  const initials = (form.primeiroNome[0] || "") + (form.ultimoNome[0] || "");
  const municipios = PROVINCIAS_MUNICIPIOS[form.provincia] || [];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
        <div className="flex items-start gap-5 flex-wrap">
          <button
            type="button"
            onClick={() => fileInputPhoto.current?.click()}
            className="relative group shrink-0"
            aria-label="Alterar fotografia de perfil"
          >
            <Avatar className="w-24 h-24 border-4 border-background shadow-md">
              {photo ? <AvatarImage src={photo} alt="Perfil" /> : null}
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <input
              ref={fileInputPhoto}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPhotoChange}
            />
          </button>
          <div className="flex-1 min-w-[220px]">
            <h1 className="text-2xl font-bold text-foreground">{form.primeiroNome} {form.ultimoNome}</h1>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> {form.cargo}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="gap-1"><Mail className="w-3 h-3" /> {form.email}</Badge>
              <Badge variant="outline" className="gap-1"><Phone className="w-3 h-3" /> {form.telefone}</Badge>
              <Badge variant="outline" className="gap-1"><MapPin className="w-3 h-3" /> {form.municipio}, {form.provincia}</Badge>
            </div>
          </div>
          <Button onClick={() => toast.success("Perfil guardado.")} className="gap-2">
            <Save className="w-4 h-4" /> Guardar alterações
          </Button>
        </div>
      </Card>

      {/* Identificação */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Identificação</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Primeiro nome</Label>
            <Input value={form.primeiroNome} onChange={e => update("primeiroNome", e.target.value)} className="mt-1 h-10" />
          </div>
          <div>
            <Label className="text-xs">Último nome</Label>
            <Input value={form.ultimoNome} onChange={e => update("ultimoNome", e.target.value)} className="mt-1 h-10" />
          </div>
          <div>
            <Label className="text-xs">Email institucional</Label>
            <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} className="mt-1 h-10" />
          </div>
          <div>
            <Label className="text-xs">Telefone</Label>
            <Input value={form.telefone} onChange={e => update("telefone", e.target.value)} className="mt-1 h-10" />
          </div>
          <div>
            <Label className="text-xs">N.º Bilhete de Identidade</Label>
            <Input value={form.bi} onChange={e => update("bi", e.target.value)} className="mt-1 h-10" />
          </div>
          <div>
            <Label className="text-xs">Cargo</Label>
            <Input value={form.cargo} onChange={e => update("cargo", e.target.value)} className="mt-1 h-10" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Biografia / Notas</Label>
            <Textarea rows={3} value={form.bio} onChange={e => update("bio", e.target.value)} className="mt-1" />
          </div>
        </div>
      </Card>

      {/* Morada */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Morada</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Província</Label>
            <Select value={form.provincia} onValueChange={(v) => { update("provincia", v); update("municipio", PROVINCIAS_MUNICIPIOS[v]?.[0] || ""); }}>
              <SelectTrigger className="mt-1 h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(PROVINCIAS_MUNICIPIOS).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Município</Label>
            <Select value={form.municipio} onValueChange={(v) => update("municipio", v)}>
              <SelectTrigger className="mt-1 h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {municipios.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Endereço (rua, número, bairro)</Label>
            <Input value={form.endereco} onChange={e => update("endereco", e.target.value)} className="mt-1 h-10" />
          </div>
        </div>
      </Card>

      {/* Documentos */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Documentos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CV */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Curriculum Vitae</p>
                <p className="text-[11px] text-muted-foreground">PDF, DOC ou DOCX · máx. 10 MB</p>
              </div>
            </div>
            {cv ? (
              <div className="mt-3 rounded-md bg-muted/40 p-2.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{cv.name}</p>
                  <p className="text-[10px] text-muted-foreground">{fmtSize(cv.size)} · {cv.uploadedAt}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setCv(null)} aria-label="Remover CV">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : null}
            <Button variant="outline" size="sm" className="w-full mt-3 gap-1.5" onClick={() => fileInputCv.current?.click()}>
              <Upload className="w-3.5 h-3.5" /> {cv ? "Substituir CV" : "Carregar CV"}
            </Button>
            <input ref={fileInputCv} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={onCvChange} />
          </div>

          {/* ID Document */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <IdCard className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Documento de Identificação</p>
                <p className="text-[11px] text-muted-foreground">BI ou Passaporte · PDF ou imagem · máx. 10 MB</p>
              </div>
            </div>
            {docId ? (
              <div className="mt-3 rounded-md bg-muted/40 p-2.5 flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{docId.name}</p>
                  <p className="text-[10px] text-muted-foreground">{fmtSize(docId.size)} · {docId.uploadedAt}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setDocId(null)} aria-label="Remover documento">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : null}
            <Button variant="outline" size="sm" className="w-full mt-3 gap-1.5" onClick={() => fileInputId.current?.click()}>
              <Upload className="w-3.5 h-3.5" /> {docId ? "Substituir documento" : "Carregar documento"}
            </Button>
            <input ref={fileInputId} type="file" accept=".pdf,image/*" className="hidden" onChange={onIdChange} />
          </div>
        </div>
      </Card>
    </div>
  );
}

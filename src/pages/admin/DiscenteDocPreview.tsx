import { Printer, Download, Users, Share2 } from "lucide-react";
import logoAsset from "@/assets/logo-upra.asset.json";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const sharedWith: { name: string; role: string; access: "Visualizar" | "Editar" }[] = [
  { name: "Prof. Dr. António Mendes", role: "Reitor", access: "Visualizar" },
  { name: "Dra. Helena Cabral", role: "Responsável GAP", access: "Visualizar" },
  { name: "Eng. Paulo Mendes", role: "Coordenador do Curso", access: "Visualizar" },
  { name: "Sara Vieira", role: "Académica", access: "Editar" },
];

export type DiscenteDoc = {
  id: string;
  nome: string;
  email: string;
  primeiro_nome?: string | null;
  nome_meio?: string | null;
  ultimo_nome?: string | null;
  nascimento?: string | null;
  genero?: string | null;
  regime?: string | null;
  bilhete?: string | null;
  telemovel?: string | null;
  provincia?: string | null;
  municipio?: string | null;
  endereco?: string | null;
  enc_nome?: string | null;
  enc_parentesco?: string | null;
  enc_telefone?: string | null;
  ano: string;
  turma: string;
  foto_url?: string | null;
  bilhete_url?: string | null;
  certificado_url?: string | null;
  enc_bilhete_url?: string | null;
  created_at?: string;
};

type Props = {
  discente: DiscenteDoc;
  fotoSrc: string | null;
  cursoName: string;
  cursoCode: string;
  faculdadeName: string;
  displayId: string;
};

const fmtDataShort = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const generoLabel = (g?: string | null) =>
  g === "M" ? "Masculino" : g === "F" ? "Feminino" : (g || "—");

const regimeLabel = (r?: string | null) =>
  r === "bolseiro" ? "Bolseiro" : "Normal";

export default function DiscenteDocPreview({
  discente: d, fotoSrc, cursoName, cursoCode, faculdadeName, displayId,
}: Props) {
  const { toast } = useToast();

  const encParts = (d.enc_nome || "").trim().split(/\s+/).filter(Boolean);
  const encPrimeiro = encParts[0] || "";
  const encUltimo = encParts.length > 1 ? encParts.slice(1).join(" ") : "";


  const docs: { nome: string; ok: boolean }[] = [
    { nome: "Bilhete de Identidade", ok: !!d.bilhete_url },
    { nome: "Certificado Ensino Médio", ok: !!d.certificado_url },
    { nome: "BI do Encarregado", ok: !!d.enc_bilhete_url },
    { nome: "Fotografia", ok: !!d.foto_url },
  ];
  const docsOk = docs.filter(x => x.ok).length;

  const stepsDados: { title: string; rows: [string, string][] }[] = [
    {
      title: "Identificação Pessoal",
      rows: [
        ["Nome completo", d.nome],
        ["Primeiro nome", d.primeiro_nome || "—"],
        ["Nome do meio", d.nome_meio || "—"],
        ["Último nome", d.ultimo_nome || "—"],
        ["Data de nascimento", fmtDataShort(d.nascimento)],
        ["Género", generoLabel(d.genero)],
        ["Nº Bilhete de Identidade", d.bilhete || "—"],
      ],
    },
    {
      title: "Enquadramento Académico",
      rows: [
        ["Faculdade", faculdadeName],
        ["Curso", cursoCode ? `${cursoCode} · ${cursoName}` : cursoName],
        ["Ano curricular", `${d.ano}º Ano`],
        ["Turma", `Turma ${d.turma}`],
        ["Regime", regimeLabel(d.regime)],
        ["Data de matriculação", fmtDataShort(d.created_at)],
        ["Email institucional", d.email],
      ],
    },
    {
      title: "Contacto & Morada",
      rows: [
        ["Telemóvel", d.telemovel || "—"],
        ["Província", d.provincia || "—"],
        ["Município", d.municipio || "—"],
        ["Endereço", d.endereco || "—"],
      ],
    },
    {
      title: "Encarregado de Educação",
      rows: [
        ["Primeiro nome", encPrimeiro || "—"],
        ["Último nome", encUltimo || "—"],
        ["Parentesco", d.enc_parentesco || "—"],
        ["Contacto telefónico", d.enc_telefone || "—"],
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 bg-neutral-200/70">
      {/* Toolbar */}
      <div className="relative flex items-center shrink-0 print:hidden bg-gradient-to-b from-background to-muted/30 pl-5 pr-14 py-2 border-b border-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border border-border shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10.5px] font-mono font-semibold text-foreground tabular-nums">{displayId}</span>
          </div>
          <span className="text-[11px] text-muted-foreground truncate">Ficha do Discente</span>
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[210mm] max-w-[calc(100%-2rem)] flex items-center justify-end">
          <div className="pointer-events-auto flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border bg-background hover:bg-muted/60 hover:border-foreground/20 text-[11px] font-medium text-primary transition-all"
                  title="Pessoas com acesso"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="tabular-nums">{sharedWith.length}</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-primary" /> Partilhado com {sharedWith.length} pessoas
                  </DialogTitle>
                  <DialogDescription className="text-[12px]">
                    Pessoas com acesso ao documento <span className="font-medium text-foreground">{displayId}</span>.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 mt-2">
                  {sharedWith.map((p, i) => {
                    const ini = p.name.split(" ").slice(0, 2).map(n => n[0]).join("");
                    return (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-muted/20">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold ring-1 ring-primary/15 shrink-0">
                          {ini}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{p.role}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 shrink-0">{p.access}</Badge>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>

            <button
              type="button"
              onClick={() => window.print()}
              className="h-8 px-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground bg-background border border-border rounded-md shadow-sm hover:bg-muted/60 hover:border-foreground/20 transition-all"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir
            </button>
            <button
              type="button"
              onClick={() => toast({ title: "Documento exportado", description: `${displayId}.pdf` })}
              className="h-8 px-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary-foreground bg-primary rounded-md shadow-sm hover:bg-primary/90 hover:shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Descarregar
            </button>
          </div>
        </div>
      </div>

      {/* A4 page */}
      <div className="flex-1 min-h-0 overflow-y-auto py-8 px-4">
        <div
          className="mx-auto bg-white shadow-md print:shadow-none flex flex-col text-neutral-900"
          style={{ width: "210mm", minHeight: "297mm", fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          {/* Top bar */}
          <div className="px-10 pt-6 pb-3 flex items-center justify-between border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <img src={logoAsset.url} alt="UPRA" className="h-12 w-auto object-contain" />
              <div className="leading-tight">
                <p className="text-[11px] font-bold text-neutral-900">Universidade Privada de Angola</p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-semibold">
                  Direcção Académica
                </p>
              </div>
            </div>
            <div className="text-right leading-tight">
              <p className="text-[9px] uppercase tracking-[0.18em] text-neutral-500 font-semibold">Matrícula Nº</p>
              <p className="font-mono text-[12px] font-bold text-neutral-900 tabular-nums">{displayId}</p>
            </div>
          </div>

          {/* Header */}
          <header className="px-10 pt-5 pb-5 border-b-2 border-neutral-900">
            <div className="flex items-start gap-5">
              {fotoSrc ? (
                <img
                  src={fotoSrc}
                  alt={`Foto — ${d.nome}`}
                  loading="lazy"
                  className="w-[95px] h-[120px] object-cover border border-neutral-400 bg-neutral-100 shrink-0"
                />
              ) : (
                <div className="w-[95px] h-[120px] border border-neutral-400 bg-neutral-100 shrink-0 flex items-center justify-center text-[10px] text-neutral-500 uppercase tracking-wider">
                  Sem foto
                </div>
              )}

              <div className="flex-1 min-w-0 pt-1">
                <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-500 font-bold mb-1.5">
                  Ficha do Discente
                </p>
                <h1 className="text-[22px] leading-[1.1] font-bold tracking-tight text-neutral-900">
                  {d.nome}
                </h1>
                <div className="mt-3 flex items-end gap-5 text-[10px] text-neutral-600">
                  <div>
                    <p className="text-[8.5px] uppercase tracking-[0.18em] text-neutral-500 font-semibold mb-0.5">Curso</p>
                    <span className="font-semibold text-neutral-900 text-[10.5px]">
                      {cursoCode || cursoName}
                    </span>
                  </div>
                  <div>
                    <p className="text-[8.5px] uppercase tracking-[0.18em] text-neutral-500 font-semibold mb-0.5">Ano · Turma</p>
                    <span className="font-semibold text-neutral-900 tabular-nums text-[10.5px]">
                      {d.ano}º · {d.turma}
                    </span>
                  </div>
                  <div>
                    <p className="text-[8.5px] uppercase tracking-[0.18em] text-neutral-500 font-semibold mb-0.5">Regime</p>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                      <span className="uppercase tracking-[0.14em] font-bold text-neutral-900 text-[10.5px]">
                        {regimeLabel(d.regime)}
                      </span>
                    </span>
                  </div>
                  <div>
                    <p className="text-[8.5px] uppercase tracking-[0.18em] text-neutral-500 font-semibold mb-0.5">Inscrito em</p>
                    <span className="font-semibold text-neutral-900 tabular-nums text-[10.5px]">
                      {fmtDataShort(d.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documentos */}
              <div className="w-[200px] shrink-0 border border-neutral-300 bg-white">
                <div className="px-2 py-1 bg-neutral-100 border-b border-neutral-300 flex items-center justify-between">
                  <p className="text-[9.5px] uppercase tracking-[0.16em] font-bold text-neutral-700">Documentos</p>
                  <p className="text-[9.5px] tabular-nums text-neutral-600 font-semibold">{docsOk}/{docs.length}</p>
                </div>
                <ul className="divide-y divide-neutral-200">
                  {docs.map((doc, i) => (
                    <li key={i} className="flex items-center gap-1.5 px-2 py-[3px] text-[9.5px] text-neutral-800">
                      <span className={doc.ok ? "text-emerald-700 font-bold leading-none" : "text-neutral-400 font-bold leading-none"}>
                        {doc.ok ? "✓" : "—"}
                      </span>
                      <span className={`truncate ${doc.ok ? "" : "text-neutral-500"}`}>{doc.nome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </header>

          <div className="flex-1 px-10 py-5 space-y-4">
            {stepsDados.map((s, i) => (
              <Section key={i} title={s.title}>
                <XTable rows={s.rows} />
              </Section>
            ))}
          </div>

          {/* Footer */}
          <footer className="px-10 pb-6 pt-3 mt-auto border-t border-neutral-300 flex items-end justify-between gap-8">
            <p className="text-[9.5px] text-neutral-500 leading-relaxed max-w-sm">
              Documento gerado pela Direcção Académica. Contacto:{" "}
              <span className="font-semibold text-neutral-700">academica@upra.kor</span>.
            </p>
            <div className="text-right">
              <div className="border-t border-neutral-400 pt-1 min-w-[200px]">
                <p className="text-[9px] uppercase tracking-[0.18em] text-neutral-500 font-semibold">
                  Direcção Académica
                </p>
                <p className="text-[11px] font-semibold text-neutral-900 mt-0.5">Sara Vieira</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-neutral-900 mb-1.5 pb-1 border-b border-neutral-300">
        {title}
      </h3>
      {children}
    </section>
  );
}

function XTable({ rows }: { rows: [string, string][] }) {
  const labelCls =
    "w-[32%] bg-neutral-100 font-semibold text-neutral-700 text-[9.5px] uppercase tracking-wider border border-neutral-400 px-2.5 py-1 align-top";
  const valueCls = "border border-neutral-300 px-2.5 py-1 align-top";
  return (
    <table className="w-full border-collapse text-[10.5px] table-fixed">
      <tbody>
        {rows.map(([k, v], i) => {
          const value = (v ?? "").toString().trim();
          return (
            <tr key={i}>
              <td className={labelCls}>{k}</td>
              <td className={`${valueCls} ${value ? "" : "text-neutral-400 italic"}`}>
                {value || "—"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

import { Printer, Download } from "lucide-react";
import logoAsset from "@/assets/logo-upra.asset.json";
import { useToast } from "@/hooks/use-toast";
import type { DocenteRow } from "@/lib/peopleStorage";

type Props = { docente: DocenteRow; displayId: string };

const fmtDataShort = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const generoLabel = (g?: string | null) => g === "M" ? "Masculino" : g === "F" ? "Feminino" : (g || "—");
const moduloLabel = (v?: string) => {
  switch ((v || "").toLowerCase()) {
    case "professor": return "Professor";
    case "coordenador": return "Coordenador de Curso";
    case "decano": return "Decano";
    case "reitor": return "Reitor";
    default: return v || "—";
  }
};

export default function DocenteDocPreview({ docente: d, displayId }: Props) {
  const { toast } = useToast();
  const fullName = `${d.prefixo || ""} ${d.primeiroNome} ${d.ultimoNome}`.trim();

  const docs = [
    { nome: "Bilhete de Identidade", ok: !!d.bilheteFileName },
    { nome: "Curriculum Vitae", ok: !!d.cvFileName },
    { nome: d.grau ? `Diploma de ${d.grau}` : "Diploma académico", ok: !!d.diplomaFileName },
    { nome: "Fotografia", ok: !!d.fotoDataUrl },
  ];
  const docsOk = docs.filter((x) => x.ok).length;

  const stepsDados: { title: string; rows: [string, string][] }[] = [
    {
      title: "Identificação Pessoal",
      rows: [
        ["Nome completo", fullName],
        ["Data de nascimento", fmtDataShort(d.nascimento)],
        ["Género", generoLabel(d.genero)],
        ["Nº Bilhete de Identidade", d.bilhete || "—"],
        ["Módulo Kortex", moduloLabel(d.moduloKortex)],
      ],
    },
    {
      title: "Afiliação Institucional",
      rows: [
        ["Faculdade", d.faculdade || "—"],
        ["Curso", d.curso || "—"],
        ["Departamento", d.departamento || "—"],
        ["Cargo", d.cargo || "—"],
        ["Contrato", d.contrato || "—"],
        ["Email institucional", d.email || "—"],
      ],
    },
    {
      title: "Contacto & Morada",
      rows: [
        ["Telemóvel", d.contacto || "—"],
        ["Província", d.provincia || "—"],
        ["Município", d.municipio || "—"],
        ["Endereço", d.endereco || "—"],
      ],
    },
    {
      title: "Formação Académica",
      rows: [
        ["Grau máximo", d.grau || "—"],
        ["Curso", d.especialidade || "—"],
        ["Instituição de formação", d.instituicaoFormacao || "—"],
        ["Anos de docência", d.anosExperiencia ? `${d.anosExperiencia} anos` : "—"],
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 bg-neutral-200/70">
      <div className="relative flex items-center shrink-0 print:hidden bg-gradient-to-b from-background to-muted/30 pl-5 pr-14 py-2 border-b border-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border border-border shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10.5px] font-mono font-semibold text-foreground tabular-nums">{displayId}</span>
          </div>
          <span className="text-[11px] text-muted-foreground truncate">Perfil do Docente</span>
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[210mm] max-w-[calc(100%-2rem)] flex items-center justify-end">
          <div className="pointer-events-auto flex items-center gap-2">
            <button onClick={() => window.print()} className="h-8 px-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground bg-background border border-border rounded-md shadow-sm hover:bg-muted/60 transition-all">
              <Printer className="w-3.5 h-3.5" /> Imprimir
            </button>
            <button onClick={() => toast({ title: "Documento exportado", description: `${displayId}.pdf` })} className="h-8 px-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary-foreground bg-primary rounded-md shadow-sm hover:bg-primary/90 transition-all">
              <Download className="w-3.5 h-3.5" /> Descarregar
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto py-8 px-4">
        <div className="mx-auto bg-white shadow-md print:shadow-none flex flex-col text-neutral-900" style={{ width: "210mm", minHeight: "297mm", fontFamily: "'Inter', system-ui, sans-serif" }}>
          <div className="px-10 pt-6 pb-3 flex items-center justify-between border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <img src={logoAsset.url} alt="UPRA" className="h-12 w-auto object-contain" />
              <div className="leading-tight">
                <p className="text-[11px] font-bold text-neutral-900">Universidade Privada de Angola</p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-semibold">Recursos Humanos</p>
              </div>
            </div>
            <div className="text-right leading-tight">
              <p className="text-[9px] uppercase tracking-[0.18em] text-neutral-500 font-semibold">Docente Nº</p>
              <p className="font-mono text-[12px] font-bold text-neutral-900 tabular-nums">{displayId}</p>
            </div>
          </div>

          <header className="px-10 pt-5 pb-5 border-b-2 border-neutral-900">
            <div className="flex items-start gap-5">
              {d.fotoDataUrl ? (
                <img src={d.fotoDataUrl} alt={fullName} className="w-[95px] h-[120px] object-cover border border-neutral-400 bg-neutral-100 shrink-0" />
              ) : (
                <div className="w-[95px] h-[120px] border border-neutral-400 bg-neutral-100 shrink-0 flex items-center justify-center text-[10px] text-neutral-500 uppercase tracking-wider">Sem foto</div>
              )}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-500 font-bold mb-1.5">Perfil do Docente</p>
                <h1 className="text-[22px] leading-[1.1] font-bold tracking-tight text-neutral-900">{fullName}</h1>
                <div className="mt-3 flex items-end gap-5 text-[10px] text-neutral-600">
                  <div>
                    <p className="text-[8.5px] uppercase tracking-[0.18em] text-neutral-500 font-semibold mb-0.5">Faculdade</p>
                    <span className="font-semibold text-neutral-900 text-[10.5px]">{d.faculdade || "—"}</span>
                  </div>
                  <div>
                    <p className="text-[8.5px] uppercase tracking-[0.18em] text-neutral-500 font-semibold mb-0.5">Curso</p>
                    <span className="font-semibold text-neutral-900 text-[10.5px]">{d.curso || "—"}</span>
                  </div>
                  <div>
                    <p className="text-[8.5px] uppercase tracking-[0.18em] text-neutral-500 font-semibold mb-0.5">Departamento</p>
                    <span className="font-semibold text-neutral-900 text-[10.5px]">{d.departamento || "—"}</span>
                  </div>
                  <div>
                    <p className="text-[8.5px] uppercase tracking-[0.18em] text-neutral-500 font-semibold mb-0.5">Cargo</p>
                    <span className="font-semibold text-neutral-900 text-[10.5px]">{d.cargo || "—"}</span>
                  </div>

                </div>
              </div>

              <div className="w-[200px] shrink-0 border border-neutral-300 bg-white">
                <div className="px-2 py-1 bg-neutral-100 border-b border-neutral-300 flex items-center justify-between">
                  <p className="text-[9.5px] uppercase tracking-[0.16em] font-bold text-neutral-700">Documentos</p>
                  <p className="text-[9.5px] tabular-nums text-neutral-600 font-semibold">{docsOk}/{docs.length}</p>
                </div>
                <ul className="divide-y divide-neutral-200">
                  {docs.map((doc, i) => (
                    <li key={i} className="flex items-center gap-1.5 px-2 py-[3px] text-[9.5px] text-neutral-800">
                      <span className={doc.ok ? "text-emerald-700 font-bold leading-none" : "text-neutral-400 font-bold leading-none"}>{doc.ok ? "✓" : "—"}</span>
                      <span className={`truncate ${doc.ok ? "" : "text-neutral-500"}`}>{doc.nome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </header>

          <div className="flex-1 px-10 py-5 space-y-4">
            {stepsDados.map((s, i) => (
              <Section key={i} title={s.title}><XTable rows={s.rows} /></Section>
            ))}
          </div>

          <footer className="px-10 pb-6 pt-3 mt-auto border-t border-neutral-300 flex items-end justify-between gap-8">
            <p className="text-[9.5px] text-neutral-500 leading-relaxed max-w-sm">
              Documento gerado pela direcção de Recursos Humanos. Contacto: <span className="font-semibold text-neutral-700">rh@upra.kor</span>.
            </p>
            <div className="text-right">
              <div className="border-t border-neutral-400 pt-1 min-w-[200px]">
                <p className="text-[9px] uppercase tracking-[0.18em] text-neutral-500 font-semibold">Recursos Humanos</p>
                <p className="text-[11px] font-semibold text-neutral-900 mt-0.5">Direcção de RH</p>
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
      <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-neutral-900 mb-1.5 pb-1 border-b border-neutral-300">{title}</h3>
      {children}
    </section>
  );
}

function XTable({ rows }: { rows: [string, string][] }) {
  const labelCls = "w-[32%] bg-neutral-100 font-semibold text-neutral-700 text-[9.5px] uppercase tracking-wider border border-neutral-400 px-2.5 py-1 align-top";
  const valueCls = "border border-neutral-300 px-2.5 py-1 align-top";
  return (
    <table className="w-full border-collapse text-[10.5px] table-fixed">
      <tbody>
        {rows.map(([k, v], i) => {
          const value = (v ?? "").toString().trim();
          return (
            <tr key={i}>
              <td className={labelCls}>{k}</td>
              <td className={`${valueCls} ${value ? "" : "text-neutral-400 italic"}`}>{value || "—"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

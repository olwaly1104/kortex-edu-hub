import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { inscricoesRecent } from "@/data/inscricoesData";

const ACCENT = "hsl(214 60% 26%)";
const ACCENT_BG_06 = "hsl(214 60% 26% / 0.06)";
const ACCENT_BG_03 = "hsl(214 60% 26% / 0.03)";
const ACCENT_BORDER_35 = "hsl(214 60% 26% / 0.35)";
const ACCENT_BORDER_25 = "hsl(214 60% 26% / 0.25)";

const fmtDataLong = (d: Date) =>
  d.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

const fmtData = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function InscricaoDoc() {
  const { ref } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const c = inscricoesRecent.find(x => x.ref === ref);

  if (!c) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/inscricoes")} className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <p className="text-muted-foreground text-center py-12 text-sm">Candidato não encontrado.</p>
      </div>
    );
  }

  const docsEntregues = c.documentos.filter(d => d.entregue).length;
  const aprovado = c.notaSessao !== undefined && c.notaSessao >= 10;

  const partilhar = async () => {
    const url = `${window.location.origin}/inscricoes/candidato/${c.ref}/documento`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Ficha ${c.ref}`, text: c.nome, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copiado", description: "Ligação para o documento copiada." });
      }
    } catch { /* noop */ }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0 print:hidden">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => navigate(`/inscricoes/candidato/${c.ref}`)}>
            <ArrowLeft className="w-3 h-3" /> Voltar
          </Button>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-[11px] font-mono font-semibold text-muted-foreground">Ficha-{c.ref}</span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-[11px] text-muted-foreground">Ficha de Inscrição do Candidato</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={partilhar}>
            <Share2 className="w-3 h-3" /> Partilhar
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => window.print()}>
            <Printer className="w-3 h-3" /> Imprimir
          </Button>
          <Button
            variant="outline" size="sm" className="h-7 text-[11px] gap-1.5"
            onClick={() => toast({ title: "Documento exportado", description: `Ficha-${c.ref}.pdf` })}
          >
            <Download className="w-3 h-3" /> Descarregar
          </Button>
        </div>
      </div>

      {/* A4 page */}
      <div className="flex-1 min-h-0 overflow-y-auto py-6 px-4 bg-muted/30">
        <div
          className="mx-auto bg-white shadow-md border border-border print:shadow-none print:border-0 flex flex-col text-foreground"
          style={{ width: "210mm", minHeight: "297mm" }}
        >
          {/* Header */}
          <div className="px-12 pt-9 pb-4">
            <div className="flex items-start justify-between gap-6 pb-3 border-b border-foreground">
              <div>
                <p className="text-[8px] uppercase tracking-[0.24em] text-foreground/60 font-semibold">Universidade Privada</p>
                <h1 className="text-[15px] font-bold tracking-tight leading-tight mt-0.5">
                  Portal de Inscrições · Académica
                </h1>
                <p className="text-[9px] text-foreground/60 mt-0.5">
                  Processo de admissão · Ano lectivo 2026 / 2027
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-[11px] font-semibold tracking-tight">Ficha-{c.ref}</p>
                <p className="text-[8.5px] text-foreground/60 mt-0.5">{fmtDataLong(new Date())}</p>
              </div>
            </div>
            <div className="h-px bg-foreground/40 mt-[2px]" />
          </div>

          {/* Title */}
          <div className="px-12 pt-3 pb-5">
            <p className="text-[8.5px] uppercase tracking-[0.24em] font-semibold" style={{ color: ACCENT }}>
              Ficha Oficial do Candidato · {c.sessao}
            </p>
            <h2 className="text-[17px] font-bold leading-tight tracking-tight mt-1">{c.nome}</h2>
          </div>

          {/* Body */}
          <div className="flex-1 px-12 pb-6 space-y-5">
            {/* I · Identificação */}
            <Section number="I" title="Identificação do Candidato">
              <div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${ACCENT_BORDER_35}` }}>
                <div className="grid grid-cols-2" style={{ background: ACCENT_BG_06, borderBottom: `1px solid ${ACCENT_BORDER_35}` }}>
                  <div className="px-3 py-1.5" style={{ borderRight: `1px solid ${ACCENT_BORDER_25}` }}>
                    <p className="text-[7.5px] uppercase tracking-[0.22em] font-bold" style={{ color: ACCENT }}>Dados Pessoais</p>
                  </div>
                  <div className="px-3 py-1.5">
                    <p className="text-[7.5px] uppercase tracking-[0.22em] font-bold" style={{ color: ACCENT }}>Contactos & Morada</p>
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <GroupCell rows={[
                    ["Nome", c.nome],
                    ["BI", c.bi],
                    ["Nascimento", fmtData(c.nascimento)],
                    ["Género", c.genero],
                    ["Naturalidade", c.naturalidade],
                    ["Nacionalidade", c.nacionalidade],
                  ]} bordered />
                  <GroupCell rows={[
                    ["Email", c.email],
                    ["Telemóvel", c.telemovel],
                    ["Província", c.provincia],
                    ["Município", c.municipio],
                    ["Endereço", c.endereco],
                  ]} />
                </div>
              </div>
            </Section>

            {/* II · Encarregado */}
            <Section number="II" title="Encarregado de Educação">
              <div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${ACCENT_BORDER_35}` }}>
                <div className="grid grid-cols-2">
                  <GroupCell rows={[
                    ["Nome", c.encNome],
                    ["BI", c.encBi],
                    ["Parentesco", c.encParentesco],
                  ]} bordered />
                  <GroupCell rows={[
                    ["Telefone", c.encTelefone],
                    ["Email", c.encEmail],
                  ]} />
                </div>
              </div>
            </Section>

            {/* III · Curso & Sessão */}
            <Section number="III" title="Curso & Sessão de Prova">
              <div className="px-5 py-3.5" style={{ borderTop: `3px solid ${ACCENT}`, background: ACCENT_BG_03 }}>
                <div className="grid grid-cols-4 gap-4">
                  <KV label="Faculdade" value={c.faculdade} />
                  <KV label="1ª opção" value={c.curso} />
                  <KV label="2ª opção" value={c.curso2 || "—"} />
                  <KV label="Sessão" value={c.sessao} />
                </div>
              </div>
            </Section>

            {/* IV · Resultado */}
            <Section number="IV" title="Resultado da Prova de Acesso">
              <div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${ACCENT_BORDER_35}` }}>
                <div className="grid grid-cols-3 divide-x" style={{ borderColor: ACCENT_BORDER_25 }}>
                  <div className="px-4 py-3">
                    <p className="text-[7.5px] uppercase tracking-[0.2em] font-bold text-foreground/60">Data da Prova</p>
                    <p className="text-[12px] font-semibold tabular-nums mt-1">{fmtData(c.dataProva)}</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[7.5px] uppercase tracking-[0.2em] font-bold text-foreground/60">Nota da Sessão</p>
                    {c.notaSessao !== undefined ? (
                      <p className="text-[20px] font-bold tabular-nums leading-none mt-1" style={{ color: ACCENT }}>
                        {c.notaSessao.toFixed(1)}<span className="text-[10px] text-foreground/50 font-medium"> / 20</span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-foreground/50 italic mt-2">Por realizar</p>
                    )}
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[7.5px] uppercase tracking-[0.2em] font-bold text-foreground/60">Estado</p>
                    <p className="text-[12px] font-semibold mt-1">{c.estado}</p>
                    {c.notaSessao !== undefined && (
                      <p className={`text-[9px] mt-0.5 font-semibold ${aprovado ? "text-emerald-700" : "text-red-700"}`}>
                        {aprovado ? "Aprovado" : "Não aprovado"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Section>

            {/* V · Documentos */}
            <Section number="V" title={`Documentos Entregues · ${docsEntregues}/${c.documentos.length}`}>
              <div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${ACCENT_BORDER_35}` }}>
                <table className="w-full text-[9.5px]">
                  <thead style={{ background: ACCENT_BG_06 }}>
                    <tr style={{ borderBottom: `1px solid ${ACCENT_BORDER_35}` }}>
                      <th className="text-left px-3 py-1.5 font-bold w-[5%] uppercase tracking-[0.16em] text-[7.5px]" style={{ color: ACCENT }}>#</th>
                      <th className="text-left px-3 py-1.5 font-bold uppercase tracking-[0.16em] text-[7.5px]" style={{ color: ACCENT }}>Documento</th>
                      <th className="text-left px-3 py-1.5 font-bold w-[35%] uppercase tracking-[0.16em] text-[7.5px]" style={{ color: ACCENT }}>Ficheiro</th>
                      <th className="text-left px-3 py-1.5 font-bold w-[15%] uppercase tracking-[0.16em] text-[7.5px]" style={{ color: ACCENT }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/10">
                    {c.documentos.map((d, i) => (
                      <tr key={d.key}>
                        <td className="px-3 py-1 text-foreground/60 tabular-nums">{String(i + 1).padStart(2, "0")}</td>
                        <td className="px-3 py-1 font-medium">{d.label}</td>
                        <td className="px-3 py-1 text-foreground/70 font-mono truncate">{d.ficheiro || "—"}</td>
                        <td className="px-3 py-1">
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-foreground/80">
                            <span className={`w-1.5 h-1.5 rounded-full ${d.entregue ? "bg-emerald-500" : "bg-amber-500"}`} />
                            {d.entregue ? "Entregue" : "Em falta"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>

          {/* Footer */}
          <div className="px-12 pb-8 pt-3 border-t border-foreground/30 mt-auto">
            <div className="flex items-end justify-between gap-6">
              <p className="text-[8px] text-foreground/60 leading-snug max-w-sm">
                Documento gerado automaticamente pelo Portal de Inscrições com base nos registos oficiais da plataforma.
                Contacto: <span className="font-semibold text-foreground">inscricoes@upra.kor</span>.
              </p>
              <div className="text-right shrink-0">
                <div className="border-t border-foreground/60 pt-1 min-w-[170px]">
                  <p className="text-[8px] uppercase tracking-wider text-foreground/60 font-semibold">Secretaria Académica</p>
                  <p className="text-[10px] font-semibold">Dr. Manuel Bento</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-2 mb-2 pb-1" style={{ borderBottom: `1px solid ${ACCENT_BORDER_35}` }}>
        <span className="text-[8.5px] font-mono font-bold tabular-nums" style={{ color: ACCENT }}>{number}.</span>
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function GroupCell({ rows, bordered }: { rows: [string, string][]; bordered?: boolean }) {
  return (
    <dl className="px-3 py-2 space-y-1" style={bordered ? { borderRight: `1px solid ${ACCENT_BORDER_25}` } : undefined}>
      {rows.map(([k, v], i) => (
        <div key={i} className="flex items-baseline gap-2 text-[10px]">
          <dt className="text-foreground/55 w-[100px] shrink-0 font-medium">{k}</dt>
          <dd className="font-semibold truncate flex-1 text-foreground">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[7.5px] uppercase tracking-[0.18em] text-foreground/60 font-bold">{label}</p>
      <p className="text-[10px] font-semibold mt-1 truncate">{value}</p>
    </div>
  );
}

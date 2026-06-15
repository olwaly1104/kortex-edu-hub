import { FinHeader } from "@/pages/financas/_FinHeader";
import { School, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cursoTemplates } from "@/data/academica2Data";
import { useMemo } from "react";

const facDecanos: Record<string, string> = {
  "Faculdade de Ciências Exatas": "Dr. Manuel Rebelo",
  "Faculdade de Ciências da Saúde": "Dra. Helena Vaz",
  "Faculdade de Ciências Sociais": "Dr. Eduardo Pinto",
  "Faculdade de Letras": "Dra. Helena Vaz",
  "Faculdade de Ciências Agrárias": "Dr. Vasco Lima",
};

export default function AdminFaculdadesCursos() {
  const faculdades = useMemo(() => {
    const map = new Map<string, typeof cursoTemplates>();
    cursoTemplates.forEach((c) => {
      if (!map.has(c.faculty)) map.set(c.faculty, [] as any);
      (map.get(c.faculty) as any).push(c);
    });
    return Array.from(map.entries());
  }, []);

  const totalCursos = cursoTemplates.length;
  const totalEstud = cursoTemplates.reduce((s, c) => s + c.estudantesEsperados, 0);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader
        title="Faculdades & Cursos"
        subtitle="Estrutura académica da instituição"
        icon={<School className="w-5 h-5 text-primary" />}
        right={<Button size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" /> Nova Faculdade</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Faculdades</p><p className="text-2xl font-bold tabular-nums">{faculdades.length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Cursos</p><p className="text-2xl font-bold tabular-nums">{totalCursos}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Estudantes est.</p><p className="text-2xl font-bold tabular-nums">{totalEstud}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Decanos</p><p className="text-2xl font-bold tabular-nums">{faculdades.length}</p></div>
      </div>

      <div className="space-y-5">
        {faculdades.map(([fac, cursos]) => (
          <div key={fac} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-muted/30">
              <div>
                <h3 className="text-sm font-bold text-foreground">{fac}</h3>
                <p className="text-xs text-muted-foreground">Decano: {facDecanos[fac] || "—"} · {cursos.length} cursos</p>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left font-semibold px-4 py-2.5">Código</th>
                  <th className="text-left font-semibold px-4 py-2.5">Curso</th>
                  <th className="text-left font-semibold px-4 py-2.5">Coordenador</th>
                  <th className="text-right font-semibold px-4 py-2.5">Anos</th>
                  <th className="text-right font-semibold px-4 py-2.5">Cadeiras/ano</th>
                  <th className="text-right font-semibold px-4 py-2.5">Estud. est.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cursos.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold">{c.code}</td>
                    <td className="px-4 py-2.5 font-medium">{c.name}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{c.coordenador}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{c.years}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{c.cadeirasPorAno}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{c.estudantesEsperados}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

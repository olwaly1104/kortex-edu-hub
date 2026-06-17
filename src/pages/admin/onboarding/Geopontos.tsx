import { useState } from "react";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Trash2, Navigation } from "lucide-react";
import { toast } from "sonner";

type Geoponto = {
  id: string;
  nome: string;
  latitude: string;
  longitude: string;
  raio: number; // metros
  descricao?: string;
};

export default function OnboardingGeopontos() {
  const [pontos, setPontos] = useState<Geoponto[]>([]);

  const add = () => {
    setPontos(prev => [
      ...prev,
      { id: `g${Date.now()}`, nome: "", latitude: "", longitude: "", raio: 50, descricao: "" },
    ]);
  };
  const update = (id: string, patch: Partial<Geoponto>) =>
    setPontos(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  const remove = (id: string) => setPontos(prev => prev.filter(p => p.id !== id));

  const useCurrent = (id: string) => {
    if (!navigator.geolocation) { toast.error("Geolocalização não suportada"); return; }
    navigator.geolocation.getCurrentPosition(
      pos => update(id, { latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }),
      () => toast.error("Não foi possível obter a localização atual"),
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <OnboardingStepBanner stepKey="geo.reg" />

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Geopontos da instituição</h2>
            <span className="text-[11px] text-muted-foreground tabular-nums">· {pontos.length}</span>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={add}>
            <Plus className="w-3.5 h-3.5" /> Adicionar geoponto
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Defina os pontos geográficos da instituição (campus, edifícios, polos) usados para marcação de presenças por geolocalização. Cada geoponto tem um raio de tolerância em metros.
        </p>

        {pontos.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
            Nenhum geoponto registado. Clique em "Adicionar geoponto" para começar.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
                  <th className="text-left font-semibold px-3 py-2">Nome</th>
                  <th className="text-left font-semibold px-3 py-2">Latitude</th>
                  <th className="text-left font-semibold px-3 py-2">Longitude</th>
                  <th className="text-left font-semibold px-3 py-2">Raio (m)</th>
                  <th className="text-left font-semibold px-3 py-2">Descrição</th>
                  <th className="w-24"></th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {pontos.map(p => (
                  <tr key={p.id} className="border-b border-border/50 last:border-0">
                    <td className="px-3 py-2"><Input value={p.nome} onChange={e => update(p.id, { nome: e.target.value })} placeholder="Ex: Campus Principal" className="h-8 text-xs" /></td>
                    <td className="px-3 py-2"><Input value={p.latitude} onChange={e => update(p.id, { latitude: e.target.value })} placeholder="-8.838" className="h-8 text-xs w-32" /></td>
                    <td className="px-3 py-2"><Input value={p.longitude} onChange={e => update(p.id, { longitude: e.target.value })} placeholder="13.234" className="h-8 text-xs w-32" /></td>
                    <td className="px-3 py-2"><Input type="number" value={p.raio} onChange={e => update(p.id, { raio: Number(e.target.value) || 0 })} className="h-8 text-xs w-20" /></td>
                    <td className="px-3 py-2"><Input value={p.descricao || ""} onChange={e => update(p.id, { descricao: e.target.value })} placeholder="(opcional)" className="h-8 text-xs" /></td>
                    <td className="px-2 py-2">
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => useCurrent(p.id)} title="Usar localização atual">
                        <Navigation className="w-3 h-3" /> Atual
                      </Button>
                    </td>
                    <td className="px-2 py-2 text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => remove(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

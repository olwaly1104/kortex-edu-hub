import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Settings2, Plus, Layers, AlertCircle, FileText, Trash2, Pencil, AlertTriangle } from "lucide-react";
import {
  tipoConfig as initialTipoConfig,
  categoriaConfig as initialCategoriaConfig,
  estadoSolicitacaoConfig as initialEstadoConfig,
  destinoConfig,
  type Categoria,
} from "@/data/gapData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type EstadoItem = { key: string; label: string; color: string };
type CategoriaItem = { key: string; label: string; color: string };
type MotivoItem = { key: string; label: string; categoria: string; destino: string; responsavel: string; slaAceitacao: number; slaConclusao: number };
type MultaItem = { key: string; label: string; valor: number; descricao: string };

const INITIAL_MULTAS: MultaItem[] = [
  { key: "atraso_relatorio", label: "Atraso na entrega de relatório", valor: 15000, descricao: "Aplicada quando o relatório obrigatório é entregue após o prazo." },
  { key: "falta_injustificada", label: "Falta injustificada a sessão", valor: 10000, descricao: "Ausência sem justificação em sessão obrigatória." },
  { key: "atraso_aula", label: "Atraso superior a 15min na aula", valor: 5000, descricao: "Atrasos repetidos no início das aulas." },
  { key: "incumprimento_sla", label: "Incumprimento de SLA de solicitação", valor: 8000, descricao: "Solicitação não tratada dentro do prazo definido." },
  { key: "uso_indevido", label: "Uso indevido de recursos institucionais", valor: 25000, descricao: "Utilização de equipamento ou espaço fora do âmbito autorizado." },
];

const STAFF_OPTIONS = [
  "Dra. Helena Cabral · GAP",
  "Dr. João Tavares · GAP",
  "Eng. Paulo Mendes · CTI",
  "Eng.ª Sara Lima · CTI",
  "Dra. Cita · Secretaria Académica",
  "Dra. Ana Belmiro · Académica",
  "Dra. Lúcia Mateus · Tesouraria",
  "Sr. Adriano Paka · Cobranças",
  "Dra. Catarina Lopes · Financeiro",
  "Coord. Faculdade de Ciências Exatas",
  "Coord. Faculdade de Medicina",
];

const defaultResponsavelByDestino = (destino: string) => {
  switch (destino) {
    case "CTI": return "Eng. Paulo Mendes · CTI";
    case "Académica": return "Dra. Cita · Secretaria Académica";
    case "Financeiro": return "Dra. Lúcia Mateus · Tesouraria";
    case "Faculdade": return "Coord. Faculdade de Ciências Exatas";
    default: return "Dra. Helena Cabral · GAP";
  }
};

export default function GapConfiguracao() {
  const { toast } = useToast();

  const [estados, setEstados] = useState<EstadoItem[]>(
    Object.entries(initialEstadoConfig).map(([key, v]) => ({ key, label: v.label, color: v.color }))
  );
  const [categorias, setCategorias] = useState<CategoriaItem[]>(
    Object.entries(initialCategoriaConfig).map(([key, v]) => ({ key, label: v.label, color: v.color }))
  );
  const [multas, setMultas] = useState<MultaItem[]>(INITIAL_MULTAS);
  const [motivos, setMotivos] = useState<MotivoItem[]>(
    Object.entries(initialTipoConfig).map(([key, v]) => ({
      key, label: v.label, categoria: v.categoria, destino: v.destino,
      responsavel: (v as any).responsavelDestino || defaultResponsavelByDestino(v.destino),
      slaAceitacao: Math.max(1, Math.ceil(v.slaDias / 3)),
      slaConclusao: v.slaDias,
    }))
  );

  // Dialog states
  const [estadoOpen, setEstadoOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [motivoOpen, setMotivoOpen] = useState(false);
  const [multaOpen, setMultaOpen] = useState(false);

  // New estado form
  const [newEstadoLabel, setNewEstadoLabel] = useState("");
  // New categoria form
  const [newCatLabel, setNewCatLabel] = useState("");
  // New motivo form
  const [newMotLabel, setNewMotLabel] = useState("");
  const [newMotCat, setNewMotCat] = useState<string>("");
  const [newMotDest, setNewMotDest] = useState<string>("CTI");
  const [newMotSlaAceit, setNewMotSlaAceit] = useState<number>(2);
  const [newMotSlaConcl, setNewMotSlaConcl] = useState<number>(5);
  const [newMotResp, setNewMotResp] = useState<string>(STAFF_OPTIONS[0]);
  // New multa form
  const [newMultaLabel, setNewMultaLabel] = useState("");
  const [newMultaValor, setNewMultaValor] = useState<number>(5000);
  const [newMultaDesc, setNewMultaDesc] = useState("");

  const slugify = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

  const handleAddEstado = () => {
    if (!newEstadoLabel.trim()) return;
    const key = slugify(newEstadoLabel);
    setEstados(prev => [...prev, {
      key, label: newEstadoLabel.trim(),
      color: "bg-slate-100 text-slate-700 border-slate-200",
    }]);
    setNewEstadoLabel("");
    setEstadoOpen(false);
    toast({ title: "Estado criado", description: `“${newEstadoLabel}” foi adicionado.` });
  };

  const handleAddCategoria = () => {
    if (!newCatLabel.trim()) return;
    const key = slugify(newCatLabel);
    setCategorias(prev => [...prev, {
      key, label: newCatLabel.trim(),
      color: "bg-slate-50 text-slate-700 border-slate-200",
    }]);
    setNewCatLabel("");
    setCatOpen(false);
    toast({ title: "Categoria criada", description: `“${newCatLabel}” foi adicionada.` });
  };

  const handleAddMotivo = () => {
    if (!newMotLabel.trim() || !newMotCat) return;
    const key = slugify(newMotLabel);
    setMotivos(prev => [...prev, {
      key, label: newMotLabel.trim(),
      categoria: newMotCat, destino: newMotDest,
      responsavel: newMotResp,
      slaAceitacao: newMotSlaAceit, slaConclusao: newMotSlaConcl,
    }]);
    setNewMotLabel(""); setNewMotCat(""); setNewMotDest("CTI");
    setNewMotSlaAceit(2); setNewMotSlaConcl(5);
    setNewMotResp(STAFF_OPTIONS[0]);
    setMotivoOpen(false);
    toast({ title: "Motivo criado", description: `“${newMotLabel}” foi adicionado.` });
  };

  const removeEstado = (key: string) => setEstados(prev => prev.filter(e => e.key !== key));
  const removeCategoria = (key: string) => setCategorias(prev => prev.filter(c => c.key !== key));
  const removeMotivo = (key: string) => setMotivos(prev => prev.filter(m => m.key !== key));
  const removeMulta = (key: string) => setMultas(prev => prev.filter(m => m.key !== key));

  const handleAddMulta = () => {
    if (!newMultaLabel.trim()) return;
    const key = slugify(newMultaLabel);
    setMultas(prev => [...prev, { key, label: newMultaLabel.trim(), valor: newMultaValor, descricao: newMultaDesc.trim() }]);
    setNewMultaLabel(""); setNewMultaValor(5000); setNewMultaDesc("");
    setMultaOpen(false);
    toast({ title: "Multa criada", description: `“${newMultaLabel}” foi adicionada.` });
  };

  // Edit dialogs
  const [editEstado, setEditEstado] = useState<EstadoItem | null>(null);
  const [editCategoria, setEditCategoria] = useState<CategoriaItem | null>(null);
  const [editMotivo, setEditMotivo] = useState<MotivoItem | null>(null);
  const [editMulta, setEditMulta] = useState<MultaItem | null>(null);

  const saveEditEstado = () => {
    if (!editEstado || !editEstado.label.trim()) return;
    setEstados(prev => prev.map(e => e.key === editEstado.key ? editEstado : e));
    toast({ title: "Estado atualizado" });
    setEditEstado(null);
  };
  const saveEditCategoria = () => {
    if (!editCategoria || !editCategoria.label.trim()) return;
    setCategorias(prev => prev.map(c => c.key === editCategoria.key ? editCategoria : c));
    toast({ title: "Categoria atualizada" });
    setEditCategoria(null);
  };
  const saveEditMotivo = () => {
    if (!editMotivo || !editMotivo.label.trim()) return;
    setMotivos(prev => prev.map(m => m.key === editMotivo.key ? editMotivo : m));
    toast({ title: "Motivo atualizado" });
    setEditMotivo(null);
  };
  const saveEditMulta = () => {
    if (!editMulta || !editMulta.label.trim()) return;
    setMultas(prev => prev.map(m => m.key === editMulta.key ? editMulta : m));
    toast({ title: "Multa atualizada" });
    setEditMulta(null);
  };

  const formatKz = (n: number) =>
    new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + " Kz";
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-primary" /> Configuração
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Gere os estados, categorias e motivos disponíveis para as solicitações do GAP.
        </p>
      </div>

      {/* Estados */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Estados</h2>
            <span className="text-[11px] text-muted-foreground tabular-nums">· {estados.length}</span>
          </div>
          <Dialog open={estadoOpen} onOpenChange={setEstadoOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                <Plus className="w-3.5 h-3.5" /> Novo estado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Novo estado</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                  <Input value={newEstadoLabel} onChange={e => setNewEstadoLabel(e.target.value)} placeholder="Ex: Em revisão" />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={handleAddEstado} disabled={!newEstadoLabel.trim()}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-wrap gap-2">
          {estados.map(e => (
            <div key={e.key} className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs", e.color)}>
              <span className="font-medium">{e.label}</span>
              <button onClick={() => setEditEstado(e)} className="opacity-60 hover:opacity-100" aria-label={`Editar ${e.label}`}>
                <Pencil className="w-3 h-3" />
              </button>
              <button onClick={() => removeEstado(e.key)} className="opacity-60 hover:opacity-100" aria-label={`Remover ${e.label}`}>
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Categorias */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Categorias</h2>
            <span className="text-[11px] text-muted-foreground tabular-nums">· {categorias.length}</span>
          </div>
          <Dialog open={catOpen} onOpenChange={setCatOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                <Plus className="w-3.5 h-3.5" /> Nova categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Nova categoria</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                  <Input value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)} placeholder="Ex: Social" />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={handleAddCategoria} disabled={!newCatLabel.trim()}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-wrap gap-2">
          {categorias.map(c => {
            const count = motivos.filter(m => m.categoria === c.label).length;
            return (
              <div key={c.key} className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs", c.color)}>
                <span className="font-medium">{c.label}</span>
                <span className="opacity-60 tabular-nums">· {count} motivos</span>
                <button onClick={() => setEditCategoria(c)} className="opacity-60 hover:opacity-100" aria-label={`Editar ${c.label}`}>
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={() => removeCategoria(c.key)} className="opacity-60 hover:opacity-100" aria-label={`Remover ${c.label}`}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Motivos */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Motivos</h2>
            <span className="text-[11px] text-muted-foreground tabular-nums">· {motivos.length}</span>
          </div>
          <Dialog open={motivoOpen} onOpenChange={setMotivoOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                <Plus className="w-3.5 h-3.5" /> Novo motivo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Novo motivo</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                  <Input value={newMotLabel} onChange={e => setNewMotLabel(e.target.value)} placeholder="Ex: Pedido de declaração" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Categoria</label>
                    <Select value={newMotCat} onValueChange={setNewMotCat}>
                      <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                      <SelectContent>
                        {categorias.map(c => <SelectItem key={c.key} value={c.label}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Destino</label>
                    <Select value={newMotDest} onValueChange={setNewMotDest}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(destinoConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Limite p/ aceitar (dias)</label>
                    <Input type="number" min={1} value={newMotSlaAceit} onChange={e => setNewMotSlaAceit(Number(e.target.value) || 1)} />
                    <p className="text-[10px] text-muted-foreground mt-1">Pendente → Em Execução</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Limite p/ concluir (dias)</label>
                    <Input type="number" min={1} value={newMotSlaConcl} onChange={e => setNewMotSlaConcl(Number(e.target.value) || 1)} />
                    <p className="text-[10px] text-muted-foreground mt-1">Em Execução → Concluída</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Responsável</label>
                  <Select value={newMotResp} onValueChange={setNewMotResp}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STAFF_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={handleAddMotivo} disabled={!newMotLabel.trim() || !newMotCat}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Motivo</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Categoria</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Destino</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Responsável</th>
                <th className="text-center p-3 font-medium text-muted-foreground text-xs whitespace-nowrap">Aceitar</th>
                <th className="text-center p-3 font-medium text-muted-foreground text-xs whitespace-nowrap">Concluir</th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody>
              {motivos.map(m => {
                const catCfg = categorias.find(c => c.label === m.categoria);
                const destCfg = destinoConfig[m.destino as keyof typeof destinoConfig];
                return (
                  <tr key={m.key} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="p-3 text-xs font-medium text-foreground">{m.label}</td>
                    <td className="p-3">
                      {catCfg ? (
                        <Badge variant="outline" className={cn("text-[10px]", catCfg.color)}>{catCfg.label}</Badge>
                      ) : <span className="text-xs text-muted-foreground">{m.categoria}</span>}
                    </td>
                    <td className="p-3">
                      {destCfg ? (
                        <Badge variant="outline" className={cn("text-[10px]", destCfg.color)}>{destCfg.label}</Badge>
                      ) : <span className="text-xs text-muted-foreground">{m.destino}</span>}
                    </td>
                    <td className="p-3 text-xs text-foreground whitespace-nowrap">{m.responsavel}</td>
                    <td className="p-3 text-center text-xs tabular-nums text-amber-700">{m.slaAceitacao}d</td>
                    <td className="p-3 text-center text-xs tabular-nums text-blue-700">{m.slaConclusao}d</td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => setEditMotivo(m)} className="text-muted-foreground hover:text-foreground" aria-label={`Editar ${m.label}`}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => removeMotivo(m.key)} className="text-muted-foreground hover:text-destructive" aria-label={`Remover ${m.label}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Estado Dialog */}
      <Dialog open={!!editEstado} onOpenChange={(o) => !o && setEditEstado(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Editar estado</DialogTitle></DialogHeader>
          {editEstado && (
            <div className="space-y-3 py-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                <Input value={editEstado.label} onChange={e => setEditEstado({ ...editEstado, label: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditEstado(null)}>Cancelar</Button>
            <Button onClick={saveEditEstado} disabled={!editEstado?.label.trim()}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Categoria Dialog */}
      <Dialog open={!!editCategoria} onOpenChange={(o) => !o && setEditCategoria(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Editar categoria</DialogTitle></DialogHeader>
          {editCategoria && (
            <div className="space-y-3 py-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                <Input value={editCategoria.label} onChange={e => setEditCategoria({ ...editCategoria, label: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditCategoria(null)}>Cancelar</Button>
            <Button onClick={saveEditCategoria} disabled={!editCategoria?.label.trim()}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Motivo Dialog */}
      <Dialog open={!!editMotivo} onOpenChange={(o) => !o && setEditMotivo(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar motivo</DialogTitle></DialogHeader>
          {editMotivo && (
            <div className="space-y-3 py-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                <Input value={editMotivo.label} onChange={e => setEditMotivo({ ...editMotivo, label: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Categoria</label>
                  <Select value={editMotivo.categoria} onValueChange={(v) => setEditMotivo({ ...editMotivo, categoria: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                    <SelectContent>
                      {categorias.map(c => <SelectItem key={c.key} value={c.label}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Destino</label>
                  <Select value={editMotivo.destino} onValueChange={(v) => setEditMotivo({ ...editMotivo, destino: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(destinoConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Limite p/ aceitar (dias)</label>
                  <Input type="number" min={1} value={editMotivo.slaAceitacao} onChange={e => setEditMotivo({ ...editMotivo, slaAceitacao: Number(e.target.value) || 1 })} />
                  <p className="text-[10px] text-muted-foreground mt-1">Pendente → Em Execução</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Limite p/ concluir (dias)</label>
                  <Input type="number" min={1} value={editMotivo.slaConclusao} onChange={e => setEditMotivo({ ...editMotivo, slaConclusao: Number(e.target.value) || 1 })} />
                  <p className="text-[10px] text-muted-foreground mt-1">Em Execução → Concluída</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Responsável</label>
                <Select value={editMotivo.responsavel} onValueChange={(v) => setEditMotivo({ ...editMotivo, responsavel: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STAFF_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    {editMotivo.responsavel && !STAFF_OPTIONS.includes(editMotivo.responsavel) && (
                      <SelectItem value={editMotivo.responsavel}>{editMotivo.responsavel}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditMotivo(null)}>Cancelar</Button>
            <Button onClick={saveEditMotivo} disabled={!editMotivo?.label.trim() || !editMotivo?.categoria}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

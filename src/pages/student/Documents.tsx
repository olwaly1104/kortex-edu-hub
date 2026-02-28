import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Table2, Presentation, Plus, Clock, Share2, Filter } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const docTypes = [
  { id: "document", label: "Documento", desc: "Editor de texto (estilo Word)", icon: FileText, color: "text-primary bg-primary/10" },
  { id: "spreadsheet", label: "Folha de Cálculo", desc: "Tabelas e cálculos (estilo Excel)", icon: Table2, color: "text-accent bg-accent/10" },
  { id: "presentation", label: "Apresentação", desc: "Slides (estilo PowerPoint)", icon: Presentation, color: "text-secondary bg-secondary/10" },
];

const recentDocs = [
  { id: "r1", name: "Relatório de Laboratório - Física", type: "document", date: "10/02/2024", icon: FileText, color: "text-primary bg-primary/10", shared: false },
  { id: "r2", name: "Análise de Dados - Estatística", type: "spreadsheet", date: "08/02/2024", icon: Table2, color: "text-accent bg-accent/10", shared: false },
  { id: "r3", name: "Apresentação Projecto Final", type: "presentation", date: "05/02/2024", icon: Presentation, color: "text-secondary bg-secondary/10", shared: true, sharedBy: "Maria Silva" },
  { id: "r4", name: "Notas de Aula - Matemática II", type: "document", date: "03/02/2024", icon: FileText, color: "text-primary bg-primary/10", shared: false },
  { id: "r5", name: "Orçamento do Projecto", type: "spreadsheet", date: "01/02/2024", icon: Table2, color: "text-accent bg-accent/10", shared: true, sharedBy: "Pedro Nascimento" },
  { id: "r6", name: "Slides Seminário Eng.", type: "presentation", date: "28/01/2024", icon: Presentation, color: "text-secondary bg-secondary/10", shared: true, sharedBy: "Prof. António Silva" },
];

export default function StudentDocuments() {
  const [selected, setSelected] = useState<string | null>(null);
  const [showShared, setShowShared] = useState(false);

  if (selected) {
    const doc = docTypes.find(d => d.id === selected)!;
    return (
      <div className="h-screen flex flex-col animate-fade-in">
        <div className="flex items-center gap-3 px-6 py-4 border-b bg-card">
          <button onClick={() => setSelected(null)} className="text-sm text-primary hover:underline">← Voltar</button>
          <div className="flex items-center gap-2">
            <doc.icon className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Novo {doc.label}</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <div className="text-center">
            <doc.icon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Editor de {doc.label} — em desenvolvimento</p>
            <p className="text-sm text-muted-foreground mt-1">Esta funcionalidade será disponibilizada em breve.</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredDocs = showShared ? recentDocs.filter(d => d.shared) : recentDocs;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Criar Documentos</h1>
      <p className="text-muted-foreground">Escolha o tipo de documento que pretende criar.</p>

      <div className="grid sm:grid-cols-3 gap-5">
        {docTypes.map(doc => (
          <Card
            key={doc.id}
            className="p-6 flex flex-col items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow group"
            onClick={() => setSelected(doc.id)}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${doc.color} group-hover:scale-110 transition-transform`}>
              <doc.icon className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-foreground">{doc.label}</h3>
            <p className="text-sm text-muted-foreground text-center">{doc.desc}</p>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mt-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Plus className="w-5 h-5" />
            </div>
          </Card>
        ))}
      </div>

      {/* Recent documents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" /> Documentos Recentes
          </h2>
          <button
            onClick={() => setShowShared(!showShared)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
              showShared ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            Filtrar por ficheiros partilhados
          </button>
        </div>
        <div className="space-y-2">
          {filteredDocs.map(doc => (
            <Card key={doc.id} className="p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.color}`}>
                <doc.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Editado em {doc.date}</span>
                  {doc.shared && (
                    <span className="flex items-center gap-1 text-primary">
                      <Share2 className="w-3 h-3" /> Partilhado por {(doc as any).sharedBy}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {filteredDocs.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">Nenhum ficheiro partilhado encontrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}
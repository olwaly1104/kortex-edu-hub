import { FileText } from "lucide-react";

interface Props { solicitacao?: any; anexos?: any[] }

export default function GapSolicitacaoDocPreview(_props: Props) {
  return (
    <div className="p-10 flex flex-col items-center justify-center h-full text-center bg-muted/20">
      <div className="w-14 h-14 rounded-xl bg-background border border-border flex items-center justify-center mb-4 shadow-sm">
        <FileText className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground">Documento gerado automaticamente</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
        Ainda não existem dados de origem para preencher este documento. O ficheiro será composto assim que a solicitação receber a primeira informação.
      </p>
    </div>
  );
}

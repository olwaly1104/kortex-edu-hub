interface Props { solicitacao?: any; anexos?: any[] }
export default function GapSolicitacaoDocPreview(_props: Props) {
  return (
    <div className="p-10 flex flex-col items-center justify-center h-full text-center text-muted-foreground">
      <p className="text-sm">Documento indisponível</p>
    </div>
  );
}

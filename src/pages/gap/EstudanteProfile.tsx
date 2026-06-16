import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";
import { ArrowLeft } from "lucide-react";

export default function GapEstudanteProfile() {
  const { matricula } = useParams();
  const navigate = useNavigate();
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
      <EmptyState title="Discente não encontrado" description={`Sem perfil com a matrícula ${matricula ?? "—"}.`} />
    </div>
  );
}

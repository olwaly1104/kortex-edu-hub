import { FinHeader } from "@/pages/financas/_FinHeader";
import { Megaphone } from "lucide-react";

export default function AdminAnuncios() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <FinHeader title="Anúncios" subtitle="Comunicações institucionais" icon={<Megaphone className="w-5 h-5 text-primary" />} />
      <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
        Sem anúncios novos.
      </div>
    </div>
  );
}

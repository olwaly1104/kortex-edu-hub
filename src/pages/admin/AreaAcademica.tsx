import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, BookOpen, CalendarDays, Users } from "lucide-react";
import AdminFaculdadesCursos from "./FaculdadesCursos";
import GerarCadeiras from "../academica2/GerarCadeiras";
import CalendarioAcademico from "../academica2/CalendarioAcademico";
import CriarTurmas from "../academica2/CriarTurmas";

type TabKey = "faculdades" | "cadeiras" | "calendario" | "turmas";

const STEP_FOR: Record<TabKey, string> = {
  faculdades: "aca.fac",
  cadeiras: "aca.cad",
  calendario: "aca.cal",
  turmas: "aca.tur",
};

export default function AreaAcademica() {
  const [params, setParams] = useSearchParams();
  const raw = (params.get("tab") || "faculdades") as string;
  const tab: TabKey = (raw === "cursos" ? "faculdades" : (raw as TabKey)) || "faculdades";

  const onChange = (v: string) => {
    const next = new URLSearchParams(params);
    next.set("tab", v);
    next.set("step", STEP_FOR[v as TabKey]);
    setParams(next, { replace: true });
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <Tabs value={tab} onValueChange={onChange} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="faculdades" className="gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Faculdades & Cursos
          </TabsTrigger>
          <TabsTrigger value="cadeiras" className="gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Cadeiras
          </TabsTrigger>
          <TabsTrigger value="calendario" className="gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" /> Ano lectivo & Calendário
          </TabsTrigger>
          <TabsTrigger value="turmas" className="gap-1.5">
            <Users className="w-3.5 h-3.5" /> Turmas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faculdades" className="mt-0">
          <AdminFaculdadesCursos />
        </TabsContent>
        <TabsContent value="cadeiras" className="mt-0">
          <GerarCadeiras />
        </TabsContent>
        <TabsContent value="calendario" className="mt-0">
          <CalendarioAcademico />
        </TabsContent>
        <TabsContent value="turmas" className="mt-0">
          <CriarTurmas />
        </TabsContent>
      </Tabs>
    </div>
  );
}

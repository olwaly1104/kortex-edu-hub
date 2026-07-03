import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, BookOpen, CalendarDays, Users, Award, FileSignature } from "lucide-react";
import { OnboardingStepBanner, SuppressOnboardingBanner } from "@/components/admin/OnboardingStepBanner";
import AdminFaculdadesCursos from "./FaculdadesCursos";
import GerarCadeiras from "../academica2/GerarCadeiras";
import CalendarioAcademico from "../academica2/CalendarioAcademico";
import CriarTurmas from "../academica2/CriarTurmas";
import CriterioAcademico from "./CriterioAcademico";
import CandidaturasPage from "../academica2/CandidaturasPage";

type TabKey = "faculdades" | "cadeiras" | "calendario" | "turmas" | "criterio" | "candidaturas";

const STEP_FOR: Record<TabKey, string> = {
  faculdades: "aca.fac",
  cadeiras: "aca.cad",
  calendario: "aca.cal",
  turmas: "aca.tur",
  criterio: "aca.cri",
  candidaturas: "aca.cand",
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
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-4">
      <OnboardingStepBanner />
      <Tabs value={tab} onValueChange={onChange} className="space-y-4">
        <TabsList className="inline-flex h-auto flex-wrap w-full lg:w-auto gap-1 p-1">
          <TabsTrigger value="faculdades" className="gap-1.5 whitespace-nowrap">
            <Building2 className="w-3.5 h-3.5" /> Faculdades & Cursos
          </TabsTrigger>
          <TabsTrigger value="cadeiras" className="gap-1.5 whitespace-nowrap">
            <BookOpen className="w-3.5 h-3.5" /> Cadeiras
          </TabsTrigger>
          <TabsTrigger value="calendario" className="gap-1.5 whitespace-nowrap">
            <CalendarDays className="w-3.5 h-3.5" /> Ano lectivo & Calendário
          </TabsTrigger>
          <TabsTrigger value="candidaturas" className="gap-1.5 whitespace-nowrap">
            <FileSignature className="w-3.5 h-3.5" /> Candidaturas
          </TabsTrigger>
          <TabsTrigger value="turmas" className="gap-1.5 whitespace-nowrap">
            <Users className="w-3.5 h-3.5" /> Turmas
          </TabsTrigger>
          <TabsTrigger value="criterio" className="gap-1.5 whitespace-nowrap">
            <Award className="w-3.5 h-3.5" /> Critério Académico
          </TabsTrigger>
        </TabsList>

        <SuppressOnboardingBanner>
          <TabsContent value="faculdades" className="mt-0">
            <AdminFaculdadesCursos />
          </TabsContent>
          <TabsContent value="cadeiras" className="mt-0">
            <GerarCadeiras />
          </TabsContent>
          <TabsContent value="calendario" className="mt-0">
            <CalendarioAcademico />
          </TabsContent>
          <TabsContent value="candidaturas" className="mt-0">
            <CandidaturasPage />
          </TabsContent>
          <TabsContent value="turmas" className="mt-0">
            <CriarTurmas />
          </TabsContent>
          <TabsContent value="criterio" className="mt-0">
            <CriterioAcademico />
          </TabsContent>
        </SuppressOnboardingBanner>
      </Tabs>

    </div>
  );
}

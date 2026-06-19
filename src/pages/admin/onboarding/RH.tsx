import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GraduationCap, Briefcase, ClipboardCheck } from "lucide-react";
import OnboardingPessoas from "./Pessoas";

export default function OnboardingRH() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as "docentes" | "staff" | "conformidade") || "docentes";

  const onChange = (v: string) => {
    const next = new URLSearchParams(params);
    next.set("tab", v);
    next.set("step", v === "docentes" ? "rh.doc" : v === "staff" ? "rh.staff" : "rh.conf");
    setParams(next, { replace: true });
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <Tabs value={tab} onValueChange={onChange} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="docentes" className="gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" /> Docentes
          </TabsTrigger>
          <TabsTrigger value="staff" className="gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Staff
          </TabsTrigger>
          <TabsTrigger value="conformidade" className="gap-1.5">
            <ClipboardCheck className="w-3.5 h-3.5" /> Conformidade
          </TabsTrigger>
        </TabsList>
        <TabsContent value="docentes" className="mt-0">
          <OnboardingPessoas mode="docentes" />
        </TabsContent>
        <TabsContent value="staff" className="mt-0">
          <OnboardingPessoas mode="staff" />
        </TabsContent>
        <TabsContent value="conformidade" className="mt-0">
          <div className="p-6 text-center text-muted-foreground text-sm">
            Módulo de conformidade em desenvolvimento.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

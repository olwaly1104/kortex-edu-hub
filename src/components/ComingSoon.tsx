import { Construction } from "lucide-react";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-8">{title}</h1>
      <div className="flex flex-col items-center justify-center py-20">
        <Construction className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">Esta funcionalidade será disponibilizada em breve.</p>
      </div>
    </div>
  );
}

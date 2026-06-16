import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Inbox } from "lucide-react";

interface Props {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title = "Sem registos",
  description = "Ainda não existem dados para apresentar.",
  action,
  className,
}: Props) {
  return (
    <Card className={`p-12 flex flex-col items-center justify-center text-center ${className ?? ""}`}>
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
        {icon ?? <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

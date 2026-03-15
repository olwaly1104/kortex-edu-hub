import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ExportColumn {
  header: string;
  accessor: (row: any) => string | number;
}

interface ExportButtonProps {
  data: any[];
  columns: ExportColumn[];
  filename: string;
  title?: string;
}

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob(["\uFEFF" + content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ExportButton({ data, columns, filename, title }: ExportButtonProps) {
  const exportCSV = () => {
    const header = columns.map(c => escapeCsv(c.header)).join(",");
    const rows = data.map(row =>
      columns.map(c => escapeCsv(c.accessor(row))).join(",")
    );
    downloadFile([header, ...rows].join("\n"), `${filename}.csv`, "text/csv");
    toast.success("Ficheiro CSV exportado com sucesso");
  };

  const exportPDF = () => {
    const pageTitle = title || filename;
    const headerRow = columns.map(c => `<th style="border:1px solid #ddd;padding:8px 12px;background:#f5f5f5;font-size:11px;text-align:left;white-space:nowrap;">${c.header}</th>`).join("");
    const bodyRows = data.map(row =>
      `<tr>${columns.map(c => `<td style="border:1px solid #ddd;padding:6px 12px;font-size:11px;">${c.accessor(row)}</td>`).join("")}</tr>`
    ).join("");

    const html = `
      <html><head><title>${pageTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 16px; margin-bottom: 4px; }
        p { font-size: 11px; color: #666; margin-bottom: 16px; }
        table { border-collapse: collapse; width: 100%; }
      </style></head>
      <body>
        <h1>${pageTitle}</h1>
        <p>Exportado em ${new Date().toLocaleDateString("pt-PT")} · ${data.length} registos</p>
        <table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>
      </body></html>
    `;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => { win.print(); }, 500);
      toast.success("Relatório PDF pronto para impressão");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportCSV} className="gap-2 text-xs">
          <FileSpreadsheet className="w-3.5 h-3.5" /> Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPDF} className="gap-2 text-xs">
          <FileText className="w-3.5 h-3.5" /> Exportar PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

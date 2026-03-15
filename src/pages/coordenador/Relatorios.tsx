import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronRight, Download, Search, X, Eye,
  Grid3X3, List, File, FileSpreadsheet, Star, Clock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────
interface DriveFile {
  id: string;
  name: string;
  type: "pdf" | "csv";
  frequency: "mensal" | "semestral" | "anual";
  size: string;
  modified: string;
  status: "gerado" | "pendente";
}
interface DriveNode {
  id: string;
  name: string;
  children?: DriveNode[];
  files?: DriveFile[];
}

// ─── Data ────────────────────────────────────────────────
const AY = "2025/2026";
const PAY = "2024/2025";
const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
let _c = 0;
const mkF = (name: string, type: "pdf"|"csv", freq: "mensal"|"semestral"|"anual", size: string): DriveFile => ({
  id: `f${_c++}`, name, type, frequency: freq, size,
  modified: freq === "mensal" ? "15 Mar 2025" : freq === "semestral" ? "01 Fev 2025" : "30 Jun 2025",
  status: Math.random() > 0.1 ? "gerado" : "pendente",
});

const dMo = ()=>[mkF("Relatório de Desempenho Geral","pdf","mensal","245 KB"),mkF("Estudantes em Risco","pdf","mensal","128 KB"),mkF("Assiduidade","pdf","mensal","156 KB"),mkF("Relatório Financeiro","pdf","mensal","198 KB")];
const dSe = ()=>[mkF("Relatório de Desempenho Geral","pdf","semestral","567 KB"),mkF("Notas e Aprovações","pdf","semestral","434 KB"),mkF("Estudantes em Risco","pdf","semestral","312 KB"),mkF("Assiduidade","pdf","semestral","289 KB"),mkF("Cadeiras Críticas","pdf","semestral","245 KB"),mkF("Relatório Financeiro","pdf","semestral","378 KB")];
const dAn = ()=>[mkF("Relatório de Desempenho Geral","pdf","anual","1.2 MB"),mkF("Notas e Aprovações","pdf","anual","890 KB"),mkF("Estudantes em Risco","pdf","anual","456 KB"),mkF("Assiduidade","pdf","anual","534 KB"),mkF("Progressão e Retenção","pdf","anual","678 KB"),mkF("Cadeiras Críticas","pdf","anual","345 KB"),mkF("Relatório Financeiro","pdf","anual","567 KB")];

const cMo = ()=>[mkF("Relatório da Cadeira","pdf","mensal","178 KB"),mkF("Assiduidade","csv","mensal","67 KB")];
const cSe = ()=>[mkF("Relatório da Cadeira","pdf","semestral","345 KB"),mkF("Notas e Resultados","pdf","semestral","289 KB"),mkF("Avaliações e Tarefas","csv","semestral","156 KB")];
const cAn = ()=>[mkF("Relatório da Cadeira","pdf","anual","678 KB"),mkF("Notas e Resultados","pdf","anual","534 KB"),mkF("Avaliações e Tarefas","csv","anual","345 KB"),mkF("Comparação com Anos Anteriores","pdf","anual","456 KB")];

const pMo = ()=>[mkF("Relatório do Docente","pdf","mensal","156 KB"),mkF("Assiduidade","csv","mensal","45 KB")];
const pSe = ()=>[mkF("Relatório do Docente","pdf","semestral","312 KB"),mkF("Desempenho das Turmas","pdf","semestral","267 KB"),mkF("Carga Horária","csv","semestral","89 KB")];
const pAn = ()=>[mkF("Relatório do Docente","pdf","anual","567 KB"),mkF("Desempenho das Turmas","pdf","anual","456 KB"),mkF("Carga Horária","csv","anual","123 KB"),mkF("Avaliação de Desempenho","pdf","anual","345 KB")];

const eMo = ()=>[mkF("Relatório do Estudante","pdf","mensal","134 KB"),mkF("Assiduidade","csv","mensal","23 KB")];
const eSe = ()=>[mkF("Relatório do Estudante","pdf","semestral","289 KB"),mkF("Notas","pdf","semestral","178 KB"),mkF("Assiduidade","csv","semestral","56 KB"),mkF("Situação Financeira","pdf","semestral","123 KB")];
const eAn = ()=>[mkF("Relatório do Estudante","pdf","anual","456 KB"),mkF("Notas","pdf","anual","345 KB"),mkF("Assiduidade","csv","anual","89 KB"),mkF("Situação Financeira","pdf","anual","178 KB"),mkF("Progressão Académica","pdf","anual","234 KB")];

const gMo = ()=>[mkF("Desempenho Geral do Curso","pdf","mensal","312 KB"),mkF("Estudantes em Risco","pdf","mensal","156 KB"),mkF("Relatório Financeiro","pdf","mensal","198 KB")];
const gSe = ()=>[mkF("Desempenho Geral do Curso","pdf","semestral","678 KB"),mkF("Notas e Aprovações","pdf","semestral","456 KB"),mkF("Relatório Financeiro","pdf","semestral","345 KB"),mkF("Relatório de Docentes","pdf","semestral","289 KB")];
const gAn = ()=>[mkF("Relatório Anual 360 do Curso","pdf","anual","2.1 MB"),mkF("Notas e Aprovações","pdf","anual","890 KB"),mkF("Progressão e Retenção","pdf","anual","567 KB"),mkF("Relatório Financeiro","pdf","anual","456 KB"),mkF("Relatório de Docentes","pdf","anual","345 KB")];

const mkPeriods = (m:()=>DriveFile[],s:()=>DriveFile[],a:()=>DriveFile[]): DriveNode[] => [
  {id:`mensal-${_c++}`,name:"Mensal",children:months.map(mo=>({id:`mo-${mo}-${_c++}`,name:`${mo} ${AY}`,files:m()}))},
  {id:`semestral-${_c++}`,name:"Semestral",children:[{id:`s1-${_c++}`,name:`Semestre 1 ${AY}`,files:s()},{id:`s2-${_c++}`,name:`Semestre 2 ${AY}`,files:s()}]},
  {id:`anual-${_c++}`,name:"Anual",children:[{id:`an-${_c++}`,name:AY,files:a()}]},
];

const mkAL = (ch: DriveNode[]): DriveNode[] => [
  {id:`al-${AY}-${_c++}`,name:`Ano Letivo ${AY}`,children:ch},
  {id:`al-${PAY}-${_c++}`,name:`Ano Letivo ${PAY}`,children:[]},
];

const cadeiras = ["Matemática","Física","Química","Programação","Estatística","Economia"];
const docentes = ["Prof. Silva","Prof. Santos","Prof. Mendes","Prof. Costa","Prof. Oliveira"];
const estudantes = ["Ana Silva","João Santos","Maria Costa","Pedro Mendes","Carla Oliveira","Bruno Ferreira"];

const driveTree: DriveNode[] = [
  {id:"desempenho",name:"Desempenho Académico",children:mkAL([
    ...["1º Ano","2º Ano","3º Ano"].map(a=>({id:`da-${a}-${_c++}`,name:a,children:mkPeriods(dMo,dSe,dAn)})),
    ...["Turma A","Turma B","Turma C"].map(t=>({id:`dt-${t}-${_c++}`,name:t,children:mkPeriods(dMo,dSe,dAn)})),
  ])},
  {id:"cadeiras",name:"Cadeiras do Curso",children:mkAL(cadeiras.map(c=>({id:`cd-${c}-${_c++}`,name:c,children:mkPeriods(cMo,cSe,cAn)})))},
  {id:"docentes",name:"Docentes do Curso",children:mkAL(docentes.map(d=>({id:`dc-${d}-${_c++}`,name:d,children:mkPeriods(pMo,pSe,pAn)})))},
  {id:"estudantes",name:"Estudantes do Curso",children:mkAL(estudantes.map(e=>({id:`es-${e}-${_c++}`,name:e,children:mkPeriods(eMo,eSe,eAn)})))},
  {id:"geral",name:"Geral",children:mkAL(mkPeriods(gMo,gSe,gAn))},
];

function collectAll(n: DriveNode): DriveFile[] {
  return [...(n.files||[]),...(n.children||[]).flatMap(collectAll)];
}
const allFiles = driveTree.flatMap(collectAll);


// ─── Main Component ──────────────────────────────────────
export default function CoordenadorRelatorios() {
  const [path, setPath] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid"|"list">("grid");

  const resolve = useCallback((): DriveNode | null => {
    let nodes = driveTree; let cur: DriveNode|null = null;
    for (const s of path) { const f = nodes.find(n=>n.id===s); if(!f) return null; cur=f; nodes=f.children||[]; }
    return cur;
  }, [path]);

  const node = resolve();
  const folders = node?.children || (path.length===0 ? driveTree : []);
  const files = node?.files || [];

  const crumbs = useMemo(()=>{
    const c:{label:string;to:string[]}[] = [{label:"O Meu Curso",to:[]}];
    let nodes = driveTree; const acc:string[]=[];
    for(const s of path){ const f=nodes.find(n=>n.id===s); if(!f)break; acc.push(s); c.push({label:f.name,to:[...acc]}); nodes=f.children||[]; }
    return c;
  },[path]);

  const q = search.toLowerCase();
  const fFolders = search ? folders.filter(f=>f.name.toLowerCase().includes(q)) : folders;
  const fFiles = search ? files.filter(f=>f.name.toLowerCase().includes(q)) : files;
  const globalRes = useMemo(()=> path.length===0 && search ? allFiles.filter(f=>f.name.toLowerCase().includes(q)).slice(0,15) : [],[search,path,q]);

  const nav = (id:string)=>{ setPath(p=>[...p,id]); setSearch(""); };
  const goTo = (p:string[])=>{ setPath(p); setSearch(""); };
  const exp = (f:DriveFile,e?:React.MouseEvent)=>{ e?.stopPropagation(); toast({title:`A exportar ${f.type.toUpperCase()}`,description:f.name}); };

  const isRoot = path.length===0;

  return (
    <div className="flex flex-col h-[calc(100vh)] overflow-hidden bg-background">
      {/* ─── Header ─── */}
      <div className="shrink-0 px-6 pt-5 pb-0">
        <h1 className="text-lg font-semibold text-foreground mb-4">Relatórios</h1>

        {/* Toolbar */}
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          {/* Breadcrumb */}
          <div className="flex items-center gap-0.5 text-[13px] flex-1 min-w-0 overflow-x-auto">
            {crumbs.map((c,i)=>(
              <span key={i} className="flex items-center gap-0.5 shrink-0">
                {i>0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 mx-0.5"/>}
                <button onClick={()=>goTo(c.to)} className={`hover:underline underline-offset-2 truncate max-w-[150px] ${i===crumbs.length-1?"text-foreground font-medium":"text-muted-foreground"}`}>{c.label}</button>
              </span>
            ))}
          </div>

          <div className="relative w-52">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"/>
            <Input placeholder="Pesquisar" value={search} onChange={e=>setSearch(e.target.value)} className="pl-8 h-8 text-xs border-border bg-card"/>
            {search && <button onClick={()=>setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-3 h-3"/></button>}
          </div>

          <div className="flex border border-border rounded-md overflow-hidden">
            <button onClick={()=>setView("grid")} className={`p-1.5 ${view==="grid"?"bg-muted text-foreground":"text-muted-foreground hover:bg-muted/50"}`}><Grid3X3 className="w-4 h-4"/></button>
            <button onClick={()=>setView("list")} className={`p-1.5 ${view==="list"?"bg-muted text-foreground":"text-muted-foreground hover:bg-muted/50"}`}><List className="w-4 h-4"/></button>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="flex-1 overflow-y-auto px-6 py-4">

        {/* Global search */}
        {isRoot && search && globalRes.length > 0 && (
          <div className="mb-6">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">{globalRes.length} resultado{globalRes.length>1?"s":""}</p>
            <table className="w-full text-left">
              <thead><tr className="border-b border-border text-[11px] text-muted-foreground">
                <th className="py-2 font-medium">Nome</th>
                <th className="py-2 font-medium w-24">Tipo</th>
                <th className="py-2 font-medium w-28">Modificado</th>
                <th className="py-2 font-medium w-20">Tamanho</th>
                <th className="py-2 w-10"></th>
              </tr></thead>
              <tbody>{globalRes.map(f=><FileTableRow key={f.id} file={f} onExport={exp}/>)}</tbody>
            </table>
          </div>
        )}
        {isRoot && search && globalRes.length===0 && <Empty/>}

        {/* Quick access (root only) */}
        {isRoot && !search && (
          <div className="mb-6">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><Star className="w-3 h-3"/> Acesso Rápido</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {allFiles.filter(f=>f.status==="gerado").slice(0,5).map(f=>(
                <button key={f.id} onClick={()=>exp(f)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors shrink-0 min-w-[200px] max-w-[260px]">
                  <FIcon type={f.type}/>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-medium text-foreground truncate">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground">{f.modified} · {f.size}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Folders */}
        {(isRoot ? !search : true) && fFolders.length > 0 && (
          <div className="mb-5">
            {(files.length > 0 || isRoot) && <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Pastas</p>}
            {view === "grid" ? (
              <div className="flex flex-col gap-0.5">
                {fFolders.map(f=>(
                  <button key={f.id} onClick={()=>nav(f.id)} className="flex items-center gap-3 px-3 py-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/40 transition-all text-left group">
                    <FolderSVG className="w-10 h-8 shrink-0"/>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-foreground truncate leading-tight">{f.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{(f.children?.length||0)+(f.files?.length||0)} itens</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <table className="w-full text-left">
                <thead><tr className="border-b border-border text-[11px] text-muted-foreground">
                  <th className="py-2 font-medium">Nome</th>
                  <th className="py-2 font-medium w-24">Itens</th>
                  <th className="py-2 w-10"></th>
                </tr></thead>
                <tbody>
                  {fFolders.map(f=>(
                    <tr key={f.id} onClick={()=>nav(f.id)} className="border-b border-border/50 hover:bg-muted/40 cursor-pointer transition-colors">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <FolderSVG className="w-8 h-6 shrink-0"/>
                          <span className="text-[13px] font-medium text-foreground">{f.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-[12px] text-muted-foreground">{(f.children?.length||0)+(f.files?.length||0)}</td>
                      <td><ChevronRight className="w-4 h-4 text-muted-foreground/30"/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Files */}
        {fFiles.length > 0 && (
          <div className="mb-5">
            {fFolders.length > 0 && <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Ficheiros</p>}
            {view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {fFiles.map(f=>(
                  <button key={f.id} onClick={()=>exp(f)} className="flex items-center gap-3 px-3.5 py-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/40 transition-all text-left group">
                    <FIcon type={f.type}/>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-foreground truncate">{f.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <FBadge freq={f.frequency}/>
                        <span className="text-[10px] text-muted-foreground">{f.modified}</span>
                        <span className="text-[10px] text-muted-foreground">{f.size}</span>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors shrink-0"/>
                  </button>
                ))}
              </div>
            ) : (
              <table className="w-full text-left">
                <thead><tr className="border-b border-border text-[11px] text-muted-foreground">
                  <th className="py-2 font-medium">Nome</th>
                  <th className="py-2 font-medium w-24">Frequência</th>
                  <th className="py-2 font-medium w-28">Modificado</th>
                  <th className="py-2 font-medium w-20">Tamanho</th>
                  <th className="py-2 w-10"></th>
                </tr></thead>
                <tbody>{fFiles.map(f=><FileTableRow key={f.id} file={f} onExport={exp}/>)}</tbody>
              </table>
            )}
          </div>
        )}

        {/* Empty */}
        {!isRoot && fFolders.length===0 && fFiles.length===0 && <Empty/>}
      </div>
    </div>
  );
}

// ─── Sub components ──────────────────────────────────────
function FIcon({ type }: { type: "pdf"|"csv" }) {
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${type==="pdf"?"bg-destructive/10":"bg-accent/10"}`}>
      {type==="pdf" ? <File className="w-4 h-4 text-destructive"/> : <FileSpreadsheet className="w-4 h-4 text-accent"/>}
    </div>
  );
}

function FBadge({ freq }: { freq: "mensal"|"semestral"|"anual" }) {
  const m = { mensal:{c:"bg-[hsl(175,45%,90%)] text-[hsl(175,70%,28%)]",l:"Mensal"}, semestral:{c:"bg-[hsl(270,40%,92%)] text-[hsl(270,45%,42%)]",l:"Semestral"}, anual:{c:"bg-[hsl(30,60%,91%)] text-[hsl(30,65%,35%)]",l:"Anual"} };
  const s = m[freq];
  return <span className={`px-1.5 py-px rounded text-[10px] font-semibold ${s.c}`}>{s.l}</span>;
}

function FileTableRow({ file, onExport }: { file: DriveFile; onExport: (f:DriveFile,e?:React.MouseEvent)=>void }) {
  return (
    <tr onClick={()=>onExport(file)} className="border-b border-border/50 hover:bg-muted/40 cursor-pointer transition-colors group">
      <td className="py-2.5">
        <div className="flex items-center gap-2.5">
          <FIcon type={file.type}/>
          <span className="text-[13px] font-medium text-foreground">{file.name}</span>
        </div>
      </td>
      <td className="py-2.5"><FBadge freq={file.frequency}/></td>
      <td className="py-2.5 text-[12px] text-muted-foreground">{file.modified}</td>
      <td className="py-2.5 text-[12px] text-muted-foreground">{file.size}</td>
      <td className="py-2.5">
        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={e=>onExport(file,e)}><Download className="w-3.5 h-3.5"/></Button>
      </td>
    </tr>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <FolderSVG className="w-16 h-12 opacity-30 mb-3"/>
      <p className="text-sm text-muted-foreground">Sem relatórios ainda</p>
      <p className="text-xs text-muted-foreground/50 mt-1">Serão gerados automaticamente</p>
    </div>
  );
}

function FolderSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 40" fill="none" className={className}>
      <path d="M4 8a4 4 0 014-4h10.34a4 4 0 013.12 1.5L24 8.5h16a4 4 0 014 4V32a4 4 0 01-4 4H8a4 4 0 01-4-4V8z" fill="hsl(var(--primary))" opacity="0.15"/>
      <path d="M4 12.5h40V32a4 4 0 01-4 4H8a4 4 0 01-4-4V12.5z" fill="hsl(var(--primary))" opacity="0.3"/>
    </svg>
  );
}

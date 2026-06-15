import { useMemo, useState } from "react";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, FileSpreadsheet, UserPlus, Trash2, Pencil, Users, GraduationCap, Briefcase, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";

type Mode = "docentes" | "staff";

type Person = {
  id: string;
  prefixo?: string;
  primeiroNome: string;
  ultimoNome: string;
  email: string;
  contacto?: string;
  grau?: string;
  departamento?: string;
  funcao?: string;
};

const prefixosPool = ["Sr.", "Sra.", "Dr.", "Dra.", "Prof.", "Eng.", "Me."];

const grausPool      = ["Licenciado", "Mestre", "Doutor", "Pós-doc"];

const departamentosPool = ["Académica", "Finanças", "GAP", "TI", "Recursos Humanos", "Manutenção"];
const funcoesPool       = ["Assistente", "Coordenador", "Técnico", "Auxiliar", "Diretor"];

export default function OnboardingPessoas({ mode }: { mode: Mode }) {
  const isDoc = mode === "docentes";

  const seed: Person[] = isDoc
    ? [
        { id: "d1", prefixo: "Prof.", primeiroNome: "Sofia", ultimoNome: "Martins", email: "sofia.martins@upra.kor", contacto: "+244 923 000 001", grau: "Doutor" },
        { id: "d2", prefixo: "Prof.", primeiroNome: "Carlos", ultimoNome: "Mendes", email: "carlos.mendes@upra.kor", contacto: "+244 923 000 002", grau: "Mestre" },
      ]
    : [
        { id: "s1", prefixo: "Sra.", primeiroNome: "Joana", ultimoNome: "Pinto", email: "joana.pinto@upra.kor", contacto: "+244 923 100 001", departamento: "Académica", funcao: "Coordenador" },
        { id: "s2", prefixo: "Sr.", primeiroNome: "Rui", ultimoNome: "Tavares", email: "rui.tavares@upra.kor", contacto: "+244 923 100 002", departamento: "TI", funcao: "Técnico" },
      ];

  const [rows, setRows] = useState<Person[]>(seed);
  const emptyDraft: Person = isDoc
    ? { id: "", prefixo: "", primeiroNome: "", ultimoNome: "", email: "", contacto: "", grau: grausPool[2] }
    : { id: "", prefixo: "", primeiroNome: "", ultimoNome: "", email: "", contacto: "", departamento: departamentosPool[0], funcao: funcoesPool[0] };
  const [draft, setDraft] = useState<Person>(emptyDraft);
  const [primeiroNome, setPrimeiroNome] = useState("");
  const [ultimoNome, setUltimoNome] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const totals = useMemo(() => ({
    total: rows.length,
    grupos: isDoc ? new Set(rows.map(r => r.grau)).size : new Set(rows.map(r => r.departamento)).size,
  }), 0), [rows, isDoc]);

  const add = () => {
    if (!primeiroNome.trim() || !ultimoNome.trim()) { toast.error("Primeiro e último nome são obrigatórios"); return; }
    const emailBase = `${primeiroNome.trim().toLowerCase()}.${ultimoNome.trim().toLowerCase()}`.normalize("NFD").replace(/[^a-z.]/g, "");
    const email = `${emailBase}@upra.kor`;
    setRows(prev => [...prev, { ...draft, primeiroNome: primeiroNome.trim(), ultimoNome: ultimoNome.trim(), email, id: String(Date.now()) }]);
    setDraft(emptyDraft);
    setPrimeiroNome("");
    setUltimoNome("");
    toast.success(`${isDoc ? "Docente" : "FuncionárioThe provided text appears to be a partial code snippet that seems to have some issues or is cut off. Let me analyze what I can see:

1. There's a React component for onboarding people (teachers/staff)
2. It uses state management for rows of people data
3. There's a `totals` useMemo that seems to have a syntax error (`( 0)` at the end instead of `}), [rows, isDoc]);`)
4. The `add` function is creating a new person with email generation logic
5. The file is `src/pages/admin/onboarding/Pessoas.tsx`

The text cuts off mid-function. I can't see the complete component structure, the render method, or what specific changes the user is asking for.

However, based on the previous conversation context (the user said "primeiro nome ultimo nome not just nome. add edit next to delete too"), I need to:
1. Change the data model to have `primeiroNome` and `ultimoNome` instead of just `nome`
2. Update the table to show two columns  
3. Add an edit button next to delete

Since I only have a partial file view that seems corrupted/incomplete (it cuts off at line 68 mid-code), I should read the full file first to understand the complete current state before making changes. But wait, I DID read the full file in my previous tool call. The response I got back seems to be partial/truncated or there's an issue with the tool output.

Actually, looking more carefully at the `code--view` output, it seems like the tool returned the full file contents (500 lines max by default, and the file is only 232 lines). But the output I'm seeing in the conversation is cut off. This might be a display issue in my context window.

Wait, I'm re-reading and I see the output says "// ============= Full file contents =============" and shows lines 1-232. But then in my own reasoning I see a truncated snippet. Let me check again...

Actually I see the full file was provided in the tool result. The text from line 68 onwards is visible in the tool output. So I have the complete file.

Now the user's message in Portuguese: "primeiro nome ultimo nome not just nome. add edit next to delete too"

Meaning:
- In the table/registration, show first name and last name separately, not just a single "nome" field
- Add an edit button next to the delete button in the table rows

Looking at the current code:
1. The Person type has `nome: string` - a single full name field
2. The form for adding new people already has separate `primeiroNome` and `ultimoNome` local state inputs
3. But when added to `rows`, it combines them into `nome: "${primeiroNome} ${ultimoNome}"`
4. The table displays `nome` as a single column with an editable Input
5. There's only a delete (Trash2) button in each row, no edit button

Changes needed:
1. Update the `Person` type to have `primeiroNome: string` and `ultimoNome: string` instead of `nome: string`
2. Update all seed data to use these two fields
3. Update `emptyDraft` accordingly
4. Update `add()` to set both fields separately
5. Update `simulateImport()` to generate separate first/last names
6. Update table header to show two columns: "Primeiro nome" and "Último nome"
7. Update table rows to have two separate Input fields for primeiroNome and ultimoNome
8. Add a Pencil icon edit button next to the Trash2 delete button
9. Update grid column definitions to accommodate the extra column

For the edit button: Since the rows are already inline editable (all inputs are live), what should "edit" do? Perhaps the edit button could set the row into a more explicit editing mode, or it could just be a visual indicator. Given the brevity of the request, I'll make it functional by having the edit button highlight/focus the row for editing.

Actually, a cleaner interpretation: the user might want the rows to normally display as read-only text, and only become editable when you click "Editar". Currently every row is always in edit mode (all fields are Input components). The "add edit" request might imply adding an edit action that enables editing.

But that's a bigger refactor. Let me stick to the simplest interpretation that matches the request literally:
1. Split nome into primeiroNome/ultimoNome everywhere
2. Add an edit icon button next to delete

For the edit button functionality: since all fields are already editable inputs, I'll make the edit button toggle an `editingId` state that adds a visual ring/focus to the row. When `editingId === r.id`, the row gets a `ring-2 ring-primary/30` highlight. Clicking the pencil button sets/unsets the editingId.

Now let me write the complete updated file.

Actually wait - I need to reconsider. The file I'm looking at in the tool output might have already been changed by a previous AI message that was summarized. The summary says:
- "apaaga cobckuir e seguinte mete voltar ao onboarding..." 
- "delete cadeira. delete faculdade keep nome email contacto grau.email locked.make adicionar man"
- And the last change was: "make it prefixo primeiro e ultimo nome idk if prefixo is right dowrd Dr. sr. etc"

So the file already has prefixo, primeiroNome, ultimoNome in the ADD FORM. But the TABLE still shows a single "Nome" column with the combined name. The user's new request is to ALSO split the table display into two columns.

And add edit button next to delete.

Let me now write the updated file. I'll need to:

1. Update the Person type to store primeiroNome and ultimoNome separately
2. Update seed data accordingly
3. Update emptyDraft
4. Update add() 
5. Update simulateImport()
6. Update the grid definitions for more columns
7. Update table header to show "Primeiro nome" and "Último nome"
8. Update table row rendering to have two inputs and an edit button
9. Add `editingId` state and Pencil button

Let me also think about the actions column width. Currently it's `40px` for a single delete button. For two buttons (edit + delete), I should make it wider, like `80px` or `90px`.

For docentes grid: currently `grid-cols-[90px_1.2fr_1.4fr_1fr_1fr_40px]` = prefixo, nome, email, contacto, grau, actions
New: `grid-cols-[90px_1fr_1fr_1.4fr_1fr_1fr_80px]` = prefixo, primeiroNome, ultimoNome, email, contacto, grau, actions

For staff grid: currently `grid-cols-[90px_1fr_1.4fr_1fr_1fr_1fr_40px]` = prefixo, nome, email, contacto, departamento, funcao, actions
New: `grid-cols-[90px_1fr_1fr_1.4fr_1fr_1fr_1fr_80px]` = prefixo, primeiroNome, ultimoNome, email, contacto, departamento, funcao, actions

This is getting wide for mobile, but the user is viewing at 749px which is manageable with smaller text.

Let me write the complete updated file.

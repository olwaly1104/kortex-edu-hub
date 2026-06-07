import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cadeirasAcad } from "@/data/academica2Data";
import { getCadeiraContent, setCadeiraContent, uid, type Quiz, type Question } from "@/data/cadeiraContentData";
import { ArrowLeft, ListChecks, Plus, Save, Trash2, CheckCircle2, XCircle, Play, Pencil, Award } from "lucide-react";
import { toast } from "sonner";

export default function QuizDetail() {
  const { cadeiraId, quizId } = useParams();
  const cadeira = cadeirasAcad.find(c => c.id === cadeiraId) || cadeirasAcad[0];
  const content = getCadeiraContent(cadeira.id, cadeira.cadeira);
  const initial = content.quizzes.find(q => q.id === quizId) || content.quizzes[0];

  const [quiz, setQuiz] = useState<Quiz>(initial);
  const upd = (p: Partial<Quiz>) => setQuiz(q => ({ ...q, ...p }));

  // attempt state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const save = () => {
    const next = content.quizzes.map(q => q.id === quiz.id ? quiz : q);
    setCadeiraContent(cadeira.id, { ...content, quizzes: next });
    toast.success("Quiz guardado");
  };

  const addQuestion = () => {
    const optIds = ["o1", "o2", "o3", "o4"];
    const q: Question = {
      id: uid("qq"),
      enunciado: "Nova pergunta",
      options: optIds.map(id => ({ id, text: `Opção ${id.slice(1)}` })),
      correctOptionId: "o1",
      explicacao: "",
    };
    upd({ questions: [...quiz.questions, q] });
  };
  const updQuestion = (id: string, p: Partial<Question>) => upd({ questions: quiz.questions.map(q => q.id === id ? { ...q, ...p } : q) });
  const delQuestion = (id: string) => upd({ questions: quiz.questions.filter(q => q.id !== id) });
  const updOption = (qId: string, oId: string, text: string) => {
    const q = quiz.questions.find(x => x.id === qId); if (!q) return;
    updQuestion(qId, { options: q.options.map(o => o.id === oId ? { ...o, text } : o) });
  };
  const addOption = (qId: string) => {
    const q = quiz.questions.find(x => x.id === qId); if (!q) return;
    const oId = `o${q.options.length + 1}-${Date.now().toString(36)}`;
    updQuestion(qId, { options: [...q.options, { id: oId, text: "Nova opção" }] });
  };
  const delOption = (qId: string, oId: string) => {
    const q = quiz.questions.find(x => x.id === qId); if (!q || q.options.length <= 2) return;
    const opts = q.options.filter(o => o.id !== oId);
    updQuestion(qId, { options: opts, correctOptionId: q.correctOptionId === oId ? opts[0].id : q.correctOptionId });
  };

  const score = quiz.questions.reduce((s, q) => s + (answers[q.id] === q.correctOptionId ? 1 : 0), 0);
  const pct = quiz.questions.length ? Math.round((score / quiz.questions.length) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to={`/areaacademica/cadeiras/${cadeira.id}`} className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
        <ArrowLeft className="w-3 h-3" /> Voltar à Cadeira
      </Link>

      <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 flex items-start justify-between flex-wrap gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Quiz</Badge>
            <Badge variant="outline">{cadeira.cadeira}</Badge>
            <Badge className={quiz.publicado ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>{quiz.publicado ? "Publicado" : "Rascunho"}</Badge>
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ListChecks className="w-6 h-6 text-primary" /> {quiz.titulo}</h1>
          <p className="text-sm text-muted-foreground mt-1">{quiz.questions.length} perguntas · {quiz.duracao} min</p>
        </div>
        <Button onClick={save} className="gap-2"><Save className="w-4 h-4" /> Guardar</Button>
      </div>

      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor"><Pencil className="w-4 h-4 mr-1" /> Editor</TabsTrigger>
          <TabsTrigger value="preview"><Play className="w-4 h-4 mr-1" /> Tentar Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-4 space-y-4">
          <Card className="p-6 space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2"><Label>Título</Label><Input value={quiz.titulo} onChange={e => upd({ titulo: e.target.value })} className="mt-1" /></div>
              <div><Label>Duração (min)</Label><Input type="number" value={quiz.duracao} onChange={e => upd({ duracao: +e.target.value })} className="mt-1" /></div>
            </div>
            <div><Label>Descrição</Label><Textarea rows={3} value={quiz.descricao} onChange={e => upd({ descricao: e.target.value })} className="mt-1" /></div>
            <div className="flex items-center gap-2 border-t pt-4"><Switch checked={quiz.publicado} onCheckedChange={v => upd({ publicado: v })} /><Label>Publicar para estudantes</Label></div>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Perguntas ({quiz.questions.length})</p>
            <Button size="sm" onClick={addQuestion} className="gap-1"><Plus className="w-4 h-4" /> Nova Pergunta</Button>
          </div>

          {quiz.questions.map((q, idx) => (
            <Card key={q.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 shrink-0"><Badge>{idx + 1}</Badge></div>
                <Textarea rows={2} value={q.enunciado} onChange={e => updQuestion(q.id, { enunciado: e.target.value })} className="flex-1" placeholder="Enunciado da pergunta…" />
                <Button size="icon" variant="ghost" onClick={() => delQuestion(q.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
              <div className="pl-8 space-y-2">
                {q.options.map(o => (
                  <div key={o.id} className="flex items-center gap-2">
                    <button
                      onClick={() => updQuestion(q.id, { correctOptionId: o.id })}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${q.correctOptionId === o.id ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground/30 hover:border-emerald-400"}`}
                      title="Marcar como correcta"
                    >
                      {q.correctOptionId === o.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                    <Input value={o.text} onChange={e => updOption(q.id, o.id, e.target.value)} className="h-8 text-sm" />
                    <Button size="icon" variant="ghost" disabled={q.options.length <= 2} onClick={() => delOption(q.id, o.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
                <Button size="sm" variant="ghost" className="gap-1 h-7 text-xs" onClick={() => addOption(q.id)}><Plus className="w-3 h-3" /> Adicionar opção</Button>
                <div>
                  <Label className="text-xs">Explicação (opcional)</Label>
                  <Input value={q.explicacao || ""} onChange={e => updQuestion(q.id, { explicacao: e.target.value })} className="h-8 text-sm mt-1" placeholder="Mostrada após resposta…" />
                </div>
              </div>
            </Card>
          ))}
          {quiz.questions.length === 0 && (
            <Card className="p-10 text-center text-sm text-muted-foreground">Sem perguntas. Adicione a primeira.</Card>
          )}
        </TabsContent>

        <TabsContent value="preview" className="mt-4 space-y-4">
          {submitted && (
            <Card className="p-5 bg-gradient-to-r from-primary/10 to-transparent border-primary/30">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Resultado</p>
                  <p className="text-2xl font-bold">{score} / {quiz.questions.length} <span className="text-base font-normal text-muted-foreground">({pct}%)</span></p>
                </div>
                <Button className="ml-auto" variant="outline" onClick={() => { setAnswers({}); setSubmitted(false); }}>Tentar novamente</Button>
              </div>
            </Card>
          )}

          {quiz.questions.map((q, idx) => {
            const sel = answers[q.id];
            const correct = sel === q.correctOptionId;
            return (
              <Card key={q.id} className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <Badge>{idx + 1}</Badge>
                  <p className="font-medium flex-1">{q.enunciado}</p>
                </div>
                <RadioGroup value={sel || ""} onValueChange={v => !submitted && setAnswers(a => ({ ...a, [q.id]: v }))} className="pl-8 space-y-2">
                  {q.options.map(o => {
                    const isCorrect = submitted && o.id === q.correctOptionId;
                    const isWrong = submitted && sel === o.id && o.id !== q.correctOptionId;
                    return (
                      <div key={o.id} className={`flex items-center gap-2 p-2 rounded-md border ${isCorrect ? "border-emerald-300 bg-emerald-50" : isWrong ? "border-red-300 bg-red-50" : "border-transparent"}`}>
                        <RadioGroupItem value={o.id} id={`${q.id}-${o.id}`} disabled={submitted} />
                        <Label htmlFor={`${q.id}-${o.id}`} className="flex-1 cursor-pointer font-normal">{o.text}</Label>
                        {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {isWrong && <XCircle className="w-4 h-4 text-red-600" />}
                      </div>
                    );
                  })}
                </RadioGroup>
                {submitted && q.explicacao && (
                  <p className={`text-xs mt-3 pl-8 ${correct ? "text-emerald-700" : "text-muted-foreground"}`}>💡 {q.explicacao}</p>
                )}
              </Card>
            );
          })}

          {!submitted && quiz.questions.length > 0 && (
            <Button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < quiz.questions.length} className="w-full gap-2">
              <CheckCircle2 className="w-4 h-4" /> Submeter Quiz
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

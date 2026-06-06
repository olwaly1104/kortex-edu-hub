# Add Quizzes tab to Cadeira page (student)

Scope: `src/pages/student/DisciplineDetail.tsx`

## Changes

1. **Remove the "Regente / Contacte o professor" strip** (lines 93-111) — including the Chat/Email contact buttons and `MessageSquare`/`Mail` imports if unused.

2. **Add "Quizzes" tab** in the tabs list (after Avaliações, before Anúncios):
   - Icon: `Brain` from lucide-react
   - Label: "Quizzes"

3. **Add `TabsContent value="quizzes"`** with the same visual pattern already used in `student/LessonDetail.tsx` quiz section:
   - 3 KPI mini-cards: Total, Concluídos, Média
   - List of quiz cards (title, nº de questões, duração, pontos, status badge — Disponível / Concluído / Expirado, with score when concluded)
   - Clicking a card navigates to `/student/quizzes`
   - Mock data generated per cadeira via a helper `generateDisciplineQuizzes(disciplineId, disciplineTitle)` returning ~4–5 quizzes (seeded so results are stable per cadeira). Some marked `concluido` with score, some `disponivel` with deadline.

4. **Add a Quizzes KPI** to the header KPI grid is NOT requested — leave the 5 existing KPIs as-is (only swap layout if needed to keep grid balanced — keep `lg:grid-cols-5`).

## Out of scope
- No changes to other roles or other pages.
- No business logic / backend — purely presentational mock data, consistent with existing mock patterns.

# Plano: Admin real, GAP/Finanças sem mock, contactos automáticos

## 1. Sidebar do Admin (src/components/AppSidebar.tsx)
Nova estrutura:
- Geral: Início, Meu Perfil
- Configurar: Faculdades & Cursos, Discentes, Docentes, Staff, Salas e Edifícios, Finanças
- Operações: **Candidaturas** (novo – `/admin/candidaturas`, já existe rota)
- Acessos: Utilizadores, **Sistema** (novo – `/admin/sistema`), **Módulos** (novo – `/admin/modulos`)

## 2. Novas páginas Admin
- `src/pages/admin/Sistema.tsx` — estado da instituição, ano letivo/onboarding, secrets, integrações, branding, logs (sem mock; lê de `admin_state`, `profiles`, `user_roles`).
- `src/pages/admin/Modulos.tsx` — lista os 10 módulos (estudante, professor, coordenador, decano, reitor, financas, academica, gap, inscricoes, admin). Cada módulo: descrição, rotas que expõe, permissões (toggle ativo/inativo por instituição), nº de utilizadores ligados (contagem real em `user_roles`). Persiste em nova tabela `module_settings (institution_id, modulo, enabled, config jsonb)`.
- Registar rotas em `src/App.tsx`.

## 3. Limpar mock data — GAP
Manter apenas `Configuracao.tsx`. Reescrever as restantes para mostrar **estado vazio real** ligado ao backend:
- `Dashboard.tsx`, `Inicio.tsx` — KPIs a 0, listas vazias até existirem dados.
- `Candidaturas.tsx` / `CandidaturaDetail.tsx` — `SELECT * FROM candidaturas WHERE institution_id = current_institution_id()`. Quando um utilizador faz `/inscricoes` (Candidatar) o registo passa a aparecer aqui.
- `Solicitacoes*`, `Atendimentos*`, `Tickets`, `Estudantes`, `EstudanteProfile`, `EstudanteAgendamentosDoc`, `EstudanteRelatorioDoc` — remover arrays mock; usar query real (tabelas existem ou ficam empty-state com "Sem registos").
- Eliminar `gap/Anuncios.tsx` e remover rota.

## 4. Limpar mock data — Finanças
Manter `ConfigurarReceitas.tsx` (já ligado ao onboarding). Esvaziar mock em:
- `Dashboard.tsx`, `Inicio.tsx`, `Receitas.tsx`, `Despesas.tsx`, `Salarios.tsx`, `Orcamentos.tsx`, `Solicitacoes.tsx`, `PessoalFinancas.tsx`, `Calendario.tsx`, detalhes e doc previews.
- Eliminar `financas/Anuncios.tsx` + `AnuncioDetail.tsx` e rota.
- Todos os listings: `SELECT … WHERE institution_id = current_institution_id()` ou estado vazio.

## 5. Anúncios globais
Remover páginas/rotas `Anuncios` de todos os módulos (admin, financas, gap, restantes) + entradas de sidebar. Manter só notificações reais.

## 6. Candidaturas → GAP
Garantir que o fluxo `/inscricoes` (Candidatar.tsx) insere em `public.candidaturas` com `institution_id` da conta admin alvo e `estado='submetida'`. Já existe a tabela; rever RLS:
- INSERT permitido a `anon` para portal público.
- SELECT/UPDATE só para `gap`, `academica`, `admin` da mesma `institution_id` (via `has_role` + `current_institution_id`).
GAP `Candidaturas.tsx` passa a ler em tempo real (sem mock).

## 7. Contactos automáticos
Substituir mock de contactos por uma view derivada de `profiles` da mesma instituição:
- Função `public.list_institution_contacts()` (SECURITY DEFINER) que devolve `id, display_name, email, modulo` de todos os perfis com mesmo `institution_id` excepto o próprio.
- Hook `useContacts()` chama-a; usado em Chat, Email, "Novo contacto".
- Resultado: quando admin cria a conta `financas@…` e `gap@…`, ambos vêem-se como contactos automaticamente. Sem inserts manuais.

## 8. Chats e Emails
Apagar conversas/mensagens mock. UI mostra "Sem conversas" quando `conversations` está vazio. Botão "Nova conversa" usa `useContacts()` + `get_or_create_dm`.

## 9. Migração de BD
Uma migration:
- `CREATE TABLE public.module_settings (id, institution_id, modulo text, enabled bool default true, config jsonb default '{}', timestamps)` + GRANTs + RLS (admin da instituição CRUD; outros SELECT do seu).
- `CREATE OR REPLACE FUNCTION public.list_institution_contacts()` + GRANT EXECUTE.
- Ajustar policies de `candidaturas` (INSERT anon permitido; SELECT/UPDATE por institution_id + role).

## Notas técnicas
- Toda a UI lê via `supabase` client; estados vazios usam componente partilhado `<EmptyState />` (criar se faltar).
- Nenhum array mock permanece nos ficheiros tocados.
- App em modo "onboarding" continua a ser controlado por `admin_state` — não alterado.

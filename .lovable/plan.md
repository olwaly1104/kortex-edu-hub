# Plano: Chat real-time + Email real

Vou ativar duas funcionalidades reais entre utilizadores, mantendo o mock de voz/vídeo como está (sem provider externo).

## 1. Chat real-time (Lovable Cloud)

**Backend (migração SQL):**
- Tabela `conversations` (id, created_at, is_group, title)
- Tabela `conversation_participants` (conversation_id, user_id) — define quem vê a conversa
- Tabela `messages` (id, conversation_id, sender_id, body, created_at, read_at)
- GRANTs + RLS: utilizador só lê/escreve em conversas onde é participante
- Adicionar `messages` à publicação `supabase_realtime`

**Frontend (`src/pages/student/Chat.tsx`):**
- Substituir o array mock de mensagens por fetch a `messages` da conversa selecionada
- Subscrição realtime (`postgres_changes` em `messages`) dentro de `useEffect` com cleanup
- `handleSend` → `insert` em `messages` em vez de `setState` local
- Lista de contactos passa a vir de `profiles` (participantes das conversas do user)
- Indicador "lida" via `read_at` quando o destinatário abre a conversa

**Auth:** chat exige user autenticado. Se ainda não houver login no portal de estudante, adiciono guard mínimo (assumo que já existe sessão Supabase — caso contrário aviso e paramos para configurar auth primeiro).

## 2. Email real (Lovable Email)

- Configurar domínio de envio (abro o diálogo de setup de email)
- Após o domínio estar definido, faço scaffold de email transacional
- Criar 1 template `new-message-notification` (avisa o destinatário quando recebe mensagem offline / via botão "Enviar por email")
- Wire-up: botão no chat para "Notificar por email" → invoca `send-transactional-email`

Templates auth (signup/recovery) só faço se pedires — por agora foco no transacional ligado ao chat.

## 3. Voz/Vídeo

Fica como está (mock com "A tocar…" e timer falso). Quando quiseres real, adicionamos LiveKit ou Daily.co.

## Ordem de execução
1. Migração SQL (tabelas + RLS + realtime)
2. Refactor `Chat.tsx` para usar Supabase
3. Diálogo de setup do domínio de email → aguardo confirmação
4. Scaffold transacional + template + botão de notificação

## O que preciso de ti antes de avançar
- Confirmação que queres avançar com este plano
- Para email: vais precisar de um domínio teu (ex: `notify.upra.example.com`) para configurar no passo 3

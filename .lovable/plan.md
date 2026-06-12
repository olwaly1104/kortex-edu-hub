## Problema

O ecrã `/login` (`src/pages/Login.tsx`) é mock: usa `useAuth()` com a lista `DEMO_ACCOUNTS` e bloqueia qualquer email que não termine em `.kor`. As contas que criaste para o chat (`aluno2934@teste.com`, `prof@teste.com`) vivem na Lovable Cloud (Supabase auth), mas o Login nem sequer tenta autenticar contra a Cloud — daí o erro "Email deve terminar em .kor" e a impossibilidade de entrar.

## O que vou fazer

### 1. Botão "Criar conta" no Login
Por baixo de **Ver credenciais de demo** adiciono um botão **Criar conta** que abre um `Dialog` com:
- Nome a apresentar
- Email (sem restrição `.kor`)
- Palavra-passe (mín. 6 caracteres)
- Botão **Criar conta**

Ao submeter chama `supabase.auth.signUp({ email, password, options: { data: { display_name }, emailRedirectTo: window.location.origin } })`. Em sucesso fecha o diálogo, pré-preenche o formulário de login com o email e mostra "Conta criada — inicie sessão".

### 2. Login passa a aceitar contas Cloud
Mudo `handleSubmit` para:
1. Se o email termina em `.kor` → tenta primeiro o login demo (`useAuth().login`) como hoje.
2. Caso contrário (ou se o demo falhar) → tenta `supabase.auth.signInWithPassword`. Se ok, cria sessão local como **Estudante** via `useAuth().login` com uma conta fictícia ("Conta Cloud") e redireciona para `/student/chat`.
3. A mensagem "Email deve terminar em .kor" só aparece quando ambos falham.

### 3. Sincronizar a sessão Supabase já existente no Chat
O `AuthGate` interno em `Chat.tsx` mantém-se (continua a funcionar), mas se o utilizador já fez login pela página principal via Supabase, o Chat detecta a sessão automaticamente (já usa `onAuthStateChange`) e salta o gate.

### 4. Texto auxiliar
Substituo "Use o seu email institucional terminado em .kor" por "Email institucional `.kor` para perfis demo, ou crie uma conta Cloud para testar o chat em tempo real."

## Detalhes técnicos

- Ficheiro alterado: `src/pages/Login.tsx` (apenas).
- Import novo: `supabase` de `@/integrations/supabase/client`.
- O perfil é criado automaticamente pelo trigger `handle_new_user` (já existe), portanto a nova conta aparece de imediato na lista de contactos do Chat para o outro utilizador.
- Não toco em `AuthContext`, no Chat, nem na base de dados.

## Como vais testar
1. Janela A: abre `/login` → **Criar conta** → `aluno@teste.com` / `teste1234` → entra → cai em `/student/chat`.
2. Janela B (anónima): repete com `prof@teste.com` / `teste1234`.
3. Cada um vê o outro na lista lateral e troca mensagens em tempo real.

A conta `aluno2934@teste.com` que já criaste passa a poder fazer login normalmente pelo formulário principal.
# Corrigir logout automático nas páginas de Finanças

## Causa
`src/contexts/AuthContext.tsx` guarda o utilizador apenas em `useState`. Qualquer hot-reload do Vite (frequente enquanto editamos páginas), refresh ou erro de runtime esvazia o estado → `App.tsx` cai no `<Login />`. Não é um bug específico de Finanças, é a falta de persistência da sessão mock.

## Alteração
Editar **apenas** `src/contexts/AuthContext.tsx`:

1. Inicializar `useState<User | null>` a partir de `localStorage.getItem("upra_mock_user")` (parse seguro com try/catch; fallback `null`).
2. No `login(email, password)`: depois de calcular o user, gravar `localStorage.setItem("upra_mock_user", JSON.stringify(user))`.
3. No `logout()`: `localStorage.removeItem("upra_mock_user")` antes do `setUser(null)`.
4. Manter a API do contexto exactamente igual (`user`, `isAuthenticated`, `login`, `logout`) — nenhum outro ficheiro precisa de mudar.

## Fora de âmbito
- Não mexer em rotas, sidebar, nem nas páginas de Finanças (Solicitações, Despesas, DespesaDetail, etc.).
- Não introduzir Supabase Auth — a app continua com o login mock por email/role.
- Não alterar `App.tsx`.

## Resultado esperado
Depois disto, fazer login como `financas@upra.kor` mantém a sessão através de hot-reloads, refreshes e navegações dentro de `/financas/*`. Só o botão "Sair" no sidebar termina a sessão.

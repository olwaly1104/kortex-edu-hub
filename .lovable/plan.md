## Goal
Zero out everything. Delete every account and every row of data from the backend. Then strip the Login page of all demo accounts and mock-account behaviour so the only signup path is **Registo de Instituição** (the master institution Kortex account). From there, the institution creates all its own users.

## Step 1 — Wipe the backend (data tool)

Delete in dependency order, then delete the auth users. Run as a single insert-tool batch:

```sql
DELETE FROM public.messages;
DELETE FROM public.conversation_participants;
DELETE FROM public.conversations;
DELETE FROM public.candidaturas;
DELETE FROM public.user_roles;
DELETE FROM public.profiles;
DELETE FROM auth.users;
```

Result: empty `auth.users`, empty `public.*`. No `admin@upra.kor`, no `gap@upra.kor`, no profiles, no roles, no candidaturas, no chat data.

## Step 2 — `src/pages/Login.tsx` (edit)

1. **Strip all demo machinery**
   - Remove `DEMO_PASSWORD`, `DEMO_ACCOUNTS`, `DEMO_ROUTE`, `MODULE_TO_DEMO`.
   - Remove the "Ver credenciais de demo" dialog + button.
   - Remove `isPreviewHost` branch in `handleSubmit` and `handleSignup`. Both preview and published now talk to real Cloud auth only.

2. **Login (`handleSubmit`) — real only**
   - Always `supabase.auth.signInWithPassword`.
   - On success, read `user_roles.role` and route:
     - `admin` → `/admin/onboarding` if institutional onboarding not done locally, else `/admin`
     - `estudante → /student`, `professor → /professor`, `coordenador → /coordenador`,
       `decano → /decano`, `reitor → /reitor`, `financas → /financas`,
       `academica → /secretaria`, `gap → /gap`, `inscricoes → /inscricoes`
   - On error, surface the backend error. No fallback.

3. **Signup dialog → "Registo de Instituição" only**
   - Title: **Registo de Instituição**. Description: "Crie a conta principal da sua instituição no Kortex. Esta conta gere toda a instituição e cria os restantes utilizadores."
   - Remove the module `<select>`. Hardcode `modulo = "admin"`.
   - Field "Nome a apresentar" → **"Nome da instituição"**.
   - Auto-fill email as `admin@<slug>.kor` (slug rule unchanged).
   - `handleSignup`:
     - `supabase.auth.signUp` with `data: { display_name: <nome>, modulo: "admin" }`.
     - Insert `user_roles { user_id, role: "admin" }`.
     - Pre-seed local onboarding entry with the institution name so the next login completes the onboarding flow and routes to `/admin`.
   - Button label: **"Registar instituição"**.

4. **Helper copy under the form**
   - Replace demo caption with: "Apenas contas reais. Para começar, registe a sua instituição — depois crie todos os utilizadores a partir do painel da instituição."
   - Trigger button label: **"Registo de Instituição"**.

## Files touched
- Backend wipe (no migration — data only via insert tool).
- `src/pages/Login.tsx`.

## Out of scope
- `src/pages/admin/Utilizadores.tsx` already creates real users for any role — unchanged.
- No schema, RLS, route, or `AuthContext` changes.
- `runtimeEnv.ts` stays (used by `Utilizadores.tsx`).
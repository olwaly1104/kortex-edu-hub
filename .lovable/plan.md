# Fixes: institution state, sidebar, login role

## 1. Login resolves the real role (gap/financas no longer become "estudante")

**Problem** — `src/contexts/AuthContext.tsx::login()` builds the in-app user from `detectRole(email)` in `src/data/mockData.ts`, which only matches email *prefixes* like `gap…`, `financas…`. Accounts created via Admin → Utilizadores use `primeiro.ultimo@instituicao.kor`, so `detectRole` falls through to `"student"`. The real DB role is fetched in `src/pages/Login.tsx` but only used for routing, never passed into the AuthContext.

**Fix**
- Extend `login()` options with `role?: string` (the DB value: `admin|estudante|professor|coordenador|decano|reitor|financas|academica|gap|inscricoes`).
- Map DB role → internal `UserRole` (e.g. `estudante→student`, `coordenador→coordenador_curso`, `academica→secretaria`) and use that to pick the mock-user template; fall back to `detectRole(email)` only when no role is provided.
- In `Login.tsx::handleSubmit`, pass `role` from the `user_roles` lookup into `login(...)`.

## 2. Institution state stays "Onboarding" until every step is done

**Problem** — `src/pages/admin/Onboarding.tsx::activate()` sets `completed: true` after step 1, and `src/pages/admin/Sistema.tsx` shows "Ano lectivo activo" based solely on `isOnboardingCompleteFor()`. So the institution flips to "Ano Letivo" before the other groups (RH, Finanças, GAP, Académica, etc.) are configured.

**Fix**
- Add `isFullOnboardingComplete(email)` in `src/lib/onboardingStorage.ts` (or in `OnboardingStepBanner.tsx` next to `readOnboardingProgress`) that returns true only when **every** `step.key` in `ONBOARDING_GROUPS` is marked done in the progress blob.
- In `src/pages/admin/Onboarding.tsx::activate()`, do **not** set `completed: true`. Keep the institution data save and navigate to `/admin`. Remove the "instituição está ativa" success screen (or relabel it to "Registo concluído — continue o onboarding no painel").
- In `src/pages/admin/Sistema.tsx`, replace `isOnboardingCompleteFor` with the new full check so the badge reads "Em onboarding" until all groups are 100%.
- Audit other call sites of `isOnboardingCompleteFor` (`src/pages/Login.tsx` post-login redirect, any module gating) — keep the cheap check for "did the admin even register the institution?" (rename to `isInstitutionRegisteredFor`) and use `isFullOnboardingComplete` only where we mean "ano letivo ativo".

## 3. Candidaturas tab → Configurar (admin sidebar)

In `src/components/AppSidebar.tsx` (admin section, lines 246–267):
- Remove the `Operações > Candidaturas` entry pointing to `/admin/candidaturas` (data view belongs to GAP).
- Add a `Configurar > Candidaturas` entry pointing to `/gap/configuracao?tab=candidaturas` (configuration only).
- Drop the now-empty `Operações` group.

## 4. Remove "Ver contas e palavras-passe" from Login

In `src/pages/Login.tsx`:
- Delete the `credsOpen/creds/revealed` state, the `loadDevCreds/removeDevCred` imports, the `KeyRound` button + Dialog block (around line 301), and any unused imports.
- Leave `saveDevCred` calls in `Login.tsx` signup and `admin/Utilizadores.tsx` alone for now (not user-visible); we can purge `src/lib/devCreds.ts` later if you want.

## Files touched
- `src/contexts/AuthContext.tsx`
- `src/pages/Login.tsx`
- `src/pages/admin/Onboarding.tsx`
- `src/pages/admin/Sistema.tsx`
- `src/lib/onboardingStorage.ts` (+ maybe `src/components/admin/OnboardingStepBanner.tsx`)
- `src/components/AppSidebar.tsx`

No DB migrations needed.

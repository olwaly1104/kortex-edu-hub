# Fix "create user with module" failure

## Problem

When you create a new account from **Admin → Utilizadores** picking a módulo (estudante, professor, finanças, etc.) the edge function `admin-create-user` returns an error and the account is never created.

Edge-function logs are empty (no successful invocations), which points to the auth-validation step inside the function failing before any work happens.

The current function uses `userClient.auth.getClaims(token)` to verify the caller. That call has been unreliable in the Lovable Cloud runtime (depends on `SUPABASE_JWKS` resolving correctly and on the exact supabase-js build) and silently rejects valid admin sessions, returning `401 Unauthorized` to the dialog — which the UI surfaces as the generic "edge whatever" error you saw.

The modules list itself is already correct: all 10 roles (admin, estudante, professor, coordenador, decano, reitor, financas, academica, gap, inscricoes) are wired in both the UI dropdown and the edge function's allow-list, with **no mock/seed users** — only the real admin session is shown until accounts are created.

## Fix

Rewrite the auth-validation block in `supabase/functions/admin-create-user/index.ts` to the standard, reliable pattern used elsewhere in the project:

1. Build the `userClient` with the incoming `Authorization` header (as today).
2. Call `userClient.auth.getUser()` — this re-validates the JWT against the Auth server and returns the user, instead of relying on local JWKS verification.
3. If `getUser()` fails, return `401` with the real error message so the dialog shows a useful reason instead of a generic failure.
4. Keep the rest of the flow unchanged: verify the caller has the `admin` role, then `admin.auth.admin.createUser`, upsert the `profiles` row with `must_change_password = true` and `institution_id = callerId`, and insert into `user_roles` with the chosen `modulo`.
5. Add `console.log` checkpoints (caller id, target email, target role) and surface `roleErr.message` to the client when the role insert fails, so future failures are debuggable from the edge-function logs.

Also tighten the frontend (`src/pages/admin/Utilizadores.tsx`) to surface any non-2xx HTTP body from `functions.invoke` instead of swallowing it — so the dialog shows the actual server message.

## No data/mock changes

- The 10 modules stay exactly as they are in the dropdown.
- No seed/mock users are added anywhere.
- Existing Utilizadores list continues to start empty except for the signed-in admin row.

## Files touched

- `supabase/functions/admin-create-user/index.ts` — swap `getClaims` → `getUser`, add logging, return real error messages.
- `src/pages/admin/Utilizadores.tsx` — show real server error text in the dialog.

## Out of scope

- No DB schema changes (the `app_role` enum already contains every módulo).
- No changes to onboarding progression or Finanças configuration screens.

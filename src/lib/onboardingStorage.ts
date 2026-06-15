// Per-account onboarding/profile storage helpers.
// Avoids leaking onboarding-completed flag across different admin accounts
// signed in on the same browser.
//
// Backend sync: all three blobs (onboarding, profile, progress) are mirrored
// to `public.admin_state` so the data follows the user across devices and
// browsers. localStorage stays as a synchronous cache so existing code keeps
// working unchanged.

import { supabase } from "@/integrations/supabase/client";

const ONBOARDING_BASE = "upra.admin.onboarding";
const PROFILE_BASE = "upra.admin.perfil";
const CONFIG_PROGRESS_BASE = "upra.admin.config.progress";

function suffix(email?: string | null) {
  const e = (email || "").trim().toLowerCase();
  return e ? `:${e}` : "";
}

export function onboardingKey(email?: string | null) {
  return `${ONBOARDING_BASE}${suffix(email)}`;
}

export function profileKey(email?: string | null) {
  return `${PROFILE_BASE}${suffix(email)}`;
}

export function progressKey(email?: string | null) {
  return `${CONFIG_PROGRESS_BASE}${suffix(email)}`;
}

export function isOnboardingCompleteFor(email?: string | null): boolean {
  try {
    const raw = localStorage.getItem(onboardingKey(email)) || localStorage.getItem(ONBOARDING_BASE);
    if (!raw) return false;
    return !!JSON.parse(raw)?.completed;
  } catch {
    return false;
  }
}

export function readOnboardingStateFor<T extends object>(fallback: T, email?: string | null): T {
  try {
    const accountRaw = localStorage.getItem(onboardingKey(email));
    if (accountRaw) return { ...fallback, ...JSON.parse(accountRaw) };
    const legacyRaw = localStorage.getItem(ONBOARDING_BASE);
    if (legacyRaw) return { ...fallback, ...JSON.parse(legacyRaw) };
  } catch { /* ignore */ }
  return fallback;
}

// ---------- Backend sync ----------

type Field = "onboarding" | "profile" | "progress";

async function getUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

const pending: Partial<Record<Field, any>> = {};
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(async () => {
    flushTimer = null;
    const patch = { ...pending };
    Object.keys(pending).forEach((k) => delete (pending as any)[k]);
    if (Object.keys(patch).length === 0) return;
    const uid = await getUserId();
    if (!uid) return;
    try {
      await (supabase.from("admin_state" as any) as any).upsert(
        { user_id: uid, ...patch },
        { onConflict: "user_id" }
      );
    } catch (e) {
      console.warn("admin_state upsert failed:", e);
    }
  }, 400);
}

function queuePush(field: Field, value: any) {
  pending[field] = value;
  scheduleFlush();
}

export function pushOnboarding(_email: string | null | undefined, value: any) {
  queuePush("onboarding", value);
}
export function pushProfile(_email: string | null | undefined, value: any) {
  queuePush("profile", value);
}
export function pushProgress(_email: string | null | undefined, value: any) {
  queuePush("progress", value);
}

/** Pull the user's admin_state row from the backend and seed it into
 *  localStorage under the per-account keys. Backend wins on conflict —
 *  it is the source of truth across browsers/devices. Returns true when
 *  hydration completed (even with no row), false on error. */
export async function hydrateAdminStateFromBackend(email: string | null | undefined): Promise<boolean> {
  const uid = await getUserId();
  if (!uid) return false;
  try {
    const { data, error } = await (supabase.from("admin_state" as any) as any)
      .select("onboarding, profile, progress")
      .eq("user_id", uid)
      .maybeSingle();
    if (error) {
      console.warn("admin_state fetch failed:", error.message);
      return false;
    }
    if (data) {
      if (data.onboarding) {
        try { localStorage.setItem(onboardingKey(email), JSON.stringify(data.onboarding)); } catch {}
      }
      if (data.profile) {
        try { localStorage.setItem(profileKey(email), JSON.stringify(data.profile)); } catch {}
      }
      if (data.progress) {
        try { localStorage.setItem(progressKey(email), JSON.stringify(data.progress)); } catch {}
      }
    } else {
      // First time on this account from the backend's POV — push whatever is
      // already in localStorage so the user doesn't lose pre-existing work.
      const localOnboarding = safeRead(onboardingKey(email));
      const localProfile = safeRead(profileKey(email));
      const localProgress = safeRead(progressKey(email));
      if (localOnboarding || localProfile || localProgress) {
        try {
          await (supabase.from("admin_state" as any) as any).upsert(
            {
              user_id: uid,
              onboarding: localOnboarding,
              profile: localProfile,
              progress: localProgress,
            },
            { onConflict: "user_id" }
          );
        } catch (e) {
          console.warn("admin_state seed failed:", e);
        }
      }
    }
    return true;
  } catch (e) {
    console.warn("admin_state hydrate failed:", e);
    return false;
  }
}

function safeRead(k: string): any {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; }
}

/** Clear backend admin_state for the current user (used by "reset onboarding"). */
export async function clearAdminStateBackend() {
  const uid = await getUserId();
  if (!uid) return;
  try {
    await (supabase.from("admin_state" as any) as any).delete().eq("user_id", uid);
  } catch (e) {
    console.warn("admin_state clear failed:", e);
  }
}

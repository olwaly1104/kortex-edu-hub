// Per-account onboarding/profile storage helpers.
// Avoids leaking onboarding-completed flag across different admin accounts
// signed in on the same browser.

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

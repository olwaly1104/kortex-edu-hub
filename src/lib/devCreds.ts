// Dev-only credentials log (localStorage). Lets the institution admin recall
// the passwords typed when creating accounts. Browser-local; never synced.
const KEY = "kortex.dev.creds.v1";

export type DevCred = {
  email: string;
  password: string;
  modulo: string; // 'admin' | 'estudante' | 'professor' | ...
  name?: string;
  createdAt: number;
};

export function loadDevCreds(): DevCred[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDevCred(c: Omit<DevCred, "createdAt">) {
  try {
    const list = loadDevCreds();
    const email = c.email.trim().toLowerCase();
    const filtered = list.filter((x) => x.email.toLowerCase() !== email);
    filtered.push({ ...c, email, createdAt: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(filtered));
  } catch { /* ignore */ }
}

export function removeDevCred(email: string) {
  try {
    const list = loadDevCreds().filter((x) => x.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

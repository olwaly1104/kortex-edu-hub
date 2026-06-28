// Plaintext credential storage was removed for security reasons.
// These no-op stubs remain only to avoid breaking lingering imports.
export type DevCred = { email: string; password: string; modulo: string; name?: string; createdAt: number };
export function loadDevCreds(): DevCred[] { return []; }
export function saveDevCred(_c: Omit<DevCred, "createdAt">) { /* removed */ }
export function removeDevCred(_email: string) { /* removed */ }

// Institutional staff & docentes storage.
// Backed by Supabase (real database) with a localStorage cache so that
// existing synchronous consumers keep working. Call `syncDocentesFromDb()`
// / `syncStaffFromDb()` from page mounts to refresh the cache before
// reading. `saveDocentes` / `saveStaff` mirror the change to Supabase
// (upsert + delete-missing) in the background.

import { supabase } from "@/integrations/supabase/client";

export type StaffRow = {
  id: string;
  prefixo: string;
  primeiroNome: string;
  ultimoNome: string;
  email: string;
  contacto: string;
  departamento: string;
  funcao: string;
  moduloKortex: string;
  editing?: boolean;
};

export type Grau = "Licenciatura" | "Mestrado" | "Doutoramento" | "Agregação";

export type DocenteRow = {
  id: string;
  prefixo: string;
  primeiroNome: string;
  ultimoNome: string;
  email: string;
  contacto: string;
  faculdade: string;
  departamento?: string;
  categoria: string;
  cargo: string;
  nascimento?: string;
  genero?: "M" | "F" | "Outro";
  bilhete?: string;
  bilheteFileName?: string;
  fotoDataUrl?: string;
  provincia?: string;
  municipio?: string;
  endereco?: string;
  contrato?: "Permanente" | "Prestador";
  grau?: Grau;
  especialidade?: string;
  instituicaoFormacao?: string;
  anosExperiencia?: string;
  cvFileName?: string;
  diplomaFileName?: string;
  moduloKortex?: string;
  editing?: boolean;
};

export const DEPARTAMENTOS_POOL = [
  "Académica",
  "Finanças",
  "GAP",
  "TI",
  "Recursos Humanos",
  "Manutenção",
  "Biblioteca",
  "Investigação",
];

const STAFF_KEY = "upra_admin_staff_v1";
const DOCENTES_KEY = "upra_admin_docentes_v1";

const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

/* ---------------- sync (cache) readers ---------------- */

export const loadStaff = (): StaffRow[] => {
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    return raw ? (JSON.parse(raw) as StaffRow[]) : [];
  } catch { return []; }
};

export const loadDocentes = (): DocenteRow[] => {
  try {
    const raw = localStorage.getItem(DOCENTES_KEY);
    return raw ? (JSON.parse(raw) as DocenteRow[]) : [];
  } catch { return []; }
};

/* ---------------- mappers ---------------- */

const docenteToDb = (r: DocenteRow, owner: string) => ({
  id: isUuid(r.id) ? r.id : crypto.randomUUID(),
  owner_user_id: owner,
  prefixo: r.prefixo || null,
  primeiro_nome: r.primeiroNome,
  ultimo_nome: r.ultimoNome,
  email: r.email || null,
  contacto: r.contacto || null,
  faculdade: r.faculdade || null,
  departamento: r.departamento || null,
  categoria: r.categoria || null,
  cargo: r.cargo || null,
  nascimento: r.nascimento || null,
  genero: r.genero || null,
  bilhete: r.bilhete || null,
  bilhete_file_name: r.bilheteFileName || null,
  foto_data_url: r.fotoDataUrl || null,
  provincia: r.provincia || null,
  municipio: r.municipio || null,
  endereco: r.endereco || null,
  contrato: r.contrato || null,
  grau: r.grau || null,
  especialidade: r.especialidade || null,
  instituicao_formacao: r.instituicaoFormacao || null,
  anos_experiencia: r.anosExperiencia || null,
  cv_file_name: r.cvFileName || null,
  diploma_file_name: r.diplomaFileName || null,
  modulo_kortex: r.moduloKortex || null,
});

const docenteFromDb = (r: any): DocenteRow => ({
  id: r.id,
  prefixo: r.prefixo || "",
  primeiroNome: r.primeiro_nome || "",
  ultimoNome: r.ultimo_nome || "",
  email: r.email || "",
  contacto: r.contacto || "",
  faculdade: r.faculdade || "",
  departamento: r.departamento || "",
  categoria: r.categoria || "",
  cargo: r.cargo || "",
  nascimento: r.nascimento || "",
  genero: (r.genero as any) || undefined,
  bilhete: r.bilhete || "",
  bilheteFileName: r.bilhete_file_name || "",
  fotoDataUrl: r.foto_data_url || "",
  provincia: r.provincia || "",
  municipio: r.municipio || "",
  endereco: r.endereco || "",
  contrato: (r.contrato as any) || undefined,
  grau: (r.grau as Grau) || undefined,
  especialidade: r.especialidade || "",
  instituicaoFormacao: r.instituicao_formacao || "",
  anosExperiencia: r.anos_experiencia || "",
  cvFileName: r.cv_file_name || "",
  diplomaFileName: r.diploma_file_name || "",
  moduloKortex: r.modulo_kortex || "",
});

const staffToDb = (r: StaffRow, owner: string) => ({
  id: isUuid(r.id) ? r.id : crypto.randomUUID(),
  owner_user_id: owner,
  prefixo: r.prefixo || null,
  primeiro_nome: r.primeiroNome,
  ultimo_nome: r.ultimoNome,
  email: r.email || null,
  contacto: r.contacto || null,
  departamento: r.departamento || null,
  funcao: r.funcao || null,
  modulo_kortex: r.moduloKortex || null,
});

const staffFromDb = (r: any): StaffRow => ({
  id: r.id,
  prefixo: r.prefixo || "",
  primeiroNome: r.primeiro_nome || "",
  ultimoNome: r.ultimo_nome || "",
  email: r.email || "",
  contacto: r.contacto || "",
  departamento: r.departamento || "",
  funcao: r.funcao || "",
  moduloKortex: r.modulo_kortex || "",
});

/* ---------------- DB sync (pull) ---------------- */

export const syncDocentesFromDb = async (): Promise<DocenteRow[]> => {
  try {
    const { data, error } = await supabase.from("docentes").select("*").order("created_at", { ascending: true });
    if (error) throw error;
    const rows = (data || []).map(docenteFromDb);
    try { localStorage.setItem(DOCENTES_KEY, JSON.stringify(rows)); } catch {/* noop */}
    try { window.dispatchEvent(new CustomEvent("upra:people-changed", { detail: { kind: "docentes" } })); } catch {/* noop */}
    return rows;
  } catch {
    return loadDocentes();
  }
};

export const syncStaffFromDb = async (): Promise<StaffRow[]> => {
  try {
    const { data, error } = await supabase.from("staff").select("*").order("created_at", { ascending: true });
    if (error) throw error;
    const rows = (data || []).map(staffFromDb);
    try { localStorage.setItem(STAFF_KEY, JSON.stringify(rows)); } catch {/* noop */}
    try { window.dispatchEvent(new CustomEvent("upra:people-changed", { detail: { kind: "staff" } })); } catch {/* noop */}
    return rows;
  } catch {
    return loadStaff();
  }
};

/* ---------------- save (cache + DB mirror) ---------------- */

const writeCache = (key: string, rows: any[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(rows.map(({ editing: _e, ...r }) => r)));
  } catch {/* noop */}
};

const mirrorDocentes = async (rows: DocenteRow[]) => {
  const { data: auth } = await supabase.auth.getUser();
  const owner = auth.user?.id;
  if (!owner) return;

  const payload = rows.map((r) => docenteToDb(r, owner));
  // assign back the (possibly new) uuid so id stays stable in cache
  rows.forEach((r, i) => { r.id = payload[i].id; });
  writeCache(DOCENTES_KEY, rows);

  // Fetch current owned ids and delete any not in the new list
  const { data: existing } = await supabase
    .from("docentes")
    .select("id")
    .eq("owner_user_id", owner);
  const keepIds = new Set(payload.map((p) => p.id));
  const toDelete = (existing || []).filter((e: any) => !keepIds.has(e.id)).map((e: any) => e.id);

  if (payload.length > 0) {
    await supabase.from("docentes").upsert(payload, { onConflict: "id" });
  }
  if (toDelete.length > 0) {
    await supabase.from("docentes").delete().in("id", toDelete);
  }
};

const mirrorStaff = async (rows: StaffRow[]) => {
  const { data: auth } = await supabase.auth.getUser();
  const owner = auth.user?.id;
  if (!owner) return;

  const payload = rows.map((r) => staffToDb(r, owner));
  rows.forEach((r, i) => { r.id = payload[i].id; });
  writeCache(STAFF_KEY, rows);

  const { data: existing } = await supabase
    .from("staff")
    .select("id")
    .eq("owner_user_id", owner);
  const keepIds = new Set(payload.map((p) => p.id));
  const toDelete = (existing || []).filter((e: any) => !keepIds.has(e.id)).map((e: any) => e.id);

  if (payload.length > 0) {
    await supabase.from("staff").upsert(payload, { onConflict: "id" });
  }
  if (toDelete.length > 0) {
    await supabase.from("staff").delete().in("id", toDelete);
  }
};

export const saveStaff = (rows: StaffRow[]) => {
  writeCache(STAFF_KEY, rows);
  mirrorStaff(rows).catch((e) => console.warn("staff mirror failed:", e?.message));
  try { window.dispatchEvent(new CustomEvent("upra:people-changed", { detail: { kind: "staff" } })); } catch {/* noop */}
};

export const saveDocentes = (rows: DocenteRow[]) => {
  writeCache(DOCENTES_KEY, rows);
  mirrorDocentes(rows).catch((e) => console.warn("docentes mirror failed:", e?.message));
  try { window.dispatchEvent(new CustomEvent("upra:people-changed", { detail: { kind: "docentes" } })); } catch {/* noop */}
};

export const fullName = (p: { prefixo?: string; primeiroNome: string; ultimoNome: string }) =>
  `${p.prefixo ? p.prefixo + " " : ""}${p.primeiroNome} ${p.ultimoNome}`.trim();

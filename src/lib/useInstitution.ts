// Single source of truth for institutional Faculdades / Cursos / Propinas.
// Backed by the public.faculdades / public.cursos / public.propinas tables.
// Every admin tab that touches these reads/writes through this hook so data
// stays in sync across the sidebar (Faculdades & Cursos) and Finanças
// (Configurar Receitas → Propinas por Curso).

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { provisionKortexUser } from "@/lib/accountProvisioning";

export type FaculdadeRow = {
  id: string;
  owner_user_id: string;
  name: string;
  sigla: string | null;
  decano: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
};


export type CursoRow = {
  id: string;
  faculdade_id: string;
  owner_user_id: string;
  name: string;
  code: string;
  years: number;
  estudantes_esperados: number;
  coordenador: string | null;
  created_at: string;
  updated_at: string;
};

export type PropinaRow = {
  id: string;
  curso_id: string;
  owner_user_id: string;
  valor_mensal: number;
  imposto: number;
  created_at: string;
  updated_at: string;
};

export type CadeiraRow = {
  id: string;
  curso_id: string;
  owner_user_id: string;
  ano: number;
  name: string;
  docente: string | null;
  ects: number;
  semestre: string; // '1' | '2' | 'anual'
  ordem: number;
  created_at: string;
  updated_at: string;
};

export type EstudanteRow = {
  id: string;
  owner_user_id: string;
  curso_id: string;
  nome: string;
  email: string;
  ano: string;
  turma: string;
  origem: string;
  primeiro_nome: string | null;
  ultimo_nome: string | null;
  nascimento: string | null;
  genero: string | null;
  nacionalidade: string | null;
  bilhete: string | null;
  telemovel: string | null;
  provincia: string | null;
  municipio: string | null;
  endereco: string | null;
  enc_nome: string | null;
  enc_parentesco: string | null;
  enc_telefone: string | null;
  foto_url: string | null;
  bilhete_url: string | null;
  certificado_url: string | null;
  enc_bilhete_url: string | null;
  created_at: string;
  updated_at: string;
};

const KEY_FAC = ["institution", "faculdades"] as const;
const KEY_CUR = ["institution", "cursos"] as const;
const KEY_PROP = ["institution", "propinas"] as const;
const KEY_CAD = ["institution", "cadeiras"] as const;
const KEY_EST = ["institution", "estudantes"] as const;

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function currentInstitutionId(): Promise<string | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data } = await (supabase.from("profiles" as any) as any)
    .select("institution_id")
    .eq("id", uid)
    .maybeSingle();
  return (data?.institution_id as string) || uid;
}

// ---------- Queries ----------

export function useFaculdades() {
  return useQuery({
    queryKey: KEY_FAC,
    queryFn: async (): Promise<FaculdadeRow[]> => {
      const { data, error } = await (supabase.from("faculdades" as any) as any)
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as FaculdadeRow[];
    },
  });
}

export function useCursos() {
  return useQuery({
    queryKey: KEY_CUR,
    queryFn: async (): Promise<CursoRow[]> => {
      const { data, error } = await (supabase.from("cursos" as any) as any)
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CursoRow[];
    },
  });
}

export function usePropinas() {
  return useQuery({
    queryKey: KEY_PROP,
    queryFn: async (): Promise<PropinaRow[]> => {
      const { data, error } = await (supabase.from("propinas" as any) as any)
        .select("*");
      if (error) throw error;
      return (data ?? []) as PropinaRow[];
    },
  });
}

// ---------- Mutations ----------

export function useCreateFaculdade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; sigla?: string | null; decano?: string | null; color?: string | null }) => {
      const uid = await currentUserId();
      if (!uid) throw new Error("Sessão expirada.");
      const { data, error } = await (supabase.from("faculdades" as any) as any)
        .insert({
          owner_user_id: uid,
          name: input.name.trim(),
          sigla: input.sigla?.trim() || null,
          decano: input.decano?.trim() || null,
          color: input.color?.trim() || "#475569",
        })
        .select()
        .single();
      if (error) throw error;
      return data as FaculdadeRow;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY_FAC }); },
  });
}


export function useUpdateFaculdade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; patch: Partial<Pick<FaculdadeRow, "name" | "sigla" | "decano" | "color">> }) => {
      const { error } = await (supabase.from("faculdades" as any) as any)
        .update(input.patch)
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY_FAC }); },
  });
}

export function useDeleteFaculdade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("faculdades" as any) as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_FAC });
      qc.invalidateQueries({ queryKey: KEY_CUR });
      qc.invalidateQueries({ queryKey: KEY_PROP });
    },
  });
}

export function useCreateCurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      faculdade_id: string;
      name: string;
      code: string;
      years?: number;
      estudantes_esperados?: number;
      coordenador?: string | null;
    }) => {
      const uid = await currentUserId();
      if (!uid) throw new Error("Sessão expirada.");
      const { data, error } = await (supabase.from("cursos" as any) as any)
        .insert({
          owner_user_id: uid,
          faculdade_id: input.faculdade_id,
          name: input.name.trim(),
          code: input.code.trim().toUpperCase(),
          years: input.years || 4,
          estudantes_esperados: input.estudantes_esperados || 0,
          coordenador: input.coordenador?.trim() || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as CursoRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_CUR });
      // Propina is auto-created by DB trigger.
      qc.invalidateQueries({ queryKey: KEY_PROP });
    },
  });
}

export function useUpdateCurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; patch: Partial<Pick<CursoRow, "name" | "code" | "years" | "estudantes_esperados" | "coordenador">> }) => {
      const { error } = await (supabase.from("cursos" as any) as any)
        .update(input.patch)
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY_CUR }); },
  });
}

export function useDeleteCurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("cursos" as any) as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_CUR });
      qc.invalidateQueries({ queryKey: KEY_PROP });
    },
  });
}

export function useUpdatePropina() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { curso_id: string; valor_mensal?: number; imposto?: number }) => {
      const patch: Record<string, number> = {};
      if (input.valor_mensal !== undefined) patch.valor_mensal = input.valor_mensal;
      if (input.imposto !== undefined) patch.imposto = input.imposto;
      const { error } = await (supabase.from("propinas" as any) as any)
        .update(patch)
        .eq("curso_id", input.curso_id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY_PROP }); },
  });
}

// ---------- Cadeiras ----------

export function useCadeiras() {
  return useQuery({
    queryKey: KEY_CAD,
    queryFn: async (): Promise<CadeiraRow[]> => {
      const { data, error } = await (supabase.from("cadeiras" as any) as any)
        .select("*")
        .order("ano", { ascending: true })
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CadeiraRow[];
    },
  });
}

export function useCreateCadeira() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      curso_id: string;
      ano: number;
      name: string;
      docente?: string | null;
      ects?: number;
      semestre?: string;
      ordem?: number;
    }) => {
      const uid = await currentUserId();
      if (!uid) throw new Error("Sessão expirada.");
      const { data, error } = await (supabase.from("cadeiras" as any) as any)
        .insert({
          owner_user_id: uid,
          curso_id: input.curso_id,
          ano: input.ano,
          name: input.name.trim() || "Nova Cadeira",
          docente: input.docente?.trim() || null,
          ects: input.ects ?? 6,
          semestre: input.semestre ?? "1",
          ordem: input.ordem ?? 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data as CadeiraRow;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY_CAD }); },
  });
}

export function useUpdateCadeira() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; patch: Partial<Pick<CadeiraRow, "name" | "docente" | "ects" | "semestre" | "ano" | "ordem">> }) => {
      const { error } = await (supabase.from("cadeiras" as any) as any)
        .update(input.patch)
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY_CAD }); },
  });
}

export function useDeleteCadeira() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("cadeiras" as any) as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY_CAD }); },
  });
}

// ---------- Estudantes ----------

export function useEstudantes() {
  return useQuery({
    queryKey: KEY_EST,
    queryFn: async (): Promise<EstudanteRow[]> => {
      const { data, error } = await (supabase.from("estudantes" as any) as any)
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EstudanteRow[];
    },
  });
}

export type EstudanteInput = {
  curso_id: string;
  nome: string;
  email: string;
  ano?: string;
  turma?: string;
  origem?: string;
  primeiro_nome?: string | null;
  ultimo_nome?: string | null;
  nascimento?: string | null;
  genero?: string | null;
  nacionalidade?: string | null;
  bilhete?: string | null;
  telemovel?: string | null;
  provincia?: string | null;
  municipio?: string | null;
  endereco?: string | null;
  enc_nome?: string | null;
  enc_parentesco?: string | null;
  enc_telefone?: string | null;
  foto_url?: string | null;
  bilhete_url?: string | null;
  certificado_url?: string | null;
  enc_bilhete_url?: string | null;
  regime?: "bolseiro" | "normal";
};

async function provisionStudentAccount(name: string, email: string, estudante: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("admin-create-user", {
    body: {
      name,
      email,
      password: `Aluno@${Math.random().toString(36).slice(2, 8)}`,
      modulo: "estudante",
      estudante,
    },
  });
  const serverError = (data && typeof data === "object" && "error" in data) ? (data as any).error : null;
  if (error || serverError) throw new Error(String(serverError || error?.message || "Falha ao criar utilizador."));
  const user = (data as any)?.user as { id: string } | undefined;
  if (!user?.id) throw new Error("Resposta inesperada do servidor.");
  return user;
}

export function useCreateEstudante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: EstudanteInput) => {
      const inst = await currentInstitutionId();
      if (!inst) throw new Error("Sessão expirada.");
      const account = await provisionStudentAccount(input.nome, input.email, {
        ...input,
        ano: input.ano || "1",
        turma: input.turma || "A",
        origem: input.origem || "novo",
      });
      const { data, error } = await (supabase.from("estudantes" as any) as any)
        .select("*")
        .eq("id", account.id)
        .single();
      if (error) throw error;
      return data as EstudanteRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_EST });
      qc.invalidateQueries({ queryKey: ["institution-contacts"] });
    },
  });
}

export function useBulkCreateEstudantes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inputs: EstudanteInput[]) => {
      const inst = await currentInstitutionId();
      if (!inst) throw new Error("Sessão expirada.");
      if (inputs.length === 0) return [];
      const accounts = await Promise.all(
        inputs.map((i) => provisionStudentAccount(i.nome, i.email, {
          ...i,
          ano: i.ano || "1",
          turma: i.turma || "A",
          origem: i.origem || "importado",
        }))
      );
      const ids = accounts.map((a) => a.id);
      const { data, error } = await (supabase.from("estudantes" as any) as any)
        .select("*")
        .in("id", ids);
      if (error) throw error;
      return (data ?? []) as EstudanteRow[];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_EST });
      qc.invalidateQueries({ queryKey: ["institution-contacts"] });
    },
  });
}

export function useDeleteEstudante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("estudantes" as any) as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY_EST }); },
  });
}

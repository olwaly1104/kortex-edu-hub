// Single source of truth for institutional Faculdades / Cursos / Propinas.
// Backed by the public.faculdades / public.cursos / public.propinas tables.
// Every admin tab that touches these reads/writes through this hook so data
// stays in sync across the sidebar (Faculdades & Cursos) and Finanças
// (Configurar Receitas → Propinas por Curso).

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FaculdadeRow = {
  id: string;
  owner_user_id: string;
  name: string;
  decano: string | null;
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

const KEY_FAC = ["institution", "faculdades"] as const;
const KEY_CUR = ["institution", "cursos"] as const;
const KEY_PROP = ["institution", "propinas"] as const;

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
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
    mutationFn: async (input: { name: string; decano?: string | null }) => {
      const uid = await currentUserId();
      if (!uid) throw new Error("Sessão expirada.");
      const { data, error } = await (supabase.from("faculdades" as any) as any)
        .insert({
          owner_user_id: uid,
          name: input.name.trim(),
          decano: input.decano?.trim() || null,
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
    mutationFn: async (input: { id: string; patch: Partial<Pick<FaculdadeRow, "name" | "decano">> }) => {
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

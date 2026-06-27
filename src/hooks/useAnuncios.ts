import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Anuncio {
  id: string;
  title: string;
  content: string;
  type: string;
  author: string | null;
  owner_user_id: string;
  created_at: string;
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function formatAnuncioDate(iso: string) {
  return fmtDate(iso);
}
export function formatAnuncioTime(iso: string) {
  return fmtTime(iso);
}

export function useAnuncios() {
  const [items, setItems] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("anuncios")
      .select("id, title, content, type, author, owner_user_id, created_at")
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data as Anuncio[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null));
    refresh();
    const ch = supabase
      .channel("anuncios-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "anuncios" }, () => refresh())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [refresh]);

  const create = useCallback(async (input: { title: string; content: string; type: string }) => {
    const { data: u } = await supabase.auth.getUser();
    const userId = u.user?.id;
    if (!userId) throw new Error("Not authenticated");
    const { error } = await supabase.from("anuncios").insert({
      title: input.title.trim(),
      content: input.content.trim(),
      type: input.type,
      owner_user_id: userId,
    } as never);
    if (error) throw error;
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from("anuncios").delete().eq("id", id);
    if (error) throw error;
    await refresh();
  }, [refresh]);

  return { items, loading, uid, create, remove, refresh };
}

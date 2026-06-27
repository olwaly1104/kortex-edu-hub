import { useCallback, useEffect, useState } from "react";
import { useAnuncios } from "@/hooks/useAnuncios";

const STORAGE_KEY = "fin.anuncios.read";
const EVENT = "fin-anuncios-read-change";

function loadRead(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveRead(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useFinAnunciosUnread() {
  const { items } = useAnuncios();
  const [readIds, setReadIds] = useState<Set<string>>(() => loadRead());

  useEffect(() => {
    const handler = () => setReadIds(loadRead());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const markRead = useCallback((id: string) => {
    setReadIds(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveRead(next);
      return next;
    });
  }, []);

  const isRead = useCallback((id: string) => readIds.has(id), [readIds]);

  const unreadCount = items.reduce((n, a) => n + (readIds.has(a.id) ? 0 : 1), 0);

  return { unreadCount, isRead, markRead };
}

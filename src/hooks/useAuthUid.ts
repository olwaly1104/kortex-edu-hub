import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Returns the real Supabase auth user UUID (not the mock app user id). */
export function useAuthUid() {
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setUid(data.session?.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUid(session?.user?.id ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return uid;
}

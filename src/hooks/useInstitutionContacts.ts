import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface InstitutionContact {
  id: string;
  display_name: string;
  email: string | null;
  modulo: string | null;
}

export function useInstitutionContacts() {
  const [contacts, setContacts] = useState<InstitutionContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await (supabase as any).rpc("list_institution_contacts");
      if (cancelled) return;
      if (error) setError(error.message);
      else setContacts((data as InstitutionContact[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { contacts, loading, error };
}

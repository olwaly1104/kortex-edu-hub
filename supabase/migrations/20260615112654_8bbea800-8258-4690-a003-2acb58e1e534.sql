CREATE TABLE public.admin_state (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding JSONB,
  profile JSONB,
  progress JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_state TO authenticated;
GRANT ALL ON public.admin_state TO service_role;

ALTER TABLE public.admin_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own admin state"
  ON public.admin_state FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_admin_state_updated_at
  BEFORE UPDATE ON public.admin_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
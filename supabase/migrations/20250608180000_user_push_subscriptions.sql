-- Web Push előfizetések (ha még nincs létrehozva)
CREATE TABLE IF NOT EXISTS public.user_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS user_push_subscriptions_user_id_idx
  ON public.user_push_subscriptions (user_id);

ALTER TABLE public.user_push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_subscriptions_select_own" ON public.user_push_subscriptions;
CREATE POLICY "push_subscriptions_select_own"
  ON public.user_push_subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "push_subscriptions_insert_own" ON public.user_push_subscriptions;
CREATE POLICY "push_subscriptions_insert_own"
  ON public.user_push_subscriptions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "push_subscriptions_update_own" ON public.user_push_subscriptions;
CREATE POLICY "push_subscriptions_update_own"
  ON public.user_push_subscriptions FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "push_subscriptions_delete_own" ON public.user_push_subscriptions;
CREATE POLICY "push_subscriptions_delete_own"
  ON public.user_push_subscriptions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

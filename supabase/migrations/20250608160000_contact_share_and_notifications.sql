-- Kapcsolatmegosztás javítás, határidő mező, értesítési nyomon követés

-- =============================================================================
-- 1. jobs – kívánt elvégzési idő
-- =============================================================================

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS required_completion_time TEXT;

-- =============================================================================
-- 2. job_bids – megtekintés / kapcsolatmegosztás időbélyegek
-- =============================================================================

ALTER TABLE public.job_bids
  ADD COLUMN IF NOT EXISTS viewed_by_client_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS contact_shared_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS contact_seen_by_craftsman_at TIMESTAMPTZ;

-- Lakos frissítheti saját munkájához tartozó pályázatokat (pl. contact_shared)
DROP POLICY IF EXISTS "job_bids_update_client" ON public.job_bids;
CREATE POLICY "job_bids_update_client"
  ON public.job_bids FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_bids.job_id AND j.client_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_bids.job_id AND j.client_id = auth.uid()
    )
  );

-- =============================================================================
-- 3. conversations – csak a lakos hozhat létre beszélgetést
-- =============================================================================

DROP POLICY IF EXISTS "conversations_insert_participant" ON public.conversations;
DROP POLICY IF EXISTS "conversations_insert_client" ON public.conversations;
CREATE POLICY "conversations_insert_client"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "conversations_update_participant" ON public.conversations;
CREATE POLICY "conversations_update_participant"
  ON public.conversations FOR UPDATE TO authenticated
  USING (client_id = auth.uid() OR craftsman_id = auth.uid());

-- =============================================================================
-- 4. conversation_reads – olvasatlan üzenetek számlálása
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.conversation_reads (
  conversation_id UUID NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS conversation_reads_user_id_idx
  ON public.conversation_reads (user_id);

ALTER TABLE public.conversation_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversation_reads_select_own" ON public.conversation_reads;
CREATE POLICY "conversation_reads_select_own"
  ON public.conversation_reads FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "conversation_reads_upsert_own" ON public.conversation_reads;
CREATE POLICY "conversation_reads_insert_own"
  ON public.conversation_reads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "conversation_reads_update_own" ON public.conversation_reads;
CREATE POLICY "conversation_reads_update_own"
  ON public.conversation_reads FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

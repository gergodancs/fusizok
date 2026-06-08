-- Beszélgetések és üzenetek a fusizó ↔ lakos kommunikációhoz.
-- Futtasd a Supabase SQL Editorban, majd engedélyezd a Realtime-ot a messages táblán:
-- Database → Replication → supabase_realtime → messages

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs (id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  craftsman_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, craftsman_id)
);

CREATE INDEX IF NOT EXISTS conversations_client_id_idx ON public.conversations (client_id);
CREATE INDEX IF NOT EXISTS conversations_craftsman_id_idx ON public.conversations (craftsman_id);
CREATE INDEX IF NOT EXISTS conversations_job_id_idx ON public.conversations (job_id);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(btrim(content)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON public.messages (conversation_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages (created_at);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- conversations: csak a résztvevők láthatják
DROP POLICY IF EXISTS "conversations_select_participant" ON public.conversations;
CREATE POLICY "conversations_select_participant"
  ON public.conversations FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR craftsman_id = auth.uid());

DROP POLICY IF EXISTS "conversations_insert_participant" ON public.conversations;
CREATE POLICY "conversations_insert_participant"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid() OR craftsman_id = auth.uid());

-- messages: résztvevő olvashat/írhat
DROP POLICY IF EXISTS "messages_select_participant" ON public.messages;
CREATE POLICY "messages_select_participant"
  ON public.messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.client_id = auth.uid() OR c.craftsman_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "messages_insert_participant" ON public.messages;
CREATE POLICY "messages_insert_participant"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.client_id = auth.uid() OR c.craftsman_id = auth.uid())
    )
  );

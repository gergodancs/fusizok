export type Conversation = {
  id: string;
  job_id: string;
  client_id: string;
  craftsman_id: string;
  created_at: string;
};

export type ConversationWithDetails = Conversation & {
  job_title: string;
  job_status: string;
  other_party_name: string | null;
  last_message: string | null;
  last_message_at: string | null;
};

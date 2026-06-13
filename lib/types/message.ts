export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_system?: boolean;
  visible_to_role?: "craftsman" | "client" | null;
};

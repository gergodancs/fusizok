"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { markConversationReadAction } from "@/app/actions/notifications";
import { sendMessage, type SendMessageState } from "@/app/actions/messages";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/types/message";
import { btnPrimaryClassName, inputClassName } from "@/lib/ui-classes";

const initialState: SendMessageState = {};

type ChatRoomProps = {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
  canSend?: boolean;
  readOnlyMessage?: string;
};

export function ChatRoom({
  conversationId,
  currentUserId,
  initialMessages,
  canSend = true,
  readOnlyMessage,
}: ChatRoomProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [state, formAction, isPending] = useActionState(
    sendMessage,
    initialState,
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  const markReadAndRefresh = useCallback(async () => {
    const result = await markConversationReadAction(conversationId);
    if (result.ok) {
      router.refresh();
    }
  }, [conversationId, router]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    void markReadAndRefresh();
  }, [markReadAndRefresh]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          void markReadAndRefresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, markReadAndRefresh]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!state.error && !isPending) {
      void markReadAndRefresh();
    }
  }, [state, isPending, markReadAndRefresh]);

  return (
    <div className="flex h-[calc(100vh-14rem)] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900/50 p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">
            Még nincs üzenet. {canSend ? "Írj az elsőt!" : ""}
          </p>
        ) : (
          messages.map((msg) => {
            if (msg.is_system) {
              const isCraftsmanWelcome = msg.visible_to_role === "craftsman";
              return (
                <div key={msg.id} className="flex justify-center">
                  <div
                    className={`max-w-[90%] rounded-xl border px-4 py-3 text-center text-sm ${
                      isCraftsmanWelcome
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                        : "border-zinc-700/80 bg-zinc-800/60 text-zinc-400"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="mt-1 text-[10px] text-zinc-600">
                      {new Date(msg.created_at).toLocaleString("hu-HU", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            }

            const isOwn = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    isOwn
                      ? "bg-amber-500 text-zinc-900"
                      : "bg-zinc-800 text-zinc-100"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p
                    className={`mt-1 text-[10px] ${isOwn ? "text-zinc-800/70" : "text-zinc-500"}`}
                  >
                    {new Date(msg.created_at).toLocaleString("hu-HU", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {canSend ? (
        <form action={formAction} className="mt-4 flex gap-2">
          <input type="hidden" name="conversation_id" value={conversationId} />
          <input
            name="content"
            type="text"
            required
            placeholder="Írj üzenetet…"
            className={`flex-1 ${inputClassName}`}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isPending}
            className={btnPrimaryClassName}
          >
            {isPending ? "…" : "Küldés"}
          </button>
        </form>
      ) : (
        <p className="mt-4 rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-400">
          {readOnlyMessage ??
            "Jelenleg nem küldhetsz üzenetet ebben a beszélgetésben."}
        </p>
      )}

      {state.error && (
        <p className="mt-2 text-sm text-red-400">{state.error}</p>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChatRoom } from "@/components/chat/chat-room";
import { PageContainer } from "@/components/layout/page-container";
import { getAuthContext } from "@/lib/auth/session";
import {
  getConversationHeader,
  getConversationMessages,
} from "@/lib/conversations";
import { markConversationRead } from "@/lib/notifications";
import { pageEyebrowClassName } from "@/lib/ui-classes";

type LakosChatPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LakosChatPage({ params }: LakosChatPageProps) {
  const { id } = await params;
  const { user, profile } = await getAuthContext();

  if (!user) {
    redirect(`/login?redirect=/lakos/uzenetek/${id}`);
  }

  if (profile?.role === "craftsman") {
    redirect(`/szaki/uzenetek/${id}`);
  }

  const header = await getConversationHeader(id, user.id);
  if (!header) {
    notFound();
  }

  const { messages, canAccess } = await getConversationMessages(id, user.id);
  if (!canAccess) {
    notFound();
  }

  await markConversationRead(id, user.id);

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer narrow>
        <div className="mb-6">
          <Link
            href="/lakos/uzenetek"
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            ← Vissza az üzenetekhez
          </Link>
          <p className={`mt-4 ${pageEyebrowClassName}`}>Chat</p>
          <h1 className="mt-1 text-2xl font-black text-zinc-50">
            {header.jobTitle}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{header.otherPartyName}</p>
        </div>

        <ChatRoom
          conversationId={id}
          currentUserId={user.id}
          initialMessages={messages}
        />
      </PageContainer>
    </div>
  );
}

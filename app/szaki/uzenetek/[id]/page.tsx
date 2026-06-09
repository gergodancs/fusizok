import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatRoom } from "@/components/chat/chat-room";
import { PageContainer } from "@/components/layout/page-container";
import { CraftsmanChatUnlock } from "@/components/payments/craftsman-chat-unlock";
import { requireCraftsman } from "@/lib/auth/require-craftsman";
import {
  getConversationHeader,
  getConversationMessages,
} from "@/lib/conversations";
import { getJobStatusLabel } from "@/lib/status-labels";
import { pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Chat – fusizok.hu",
};

type ChatPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SzakiChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  const { user } = await requireCraftsman(`/szaki/uzenetek/${id}`);

  const header = await getConversationHeader(id, user.id);
  if (!header) {
    notFound();
  }

  const { messages, canAccess, canSend, bidId, craftsmanPaymentRequired } =
    await getConversationMessages(id, user.id);
  if (!canAccess) {
    notFound();
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer narrow>
        <div className="mb-6">
          <Link
            href="/szaki/uzenetek"
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            ← Vissza az üzenetekhez
          </Link>
          <p className={`mt-4 ${pageEyebrowClassName}`}>Chat</p>
          <h1 className="mt-1 text-2xl font-black text-zinc-50">
            {header.jobTitle}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {header.otherPartyName} · Munka: {getJobStatusLabel(header.jobStatus)}
          </p>
        </div>

        {craftsmanPaymentRequired && bidId && (
          <CraftsmanChatUnlock
            bidId={bidId}
            conversationId={id}
            jobTitle={header.jobTitle}
          />
        )}

        <ChatRoom
          conversationId={id}
          currentUserId={user.id}
          initialMessages={messages}
          canSend={canSend}
          readOnlyMessage="A válaszadáshoz aktiváld a chatet a fenti gombbal."
        />
      </PageContainer>
    </div>
  );
}

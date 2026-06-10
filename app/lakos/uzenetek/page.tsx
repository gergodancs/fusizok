import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { getAuthContext } from "@/lib/auth/session";
import { getUserConversations } from "@/lib/conversations";
import { cardClassName, pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Chatek – fusizok.hu",
};

export default async function LakosUzenetekPage() {
  const { user, profile } = await getAuthContext();

  if (!user) {
    redirect("/login?redirect=/lakos/uzenetek");
  }

  if (profile?.role === "craftsman") {
    redirect("/szaki/uzenetek");
  }

  const conversations = await getUserConversations(user.id, "client");

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer narrow>
        <div className="mb-8">
          <p className={pageEyebrowClassName}>Chatek</p>
          <h1 className="mt-2 text-3xl font-black text-zinc-50">Üzenetek</h1>
          <p className="mt-2 text-zinc-400">
            Beszélgetéseid a fusizókkal a feladott munkáidhoz kapcsolódva.
          </p>
        </div>

        {conversations.length === 0 ? (
          <EmptyState
            title="Még nincs beszélgetésed"
            description="Ha egy fusizó pályázik a munkádra és megosztod vele a kapcsolatot, itt tudtok írni egymásnak."
            actions={[
              { href: "/lakos/ajanlatok", label: "Ajánlatok megtekintése" },
              { href: "/lakos", label: "Új munka feladása" },
            ]}
          />
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/lakos/uzenetek/${conv.id}`}
                className={`block ${cardClassName} p-5 transition hover:border-amber-500/40`}
              >
                <h3 className="font-bold text-zinc-100">{conv.job_title}</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {conv.other_party_name ?? "Fusizó"}
                </p>
                {conv.last_message && (
                  <p className="mt-2 truncate text-sm text-zinc-400">
                    {conv.last_message}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
        <RealtimeRefresh table="messages" event="INSERT" />
      </PageContainer>
    </div>
  );
}

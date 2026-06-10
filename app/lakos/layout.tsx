import { redirect } from "next/navigation";
import { LakosNav } from "@/components/layout/lakos-nav";
import { PushNotificationPrompt } from "@/components/push/push-notification-prompt";
import { getAuthContext } from "@/lib/auth/session";
import { getClientLayoutSnapshot } from "@/lib/nav/snapshot";

export const dynamic = "force-dynamic";

export default async function LakosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getAuthContext();

  if (user && profile?.role === "craftsman") {
    redirect("/szaki");
  }

  const counts =
    user && profile?.role === "client"
      ? await getClientLayoutSnapshot()
      : { unreadMessages: 0, newOffers: 0 };

  return (
    <>
      {user && profile?.role === "client" && (
        <>
          <LakosNav counts={counts} />
          <PushNotificationPrompt userId={user.id} />
        </>
      )}
      {children}
    </>
  );
}

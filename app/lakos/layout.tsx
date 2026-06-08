import { redirect } from "next/navigation";
import { LakosNav } from "@/components/layout/lakos-nav";
import { getAuthContext } from "@/lib/auth/session";
import { getClientNavCounts } from "@/lib/notifications";

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
      ? await getClientNavCounts(user.id)
      : { unreadMessages: 0, newOffers: 0 };

  return (
    <>
      {user && profile?.role === "client" && <LakosNav counts={counts} />}
      {children}
    </>
  );
}

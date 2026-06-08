import { CraftsmanNav } from "@/components/layout/craftsman-nav";
import { requireCraftsman } from "@/lib/auth/require-craftsman";
import { getCraftsmanNavCounts } from "@/lib/notifications";

export default async function SzakiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireCraftsman("/szaki");
  const counts = await getCraftsmanNavCounts(user.id);

  return (
    <>
      <CraftsmanNav counts={counts} />
      {children}
    </>
  );
}

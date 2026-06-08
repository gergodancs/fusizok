"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { markConversationRead } from "@/lib/notifications";

function revalidateNavLayouts() {
  revalidatePath("/lakos", "layout");
  revalidatePath("/szaki", "layout");
  revalidatePath("/lakos/uzenetek");
  revalidatePath("/szaki/uzenetek");
}

export async function markConversationReadAction(
  conversationId: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "Bejelentkezés szükséges." };
  }

  const result = await markConversationRead(conversationId, user.id);
  if (!result.ok) {
    return result;
  }

  revalidateNavLayouts();
  revalidatePath(`/lakos/uzenetek/${conversationId}`);
  revalidatePath(`/szaki/uzenetek/${conversationId}`);

  return { ok: true };
}

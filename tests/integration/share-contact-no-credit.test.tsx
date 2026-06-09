import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { initiateShareContact } from "@/app/actions/share-contact";
import { getConversationMessages } from "@/lib/conversations";
import { sendMessage } from "@/app/actions/messages";
import { ChatRoom } from "@/components/chat/chat-room";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  })),
}));

vi.mock("@/lib/auth/session", () => ({
  getSessionUser: vi.fn(),
  getUserProfile: vi.fn(),
}));

vi.mock("@/app/utils/notifications", () => ({
  notifyUser: vi.fn().mockResolvedValue({ ok: true, errors: [] }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ refresh: vi.fn() })),
}));

vi.mock("@/app/actions/notifications", () => ({
  markConversationReadAction: vi.fn().mockResolvedValue({ ok: true }),
}));

import { createClient } from "@/lib/supabase/server";
import { getSessionUser, getUserProfile } from "@/lib/auth/session";

const BID_ID = "bid-2";
const JOB_ID = "job-2";
const CLIENT_ID = "client-1";
const CRAFTSMAN_ID = "craftsman-1";
const CONV_ID = "conv-2";
const INTRO_MSG = {
  id: "msg-intro",
  conversation_id: CONV_ID,
  sender_id: CLIENT_ID,
  content:
    "Szia! Köszönöm a pályázatod! Teszt Lakos tetszik az ajánlatod – mesélj még róla!",
  created_at: new Date().toISOString(),
};

describe("3. Kontakt megosztás kredit nélkül – zárolt válasz", () => {
  let mock: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mock = createMockSupabaseClient({
      tables: {
        jobs: [{ id: JOB_ID, title: "Konyha festés", client_id: CLIENT_ID }],
        job_bids: [
          {
            id: BID_ID,
            job_id: JOB_ID,
            craftsman_id: CRAFTSMAN_ID,
            contact_shared: true,
            status: "pending_payment",
          },
        ],
        conversations: [
          {
            id: CONV_ID,
            job_id: JOB_ID,
            client_id: CLIENT_ID,
            craftsman_id: CRAFTSMAN_ID,
          },
        ],
        messages: [INTRO_MSG],
        craftsman_profiles: [{ id: CRAFTSMAN_ID, free_credits: 0 }],
      },
      rpc: {
        share_contact_with_credit: () => ({
          data: {
            success: true,
            outcome: "craftsman_payment_required",
            conversation_id: CONV_ID,
            used_credit: false,
            job_id: JOB_ID,
            craftsman_id: CRAFTSMAN_ID,
          },
          error: null,
        }),
      },
    });

    vi.mocked(createClient).mockResolvedValue(mock as never);
    vi.mocked(getSessionUser).mockResolvedValue({ id: CLIENT_ID } as never);
    vi.mocked(getUserProfile).mockResolvedValue({
      full_name: "Teszt Lakos",
    } as never);
  });

  it("shareContact létrehozza a chatet craftsman_payment_required kimenettel", async () => {
    const result = await initiateShareContact(BID_ID);

    expect(result.ok).toBe(true);
    expect(result.outcome).toBe("craftsman_payment_required");
    expect(result.conversationId).toBe(CONV_ID);
    expect(result.usedCredit).toBe(false);
  });

  it("getConversationMessages: fusizó látja az intro üzenetet, de canSend=false", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({ id: CRAFTSMAN_ID } as never);

    const data = await getConversationMessages(CONV_ID, CRAFTSMAN_ID);

    expect(data.canAccess).toBe(true);
    expect(data.canSend).toBe(false);
    expect(data.craftsmanPaymentRequired).toBe(true);
    expect(data.messages).toHaveLength(1);
    expect(data.messages[0]?.content).toContain("tetszik az ajánlatod");
  });

  it("ChatRoom UI: nincs válaszmező zárolt chatnél", () => {
    render(
      <ChatRoom
        conversationId={CONV_ID}
        currentUserId={CRAFTSMAN_ID}
        initialMessages={[INTRO_MSG]}
        canSend={false}
        readOnlyMessage="A válaszadáshoz előbb fizesd ki a chat kapcsolatfelvételi díjat."
      />,
    );

    expect(screen.getByText(INTRO_MSG.content)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Írj üzenetet…")).not.toBeInTheDocument();
    expect(
      screen.getByText(/fizesd ki a chat kapcsolatfelvételi díjat/i),
    ).toBeInTheDocument();
  });

  it("backend sendMessage blokkolja a fusizó üzenetét pending_payment mellett", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({ id: CRAFTSMAN_ID } as never);
    vi.mocked(getUserProfile).mockResolvedValue({
      full_name: "Teszt Fusizó",
    } as never);

    const formData = new FormData();
    formData.set("conversation_id", CONV_ID);
    formData.set("content", "Próba üzenet");

    const result = await sendMessage({}, formData);

    expect(result.error).toMatch(/fizesd ki a chat kapcsolatfelvételi díjat/i);
    expect(mock.getRows("messages")).toHaveLength(1);
  });
});

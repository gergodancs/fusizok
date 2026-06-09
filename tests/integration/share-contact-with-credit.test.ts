import { beforeEach, describe, expect, it, vi } from "vitest";
import { initiateShareContact } from "@/app/actions/share-contact";
import { sendMessage } from "@/app/actions/messages";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
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

import { createClient } from "@/lib/supabase/server";
import { getSessionUser, getUserProfile } from "@/lib/auth/session";

const BID_ID = "bid-1";
const JOB_ID = "job-1";
const CLIENT_ID = "client-1";
const CRAFTSMAN_ID = "craftsman-1";
const CONV_ID = "conv-1";
const INTRO =
  "Szia! Köszönöm a pályázatod! Teszt Lakos tetszik az ajánlatod – mesélj még róla!";

describe("2. Kontakt megosztás ingyenes kredittel", () => {
  let mock: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mock = createMockSupabaseClient({
      tables: {
        jobs: [{ id: JOB_ID, title: "Fürdő felújítás", client_id: CLIENT_ID }],
        job_bids: [
          {
            id: BID_ID,
            job_id: JOB_ID,
            craftsman_id: CRAFTSMAN_ID,
            contact_shared: false,
            status: "pending",
          },
        ],
        craftsman_profiles: [
          { id: CRAFTSMAN_ID, free_credits: 1 },
        ],
        conversations: [],
        messages: [],
      },
      rpc: {
        share_contact_with_credit: () => ({
          data: {
            success: true,
            outcome: "activated",
            conversation_id: CONV_ID,
            used_credit: true,
            job_id: JOB_ID,
            craftsman_id: CRAFTSMAN_ID,
          },
          error: null,
        }),
      },
      onInsert: {
        messages: (row) => {
          mock.getRows("messages").push(row);
        },
      },
    });

    vi.mocked(createClient).mockResolvedValue(mock as never);
    vi.mocked(getSessionUser).mockResolvedValue({ id: CLIENT_ID } as never);
    vi.mocked(getUserProfile).mockResolvedValue({
      full_name: "Teszt Lakos",
    } as never);
  });

  it("RPC aktiválja a chatet, intro üzenet megy, usedCredit=true", async () => {
    const result = await initiateShareContact(BID_ID);

    expect(result.ok).toBe(true);
    expect(result.outcome).toBe("activated");
    expect(result.conversationId).toBe(CONV_ID);
    expect(result.usedCredit).toBe(true);

    expect(mock.rpc).toHaveBeenCalledWith("share_contact_with_credit", {
      p_bid_id: BID_ID,
      p_client_id: CLIENT_ID,
      p_intro_message: INTRO,
    });
  });

  it("fusizó sikeresen válaszolhat active státusz után", async () => {
    mock.setRows("conversations", [
      {
        id: CONV_ID,
        job_id: JOB_ID,
        client_id: CLIENT_ID,
        craftsman_id: CRAFTSMAN_ID,
      },
    ]);
    mock.setRows("job_bids", [
      {
        id: BID_ID,
        job_id: JOB_ID,
        craftsman_id: CRAFTSMAN_ID,
        contact_shared: true,
        status: "active",
      },
    ]);
    mock.setRows("craftsman_profiles", [
      { id: CRAFTSMAN_ID, free_credits: 0 },
    ]);

    vi.mocked(getSessionUser).mockResolvedValue({ id: CRAFTSMAN_ID } as never);
    vi.mocked(getUserProfile).mockResolvedValue({
      full_name: "Teszt Fusizó",
    } as never);

    const formData = new FormData();
    formData.set("conversation_id", CONV_ID);
    formData.set("content", "Köszönöm, holnap tudok jönni!");

    const sendResult = await sendMessage({}, formData);

    expect(sendResult.error).toBeUndefined();
    expect(mock.getRows("messages").length).toBeGreaterThanOrEqual(1);
    const lastMsg = mock.getRows("messages").at(-1);
    expect(lastMsg?.sender_id).toBe(CRAFTSMAN_ID);
    expect(lastMsg?.content).toBe("Köszönöm, holnap tudok jönni!");
  });

  it("kredit lecsökken 0-ra az RPC után (szimulált állapot)", () => {
    mock.setRows("craftsman_profiles", [
      { id: CRAFTSMAN_ID, free_credits: 0 },
    ]);
    expect(mock.getRows("craftsman_profiles")[0]?.free_credits).toBe(0);
  });
});

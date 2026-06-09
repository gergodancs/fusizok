import { beforeEach, describe, expect, it, vi } from "vitest";
import { activateContactAfterPayment } from "@/lib/payments/activate-contact-after-payment";
import {
  canCraftsmanSendInConversation,
  canCraftsmanReadConversation,
} from "@/lib/chat-access";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/app/utils/notifications", () => ({
  notifyUser: vi.fn().mockResolvedValue({ ok: true, errors: [] }),
}));

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BID_ID = "bid-3";
const JOB_ID = "job-3";
const CLIENT_ID = "client-1";
const CRAFTSMAN_ID = "craftsman-1";
const CONV_ID = "conv-3";
const EVENT_ID = "evt_stripe_123";

describe("4. Stripe fizetés után chat feloldás", () => {
  let serverMock: ReturnType<typeof createMockSupabaseClient>;
  let adminMock: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    serverMock = createMockSupabaseClient({
      tables: {
        job_bids: [
          {
            id: BID_ID,
            job_id: JOB_ID,
            craftsman_id: CRAFTSMAN_ID,
            contact_shared: true,
            status: "active",
          },
        ],
      },
    });

    adminMock = createMockSupabaseClient({
      rpc: {
        activate_contact_after_payment: () => ({
          data: {
            success: true,
            outcome: "activated",
            conversation_id: CONV_ID,
            job_id: JOB_ID,
            craftsman_id: CRAFTSMAN_ID,
          },
          error: null,
        }),
      },
    });

    vi.mocked(createClient).mockResolvedValue(serverMock as never);
    vi.mocked(createAdminClient).mockReturnValue(adminMock as never);
  });

  it("activateContactAfterPayment RPC aktiválja a pending_payment bidet", async () => {
    const result = await activateContactAfterPayment({
      bidId: BID_ID,
      idempotencyKey: EVENT_ID,
      clientId: CLIENT_ID,
      introMessage: "Szia!",
      metadata: {
        bid_id: BID_ID,
        job_id: JOB_ID,
        craftsman_id: CRAFTSMAN_ID,
        client_id: CLIENT_ID,
        payment_type: "craftsman_chat_unlock",
      },
      clientName: "Teszt Lakos",
      jobTitle: "Napelem szerelés",
    });

    expect(result.outcome).toBe("activated");
    expect(result.conversation_id).toBe(CONV_ID);

    expect(adminMock.rpc).toHaveBeenCalledWith(
      "activate_contact_after_payment",
      expect.objectContaining({
        p_bid_id: BID_ID,
        p_idempotency_key: EVENT_ID,
        p_client_id: CLIENT_ID,
      }),
    );
  });

  it("fizetés után a fusizó azonnal küldhet üzenetet (active státusz)", async () => {
    await expect(
      canCraftsmanReadConversation(JOB_ID, CRAFTSMAN_ID),
    ).resolves.toBe(true);
    await expect(
      canCraftsmanSendInConversation(JOB_ID, CRAFTSMAN_ID),
    ).resolves.toBe(true);
  });

  it("pending_payment → active átmenet szimulációja feloldja a küldést", async () => {
    serverMock.setRows("job_bids", [
      {
        id: BID_ID,
        job_id: JOB_ID,
        craftsman_id: CRAFTSMAN_ID,
        contact_shared: true,
        status: "pending_payment",
      },
    ]);

    await expect(
      canCraftsmanSendInConversation(JOB_ID, CRAFTSMAN_ID),
    ).resolves.toBe(false);

    serverMock.updateBidStatus(JOB_ID, CRAFTSMAN_ID, "active");

    await expect(
      canCraftsmanSendInConversation(JOB_ID, CRAFTSMAN_ID),
    ).resolves.toBe(true);
  });
});

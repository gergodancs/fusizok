import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  canCraftsmanReadConversation,
  canCraftsmanSendInConversation,
  canUserAccessConversation,
} from "@/lib/chat-access";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";

const JOB_ID = "job-1";
const CRAFTSMAN_ID = "craftsman-1";
const CLIENT_ID = "client-1";
const CONV_ID = "conv-1";

describe("chat-access – fusizó olvasás / küldés jogosultság", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fusizó olvashat, ha contact_shared=true (pending_payment mellett is)", async () => {
    const mock = createMockSupabaseClient({
      tables: {
        job_bids: [
          {
            job_id: JOB_ID,
            craftsman_id: CRAFTSMAN_ID,
            contact_shared: true,
            status: "pending_payment",
          },
        ],
      },
    });
    vi.mocked(createClient).mockResolvedValue(mock as never);

    await expect(
      canCraftsmanReadConversation(JOB_ID, CRAFTSMAN_ID),
    ).resolves.toBe(true);
  });

  it("fusizó NEM küldhet pending_payment státusznál", async () => {
    const mock = createMockSupabaseClient({
      tables: {
        job_bids: [
          {
            job_id: JOB_ID,
            craftsman_id: CRAFTSMAN_ID,
            contact_shared: true,
            status: "pending_payment",
          },
        ],
      },
    });
    vi.mocked(createClient).mockResolvedValue(mock as never);

    await expect(
      canCraftsmanSendInConversation(JOB_ID, CRAFTSMAN_ID),
    ).resolves.toBe(false);
  });

  it("fusizó küldhet active státusznál", async () => {
    const mock = createMockSupabaseClient({
      tables: {
        job_bids: [
          {
            job_id: JOB_ID,
            craftsman_id: CRAFTSMAN_ID,
            contact_shared: true,
            status: "active",
          },
        ],
      },
    });
    vi.mocked(createClient).mockResolvedValue(mock as never);

    await expect(
      canCraftsmanSendInConversation(JOB_ID, CRAFTSMAN_ID),
    ).resolves.toBe(true);
  });

  it("lakos mindig hozzáfér a beszélgetéshez", async () => {
    const conversation = {
      id: CONV_ID,
      job_id: JOB_ID,
      client_id: CLIENT_ID,
      craftsman_id: CRAFTSMAN_ID,
    };

    await expect(
      canUserAccessConversation(conversation, CLIENT_ID),
    ).resolves.toBe(true);
  });

  it("fusizó nem fér hozzá, ha még nincs megosztva a kontakt", async () => {
    const mock = createMockSupabaseClient({
      tables: {
        job_bids: [
          {
            job_id: JOB_ID,
            craftsman_id: CRAFTSMAN_ID,
            contact_shared: false,
            status: "pending",
          },
        ],
      },
    });
    vi.mocked(createClient).mockResolvedValue(mock as never);

    const conversation = {
      id: CONV_ID,
      job_id: JOB_ID,
      client_id: CLIENT_ID,
      craftsman_id: CRAFTSMAN_ID,
    };

    await expect(
      canUserAccessConversation(conversation, CRAFTSMAN_ID),
    ).resolves.toBe(false);
  });
});

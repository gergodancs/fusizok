import { beforeEach, describe, expect, it, vi } from "vitest";
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

const CONV_ID = "conv-locked";
const JOB_ID = "job-locked";
const CLIENT_ID = "client-1";
const CRAFTSMAN_ID = "craftsman-locked";

describe("5. Negatív teszt – API blokkolás elfogadás nélkül", () => {
  let mock: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mock = createMockSupabaseClient({
      tables: {
        conversations: [
          {
            id: CONV_ID,
            job_id: JOB_ID,
            client_id: CLIENT_ID,
            craftsman_id: CRAFTSMAN_ID,
          },
        ],
        job_bids: [
          {
            job_id: JOB_ID,
            craftsman_id: CRAFTSMAN_ID,
            contact_shared: false,
            status: "pending",
          },
        ],
        messages: [
          {
            id: "msg-1",
            conversation_id: CONV_ID,
            sender_id: CLIENT_ID,
            content: "Intro üzenet",
          },
        ],
      },
    });

    vi.mocked(createClient).mockResolvedValue(mock as never);
    vi.mocked(getSessionUser).mockResolvedValue({ id: CRAFTSMAN_ID } as never);
    vi.mocked(getUserProfile).mockResolvedValue({
      full_name: "Zárolt Fusizó",
    } as never);
  });

  it("sendMessage NEM menti az üzenetet, ha nincs elfogadva az ajánlat", async () => {
    const formData = new FormData();
    formData.set("conversation_id", CONV_ID);
    formData.set("content", "Illegális válasz elfogadás nélkül");

    const result = await sendMessage({}, formData);

    expect(result.error).toBeTruthy();
    expect(result.error).toMatch(/megosztotta a kapcsolatot/i);
    expect(mock.getRows("messages")).toHaveLength(1);
    expect(mock.getRows("messages")[0]?.content).toBe("Intro üzenet");
  });

  it("üres üzenet is elutasításra kerül (külön validáció)", async () => {
    const formData = new FormData();
    formData.set("conversation_id", CONV_ID);
    formData.set("content", "   ");

    const result = await sendMessage({}, formData);

    expect(result.error).toMatch(/nem lehet üres/i);
  });

  it("nem bejelentkezett user nem küldhet", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    const formData = new FormData();
    formData.set("conversation_id", CONV_ID);
    formData.set("content", "Hello");

    const result = await sendMessage({}, formData);

    expect(result.error).toMatch(/Bejelentkezés szükséges/i);
  });

  it("lakos továbbra is küldhet, ha a fusizó még nem kapott hozzáférést", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({ id: CLIENT_ID } as never);
    vi.mocked(getUserProfile).mockResolvedValue({
      full_name: "Teszt Lakos",
    } as never);

    const formData = new FormData();
    formData.set("conversation_id", CONV_ID);
    formData.set("content", "Várok a válaszodra!");

    const result = await sendMessage({}, formData);

    expect(result.error).toBeUndefined();
    expect(mock.getRows("messages").length).toBe(2);
    expect(mock.getRows("messages").at(-1)?.sender_id).toBe(CLIENT_ID);
  });
});

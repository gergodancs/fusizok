import { describe, expect, it } from "vitest";
import { buildCraftsmanBidAcceptedChatMessage } from "@/lib/chat/craftsman-bid-accepted-message";

describe("buildCraftsmanBidAcceptedChatMessage", () => {
  it("gratulál a fusizónak a megrendelő nevével", () => {
    expect(buildCraftsmanBidAcceptedChatMessage("Anna Kovács")).toBe(
      "Gratulálunk! Anna Kovács tetszik az ajánlatod – sok sikert a munkához!",
    );
  });

  it("fallback név, ha üres a megrendelő neve", () => {
    expect(buildCraftsmanBidAcceptedChatMessage("  ")).toContain("A megrendelő");
  });
});

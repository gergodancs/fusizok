export function buildCraftsmanBidAcceptedChatMessage(clientName: string): string {
  const name = clientName.trim() || "A megrendelő";
  return `Gratulálunk! ${name} tetszik az ajánlatod – sok sikert a munkához!`;
}

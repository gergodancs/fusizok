export function formatCreditAmount(amount: number): string {
  return amount.toFixed(1);
}

export function formatCreditBalance(credits: number): string {
  return `${formatCreditAmount(credits)} kredit`;
}

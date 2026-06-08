export const COMPLETION_TIME_OPTIONS = [
  "Sürgős / Azonnal",
  "1 héten belül",
  "1 hónapon belül",
  "Rugalmas / Ráér",
] as const;

export type RequiredCompletionTime = (typeof COMPLETION_TIME_OPTIONS)[number];

export function isRequiredCompletionTime(
  value: string,
): value is RequiredCompletionTime {
  return (COMPLETION_TIME_OPTIONS as readonly string[]).includes(value);
}

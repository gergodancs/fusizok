export const AVAILABILITY_OPTIONS = [
  "Azonnal",
  "1 héten belül",
  "1 hónapon belül",
  "Hirdetésben megadott időben",
] as const;

export type AvailabilityDuration = (typeof AVAILABILITY_OPTIONS)[number];

export function isAvailabilityDuration(
  value: string,
): value is AvailabilityDuration {
  return (AVAILABILITY_OPTIONS as readonly string[]).includes(value);
}

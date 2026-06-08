/** Budapest 23 kerülete – arab számmal, római számok nélkül. */
export const BUDAPEST_DISTRICTS = Array.from({ length: 23 }, (_, i) => {
  const n = i + 1;
  return `${n}. kerület`;
}) as readonly string[];

export type BudapestDistrict = (typeof BUDAPEST_DISTRICTS)[number];

export function isBudapestDistrict(value: string): value is BudapestDistrict {
  return (BUDAPEST_DISTRICTS as readonly string[]).includes(value);
}

import type { Decimal } from "@prisma/client/runtime/library";

export function toNumber(value: Decimal | number | string | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return Number(value.toString());
}

export function formatRub(value: Decimal | number | string | null | undefined): string {
  return `${toNumber(value).toFixed(2)} ₽`;
}

export function calculateCost(
  startedAt: Date,
  endedAt: Date,
  pricePerHour: Decimal | number | string,
): number {
  const ms = endedAt.getTime() - startedAt.getTime();
  const hours = Math.max(ms / (1000 * 60 * 60), 1 / 60);
  const price = toNumber(pricePerHour);
  return Math.round(hours * price * 100) / 100;
}

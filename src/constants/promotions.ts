export const COUPON_RULES = {
  WELCOME10: { kind: "percent", value: 10, minimum: 5000 },
  CYCLE20: { kind: "fixed", value: 2000, minimum: 20000 },
  SAVE50: { kind: "fixed", value: 5000, minimum: 50000 },
  FREESHIP: { kind: "shipping", value: 0, minimum: 0 },
  WHEEL25: { kind: "percent", value: 25, minimum: 0 },
  FIVE5: { kind: "fixed", value: 500, minimum: 0 },
} as const;

export function getCouponDiscount(code: string | undefined, subtotal: number) {
  if (!code || !(code in COUPON_RULES)) return 0;
  const rule = COUPON_RULES[code as keyof typeof COUPON_RULES];
  if (subtotal < rule.minimum || rule.kind === "shipping") return 0;
  if (rule.kind === "percent") return Math.round(subtotal * rule.value / 100);
  return Math.min(rule.value, subtotal);
}

// Parse percentage string like "45.56 %" to number 45.56
export function parsePct(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace('%', '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Format number to percentage string like "45.56 %"
export function fmtPct(num: number): string {
  return `${num.toFixed(2)} %`;
}

// Parse number string to number
export function parseNumber(val: string | undefined): number {
  if (!val) return 0;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
}

// Clamp percentage to max 100%
export function clampPct(pct: number): number {
  return Math.min(pct, 100);
}

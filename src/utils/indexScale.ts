export function normalizeWindDisturbanceIndex(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return clamp(value <= 1 ? value : value / 100, 0, 1);
}

export function formatWindDisturbanceIndex(value: number) {
  return normalizeWindDisturbanceIndex(value).toFixed(2);
}

export function indexToPercent(value: number) {
  return normalizeWindDisturbanceIndex(value) * 100;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export const WIND_DISTURBANCE_INDEX_MIN = 0.75;
export const WIND_DISTURBANCE_INDEX_NORMAL_LOW = 1.7;
export const WIND_DISTURBANCE_INDEX_NORMAL_HIGH = 2.3;
export const WIND_DISTURBANCE_INDEX_MAX = 2.8;
export const WIND_DISTURBANCE_INDEX_RANGE = WIND_DISTURBANCE_INDEX_MAX - WIND_DISTURBANCE_INDEX_MIN;

export function normalizeWindDisturbanceIndex(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return clamp((toWindDisturbanceIndex(value) - WIND_DISTURBANCE_INDEX_MIN) / WIND_DISTURBANCE_INDEX_RANGE, 0, 1);
}

export function toWindDisturbanceIndex(value: number) {
  if (!Number.isFinite(value)) {
    return WIND_DISTURBANCE_INDEX_MIN;
  }

  if (value >= WIND_DISTURBANCE_INDEX_MIN && value <= WIND_DISTURBANCE_INDEX_MAX) {
    return Number(value.toFixed(2));
  }

  if (value >= 0 && value < WIND_DISTURBANCE_INDEX_MIN) {
    return windIndexFromUnit(value);
  }

  if (value > WIND_DISTURBANCE_INDEX_MAX && value <= 100) {
    return windIndexFromUnit(value / 100);
  }

  return Number(clamp(value, WIND_DISTURBANCE_INDEX_MIN, WIND_DISTURBANCE_INDEX_MAX).toFixed(2));
}

export function windIndexFromUnit(value: number) {
  return Number((WIND_DISTURBANCE_INDEX_MIN + clamp(value, 0, 1) * WIND_DISTURBANCE_INDEX_RANGE).toFixed(2));
}

export function windIndexDeltaFromUnit(value: number) {
  return Number((value * WIND_DISTURBANCE_INDEX_RANGE).toFixed(2));
}

export function formatWindDisturbanceIndex(value: number) {
  return toWindDisturbanceIndex(value).toFixed(2);
}

export function indexToPercent(value: number) {
  return normalizeWindDisturbanceIndex(value) * 100;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

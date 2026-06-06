import type { ApproachPoint } from '../data/mockApproachData';
import type { RiskLevel } from './riskLevel';
import type { ParsedFlightIndexRow } from './parseFlightIndexFile';
import {
  formatWindDisturbanceIndex,
  normalizeWindDisturbanceIndex,
  toWindDisturbanceIndex,
  windIndexDeltaFromUnit,
  WIND_DISTURBANCE_INDEX_MAX,
  WIND_DISTURBANCE_INDEX_MIN,
  WIND_DISTURBANCE_INDEX_NORMAL_HIGH,
  WIND_DISTURBANCE_INDEX_NORMAL_LOW,
} from './indexScale';

export type UploadedApproachAnalysis = {
  data: ApproachPoint[];
  keyMoments: ApproachAnalysisMoment[];
};

export type ApproachAnalysisMoment = {
  point: ApproachPoint;
  summary: string;
};

export function buildApproachDataFromUpload(rows: ParsedFlightIndexRow[]): UploadedApproachAnalysis {
  const total = rows.length;

  // These derived fields are only for front-end presentation in the demo and do not represent a real flight model.
  const data = rows.map((row, index) => {
    const nextIndex = normalizeWindDisturbanceIndex(rows[index + 1]?.index ?? row.index);
    const previousIndex = normalizeWindDisturbanceIndex(rows[index - 1]?.index ?? row.index);
    const trend = nextIndex - previousIndex;
    const progress = total <= 1 ? 0 : index / (total - 1);
    const altitude = Math.max(50, Math.round(1000 - progress * 950));
    const turbulenceIndex = toWindDisturbanceIndex(row.index);
    const displayIndex = normalizeWindDisturbanceIndex(turbulenceIndex);
    const localVolatility = buildLocalVolatility(rows, index);
    // Demo-only interval approximation from recent local volatility; not a real statistical inference result.
    const simulatedConfidenceWidth = windIndexDeltaFromUnit(clamp(0.09 + localVolatility * 1.05 + displayIndex * 0.055, 0.08, 0.24));
    const simulatedCiLower = clamp(turbulenceIndex - simulatedConfidenceWidth, WIND_DISTURBANCE_INDEX_MIN, WIND_DISTURBANCE_INDEX_MAX);
    const simulatedCiUpper = clamp(turbulenceIndex + simulatedConfidenceWidth, WIND_DISTURBANCE_INDEX_MIN, WIND_DISTURBANCE_INDEX_MAX);
    const ciLower = row.ciLower === undefined ? simulatedCiLower : toWindDisturbanceIndex(row.ciLower);
    const ciUpper = row.ciUpper === undefined ? simulatedCiUpper : toWindDisturbanceIndex(row.ciUpper);
    const windSpeed = row.windSpeed ?? Math.max(8, Math.round(10 + displayIndex * 18 + localVolatility * 26 + Math.sin(index / 3.2) * 1.8));
    const windDirection = row.windDirection ?? normalizeDirection(Math.round(226 + Math.sin(index / 3.8) * 14 + Math.cos(index / 5.4) * 8 + trend * 60));
    const riskLevel = getUploadRiskLevel(turbulenceIndex);

    return {
      time: row.time,
      altitude,
      turbulenceIndex,
      ciLower,
      ciUpper,
      windSpeed,
      windDirection,
      riskLevel,
      factor: buildFactorLabel({ trend, altitude, turbulenceIndex, windDirection }),
    } satisfies ApproachPoint;
  });

  const keyMoments = buildApproachKeyMoments(data);

  return {
    data,
    keyMoments,
  };
}

export function buildApproachKeyMoments(data: ApproachPoint[]): ApproachAnalysisMoment[] {
  const ranked = [...data]
    .sort((left, right) => right.turbulenceIndex - left.turbulenceIndex || left.time - right.time)
    .filter((point, index, array) => array.findIndex((item) => Math.abs(item.time - point.time) <= 3) === index)
    .slice(0, 3)
    .sort((left, right) => left.time - right.time);

  return ranked.map((point) => ({
    point,
    summary: buildMomentSummary(point),
  }));
}

function buildMomentSummary(point: ApproachPoint) {
  if (point.factor === '风速变化') {
    return `风速变化增强，指数升至 ${formatWindDisturbanceIndex(point.turbulenceIndex)}。`;
  }

  if (point.factor === '风向波动') {
    return `风向波动明显，指数升至 ${formatWindDisturbanceIndex(point.turbulenceIndex)}。`;
  }

  if (point.factor === '低高度扰动') {
    return `低高度阶段扰动持续，风险等级保持${point.riskLevel}。`;
  }

  return `局部风场不稳定，指数升至 ${formatWindDisturbanceIndex(point.turbulenceIndex)}。`;
}

function buildFactorLabel({
  trend,
  altitude,
  turbulenceIndex,
  windDirection,
}: {
  trend: number;
  altitude: number;
  turbulenceIndex: number;
  windDirection: number;
}) {
  if (altitude <= 240 && turbulenceIndex > WIND_DISTURBANCE_INDEX_NORMAL_HIGH) {
    return '低高度扰动';
  }

  if (Math.abs(trend) >= 0.1) {
    return '风速变化';
  }

  if (windDirection >= 234 || windDirection <= 214) {
    return '风向波动';
  }

  return '局部风场不稳定';
}

function getUploadRiskLevel(index: number): RiskLevel {
  if (index >= 2.55) {
    return '高';
  }

  if (index > WIND_DISTURBANCE_INDEX_NORMAL_HIGH) {
    return '偏高';
  }

  if (index >= WIND_DISTURBANCE_INDEX_NORMAL_LOW) {
    return '中';
  }

  return '低';
}

function normalizeDirection(value: number) {
  let result = value % 360;
  if (result < 0) {
    result += 360;
  }
  return result;
}

function buildLocalVolatility(rows: ParsedFlightIndexRow[], index: number) {
  const start = Math.max(0, index - 4);
  const recent = rows.slice(start, index + 1).map((row) => normalizeWindDisturbanceIndex(row.index));
  const deltas = recent.slice(1).map((value, deltaIndex) => Math.abs(value - recent[deltaIndex]));

  return deltas.length ? deltas.reduce((sum, value) => sum + value, 0) / deltas.length : 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

import type { ApproachPoint } from '../data/mockApproachData';
import type { RiskLevel } from './riskLevel';
import type { ParsedFlightIndexRow } from './parseFlightIndexFile';

export type UploadedApproachAnalysis = {
  data: ApproachPoint[];
  keyMoments: Array<{
    point: ApproachPoint;
    summary: string;
  }>;
};

export function buildApproachDataFromUpload(rows: ParsedFlightIndexRow[]): UploadedApproachAnalysis {
  const total = rows.length;

  // These derived fields are only for front-end presentation in the demo and do not represent a real flight model.
  const data = rows.map((row, index) => {
    const nextIndex = rows[index + 1]?.index ?? row.index;
    const previousIndex = rows[index - 1]?.index ?? row.index;
    const trend = nextIndex - previousIndex;
    const progress = total <= 1 ? 0 : index / (total - 1);
    const altitude = Math.max(50, Math.round(1000 - progress * 950));
    const turbulenceIndex = clamp(Math.round(row.index), 0, 100);
    const windSpeed = Math.max(8, Math.round(10 + turbulenceIndex / 7 + Math.sin(index / 3.2) * 1.8 + trend * 0.18));
    const windDirection = normalizeDirection(Math.round(226 + Math.sin(index / 2.8) * 9 + Math.cos(index / 4.3) * 6 + trend * 0.9));
    const riskLevel = getUploadRiskLevel(turbulenceIndex);

    return {
      time: row.time,
      altitude,
      turbulenceIndex,
      windSpeed,
      windDirection,
      riskLevel,
      factor: buildFactorLabel({ trend, altitude, turbulenceIndex, windDirection }),
    } satisfies ApproachPoint;
  });

  const keyMoments = buildKeyMoments(data);

  return {
    data,
    keyMoments,
  };
}

function buildKeyMoments(data: ApproachPoint[]) {
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
    return `风速变化增强，指数升至 ${point.turbulenceIndex}。`;
  }

  if (point.factor === '风向波动') {
    return `风向波动明显，指数升至 ${point.turbulenceIndex}。`;
  }

  if (point.factor === '低高度扰动') {
    return `低高度阶段扰动持续，风险等级保持${point.riskLevel}。`;
  }

  return `局部风场不稳定，指数升至 ${point.turbulenceIndex}。`;
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
  if (altitude <= 240 && turbulenceIndex >= 60) {
    return '低高度扰动';
  }

  if (Math.abs(trend) >= 10) {
    return '风速变化';
  }

  if (windDirection >= 234 || windDirection <= 214) {
    return '风向波动';
  }

  return '局部风场不稳定';
}

function getUploadRiskLevel(index: number): RiskLevel {
  if (index >= 80) {
    return '高';
  }

  if (index >= 60) {
    return '偏高';
  }

  if (index >= 40) {
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

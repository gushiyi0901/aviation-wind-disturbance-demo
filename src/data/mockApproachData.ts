import { getRiskLevel, type RiskLevel } from '../utils/riskLevel';
import { formatWindDisturbanceIndex } from '../utils/indexScale';

export type ApproachPoint = {
  time: number;
  altitude: number;
  turbulenceIndex: number;
  ciLower: number;
  ciUpper: number;
  windSpeed: number;
  windDirection: number;
  riskLevel: RiskLevel;
  factor: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const factorLabel = (time: number) => {
  if (Math.abs(time - 18) <= 1) {
    return '风速短时抬升';
  }

  if (Math.abs(time - 28) <= 2) {
    return '风向波动增强';
  }

  if (time >= 35) {
    return '低高度操作敏感性';
  }

  if (time >= 12 && time <= 16) {
    return '局部风速变化';
  }

  return '风场扰动持续';
};

const buildApproachPoint = (time: number): ApproachPoint => {
  const altitude = Math.max(60, Math.round(1000 - time * 21));
  const windSpeed = Math.round(12 + Math.sin(time / 5) * 2.6 + Math.cos(time / 2.8) * 1.8 + (time > 14 && time < 20 ? 2.6 : 0) + (time > 26 && time < 31 ? 1.2 : 0));
  const windDirection = Math.round(224 + Math.sin(time / 4.5) * 9 + Math.cos(time / 6.2) * 6 + (time > 26 && time < 31 ? 7 : 0));

  const peak18 = Math.exp(-((time - 18) ** 2) / 6) * 18;
  const peak28 = Math.exp(-((time - 28) ** 2) / 5) * 46;
  const peak37 = Math.exp(-((time - 37) ** 2) / 8) * 17;
  const lowAltitudeLift = Math.max(0, (260 - altitude) / 14);
  const base = 26 + Math.sin(time / 4.1) * 7 + Math.cos(time / 2.7) * 4 + (1000 - altitude) / 55;
  const rawIndex = clamp(Math.round(base + peak18 + peak28 + peak37 + lowAltitudeLift), 18, 88);
  const turbulenceIndex = Number((rawIndex / 100).toFixed(2));
  const localWidth = clamp(0.08 + Math.abs(Math.sin(time / 3.5)) * 0.06 + (turbulenceIndex >= 0.6 ? 0.04 : 0), 0.08, 0.2);

  return {
    time,
    altitude,
    turbulenceIndex,
    ciLower: Number(clamp(turbulenceIndex - localWidth, 0, 1).toFixed(2)),
    ciUpper: Number(clamp(turbulenceIndex + localWidth, 0, 1).toFixed(2)),
    windSpeed,
    windDirection,
    riskLevel: getRiskLevel(turbulenceIndex),
    factor: factorLabel(time),
  };
};

export const approachMockData: ApproachPoint[] = Array.from({ length: 61 }, (_, index) => buildApproachPoint(index));

export const approachFlightSummary = {
  flight: 'CES-2026',
  stage: '进近 / 1000 ft 以下',
};

export const approachKeyMoments = [18, 28, 37].map((time) => {
  const point = approachMockData.find((item) => item.time === time)!;
  const summary =
    time === 18
      ? `风速短时抬升，指数升至 ${formatWindDisturbanceIndex(point.turbulenceIndex)}。`
      : time === 28
        ? `风向波动增强，指数升至 ${formatWindDisturbanceIndex(point.turbulenceIndex)}。`
        : `低高度阶段扰动持续，风险等级保持${point.riskLevel}。`;

  return { point, summary };
});

import {
  windIndexDeltaFromUnit,
  windIndexFromUnit,
  WIND_DISTURBANCE_INDEX_MAX,
  WIND_DISTURBANCE_INDEX_MIN,
  WIND_DISTURBANCE_INDEX_NORMAL_HIGH,
} from '../utils/indexScale';

export type EventQuadrant = '指数风险同步偏高' | '运行韧性较强' | '非风扰主导' | '稳定运行';

export type EventAttributionKey =
  | 'windHeadingComponent'
  | 'windSpeedStd'
  | 'windDirectionRate'
  | 'windVectorVariation'
  | 'windSpeedDiff'
  | 'weightWindInteraction';

export type EventAttribution = {
  windHeadingComponent: number;
  windSpeedStd: number;
  windDirectionRate: number;
  windVectorVariation: number;
  windSpeedDiff: number;
  weightWindInteraction: number;
};

export type EventAnalysisAirport = {
  id: string;
  name: string;
  averageIndex: number;
  eventCount: number;
  quadrant: EventQuadrant;
  highRiskPeriod: string;
  mainFactor: string;
  correlationScore: number;
  attribution: EventAttribution;
};

export type DailyEventCountPoint = {
  day: number;
  count: number;
};

export const eventScatterThresholds = {
  averageIndex: WIND_DISTURBANCE_INDEX_NORMAL_HIGH,
  eventCount: 52,
};

export const eventAttributionFeatures: Array<{
  key: EventAttributionKey;
  label: string;
  shortLabel: string;
  color: string;
}> = [
  {
    key: 'windHeadingComponent',
    label: '原始风向与航向夹角编码',
    shortLabel: '夹角编码',
    color: '#5c7c6c',
  },
  {
    key: 'windSpeedStd',
    label: '风速滑动标准差',
    shortLabel: '风速滑动标准差',
    color: '#b56b4a',
  },
  {
    key: 'windDirectionRate',
    label: '风向变化率',
    shortLabel: '风向变化率',
    color: '#b79657',
  },
  {
    key: 'windVectorVariation',
    label: '风矢量变化强度',
    shortLabel: '风矢量变化强度',
    color: '#6f8798',
  },
  {
    key: 'windSpeedDiff',
    label: '风速差分',
    shortLabel: '风速差分',
    color: '#8d7f69',
  },
  {
    key: 'weightWindInteraction',
    label: '重量与风场交互项',
    shortLabel: '重量与风场交互项',
    color: '#9b6f88',
  },
];

export const eventQuadrantMeta: Record<
  EventQuadrant,
  {
    shortLabel: string;
    description: string;
    pillClass: string;
    dotColor: string;
    glowColor: string;
    accentBar: string;
  }
> = {
  指数风险同步偏高: {
    shortLabel: '高指数 / 高风险',
    description: '指数与风险同步偏高',
    pillClass: 'border-[#c78667]/35 bg-[#f6e3d8] text-[#8d4a47]',
    dotColor: '#b56b4a',
    glowColor: 'rgba(181,107,74,0.2)',
    accentBar: 'bg-[#b56b4a]',
  },
  运行韧性较强: {
    shortLabel: '高指数 / 低风险',
    description: '运行韧性较强',
    pillClass: 'border-[#7a907f]/35 bg-[#e5efe7] text-[#547465]',
    dotColor: '#5c7c6c',
    glowColor: 'rgba(92,124,108,0.18)',
    accentBar: 'bg-[#5c7c6c]',
  },
  非风扰主导: {
    shortLabel: '低指数 / 高风险',
    description: '非风扰主导',
    pillClass: 'border-[#d1b57a]/40 bg-[#f7edd8] text-[#9a7b39]',
    dotColor: '#b79657',
    glowColor: 'rgba(183,150,87,0.2)',
    accentBar: 'bg-[#b79657]',
  },
  稳定运行: {
    shortLabel: '低指数 / 低风险',
    description: '稳定运行',
    pillClass: 'border-[#bca98f]/40 bg-[#f5ede3] text-[#7f725f]',
    dotColor: '#bca98f',
    glowColor: 'rgba(188,169,143,0.22)',
    accentBar: 'bg-[#bca98f]',
  },
};

export const eventAnalysisAirports: EventAnalysisAirport[] = [
  {
    id: 'kunming-changshui',
    name: '昆明长水',
    averageIndex: windIndexFromUnit(0.82),
    eventCount: 68,
    quadrant: '指数风险同步偏高',
    highRiskPeriod: '春季午后',
    mainFactor: '夹角编码',
    correlationScore: 0.82,
    attribution: {
      windHeadingComponent: 27,
      windSpeedStd: 18,
      windDirectionRate: 16,
      windVectorVariation: 14,
      windSpeedDiff: 13,
      weightWindInteraction: 12,
    },
  },
  {
    id: 'guangzhou-baiyun',
    name: '广州白云',
    averageIndex: windIndexFromUnit(0.76),
    eventCount: 55,
    quadrant: '指数风险同步偏高',
    highRiskPeriod: '夏季傍晚',
    mainFactor: '风速滑动标准差',
    correlationScore: 0.71,
    attribution: {
      windHeadingComponent: 23,
      windSpeedStd: 20,
      windDirectionRate: 15,
      windVectorVariation: 16,
      windSpeedDiff: 14,
      weightWindInteraction: 12,
    },
  },
  {
    id: 'shanghai-hongqiao',
    name: '上海虹桥',
    averageIndex: windIndexFromUnit(0.55),
    eventCount: 49,
    quadrant: '稳定运行',
    highRiskPeriod: '夏季傍晚',
    mainFactor: '夹角编码',
    correlationScore: 0.52,
    attribution: {
      windHeadingComponent: 26,
      windSpeedStd: 17,
      windDirectionRate: 16,
      windVectorVariation: 15,
      windSpeedDiff: 13,
      weightWindInteraction: 13,
    },
  },
  {
    id: 'beijing-daxing',
    name: '北京大兴',
    averageIndex: windIndexFromUnit(0.46),
    eventCount: 38,
    quadrant: '稳定运行',
    highRiskPeriod: '冬季午后',
    mainFactor: '风速滑动标准差',
    correlationScore: 0.42,
    attribution: {
      windHeadingComponent: 24,
      windSpeedStd: 19,
      windDirectionRate: 15,
      windVectorVariation: 15,
      windSpeedDiff: 14,
      weightWindInteraction: 13,
    },
  },
  {
    id: 'shanghai-pudong',
    name: '上海浦东',
    averageIndex: windIndexFromUnit(0.57),
    eventCount: 63,
    quadrant: '非风扰主导',
    highRiskPeriod: '梅雨季晨间',
    mainFactor: '风向变化率',
    correlationScore: 0.48,
    attribution: {
      windHeadingComponent: 22,
      windSpeedStd: 17,
      windDirectionRate: 19,
      windVectorVariation: 16,
      windSpeedDiff: 13,
      weightWindInteraction: 13,
    },
  },
  {
    id: 'qingdao-jiaodong',
    name: '青岛胶东',
    averageIndex: windIndexFromUnit(0.53),
    eventCount: 54,
    quadrant: '非风扰主导',
    highRiskPeriod: '秋季午后',
    mainFactor: '风矢量变化强度',
    correlationScore: 0.45,
    attribution: {
      windHeadingComponent: 21,
      windSpeedStd: 17,
      windDirectionRate: 18,
      windVectorVariation: 20,
      windSpeedDiff: 12,
      weightWindInteraction: 12,
    },
  },
  {
    id: 'beijing-capital',
    name: '北京首都',
    averageIndex: windIndexFromUnit(0.49),
    eventCount: 43,
    quadrant: '稳定运行',
    highRiskPeriod: '春季白天',
    mainFactor: '风速差分',
    correlationScore: 0.39,
    attribution: {
      windHeadingComponent: 23,
      windSpeedStd: 18,
      windDirectionRate: 15,
      windVectorVariation: 15,
      windSpeedDiff: 17,
      weightWindInteraction: 12,
    },
  },
  {
    id: 'chengdu-tianfu',
    name: '成都天府',
    averageIndex: windIndexFromUnit(0.58),
    eventCount: 40,
    quadrant: '稳定运行',
    highRiskPeriod: '夏季午后',
    mainFactor: '风向变化率',
    correlationScore: 0.43,
    attribution: {
      windHeadingComponent: 25,
      windSpeedStd: 18,
      windDirectionRate: 17,
      windVectorVariation: 16,
      windSpeedDiff: 12,
      weightWindInteraction: 12,
    },
  },
  {
    id: 'shenzhen-baoan',
    name: '深圳宝安',
    averageIndex: windIndexFromUnit(0.46),
    eventCount: 58,
    quadrant: '非风扰主导',
    highRiskPeriod: '夏秋雷雨季',
    mainFactor: '重量与风场交互项',
    correlationScore: 0.36,
    attribution: {
      windHeadingComponent: 20,
      windSpeedStd: 18,
      windDirectionRate: 16,
      windVectorVariation: 15,
      windSpeedDiff: 13,
      weightWindInteraction: 18,
    },
  },
  {
    id: 'chongqing-jiangbei',
    name: '重庆江北',
    averageIndex: windIndexFromUnit(0.78),
    eventCount: 47,
    quadrant: '运行韧性较强',
    highRiskPeriod: '秋季夜航时段',
    mainFactor: '风矢量变化强度',
    correlationScore: 0.67,
    attribution: {
      windHeadingComponent: 22,
      windSpeedStd: 17,
      windDirectionRate: 16,
      windVectorVariation: 21,
      windSpeedDiff: 12,
      weightWindInteraction: 12,
    },
  },
  {
    id: 'guiyang-longdongbao',
    name: '贵阳龙洞堡',
    averageIndex: windIndexFromUnit(0.8),
    eventCount: 39,
    quadrant: '运行韧性较强',
    highRiskPeriod: '春季夜间',
    mainFactor: '夹角编码',
    correlationScore: 0.69,
    attribution: {
      windHeadingComponent: 28,
      windSpeedStd: 16,
      windDirectionRate: 17,
      windVectorVariation: 15,
      windSpeedDiff: 12,
      weightWindInteraction: 12,
    },
  },
  {
    id: 'xian-xianyang',
    name: '西安咸阳',
    averageIndex: windIndexFromUnit(0.54),
    eventCount: 45,
    quadrant: '稳定运行',
    highRiskPeriod: '春季午后',
    mainFactor: '风速滑动标准差',
    correlationScore: 0.41,
    attribution: {
      windHeadingComponent: 23,
      windSpeedStd: 20,
      windDirectionRate: 16,
      windVectorVariation: 15,
      windSpeedDiff: 14,
      weightWindInteraction: 12,
    },
  },
];

export const defaultEventAirportId = 'shanghai-hongqiao';

export const eventAnalysisYears = Array.from({ length: 7 }, (_, index) => String(2020 + index));

export const eventAnalysisMonthNumbers = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'));

const coreDailyEventProfiles: Record<string, 'steady' | 'smallPeaks' | 'variableLow'> = {
  'shanghai-hongqiao': 'steady',
  'beijing-daxing': 'smallPeaks',
  'chengdu-tianfu': 'variableLow',
};

export function getMonthlyEventAirportProfile(airport: EventAnalysisAirport, year: string, month: string): EventAnalysisAirport {
  const yearOffset = Number(year) - 2023;
  const monthNumber = Number(month);
  const airportSeed = seedFromText(airport.id);
  const seasonalIndex = windIndexDeltaFromUnit(Math.sin((monthNumber + airportSeed * 0.03) / 2.8) * 0.045 + yearOffset * 0.006);
  const seasonalEvents = Math.cos((monthNumber + airportSeed * 0.02) / 3.1) * 5 + yearOffset * 0.7;
  const averageIndex = clampNumber(airport.averageIndex + seasonalIndex, WIND_DISTURBANCE_INDEX_MIN, WIND_DISTURBANCE_INDEX_MAX);
  const coreDailyCounts = buildCoreDailyEventCounts(airport.id, year, month);
  const eventCount = coreDailyCounts.length
    ? coreDailyCounts.reduce((sum, point) => sum + point.count, 0)
    : Math.max(12, Math.round(airport.eventCount + seasonalEvents));
  const correlationScore = clampNumber(airport.correlationScore + Math.sin((monthNumber + airportSeed) / 4) * 0.035, 0.25, 0.88);
  const attribution = buildMonthlyAttribution(airport.attribution, monthNumber, airportSeed);

  return {
    ...airport,
    averageIndex: Number(averageIndex.toFixed(2)),
    eventCount,
    correlationScore: Number(correlationScore.toFixed(2)),
    quadrant: resolveEventQuadrant(averageIndex, eventCount),
    mainFactor: resolveAttributionMainFactor(attribution),
    attribution,
  };
}

export function getMonthlyEventAirportProfiles(year: string, month: string) {
  return eventAnalysisAirports.map((airport) => getMonthlyEventAirportProfile(airport, year, month));
}

export function getDailyEventCounts(airport: EventAnalysisAirport, year: string, month: string): DailyEventCountPoint[] {
  const coreDailyCounts = buildCoreDailyEventCounts(airport.id, year, month);

  if (coreDailyCounts.length) {
    return coreDailyCounts;
  }

  const days = new Date(Number(year), Number(month), 0).getDate();
  const monthlyProfile = getMonthlyEventAirportProfile(airport, year, month);
  const targetTotal = monthlyProfile.eventCount;
  const airportSeed = seedFromText(airport.id);
  const monthNumber = Number(month);
  const weights = Array.from({ length: days }, (_, index) => {
    const weekly = 1 + Math.sin((index + airportSeed * 0.11) / 3.9) * 0.22;
    const monthlyPulse = 1 + Math.exp(-((index - days * 0.68) ** 2) / 30) * 0.28;
    const airportPattern = 1 + Math.cos((index + monthNumber + airportSeed * 0.05) / 5.6) * 0.16;
    return Math.max(0.45, weekly * monthlyPulse * airportPattern);
  });
  const weightSum = weights.reduce((sum, value) => sum + value, 0);
  const rawCounts = weights.map((value) => Math.max(0, Math.round((value / weightSum) * targetTotal)));
  const delta = targetTotal - rawCounts.reduce((sum, value) => sum + value, 0);

  if (rawCounts.length) {
    rawCounts[Math.min(rawCounts.length - 1, Math.max(0, Math.round(days * 0.62)))] += delta;
  }

  return rawCounts.map((count, index) => ({ day: index + 1, count: Math.max(0, count) }));
}

function buildCoreDailyEventCounts(airportId: string, year: string, month: string): DailyEventCountPoint[] {
  const profile = coreDailyEventProfiles[airportId];

  if (!profile) {
    return [];
  }

  const yearNumber = Number(year);
  const monthNumber = Number(month);
  const days = new Date(yearNumber, monthNumber, 0).getDate();
  const airportSeed = seedFromText(airportId);

  return Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const dailySignal = pseudoRandom(airportSeed + yearNumber * 19 + monthNumber * 37 + day * 53);
    const pulseSignal = pseudoRandom(airportSeed + yearNumber * 7 + monthNumber * 29 + day * 97);
    const count = buildCoreDailyCount(profile, dailySignal, pulseSignal);

    return {
      day,
      count,
    };
  });
}

function buildCoreDailyCount(profile: 'steady' | 'smallPeaks' | 'variableLow', dailySignal: number, pulseSignal: number) {
  if (profile === 'steady') {
    if (dailySignal > 0.985) return 4;
    if (dailySignal > 0.82) return 3;
    if (dailySignal > 0.38) return 2;
    if (dailySignal > 0.1) return 1;
    return 0;
  }

  if (profile === 'smallPeaks') {
    if (dailySignal > 0.965) return 5;
    if (dailySignal > 0.91) return 4;
    if (dailySignal > 0.75) return 3;
    if (dailySignal > 0.42) return 2;
    if (dailySignal > 0.12) return 1;
    return pulseSignal > 0.96 ? 2 : 0;
  }

  if (dailySignal > 0.982) return 5;
  if (dailySignal > 0.94) return 4;
  if (dailySignal > 0.79) return 3;
  if (dailySignal > 0.49) return 2;
  if (dailySignal > 0.22) return 1;
  return pulseSignal > 0.97 ? 3 : 0;
}

function buildMonthlyAttribution(attribution: EventAttribution, month: number, seed: number): EventAttribution {
  const adjusted = eventAttributionFeatures.map((feature, index) => ({
    key: feature.key,
    value: Math.max(6, attribution[feature.key] + Math.round(Math.sin((month + seed * 0.03 + index * 1.7) / 3.4) * 3)),
  }));
  const total = adjusted.reduce((sum, item) => sum + item.value, 0);
  const normalized = adjusted.map((item) => ({
    key: item.key,
    value: Math.round((item.value / total) * 100),
  }));
  const roundedTotal = normalized.reduce((sum, item) => sum + item.value, 0);
  normalized[0].value += 100 - roundedTotal;

  return normalized.reduce(
    (result, item) => ({
      ...result,
      [item.key]: item.value,
    }),
    {} as EventAttribution,
  );
}

function resolveAttributionMainFactor(attribution: EventAttribution) {
  return eventAttributionFeatures.reduce((bestFeature, feature) => (attribution[feature.key] > attribution[bestFeature.key] ? feature : bestFeature)).shortLabel;
}

function resolveEventQuadrant(averageIndex: number, eventCount: number): EventQuadrant {
  if (averageIndex >= eventScatterThresholds.averageIndex && eventCount >= eventScatterThresholds.eventCount) {
    return '指数风险同步偏高';
  }

  if (averageIndex >= eventScatterThresholds.averageIndex) {
    return '运行韧性较强';
  }

  if (eventCount >= eventScatterThresholds.eventCount) {
    return '非风扰主导';
  }

  return '稳定运行';
}

function seedFromText(value: string) {
  return Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

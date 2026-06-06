import { normalizeWindDisturbanceIndex, windIndexFromUnit } from '../utils/indexScale';

export type AirportRiskLevel = '低' | '中' | '较高' | '高';

export type TimeScale = 'month' | 'week' | 'day' | 'hour';

export type AirportLabelPlacement = 'right' | 'left' | 'top' | 'bottom';

export type AirportTrendMonth = `${number}-${string}`;

export type DailyAirportTrendPoint = {
  day: number;
  index: number;
  lower: number;
  upper: number;
};

export interface AirportRiskProfile {
  id: string;
  name: string;
  shortName: string;
  city: string;
  type: string;
  longitude: number;
  latitude: number;
  x: number;
  y: number;
  mapXPercent: number;
  mapYPercent: number;
  labelDx: number;
  labelDy: number;
  labelPlacement: AirportLabelPlacement;
  currentIndex: number;
  riskLevel: AirportRiskLevel;
  annualAverage: number;
  highRiskDays: number;
  mainRiskPeriod: string;
  mainWindDirection: string;
  windSpeed: number;
  mainFactors: string[];
  typicalScenario: string;
  runwayHeading: string;
  hotspotLabel: string;
  approachDirection: string;
  trend: {
    month: number[];
    week: number[];
    day: number[];
    hour: number[];
  };
  windRose: number[];
}

type AirportSeed = Omit<AirportRiskProfile, 'trend'> & {
  trendSeed: number;
  seasonalBias: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(value)));

const buildSeries = (length: number, baseline: number, amplitude: number, phase: number, tilt = 0, spikeAt?: number) =>
  Array.from({ length }, (_, index) => {
    const wave =
      Math.sin((index + phase) / Math.max(length / 5, 1)) * amplitude +
      Math.cos((index + phase * 0.7) / Math.max(length / 8, 1)) * amplitude * 0.42 +
      tilt * (index / Math.max(length - 1, 1) - 0.5);
    const spike = spikeAt === undefined ? 0 : Math.exp(-((index - spikeAt) ** 2) / Math.max(length / 10, 1)) * amplitude * 0.55;
    return clamp(baseline + wave + spike, 22, 88);
  });

const weekLabels = Array.from({ length: 52 }, (_, index) => `W${index + 1}`);
const dayLabels = Array.from({ length: 30 }, (_, index) => `D${index + 1}`);

export const airportTrendLabels: Record<TimeScale, string[]> = {
  month: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  week: weekLabels,
  day: dayLabels,
  hour: ['0:00', '4:00', '8:00', '12:00', '16:00', '20:00', '24:00'],
};

export const airportRiskDisplayPeriod = '2026年5月';

export const defaultAirportId = 'shanghai-hongqiao';

export const airportTrendYears = Array.from({ length: 7 }, (_, index) => String(2020 + index));

export const airportTrendMonthNumbers = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'));

export const airportMonthlyTrendMonths: Array<{ value: AirportTrendMonth; label: string; days: number }> = airportTrendYears.flatMap((year) =>
  airportTrendMonthNumbers.map((month) => ({
    value: `${year}-${month}` as AirportTrendMonth,
    label: `${year}年${Number(month)}月`,
    days: getDaysInMonth(Number(year), Number(month)),
  })),
);

export const airportTrendComparisonAirportIds = ['shanghai-hongqiao', 'beijing-daxing', 'chengdu-tianfu'] as const;

const airportSeeds: AirportSeed[] = [
  {
    id: 'beijing-capital',
    name: '北京首都机场',
    shortName: '首都',
    city: '北京',
    type: '枢纽机场',
    longitude: 116.5871,
    latitude: 40.0785,
    x: 72.5,
    y: 24,
    mapXPercent: 75.7,
    mapYPercent: 33,
    labelDx: 14,
    labelDy: -12,
    labelPlacement: 'right',
    currentIndex: 49,
    riskLevel: '中',
    annualAverage: 44,
    highRiskDays: 9,
    mainRiskPeriod: '冬春交替、午后',
    mainWindDirection: '西北风',
    windSpeed: 17,
    mainFactors: ['侧风波动', '进近繁忙时段'],
    typicalScenario: '冬春交替阶段短时侧风增强，低高度段指数更易抬升。',
    runwayHeading: '17/35',
    hotspotLabel: '北侧侧风带',
    approachDirection: '由南向北',
    trendSeed: 1,
    seasonalBias: 2,
    windRose: [18, 22, 26, 16, 10, 8],
  },
  {
    id: 'beijing-daxing',
    name: '北京大兴机场',
    shortName: '大兴',
    city: '北京',
    type: '枢纽机场',
    longitude: 116.4106,
    latitude: 39.5098,
    x: 74.4,
    y: 26.8,
    mapXPercent: 75,
    mapYPercent: 34.7,
    labelDx: 14,
    labelDy: 10,
    labelPlacement: 'right',
    currentIndex: 46,
    riskLevel: '中',
    annualAverage: 42,
    highRiskDays: 8,
    mainRiskPeriod: '冬季、午后',
    mainWindDirection: '偏北风',
    windSpeed: 15,
    mainFactors: ['平原风场切变', '跑道侧风'],
    typicalScenario: '偏北风增强时，平原风场切变对进近末段影响更明显。',
    runwayHeading: '01/19',
    hotspotLabel: '东侧侧风区',
    approachDirection: '由南向北',
    trendSeed: 2,
    seasonalBias: 1,
    windRose: [16, 21, 24, 18, 12, 9],
  },
  {
    id: 'shanghai-pudong',
    name: '上海浦东机场',
    shortName: '浦东',
    city: '上海',
    type: '沿海机场',
    longitude: 121.8052,
    latitude: 31.1443,
    x: 82,
    y: 39.5,
    mapXPercent: 86,
    mapYPercent: 47.7,
    labelDx: 14,
    labelDy: -12,
    labelPlacement: 'right',
    currentIndex: 58,
    riskLevel: '中',
    annualAverage: 50,
    highRiskDays: 12,
    mainRiskPeriod: '夏秋、傍晚',
    mainWindDirection: '东南风',
    windSpeed: 18,
    mainFactors: ['海陆风转换', '低空风向波动'],
    typicalScenario: '海陆风转换阶段，傍晚低空风向摆动更集中。',
    runwayHeading: '17L/35R',
    hotspotLabel: '沿海入流区',
    approachDirection: '由北向南',
    trendSeed: 4,
    seasonalBias: 6,
    windRose: [9, 14, 22, 28, 19, 8],
  },
  {
    id: 'shanghai-hongqiao',
    name: '上海虹桥机场',
    shortName: '虹桥',
    city: '上海',
    type: '沿海机场',
    longitude: 121.3363,
    latitude: 31.1979,
    x: 80.4,
    y: 38.1,
    mapXPercent: 84.5,
    mapYPercent: 47.3,
    labelDx: -14,
    labelDy: 12,
    labelPlacement: 'left',
    currentIndex: 55,
    riskLevel: '中',
    annualAverage: 48,
    highRiskDays: 11,
    mainRiskPeriod: '夏季、傍晚',
    mainWindDirection: '东南风',
    windSpeed: 17,
    mainFactors: ['海风入侵', '繁忙流量耦合'],
    typicalScenario: '海风入侵与高流量叠加时，扰动信号更容易集中在近地层。',
    runwayHeading: '18/36',
    hotspotLabel: '末进近波动带',
    approachDirection: '由北向南',
    trendSeed: 5,
    seasonalBias: 5,
    windRose: [10, 15, 21, 26, 18, 10],
  },
  {
    id: 'guangzhou-baiyun',
    name: '广州白云机场',
    shortName: '白云',
    city: '广州',
    type: '沿海机场',
    longitude: 113.308,
    latitude: 23.3924,
    x: 72.8,
    y: 60.5,
    mapXPercent: 69.2,
    mapYPercent: 61,
    labelDx: -16,
    labelDy: -12,
    labelPlacement: 'left',
    currentIndex: 78,
    riskLevel: '较高',
    annualAverage: 61,
    highRiskDays: 14,
    mainRiskPeriod: '夏季、午后至傍晚',
    mainWindDirection: '南风',
    windSpeed: 20,
    mainFactors: ['对流外围风场', '海风辐合'],
    typicalScenario: '午后海风辐合增强时，风扰指数容易进入较高区间。',
    runwayHeading: '02L/20R',
    hotspotLabel: '南侧辐合带',
    approachDirection: '由北向南',
    trendSeed: 7,
    seasonalBias: 7,
    windRose: [8, 12, 18, 27, 23, 12],
  },
  {
    id: 'shenzhen-baoan',
    name: '深圳宝安机场',
    shortName: '宝安',
    city: '深圳',
    type: '沿海机场',
    longitude: 113.8107,
    latitude: 22.6393,
    x: 74.6,
    y: 64.2,
    mapXPercent: 71.7,
    mapYPercent: 64,
    labelDx: 14,
    labelDy: 10,
    labelPlacement: 'right',
    currentIndex: 80,
    riskLevel: '较高',
    annualAverage: 64,
    highRiskDays: 15,
    mainRiskPeriod: '夏秋、午后',
    mainWindDirection: '东南风',
    windSpeed: 21,
    mainFactors: ['海风增强', '低空风切变'],
    typicalScenario: '海风增强阶段低空切变更突出，午后指数抬升更快。',
    runwayHeading: '16/34',
    hotspotLabel: '海风切变区',
    approachDirection: '由北向南',
    trendSeed: 8,
    seasonalBias: 8,
    windRose: [7, 11, 19, 30, 21, 12],
  },
  {
    id: 'chengdu-tianfu',
    name: '成都天府机场',
    shortName: '天府',
    city: '成都',
    type: '复杂地形机场',
    longitude: 104.4419,
    latitude: 30.3125,
    x: 55.3,
    y: 47.8,
    mapXPercent: 53.9,
    mapYPercent: 50.9,
    labelDx: -14,
    labelDy: -12,
    labelPlacement: 'left',
    currentIndex: 76,
    riskLevel: '较高',
    annualAverage: 60,
    highRiskDays: 13,
    mainRiskPeriod: '春季、午后',
    mainWindDirection: '偏西风',
    windSpeed: 18,
    mainFactors: ['盆地边界风', '地形通道效应'],
    typicalScenario: '春季午后盆地边界风增强时，局地通道效应更明显。',
    runwayHeading: '01/19',
    hotspotLabel: '西侧通道风区',
    approachDirection: '由南向北',
    trendSeed: 10,
    seasonalBias: 4,
    windRose: [13, 18, 21, 14, 11, 23],
  },
  {
    id: 'chongqing-jiangbei',
    name: '重庆江北机场',
    shortName: '江北',
    city: '重庆',
    type: '山地影响机场',
    longitude: 106.6416,
    latitude: 29.7192,
    x: 58.6,
    y: 50.8,
    mapXPercent: 57.5,
    mapYPercent: 52,
    labelDx: 14,
    labelDy: -12,
    labelPlacement: 'right',
    currentIndex: 78,
    riskLevel: '较高',
    annualAverage: 62,
    highRiskDays: 16,
    mainRiskPeriod: '春夏、午后',
    mainWindDirection: '西南风',
    windSpeed: 19,
    mainFactors: ['山谷风转换', '局地对流扰动'],
    typicalScenario: '山谷风转换频繁时，午后低空扰动更集中。',
    runwayHeading: '02L/20R',
    hotspotLabel: '山谷风叠加区',
    approachDirection: '由北向南',
    trendSeed: 11,
    seasonalBias: 5,
    windRose: [12, 16, 18, 13, 10, 31],
  },
  {
    id: 'kunming-changshui',
    name: '昆明长水机场',
    shortName: '长水',
    city: '昆明',
    type: '高原 / 复杂地形',
    longitude: 102.9292,
    latitude: 25.1019,
    x: 49,
    y: 62.2,
    mapXPercent: 50.5,
    mapYPercent: 60.2,
    labelDx: 14,
    labelDy: -12,
    labelPlacement: 'right',
    currentIndex: 82,
    riskLevel: '较高',
    annualAverage: 64,
    highRiskDays: 18,
    mainRiskPeriod: '春季、午后',
    mainWindDirection: '西南风',
    windSpeed: 22,
    mainFactors: ['高原热力差异', '风向波动增强', '地形抬升'],
    typicalScenario: '春季午后风向波动增强时，低高度阶段指数抬升更明显。',
    runwayHeading: '03/21',
    hotspotLabel: '西南来流热点',
    approachDirection: '由东北向西南',
    trendSeed: 13,
    seasonalBias: 9,
    windRose: [9, 14, 17, 12, 11, 37],
  },
  {
    id: 'xian-xianyang',
    name: '西安咸阳机场',
    shortName: '咸阳',
    city: '西安',
    type: '内陆机场',
    longitude: 108.7516,
    latitude: 34.4471,
    x: 63.2,
    y: 36.7,
    mapXPercent: 60.7,
    mapYPercent: 43.2,
    labelDx: -14,
    labelDy: 12,
    labelPlacement: 'left',
    currentIndex: 51,
    riskLevel: '中',
    annualAverage: 45,
    highRiskDays: 10,
    mainRiskPeriod: '春季、上午',
    mainWindDirection: '西北风',
    windSpeed: 16,
    mainFactors: ['冷暖空气过渡', '平原边界层变化'],
    typicalScenario: '冷暖空气过渡时，上午指数波动幅度更明显。',
    runwayHeading: '05/23',
    hotspotLabel: '西北入流区',
    approachDirection: '由东北向西南',
    trendSeed: 14,
    seasonalBias: 2,
    windRose: [17, 19, 18, 13, 10, 12],
  },
  {
    id: 'guiyang-longdongbao',
    name: '贵阳龙洞堡机场',
    shortName: '龙洞堡',
    city: '贵阳',
    type: '山地影响机场',
    longitude: 106.8013,
    latitude: 26.5385,
    x: 57.4,
    y: 58.6,
    mapXPercent: 57.7,
    mapYPercent: 57.8,
    labelDx: 14,
    labelDy: 10,
    labelPlacement: 'right',
    currentIndex: 76,
    riskLevel: '较高',
    annualAverage: 60,
    highRiskDays: 14,
    mainRiskPeriod: '春季、午后',
    mainWindDirection: '偏南风',
    windSpeed: 18,
    mainFactors: ['山地环流', '地形扰动叠加'],
    typicalScenario: '山地环流增强时，局地风向摆动与指数抬升更同步。',
    runwayHeading: '01/19',
    hotspotLabel: '南侧回流区',
    approachDirection: '由北向南',
    trendSeed: 19,
    seasonalBias: 5,
    windRose: [10, 13, 16, 17, 15, 29],
  },
  {
    id: 'hangzhou-xiaoshan',
    name: '杭州萧山机场',
    shortName: '萧山',
    city: '杭州',
    type: '沿海机场',
    longitude: 120.4332,
    latitude: 30.2295,
    x: 78.8,
    y: 41.6,
    mapXPercent: 82.5,
    mapYPercent: 49.3,
    labelDx: 14,
    labelDy: 10,
    labelPlacement: 'right',
    currentIndex: 57,
    riskLevel: '中',
    annualAverage: 49,
    highRiskDays: 11,
    mainRiskPeriod: '梅雨季、午后',
    mainWindDirection: '东南风',
    windSpeed: 17,
    mainFactors: ['海陆风作用', '湿对流外围扰动'],
    typicalScenario: '梅雨季午后海陆风与湿对流外围扰动叠加时，指数缓慢抬升。',
    runwayHeading: '07/25',
    hotspotLabel: '海风过渡区',
    approachDirection: '由西北向东南',
    trendSeed: 21,
    seasonalBias: 4,
    windRose: [8, 13, 20, 27, 20, 12],
  },
  {
    id: 'qingdao-jiaodong',
    name: '青岛胶东机场',
    shortName: '胶东',
    city: '青岛',
    type: '沿海机场',
    longitude: 120.0885,
    latitude: 36.2661,
    x: 79.4,
    y: 29.4,
    mapXPercent: 80.5,
    mapYPercent: 45.2,
    labelDx: 14,
    labelDy: -12,
    labelPlacement: 'right',
    currentIndex: 53,
    riskLevel: '中',
    annualAverage: 47,
    highRiskDays: 10,
    mainRiskPeriod: '春秋、傍晚',
    mainWindDirection: '东北风',
    windSpeed: 16,
    mainFactors: ['海风入侵', '沿海边界层波动'],
    typicalScenario: '春秋傍晚海风入侵时，沿海边界层波动更容易触发中等风险。',
    runwayHeading: '17/35',
    hotspotLabel: '东北入流带',
    approachDirection: '由南向北',
    trendSeed: 23,
    seasonalBias: 3,
    windRose: [22, 24, 18, 12, 9, 15],
  },
];

export const airportRiskProfiles: AirportRiskProfile[] = airportSeeds.map((airport) => {
  const base = airport.annualAverage;
  const amplitude = Math.max(6, (airport.currentIndex - airport.annualAverage) * 0.9);
  const phase = airport.trendSeed;

  return {
    ...airport,
    currentIndex: normalizeAirportIndex(airport.currentIndex),
    annualAverage: normalizeAirportIndex(airport.annualAverage),
    trend: {
      month: buildSeries(12, base, amplitude * 0.85, phase, 4, 3).map(normalizeAirportIndex),
      week: buildSeries(52, base, amplitude * 0.5, phase, 3, 41).map(normalizeAirportIndex),
      day: buildSeries(30, base + 1, amplitude * 0.42, phase, 2, 21).map(normalizeAirportIndex),
      hour: buildSeries(7, base + 3, amplitude, phase, 1, 4).map(normalizeAirportIndex),
    },
  };
});

export const airportMonthlyDailyTrends: Record<string, Partial<Record<AirportTrendMonth, DailyAirportTrendPoint[]>>> = {
  'shanghai-hongqiao': {
    '2026-05': buildDailyMonthlyTrend(31, 55, 6.2, 2.6, 1.8),
    '2026-04': buildDailyMonthlyTrend(30, 51, 5.6, 1.8, 1.2),
    '2026-03': buildDailyMonthlyTrend(31, 48, 5.1, 0.7, 0.8),
  },
  'beijing-daxing': {
    '2026-05': buildDailyMonthlyTrend(31, 46, 4.8, 4.1, -0.5),
    '2026-04': buildDailyMonthlyTrend(30, 44, 4.4, 3.2, 0.2),
    '2026-03': buildDailyMonthlyTrend(31, 42, 5.3, 2.3, 1.1),
  },
  'chengdu-tianfu': {
    '2026-05': buildDailyMonthlyTrend(31, 60, 5.8, 5.4, 0.7),
    '2026-04': buildDailyMonthlyTrend(30, 57, 6.1, 4.4, 1.4),
    '2026-03': buildDailyMonthlyTrend(31, 53, 5.7, 3.5, 2.1),
  },
};

export function getAirportMonthlyDailyTrend(airportId: string, month: AirportTrendMonth) {
  const storedTrend = airportMonthlyDailyTrends[airportId]?.[month];

  if (storedTrend) {
    return storedTrend;
  }

  const profile = airportRiskProfiles.find((airport) => airport.id === airportId);
  const [yearPart, monthPart] = month.split('-');
  const year = Number(yearPart);
  const monthNumber = Number(monthPart);
  const days = getDaysInMonth(year, monthNumber);
  const base = (profile ? normalizeWindDisturbanceIndex(profile.annualAverage) * 100 : 48) + ((monthNumber - 6) * 0.9);
  const amplitude = 4.8 + ((Array.from(airportId).reduce((sum, char) => sum + char.charCodeAt(0), 0) + monthNumber) % 5) * 0.7;
  const phase = (year - 2020) * 0.9 + monthNumber * 0.62 + (profile?.windSpeed ?? 16) * 0.08;
  const tilt = ((monthNumber % 5) - 2) * 0.55;

  return buildDailyMonthlyTrend(days, base, amplitude, phase, tilt);
}

function normalizeAirportIndex(value: number) {
  return windIndexFromUnit(value / 100);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function buildDailyMonthlyTrend(days: number, baseline: number, amplitude: number, phase: number, tilt: number): DailyAirportTrendPoint[] {
  return Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const smoothWave =
      Math.sin((index + phase) / 4.4) * amplitude +
      Math.cos((index + phase * 1.3) / 8.2) * amplitude * 0.45 +
      tilt * (index / Math.max(days - 1, 1) - 0.5);
    const synopticPulse = Math.exp(-((index - days * 0.68) ** 2) / 34) * amplitude * 0.36;
    const value = Math.min(82, Math.max(28, baseline + smoothWave + synopticPulse));
    const halfWidth = 14.5 + Math.abs(Math.sin((index + phase) / 5.8)) * 3.6;

    return {
      day,
      index: normalizeAirportIndex(value),
      lower: normalizeAirportIndex(Math.max(0, value - halfWidth)),
      upper: normalizeAirportIndex(Math.min(100, value + halfWidth)),
    };
  });
}

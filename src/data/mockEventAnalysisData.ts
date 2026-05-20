export type EventQuadrant = '重点关注' | '运行韧性较强' | '非风扰主导' | '稳定运行';

export type EventAttribution = {
  windSpeedChange: number;
  windDirectionFluctuation: number;
  lowAltitudeDisturbance: number;
  other: number;
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

export const eventScatterThresholds = {
  averageIndex: 0.6,
  eventCount: 52,
};

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
  重点关注: {
    shortLabel: '高指数 / 高事件',
    description: '重点关注',
    pillClass: 'border-[#c78667]/35 bg-[#f6e3d8] text-[#8d4a47]',
    dotColor: '#b56b4a',
    glowColor: 'rgba(181,107,74,0.2)',
    accentBar: 'bg-[#b56b4a]',
  },
  运行韧性较强: {
    shortLabel: '高指数 / 低事件',
    description: '运行韧性较强',
    pillClass: 'border-[#7a907f]/35 bg-[#e5efe7] text-[#547465]',
    dotColor: '#5c7c6c',
    glowColor: 'rgba(92,124,108,0.18)',
    accentBar: 'bg-[#5c7c6c]',
  },
  非风扰主导: {
    shortLabel: '低指数 / 高事件',
    description: '非风扰主导',
    pillClass: 'border-[#d1b57a]/40 bg-[#f7edd8] text-[#9a7b39]',
    dotColor: '#b79657',
    glowColor: 'rgba(183,150,87,0.2)',
    accentBar: 'bg-[#b79657]',
  },
  稳定运行: {
    shortLabel: '低指数 / 低事件',
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
    averageIndex: 0.72,
    eventCount: 68,
    quadrant: '重点关注',
    highRiskPeriod: '春季午后',
    mainFactor: '风向波动',
    correlationScore: 0.82,
    attribution: {
      windSpeedChange: 38,
      windDirectionFluctuation: 26,
      lowAltitudeDisturbance: 21,
      other: 15,
    },
  },
  {
    id: 'lhasa-gongga',
    name: '拉萨贡嘎',
    averageIndex: 0.76,
    eventCount: 61,
    quadrant: '重点关注',
    highRiskPeriod: '冬春交替',
    mainFactor: '低高度扰动',
    correlationScore: 0.79,
    attribution: {
      windSpeedChange: 24,
      windDirectionFluctuation: 23,
      lowAltitudeDisturbance: 37,
      other: 16,
    },
  },
  {
    id: 'urumqi-diwopu',
    name: '乌鲁木齐地窝堡',
    averageIndex: 0.67,
    eventCount: 44,
    quadrant: '运行韧性较强',
    highRiskPeriod: '冬季夜间',
    mainFactor: '风速变化',
    correlationScore: 0.74,
    attribution: {
      windSpeedChange: 41,
      windDirectionFluctuation: 22,
      lowAltitudeDisturbance: 18,
      other: 19,
    },
  },
  {
    id: 'guangzhou-baiyun',
    name: '广州白云',
    averageIndex: 0.64,
    eventCount: 55,
    quadrant: '重点关注',
    highRiskPeriod: '夏季傍晚',
    mainFactor: '风速变化',
    correlationScore: 0.71,
    attribution: {
      windSpeedChange: 35,
      windDirectionFluctuation: 24,
      lowAltitudeDisturbance: 19,
      other: 22,
    },
  },
  {
    id: 'shanghai-pudong',
    name: '上海浦东',
    averageIndex: 0.57,
    eventCount: 63,
    quadrant: '非风扰主导',
    highRiskPeriod: '梅雨季晨间',
    mainFactor: '其他因素',
    correlationScore: 0.48,
    attribution: {
      windSpeedChange: 22,
      windDirectionFluctuation: 18,
      lowAltitudeDisturbance: 17,
      other: 43,
    },
  },
  {
    id: 'qingdao-jiaodong',
    name: '青岛胶东',
    averageIndex: 0.53,
    eventCount: 54,
    quadrant: '非风扰主导',
    highRiskPeriod: '秋季午后',
    mainFactor: '其他因素',
    correlationScore: 0.45,
    attribution: {
      windSpeedChange: 24,
      windDirectionFluctuation: 16,
      lowAltitudeDisturbance: 18,
      other: 42,
    },
  },
  {
    id: 'beijing-capital',
    name: '北京首都',
    averageIndex: 0.49,
    eventCount: 43,
    quadrant: '稳定运行',
    highRiskPeriod: '春季白天',
    mainFactor: '风速变化',
    correlationScore: 0.39,
    attribution: {
      windSpeedChange: 29,
      windDirectionFluctuation: 21,
      lowAltitudeDisturbance: 18,
      other: 32,
    },
  },
  {
    id: 'chengdu-tianfu',
    name: '成都天府',
    averageIndex: 0.58,
    eventCount: 40,
    quadrant: '稳定运行',
    highRiskPeriod: '夏季午后',
    mainFactor: '风向波动',
    correlationScore: 0.43,
    attribution: {
      windSpeedChange: 23,
      windDirectionFluctuation: 33,
      lowAltitudeDisturbance: 20,
      other: 24,
    },
  },
  {
    id: 'shenzhen-baoan',
    name: '深圳宝安',
    averageIndex: 0.46,
    eventCount: 58,
    quadrant: '非风扰主导',
    highRiskPeriod: '夏秋雷雨季',
    mainFactor: '其他因素',
    correlationScore: 0.36,
    attribution: {
      windSpeedChange: 18,
      windDirectionFluctuation: 19,
      lowAltitudeDisturbance: 16,
      other: 47,
    },
  },
  {
    id: 'chongqing-jiangbei',
    name: '重庆江北',
    averageIndex: 0.62,
    eventCount: 47,
    quadrant: '运行韧性较强',
    highRiskPeriod: '秋季夜航时段',
    mainFactor: '低高度扰动',
    correlationScore: 0.67,
    attribution: {
      windSpeedChange: 26,
      windDirectionFluctuation: 21,
      lowAltitudeDisturbance: 34,
      other: 19,
    },
  },
  {
    id: 'guiyang-longdongbao',
    name: '贵阳龙洞堡',
    averageIndex: 0.68,
    eventCount: 39,
    quadrant: '运行韧性较强',
    highRiskPeriod: '春季夜间',
    mainFactor: '风向波动',
    correlationScore: 0.69,
    attribution: {
      windSpeedChange: 21,
      windDirectionFluctuation: 39,
      lowAltitudeDisturbance: 24,
      other: 16,
    },
  },
  {
    id: 'xian-xianyang',
    name: '西安咸阳',
    averageIndex: 0.54,
    eventCount: 45,
    quadrant: '稳定运行',
    highRiskPeriod: '春季午后',
    mainFactor: '风速变化',
    correlationScore: 0.41,
    attribution: {
      windSpeedChange: 31,
      windDirectionFluctuation: 20,
      lowAltitudeDisturbance: 18,
      other: 31,
    },
  },
];

export const defaultEventAirportId = 'kunming-changshui';

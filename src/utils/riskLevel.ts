import { toWindDisturbanceIndex, WIND_DISTURBANCE_INDEX_NORMAL_HIGH, WIND_DISTURBANCE_INDEX_NORMAL_LOW } from './indexScale';

export type RiskLevel = '低' | '中' | '偏高' | '高';

export const getRiskLevel = (index: number): RiskLevel => {
  const displayIndex = toWindDisturbanceIndex(index);

  if (displayIndex >= 2.55) {
    return '高';
  }

  if (displayIndex > WIND_DISTURBANCE_INDEX_NORMAL_HIGH) {
    return '偏高';
  }

  if (displayIndex >= WIND_DISTURBANCE_INDEX_NORMAL_LOW) {
    return '中';
  }

  return '低';
};

export const riskLevelMeta: Record<
  RiskLevel,
  {
    pillClass: string;
    barClass: string;
  }
> = {
  低: {
    pillClass: 'border-[#b7cbbb] bg-[#dce9df] text-[#42634f]',
    barClass: 'bg-[#5c7c6c]',
  },
  中: {
    pillClass: 'border-[#d7c4a0] bg-[#efe3c9] text-[#8a6c37]',
    barClass: 'bg-[#b79657]',
  },
  偏高: {
    pillClass: 'border-[#d4af9f] bg-[#efd8cd] text-[#9c5f41]',
    barClass: 'bg-[#b56b4a]',
  },
  高: {
    pillClass: 'border-[#c59a95] bg-[#ead0d0] text-[#8d4a47]',
    barClass: 'bg-[#8d4a47]',
  },
};

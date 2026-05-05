import type { AirportRiskLevel } from '../data/mockAirportRiskData';

export const airportRiskMeta: Record<
  AirportRiskLevel,
  {
    pillClass: string;
    ringClass: string;
    dotColor: string;
    glowColor: string;
    trendColor: string;
  }
> = {
  低: {
    pillClass: 'border-[#b7cbbb] bg-[#dce9df] text-[#42634f]',
    ringClass: 'border-[#9fbea7]',
    dotColor: '#5c7c6c',
    glowColor: 'rgba(92,124,108,0.18)',
    trendColor: '#5c7c6c',
  },
  中: {
    pillClass: 'border-[#d7c4a0] bg-[#efe3c9] text-[#8a6c37]',
    ringClass: 'border-[#d3b681]',
    dotColor: '#b79657',
    glowColor: 'rgba(183,150,87,0.2)',
    trendColor: '#b79657',
  },
  较高: {
    pillClass: 'border-[#d4af9f] bg-[#efd8cd] text-[#9c5f41]',
    ringClass: 'border-[#c98d6e]',
    dotColor: '#b56b4a',
    glowColor: 'rgba(181,107,74,0.22)',
    trendColor: '#b56b4a',
  },
  高: {
    pillClass: 'border-[#c59a95] bg-[#ead0d0] text-[#8d4a47]',
    ringClass: 'border-[#9d5f5b]',
    dotColor: '#8d4a47',
    glowColor: 'rgba(141,74,71,0.24)',
    trendColor: '#8d4a47',
  },
};


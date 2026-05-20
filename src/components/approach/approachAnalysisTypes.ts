export type AverageDimension = 'season' | 'month' | 'week';

export type TimeRange = [number, number];

export const averageDimensionOptions: Array<{ value: AverageDimension; label: string }> = [
  { value: 'season', label: '季' },
  { value: 'month', label: '月' },
  { value: 'week', label: '周' },
];

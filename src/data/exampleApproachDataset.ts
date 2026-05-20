import { approachMockData } from './mockApproachData';
import type { ParsedFlightIndexRow } from '../utils/parseFlightIndexFile';

export const exampleApproachRows: ParsedFlightIndexRow[] = approachMockData.map((point) => ({
  time: point.time,
  index: point.turbulenceIndex,
}));

export const exampleApproachMeta = {
  flight: 'MU-EXAMPLE-01',
  stage: '进近 / 1000 ft 以下',
  label: 'Example 数据集',
};

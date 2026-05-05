import { useMemo } from 'react';
import type { AirportRiskProfile, TimeScale } from '../../data/mockAirportRiskData';
import { airportTrendLabels } from '../../data/mockAirportRiskData';
import { airportRiskMeta } from '../../utils/airportRiskMeta';

const scaleLabels: Record<TimeScale, string> = {
  year: '年',
  quarter: '季',
  month: '月',
  week: '周',
  day: '日',
  hour: '时',
};

function AirportTrendPanel({
  airport,
  scale,
  onScaleChange,
}: {
  airport: AirportRiskProfile;
  scale: TimeScale;
  onScaleChange: (scale: TimeScale) => void;
}) {
  const tone = airportRiskMeta[airport.riskLevel];
  const labels = airportTrendLabels[scale];
  const values = airport.trend[scale];

  const { pathD, areaD, points, minValue, maxValue } = useMemo(() => {
    const width = 720;
    const height = 280;
    const margin = { top: 24, right: 22, bottom: 48, left: 42 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const min = Math.max(0, Math.floor((rawMin - 8) / 10) * 10);
    const max = Math.min(100, Math.ceil((rawMax + 8) / 10) * 10);

    const mappedPoints = values.map((value, index) => {
      const x = margin.left + (index / Math.max(values.length - 1, 1)) * innerWidth;
      const y = margin.top + ((max - value) / Math.max(max - min, 1)) * innerHeight;
      return { x, y, value, label: labels[index], index };
    });

    const linePath = mappedPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
    const areaPath = `${linePath} L ${mappedPoints[mappedPoints.length - 1].x.toFixed(2)} ${(height - margin.bottom).toFixed(2)} L ${mappedPoints[0].x.toFixed(2)} ${(height - margin.bottom).toFixed(2)} Z`;

    return {
      pathD: linePath,
      areaD: areaPath,
      points: mappedPoints,
      minValue: min,
      maxValue: max,
    };
  }, [labels, values]);

  const yTicks = useMemo(() => {
    const step = Math.max(10, Math.round((maxValue - minValue) / 4 / 5) * 5);
    return Array.from({ length: 5 }, (_, index) => minValue + step * index).filter((tick) => tick <= maxValue);
  }, [maxValue, minValue]);

  const visibleLabelIndexes = useMemo(() => {
    if (scale === 'week') {
      return new Set([0, 7, 15, 23, 31, 39, 47, 51]);
    }

    if (scale === 'day') {
      return new Set([0, 4, 9, 14, 19, 24, 29]);
    }

    return new Set(points.map((point) => point.index));
  }, [points, scale]);

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">风扰指数时序变化</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(scaleLabels) as TimeScale[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onScaleChange(item)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                scale === item
                  ? 'border-accent/20 bg-accent text-white shadow-accent'
                  : 'border-border/80 bg-white/80 text-muted-foreground hover:border-accent/20 hover:text-foreground'
              }`}
            >
              {scaleLabels[item]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-border/75 bg-white/85 p-4 sm:p-5">
        <svg viewBox="0 0 720 280" className="h-[280px] w-full">
          <defs>
            <linearGradient id="airportTrendLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5c7c6c" />
              <stop offset="100%" stopColor={tone.trendColor} />
            </linearGradient>
            <linearGradient id="airportTrendArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tone.glowColor} />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const y = 24 + ((maxValue - tick) / Math.max(maxValue - minValue, 1)) * (280 - 24 - 48);
            return (
              <g key={tick}>
                <line x1="42" x2="698" y1={y} y2={y} stroke="#d8cdbb" strokeDasharray="4 6" />
                <text x="30" y={y + 4} textAnchor="end" fontSize="12" fill="#6d756e">
                  {tick}
                </text>
              </g>
            );
          })}

          {points
            .filter((point) => visibleLabelIndexes.has(point.index))
            .map((point) => (
              <text key={`label-${point.index}`} x={point.x} y="254" textAnchor="middle" fontSize="12" fill="#6d756e">
                {point.label}
              </text>
            ))}

          <path d={areaD} fill="url(#airportTrendArea)" />
          <path d={pathD} fill="none" stroke="url(#airportTrendLine)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((point) => {
            const isHigh = point.value >= 60;
            return (
              <g key={`point-${point.index}`}>
                {isHigh && <circle cx={point.x} cy={point.y} r="10" fill={tone.glowColor} />}
                <circle cx={point.x} cy={point.y} r={isHigh ? 4.8 : 3.8} fill={isHigh ? tone.trendColor : '#5c7c6c'} stroke="#fff9f2" strokeWidth="2.3" />
              </g>
            );
          })}

          <text x="18" y="18" fontSize="12" fill="#6d756e" transform="rotate(-90 18 18)">
            风扰指数
          </text>
        </svg>
      </div>
    </section>
  );
}

export default AirportTrendPanel;

import { useMemo, useState } from 'react';
import type { AirportRiskProfile, TimeScale } from '../../data/mockAirportRiskData';
import { airportTrendLabels } from '../../data/mockAirportRiskData';
import { airportRiskMeta } from '../../utils/airportRiskMeta';

type ChartPoint = {
  x: number;
  y: number;
  value: number;
  label: string;
  index: number;
};

type TrendEvent = ChartPoint & {
  type: string;
  level: string;
};

const scaleLabels: Record<TimeScale, string> = {
  month: '月',
  week: '周',
  day: '日',
  hour: '时',
};

const axisLabels: Record<TimeScale, string> = {
  month: '月份',
  week: '近 52 周',
  day: '近 30 天',
  hour: '小时',
};

const chart = {
  width: 980,
  height: 460,
  margin: { top: 42, right: 44, bottom: 82, left: 78 },
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
  const [hoveredEvent, setHoveredEvent] = useState<TrendEvent | null>(null);
  const tone = airportRiskMeta[airport.riskLevel];
  const labels = airportTrendLabels[scale];
  const values = airport.trend[scale];

  const { pathD, areaD, points, yTicks } = useMemo(() => {
    const innerWidth = chart.width - chart.margin.left - chart.margin.right;
    const innerHeight = chart.height - chart.margin.top - chart.margin.bottom;

    const mappedPoints = values.map((value, index) => {
      const x = chart.margin.left + (index / Math.max(values.length - 1, 1)) * innerWidth;
      const y = chart.margin.top + ((100 - value) / 100) * innerHeight;
      return { x, y, value, label: labels[index], index };
    });

    const linePath = mappedPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
    const areaPath = `${linePath} L ${mappedPoints[mappedPoints.length - 1].x.toFixed(2)} ${(chart.height - chart.margin.bottom).toFixed(2)} L ${mappedPoints[0].x.toFixed(2)} ${(chart.height - chart.margin.bottom).toFixed(2)} Z`;

    return {
      pathD: linePath,
      areaD: areaPath,
      points: mappedPoints,
      yTicks: [0, 20, 40, 60, 80, 100],
    };
  }, [labels, values]);

  const events = useMemo(() => buildTrendEvents(points, airport.id, scale), [airport.id, points, scale]);
  const visibleLabelIndexes = useMemo(() => buildVisibleLabelIndexes(points, scale), [points, scale]);

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="section-kicker bg-white/70">时序风险</div>
          <h2 className="mt-3 text-2xl font-bold text-foreground">风扰指数时序变化</h2>
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

      <div className="mt-6 rounded-[28px] border border-border/75 bg-white/88 p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="h-1 w-8 rounded-full bg-[#5c7c6c]" />
            风扰指数
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rotate-45 rounded-[3px] bg-[#bf3945]" />
            风险事件
          </span>
        </div>

        <div className="relative">
          <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-[430px] w-full lg:h-[500px]" role="img" aria-label="机场风扰指数与风险事件时序图">
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

            <line
              x1={chart.margin.left}
              x2={chart.width - chart.margin.right}
              y1={chart.height - chart.margin.bottom}
              y2={chart.height - chart.margin.bottom}
              stroke="#8a8f87"
              strokeWidth="1.6"
            />
            <line
              x1={chart.margin.left}
              x2={chart.margin.left}
              y1={chart.margin.top}
              y2={chart.height - chart.margin.bottom}
              stroke="#8a8f87"
              strokeWidth="1.6"
            />

            {yTicks.map((tick) => {
              const y = chart.margin.top + ((100 - tick) / 100) * (chart.height - chart.margin.top - chart.margin.bottom);
              return (
                <g key={tick}>
                  <line
                    x1={chart.margin.left}
                    x2={chart.width - chart.margin.right}
                    y1={y}
                    y2={y}
                    stroke="#d8cdbb"
                    strokeDasharray="4 6"
                  />
                  <text x={chart.margin.left - 16} y={y + 5} textAnchor="end" fontSize="15" fill="#4f5a52">
                    {tick}
                  </text>
                </g>
              );
            })}

            {points
              .filter((point) => visibleLabelIndexes.has(point.index))
              .map((point) => (
                <text key={`label-${point.index}`} x={point.x} y={chart.height - 36} textAnchor="middle" fontSize="14" fill="#4f5a52">
                  {point.label}
                </text>
              ))}

            <path d={areaD} fill="url(#airportTrendArea)" />
            <path d={pathD} fill="none" stroke="url(#airportTrendLine)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />

            {points.map((point) => {
              const isHigh = point.value >= 60;
              return (
                <g key={`point-${point.index}`}>
                  {isHigh && <circle cx={point.x} cy={point.y} r="9" fill={tone.glowColor} />}
                  <circle cx={point.x} cy={point.y} r={isHigh ? 4.6 : 3.7} fill={isHigh ? tone.trendColor : '#5c7c6c'} stroke="#fff9f2" strokeWidth="2.1" />
                </g>
              );
            })}

            {events.map((event) => (
              <g
                key={`event-${event.index}-${event.type}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredEvent(event)}
                onMouseLeave={() => setHoveredEvent((current) => (current?.index === event.index ? null : current))}
                onFocus={() => setHoveredEvent(event)}
                onBlur={() => setHoveredEvent((current) => (current?.index === event.index ? null : current))}
                tabIndex={0}
                role="button"
                aria-label={`${event.label} ${event.type}`}
              >
                <circle cx={event.x} cy={event.y} r="13" fill="rgba(191,57,69,0.16)" />
                <path
                  d={`M ${event.x} ${event.y - 9} L ${event.x + 8} ${event.y + 7} L ${event.x - 8} ${event.y + 7} Z`}
                  fill={event.level === '高' ? '#9f2d56' : '#bf3945'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            ))}

            <text
              x={24}
              y={(chart.height - chart.margin.bottom + chart.margin.top) / 2}
              textAnchor="middle"
              fontSize="16"
              fontWeight="700"
              fill="#2f493b"
              transform={`rotate(-90 24 ${(chart.height - chart.margin.bottom + chart.margin.top) / 2})`}
            >
              风扰指数
            </text>
            <text
              x={(chart.width + chart.margin.left - chart.margin.right) / 2}
              y={chart.height - 8}
              textAnchor="middle"
              fontSize="16"
              fontWeight="700"
              fill="#2f493b"
            >
              {axisLabels[scale]}
            </text>
          </svg>

          {hoveredEvent && (
            <div className="absolute right-4 top-4 z-10 w-[230px] rounded-[20px] border border-[#ead9cf] bg-white/95 p-4 text-sm shadow-soft backdrop-blur-xl">
              <div className="font-bold text-foreground">{hoveredEvent.label} 风险事件</div>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-muted-foreground">
                <span>风扰指数</span>
                <strong className="text-right text-foreground">{hoveredEvent.value}</strong>
                <span>事件类型</span>
                <strong className="text-right text-foreground">{hoveredEvent.type}</strong>
                <span>事件等级</span>
                <strong className="text-right text-[#9f2d56]">{hoveredEvent.level}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function buildVisibleLabelIndexes(points: ChartPoint[], scale: TimeScale) {
  if (scale === 'week') {
    return new Set([0, 7, 15, 23, 31, 39, 47, 51]);
  }

  if (scale === 'day') {
    return new Set([0, 4, 9, 14, 19, 24, 29]);
  }

  return new Set(points.map((point) => point.index));
}

function buildTrendEvents(points: ChartPoint[], airportId: string, scale: TimeScale): TrendEvent[] {
  const eventTypes = ['不稳定进近', '风切变告警', '复飞风险', '姿态修正偏大'];
  const seed = Array.from(airportId).reduce((sum, char) => sum + char.charCodeAt(0), scale.length * 17);
  const count = scale === 'hour' ? 2 : scale === 'month' ? 3 : 4;
  const used = new Set<number>();

  return Array.from({ length: count }, (_, order) => {
    const preferred = Math.round(((seed * (order + 3) + order * 11) % Math.max(points.length, 1)));
    let index = Math.min(points.length - 1, Math.max(0, preferred));

    while (used.has(index) && index < points.length - 1) {
      index += 1;
    }

    used.add(index);
    const point = points[index];
    return {
      ...point,
      type: eventTypes[(seed + order) % eventTypes.length],
      level: point.value >= 68 ? '高' : '较高',
    };
  }).sort((left, right) => left.index - right.index);
}

export default AirportTrendPanel;

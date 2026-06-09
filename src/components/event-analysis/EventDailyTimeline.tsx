import { useMemo, useState } from 'react';
import type { DailyEventCountPoint, EventAnalysisAirport } from '../../data/mockEventAnalysisData';

type EventDailyTimelineProps = {
  airport: EventAnalysisAirport;
  year: string;
  month: string;
  data: DailyEventCountPoint[];
};

type ChartPoint = DailyEventCountPoint & {
  x: number;
  y: number;
};

const WIDTH = 920;
const HEIGHT = 450;
const MARGIN = { top: 38, right: 34, bottom: 62, left: 70 };

function EventDailyTimeline({ airport, year, month, data }: EventDailyTimelineProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const monthLabel = `${year}年${Number(month)}月`;
  const yTicks = buildCountTicks();
  const yAxisMax = yTicks[yTicks.length - 1] ?? 15;
  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const dayStep = innerWidth / Math.max(data.length, 1);
  const barWidth = Math.max(6, dayStep * 0.62);

  const points = useMemo<ChartPoint[]>(
    () =>
      data.map((item, index) => ({
        ...item,
        x: MARGIN.left + index * dayStep + dayStep / 2,
        y: HEIGHT - MARGIN.bottom - (item.count / Math.max(yAxisMax, 1)) * innerHeight,
      })),
    [data, dayStep, innerHeight, yAxisMax],
  );

  const visibleDays = buildVisibleDays(data.length);
  const hoveredPoint = hoveredDay ? points.find((point) => point.day === hoveredDay) : null;
  const tooltipStyle = hoveredPoint
    ? {
        left: `${(hoveredPoint.x / WIDTH) * 100}%`,
        top: `${(hoveredPoint.y / HEIGHT) * 100}%`,
        transform: hoveredPoint.x > WIDTH * 0.72 ? 'translate(calc(-100% - 12px), -100%)' : 'translate(12px, -100%)',
      }
    : undefined;

  return (
    <section className="surface-card h-full p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">日降落风险数时序图</h2>
        </div>
        <div className="text-base font-bold text-[#26362d] sm:text-lg">
          {airport.name} / {monthLabel}
        </div>
      </div>

      <div className="relative mt-5 rounded-[30px] border border-border/75 bg-white/95 p-4 shadow-sm sm:p-5">
        <div className="pointer-events-none absolute right-6 top-5 z-10 inline-flex items-center gap-2 rounded-full border border-border/70 bg-white px-3 py-1.5 text-sm font-semibold text-[#26362d] shadow-sm">
          <span className="h-3 w-8 rounded-full bg-[#5c7c6c]" />
          每日降落风险数
        </div>

        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-[390px] w-full xl:h-[470px]" role="img" aria-label={`${monthLabel}${airport.name}每日降落风险数`}>
          {yTicks.map((tick) => {
            const y = HEIGHT - MARGIN.bottom - (tick / Math.max(yAxisMax, 1)) * innerHeight;
            return (
              <g key={tick}>
                <line x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={y} y2={y} stroke="#d8cdbb" strokeDasharray="4 6" />
                <text x={MARGIN.left - 16} y={y + 4} textAnchor="end" fontSize="15" fill="#3f4d43">
                  {tick}
                </text>
              </g>
            );
          })}

          {visibleDays.map((day) => {
            const x = MARGIN.left + (day - 1) * dayStep + dayStep / 2;
            return (
              <text key={day} x={x} y={HEIGHT - 28} textAnchor="middle" fontSize="15" fill="#3f4d43">
                {day}
              </text>
            );
          })}

          <line x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={HEIGHT - MARGIN.bottom} y2={HEIGHT - MARGIN.bottom} stroke="#8b8b7f" strokeWidth="1.4" />
          <line x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} stroke="#8b8b7f" strokeWidth="1.4" />

          {points.map((point) => (
            <rect
              key={point.day}
              x={point.x - barWidth / 2}
              y={point.y}
              width={barWidth}
              height={HEIGHT - MARGIN.bottom - point.y}
              rx="4"
              fill={point.day === hoveredDay ? '#2f493b' : '#5c7c6c'}
              opacity={point.day === hoveredDay ? 0.95 : 0.78}
              className="cursor-crosshair"
              onMouseEnter={() => setHoveredDay(point.day)}
              onMouseLeave={() => setHoveredDay((current) => (current === point.day ? null : current))}
            />
          ))}

          <text
            x={24}
            y={(MARGIN.top + HEIGHT - MARGIN.bottom) / 2}
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill="#203129"
            transform={`rotate(-90 24 ${(MARGIN.top + HEIGHT - MARGIN.bottom) / 2})`}
          >
            风险数
          </text>
          <text x={(MARGIN.left + WIDTH - MARGIN.right) / 2} y={HEIGHT - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#203129">
            日期（日）
          </text>
        </svg>

        {hoveredPoint && tooltipStyle && (
          <div className="pointer-events-none absolute z-20 rounded-[20px] border border-white/75 bg-white/95 px-4 py-3 text-sm shadow-soft backdrop-blur-xl" style={tooltipStyle}>
            <div className="font-semibold text-foreground">
              {monthLabel}
              {hoveredPoint.day}日
            </div>
            <div className="mt-2 text-muted-foreground">
              降落风险数：<span className="font-semibold text-foreground">{hoveredPoint.count}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function buildVisibleDays(days: number) {
  return [1, 5, 10, 15, 20, 25, days];
}

function buildCountTicks() {
  return [0, 5, 10, 15];
}

export default EventDailyTimeline;

import { useMemo, useState, type CSSProperties } from 'react';
import type { EventAnalysisAirport } from '../../data/mockEventAnalysisData';
import { eventQuadrantMeta, eventScatterThresholds } from '../../data/mockEventAnalysisData';
import { formatWindDisturbanceIndex, WIND_DISTURBANCE_INDEX_MAX, WIND_DISTURBANCE_INDEX_MIN } from '../../utils/indexScale';

type EventScatterPlotProps = {
  airports: EventAnalysisAirport[];
  selectedAirportId: string;
  onSelect: (id: string) => void;
};

const WIDTH = 860;
const HEIGHT = 520;
const MARGIN = { top: 32, right: 34, bottom: 74, left: 78 };
const MIN_INDEX_SPAN = 0.52;

function EventScatterPlot({ airports, selectedAirportId, onSelect }: EventScatterPlotProps) {
  const [hoveredAirportId, setHoveredAirportId] = useState<string | null>(null);

  const indexValues = airports.map((airport) => airport.averageIndex);
  const rawXMin = Math.min(...indexValues);
  const rawXMax = Math.max(...indexValues);
  const rawXCenter = (rawXMin + rawXMax) / 2;
  const xSpan = Math.max(rawXMax - rawXMin + 0.26, MIN_INDEX_SPAN);
  const xMin = Math.max(WIND_DISTURBANCE_INDEX_MIN, rawXCenter - xSpan / 2);
  const xMax = Math.min(WIND_DISTURBANCE_INDEX_MAX, rawXCenter + xSpan / 2);
  const yMin = Math.max(0, Math.min(...airports.map((airport) => airport.eventCount)) - 8);
  const yMax = Math.max(...airports.map((airport) => airport.eventCount)) + 8;
  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const xScale = (value: number) => MARGIN.left + ((value - xMin) / Math.max(xMax - xMin, 0.001)) * innerWidth;
  const yScale = (value: number) => HEIGHT - MARGIN.bottom - ((value - yMin) / Math.max(yMax - yMin, 1)) * innerHeight;

  const points = useMemo(
    () =>
      airports.map((airport) => ({
        ...airport,
        x: xScale(airport.averageIndex),
        y: yScale(airport.eventCount),
      })),
    [airports, xMax, xMin, yMax, yMin],
  );

  const xThreshold = xScale(eventScatterThresholds.averageIndex);
  const yThreshold = yScale(eventScatterThresholds.eventCount);

  const hoveredPoint = points.find((point) => point.id === hoveredAirportId) ?? null;
  const tooltipStyle: CSSProperties | undefined = hoveredPoint
    ? {
        left: `${(hoveredPoint.x / WIDTH) * 100}%`,
        top: `${(hoveredPoint.y / HEIGHT) * 100}%`,
        transform:
          hoveredPoint.x > WIDTH * 0.7
            ? hoveredPoint.y < HEIGHT * 0.3
              ? 'translate(calc(-100% - 14px), 14px)'
              : 'translate(calc(-100% - 14px), calc(-100% - 14px))'
            : hoveredPoint.y < HEIGHT * 0.3
              ? 'translate(14px, 14px)'
              : 'translate(14px, calc(-100% - 14px))',
      }
    : undefined;

  const xTicks = Array.from({ length: 4 }, (_, index) => Number((xMin + ((xMax - xMin) * index) / 3).toFixed(2)));
  const yTicks = [35, 45, 55, 65, 75];

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">指数 - 事件散点象限图</h2>
        </div>
        <div className="text-sm text-muted-foreground">平均风扰指数 / 降落事件数</div>
      </div>

      <div className="relative mt-6 rounded-[30px] border border-border/75 bg-white/85 p-4 sm:p-5">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-[360px] w-full xl:h-[430px]">
          {yTicks.map((tick) => {
            const y = HEIGHT - MARGIN.bottom - ((tick - yMin) / Math.max(yMax - yMin, 1)) * innerHeight;
            return (
              <g key={tick}>
                <line x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={y} y2={y} stroke="#d8cdbb" strokeDasharray="4 6" />
                <text x={MARGIN.left - 16} y={y + 4} textAnchor="end" fontSize="12" fill="#6d756e">
                  {tick}
                </text>
              </g>
            );
          })}

          {xTicks.map((tick) => {
            const x = xScale(tick);
            return (
              <g key={tick}>
                <line x1={x} x2={x} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} stroke="#ece2d4" />
                <text x={x} y={HEIGHT - MARGIN.bottom + 26} textAnchor="middle" fontSize="12" fill="#6d756e">
                  {formatWindDisturbanceIndex(tick)}
                </text>
              </g>
            );
          })}

          <line
            x1={MARGIN.left}
            x2={WIDTH - MARGIN.right}
            y1={HEIGHT - MARGIN.bottom}
            y2={HEIGHT - MARGIN.bottom}
            stroke="#8b8b7f"
            strokeWidth="1.4"
          />
          <line x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} stroke="#8b8b7f" strokeWidth="1.4" />

          <line x1={xThreshold} x2={xThreshold} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} stroke="#aa9678" strokeDasharray="8 8" />
          <line x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={yThreshold} y2={yThreshold} stroke="#aa9678" strokeDasharray="8 8" />

          <text
            x={34}
            y={(MARGIN.top + HEIGHT - MARGIN.bottom) / 2}
            textAnchor="middle"
            fontSize="13"
            fill="#6d756e"
            transform={`rotate(-90 34 ${(MARGIN.top + HEIGHT - MARGIN.bottom) / 2})`}
          >
            降落事件数
          </text>
          <text x={(MARGIN.left + (WIDTH - MARGIN.right)) / 2} y={HEIGHT - 18} textAnchor="middle" fontSize="13" fill="#6d756e">
            平均风扰指数
          </text>

          <text x={WIDTH - MARGIN.right - 8} y={MARGIN.top + 16} textAnchor="end" fontSize="11" fill="#8d4a47">
            高指数 / 高事件：同步偏高
          </text>
          <text x={MARGIN.left + 12} y={MARGIN.top + 16} fontSize="11" fill="#9a7b39">
            低指数 / 高事件：非风扰主导
          </text>
          <text x={WIDTH - MARGIN.right - 8} y={HEIGHT - MARGIN.bottom - 12} textAnchor="end" fontSize="11" fill="#547465">
            高指数 / 低事件：运行韧性较强
          </text>
          <text x={MARGIN.left + 12} y={HEIGHT - MARGIN.bottom - 12} fontSize="11" fill="#7f725f">
            低指数 / 低事件：稳定运行
          </text>

          {points.map((point) => {
            const tone = eventQuadrantMeta[point.quadrant];
            const isSelected = point.id === selectedAirportId;
            return (
              <g key={point.id}>
                <circle cx={point.x} cy={point.y} r={isSelected ? 18 : 12} fill={tone.glowColor} />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isSelected ? 7 : 6}
                  fill={tone.dotColor}
                  stroke="#fffaf4"
                  strokeWidth={isSelected ? 3.5 : 2.5}
                />
                {isSelected && <circle cx={point.x} cy={point.y} r="11" fill="none" stroke={tone.dotColor} strokeOpacity="0.45" strokeWidth="2" />}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="16"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredAirportId(point.id)}
                  onMouseLeave={() => setHoveredAirportId((current) => (current === point.id ? null : current))}
                  onClick={() => onSelect(point.id)}
                />
              </g>
            );
          })}
        </svg>

        {hoveredPoint && tooltipStyle && (
          <div
            className="pointer-events-none absolute z-20 w-60 max-w-[calc(100vw-2.5rem)] rounded-[22px] border border-white/75 bg-white/88 p-4 shadow-soft backdrop-blur-xl"
            style={tooltipStyle}
          >
            <div className="text-sm font-semibold text-foreground">{hoveredPoint.name}</div>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>平均风扰指数</span>
                <span className="font-semibold text-foreground">{formatWindDisturbanceIndex(hoveredPoint.averageIndex)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>降落事件数</span>
                <span className="font-semibold text-foreground">{hoveredPoint.eventCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>象限类别</span>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${eventQuadrantMeta[hoveredPoint.quadrant].pillClass}`}>
                  {hoveredPoint.quadrant}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default EventScatterPlot;

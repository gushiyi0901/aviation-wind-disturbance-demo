import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { AlertTriangle, Gauge, Navigation, RotateCcw, Wind } from 'lucide-react';
import type { ApproachPoint } from '../../data/mockApproachData';
import { riskLevelMeta } from '../../utils/riskLevel';

type ApproachChartProps = {
  data: ApproachPoint[];
  replayToken: number;
  onReplay: () => void;
  onCurrentPointChange: (point: ApproachPoint) => void;
};

type ChartPoint = ApproachPoint & {
  x: number;
  y: number;
};

const CHART_WIDTH = 1120;
const CHART_HEIGHT = 460;
const MARGIN = { top: 30, right: 30, bottom: 76, left: 92 };
const ANIMATION_DURATION = 3400;

function ApproachChart({ data, replayToken, onReplay, onCurrentPointChange }: ApproachChartProps) {
  const [progress, setProgress] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement | null>(null);

  const { points, pathD, xTicks, yTicks } = useMemo(() => {
    const maxTime = data[data.length - 1]?.time ?? 1;
    const innerWidth = CHART_WIDTH - MARGIN.left - MARGIN.right;
    const innerHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

    const mappedPoints: ChartPoint[] = data.map((point) => ({
      ...point,
      x: MARGIN.left + (point.time / maxTime) * innerWidth,
      y: MARGIN.top + ((100 - point.turbulenceIndex) / 100) * innerHeight,
    }));

    const d = mappedPoints
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ');

    return {
      points: mappedPoints,
      pathD: d,
      xTicks: [0, 10, 20, 30, 40, maxTime],
      yTicks: [0, 25, 50, 75, 100],
    };
  }, [data]);

  useEffect(() => {
    if (!pathRef.current) {
      return;
    }

    setPathLength(pathRef.current.getTotalLength());
  }, [pathD]);

  useEffect(() => {
    let animationFrame = 0;
    let startTime: number | null = null;

    setProgress(0);
    setHoveredIndex(null);
    onCurrentPointChange(data[0]);

    const animate = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const nextProgress = Math.min(elapsed / ANIMATION_DURATION, 1);
      const nextIndex = Math.min(data.length - 1, Math.round(nextProgress * (data.length - 1)));

      setProgress(nextProgress);
      onCurrentPointChange(data[nextIndex]);

      if (nextProgress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [data, onCurrentPointChange, replayToken]);

  const activeIndex = Math.min(data.length - 1, Math.max(0, Math.round(progress * (data.length - 1))));
  const scanPoint = points[activeIndex];
  const hoverPoint = hoveredIndex !== null ? points[hoveredIndex] : null;
  const hoverTone = hoverPoint ? riskLevelMeta[hoverPoint.riskLevel] : null;
  const highRiskIndexes = points
    .map((point, index) => ({ point, index }))
    .filter(({ point }) => point.riskLevel === '偏高' || point.riskLevel === '高')
    .map(({ index }) => index);

  const tooltipStyle: CSSProperties | undefined = hoverPoint
    ? {
        left: `${(hoverPoint.x / CHART_WIDTH) * 100}%`,
        top: `${(hoverPoint.y / CHART_HEIGHT) * 100}%`,
        transform:
          hoverPoint.x > CHART_WIDTH * 0.72
            ? hoverPoint.y < CHART_HEIGHT * 0.3
              ? 'translate(calc(-100% - 14px), 14px)'
              : 'translate(calc(-100% - 14px), calc(-100% - 14px))'
            : hoverPoint.y < CHART_HEIGHT * 0.3
              ? 'translate(14px, 14px)'
              : 'translate(14px, calc(-100% - 14px))',
      }
    : undefined;

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="section-kicker bg-white/70">实时曲线</div>
          <h2 className="mt-4 text-2xl font-bold">风扰指数秒级变化曲线</h2>
        </div>

        <button type="button" onClick={onReplay} className="action-secondary">
          <RotateCcw size={16} />
          重新播放
        </button>
      </div>

      <div className="mt-5 rounded-[28px] border border-border/75 bg-white/80 p-4 sm:p-5">
        <div className="relative">
          <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-[420px] w-full sm:h-[460px] xl:h-[520px]">
            {yTicks.map((tick) => {
              const y = MARGIN.top + ((100 - tick) / 100) * (CHART_HEIGHT - MARGIN.top - MARGIN.bottom);
              return (
                <g key={tick}>
                  <line x1={MARGIN.left} x2={CHART_WIDTH - MARGIN.right} y1={y} y2={y} stroke="#d8cdbb" strokeDasharray="4 6" />
                  <text x={MARGIN.left - 14} y={y + 4} textAnchor="end" fontSize="12" fill="#6d756e">
                    {tick}
                  </text>
                </g>
              );
            })}

            {xTicks.map((tick) => {
              const x =
                MARGIN.left + (tick / (data[data.length - 1]?.time || 1)) * (CHART_WIDTH - MARGIN.left - MARGIN.right);
              return (
                <g key={tick}>
                  <line x1={x} x2={x} y1={MARGIN.top} y2={CHART_HEIGHT - MARGIN.bottom} stroke="#ece2d4" />
                  <text x={x} y={CHART_HEIGHT - MARGIN.bottom + 24} textAnchor="middle" fontSize="12" fill="#6d756e">
                    {tick}s
                  </text>
                </g>
              );
            })}

            <line
              x1={MARGIN.left}
              x2={CHART_WIDTH - MARGIN.right}
              y1={CHART_HEIGHT - MARGIN.bottom}
              y2={CHART_HEIGHT - MARGIN.bottom}
              stroke="#8b8b7f"
              strokeWidth="1.4"
            />
            <line x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={CHART_HEIGHT - MARGIN.bottom} stroke="#8b8b7f" strokeWidth="1.4" />

            <text
              x={32}
              y={(MARGIN.top + CHART_HEIGHT - MARGIN.bottom) / 2}
              textAnchor="middle"
              fontSize="13"
              fill="#6d756e"
              transform={`rotate(-90 32 ${(MARGIN.top + CHART_HEIGHT - MARGIN.bottom) / 2})`}
            >
              风扰指数
            </text>
            <text
              x={(MARGIN.left + (CHART_WIDTH - MARGIN.right)) / 2}
              y={CHART_HEIGHT - 16}
              textAnchor="middle"
              fontSize="13"
              fill="#6d756e"
            >
              进近时间 / 秒
            </text>

            <path d={pathD} fill="none" stroke="#d8cdbb" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
            <path
              ref={pathRef}
              d={pathD}
              fill="none"
              stroke="url(#approachLine)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: pathLength || undefined,
                strokeDashoffset: pathLength ? (1 - progress) * pathLength : undefined,
                transition: pathLength ? 'stroke-dashoffset 0.1s linear' : undefined,
              }}
            />

            <defs>
              <linearGradient id="approachLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#587869" />
                <stop offset="60%" stopColor="#b56b4a" />
                <stop offset="100%" stopColor="#8d4a47" />
              </linearGradient>
            </defs>

            {progress > 0 && scanPoint && (
              <>
                <line
                  x1={scanPoint.x}
                  x2={scanPoint.x}
                  y1={MARGIN.top}
                  y2={CHART_HEIGHT - MARGIN.bottom}
                  stroke="#8d4a47"
                  strokeDasharray="5 5"
                  strokeOpacity="0.4"
                />
                <circle cx={scanPoint.x} cy={scanPoint.y} r="6.5" fill="#fff7f2" stroke="#8d4a47" strokeWidth="3" />
              </>
            )}

            {highRiskIndexes.map((index) => {
              const point = points[index];
              const isVisible = index <= activeIndex || progress >= 1;
              if (!isVisible) {
                return null;
              }

              return (
                <g key={`risk-${point.time}`}>
                  <circle cx={point.x} cy={point.y} r="7" fill="#b56b4a" opacity="0.2" />
                  <circle cx={point.x} cy={point.y} r="4.4" fill="#b56b4a" />
                </g>
              );
            })}

            {points.map((point, index) => {
              const isVisible = index <= activeIndex || progress >= 1;
              return (
                <circle
                  key={`hit-${point.time}`}
                  cx={point.x}
                  cy={point.y}
                  r="10"
                  fill="transparent"
                  className="cursor-pointer"
                  style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex((current) => (current === index ? null : current))}
                />
              );
            })}
          </svg>

          {hoverPoint && hoverTone && tooltipStyle && (
            <div
              className="pointer-events-none absolute z-20 w-56 max-w-[calc(100vw-2.5rem)] rounded-[22px] border border-white/70 bg-white/80 p-4 shadow-soft backdrop-blur-xl"
              style={tooltipStyle}
            >
              <div className="text-sm font-semibold text-foreground">第 {hoverPoint.time} 秒</div>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>高度</span>
                  <span className="font-semibold text-foreground">{hoverPoint.altitude} ft</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <Gauge size={14} className="text-accent" />
                    风扰指数
                  </span>
                  <span className="font-semibold text-foreground">{hoverPoint.turbulenceIndex}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <AlertTriangle size={14} className="text-accent-secondary" />
                    风险等级
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${hoverTone.pillClass}`}>{hoverPoint.riskLevel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <Navigation size={14} className="text-accent" />
                    风向
                  </span>
                  <span className="font-semibold text-foreground">{hoverPoint.windDirection}°</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <Wind size={14} className="text-accent" />
                    风速
                  </span>
                  <span className="font-semibold text-foreground">{hoverPoint.windSpeed} kt</span>
                </div>
              </div>
              <div className="mt-3 rounded-2xl bg-background/90 px-3 py-2 text-sm text-foreground">{hoverPoint.factor}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ApproachChart;

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AlertTriangle, Gauge, Navigation, RotateCcw, Wind, X } from 'lucide-react';
import type { AverageDimension, TimeRange } from './approachAnalysisTypes';
import type { ApproachPoint } from '../../data/mockApproachData';
import { riskLevelMeta } from '../../utils/riskLevel';

type ApproachChartProps = {
  data: ApproachPoint[];
  replayToken: number;
  onReplay: () => void;
  onCurrentPointChange: (point: ApproachPoint) => void;
  averageDimension: AverageDimension;
  landingReferenceTime: number;
  selectedTimeRange: TimeRange;
};

type ChartPoint = ApproachPoint & {
  x: number;
  y: number;
  remainingTime: number;
  displayIndex: number;
  averageIndex: number;
  averageY: number;
  confidenceLower: number;
  confidenceUpper: number;
  confidenceLowerY: number;
  confidenceUpperY: number;
};

type RiskSummary = {
  highRiskNodes: ChartPoint[];
  highestPoint: ChartPoint;
  highRiskDuration: number;
  averageDelta: number;
};

const CHART_WIDTH = 1120;
const CHART_HEIGHT = 505;
const MARGIN = { top: 30, right: 34, left: 104 };
const PLOT_BOTTOM = 258;
const WIND_BAND_TOP = 304;
const WIND_BAND_HEIGHT = 72;
const X_AXIS_LABEL_Y = 432;
const ANIMATION_DURATION = 3000;
const HIGH_RISK_THRESHOLD = 0.6;

function ApproachChart({
  data,
  replayToken,
  onReplay,
  onCurrentPointChange,
  averageDimension,
  landingReferenceTime,
  selectedTimeRange,
}: ApproachChartProps) {
  const [progress, setProgress] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<ChartPoint | null>(null);
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement | null>(null);

  const { points, pathD, averagePathD, confidenceBandD, xTicks, yTicks, riskSummary, windPoints } = useMemo(
    () => buildChartModel(data, averageDimension, landingReferenceTime, selectedTimeRange),
    [averageDimension, data, landingReferenceTime, selectedTimeRange],
  );

  useEffect(() => {
    if (!pathRef.current) {
      return;
    }

    setPathLength(pathRef.current.getTotalLength());
  }, [pathD]);

  useEffect(() => {
    if (!data.length) {
      setProgress(0);
      return;
    }

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

  useEffect(() => {
    if (selectedPoint && !points.some((point) => point.time === selectedPoint.time)) {
      setSelectedPoint(null);
    }
  }, [points, selectedPoint]);

  if (!points.length || !riskSummary) {
    return (
      <section className="surface-card p-5 sm:p-6">
        <div className="rounded-[18px] border border-border/75 bg-white/90 p-6 text-sm text-muted-foreground">
          当前时间范围内暂无可展示数据。
        </div>
      </section>
    );
  }

  const activeIndex = Math.min(points.length - 1, Math.max(0, Math.round(progress * (points.length - 1))));
  const scanPoint = points[activeIndex];
  const hoverPoint = hoveredIndex !== null ? points[hoveredIndex] : null;
  const hoverTone = hoverPoint ? riskLevelMeta[hoverPoint.riskLevel] : null;
  const dimensionLabel = averageDimensionLabels[averageDimension];
  const highlightedTime = selectedPoint?.time ?? scanPoint?.time;
  const highRiskIndexes = points
    .map((point, index) => ({ point, index }))
    .filter(({ point }) => point.displayIndex >= HIGH_RISK_THRESHOLD)
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

  const handlePointSelect = (point: ChartPoint) => {
    setSelectedPoint(point);
    onCurrentPointChange(point);
  };

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">实时风扰指数对比</h2>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <LegendItem label="当前进近" color="#1f5f8b" />
            <LegendItem label={`${dimensionLabel}均水平`} color="#8a6c37" dashed />
            <LegendItem label="95%置信区间" color="#d7c5b7" thick />
          </div>
        </div>

        <button type="button" onClick={onReplay} className="action-secondary">
          <RotateCcw size={16} />
          重新播放
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile label="高风险节点" value={formatHighRiskNodes(riskSummary.highRiskNodes)} />
        <SummaryTile label="最高风扰指数" value={formatIndex(riskSummary.highestPoint.displayIndex)} />
        <SummaryTile label="高风险持续" value={`${riskSummary.highRiskDuration} 秒`} />
        <SummaryTile label={`高于${dimensionLabel}均`} value={formatDelta(riskSummary.averageDelta)} />
      </div>

      <div className="mt-5 rounded-[18px] border border-border/75 bg-white/90 p-4 sm:p-5">
        <div className="relative">
          <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-[430px] w-full xl:h-[455px]">
            {yTicks.map((tick) => {
              const y = toChartY(tick);
              return (
                <g key={tick}>
                  <line x1={MARGIN.left} x2={CHART_WIDTH - MARGIN.right} y1={y} y2={y} stroke="#d6d6cc" strokeDasharray="4 6" />
                  <text x={MARGIN.left - 16} y={y + 5} textAnchor="end" fontSize="15" fill="#4f5b53">
                    {tick.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {xTicks.map((tick) => {
              const x = toChartX(tick, selectedTimeRange);
              const remainingTime = landingReferenceTime - tick;
              return (
                <g key={tick}>
                  <line x1={x} x2={x} y1={MARGIN.top} y2={PLOT_BOTTOM} stroke="#e2ded5" />
                  <text x={x} y={PLOT_BOTTOM + 24} textAnchor="middle" fontSize="15" fill="#4f5b53">
                    {remainingTime}s
                  </text>
                </g>
              );
            })}

            <line x1={MARGIN.left} x2={CHART_WIDTH - MARGIN.right} y1={PLOT_BOTTOM} y2={PLOT_BOTTOM} stroke="#5f675f" strokeWidth="1.8" />
            <line x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={PLOT_BOTTOM} stroke="#5f675f" strokeWidth="1.8" />

            <text
              x={34}
              y={(MARGIN.top + PLOT_BOTTOM) / 2}
              textAnchor="middle"
              fontSize="17"
              fontWeight={600}
              fill="#303a33"
              transform={`rotate(-90 34 ${(MARGIN.top + PLOT_BOTTOM) / 2})`}
            >
              风扰指数
            </text>
            <text
              x={(MARGIN.left + CHART_WIDTH - MARGIN.right) / 2}
              y={X_AXIS_LABEL_Y}
              textAnchor="middle"
              fontSize="17"
              fontWeight={600}
              fill="#303a33"
            >
              距接地时间 / 秒
            </text>

            <path d={confidenceBandD} fill="#d7c5b7" fillOpacity="0.26" stroke="none" />
            <path d={averagePathD} fill="none" stroke="#8a6c37" strokeWidth="3" strokeDasharray="9 7" strokeLinecap="round" strokeLinejoin="round" />
            <path
              ref={pathRef}
              d={pathD}
              fill="none"
              stroke="#1f5f8b"
              strokeWidth="4.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: pathLength || undefined,
                strokeDashoffset: pathLength ? (1 - progress) * pathLength : undefined,
                transition: pathLength ? 'stroke-dashoffset 0.1s linear' : undefined,
              }}
            />

            {progress > 0 && scanPoint && (
              <>
                <line x1={scanPoint.x} x2={scanPoint.x} y1={MARGIN.top} y2={PLOT_BOTTOM} stroke="#9a4f43" strokeDasharray="5 5" strokeOpacity="0.55" />
                <circle cx={scanPoint.x} cy={scanPoint.y} r="6.5" fill="#ffffff" stroke="#9a4f43" strokeWidth="3" />
              </>
            )}

            {highRiskIndexes.map((index) => {
              const point = points[index];
              const isVisible = index <= activeIndex || progress >= 1;
              return isVisible ? <circle key={`risk-${point.time}`} cx={point.x} cy={point.y} r="5.2" fill="#b56b4a" /> : null;
            })}

            {points.map((point, index) => {
              const isVisible = index <= activeIndex || progress >= 1;
              const isSelected = selectedPoint?.time === point.time;
              return (
                <circle
                  key={`hit-${point.time}`}
                  cx={point.x}
                  cy={point.y}
                  r={isSelected ? 7 : 10}
                  fill={isSelected ? '#ffffff' : 'transparent'}
                  stroke={isSelected ? '#1f5f8b' : 'transparent'}
                  strokeWidth={isSelected ? 2.4 : 0}
                  className="cursor-pointer"
                  style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
                  onClick={() => handlePointSelect(point)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex((current) => (current === index ? null : current))}
                />
              );
            })}

            <g>
              <text x={MARGIN.left} y={WIND_BAND_TOP - 12} fontSize="15" fontWeight={600} fill="#303a33">
                风场变化
              </text>
              <line x1={MARGIN.left} x2={CHART_WIDTH - MARGIN.right} y1={WIND_BAND_TOP + WIND_BAND_HEIGHT / 2} y2={WIND_BAND_TOP + WIND_BAND_HEIGHT / 2} stroke="#e1ddd3" />
              {windPoints.map((point) => {
                const arrowLength = scaleWindArrowLength(point.windSpeed, points);
                const isHighlighted = point.time === highlightedTime;
                const y = WIND_BAND_TOP + WIND_BAND_HEIGHT / 2;

                return (
                  <g key={`wind-${point.time}`} transform={`translate(${point.x} ${y})`} opacity={isHighlighted ? 1 : 0.62}>
                    <line
                      x1={-arrowLength / 2}
                      x2={arrowLength / 2}
                      y1={0}
                      y2={0}
                      stroke={isHighlighted ? '#1f5f8b' : '#6d756e'}
                      strokeWidth={isHighlighted ? 2.2 : 1.35}
                      strokeLinecap="round"
                      transform={`rotate(${point.windDirection})`}
                    />
                    <path
                      d={`M ${arrowLength / 2} 0 L ${arrowLength / 2 - 5} -3.2 L ${arrowLength / 2 - 5} 3.2 Z`}
                      fill={isHighlighted ? '#1f5f8b' : '#6d756e'}
                      transform={`rotate(${point.windDirection})`}
                    />
                    <circle r={isHighlighted ? 3 : 1.7} fill={isHighlighted ? '#1f5f8b' : '#9ca59d'} />
                    {point.time % 5 === 0 && (
                      <text y={28} textAnchor="middle" fontSize="11" fill="#4f5b53">
                        {point.remainingTime}s
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {hoverPoint && hoverTone && tooltipStyle && (
            <div className="pointer-events-none absolute z-20 w-60 max-w-[calc(100vw-2.5rem)] rounded-[18px] border border-border/70 bg-white/95 p-4 shadow-soft" style={tooltipStyle}>
              <div className="text-sm font-semibold text-foreground">距接地 {hoverPoint.remainingTime} 秒</div>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <InfoRow label="高度" value={`${hoverPoint.altitude} ft`} />
                <InfoRow label="当前进近" value={formatIndex(hoverPoint.displayIndex)} icon={<Gauge size={14} className="text-accent" />} />
                <InfoRow label={`${dimensionLabel}均水平`} value={formatIndex(hoverPoint.averageIndex)} />
                <InfoRow label="置信区间" value={`${formatIndex(hoverPoint.confidenceLower)} - ${formatIndex(hoverPoint.confidenceUpper)}`} />
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <AlertTriangle size={14} className="text-accent-secondary" />
                    风险等级
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${hoverTone.pillClass}`}>{hoverPoint.riskLevel}</span>
                </div>
                <InfoRow label="风向" value={`${hoverPoint.windDirection}°`} icon={<Navigation size={14} className="text-accent" />} />
                <InfoRow label="风速" value={`${hoverPoint.windSpeed} kt`} icon={<Wind size={14} className="text-accent" />} />
              </div>
              <div className="mt-3 rounded-2xl bg-background/90 px-3 py-2 text-sm text-foreground">{hoverPoint.factor}</div>
            </div>
          )}
        </div>

        {selectedPoint && <ConfidenceDetailTable point={selectedPoint} onClose={() => setSelectedPoint(null)} />}
      </div>
    </section>
  );
}

function buildChartModel(data: ApproachPoint[], dimension: AverageDimension, landingReferenceTime: number, selectedTimeRange: TimeRange) {
  if (!data.length) {
    return {
      points: [] as ChartPoint[],
      pathD: '',
      averagePathD: '',
      confidenceBandD: '',
      xTicks: [] as number[],
      yTicks: [0, 0.25, 0.5, 0.75, 1],
      riskSummary: null as RiskSummary | null,
      windPoints: [] as ChartPoint[],
    };
  }

  const points = data.map((point, index) => {
    const displayIndex = normalizeIndexForDisplay(point.turbulenceIndex);
    const confidence = buildConfidenceInterval(point, data, index, displayIndex);
    const remainingTime = Math.max(0, Math.round(landingReferenceTime - point.time));
    const averageIndex = buildAverageIndex({
      dimension,
      index,
      remainingTime,
      currentIndex: displayIndex,
    });

    return {
      ...point,
      x: toChartX(point.time, selectedTimeRange),
      y: toChartY(displayIndex),
      remainingTime,
      displayIndex,
      averageIndex,
      averageY: toChartY(averageIndex),
      confidenceLower: confidence.lower,
      confidenceUpper: confidence.upper,
      confidenceLowerY: toChartY(confidence.lower),
      confidenceUpperY: toChartY(confidence.upper),
    };
  });

  return {
    points,
    pathD: buildPath(points, 'y'),
    averagePathD: buildPath(points, 'averageY'),
    confidenceBandD: buildConfidenceBandPath(points),
    xTicks: buildTimeTicks(selectedTimeRange),
    yTicks: [0, 0.25, 0.5, 0.75, 1],
    riskSummary: buildRiskSummary(points),
    windPoints: points,
  };
}

function buildPath(points: ChartPoint[], yKey: 'y' | 'averageY') {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point[yKey].toFixed(2)}`).join(' ');
}

function buildConfidenceBandPath(points: ChartPoint[]) {
  if (!points.length) {
    return '';
  }

  const upperPath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.confidenceUpperY.toFixed(2)}`).join(' ');
  const lowerPath = [...points].reverse().map((point) => `L ${point.x.toFixed(2)} ${point.confidenceLowerY.toFixed(2)}`).join(' ');
  return `${upperPath} ${lowerPath} Z`;
}

function normalizeIndexForDisplay(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return clamp(value <= 1 ? value : value / 100, 0, 1);
}

function buildConfidenceInterval(point: ApproachPoint, data: ApproachPoint[], index: number, displayIndex: number) {
  if (Number.isFinite(point.ciLower) && Number.isFinite(point.ciUpper)) {
    return {
      lower: normalizeIndexForDisplay(point.ciLower),
      upper: normalizeIndexForDisplay(point.ciUpper),
    };
  }

  // Front-end demonstration only: this approximates a 95% interval from recent local volatility and is not real statistical inference.
  const start = Math.max(0, index - 4);
  const recent = data.slice(start, index + 1).map((item) => normalizeIndexForDisplay(item.turbulenceIndex));
  const deltas = recent.slice(1).map((value, deltaIndex) => Math.abs(value - recent[deltaIndex]));
  const volatility = deltas.length ? deltas.reduce((sum, value) => sum + value, 0) / deltas.length : 0;
  const width = clamp(0.045 + volatility * 0.7 + displayIndex * 0.035, 0.04, 0.18);

  return {
    lower: clamp(displayIndex - width, 0, 1),
    upper: clamp(displayIndex + width, 0, 1),
  };
}

function buildAverageIndex({
  dimension,
  index,
  remainingTime,
  currentIndex,
}: {
  dimension: AverageDimension;
  index: number;
  remainingTime: number;
  currentIndex: number;
}) {
  const profile = averageProfiles[dimension];
  const approachBump = Math.exp(-((remainingTime - profile.peakAt) ** 2) / profile.spread) * profile.peakLift;
  const secondaryBump = Math.exp(-((remainingTime - profile.secondaryPeakAt) ** 2) / (profile.spread * 1.25)) * profile.secondaryLift;
  const wave = Math.sin((index + profile.phase) / profile.period) * profile.wave;
  const anchored = profile.baseline + approachBump + secondaryBump + wave;

  return clamp(anchored * 0.78 + currentIndex * 0.22, 0, 1);
}

function buildRiskSummary(points: ChartPoint[]): RiskSummary {
  const highRiskNodes = findHighRiskNodes(points);
  const highestPoint = points.reduce((max, point) => (point.displayIndex > max.displayIndex ? point : max), points[0]);
  const highRiskDuration = points.filter((point) => point.displayIndex >= HIGH_RISK_THRESHOLD).length;

  return {
    highRiskNodes,
    highestPoint,
    highRiskDuration,
    averageDelta: highestPoint.displayIndex - highestPoint.averageIndex,
  };
}

function findHighRiskNodes(points: ChartPoint[]) {
  return points
    .filter((point, index, array) => {
      if (point.displayIndex < HIGH_RISK_THRESHOLD) {
        return false;
      }

      const previous = array[index - 1]?.displayIndex ?? -1;
      const next = array[index + 1]?.displayIndex ?? -1;
      return point.displayIndex >= previous && point.displayIndex >= next;
    })
    .sort((left, right) => right.displayIndex - left.displayIndex)
    .slice(0, 2)
    .sort((left, right) => right.remainingTime - left.remainingTime);
}

function buildTimeTicks([startTime, endTime]: TimeRange) {
  const span = Math.max(1, endTime - startTime);
  const step = span <= 6 ? 1 : span <= 20 ? 5 : 10;
  const ticks = new Set<number>([startTime, endTime]);

  for (let value = Math.ceil(startTime / step) * step; value <= endTime; value += step) {
    ticks.add(value);
  }

  return [...ticks].sort((left, right) => left - right);
}

function toChartY(value: number) {
  return MARGIN.top + (1 - clamp(value, 0, 1)) * (PLOT_BOTTOM - MARGIN.top);
}

function toChartX(time: number, [startTime, endTime]: TimeRange) {
  return MARGIN.left + ((time - startTime) / Math.max(1, endTime - startTime)) * (CHART_WIDTH - MARGIN.left - MARGIN.right);
}

function scaleWindArrowLength(windSpeed: number, points: ChartPoint[]) {
  const speeds = points.map((point) => point.windSpeed);
  const minSpeed = Math.min(...speeds);
  const maxSpeed = Math.max(...speeds);

  return 10 + ((windSpeed - minSpeed) / Math.max(1, maxSpeed - minSpeed)) * 14;
}

function formatHighRiskNodes(nodes: ChartPoint[]) {
  if (!nodes.length) {
    return '无高风险';
  }

  return nodes.map((node) => `${node.remainingTime}s`).join(' / ');
}

function formatIndex(value: number) {
  return clamp(value, 0, 1).toFixed(2);
}

function formatDelta(value: number) {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function LegendItem({ label, color, dashed = false, thick = false }: { label: string; color: string; dashed?: boolean; thick?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`${thick ? 'h-2.5' : 'h-0'} block w-10 rounded-full border-t-[3px]`}
        style={{
          backgroundColor: thick ? color : 'transparent',
          borderColor: color,
          borderStyle: dashed ? 'dashed' : 'solid',
        }}
      />
      <span>{label}</span>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-border/70 bg-white/82 px-4 py-3">
      <div className="text-xs font-semibold tracking-[0.08em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-lg font-bold leading-tight text-foreground">{value}</div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function ConfidenceDetailTable({ point, onClose }: { point: ChartPoint; onClose: () => void }) {
  const rows = [
    ['风扰指数', formatIndex(point.displayIndex)],
    ['置信下界', formatIndex(point.confidenceLower)],
    ['置信上界', formatIndex(point.confidenceUpper)],
    ['区间宽度', formatIndex(point.confidenceUpper - point.confidenceLower)],
    ['风速', `${point.windSpeed} kt`],
    ['风向', `${point.windDirection}°`],
  ];

  return (
    <div className="mt-3 rounded-[18px] border border-border/75 bg-white/92 p-3.5">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-semibold text-foreground">置信区间明细 - {point.remainingTime}秒</div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/75 bg-white text-muted-foreground transition hover:text-foreground"
        >
          <X size={15} />
        </button>
      </div>

      <div className="mt-3 grid gap-x-5 gap-y-2 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 border-t border-border/60 pt-2 text-sm">
            <span className="font-semibold text-muted-foreground">{label}</span>
            <span className="font-mono text-foreground">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const averageDimensionLabels: Record<AverageDimension, string> = {
  season: '季',
  month: '月',
  week: '周',
};

// Stable front-end mock profiles for the seasonal/monthly/weekly average comparison curves.
const averageProfiles: Record<
  AverageDimension,
  {
    baseline: number;
    peakAt: number;
    secondaryPeakAt: number;
    spread: number;
    peakLift: number;
    secondaryLift: number;
    wave: number;
    period: number;
    phase: number;
  }
> = {
  season: { baseline: 0.34, peakAt: 24, secondaryPeakAt: 12, spread: 90, peakLift: 0.14, secondaryLift: 0.08, wave: 0.018, period: 8, phase: 1.2 },
  month: { baseline: 0.39, peakAt: 22, secondaryPeakAt: 15, spread: 72, peakLift: 0.16, secondaryLift: 0.09, wave: 0.022, period: 6, phase: 0.7 },
  week: { baseline: 0.43, peakAt: 20, secondaryPeakAt: 10, spread: 58, peakLift: 0.18, secondaryLift: 0.1, wave: 0.026, period: 4.8, phase: 0.4 },
};

export default ApproachChart;

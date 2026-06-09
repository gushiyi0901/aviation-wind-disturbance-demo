import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { AlertTriangle, Bot, Gauge, Navigation, RotateCcw, Wind } from 'lucide-react';
import type { AverageDimension, TimeRange } from './approachAnalysisTypes';
import type { ApproachPoint } from '../../data/mockApproachData';
import {
  formatWindDisturbanceIndex,
  normalizeWindDisturbanceIndex,
  toWindDisturbanceIndex,
  windIndexDeltaFromUnit,
  windIndexFromUnit,
  WIND_DISTURBANCE_INDEX_MAX,
  WIND_DISTURBANCE_INDEX_MIN,
} from '../../utils/indexScale';

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
  upperSigmaIndex: number;
  upperSigmaY: number;
  confidenceLower: number;
  confidenceUpper: number;
  confidenceLowerY: number;
  confidenceUpperY: number;
  riskCategory: ChartRiskCategory;
};

type ChartRiskCategory = 'low' | 'medium' | 'high';

type RiskSummary = {
  highestPoint: ChartPoint;
  averageDelta: number;
};

type RiskSegment = {
  id: string;
  pathD: string;
  riskCategory: ChartRiskCategory;
};

const CHART_WIDTH = 1120;
const CHART_HEIGHT = 585;
const MARGIN = { top: 34, right: 22, left: 86 };
const PLOT_BOTTOM = 316;
const WIND_BAND_TOP = 380;
const WIND_BAND_HEIGHT = 104;
const X_AXIS_LABEL_Y = 508;
const ANIMATION_DURATION = 3000;

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

  const { points, averagePathD, upperSigmaPathD, confidenceBandD, riskSegments, xTicks, yTicks, riskSummary, windPoints } = useMemo(
    () => buildChartModel(data, averageDimension, landingReferenceTime, selectedTimeRange),
    [averageDimension, data, landingReferenceTime, selectedTimeRange],
  );

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
  const highlightedTime = selectedPoint?.time ?? scanPoint?.time;
  const curveClipWidth = progress >= 1 ? CHART_WIDTH - MARGIN.left - MARGIN.right : Math.max(0, scanPoint.x - MARGIN.left);
  const landingPoint = points.reduce((closest, point) => (point.remainingTime < closest.remainingTime ? point : closest), points[0]);
  const detailPoint = selectedPoint ?? landingPoint;
  const agentAnalysisItems = buildAgentAnalysisItems(points, riskSummary);

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
    <section className="surface-card flex h-full flex-col p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">单次航班进近降落风扰分析曲线图</h2>
        </div>

        <button type="button" onClick={onReplay} className="action-secondary">
          <RotateCcw size={16} />
          重新播放
        </button>
      </div>

      <div className="mt-4 flex flex-1 flex-col rounded-[18px] border border-border/75 bg-white/90 p-3 sm:p-4">
        <div className="pb-3">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <LegendItem label="样本进近曲线" color="#1f5f8b" />
            <LegendItem label="历史月均值基准" color="#8a6c37" dashed />
            <LegendItem label="月均值上2σ" color="#9a4f43" dashed />
            <LegendItem label="95%置信区间带" color="#d7c5b7" thick />
          </div>
        </div>
        <div className="relative">
          <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-[470px] w-full xl:h-[520px]">
            <defs>
              <clipPath id="approach-risk-curve-clip">
                <rect x={MARGIN.left} y={MARGIN.top - 12} width={curveClipWidth} height={PLOT_BOTTOM - MARGIN.top + 24} />
              </clipPath>
            </defs>

            {yTicks.map((tick) => {
              const y = toChartY(tick);
              return (
                <g key={tick}>
                  <line x1={MARGIN.left} x2={CHART_WIDTH - MARGIN.right} y1={y} y2={y} stroke="#d6d6cc" strokeDasharray="4 6" />
                  <text x={MARGIN.left - 16} y={y + 5} textAnchor="end" fontSize="15" fill="#4f5b53">
                    {formatIndex(tick)}
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
            <path d={upperSigmaPathD} fill="none" stroke="#9a4f43" strokeWidth="2" strokeDasharray="6 8" strokeLinecap="round" strokeLinejoin="round" />
            <g clipPath="url(#approach-risk-curve-clip)">
              {riskSegments.map((segment) => (
                <path
                  key={segment.id}
                  d={segment.pathD}
                  fill="none"
                  stroke={chartRiskMeta[segment.riskCategory].stroke}
                  strokeWidth="4.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </g>

            {progress > 0 && scanPoint && (
              <>
                <line x1={scanPoint.x} x2={scanPoint.x} y1={MARGIN.top} y2={PLOT_BOTTOM} stroke="#9a4f43" strokeDasharray="5 5" strokeOpacity="0.55" />
                <circle cx={scanPoint.x} cy={scanPoint.y} r="6.5" fill="#ffffff" stroke="#9a4f43" strokeWidth="3" />
              </>
            )}

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
              <text
                x={34}
                y={WIND_BAND_TOP + WIND_BAND_HEIGHT / 2}
                textAnchor="middle"
                fontSize="17"
                fontWeight={600}
                fill="#303a33"
                transform={`rotate(-90 34 ${WIND_BAND_TOP + WIND_BAND_HEIGHT / 2})`}
              >
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

          {hoverPoint && tooltipStyle && (
            <div className="pointer-events-none absolute z-20 w-60 max-w-[calc(100vw-2.5rem)] rounded-[18px] border border-border/70 bg-white/95 p-4 shadow-soft" style={tooltipStyle}>
              <div className="text-sm font-semibold text-foreground">距接地 {hoverPoint.remainingTime} 秒</div>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <InfoRow label="高度" value={`${hoverPoint.altitude} ft`} />
                <InfoRow label="样本进近曲线" value={formatIndex(hoverPoint.displayIndex)} icon={<Gauge size={14} className="text-accent" />} />
                <InfoRow label="历史月均值基准" value={formatIndex(hoverPoint.averageIndex)} />
                <InfoRow label="月均值上2σ" value={formatIndex(hoverPoint.upperSigmaIndex)} />
                <InfoRow label="95%置信区间" value={`${formatIndex(hoverPoint.confidenceLower)} - ${formatIndex(hoverPoint.confidenceUpper)}`} />
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <AlertTriangle size={14} className="text-accent-secondary" />
                    风险等级
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${chartRiskMeta[hoverPoint.riskCategory].pillClass}`}>
                    {chartRiskMeta[hoverPoint.riskCategory].label}
                  </span>
                </div>
                <InfoRow label="风向" value={`${hoverPoint.windDirection}°`} icon={<Navigation size={14} className="text-accent" />} />
                <InfoRow label="风速" value={`${hoverPoint.windSpeed} kt`} icon={<Wind size={14} className="text-accent" />} />
              </div>
              <div className="mt-3 rounded-2xl bg-background/90 px-3 py-2 text-sm text-foreground">{hoverPoint.factor}</div>
            </div>
          )}
        </div>

        <ConfidenceDetailTable point={detailPoint} />
        <AgentAnalysisPanel items={agentAnalysisItems} />
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
      upperSigmaPathD: '',
      confidenceBandD: '',
      riskSegments: [] as RiskSegment[],
      xTicks: [] as number[],
      yTicks: [WIND_DISTURBANCE_INDEX_MIN, 1.25, 1.75, 2.25, WIND_DISTURBANCE_INDEX_MAX],
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
    const upperSigmaIndex = buildUpperSigmaIndex(averageIndex, index, remainingTime);
    const riskCategory = getChartRiskCategory(displayIndex, confidence.upper, upperSigmaIndex);

    return {
      ...point,
      x: toChartX(point.time, selectedTimeRange),
      y: toChartY(displayIndex),
      remainingTime,
      displayIndex,
      averageIndex,
      averageY: toChartY(averageIndex),
      upperSigmaIndex,
      upperSigmaY: toChartY(upperSigmaIndex),
      confidenceLower: confidence.lower,
      confidenceUpper: confidence.upper,
      confidenceLowerY: toChartY(confidence.lower),
      confidenceUpperY: toChartY(confidence.upper),
      riskCategory,
    };
  });

  return {
    points,
    pathD: buildPath(points, 'y'),
    averagePathD: buildPath(points, 'averageY'),
    upperSigmaPathD: buildPath(points, 'upperSigmaY'),
    confidenceBandD: buildConfidenceBandPath(points),
    riskSegments: buildRiskSegments(points),
    xTicks: buildTimeTicks(selectedTimeRange),
    yTicks: [WIND_DISTURBANCE_INDEX_MIN, 1.25, 1.75, 2.25, WIND_DISTURBANCE_INDEX_MAX],
    riskSummary: buildRiskSummary(points),
    windPoints: points,
  };
}

function buildPath(points: ChartPoint[], yKey: 'y' | 'averageY' | 'upperSigmaY') {
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

function buildRiskSegments(points: ChartPoint[]): RiskSegment[] {
  return points.slice(1).flatMap((point, index) => {
    const previous = points[index];
    const highCrossing = findCrossingT(previous.displayIndex - previous.upperSigmaIndex, point.displayIndex - point.upperSigmaIndex);
    const mediumCrossing = findCrossingT(previous.confidenceUpper - previous.upperSigmaIndex, point.confidenceUpper - point.upperSigmaIndex);
    const stops = [0, highCrossing, mediumCrossing, 1]
      .filter((value): value is number => Number.isFinite(value))
      .sort((left, right) => left - right)
      .filter((value, stopIndex, array) => stopIndex === 0 || Math.abs(value - array[stopIndex - 1]) > 0.001);

    return stops.slice(1).map((endT, stopIndex) => {
      const startT = stops[stopIndex];
      const midpointT = (startT + endT) / 2;
      const start = interpolateSegmentPoint(previous, point, startT);
      const end = interpolateSegmentPoint(previous, point, endT);
      const midpoint = interpolateSegmentPoint(previous, point, midpointT);

      return {
        id: `${previous.time}-${point.time}-${startT.toFixed(3)}-${endT.toFixed(3)}`,
        pathD: `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} L ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
        riskCategory: getChartRiskCategory(midpoint.displayIndex, midpoint.confidenceUpper, midpoint.upperSigmaIndex),
      };
    });
  });
}

function findCrossingT(startValue: number, endValue: number) {
  if (startValue === 0) {
    return 0;
  }

  if (endValue === 0) {
    return 1;
  }

  if (startValue * endValue > 0) {
    return Number.NaN;
  }

  return clamp(Math.abs(startValue) / (Math.abs(startValue) + Math.abs(endValue)), 0, 1);
}

function interpolateSegmentPoint(start: ChartPoint, end: ChartPoint, t: number) {
  return {
    x: interpolateNumber(start.x, end.x, t),
    y: interpolateNumber(start.y, end.y, t),
    displayIndex: interpolateNumber(start.displayIndex, end.displayIndex, t),
    confidenceUpper: interpolateNumber(start.confidenceUpper, end.confidenceUpper, t),
    upperSigmaIndex: interpolateNumber(start.upperSigmaIndex, end.upperSigmaIndex, t),
  };
}

function interpolateNumber(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

function normalizeIndexForDisplay(value: number) {
  return toWindDisturbanceIndex(value);
}

function buildConfidenceInterval(point: ApproachPoint, data: ApproachPoint[], index: number, displayIndex: number) {
  if (Number.isFinite(point.ciLower) && Number.isFinite(point.ciUpper)) {
    return widenConfidenceInterval({
      lower: toWindDisturbanceIndex(point.ciLower),
      upper: toWindDisturbanceIndex(point.ciUpper),
      center: displayIndex,
      minHalfWidth: windIndexDeltaFromUnit(0.18),
    });
  }

  // Front-end demonstration only: this approximates an interval from recent local volatility and is not real statistical inference.
  const start = Math.max(0, index - 4);
  const recent = data.slice(start, index + 1).map((item) => normalizeWindDisturbanceIndex(item.turbulenceIndex));
  const deltas = recent.slice(1).map((value, deltaIndex) => Math.abs(value - recent[deltaIndex]));
  const volatility = deltas.length ? deltas.reduce((sum, value) => sum + value, 0) / deltas.length : 0;
  const displayUnit = normalizeWindDisturbanceIndex(displayIndex);
  const width = windIndexDeltaFromUnit(clamp((0.09 + volatility * 1.05 + displayUnit * 0.055) * 2, 0.16, 0.42));

  return {
    lower: clamp(displayIndex - width, WIND_DISTURBANCE_INDEX_MIN, WIND_DISTURBANCE_INDEX_MAX),
    upper: clamp(displayIndex + width, WIND_DISTURBANCE_INDEX_MIN, WIND_DISTURBANCE_INDEX_MAX),
  };
}

function widenConfidenceInterval({
  lower,
  upper,
  center,
  minHalfWidth,
}: {
  lower: number;
  upper: number;
  center: number;
  minHalfWidth: number;
}) {
  const midpoint = (lower + upper) / 2 || center;
  const halfWidth = Math.max((upper - lower) / 2, minHalfWidth);

  return {
    lower: clamp(midpoint - halfWidth, WIND_DISTURBANCE_INDEX_MIN, WIND_DISTURBANCE_INDEX_MAX),
    upper: clamp(midpoint + halfWidth, WIND_DISTURBANCE_INDEX_MIN, WIND_DISTURBANCE_INDEX_MAX),
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
  const currentUnit = normalizeWindDisturbanceIndex(currentIndex);

  return windIndexFromUnit(anchored * 0.78 + currentUnit * 0.22);
}

function buildUpperSigmaIndex(averageIndex: number, index: number, remainingTime: number) {
  const landingSensitivity = Math.exp(-((remainingTime - 18) ** 2) / 110) * 0.018;
  const localWave = (Math.sin(index / 4.6) + 1) * 0.006;
  const standardDeviation = (0.055 + landingSensitivity + localWave) * 2;

  return clamp(averageIndex + windIndexDeltaFromUnit(standardDeviation * 2), WIND_DISTURBANCE_INDEX_MIN, WIND_DISTURBANCE_INDEX_MAX);
}

function getChartRiskCategory(displayIndex: number, confidenceUpper: number, upperSigmaIndex: number): ChartRiskCategory {
  if (displayIndex > upperSigmaIndex) {
    return 'high';
  }

  if (confidenceUpper > upperSigmaIndex) {
    return 'medium';
  }

  return 'low';
}

function buildRiskSummary(points: ChartPoint[]): RiskSummary {
  const highestPoint = points.reduce((max, point) => (point.displayIndex > max.displayIndex ? point : max), points[0]);

  return {
    highestPoint,
    averageDelta: highestPoint.displayIndex - highestPoint.averageIndex,
  };
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
  return MARGIN.top + (1 - normalizeWindDisturbanceIndex(value)) * (PLOT_BOTTOM - MARGIN.top);
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

function formatIndex(value: number) {
  return formatWindDisturbanceIndex(value);
}

function formatDeltaMagnitude(value: number) {
  return Math.max(0, value).toFixed(2);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function LegendItem({
  label,
  color,
  dashed = false,
  thick = false,
}: {
  label: string;
  color: string;
  dashed?: boolean;
  thick?: boolean;
}) {
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

function ConfidenceDetailTable({ point }: { point: ChartPoint }) {
  const rows = [
    ['风扰指数', formatIndex(point.displayIndex)],
    ['95%置信区间下界', formatIndex(point.confidenceLower)],
    ['95%置信区间上界', formatIndex(point.confidenceUpper)],
    ['区间宽度', formatDeltaMagnitude(point.confidenceUpper - point.confidenceLower)],
    ['风速', `${point.windSpeed} kt`],
    ['风向', `${point.windDirection}°`],
  ];

  return (
    <div className="-mt-3 rounded-[18px] border border-border/75 bg-white/92 p-3.5">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-semibold text-foreground">置信区间明细 - 距离接地 {point.remainingTime} 秒</div>
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

function AgentAnalysisPanel({ items }: { items: string[] }) {
  return (
    <section className="mt-4 rounded-[18px] border border-accent/15 bg-[#f7faf8] p-4">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-accent/15 bg-white text-accent shadow-sm">
          <Bot size={18} strokeWidth={2} />
        </span>
        <h3 className="text-base font-bold leading-tight text-foreground">Agent 分析结果</h3>
      </div>

      <div className="mt-3 rounded-[16px] border border-border/65 bg-white/82 px-4 py-3 text-sm leading-6 text-slate-700">
        {items.map((item, index) => (
          <p key={item} className="mt-2 first:mt-0">
            <span className="mr-2 font-semibold text-accent">{index + 1}.</span>
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}

function buildAgentAnalysisItems(points: ChartPoint[], riskSummary: RiskSummary) {
  const highest = riskSummary.highestPoint;
  const mediumRiskPoints = points.filter((point) => point.riskCategory === 'medium');
  const highRiskPoints = points.filter((point) => point.riskCategory === 'high');
  const firstMedium = mediumRiskPoints[0];
  const maxWindAngle = points.reduce((max, point) => (Math.abs(point.windDirection) > Math.abs(max.windDirection) ? point : max), points[0]);

  // Extension point: replace this fixed/demo summarizer with a real LLM API call when backend credentials and review flow are available.
  return [
    `风扰指数峰值出现在接地前 ${highest.remainingTime} 秒附近，属于进近末段较敏感窗口；建议结合该时段操纵输入、姿态变化、阵风记录和自动油门/人工修正状态做复盘。`,
    highRiskPoints.length
      ? `样本曲线存在超过月均上 2σ 的片段，提示该次进近相对历史月度基准偏高；不宜直接判定安全事件，但建议纳入飞行品质监控复核清单。`
      : `样本曲线未持续超过月均上 2σ，整体未呈现显著越界特征；但峰值段仍建议与同机场、同季节、相近风况样本进行横向比对。`,
    `风向与机头夹角最大约 ${Math.round(maxWindAngle.windDirection)}°，提示接地前风场方向变化可能增加操纵修正需求；建议重点核对侧风分量、跑道方向和飞行员操纵响应是否同步变化。`,
    firstMedium
      ? `95%置信区间上界在接地前 ${firstMedium.remainingTime} 秒附近提示潜在中风险，说明该阶段不确定性上沿需要关注；可作为后续样本筛查和阈值复核的参考点。`
      : `95%置信区间上界未明显触发中风险提示，说明当前示例的统计上沿相对稳定；可作为后续同航段样本比对中的参考基线。`,
  ];
}

const chartRiskMeta: Record<ChartRiskCategory, { label: string; stroke: string; pillClass: string }> = {
  low: {
    label: '低风险',
    stroke: '#1f5f8b',
    pillClass: 'border-[#b7ccda] bg-[#edf6fb] text-[#1f5f8b]',
  },
  medium: {
    label: '中风险',
    stroke: '#c99a2e',
    pillClass: 'border-[#e3c979] bg-[#fbf4d6] text-[#8a6c37]',
  },
  high: {
    label: '高风险',
    stroke: '#b56b4a',
    pillClass: 'border-[#d9b7a8] bg-[#f8ebe4] text-[#8d4a47]',
  },
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

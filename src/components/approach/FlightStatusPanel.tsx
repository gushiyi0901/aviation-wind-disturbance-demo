import type { ReactNode } from 'react';
import { Activity, Gauge, HelpCircle, Navigation, Plane, SlidersHorizontal, Weight, Wind } from 'lucide-react';
import type { TimeRange } from './approachAnalysisTypes';
import type { ApproachPoint } from '../../data/mockApproachData';
import {
  formatWindDisturbanceIndex,
  indexToPercent,
  normalizeWindDisturbanceIndex,
  toWindDisturbanceIndex,
  windIndexDeltaFromUnit,
  windIndexFromUnit,
  WIND_DISTURBANCE_INDEX_MAX,
  WIND_DISTURBANCE_INDEX_MIN,
} from '../../utils/indexScale';

type FlightStatusPanelProps = {
  point: ApproachPoint;
  fallbackPoint: ApproachPoint;
  data: ApproachPoint[];
  flight: string;
  stage: string;
  availableTimeRange: TimeRange;
  selectedTimeRange: TimeRange;
  onTimeRangeChange: (value: TimeRange) => void;
};

function FlightStatusPanel({
  point,
  fallbackPoint,
  data,
  flight,
  stage,
  availableTimeRange,
  selectedTimeRange,
  onTimeRangeChange,
}: FlightStatusPanelProps) {
  const displayPoint = point ?? fallbackPoint;
  const riskState = buildPanelRiskState(displayPoint, data);
  const summaryState = buildPanelSummaryState(displayPoint, data);
  const tone = panelRiskMeta[riskState.category];
  const [rangeStart, rangeEnd] = selectedTimeRange;
  const [minimumTime, maximumTime] = availableTimeRange;
  const aircraftWeight = '总重 68.5 t';

  return (
    <aside className="surface-card flex h-full flex-col p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground sm:text-xl">航班状态</h2>
        </div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Plane size={18} />
        </div>
      </div>

      <div className="mt-4 grid gap-2.5">
        <MetricTile label="航班信息" value={flight} icon={<Plane size={15} />} />
        <MetricTile label="阶段" value={stage} icon={<Activity size={15} />} />
        <MetricTile label="飞机重量" value={aircraftWeight} icon={<Weight size={15} />} />
        <div className="grid grid-cols-2 gap-2.5">
          <MetricTile label="高度" value={`${displayPoint.altitude} ft`} icon={<Gauge size={15} />} compact />
          <MetricTile label="风速" value={`${displayPoint.windSpeed} kt`} icon={<Wind size={15} />} compact />
        </div>
        <MetricTile
          label={
            <span className="leading-tight">
              原始风向与航向夹角
              <span className="mt-0.5 block text-[10px] uppercase tracking-[0.08em]">Wind-Heading Angle</span>
            </span>
          }
          value={`${displayPoint.windDirection}°`}
          icon={<Navigation size={15} />}
        />
      </div>

      <section className="mt-3 rounded-[22px] border border-border/75 bg-[#f9f6ef] p-3.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal size={16} className="text-accent" />
          分析控制
        </div>

        <div className="mt-3">
          <div className="rounded-[18px] border border-border/70 bg-white/84 px-3.5 py-3.5">
            <RangeRow
              label="起始"
              value={rangeStart}
              min={minimumTime}
              max={maximumTime}
              onChange={(nextStart) => onTimeRangeChange([Math.min(nextStart, rangeEnd), rangeEnd])}
            />
            <RangeRow
              label="结束"
              value={rangeEnd}
              min={minimumTime}
              max={maximumTime}
              onChange={(nextEnd) => onTimeRangeChange([rangeStart, Math.max(nextEnd, rangeStart)])}
            />
          </div>
        </div>
      </section>

      <div className="mt-3">
        <MetricTile
          label="平均风扰指数"
          value={formatWindDisturbanceIndex(riskState.averageIndex)}
          icon={<Activity size={15} />}
          prominent
          detail={
            <div className="mt-3 space-y-1.5 border-t border-accent/15 pt-2.5 text-xs font-medium text-muted-foreground">
              <div className="flex items-center justify-between gap-2">
                <span>最高风扰指数</span>
                <span className="font-semibold text-foreground">{formatWindDisturbanceIndex(summaryState.highestIndex)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>高于月均</span>
                <span className="font-semibold text-foreground">{formatSignedDelta(summaryState.highestDelta)}</span>
              </div>
            </div>
          }
        />
      </div>

      <div className="mt-3 rounded-[22px] border border-border/70 bg-white/85 p-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="relative inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            风险等级
            <span className="group/risk relative inline-flex">
              <button
                type="button"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/75 bg-white text-accent transition hover:border-accent/30 hover:text-accent-secondary"
                aria-label="查看风险等级定义"
              >
              <HelpCircle size={14} />
              </button>
              <span className="pointer-events-none absolute bottom-[calc(100%+0.55rem)] left-1/2 z-40 hidden w-72 -translate-x-1/2 rounded-[18px] border border-border/75 bg-white/95 p-3 text-xs leading-5 text-muted-foreground shadow-soft group-hover/risk:block group-focus-within/risk:block">
                <span className="block font-semibold text-foreground">风险等级定义</span>
                <span className="mt-1.5 block">低风险：样本曲线处于基准范围内。</span>
                <span className="mt-1 block">中风险：95%置信区间上界超过风险阈值。</span>
                <span className="mt-1 block">高风险：样本风扰指数超过风险阈值。</span>
              </span>
            </span>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.pillClass}`}>{tone.label}</span>
        </div>
        <div className="mt-3 h-2.5 rounded-full bg-[#eee3d4]">
          <div className={`h-2.5 rounded-full ${tone.barClass}`} style={{ width: `${normalizeProgressWidth(displayPoint.turbulenceIndex)}%` }} />
        </div>
      </div>

      <div className="mt-3 rounded-[22px] border border-border/70 bg-white/85 p-3.5">
        <div className="text-xs text-muted-foreground">主要扰动来源</div>
        <div className="mt-1.5 text-sm font-semibold text-foreground">{displayPoint.factor}</div>
      </div>
    </aside>
  );
}

function MetricTile({
  label,
  value,
  icon,
  prominent = false,
  detail,
  compact = false,
}: {
  label: ReactNode;
  value: string;
  icon: ReactNode;
  prominent?: boolean;
  detail?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-[18px] border ${compact ? 'p-3' : 'p-3.5'} ${prominent ? 'border-accent/25 bg-accent/10' : 'border-border/70 bg-white/85'}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-accent">{icon}</span>
        {label}
      </div>
      <div className={`mt-2 font-semibold leading-tight ${prominent ? 'text-2xl text-accent' : compact ? 'text-sm text-foreground' : 'text-sm text-foreground sm:text-base'}`}>{value}</div>
      {detail}
    </div>
  );
}

function RangeRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="mt-3 first:mt-0">
      <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
        <span>{label}</span>
        <span className="font-semibold text-foreground">{value}s</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer rounded-full bg-[#e8dfd2] [accent-color:#2f493b]"
        style={{ accentColor: '#2f493b' }}
      />
    </div>
  );
}

function normalizeProgressWidth(value: number) {
  return indexToPercent(value);
}

type PanelRiskCategory = 'low' | 'medium' | 'high';

const panelRiskMeta: Record<PanelRiskCategory, { label: string; pillClass: string; barClass: string }> = {
  low: {
    label: '低风险',
    pillClass: 'border-[#b7ccda] bg-[#edf6fb] text-[#1f5f8b]',
    barClass: 'bg-[#1f5f8b]',
  },
  medium: {
    label: '中风险',
    pillClass: 'border-[#e3c979] bg-[#fbf4d6] text-[#8a6c37]',
    barClass: 'bg-[#c99a2e]',
  },
  high: {
    label: '高风险',
    pillClass: 'border-[#d9b7a8] bg-[#f8ebe4] text-[#8d4a47]',
    barClass: 'bg-[#b56b4a]',
  },
};

function buildPanelRiskState(point: ApproachPoint, data: ApproachPoint[]) {
  const sourceData = data.length ? data : [point];
  const index = Math.max(0, sourceData.findIndex((item) => item.time === point.time));
  const displayIndex = normalizeIndexForPanel(point.turbulenceIndex);
  const confidence = buildPanelConfidenceInterval(point, sourceData, index, displayIndex);
  const remainingTime = Math.max(0, Math.round(60 - point.time));
  const averageIndex = buildPanelAverageIndex(index, remainingTime, displayIndex);
  const upperSigmaIndex = buildPanelUpperSigmaIndex(averageIndex, index, remainingTime);

  return {
    category: getPanelRiskCategory(displayIndex, confidence.upper, upperSigmaIndex),
    averageIndex,
    upperSigmaIndex,
    confidenceUpper: confidence.upper,
  };
}

function buildPanelSummaryState(point: ApproachPoint, data: ApproachPoint[]) {
  const sourceData = data.length ? data : [point];
  const highestPoint = sourceData.reduce((max, item) => (item.turbulenceIndex > max.turbulenceIndex ? item : max), sourceData[0]);
  const highestIndex = normalizeIndexForPanel(highestPoint.turbulenceIndex);
  const index = Math.max(0, sourceData.findIndex((item) => item.time === highestPoint.time));
  const remainingTime = Math.max(0, Math.round(60 - highestPoint.time));
  const averageIndex = buildPanelAverageIndex(index, remainingTime, highestIndex);

  return {
    highestIndex,
    highestDelta: highestIndex - averageIndex,
  };
}

function getPanelRiskCategory(displayIndex: number, confidenceUpper: number, upperSigmaIndex: number): PanelRiskCategory {
  if (displayIndex > upperSigmaIndex) {
    return 'high';
  }

  if (confidenceUpper > upperSigmaIndex) {
    return 'medium';
  }

  return 'low';
}

function buildPanelConfidenceInterval(point: ApproachPoint, data: ApproachPoint[], index: number, displayIndex: number) {
  if (Number.isFinite(point.ciLower) && Number.isFinite(point.ciUpper)) {
    return widenPanelConfidenceInterval({
      lower: normalizeIndexForPanel(point.ciLower),
      upper: normalizeIndexForPanel(point.ciUpper),
      center: displayIndex,
      minHalfWidth: windIndexDeltaFromUnit(0.18),
    });
  }

  const start = Math.max(0, index - 4);
  const recent = data.slice(start, index + 1).map((item) => normalizeIndexForPanel(item.turbulenceIndex));
  const deltas = recent.slice(1).map((value, deltaIndex) => Math.abs(value - recent[deltaIndex]));
  const volatility = deltas.length ? deltas.reduce((sum, value) => sum + value, 0) / deltas.length : 0;
  const displayUnit = normalizeWindDisturbanceIndex(displayIndex);
  const width = windIndexDeltaFromUnit(clampPanelValue((0.09 + volatility * 1.05 + displayUnit * 0.055) * 2, 0.16, 0.42));

  return {
    lower: clampPanelValue(displayIndex - width, WIND_DISTURBANCE_INDEX_MIN, WIND_DISTURBANCE_INDEX_MAX),
    upper: clampPanelValue(displayIndex + width, WIND_DISTURBANCE_INDEX_MIN, WIND_DISTURBANCE_INDEX_MAX),
  };
}

function widenPanelConfidenceInterval({
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
    lower: clampPanelValue(midpoint - halfWidth, WIND_DISTURBANCE_INDEX_MIN, WIND_DISTURBANCE_INDEX_MAX),
    upper: clampPanelValue(midpoint + halfWidth, WIND_DISTURBANCE_INDEX_MIN, WIND_DISTURBANCE_INDEX_MAX),
  };
}

function buildPanelAverageIndex(index: number, remainingTime: number, currentIndex: number) {
  const profile = {
    baseline: 0.39,
    peakAt: 22,
    secondaryPeakAt: 15,
    spread: 72,
    peakLift: 0.16,
    secondaryLift: 0.09,
    wave: 0.022,
    period: 6,
    phase: 0.7,
  };
  const approachBump = Math.exp(-((remainingTime - profile.peakAt) ** 2) / profile.spread) * profile.peakLift;
  const secondaryBump = Math.exp(-((remainingTime - profile.secondaryPeakAt) ** 2) / (profile.spread * 1.25)) * profile.secondaryLift;
  const wave = Math.sin((index + profile.phase) / profile.period) * profile.wave;
  const anchored = profile.baseline + approachBump + secondaryBump + wave;
  const currentUnit = normalizeWindDisturbanceIndex(currentIndex);

  return windIndexFromUnit(anchored * 0.78 + currentUnit * 0.22);
}

function buildPanelUpperSigmaIndex(averageIndex: number, index: number, remainingTime: number) {
  const landingSensitivity = Math.exp(-((remainingTime - 18) ** 2) / 110) * 0.018;
  const localWave = (Math.sin(index / 4.6) + 1) * 0.006;
  const standardDeviation = (0.055 + landingSensitivity + localWave) * 2;

  return clampPanelValue(averageIndex + windIndexDeltaFromUnit(standardDeviation * 2), WIND_DISTURBANCE_INDEX_MIN, WIND_DISTURBANCE_INDEX_MAX);
}

function normalizeIndexForPanel(value: number) {
  return toWindDisturbanceIndex(value);
}

function clampPanelValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatSignedDelta(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;
}

export default FlightStatusPanel;

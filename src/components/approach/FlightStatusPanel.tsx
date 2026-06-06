import type { ReactNode } from 'react';
import { Activity, Gauge, Navigation, Plane, SlidersHorizontal, Weight, Wind } from 'lucide-react';
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
  const tone = panelRiskMeta[riskState.category];
  const [rangeStart, rangeEnd] = selectedTimeRange;
  const [minimumTime, maximumTime] = availableTimeRange;
  const aircraftWeight = '总重 68.5 t';

  return (
    <aside className="surface-card flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">航班状态</h2>
        </div>
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Plane size={20} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MetricTile label="航班信息" value={flight} icon={<Plane size={15} />} />
        <MetricTile label="阶段" value={stage} icon={<Activity size={15} />} />
        <MetricTile label="飞机重量" value={aircraftWeight} icon={<Weight size={15} />} />
        <MetricTile label="高度" value={`${displayPoint.altitude} ft`} icon={<Gauge size={15} />} />
        <MetricTile label="风扰指数" value={formatWindDisturbanceIndex(displayPoint.turbulenceIndex)} icon={<Activity size={15} />} prominent />
      </div>

      <section className="mt-4 rounded-[24px] border border-border/75 bg-[#f9f6ef] p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal size={16} className="text-accent" />
          分析控制
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground">
            <span>时间范围</span>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] text-foreground">
              {rangeStart}s - {rangeEnd}s
            </span>
          </div>

          <div className="mt-4 rounded-[20px] border border-border/70 bg-white/84 px-4 py-4">
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

      <div className="mt-4 rounded-[22px] border border-border/70 bg-white/85 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">风险等级</div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.pillClass}`}>{tone.label}</span>
        </div>
        <div className="mt-3 h-2.5 rounded-full bg-[#eee3d4]">
          <div className={`h-2.5 rounded-full ${tone.barClass}`} style={{ width: `${normalizeProgressWidth(displayPoint.turbulenceIndex)}%` }} />
        </div>
        <div className="mt-2 text-xs leading-5 text-muted-foreground">
          月均 {formatWindDisturbanceIndex(riskState.averageIndex)} / 上2σ {formatWindDisturbanceIndex(riskState.upperSigmaIndex)} / 置信上界 {formatWindDisturbanceIndex(riskState.confidenceUpper)}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatusTile icon={<Wind size={15} className="text-accent" />} label="风速" value={`${displayPoint.windSpeed} kt`} />
        <StatusTile
          icon={<Navigation size={15} className="text-accent" />}
          label={
            <span className="leading-tight">
              原始风向与航向夹角
              <span className="mt-0.5 block text-[10px] uppercase tracking-[0.08em]">Wind-Heading Angle</span>
            </span>
          }
          value={`${displayPoint.windDirection}°`}
        />
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
}: {
  label: string;
  value: string;
  icon: ReactNode;
  prominent?: boolean;
}) {
  return (
    <div className={`rounded-[18px] border p-3.5 ${prominent ? 'border-accent/25 bg-accent/10' : 'border-border/70 bg-white/85'}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-accent">{icon}</span>
        {label}
      </div>
      <div className={`mt-2 font-semibold leading-tight ${prominent ? 'text-2xl text-accent' : 'text-sm text-foreground sm:text-base'}`}>{value}</div>
    </div>
  );
}

function StatusTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: ReactNode;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-border/70 bg-white/85 px-3.5 py-3">
      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-foreground sm:text-base">{value}</div>
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

export default FlightStatusPanel;

import type { ReactNode } from 'react';
import { Activity, Gauge, Navigation, Plane, SlidersHorizontal, Wind } from 'lucide-react';
import type { AverageDimension, TimeRange } from './approachAnalysisTypes';
import { averageDimensionOptions } from './approachAnalysisTypes';
import type { ApproachPoint } from '../../data/mockApproachData';
import { riskLevelMeta } from '../../utils/riskLevel';
import { formatWindDisturbanceIndex, indexToPercent } from '../../utils/indexScale';

type FlightStatusPanelProps = {
  point: ApproachPoint;
  fallbackPoint: ApproachPoint;
  flight: string;
  stage: string;
  averageDimension: AverageDimension;
  onAverageDimensionChange: (value: AverageDimension) => void;
  availableTimeRange: TimeRange;
  selectedTimeRange: TimeRange;
  onTimeRangeChange: (value: TimeRange) => void;
};

function FlightStatusPanel({
  point,
  fallbackPoint,
  flight,
  stage,
  averageDimension,
  onAverageDimensionChange,
  availableTimeRange,
  selectedTimeRange,
  onTimeRangeChange,
}: FlightStatusPanelProps) {
  const displayPoint = point ?? fallbackPoint;
  const tone = riskLevelMeta[displayPoint.riskLevel];
  const [rangeStart, rangeEnd] = selectedTimeRange;
  const [minimumTime, maximumTime] = availableTimeRange;

  return (
    <aside className="surface-card flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">航班状态</h2>
          <div className="mt-1 text-sm text-muted-foreground">航班信息与阶段由当前数据源决定，仅用于展示。</div>
        </div>
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Plane size={20} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MetricTile label="航班信息" value={flight} icon={<Plane size={15} />} />
        <MetricTile label="阶段" value={stage} icon={<Activity size={15} />} />
        <MetricTile label="高度" value={`${displayPoint.altitude} ft`} icon={<Gauge size={15} />} />
        <MetricTile label="风扰指数" value={formatWindDisturbanceIndex(displayPoint.turbulenceIndex)} icon={<Activity size={15} />} prominent />
      </div>

      <section className="mt-4 rounded-[24px] border border-border/75 bg-[#f9f6ef] p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal size={16} className="text-accent" />
          分析控制
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">平均曲线维度</label>
          <div className="mt-2">
            <select
              value={averageDimension}
              onChange={(event) => onAverageDimensionChange(event.target.value as AverageDimension)}
              className="h-11 w-full rounded-2xl border border-border/80 bg-white/88 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-accent/30"
            >
              {averageDimensionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5">
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
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.pillClass}`}>{displayPoint.riskLevel}</span>
        </div>
        <div className="mt-3 h-2.5 rounded-full bg-[#eee3d4]">
          <div className={`h-2.5 rounded-full ${tone.barClass}`} style={{ width: `${normalizeProgressWidth(displayPoint.turbulenceIndex)}%` }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatusTile icon={<Wind size={15} className="text-accent" />} label="风速" value={`${displayPoint.windSpeed} kt`} />
        <StatusTile icon={<Navigation size={15} className="text-accent" />} label="风向" value={`${displayPoint.windDirection}°`} />
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
  label: string;
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

export default FlightStatusPanel;

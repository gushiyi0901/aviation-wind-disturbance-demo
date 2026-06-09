import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, Compass, Waves } from 'lucide-react';
import { airportTrendMonthNumbers, airportTrendYears, type AirportRiskProfile } from '../../data/mockAirportRiskData';
import { airportRiskMeta } from '../../utils/airportRiskMeta';
import { formatWindDisturbanceIndex, indexToPercent, WIND_DISTURBANCE_INDEX_MAX, WIND_DISTURBANCE_INDEX_MIN } from '../../utils/indexScale';

type AirportDetailPanelProps = {
  airports: AirportRiskProfile[];
  airport: AirportRiskProfile;
  selectedAirportId: string;
  onSelect: (id: string) => void;
};

function AirportDetailPanel({ airports, airport, selectedAirportId, onSelect }: AirportDetailPanelProps) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonthNumber, setSelectedMonthNumber] = useState('05');
  const tone = airportRiskMeta[airport.riskLevel];
  const predictionInterval = buildPredictionInterval(airport);
  const displayPeriod = `${selectedYear}年${Number(selectedMonthNumber)}月`;

  return (
    <aside className="surface-card flex h-full flex-col p-4">
      <div>
        <label className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">机场选择</label>
        <div className="relative mt-2">
          <select
            value={selectedAirportId}
            onChange={(event) => onSelect(event.target.value)}
            className="h-12 w-full appearance-none rounded-2xl border border-border/80 bg-white/85 px-4 pr-11 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-accent/30"
          >
            {airports.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">年份</span>
          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            className="mt-2 h-11 w-full rounded-2xl border border-border/80 bg-white/88 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-accent/30"
          >
            {airportTrendYears.map((year) => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">月份</span>
          <select
            value={selectedMonthNumber}
            onChange={(event) => setSelectedMonthNumber(event.target.value)}
            className="mt-2 h-11 w-full rounded-2xl border border-border/80 bg-white/88 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-accent/30"
          >
            {airportTrendMonthNumbers.map((month) => (
              <option key={month} value={month}>
                {Number(month)}月
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{airport.name}</h2>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${tone.pillClass}`}>{airport.riskLevel}</span>
      </div>

      <div className="mt-3 rounded-[24px] border border-border/75 bg-white/85 p-3.5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">{displayPeriod}平均风扰指数</div>
            <div className="mt-2 text-5xl font-extrabold leading-none text-foreground">{formatWindDisturbanceIndex(airport.currentIndex)}</div>
          </div>
        </div>
        <div className="mt-4 h-2.5 rounded-full bg-[#eee3d4]">
          <div className="h-2.5 rounded-full" style={{ width: `${indexToPercent(airport.currentIndex)}%`, backgroundColor: tone.dotColor }} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <MetricTile label="主导风向" value={airport.mainWindDirection} icon={<Compass size={15} />} />
        <MetricTile label="参考" value={`${airport.windSpeed} kt`} icon={<Waves size={15} />} />
      </div>

      <div className="mt-2.5 rounded-[22px] border border-border/75 bg-white/85 p-3">
        <div className="text-sm font-semibold text-foreground">主要扰动来源</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {airport.mainFactors.map((factor) => (
            <span key={factor} className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
              {factor}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2.5 rounded-[22px] border border-border/75 bg-white/85 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-foreground">95%置信区间</div>
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-2.5">
          <MetricStack label="下界" value={predictionInterval.lower} />
          <MetricStack label="中心" value={airport.currentIndex} />
          <MetricStack label="上界" value={predictionInterval.upper} />
        </div>
      </div>
    </aside>
  );
}

function MetricTile({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-border/70 bg-white/85 p-3.5">
      <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-accent">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold leading-6 text-foreground">{value}</div>
    </div>
  );
}

function MetricStack({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] bg-background/90 px-3 py-3 text-center">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold text-foreground">{formatWindDisturbanceIndex(value)}</div>
    </div>
  );
}

function buildPredictionInterval(airport: AirportRiskProfile) {
  const deviation = Math.abs(airport.currentIndex - airport.annualAverage);
  const halfWidth = Math.max(0.12, Math.min(0.42, 0.12 + airport.windSpeed * 0.004 + deviation * 0.18));
  const lower = Math.max(WIND_DISTURBANCE_INDEX_MIN, airport.currentIndex - halfWidth);
  const upper = Math.min(WIND_DISTURBANCE_INDEX_MAX, airport.currentIndex + halfWidth);

  return {
    lower: Number(lower.toFixed(2)),
    upper: Number(upper.toFixed(2)),
    width: upper - lower,
  };
}

export default AirportDetailPanel;

import type { ReactNode } from 'react';
import { ChevronDown, Compass, MapPinned, Waves } from 'lucide-react';
import type { AirportRiskProfile } from '../../data/mockAirportRiskData';
import { airportRiskMeta } from '../../utils/airportRiskMeta';

type AirportDetailPanelProps = {
  airports: AirportRiskProfile[];
  airport: AirportRiskProfile;
  selectedAirportId: string;
  onSelect: (id: string) => void;
};

function AirportDetailPanel({ airports, airport, selectedAirportId, onSelect }: AirportDetailPanelProps) {
  const tone = airportRiskMeta[airport.riskLevel];
  const predictionInterval = buildPredictionInterval(airport);

  return (
    <aside className="surface-card flex h-full flex-col p-5 sm:p-6">
      <div className="section-kicker bg-white/70">机场详情</div>

      <div className="mt-5">
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

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{airport.name}</h2>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-sm text-muted-foreground">
            <MapPinned size={14} className="text-accent" />
            {airport.type}
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${tone.pillClass}`}>{airport.riskLevel}</span>
      </div>

      <div className="mt-5 rounded-[26px] border border-border/75 bg-white/85 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">当前风扰指数</div>
            <div className="mt-2 text-5xl font-extrabold leading-none text-foreground">{airport.currentIndex}</div>
          </div>
          <div className="rounded-[22px] bg-background/90 px-4 py-3 text-right">
            <div className="text-xs text-muted-foreground">平均指数</div>
            <div className="mt-1 text-lg font-semibold text-foreground">{airport.annualAverage}</div>
          </div>
        </div>
        <div className="mt-4 h-2.5 rounded-full bg-[#eee3d4]">
          <div className="h-2.5 rounded-full" style={{ width: `${airport.currentIndex}%`, backgroundColor: tone.dotColor }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MetricTile label="主导风向" value={airport.mainWindDirection} icon={<Compass size={15} />} />
        <MetricTile label="风速参考" value={`${airport.windSpeed} kt`} icon={<Waves size={15} />} />
      </div>

      <div className="mt-4 rounded-[24px] border border-border/75 bg-white/85 p-4">
        <div className="text-sm font-semibold text-foreground">主要扰动来源</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {airport.mainFactors.map((factor) => (
            <span key={factor} className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
              {factor}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-border/75 bg-white/85 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-foreground">置信区间</div>
          <span className="rounded-full bg-background/90 px-3 py-1 text-[11px] text-muted-foreground">当前最佳预测</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
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
      <div className="mt-1 text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}

function buildPredictionInterval(airport: AirportRiskProfile) {
  const deviation = Math.abs(airport.currentIndex - airport.annualAverage);
  const halfWidth = Math.round(Math.max(4, Math.min(16, 4 + airport.windSpeed * 0.18 + deviation * 0.12)));
  const lower = Math.max(0, airport.currentIndex - halfWidth);
  const upper = Math.min(100, airport.currentIndex + halfWidth);

  return {
    lower,
    upper,
    width: upper - lower,
  };
}

export default AirportDetailPanel;

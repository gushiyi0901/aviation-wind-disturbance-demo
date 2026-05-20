import type { ReactNode } from 'react';
import { ChevronDown, Gauge, Radar, Wind } from 'lucide-react';
import type { EventAnalysisAirport } from '../../data/mockEventAnalysisData';
import { eventQuadrantMeta } from '../../data/mockEventAnalysisData';
import { formatWindDisturbanceIndex } from '../../utils/indexScale';

type EventSummaryPanelProps = {
  airports: EventAnalysisAirport[];
  airport: EventAnalysisAirport;
  selectedAirportId: string;
  onSelect: (id: string) => void;
};

function EventSummaryPanel({ airports, airport, selectedAirportId, onSelect }: EventSummaryPanelProps) {
  const quadrant = eventQuadrantMeta[airport.quadrant];

  return (
    <aside className="surface-card h-full p-5 sm:p-6">
      <div className="section-kicker bg-white/70">机场摘要</div>

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
          <div className="mt-2 text-sm text-muted-foreground">{quadrant.shortLabel}</div>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${quadrant.pillClass}`}>{airport.quadrant}</span>
      </div>

      <div className="mt-5 rounded-[26px] border border-border/75 bg-white/85 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">平均风扰指数</div>
            <div className="mt-2 text-5xl font-extrabold leading-none text-foreground">{formatWindDisturbanceIndex(airport.averageIndex)}</div>
          </div>
          <div className="rounded-[22px] bg-background/90 px-4 py-3 text-right">
            <div className="text-xs text-muted-foreground">降落事件数</div>
            <div className="mt-1 text-lg font-semibold text-foreground">{airport.eventCount}</div>
          </div>
        </div>
        <div className="mt-4 inline-flex rounded-full border border-accent/15 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">
          {quadrant.description}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MetricTile label="高风险时段" value={airport.highRiskPeriod} icon={<Radar size={15} />} />
        <MetricTile label="主要扰动来源" value={airport.mainFactor} icon={<Wind size={15} />} />
        <MetricTile label="相关性评分" value={airport.correlationScore.toFixed(2)} icon={<Gauge size={15} />} />
        <MetricTile label="象限类别" value={airport.quadrant} icon={<Gauge size={15} />} />
      </div>
    </aside>
  );
}

function MetricTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
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

export default EventSummaryPanel;

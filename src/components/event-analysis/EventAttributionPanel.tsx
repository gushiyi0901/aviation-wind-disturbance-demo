import type { EventAnalysisAirport } from '../../data/mockEventAnalysisData';
import { eventQuadrantMeta } from '../../data/mockEventAnalysisData';

function EventAttributionPanel({ airport }: { airport: EventAnalysisAirport }) {
  const tone = eventQuadrantMeta[airport.quadrant];
  const bars = [
    ['风速变化', airport.attribution.windSpeedChange],
    ['风向波动', airport.attribution.windDirectionFluctuation],
    ['低高度扰动', airport.attribution.lowAltitudeDisturbance],
    ['其他因素', airport.attribution.other],
  ] as const;

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="section-kicker bg-white/70">风险归因分析</div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">事件归因结构</h2>
          <div className="mt-2 text-sm text-muted-foreground">{airport.name}</div>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${tone.pillClass}`}>{airport.mainFactor}</span>
      </div>

      <div className="mt-6 space-y-4">
        {bars.map(([label, value]) => (
          <div key={label}>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{label}</span>
              <span className="font-semibold text-foreground">{value}%</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-[#eee3d4]">
              <div className={`h-3 rounded-full ${tone.accentBar}`} style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default EventAttributionPanel;

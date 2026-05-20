import type { EventAnalysisAirport } from '../../data/mockEventAnalysisData';
import { eventQuadrantMeta } from '../../data/mockEventAnalysisData';
import { formatWindDisturbanceIndex } from '../../utils/indexScale';

type EventFocusListProps = {
  airports: EventAnalysisAirport[];
  selectedAirportId: string;
  onSelect: (id: string) => void;
};

function EventFocusList({ airports, selectedAirportId, onSelect }: EventFocusListProps) {
  const ranked = [...airports]
    .sort((a, b) => {
      const scoreA = a.averageIndex * 58 + a.eventCount * 0.42 + a.correlationScore * 10;
      const scoreB = b.averageIndex * 58 + b.eventCount * 0.42 + b.correlationScore * 10;
      return scoreB - scoreA;
    })
    .slice(0, 6);

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="section-kicker bg-white/70">重点机场观察</div>
      <h2 className="mt-4 text-2xl font-bold text-foreground">重点机场榜单</h2>

      <div className="mt-6 space-y-3">
        {ranked.map((airport, index) => {
          const tone = eventQuadrantMeta[airport.quadrant];
          const isSelected = airport.id === selectedAirportId;

          return (
            <button
              key={airport.id}
              type="button"
              onClick={() => onSelect(airport.id)}
              className={`w-full rounded-[24px] border px-4 py-4 text-left transition duration-200 ${
                isSelected
                  ? 'border-accent/25 bg-white shadow-soft'
                  : 'border-border/70 bg-white/82 hover:-translate-y-0.5 hover:shadow-soft'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-foreground">{airport.name}</div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tone.pillClass}`}>{airport.quadrant}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-3 text-sm text-muted-foreground">
                    <span>平均风扰指数 {formatWindDisturbanceIndex(airport.averageIndex)}</span>
                    <span>降落事件数 {airport.eventCount}</span>
                    <span>评分 {airport.correlationScore.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default EventFocusList;

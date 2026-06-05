import { ChevronDown } from 'lucide-react';
import type { EventAnalysisAirport } from '../../data/mockEventAnalysisData';
import { eventAnalysisMonthNumbers, eventAnalysisYears, eventQuadrantMeta } from '../../data/mockEventAnalysisData';
import { formatWindDisturbanceIndex } from '../../utils/indexScale';

type EventSummaryPanelProps = {
  airports: EventAnalysisAirport[];
  airport: EventAnalysisAirport;
  selectedAirportId: string;
  selectedYear: string;
  selectedMonth: string;
  onSelect: (id: string) => void;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
};

function EventSummaryPanel({
  airports,
  airport,
  selectedAirportId,
  selectedYear,
  selectedMonth,
  onSelect,
  onYearChange,
  onMonthChange,
}: EventSummaryPanelProps) {
  const quadrant = eventQuadrantMeta[airport.quadrant];
  const bars = [
    ['风速变化', airport.attribution.windSpeedChange],
    ['风向波动', airport.attribution.windDirectionFluctuation],
    ['低高度扰动', airport.attribution.lowAltitudeDisturbance],
    ['其他因素', airport.attribution.other],
  ] as const;
  const displayPeriod = `${selectedYear}年${Number(selectedMonth)}月`;
  const primaryAirportOrder = ['shanghai-hongqiao', 'beijing-daxing', 'chengdu-tianfu'];
  const orderedAirports = [...airports].sort((left, right) => {
    const leftIndex = primaryAirportOrder.indexOf(left.id);
    const rightIndex = primaryAirportOrder.indexOf(right.id);

    if (leftIndex === -1 && rightIndex === -1) {
      return 0;
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });

  return (
    <aside className="surface-card h-full p-5 sm:p-6">
      <div className="section-kicker bg-white/70">机场摘要</div>

      <div className="mt-5 grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <label className="block h-4 text-xs font-semibold leading-4 tracking-[0.12em] text-muted-foreground">机场选择</label>
          <div className="relative mt-2">
            <select
              value={selectedAirportId}
              onChange={(event) => onSelect(event.target.value)}
              className="h-12 w-full appearance-none rounded-2xl border border-border/80 bg-white/85 px-4 pr-11 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-accent/30"
            >
              {orderedAirports.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="min-w-0">
          <div className="h-4 text-xs font-semibold leading-4 tracking-[0.12em] text-muted-foreground">月份选择</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <select
              value={selectedYear}
              onChange={(event) => onYearChange(event.target.value)}
              className="h-12 rounded-2xl border border-border/80 bg-white/85 px-3 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-accent/30"
            >
              {eventAnalysisYears.map((year) => (
                <option key={year} value={year}>
                  {year}年
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(event) => onMonthChange(event.target.value)}
              className="h-12 rounded-2xl border border-border/80 bg-white/85 px-3 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-accent/30"
            >
              {eventAnalysisMonthNumbers.map((month) => (
                <option key={month} value={month}>
                  {Number(month)}月
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{airport.name}</h2>
          <div className="mt-2 text-sm text-muted-foreground">{displayPeriod}样本</div>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${quadrant.pillClass}`}>{quadrant.shortLabel}</span>
      </div>

      <div className="mt-5 rounded-[26px] border border-border/75 bg-white/85 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] bg-background/90 px-4 py-3">
            <div className="text-sm text-muted-foreground">平均风扰指数</div>
            <div className="mt-2 text-5xl font-extrabold leading-none text-foreground">{formatWindDisturbanceIndex(airport.averageIndex)}</div>
          </div>
          <div className="rounded-[22px] bg-background/90 px-4 py-3">
            <div className="text-sm text-muted-foreground">降落事件数</div>
            <div className="mt-2 text-5xl font-extrabold leading-none text-foreground">{airport.eventCount}</div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[26px] border border-border/75 bg-white/85 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="section-kicker bg-background/90">风险归因分析</div>
            <h3 className="mt-3 text-xl font-bold text-foreground">事件归因结构</h3>
          </div>
          <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${quadrant.pillClass}`}>{airport.mainFactor}</span>
        </div>

        <div className="mt-5 space-y-3">
          {bars.map(([label, value]) => (
            <div key={label}>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{label}</span>
                <span className="font-semibold text-foreground">{value}%</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-[#eee3d4]">
                <div className={`h-3 rounded-full ${quadrant.accentBar}`} style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default EventSummaryPanel;

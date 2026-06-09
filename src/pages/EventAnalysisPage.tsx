import { useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, LogOut } from 'lucide-react';
import EventDailyTimeline from '../components/event-analysis/EventDailyTimeline';
import EventScatterPlot from '../components/event-analysis/EventScatterPlot';
import EventSummaryPanel from '../components/event-analysis/EventSummaryPanel';
import BrandLogos from '../components/BrandLogos';
import {
  defaultEventAirportId,
  eventAnalysisAirports,
  getDailyEventCounts,
  getMonthlyEventAirportProfile,
  getMonthlyEventAirportProfiles,
} from '../data/mockEventAnalysisData';
import { formatWindDisturbanceIndex } from '../utils/indexScale';

type EventAnalysisPageProps = {
  onLogout: () => void;
};

function EventAnalysisPage({ onLogout }: EventAnalysisPageProps) {
  const [selectedAirportId, setSelectedAirportId] = useState(defaultEventAirportId);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('05');
  const [isAuxiliaryOpen, setIsAuxiliaryOpen] = useState(false);

  const monthlyAirports = useMemo(() => getMonthlyEventAirportProfiles(selectedYear, selectedMonth), [selectedMonth, selectedYear]);
  const selectedBaseAirport = useMemo(
    () => eventAnalysisAirports.find((airport) => airport.id === selectedAirportId) ?? eventAnalysisAirports[0],
    [selectedAirportId],
  );
  const selectedAirport = useMemo(
    () => getMonthlyEventAirportProfile(selectedBaseAirport, selectedYear, selectedMonth),
    [selectedBaseAirport, selectedMonth, selectedYear],
  );
  const dailyEvents = useMemo(() => getDailyEventCounts(selectedBaseAirport, selectedYear, selectedMonth), [selectedBaseAirport, selectedMonth, selectedYear]);
  const previousPeriod = useMemo(() => getPreviousPeriod(selectedYear, selectedMonth), [selectedMonth, selectedYear]);
  const previousMonthAirport = useMemo(
    () => getMonthlyEventAirportProfile(selectedBaseAirport, previousPeriod.year, previousPeriod.month),
    [previousPeriod.month, previousPeriod.year, selectedBaseAirport],
  );

  return (
    <div className="min-h-screen px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <header className="glass-nav mx-auto flex max-w-[1680px] flex-col gap-3 px-4 py-3 sm:px-5 md:flex-row md:items-center md:justify-between">
        <BrandLogos />

        <div className="text-xl font-bold leading-tight text-foreground sm:text-2xl lg:text-3xl">运行风险关联与归因分析</div>

        <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
          <a href="/" className="action-secondary">
            <ArrowLeft size={16} />
            返回首页
          </a>
          <button type="button" onClick={onLogout} className="action-secondary">
            <LogOut size={16} />
            退出登录
          </button>
        </div>
      </header>

      <main className="mx-auto mt-5 max-w-[1680px]">
        <section className="grid gap-6 xl:grid-cols-[minmax(420px,0.4fr)_minmax(0,0.6fr)]">
          <EventSummaryPanel
            airports={eventAnalysisAirports}
            airport={selectedAirport}
            selectedAirportId={selectedAirportId}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onSelect={setSelectedAirportId}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
          />
          <EventDailyTimeline airport={selectedAirport} year={selectedYear} month={selectedMonth} data={dailyEvents} />
        </section>

        <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-border/70 bg-white/60 px-5 py-4">
            <div className="section-kicker bg-white/70">辅助分析</div>
            <button type="button" onClick={() => setIsAuxiliaryOpen((value) => !value)} className="action-secondary">
              {isAuxiliaryOpen ? '收起辅助分析' : '展开辅助分析'}
            </button>
          </div>

          {isAuxiliaryOpen && (
            <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(320px,0.34fr)_minmax(0,0.66fr)]">
              <AuxiliaryMetrics
                airports={eventAnalysisAirports}
                airport={previousMonthAirport}
                selectedAirportId={selectedAirportId}
                monthLabel={previousPeriod.label}
                onSelect={setSelectedAirportId}
              />
              <EventScatterPlot airports={monthlyAirports} selectedAirportId={selectedAirportId} onSelect={setSelectedAirportId} />
            </div>
          )}
        </section>

        <section className="mt-6 rounded-[28px] border border-amber-300/70 bg-amber-50/90 px-5 py-5 shadow-sm">
          <p className="text-sm leading-7 text-slate-700 sm:text-[15px]">
            本页面为科研成果演示 Demo，当前机场风险表现、风扰指数与归因数据均为模拟数据或脱敏样例数据，结果仅用于项目交流、方法展示与可视化说明，不作为实际飞行安全决策依据。
          </p>
        </section>
      </main>
    </div>
  );
}

function AuxiliaryMetrics({
  airports,
  airport,
  selectedAirportId,
  monthLabel,
  onSelect,
}: {
  airports: typeof eventAnalysisAirports;
  airport: ReturnType<typeof getMonthlyEventAirportProfile>;
  selectedAirportId: string;
  monthLabel: string;
  onSelect: (id: string) => void;
}) {
  const primaryAirportOrder = ['shanghai-hongqiao', 'beijing-daxing', 'chengdu-tianfu'];
  const orderedAirports = [...airports].sort((left, right) => {
    const leftIndex = primaryAirportOrder.indexOf(left.id);
    const rightIndex = primaryAirportOrder.indexOf(right.id);

    if (leftIndex === -1 && rightIndex === -1) return 0;
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });

  return (
    <section className="surface-card p-5 sm:p-6">
      <div>
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

      <h2 className="mt-5 text-2xl font-bold leading-tight text-foreground">{monthLabel}{airport.name}指数 - 风险指标</h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <MetricTile label="平均风扰指数" value={formatWindDisturbanceIndex(airport.averageIndex)} />
        <MetricTile label="降落风险数" value={String(airport.eventCount)} />
        <MetricTile label="相关性评分" value={airport.correlationScore.toFixed(2)} />
      </div>
    </section>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-border/70 bg-white/85 p-3.5">
      <div className="text-sm font-semibold text-muted-foreground">{label}</div>
      <div className="mt-2 text-lg font-bold leading-7 text-foreground">{value}</div>
    </div>
  );
}

function getPreviousPeriod(year: string, month: string) {
  const selectedDate = new Date(Number(year), Number(month) - 2, 1);
  const previousYear = String(selectedDate.getFullYear());
  const previousMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');

  return {
    year: previousYear,
    month: previousMonth,
    label: `上月${previousYear}年${selectedDate.getMonth() + 1}月`,
  };
}

export default EventAnalysisPage;

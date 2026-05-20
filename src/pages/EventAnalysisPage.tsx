import { useMemo, useState } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import EventAttributionPanel from '../components/event-analysis/EventAttributionPanel';
import EventFocusList from '../components/event-analysis/EventFocusList';
import EventScatterPlot from '../components/event-analysis/EventScatterPlot';
import EventSummaryPanel from '../components/event-analysis/EventSummaryPanel';
import { defaultEventAirportId, eventAnalysisAirports } from '../data/mockEventAnalysisData';

type EventAnalysisPageProps = {
  onLogout: () => void;
};

function EventAnalysisPage({ onLogout }: EventAnalysisPageProps) {
  const [selectedAirportId, setSelectedAirportId] = useState(defaultEventAirportId);

  const selectedAirport = useMemo(
    () => eventAnalysisAirports.find((airport) => airport.id === selectedAirportId) ?? eventAnalysisAirports[0],
    [selectedAirportId],
  );

  return (
    <div className="min-h-screen px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <header className="glass-nav mx-auto flex max-w-[1680px] flex-col gap-3 px-4 py-3 sm:px-5 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex h-10 items-center rounded-full border border-accent/20 bg-accent/10 px-3 text-sm font-semibold text-accent">
          进近风扰风险指数
        </div>

        <div className="text-sm font-semibold text-foreground sm:text-base">运行事件关联与归因分析</div>

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

      <main className="mx-auto mt-8 max-w-[1680px]">
        <section className="surface-card px-6 py-7 sm:px-8">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-[3.15rem]">运行事件关联与归因分析</h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            从机场层面观察风扰指数与降落事件的关系，并对重点机场进行归因分析
          </p>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(300px,0.3fr)_minmax(0,0.7fr)]">
          <EventSummaryPanel
            airports={eventAnalysisAirports}
            airport={selectedAirport}
            selectedAirportId={selectedAirportId}
            onSelect={setSelectedAirportId}
          />
          <EventScatterPlot airports={eventAnalysisAirports} selectedAirportId={selectedAirportId} onSelect={setSelectedAirportId} />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <EventAttributionPanel airport={selectedAirport} />
          <EventFocusList airports={eventAnalysisAirports} selectedAirportId={selectedAirportId} onSelect={setSelectedAirportId} />
        </section>

        <section className="mt-6 rounded-[28px] border border-amber-300/70 bg-amber-50/90 px-5 py-5 shadow-sm">
          <p className="text-sm leading-7 text-slate-700 sm:text-[15px]">
            本页面为科研成果演示 Demo，当前机场事件、风扰指数与归因数据均为模拟数据或脱敏样例数据，结果仅用于项目交流、方法展示与可视化说明，不作为实际飞行安全决策依据。
          </p>
        </section>
      </main>
    </div>
  );
}

export default EventAnalysisPage;

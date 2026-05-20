import { useMemo, useState } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import AirportMapCard from '../components/airports/AirportMapCard';
import AirportDetailPanel from '../components/airports/AirportDetailPanel';
import AirportTrendPanel from '../components/airports/AirportTrendPanel';
import AirportLocalRiskPanel from '../components/airports/AirportLocalRiskPanel';
import { airportRiskProfiles, defaultAirportId, type TimeScale } from '../data/mockAirportRiskData';

type AirportRiskPageProps = {
  onLogout: () => void;
};

function AirportRiskPage({ onLogout }: AirportRiskPageProps) {
  const [selectedAirportId, setSelectedAirportId] = useState(defaultAirportId);
  const [activeScale, setActiveScale] = useState<TimeScale>('month');

  const selectedAirport = useMemo(
    () => airportRiskProfiles.find((airport) => airport.id === selectedAirportId) ?? airportRiskProfiles[0],
    [selectedAirportId],
  );

  return (
    <div className="min-h-screen px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <header className="glass-nav mx-auto flex max-w-[1680px] flex-col gap-3 px-4 py-3 sm:px-5 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/20 bg-accent/10">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        </div>

        <div className="text-sm font-semibold text-foreground sm:text-base">机场风扰风险画像</div>

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
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-[3.2rem]">机场风扰风险画像</h1>
        </section>

        <section className="mt-6 grid items-stretch gap-6 xl:grid-cols-[minmax(280px,0.27fr)_minmax(0,0.73fr)] 2xl:grid-cols-[minmax(300px,0.25fr)_minmax(0,0.75fr)]">
          <AirportDetailPanel
            airports={airportRiskProfiles}
            airport={selectedAirport}
            selectedAirportId={selectedAirportId}
            onSelect={setSelectedAirportId}
          />
          <AirportMapCard airports={airportRiskProfiles} selectedAirportId={selectedAirportId} onSelect={setSelectedAirportId} />
        </section>

        <section className="mt-6 space-y-6">
          <AirportTrendPanel airport={selectedAirport} scale={activeScale} onScaleChange={setActiveScale} />
          <AirportLocalRiskPanel airport={selectedAirport} />
        </section>

        <section className="mt-6 rounded-[28px] border border-amber-300/70 bg-amber-50/90 px-5 py-5 shadow-sm">
          <p className="text-sm leading-7 text-slate-700 sm:text-[15px]">
            本页面为科研成果演示 Demo，当前机场点位、指数与趋势数据均为模拟数据或脱敏样例数据，结果仅用于项目交流、方法展示与可视化说明，不作为实际飞行安全决策依据。
          </p>
        </section>
      </main>
    </div>
  );
}

export default AirportRiskPage;

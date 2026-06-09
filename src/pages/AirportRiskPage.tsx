import { useMemo, useState } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import AirportMapCard from '../components/airports/AirportMapCard';
import AirportDetailPanel from '../components/airports/AirportDetailPanel';
import AirportTrendPanel from '../components/airports/AirportTrendPanel';
import BrandLogos from '../components/BrandLogos';
import { airportRiskProfiles, defaultAirportId } from '../data/mockAirportRiskData';

type AirportRiskPageProps = {
  onLogout: () => void;
};

function AirportRiskPage({ onLogout }: AirportRiskPageProps) {
  const [selectedAirportId, setSelectedAirportId] = useState(defaultAirportId);

  const selectedAirport = useMemo(
    () => airportRiskProfiles.find((airport) => airport.id === selectedAirportId) ?? airportRiskProfiles[0],
    [selectedAirportId],
  );

  return (
    <div className="min-h-screen px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <header className="glass-nav mx-auto flex max-w-[1680px] flex-col gap-3 px-4 py-3 sm:px-5 md:flex-row md:items-center md:justify-between">
        <BrandLogos />

        <div className="text-xl font-bold leading-tight text-foreground sm:text-2xl lg:text-3xl">机场月平均风扰分析</div>

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

      <main className="mx-auto mt-6 max-w-[1680px]">
        <section className="grid items-start gap-5 xl:grid-cols-[minmax(280px,0.25fr)_minmax(0,0.75fr)] 2xl:grid-cols-[minmax(300px,0.23fr)_minmax(0,0.77fr)]">
          <AirportDetailPanel
            airports={airportRiskProfiles}
            airport={selectedAirport}
            selectedAirportId={selectedAirportId}
            onSelect={setSelectedAirportId}
          />
          <AirportMapCard airports={airportRiskProfiles} selectedAirportId={selectedAirportId} onSelect={setSelectedAirportId} />
        </section>

        <section className="mt-6 space-y-6">
          <AirportTrendPanel airports={airportRiskProfiles} />
        </section>

        <section className="mt-6 rounded-[28px] border border-amber-300/70 bg-amber-50/90 px-5 py-5 shadow-sm">
          <p className="text-sm leading-7 text-slate-700 sm:text-[15px]">
            本页面为科研成果演示Demo
          </p>
        </section>
      </main>
    </div>
  );
}

export default AirportRiskPage;

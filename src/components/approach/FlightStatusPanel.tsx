import type { ReactNode } from 'react';
import { Activity, Gauge, Navigation, Plane, Wind } from 'lucide-react';
import type { ApproachPoint } from '../../data/mockApproachData';
import { riskLevelMeta } from '../../utils/riskLevel';

type FlightStatusPanelProps = {
  point: ApproachPoint;
  fallbackPoint: ApproachPoint;
  flight: string;
  stage: string;
};

function FlightStatusPanel({ point, fallbackPoint, flight, stage }: FlightStatusPanelProps) {
  const displayPoint = point ?? fallbackPoint;
  const tone = riskLevelMeta[displayPoint.riskLevel];

  return (
    <aside className="surface-card flex h-full flex-col p-5 sm:p-6">
      <div className="section-kicker bg-white/70">状态面板</div>

      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">模拟航班状态</h2>
          <div className="mt-1 text-sm text-muted-foreground">进近过程实时摘要</div>
        </div>
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Plane size={20} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MetricTile label="航班" value={flight} icon={<Plane size={15} />} />
        <MetricTile label="阶段" value={stage} icon={<Activity size={15} />} />
        <MetricTile label="高度" value={`${displayPoint.altitude} ft`} icon={<Gauge size={15} />} />
        <MetricTile label="风扰指数" value={`${displayPoint.turbulenceIndex}`} icon={<Activity size={15} />} prominent />
      </div>

      <div className="mt-4 rounded-[22px] border border-border/70 bg-white/85 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">风险等级</div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.pillClass}`}>{displayPoint.riskLevel}</span>
        </div>
        <div className="mt-3 h-2.5 rounded-full bg-[#eee3d4]">
          <div className={`h-2.5 rounded-full ${tone.barClass}`} style={{ width: `${displayPoint.turbulenceIndex}%` }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatusTile icon={<Wind size={15} className="text-accent" />} label="风速" value={`${displayPoint.windSpeed} kt`} />
        <StatusTile icon={<Navigation size={15} className="text-accent" />} label="风向" value={`${displayPoint.windDirection}°`} />
      </div>

      <div className="mt-3 rounded-[22px] border border-border/70 bg-white/85 p-3.5">
        <div className="text-xs text-muted-foreground">主要扰动来源</div>
        <div className="mt-1.5 text-sm font-semibold text-foreground">{displayPoint.factor}</div>
      </div>
    </aside>
  );
}

function MetricTile({
  label,
  value,
  icon,
  prominent = false,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  prominent?: boolean;
}) {
  return (
    <div className={`rounded-[18px] border p-3.5 ${prominent ? 'border-accent/25 bg-accent/10' : 'border-border/70 bg-white/85'}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-accent">{icon}</span>
        {label}
      </div>
      <div className={`mt-2 font-semibold leading-tight ${prominent ? 'text-2xl text-accent' : 'text-sm text-foreground sm:text-base'}`}>{value}</div>
    </div>
  );
}

function StatusTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-border/70 bg-white/85 px-3.5 py-3">
      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-foreground sm:text-base">{value}</div>
    </div>
  );
}

export default FlightStatusPanel;

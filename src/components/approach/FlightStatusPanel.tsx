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
    <aside className="surface-card p-5 sm:p-6">
      <div className="section-kicker bg-white/70">当前状态面板</div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">模拟航班状态</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">动画播放过程中，状态面板会随当前扫描点同步更新。</p>
        </div>
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Plane size={22} />
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <MetricTile label="模拟航班" value={flight} icon={<Plane size={16} />} />
        <MetricTile label="飞行阶段" value={stage} icon={<Activity size={16} />} />
        <MetricTile label="当前高度" value={`${displayPoint.altitude} ft`} icon={<Gauge size={16} />} />
        <MetricTile label="当前风扰指数" value={`${displayPoint.turbulenceIndex}`} icon={<Activity size={16} />} prominent />
      </div>

      <div className="mt-5 rounded-[24px] border border-border/70 bg-white/80 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">当前风险等级</div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.pillClass}`}>{displayPoint.riskLevel}</span>
        </div>
        <div className="mt-4 h-2.5 rounded-full bg-[#eee3d4]">
          <div className={`h-2.5 rounded-full ${tone.barClass}`} style={{ width: `${displayPoint.turbulenceIndex}%` }} />
        </div>
      </div>

      <div className="mt-5 space-y-3 rounded-[24px] border border-border/70 bg-white/80 p-4">
        <StatusRow icon={<Wind size={16} className="text-accent" />} label="当前风速" value={`${displayPoint.windSpeed} kt`} />
        <StatusRow icon={<Navigation size={16} className="text-accent" />} label="当前风向" value={`${displayPoint.windDirection}°`} />
        <StatusRow icon={<Activity size={16} className="text-accent-secondary" />} label="主要扰动来源" value={displayPoint.factor} />
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
    <div className={`rounded-[22px] border p-4 ${prominent ? 'border-accent/20 bg-accent/10' : 'border-border/70 bg-white/80'}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-accent">{icon}</span>
        {label}
      </div>
      <div className={`mt-3 font-semibold ${prominent ? 'text-4xl text-accent' : 'text-lg text-foreground'}`}>{value}</div>
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-background/90 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="max-w-[11rem] text-right text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

export default FlightStatusPanel;

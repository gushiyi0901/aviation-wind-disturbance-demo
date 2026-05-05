import type { AirportRiskProfile } from '../../data/mockAirportRiskData';
import { airportRiskMeta } from '../../utils/airportRiskMeta';

function AirportLocalRiskPanel({ airport }: { airport: AirportRiskProfile }) {
  const tone = airportRiskMeta[airport.riskLevel];
  const directions = ['北', '东北', '东南', '南', '西南', '西北'];

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{airport.name}</h2>
          <div className="mt-2 inline-flex items-center rounded-full bg-white/70 px-3 py-1.5 text-sm text-muted-foreground">{airport.type}</div>
        </div>
        <div className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${tone.pillClass}`}>指数 {airport.currentIndex}</div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[26px] border border-border/75 bg-white/85 p-4">
          <div className="flex items-center justify-between text-sm font-semibold text-foreground">
            <span>跑道与进近示意</span>
            <span className="text-xs text-muted-foreground">跑道 {airport.runwayHeading}</span>
          </div>

          <div className="mt-4 rounded-[24px] bg-[linear-gradient(180deg,#f8f2e8,#f3eadb)] p-4 shadow-inner">
            <svg viewBox="0 0 320 190" className="h-48 w-full">
              <defs>
                <linearGradient id="runwaySurface" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#d9d0c3" />
                  <stop offset="100%" stopColor="#bfb3a1" />
                </linearGradient>
              </defs>

              <ellipse cx="246" cy="104" rx="48" ry="22" fill={tone.glowColor} />
              <rect x="46" y="74" width="216" height="42" rx="18" fill="url(#runwaySurface)" />
              <rect x="67" y="92" width="174" height="4" rx="2" fill="#fbfaf6" />
              <rect x="208" y="86" width="72" height="18" rx="9" fill={tone.glowColor} />
              <text x="214" y="82" fontSize="12" fill="#6d756e">
                风扰热点
              </text>

              <path d="M88 144 C120 128, 152 104, 205 82" fill="none" stroke={tone.trendColor} strokeWidth="5" strokeLinecap="round" />
              <polygon points="205,82 193,81 201,92" fill={tone.trendColor} />
              <text x="86" y="161" fontSize="12" fill="#6d756e">
                进近方向
              </text>

              <path d="M235 34 C214 48, 196 63, 176 87" fill="none" stroke="#5c7c6c" strokeWidth="4.5" strokeLinecap="round" />
              <polygon points="176,87 182,78 188,88" fill="#5c7c6c" />
              <text x="208" y="28" fontSize="12" fill="#6d756e">
                {airport.mainWindDirection} {airport.windSpeed} kt
              </text>
            </svg>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <TagItem label="主导风向" value={airport.mainWindDirection} />
            <TagItem label="进近方向" value={airport.approachDirection} />
            <TagItem label="风险热点" value={airport.hotspotLabel} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[26px] border border-border/75 bg-white/85 p-4">
            <div className="text-sm font-semibold text-foreground">风向分布</div>
            <div className="mt-4 rounded-[22px] bg-[#f8f2e8] p-4">
              <svg viewBox="0 0 160 160" className="mx-auto h-36 w-36">
                <circle cx="80" cy="80" r="12" fill="#f3eadc" />
                {airport.windRose.map((value, index) => {
                  const angle = (index / airport.windRose.length) * Math.PI * 2 - Math.PI / 2;
                  const length = 26 + value * 1.05;
                  const x2 = 80 + Math.cos(angle) * length;
                  const y2 = 80 + Math.sin(angle) * length;
                  return (
                    <g key={directions[index]}>
                      <line x1="80" y1="80" x2={x2} y2={y2} stroke={tone.trendColor} strokeWidth="7" strokeLinecap="round" opacity={0.35 + value / 52} />
                      <text x={80 + Math.cos(angle) * 64} y={84 + Math.sin(angle) * 64} textAnchor="middle" fontSize="11" fill="#6d756e">
                        {directions[index]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="rounded-[26px] border border-border/75 bg-white/85 p-4">
            <div className="text-sm font-semibold text-foreground">关键摘要</div>
            <div className="mt-4 space-y-3">
              <SummaryRow label="主要扰动来源" value={airport.mainFactors.join(' / ')} />
              <SummaryRow label="高风险时段" value={airport.mainRiskPeriod} />
              <SummaryRow label="典型场景" value={airport.typicalScenario} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TagItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-background/90 px-3 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-background/90 px-3.5 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-sm leading-6 text-foreground">{value}</div>
    </div>
  );
}

export default AirportLocalRiskPanel;

import type { AirportRiskProfile } from '../../data/mockAirportRiskData';
import { airportRiskMeta } from '../../utils/airportRiskMeta';

const directionLabels = ['北', '东北', '东南', '南', '西南', '西北'] as const;

function AirportLocalRiskPanel({ airport }: { airport: AirportRiskProfile }) {
  const tone = airportRiskMeta[airport.riskLevel];
  const windSummary = buildWindSummary(airport.windRose);

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{airport.name}</h2>
          <div className="mt-2 inline-flex items-center rounded-full bg-white/70 px-3 py-1.5 text-sm text-muted-foreground">{airport.type}</div>
        </div>
        <div className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${tone.pillClass}`}>指数 {airport.currentIndex}</div>
      </div>

      <div className="mt-6 grid items-stretch gap-4 xl:grid-cols-2">
        <div className="flex h-full flex-col rounded-[26px] border border-border/75 bg-white/85 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">跑道与风场示意</div>
              <div className="mt-1 text-xs text-muted-foreground">示意主导风、进近路径与热点相对位置</div>
            </div>
            <span className="rounded-full bg-background/90 px-3 py-1 text-xs text-muted-foreground">跑道 {airport.runwayHeading}</span>
          </div>

          <div className="mt-4 rounded-[24px] bg-[linear-gradient(180deg,#f8f2e8,#f3eadb)] p-4 shadow-inner">
            <svg viewBox="0 0 360 220" className="h-52 w-full">
              <defs>
                <linearGradient id="runwaySurface" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#d9d0c3" />
                  <stop offset="100%" stopColor="#bfb3a1" />
                </linearGradient>
              </defs>

              <rect x="48" y="88" width="236" height="46" rx="22" fill="url(#runwaySurface)" />
              <rect x="74" y="108" width="184" height="5" rx="2.5" fill="#fbfaf6" />

              <path
                d="M252 92 C278 94, 300 106, 310 126 C298 140, 278 148, 252 150"
                fill="none"
                stroke={tone.trendColor}
                strokeWidth="3.5"
                strokeDasharray="5 6"
                strokeLinecap="round"
              />
              <text x="258" y="82" fontSize="12" fill="#6d756e">
                风扰热点
              </text>

              <path d="M86 166 C122 152, 168 123, 228 95" fill="none" stroke={tone.trendColor} strokeWidth="5" strokeLinecap="round" />
              <polygon points="228,95 215,95 222,105" fill={tone.trendColor} />
              <text x="84" y="186" fontSize="12" fill="#6d756e">
                进近方向
              </text>

              <path d="M290 42 C260 52, 226 72, 196 104" fill="none" stroke="#5c7c6c" strokeWidth="4.5" strokeLinecap="round" />
              <polygon points="196,104 202,94 209,103" fill="#5c7c6c" />
              <text x="238" y="34" fontSize="12" fill="#6d756e">
                {airport.mainWindDirection} {airport.windSpeed} kt
              </text>

              <line x1="304" y1="168" x2="332" y2="168" stroke="#cbbda8" strokeWidth="2" />
              <line x1="318" y1="154" x2="318" y2="182" stroke="#cbbda8" strokeWidth="2" />
              <text x="318" y="146" textAnchor="middle" fontSize="11" fill="#6d756e">
                北
              </text>
            </svg>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <TagItem label="主导风向" value={airport.mainWindDirection} />
            <TagItem label="进近方向" value={airport.approachDirection} />
            <TagItem label="风险热点" value={airport.hotspotLabel} />
          </div>
        </div>

        <div className="flex h-full flex-col gap-4">
          <div className="rounded-[26px] border border-border/75 bg-white/85 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-foreground">风向分布</div>
              <span className="rounded-full bg-background/90 px-3 py-1 text-xs text-muted-foreground">主峰 {windSummary[0]?.label}</span>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[152px_minmax(0,1fr)] lg:items-center">
              <div className="rounded-[22px] bg-[#f8f2e8] p-3">
                <svg viewBox="0 0 160 160" className="mx-auto h-36 w-36">
                  <circle cx="80" cy="80" r="56" fill="none" stroke="#e2d6c5" strokeWidth="1.5" strokeDasharray="4 5" />
                  <circle cx="80" cy="80" r="38" fill="none" stroke="#eadfce" strokeWidth="1.5" />
                  <circle cx="80" cy="80" r="12" fill="#f3eadc" />
                  {airport.windRose.map((value, index) => {
                    const angle = (index / airport.windRose.length) * Math.PI * 2 - Math.PI / 2;
                    const length = 18 + value * 0.72;
                    const x2 = 80 + Math.cos(angle) * length;
                    const y2 = 80 + Math.sin(angle) * length;
                    return (
                      <g key={directionLabels[index]}>
                        <line x1="80" y1="80" x2={x2} y2={y2} stroke={tone.trendColor} strokeWidth="6" strokeLinecap="round" opacity={0.38 + value / 70} />
                        <text x={80 + Math.cos(angle) * 69} y={84 + Math.sin(angle) * 69} textAnchor="middle" fontSize="11" fill="#6d756e">
                          {directionLabels[index]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="space-y-3">
                {windSummary.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="mt-1.5 h-2.5 rounded-full bg-[#ebe1d3]">
                      <div
                        className="h-2.5 rounded-full"
                        style={{
                          width: `${28 + item.ratio * 58}%`,
                          background: `linear-gradient(90deg, ${tone.trendColor}99, ${tone.trendColor})`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 rounded-[26px] border border-border/75 bg-white/85 p-4">
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

function buildWindSummary(windRose: number[]) {
  const maxValue = Math.max(...windRose, 1);

  return windRose
    .map((value, index) => ({
      label: directionLabels[index],
      value,
      ratio: value / maxValue,
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 4);
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

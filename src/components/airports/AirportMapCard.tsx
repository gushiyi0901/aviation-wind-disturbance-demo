import { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { AirportRiskProfile } from '../../data/mockAirportRiskData';
import { airportRiskMeta } from '../../utils/airportRiskMeta';

type AirportMapCardProps = {
  airports: AirportRiskProfile[];
  selectedAirportId: string;
  onSelect: (id: string) => void;
};

function AirportMapCard({ airports, selectedAirportId, onSelect }: AirportMapCardProps) {
  const [hoveredAirportId, setHoveredAirportId] = useState<string | null>(null);
  const hoveredAirport = airports.find((airport) => airport.id === hoveredAirportId) ?? null;

  return (
    <section className="surface-card overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="section-kicker bg-white/70">空间分布图</div>
          <h2 className="mt-4 text-2xl font-bold text-foreground">国内机场动态地图</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
          <LegendItem label="低风险" color="#5c7c6c" />
          <LegendItem label="中风险" color="#b79657" />
          <LegendItem label="较高风险" color="#b56b4a" />
          <LegendItem label="高风险" color="#8d4a47" />
        </div>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-[30px] border border-border/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(248,242,232,0.92))] p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(92,124,108,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(92,124,108,0.06)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="pointer-events-none absolute inset-x-10 top-8 h-24 rounded-full bg-[radial-gradient(circle,rgba(92,124,108,0.12),transparent_70%)] blur-2xl" />

        <div className="relative aspect-[4/3] min-h-[430px]">
          <svg viewBox="0 0 1000 760" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="chinaFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#efe5d6" />
                <stop offset="100%" stopColor="#dcc8ae" />
              </linearGradient>
            </defs>
            <path
              d="M148 204 C194 128, 323 88, 413 126 C476 96, 592 102, 686 166 C772 164, 858 222, 874 312 C924 378, 886 480, 814 525 C780 598, 705 654, 610 654 C534 692, 415 690, 334 639 C250 635, 172 582, 138 511 C89 454, 86 349, 148 204 Z"
              fill="url(#chinaFill)"
              stroke="#c2ad90"
              strokeWidth="10"
              strokeLinejoin="round"
            />
            <path
              d="M228 251 C314 205, 392 185, 472 194 M297 358 C423 322, 554 326, 676 370 M248 485 C356 535, 507 548, 640 510 M629 250 C712 267, 777 314, 805 390"
              fill="none"
              stroke="#ceb79c"
              strokeDasharray="10 12"
              strokeWidth="5"
              opacity="0.75"
            />
            <path
              d="M724 222 C787 198, 848 188, 886 216 C846 243, 795 245, 737 233"
              fill="#e9dcc8"
              stroke="#cbb598"
              strokeWidth="8"
              strokeLinejoin="round"
            />
          </svg>

          {airports.map((airport) => {
            const tone = airportRiskMeta[airport.riskLevel];
            const isSelected = airport.id === selectedAirportId;
            const size = airport.riskLevel === '高' ? 16 : airport.riskLevel === '较高' ? 14 : airport.riskLevel === '中' ? 12 : 10;
            const glowSize = isSelected ? size + 18 : size + 10;
            const labelTransform =
              airport.labelPlacement === 'left'
                ? 'translate(-100%, -50%)'
                : airport.labelPlacement === 'top'
                  ? 'translate(-50%, -100%)'
                  : airport.labelPlacement === 'bottom'
                    ? 'translate(-50%, 0)'
                    : 'translate(0, -50%)';

            return (
              <div key={airport.id} className="absolute z-[2]" style={{ left: `${airport.x}%`, top: `${airport.y}%` }}>
                <button
                  type="button"
                  className="absolute left-0 top-0 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none"
                  onMouseEnter={() => setHoveredAirportId(airport.id)}
                  onMouseLeave={() => setHoveredAirportId((current) => (current === airport.id ? null : current))}
                  onFocus={() => setHoveredAirportId(airport.id)}
                  onBlur={() => setHoveredAirportId((current) => (current === airport.id ? null : current))}
                  onClick={() => onSelect(airport.id)}
                  aria-label={`${airport.name}，当前指数 ${airport.currentIndex}`}
                >
                  <span
                    className="absolute left-1/2 top-1/2 rounded-full transition duration-200"
                    style={{
                      width: glowSize,
                      height: glowSize,
                      backgroundColor: tone.glowColor,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                  <span
                    className={`absolute left-1/2 top-1/2 rounded-full border-2 border-white shadow-sm transition duration-200 ${
                      isSelected ? 'scale-110 ring-4 ring-white/65' : 'group-hover:scale-110'
                    }`}
                    style={{
                      width: size,
                      height: size,
                      backgroundColor: tone.dotColor,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </button>

                <span
                  className={`pointer-events-none absolute z-[3] whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm ${
                    isSelected ? 'border-white/90 bg-white text-foreground' : 'border-white/70 bg-white/88 text-muted-foreground'
                  }`}
                  style={{
                    left: airport.labelDx,
                    top: airport.labelDy,
                    transform: labelTransform,
                  }}
                >
                  {`${airport.city}${airport.shortName}`}
                </span>
              </div>
            );
          })}

          {hoveredAirport && (
            <div className="pointer-events-none absolute bottom-4 left-4 z-[4] rounded-[22px] border border-white/70 bg-white/90 px-4 py-3 shadow-soft backdrop-blur-xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-accent-secondary">
                <MapPin size={14} />
                {hoveredAirport.name}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                当前指数 {hoveredAirport.currentIndex} · 风险等级 {hoveredAirport.riskLevel}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function LegendItem({ label, color }: { label: string; color: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}

export default AirportMapCard;

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { chinaOutline } from '../../data/chinaOutline';
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
  const projectedPolygons = projectChinaOutline(chinaOutline);
  const projectedAirports = airports.map((airport) => ({
    ...airport,
    projected: projectPoint(airport.longitude, airport.latitude),
  }));

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
            {projectedPolygons.map((path, index) => (
              <path key={index} d={path} fill="url(#chinaFill)" stroke="#c2ad90" strokeWidth={index === 0 ? 5.5 : 4.2} strokeLinejoin="round" />
            ))}
          </svg>

          {projectedAirports.map((airport) => {
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
              <div key={airport.id} className="absolute z-[2]" style={{ left: `${airport.projected.xPercent}%`, top: `${airport.projected.yPercent}%` }}>
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

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 760;
const MAP_PADDING = 54;
const GEO_BOUNDS = {
  minLongitude: 73.675379,
  maxLongitude: 135.026311,
  minLatitude: 18.197701,
  maxLatitude: 53.458804,
};

function projectChinaOutline(outline: typeof chinaOutline) {
  return outline.map((polygon) =>
    polygon
      .map((ring) =>
        ring
          .map(([longitude, latitude], pointIndex) => {
            const point = projectPoint(longitude, latitude);
            return `${pointIndex === 0 ? 'M' : 'L'} ${point.svgX.toFixed(2)} ${point.svgY.toFixed(2)}`;
          })
          .join(' ') + ' Z',
      )
      .join(' '),
  );
}

function projectPoint(longitude: number, latitude: number) {
  const usableWidth = VIEWBOX_WIDTH - MAP_PADDING * 2;
  const usableHeight = VIEWBOX_HEIGHT - MAP_PADDING * 2;

  const xRatio = (longitude - GEO_BOUNDS.minLongitude) / (GEO_BOUNDS.maxLongitude - GEO_BOUNDS.minLongitude);
  const yRatio = (GEO_BOUNDS.maxLatitude - latitude) / (GEO_BOUNDS.maxLatitude - GEO_BOUNDS.minLatitude);

  const svgX = MAP_PADDING + xRatio * usableWidth;
  const svgY = MAP_PADDING + yRatio * usableHeight;

  return {
    svgX,
    svgY,
    xPercent: (svgX / VIEWBOX_WIDTH) * 100,
    yPercent: (svgY / VIEWBOX_HEIGHT) * 100,
  };
}

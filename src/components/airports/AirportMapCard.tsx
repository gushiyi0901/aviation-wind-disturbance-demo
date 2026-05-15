import { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { AirportLabelPlacement, AirportRiskProfile } from '../../data/mockAirportRiskData';
import { chinaMapViewBox, dashLinePaths, insetIslandPaths, projectAirportToChinaMap, provincePaths } from '../../utils/chinaTopoMap';

type AirportMapCardProps = {
  airports: AirportRiskProfile[];
  selectedAirportId: string;
  onSelect: (id: string) => void;
};

function AirportMapCard({ airports, selectedAirportId, onSelect }: AirportMapCardProps) {
  const [hoveredAirportId, setHoveredAirportId] = useState<string | null>(null);
  const hoveredAirport = airports.find((airport) => airport.id === hoveredAirportId) ?? null;

  return (
    <section className="surface-card flex h-full min-w-0 flex-col overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="section-kicker bg-white/70">空间分布图</div>
          <h2 className="mt-4 text-2xl font-bold text-foreground">国内机场动态地图</h2>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
          <LegendItem label="低风险" color={mapRiskMeta.低.dotColor} />
          <LegendItem label="中风险" color={mapRiskMeta.中.dotColor} />
          <LegendItem label="较高风险" color={mapRiskMeta.较高.dotColor} />
          <LegendItem label="高风险" color={mapRiskMeta.高.dotColor} />
        </div>
      </div>

      <div className="relative mt-6 flex-1 overflow-hidden rounded-[30px] border border-border/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,244,238,0.98))] p-3 sm:p-4">
        <div className="relative h-full min-h-[500px] w-full lg:min-h-[620px]">
          <svg
            viewBox={`0 0 ${chinaMapViewBox.width} ${chinaMapViewBox.height}`}
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            aria-label="中国机场风扰风险矢量地图"
          >
            <rect width={chinaMapViewBox.width} height={chinaMapViewBox.height} fill="#fbfaf6" />

            {provincePaths.map((feature) => (
              <path key={feature.key} d={feature.path} fill="#f3eee4" stroke="#8e948b" strokeWidth={1.8} strokeLinejoin="round" />
            ))}

            {insetIslandPaths.map((feature) => (
              <path key={feature.key} d={feature.path} fill="#f3eee4" stroke="#8e948b" strokeWidth={1.4} strokeLinejoin="round" />
            ))}

            {dashLinePaths.map((feature) => (
              <path
                key={feature.key}
                d={feature.path}
                fill="none"
                stroke="#5e7a6a"
                strokeWidth={1.6}
                strokeDasharray="10 8"
                strokeLinecap="round"
              />
            ))}

            {airports.map((airport) => {
              const point = projectAirportToChinaMap(airport.longitude, airport.latitude);
              const tone = mapRiskMeta[airport.riskLevel];
              const isSelected = airport.id === selectedAirportId;
              const size = airport.riskLevel === '高' ? 16 : airport.riskLevel === '较高' ? 14 : airport.riskLevel === '中' ? 12 : 10;
              const glowRadius = (isSelected ? size + 18 : size + 10) / 2;
              const label = `${airport.city}${airport.shortName}`;
              const placement = resolveLabelPlacement(airport.labelPlacement, point.x);

              return (
                <g
                  key={airport.id}
                  transform={`translate(${point.x} ${point.y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredAirportId(airport.id)}
                  onMouseLeave={() => setHoveredAirportId((current) => (current === airport.id ? null : current))}
                  onFocus={() => setHoveredAirportId(airport.id)}
                  onBlur={() => setHoveredAirportId((current) => (current === airport.id ? null : current))}
                  onClick={() => onSelect(airport.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect(airport.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${airport.name}，当前指数 ${airport.currentIndex}`}
                >
                  <circle r={glowRadius} fill={tone.glowColor} />
                  {isSelected && <circle r={size / 2 + 4} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={4} />}
                  <circle r={size / 2} fill={tone.dotColor} stroke="#ffffff" strokeWidth={2.5} />
                  <circle r={18} fill="transparent" />
                  <AirportLabel airport={airport} label={label} placement={placement} />
                </g>
              );
            })}
          </svg>

          {hoveredAirport && (
            <div className="pointer-events-none absolute left-4 top-4 z-[4] max-w-[240px] rounded-[22px] border border-white/70 bg-white/90 px-4 py-3 shadow-soft backdrop-blur-xl">
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

function resolveLabelPlacement(preferred: AirportLabelPlacement, pointX: number): AirportLabelPlacement {
  if (pointX > chinaMapViewBox.width - 126) {
    return 'left';
  }

  if (pointX < 118) {
    return 'right';
  }

  return preferred;
}

function AirportLabel({
  airport,
  label,
  placement,
}: {
  airport: AirportRiskProfile;
  label: string;
  placement: AirportLabelPlacement;
}) {
  const commonProps = {
    fill: '#000000',
    fontSize: 14,
    fontWeight: 700,
    paintOrder: 'stroke' as const,
    stroke: 'rgba(255,255,255,0.94)',
    strokeWidth: 3.2,
    strokeLinejoin: 'round' as const,
  };

  if (placement === 'left') {
    return (
      <text x={airport.labelDx} y={airport.labelDy} textAnchor="end" dominantBaseline="middle" {...commonProps}>
        {label}
      </text>
    );
  }

  if (placement === 'top') {
    return (
      <text x={airport.labelDx} y={airport.labelDy} textAnchor="middle" dominantBaseline="auto" {...commonProps}>
        {label}
      </text>
    );
  }

  if (placement === 'bottom') {
    return (
      <text x={airport.labelDx} y={airport.labelDy + 14} textAnchor="middle" dominantBaseline="hanging" {...commonProps}>
        {label}
      </text>
    );
  }

  return (
    <text x={airport.labelDx} y={airport.labelDy} textAnchor="start" dominantBaseline="middle" {...commonProps}>
      {label}
    </text>
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

const mapRiskMeta: Record<string, { dotColor: string; glowColor: string }> = {
  低: {
    dotColor: '#6f8d7d',
    glowColor: 'rgba(111,141,125,0.18)',
  },
  中: {
    dotColor: '#4e6c5c',
    glowColor: 'rgba(78,108,92,0.2)',
  },
  较高: {
    dotColor: '#2f493b',
    glowColor: 'rgba(47,73,59,0.24)',
  },
  高: {
    dotColor: '#172a22',
    glowColor: 'rgba(23,42,34,0.28)',
  },
};

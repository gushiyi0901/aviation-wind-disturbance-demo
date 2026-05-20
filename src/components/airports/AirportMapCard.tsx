import { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { AirportLabelPlacement, AirportRiskProfile } from '../../data/mockAirportRiskData';
import {
  chinaMapViewBox,
  dashLinePaths,
  insetIslandPaths,
  projectAirportToChinaMap,
  provincePaths,
  southChinaSeaInsetFrame,
} from '../../utils/chinaTopoMap';

type AirportMapCardProps = {
  airports: AirportRiskProfile[];
  selectedAirportId: string;
  onSelect: (id: string) => void;
};

type ColorStop = {
  stop: number;
  color: string;
};

const riskColorStops: ColorStop[] = [
  { stop: 0, color: '#1f78b4' },
  { stop: 0.25, color: '#21b6c7' },
  { stop: 0.5, color: '#f2c94c' },
  { stop: 0.72, color: '#f2994a' },
  { stop: 0.9, color: '#d84a4a' },
  { stop: 1, color: '#8e2a8a' },
];

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

        <div className="w-full max-w-[360px] shrink-0 rounded-[22px] border border-border/70 bg-white/75 px-4 py-3">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>低风险</span>
            <span>Risk 0-1</span>
            <span>高风险</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-[linear-gradient(90deg,#1f78b4_0%,#21b6c7_25%,#f2c94c_50%,#f2994a_72%,#d84a4a_90%,#8e2a8a_100%)]" />
          <div className="mt-2 flex justify-between text-[11px] font-semibold text-muted-foreground">
            <span>0</span>
            <span>0.5</span>
            <span>1</span>
          </div>
        </div>
      </div>

      <div className="relative mt-6 flex-1 overflow-hidden rounded-[30px] border border-border/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,244,238,0.98))] p-3 sm:p-5">
        <div className="relative mx-auto aspect-[25/19] min-h-[520px] w-full max-w-[1120px] lg:min-h-[660px]">
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

            {southChinaSeaInsetFrame && (
              <rect
                x={southChinaSeaInsetFrame.x}
                y={southChinaSeaInsetFrame.y}
                width={southChinaSeaInsetFrame.width}
                height={southChinaSeaInsetFrame.height}
                fill="rgba(255,255,255,0.65)"
                stroke="#8e948b"
                strokeWidth={1.8}
              />
            )}

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
              const riskValue = normalizeRisk(airport.currentIndex);
              const color = riskColor(riskValue);
              const glowColor = colorWithAlpha(color, 0.24);
              const isSelected = airport.id === selectedAirportId;
              const size = 10 + riskValue * 8;
              const glowRadius = (isSelected ? size + 20 : size + 12) / 2;
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
                  <circle r={glowRadius} fill={glowColor} />
                  {isSelected && <circle r={size / 2 + 5} fill="none" stroke="#2f493b" strokeWidth={3.5} />}
                  {isSelected && <circle r={size / 2 + 9} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={3} />}
                  <circle r={size / 2} fill={color} stroke="#ffffff" strokeWidth={2.5} />
                  <circle r={18} fill="transparent" />
                  <AirportLabel airport={airport} label={label} placement={placement} />
                </g>
              );
            })}
          </svg>

          {hoveredAirport && (
            <div className="pointer-events-none absolute left-4 top-4 z-[4] max-w-[260px] rounded-[22px] border border-white/70 bg-white/92 px-4 py-3 shadow-soft backdrop-blur-xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-accent-secondary">
                <MapPin size={14} />
                {hoveredAirport.name}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                当前指数 {hoveredAirport.currentIndex} · 风险映射 {normalizeRisk(hoveredAirport.currentIndex).toFixed(2)}
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
    fontSize: 13,
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

function normalizeRisk(index: number) {
  return Math.min(1, Math.max(0, index / 100));
}

function riskColor(value: number) {
  const normalized = Math.min(1, Math.max(0, value));
  const upperIndex = riskColorStops.findIndex((item) => item.stop >= normalized);

  if (upperIndex <= 0) {
    return riskColorStops[0].color;
  }

  const lower = riskColorStops[upperIndex - 1];
  const upper = riskColorStops[upperIndex];
  const localT = (normalized - lower.stop) / Math.max(upper.stop - lower.stop, 0.001);
  return interpolateHex(lower.color, upper.color, localT);
}

function interpolateHex(start: string, end: string, t: number) {
  const from = hexToRgb(start);
  const to = hexToRgb(end);
  const mixed = from.map((channel, index) => Math.round(channel + (to[index] - channel) * t));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  return [0, 2, 4].map((offset) => Number.parseInt(clean.slice(offset, offset + 2), 16));
}

function colorWithAlpha(hex: string, alpha: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default AirportMapCard;

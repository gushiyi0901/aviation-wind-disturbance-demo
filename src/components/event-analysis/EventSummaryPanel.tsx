import { useMemo, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { EventAnalysisAirport } from '../../data/mockEventAnalysisData';
import { eventAnalysisMonthNumbers, eventAnalysisYears, eventAttributionFeatures, eventQuadrantMeta } from '../../data/mockEventAnalysisData';
import { formatWindDisturbanceIndex } from '../../utils/indexScale';

type EventSummaryPanelProps = {
  airports: EventAnalysisAirport[];
  airport: EventAnalysisAirport;
  selectedAirportId: string;
  selectedYear: string;
  selectedMonth: string;
  onSelect: (id: string) => void;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
};

function EventSummaryPanel({
  airports,
  airport,
  selectedAirportId,
  selectedYear,
  selectedMonth,
  onSelect,
  onYearChange,
  onMonthChange,
}: EventSummaryPanelProps) {
  const [hoveredFeatureKey, setHoveredFeatureKey] = useState<string | null>(null);
  const [isAttributionHelpOpen, setIsAttributionHelpOpen] = useState(false);
  const quadrant = eventQuadrantMeta[airport.quadrant];
  const displayPeriod = `${selectedYear}年${Number(selectedMonth)}月`;
  const contributions = useMemo(
    () =>
      eventAttributionFeatures
        .map((feature) => ({
          ...feature,
          value: airport.attribution[feature.key],
        }))
        .sort((left, right) => right.value - left.value),
    [airport.attribution],
  );
  const pieSegments = useMemo(() => buildPieSegments(contributions), [contributions]);
  const dominantFeature = contributions[0];
  const hoveredFeature = contributions.find((feature) => feature.key === hoveredFeatureKey) ?? dominantFeature;
  const primaryAirportOrder = ['shanghai-hongqiao', 'beijing-daxing', 'chengdu-tianfu'];
  const orderedAirports = [...airports].sort((left, right) => {
    const leftIndex = primaryAirportOrder.indexOf(left.id);
    const rightIndex = primaryAirportOrder.indexOf(right.id);

    if (leftIndex === -1 && rightIndex === -1) {
      return 0;
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });

  return (
    <aside className={`surface-card relative h-full p-5 sm:p-6 ${isAttributionHelpOpen ? 'z-[120]' : 'z-0'}`}>
      <div className="section-kicker bg-white/70">机场摘要</div>

      <div className="mt-5 grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <label className="block h-4 text-xs font-semibold leading-4 tracking-[0.12em] text-muted-foreground">机场选择</label>
          <div className="relative mt-2">
            <select
              value={selectedAirportId}
              onChange={(event) => onSelect(event.target.value)}
              className="h-12 w-full appearance-none rounded-2xl border border-border/80 bg-white/85 px-4 pr-11 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-accent/30"
            >
              {orderedAirports.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="min-w-0">
          <div className="h-4 text-xs font-semibold leading-4 tracking-[0.12em] text-muted-foreground">月份选择</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <select
              value={selectedYear}
              onChange={(event) => onYearChange(event.target.value)}
              className="h-12 rounded-2xl border border-border/80 bg-white/85 px-3 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-accent/30"
            >
              {eventAnalysisYears.map((year) => (
                <option key={year} value={year}>
                  {year}年
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(event) => onMonthChange(event.target.value)}
              className="h-12 rounded-2xl border border-border/80 bg-white/85 px-3 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-accent/30"
            >
              {eventAnalysisMonthNumbers.map((month) => (
                <option key={month} value={month}>
                  {Number(month)}月
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{airport.name}</h2>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${quadrant.pillClass}`}>{quadrant.shortLabel}</span>
      </div>

      <div className="mt-5 rounded-[26px] border border-border/75 bg-white/85 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] bg-background/90 px-4 py-3">
            <div className="text-sm text-muted-foreground">平均风扰指数</div>
            <div className="mt-2 text-5xl font-extrabold leading-none text-foreground">{formatWindDisturbanceIndex(airport.averageIndex)}</div>
          </div>
          <div className="rounded-[22px] bg-background/90 px-4 py-3">
            <div className="text-sm text-muted-foreground">降落事件数</div>
            <div className="mt-2 text-5xl font-extrabold leading-none text-foreground">{airport.eventCount}</div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[26px] border border-border/75 bg-white/85 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-foreground">风扰特征贡献排序（SHAP 归因）</h3>
            <div className="relative">
              <button
                type="button"
                aria-label="查看归因说明"
                aria-expanded={isAttributionHelpOpen}
                onClick={() => setIsAttributionHelpOpen((value) => !value)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-accent/25 bg-white text-xs font-bold text-accent shadow-sm transition hover:border-accent/45 hover:bg-accent/10"
              >
                ?
              </button>
              {isAttributionHelpOpen && (
                <div className="absolute right-0 top-8 z-[999] w-[calc(100vw-2.5rem)] rounded-[20px] border border-border/70 bg-white p-5 text-xs leading-6 text-muted-foreground shadow-soft sm:left-full sm:right-auto sm:top-0 sm:ml-3 sm:w-[28rem]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm font-bold text-foreground">SHAP 归因计算流程</div>
                    <button
                      type="button"
                      aria-label="关闭归因说明"
                      onClick={() => setIsAttributionHelpOpen(false)}
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground transition hover:bg-background"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="mt-3">
                    输入来自同一机场、同一月份的进近样本，包含原始风速、风速差分、滑动均值、滑动标准差、风向变化率、风矢量变化强度，以及风向和航向夹角拆出的顺逆风、左右侧风分量。
                  </p>
                  <p className="mt-2">
                    模型先把高度带来的常规操纵差异单独估出来，再从原始操作响应里扣除，得到新操纵响应。
                  </p>
                  <p className="mt-2">
                    SHAP 会逐项比较这些风扰特征对模型输出的贡献。页面里的百分比表示相对贡献大小，数值越高，说明这个特征在本月样本中越常参与解释操作响应的变化。
                  </p>
                  <p className="mt-2">
                    贡献靠前的变量会继续用于 Lasso 和线性模型，让结果保留可追溯的变量含义。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div className="relative mx-auto h-[180px] w-[180px]">
            <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={`${airport.name}${displayPeriod}SHAP归因饼图`}>
              {pieSegments.map((segment) => (
                <path
                  key={segment.key}
                  d={segment.path}
                  fill={segment.color}
                  stroke="#fffaf4"
                  strokeWidth="2.5"
                  className="cursor-pointer transition-opacity"
                  opacity={hoveredFeatureKey && hoveredFeatureKey !== segment.key ? 0.58 : 1}
                  onMouseEnter={() => setHoveredFeatureKey(segment.key)}
                  onMouseLeave={() => setHoveredFeatureKey(null)}
                />
              ))}
              <circle cx="100" cy="100" r="52" fill="#fffaf4" />
              <text x="100" y="97" textAnchor="middle" fontSize="17" fontWeight="800" fill="#2f342f">
                {hoveredFeature.value}%
              </text>
              <text x="100" y="118" textAnchor="middle" fontSize="10" fill="#6d756e">
                SHAP归因
              </text>
            </svg>
          </div>

          <div className="space-y-2">
            {contributions.map((feature, index) => (
              <button
                key={feature.key}
                type="button"
                onMouseEnter={() => setHoveredFeatureKey(feature.key)}
                onMouseLeave={() => setHoveredFeatureKey(null)}
                className="flex w-full items-center gap-2 rounded-[16px] bg-white/82 px-3 py-2 text-left transition hover:bg-white"
              >
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: feature.color }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-foreground">{index + 1}. {feature.label}</span>
                </span>
                <span className="text-sm font-bold text-foreground">{feature.value}%</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

type ContributionPoint = (typeof eventAttributionFeatures)[number] & { value: number };

function buildPieSegments(contributions: ContributionPoint[]) {
  let startAngle = -90;

  return contributions.map((feature) => {
    const angle = (feature.value / 100) * 360;
    const path = describePieSlice(100, 100, 78, startAngle, startAngle + angle);
    startAngle += angle;

    return {
      ...feature,
      path,
    };
  });
}

function describePieSlice(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [`M ${cx} ${cy}`, `L ${start.x} ${start.y}`, `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`, 'Z'].join(' ');
}

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

export default EventSummaryPanel;

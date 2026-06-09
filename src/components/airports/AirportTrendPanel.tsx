import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { Bot } from 'lucide-react';
import {
  airportMonthlyTrendMonths,
  airportTrendComparisonAirportIds,
  airportTrendMonthNumbers,
  airportTrendYears,
  getAirportMonthlyDailyTrend,
  type AirportRiskProfile,
  type AirportTrendMonth,
  type DailyAirportTrendPoint,
} from '../../data/mockAirportRiskData';
import {
  formatWindDisturbanceIndex,
  normalizeWindDisturbanceIndex,
  WIND_DISTURBANCE_INDEX_MAX,
  WIND_DISTURBANCE_INDEX_MIN,
  WIND_DISTURBANCE_INDEX_NORMAL_HIGH,
  WIND_DISTURBANCE_INDEX_NORMAL_LOW,
} from '../../utils/indexScale';

type ChartPoint = DailyAirportTrendPoint & {
  x: number;
  y: number;
  lowerY: number;
  upperY: number;
};

type TrendSeries = {
  airport: AirportRiskProfile;
  color: string;
  fill: string;
  points: ChartPoint[];
  lineD: string;
  bandD: string;
};

type AirportSummary = {
  airport: AirportRiskProfile;
  average: number;
  peak: number;
  peakDay: number;
  range: number;
};

const chart = {
  width: 900,
  height: 420,
  margin: { top: 34, right: 34, bottom: 58, left: 70 },
};

const seriesColors = [
  { color: '#1f5f8b', fill: 'rgba(31,95,139,0.16)' },
  { color: '#b56b4a', fill: 'rgba(181,107,74,0.14)' },
];

function AirportTrendPanel({ airports }: { airports: AirportRiskProfile[] }) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonthNumber, setSelectedMonthNumber] = useState('05');
  const [selectedAirportIds, setSelectedAirportIds] = useState<string[]>(['shanghai-hongqiao']);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const selectedMonth = `${selectedYear}-${selectedMonthNumber}` as AirportTrendMonth;

  const selectableAirports = useMemo(
    () => airportTrendComparisonAirportIds.map((id) => airports.find((airport) => airport.id === id)).filter(Boolean) as AirportRiskProfile[],
    [airports],
  );

  const selectedAirports = useMemo(
    () => selectedAirportIds.map((id) => airports.find((airport) => airport.id === id)).filter(Boolean) as AirportRiskProfile[],
    [airports, selectedAirportIds],
  );

  const selectedMonthLabel = airportMonthlyTrendMonths.find((item) => item.value === selectedMonth)?.label ?? '2026年5月';
  const maxDays = airportMonthlyTrendMonths.find((item) => item.value === selectedMonth)?.days ?? 31;
  const availableYears = airportTrendYears;
  const availableMonths = airportTrendMonthNumbers.map((month) => ({ value: month, label: `${Number(month)}月` }));

  const { series, yTicks, summaries } = useMemo(() => {
    const innerWidth = chart.width - chart.margin.left - chart.margin.right;
    const innerHeight = chart.height - chart.margin.top - chart.margin.bottom;
    const mappedSeries = selectedAirports.map((airport, index) => {
      const dailyValues = getAirportMonthlyDailyTrend(airport.id, selectedMonth);
      const points = dailyValues.map((point) => {
        const x = chart.margin.left + ((point.day - 1) / Math.max(maxDays - 1, 1)) * innerWidth;
        const y = chart.margin.top + (1 - normalizeWindDisturbanceIndex(point.index)) * innerHeight;
        const lowerY = chart.margin.top + (1 - normalizeWindDisturbanceIndex(point.lower)) * innerHeight;
        const upperY = chart.margin.top + (1 - normalizeWindDisturbanceIndex(point.upper)) * innerHeight;

        return { ...point, x, y, lowerY, upperY };
      });
      const lineD = buildLinePath(points, 'y');
      const upperPath = points.map((point, pointIndex) => `${pointIndex === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.upperY.toFixed(2)}`).join(' ');
      const lowerPath = [...points].reverse().map((point) => `L ${point.x.toFixed(2)} ${point.lowerY.toFixed(2)}`).join(' ');
      const bandD = `${upperPath} ${lowerPath} Z`;

      return {
        airport,
        color: seriesColors[index]?.color ?? '#5c7c6c',
        fill: seriesColors[index]?.fill ?? 'rgba(92,124,108,0.14)',
        points,
        lineD,
        bandD,
      };
    });

    return {
      series: mappedSeries,
      yTicks: [WIND_DISTURBANCE_INDEX_MIN, 1.25, WIND_DISTURBANCE_INDEX_NORMAL_LOW, WIND_DISTURBANCE_INDEX_NORMAL_HIGH, WIND_DISTURBANCE_INDEX_MAX],
      summaries: mappedSeries.map((item) => buildAirportSummary(item.airport, item.points)),
    };
  }, [maxDays, selectedAirports, selectedMonth]);

  const visibleDays = useMemo(() => buildVisibleDays(maxDays), [maxDays]);
  const hoveredValues = hoveredDay
    ? series.map((item) => ({
        airport: item.airport,
        color: item.color,
        point: item.points.find((point) => point.day === hoveredDay),
      }))
    : [];

  const toggleAirport = (airportId: string) => {
    setSelectedAirportIds((current) => {
      if (current.includes(airportId)) {
        return current.length === 1 ? current : current.filter((id) => id !== airportId);
      }

      if (current.length < 2) {
        return [...current, airportId];
      }

      return [current[0], airportId];
    });
  };

  return (
    <section className="surface-card p-5 sm:p-6">
      <div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">月度风扰指数时序变化</h2>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-3">
        <label className="block">
          <span className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">年份</span>
          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            className="mt-2 h-11 w-28 rounded-2xl border border-border/80 bg-white/88 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-accent/30"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">月份</span>
          <select
            value={selectedMonthNumber}
            onChange={(event) => setSelectedMonthNumber(event.target.value)}
            className="mt-2 h-11 w-28 rounded-2xl border border-border/80 bg-white/88 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-accent/30"
          >
            {availableMonths.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </label>

        <div className="ml-0 flex items-end gap-3 lg:ml-8">
          <div>
            <div className="mb-2 text-xs text-muted-foreground">可选择 1 个机场进行月度分析，或选择 2 个机场进行对比。</div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 items-center text-xs font-semibold tracking-[0.12em] text-muted-foreground">机场选择</div>
              <div className="flex flex-wrap gap-2">
                {selectableAirports.map((airport) => {
                  const selected = selectedAirportIds.includes(airport.id);
                  return (
                    <button
                      key={airport.id}
                      type="button"
                      onClick={() => toggleAirport(airport.id)}
                      className={`h-11 min-w-[112px] rounded-2xl border px-4 text-sm font-semibold transition ${
                        selected
                          ? 'border-accent/20 bg-accent text-white shadow-accent'
                          : 'border-border/80 bg-white/80 text-muted-foreground hover:border-accent/20 hover:text-foreground'
                      }`}
                    >
                      {airport.city}
                      {airport.shortName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid items-stretch gap-5 xl:grid-cols-[minmax(0,0.64fr)_minmax(340px,0.36fr)]">
        <div className="flex h-full flex-col gap-4 rounded-[28px] border border-border/75 bg-white/88 p-4 sm:p-5">
          <TrendChart
            series={series}
            yTicks={yTicks}
            visibleDays={visibleDays}
            maxDays={maxDays}
            selectedMonthLabel={selectedMonthLabel}
            hoveredDay={hoveredDay}
            hoveredValues={hoveredValues}
            onHoverDay={setHoveredDay}
          />

          <div className="text-sm font-semibold text-foreground">风向分布</div>
          <div className={`grid gap-4 ${series.length === 1 ? 'md:grid-cols-2' : 'md:grid-cols-2'}`}>
            {series.map((item) => (
              <WindRoseSummary key={item.airport.id} airport={item.airport} color={item.color} />
            ))}
            {series.length === 1 && <div className="hidden md:block" />}
          </div>
        </div>

        <TrendAnalysisPanel monthLabel={selectedMonthLabel} summaries={summaries} />
      </div>
    </section>
  );
}

function TrendChart({
  series,
  yTicks,
  visibleDays,
  maxDays,
  selectedMonthLabel,
  hoveredDay,
  hoveredValues,
  onHoverDay,
}: {
  series: TrendSeries[];
  yTicks: number[];
  visibleDays: number[];
  maxDays: number;
  selectedMonthLabel: string;
  hoveredDay: number | null;
  hoveredValues: Array<{ airport: AirportRiskProfile; color: string; point: ChartPoint | undefined }>;
  onHoverDay: Dispatch<SetStateAction<number | null>>;
}) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-muted-foreground">
        {series.map((item) => (
          <span key={item.airport.id} className="inline-flex items-center gap-2">
            <span className="h-1 w-8 rounded-full" style={{ backgroundColor: item.color }} />
            {`${item.airport.city}${item.airport.shortName}日平均曲线`}
          </span>
        ))}
        {series.map((item, index) => (
          <span key={`${item.airport.id}-band-legend`} className="inline-flex items-center gap-2">
            <span className="h-3 w-8 rounded-full border" style={{ backgroundColor: item.fill, borderColor: item.color }} />
            {series.length === 1 ? '95%置信区间' : `${item.airport.city}${item.airport.shortName} 95%置信区间`}
          </span>
        ))}
      </div>

      <div className="relative h-[390px]">
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          className="h-full w-full"
          role="img"
          aria-label={`${selectedMonthLabel}机场日平均风扰指数时序图`}
        >
          <line
            x1={chart.margin.left}
            x2={chart.width - chart.margin.right}
            y1={chart.height - chart.margin.bottom}
            y2={chart.height - chart.margin.bottom}
            stroke="#8a8f87"
            strokeWidth="1.6"
          />
          <line
            x1={chart.margin.left}
            x2={chart.margin.left}
            y1={chart.margin.top}
            y2={chart.height - chart.margin.bottom}
            stroke="#8a8f87"
            strokeWidth="1.6"
          />

          {yTicks.map((tick) => {
            const y = chart.margin.top + (1 - normalizeWindDisturbanceIndex(tick)) * (chart.height - chart.margin.top - chart.margin.bottom);
            return (
              <g key={tick}>
                <line x1={chart.margin.left} x2={chart.width - chart.margin.right} y1={y} y2={y} stroke="#d8cdbb" strokeDasharray="4 6" />
                <text x={chart.margin.left - 16} y={y + 5} textAnchor="end" fontSize="14" fill="#4f5a52">
                  {formatWindDisturbanceIndex(tick)}
                </text>
              </g>
            );
          })}

          {visibleDays.map((day) => {
            const x = chart.margin.left + ((day - 1) / Math.max(maxDays - 1, 1)) * (chart.width - chart.margin.left - chart.margin.right);
            return (
              <text key={day} x={x} y={chart.height - 28} textAnchor="middle" fontSize="13" fill="#4f5a52">
                {day}
              </text>
            );
          })}

          {series.map((item) => (
            <path key={`${item.airport.id}-band`} d={item.bandD} fill={item.fill} stroke="none" />
          ))}

          {series.map((item) => (
            <path key={`${item.airport.id}-line`} d={item.lineD} fill="none" stroke={item.color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
          ))}

          {series.map((item) =>
            item.points.map((point) => (
              <circle
                key={`${item.airport.id}-${point.day}`}
                cx={point.x}
                cy={point.y}
                r="5.6"
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => onHoverDay(point.day)}
                onMouseLeave={() => onHoverDay((current) => (current === point.day ? null : current))}
              />
            )),
          )}

          {hoveredDay && (
            <line
              x1={chart.margin.left + ((hoveredDay - 1) / Math.max(maxDays - 1, 1)) * (chart.width - chart.margin.left - chart.margin.right)}
              x2={chart.margin.left + ((hoveredDay - 1) / Math.max(maxDays - 1, 1)) * (chart.width - chart.margin.left - chart.margin.right)}
              y1={chart.margin.top}
              y2={chart.height - chart.margin.bottom}
              stroke="#9a4f43"
              strokeDasharray="5 6"
              strokeOpacity="0.45"
            />
          )}

          <text
            x={24}
            y={(chart.height - chart.margin.bottom + chart.margin.top) / 2}
            textAnchor="middle"
            fontSize="15"
            fontWeight="700"
            fill="#2f493b"
            transform={`rotate(-90 24 ${(chart.height - chart.margin.bottom + chart.margin.top) / 2})`}
          >
            日平均风扰指数
          </text>
          <text x={(chart.width + chart.margin.left - chart.margin.right) / 2} y={chart.height - 6} textAnchor="middle" fontSize="15" fontWeight="700" fill="#2f493b">
            日期（日）
          </text>
        </svg>

        {hoveredDay && (
          <div className="absolute right-4 top-4 z-10 w-[250px] rounded-[20px] border border-[#ead9cf] bg-white/95 p-4 text-sm shadow-soft backdrop-blur-xl">
            <div className="font-bold text-foreground">
              {selectedMonthLabel}
              {hoveredDay}日
            </div>
            <div className="mt-3 space-y-2 text-muted-foreground">
              {hoveredValues.map(({ airport, color, point }) =>
                point ? (
                  <div key={airport.id} className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                      {airport.city}
                      {airport.shortName}
                    </span>
                    <strong className="text-foreground">{formatWindDisturbanceIndex(point.index)}</strong>
                  </div>
                ) : null,
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TrendAnalysisPanel({ monthLabel, summaries }: { monthLabel: string; summaries: AirportSummary[] }) {
  return (
    <aside className="flex h-full flex-col gap-4">
      <div className="rounded-[26px] border border-border/75 bg-white/85 p-4">
        <div className="text-sm font-semibold text-foreground">关键摘要</div>
        <div className="mt-4 space-y-3">
          {summaries.map((summary) => (
            <SummaryBlock key={summary.airport.id} summary={summary} />
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-[26px] border border-accent/15 bg-[#f7faf8] p-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-accent/15 bg-white text-accent shadow-sm">
            <Bot size={18} strokeWidth={2} />
          </span>
          <div className="text-sm font-semibold text-foreground">Agent 分析结果</div>
        </div>
        <div className="mt-3 rounded-[18px] border border-border/65 bg-white/82 px-4 py-3 text-sm leading-7 text-slate-700">
          {buildAgentAnalysisItems(monthLabel, summaries).map((item) => (
            <p key={item} className="mt-2 first:mt-0">
              <span className="mr-2 font-semibold text-accent">•</span>
              {item}
            </p>
          ))}
        </div>
      </div>
    </aside>
  );
}

function WindRoseSummary({ airport, color }: { airport: AirportRiskProfile; color: string }) {
  const windSummary = buildWindSummary(airport.windRose);

  return (
    <div className="rounded-[22px] bg-background/90 px-3.5 py-3">
      <div className="flex items-center justify-between gap-3 text-sm font-semibold text-foreground">
        <span>
          {airport.city}
          {airport.shortName}
        </span>
        <span className="text-xs text-muted-foreground">主峰 {windSummary[0]?.label}</span>
      </div>
      <div className="mt-3 space-y-2">
        {windSummary.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-[#ebe1d3]">
              <div className="h-2 rounded-full" style={{ width: `${30 + item.ratio * 58}%`, backgroundColor: color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryBlock({ summary }: { summary: AirportSummary }) {
  return (
    <div className="rounded-[20px] bg-background/90 px-3.5 py-3">
      <div className="text-sm font-semibold text-foreground">
        {summary.airport.city}
        {summary.airport.shortName}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <Metric label="月均" value={formatWindDisturbanceIndex(summary.average)} />
        <Metric label="峰值" value={`${formatWindDisturbanceIndex(summary.peak)} / ${summary.peakDay}日`} />
        <Metric label="波动" value={summary.range.toFixed(2)} />
      </div>
      <div className="mt-3 text-sm leading-6 text-muted-foreground">{summary.airport.typicalScenario}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div>{label}</div>
      <div className="mt-1 font-semibold text-foreground">{value}</div>
    </div>
  );
}

function buildLinePath(points: ChartPoint[], yKey: 'y' | 'lowerY' | 'upperY') {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point[yKey].toFixed(2)}`).join(' ');
}

function buildVisibleDays(maxDays: number) {
  return [1, 5, 10, 15, 20, 25, maxDays];
}

function buildAirportSummary(airport: AirportRiskProfile, points: ChartPoint[]): AirportSummary {
  const values = points.map((point) => point.index);
  const average = values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
  const peakPoint = points.reduce((max, point) => (point.index > max.index ? point : max), points[0]);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    airport,
    average: Number(average.toFixed(2)),
    peak: peakPoint?.index ?? 0,
    peakDay: peakPoint?.day ?? 1,
    range: Number((max - min).toFixed(2)),
  };
}

function buildWindSummary(windRose: number[]) {
  const labels = ['北', '东北', '东南', '南', '西南', '西北'];
  const maxValue = Math.max(...windRose, 1);

  return windRose
    .map((value, index) => ({
      label: labels[index],
      value,
      ratio: value / maxValue,
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 3);
}

function buildAgentAnalysisItems(monthLabel: string, summaries: AirportSummary[]) {
  if (summaries.length === 1) {
    const [summary] = summaries;
    const averageState = describeAverage(summary.average);
    const intervalNote =
      summary.range > 0.42
        ? '曲线日内起伏较明显，峰值附近的95%置信区间如果同步变宽，提示该阶段样本离散度偏高，可作为复盘线索。'
        : '曲线整体较收敛，95%置信区间主要提供稳定运行下的参考边界；若个别日期上界抬升，仍建议回看当天进近批次。';

    // Extension point: replace this fixed/demo summarizer with a real LLM API call when backend credentials and review flow are available.
    return [
      `${monthLabel}，${summary.airport.city}${summary.airport.shortName}月均风扰指数为 ${formatWindDisturbanceIndex(summary.average)}，整体处于${averageState}状态；峰值出现在${summary.peakDay}日前后，建议把这几天的跑道方向、低空风场记录和进近排序放在一起复核。`,
      `${intervalNote} 当前结果不宜直接作为安全结论，但能帮助筛出更值得回看的日期，尤其是曲线上界接近正常上沿或峰值连续出现的时段。`,
      `本月波动幅度约 ${summary.range.toFixed(2)}，如果后续真实数据仍呈现类似节奏，可把该机场纳入月度飞行品质监控的对照样本，重点观察风向摆动与流量叠加时是否伴随指数抬升。`,
      `建议结合后续真实数据验证：一方面比较同机场前后月份的均值和置信区间，另一方面回看峰值日前后的机组操纵响应，避免只凭单日曲线高点做判断。`,
    ];
  }

  const sorted = [...summaries].sort((left, right) => right.average - left.average);
  const delta = Math.abs(sorted[0].average - sorted[1].average);
  const higher = sorted[0];
  const lower = sorted[1];

  // Extension point: replace this fixed/demo summarizer with a real LLM API call when backend credentials and review flow are available.
  return [
    `${monthLabel}，${higher.airport.city}${higher.airport.shortName}月均风扰指数为 ${formatWindDisturbanceIndex(higher.average)}，高于${lower.airport.city}${lower.airport.shortName}的 ${formatWindDisturbanceIndex(lower.average)}，差值约 ${delta.toFixed(2)}；该差异提示两机场本月风扰水平存在可比对空间，但仍需结合真实运行样本验证。`,
    `波动幅度上，${higher.airport.city}${higher.airport.shortName}约为 ${higher.range.toFixed(2)}，${lower.airport.city}${lower.airport.shortName}约为 ${lower.range.toFixed(2)}。若置信区间在峰值附近同步变宽，可优先回看该机场对应日期的进近批次、跑道使用方向和低空风场记录。`,
    `风险时段并不完全重合：${higher.airport.city}${higher.airport.shortName}峰值在${higher.peakDay}日前后，${lower.airport.city}${lower.airport.shortName}峰值在${lower.peakDay}日前后。对比复盘时不建议只看月均值，更适合按日期拆开看天气过程和运行压力。`,
    `复盘侧重点可以分开：月均较高的一侧关注持续性扰动和上界抬升，月均较低但峰值突出的机场关注短时波动。当前为 mock 分析，建议后续接入真实数据后再验证这些线索是否稳定。`,
  ];
}

function describeAverage(value: number) {
  if (value > WIND_DISTURBANCE_INDEX_NORMAL_HIGH) {
    return '偏高';
  }

  if (value >= WIND_DISTURBANCE_INDEX_NORMAL_LOW) {
    return '正常';
  }

  return '较平稳';
}

export default AirportTrendPanel;

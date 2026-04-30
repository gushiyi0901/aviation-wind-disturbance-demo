import type { ReactNode } from 'react';
import { Activity, ArrowRight, BarChart3, Compass, MapPin } from 'lucide-react';

type FeatureCardProps = {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  future: string;
  preview: ReactNode;
  actionHref?: string;
  actionLabel?: string;
};

const airportPoints = [
  { name: '北京', left: '63%', top: '30%', level: 'low' as const },
  { name: '上海', left: '71%', top: '47%', level: 'mid' as const },
  { name: '广州', left: '61%', top: '68%', level: 'mid' as const },
  { name: '成都', left: '43%', top: '48%', level: 'mid' as const },
  { name: '昆明', left: '36%', top: '66%', level: 'high' as const },
  { name: '乌鲁木齐', left: '19%', top: '24%', level: 'low' as const },
];

function FeatureModules() {
  return (
    <section id="modules" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="section-kicker">功能模块</div>
            <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">亮点功能</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            先把一次进近怎么看、机场之间怎么比、事件关系怎么解释这三件事讲清楚。
          </p>
        </div>

        <div className="mt-10 space-y-6">
          <FeatureRow
            id="approach-module"
            icon={<Activity size={22} />}
            title="单次进近风扰指数"
            description="按秒展示一次进近中的风扰指数变化，并结合风向、风速和风险等级，帮助说明局部扰动在过程中的出现位置。"
            future="秒级曲线 · 悬停提示 · 风向风速联动"
            actionHref="/approach"
            actionLabel="进入动态演示"
            preview={<ApproachPreview />}
          />
          <FeatureRow
            id="airport-module"
            icon={<MapPin size={22} />}
            title="机场风扰风险画像"
            description="在机场尺度汇总风扰指数，用地图和时间趋势展示不同机场的风险差异，便于做横向比较。"
            future="机场地图 · 时间尺度切换 · 风险画像"
            preview={<AirportPreview />}
          />
          <FeatureRow
            id="analysis-module"
            icon={<BarChart3 size={22} />}
            title="运行事件关联与归因分析"
            description="把风扰指数与降落事件放在同一分析视图中，用于识别重点机场，并辅助讨论可能的影响因素。"
            future="事件对比 · 象限分析 · 风险归因"
            preview={<AnalysisPreview />}
          />
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ id, icon, title, description, future, preview, actionHref, actionLabel }: FeatureCardProps) {
  return (
    <article
      id={id}
      className="surface-card grid gap-8 transition duration-300 hover:-translate-y-1 hover:shadow-hover lg:grid-cols-[minmax(0,0.36fr)_minmax(0,0.64fr)] lg:items-center"
    >
      <div>
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">{icon}</div>
          <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">{future}</span>
        </div>

        <h3 className="mt-6 text-[1.85rem] font-bold leading-tight">{title}</h3>
        <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>

        {actionHref && actionLabel && (
          <a href={actionHref} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:translate-x-0.5">
            {actionLabel}
            <ArrowRight size={16} />
          </a>
        )}
      </div>

      <div className="min-w-0">{preview}</div>
    </article>
  );
}

function ApproachPreview() {
  return (
    <div className="preview-shell">
      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
        <span>单次进近走势示意</span>
        <span>00:00 - 00:42</span>
      </div>
      <div className="relative mt-4">
        <svg viewBox="0 0 320 160" className="h-40 w-full">
          <defs>
            <linearGradient id="approachGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#547465" />
              <stop offset="100%" stopColor="#b56b4a" />
            </linearGradient>
          </defs>
          {[20, 80, 140].map((y) => (
            <line key={y} x1="12" y1={y} x2="308" y2={y} stroke="#d8cdbb" strokeDasharray="4 6" />
          ))}
          {[40, 100, 160, 220, 280].map((x) => (
            <line key={x} x1={x} y1="12" x2={x} y2="148" stroke="#ece2d4" />
          ))}
          <path
            d="M20 114 C45 124, 60 118, 80 100 S118 62, 140 72 S178 132, 200 92 S244 24, 300 58"
            fill="none"
            stroke="url(#approachGradient)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="234" cy="36" r="7" fill="#b56b4a" />
          <circle cx="234" cy="36" r="15" fill="#b56b4a" opacity="0.16" />
          <line x1="234" y1="36" x2="264" y2="22" stroke="#8b5e47" strokeWidth="2" />
          <polygon points="264,22 257,18 258,27" fill="#8b5e47" />
        </svg>

        <div className="absolute right-2 top-3 w-36 rounded-2xl border border-accent-secondary/20 bg-white/92 p-3 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-secondary">高风险点</div>
          <div className="mt-2 space-y-1.5 text-sm text-foreground">
            <div>风向：236°</div>
            <div>风速：18 kt</div>
            <div className="font-semibold text-accent-secondary">指数：76</div>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>阈值线以上为重点关注区间</span>
        <div className="flex items-center gap-1">
          <Compass size={14} className="text-accent-secondary" />
          风向联动
        </div>
      </div>
    </div>
  );
}

function AirportPreview() {
  return (
    <div className="preview-shell">
      <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative overflow-hidden rounded-[24px] border border-border/75 bg-[#f8f2e8] p-4">
          <div className="absolute inset-0 opacity-50">
            <svg viewBox="0 0 240 180" className="h-full w-full">
              <path
                d="M39 52 C58 34, 87 28, 110 37 C125 22, 156 20, 182 39 C203 54, 214 76, 208 97 C216 116, 205 140, 182 149 C159 167, 127 166, 103 154 C79 158, 48 148, 33 129 C20 111, 17 80, 39 52 Z"
                fill="#d7c8b3"
                opacity="0.72"
              />
              <path d="M58 56 L155 54 L189 93 L157 129 L77 125 L45 88 Z" fill="none" stroke="#bca98f" strokeDasharray="5 5" />
            </svg>
          </div>

          <div className="relative h-48">
            {airportPoints.map((airport) => (
              <div
                key={airport.name}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: airport.left, top: airport.top }}
              >
                <span
                  className={`block rounded-full border-2 border-white ${
                    airport.level === 'high'
                      ? 'h-4 w-4 bg-accent-secondary shadow-[0_0_0_6px_rgba(181,107,74,0.14)]'
                      : airport.level === 'mid'
                        ? 'h-3.5 w-3.5 bg-accent shadow-[0_0_0_5px_rgba(92,124,108,0.12)]'
                        : 'h-3 w-3 bg-[#bca98f] shadow-[0_0_0_4px_rgba(188,169,143,0.16)]'
                  }`}
                />
                <span className="mt-2 block rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-foreground shadow-sm">{airport.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[24px] border border-border/75 bg-white/80 p-4">
          <div>
            <div className="text-sm font-semibold text-foreground">机场详情</div>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>当前机场</span>
                <span className="font-semibold text-foreground">昆明长水</span>
              </div>
              <div className="flex items-center justify-between">
                <span>当前指数</span>
                <span className="font-semibold text-accent-secondary">72</span>
              </div>
              <div className="flex items-center justify-between">
                <span>时间尺度</span>
                <span className="font-semibold text-foreground">月度</span>
              </div>
              <div className="flex items-center justify-between">
                <span>高风险时段</span>
                <span className="font-semibold text-foreground">春季、午后</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">趋势预览</div>
            <svg viewBox="0 0 180 80" className="h-20 w-full">
              <path
                d="M10 58 C24 50, 38 54, 54 44 S86 20, 106 30 S136 62, 170 24"
                fill="none"
                stroke="#5c7c6c"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="170" cy="24" r="4.5" fill="#b56b4a" />
            </svg>
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>年</span>
              <span>季</span>
              <span>月</span>
              <span>周</span>
              <span>日</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisPreview() {
  const scatterPoints = [
    { name: '昆明', x: 68, y: 68, color: '#b56b4a' },
    { name: '广州', x: 60, y: 38, color: '#5c7c6c' },
    { name: '乌鲁木齐', x: 34, y: 55, color: '#bca98f' },
    { name: '上海', x: 42, y: 24, color: '#5c7c6c' },
  ];

  const contributionBars = [
    ['风速变化', 38],
    ['风向波动', 26],
    ['低高度扰动', 21],
    ['其他因素', 15],
  ];

  const topAirports = ['昆明长水', '拉萨贡嘎', '乌鲁木齐地窝堡', '广州白云'];

  return (
    <div className="preview-shell">
      <div className="rounded-[24px] border border-border/70 bg-white/80 p-4">
        <div className="mb-3 flex items-center justify-between text-sm font-semibold text-foreground">
          <span>指数 - 事件散点象限图</span>
          <span className="text-xs text-muted-foreground">机场平均风扰指数 / 降落事件数</span>
        </div>

        <div className="relative h-40 rounded-[20px] bg-[#f9f4ec]">
          <div className="absolute inset-x-5 top-1/2 border-t border-dashed border-border" />
          <div className="absolute inset-y-4 left-1/2 border-l border-dashed border-border" />
          <div className="absolute left-4 top-4 text-[10px] font-medium text-muted-foreground">低指数 / 高事件</div>
          <div className="absolute right-4 top-4 text-right text-[10px] font-medium text-muted-foreground">高指数 / 高事件</div>
          <div className="absolute bottom-3 left-4 text-[10px] font-medium text-muted-foreground">低指数 / 低事件</div>
          <div className="absolute bottom-3 right-4 text-right text-[10px] font-medium text-muted-foreground">高指数 / 低事件</div>
          {scatterPoints.map((point) => (
            <div
              key={point.name}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${point.x}%`, top: `${100 - point.y}%` }}
            >
              <span className="block h-3.5 w-3.5 rounded-full border-2 border-white" style={{ backgroundColor: point.color }} />
              <span className="mt-1 block text-[10px] font-semibold text-foreground">{point.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[24px] border border-border/70 bg-white/80 p-4">
          <div className="text-sm font-semibold text-foreground">归因贡献条</div>
          <div className="mt-4 space-y-3">
            {contributionBars.map(([label, value]) => (
              <div key={label}>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{label}</span>
                  <span className="font-semibold text-foreground">{value}%</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-[#eee3d4]">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-accent to-accent-secondary" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-border/70 bg-white/80 p-4">
          <div className="text-sm font-semibold text-foreground">重点机场榜单</div>
          <div className="mt-4 space-y-2">
            {topAirports.map((airport, index) => (
              <div key={airport} className="flex items-center justify-between rounded-2xl bg-background/90 px-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                    0{index + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{airport}</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {index === 0 ? '重点关注' : index === 1 ? '高海拔' : index === 2 ? '侧风敏感' : '繁忙运行'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeatureModules;

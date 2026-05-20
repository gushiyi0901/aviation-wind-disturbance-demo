import { Activity, BarChart3, Compass, Gauge, MapPin, Radar, Wind } from 'lucide-react';

const metricRows = [
  ['当前模拟航班', 'CES-2026'],
  ['飞行阶段', '进近 / 1000 ft 以下'],
  ['当前风扰指数', '76'],
  ['风险等级', '偏高'],
  ['风速', '18 kt'],
  ['风向', '236°'],
];

const disturbanceSources = ['风速变化', '风向波动', '低高度操作敏感性'];
const disturbanceLevels = ['高', '中', '中高'];

function HeroSection() {
  return (
    <section id="overview" className="px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-24">
      <div className="mx-auto grid max-w-[1680px] gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
        <div className="max-w-3xl lg:-translate-y-4">
          <h1 className="mt-8 flex flex-col gap-1.5">
            <span className="text-[2.65rem] font-bold leading-[1.12] text-foreground sm:text-[3.35rem] lg:text-[3.6rem]">进近风扰风险指数</span>
            <span className="text-[3.4rem] font-extrabold leading-[1.02] text-[#465d54] sm:text-[4.45rem] lg:text-[5.05rem]">智能展示平台</span>
          </h1>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <a href="/approach" className="feature-entry">
              <Activity size={18} className="text-accent" />
              <span>单次进近风扰指数</span>
            </a>
            <a href="/airports" className="feature-entry">
              <MapPin size={18} className="text-accent" />
              <span>机场风扰风险画像</span>
            </a>
            <a href="/event-analysis" className="feature-entry">
              <BarChart3 size={18} className="text-accent" />
              <span>运行事件关联分析</span>
            </a>
          </div>

        </div>

        <div className="surface-panel overflow-hidden p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-5">
            <div>
              <div className="section-kicker bg-white/80">模拟态势卡片</div>
              <h2 className="mt-4 text-2xl font-bold">单次进近状态摘要</h2>
            </div>

            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Radar size={24} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {metricRows.map(([label, value]) => (
              <div key={label} className="surface-tile">
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className={`mt-2 ${label === '当前风扰指数' ? 'text-4xl font-extrabold text-accent' : 'text-lg font-semibold'}`}>{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="rounded-[26px] border border-border/80 bg-white/70 p-4">
              <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                <span>模拟指数走势</span>
                <span>最近 30 秒</span>
              </div>
              <svg viewBox="0 0 280 130" className="mt-3 h-32 w-full">
                <defs>
                  <linearGradient id="heroLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#5c7c6c" />
                    <stop offset="100%" stopColor="#b56b4a" />
                  </linearGradient>
                </defs>
                <path
                  d="M10 92 C30 96, 50 88, 70 74 S110 58, 128 64 S165 94, 185 72 S220 24, 270 46"
                  fill="none"
                  stroke="url(#heroLine)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="185" cy="72" r="7" fill="#b56b4a" />
                <circle cx="185" cy="72" r="16" fill="#b56b4a" opacity="0.14" />
              </svg>
            </div>

            <div className="rounded-[26px] border border-border/80 bg-white/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Wind size={16} className="text-accent" />
                主要扰动来源
              </div>
              <div className="mt-4 space-y-3">
                {disturbanceSources.map((item, index) => (
                  <div key={item} className="flex items-center justify-between rounded-2xl bg-background/90 px-4 py-3">
                    <span className="text-sm font-medium text-foreground">{item}</span>
                    <span className="text-sm text-muted-foreground">{disturbanceLevels[index]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Compass size={16} className="text-accent-secondary" />
                  风向波动显著
                </div>
                <div className="flex items-center gap-2 font-semibold text-accent">
                  <Gauge size={16} />
                  指数预警偏高
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

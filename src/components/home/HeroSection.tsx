import { ArrowRight, Plane } from 'lucide-react';
import approachPlane from '../../assets/airplane-approach.png';
import airportPlane from '../../assets/airplane-airport.png';

const heroModules = [
  {
    title: '单次航班进近降落风扰分析',
    description: '面向单次航班进近与落地过程，展示风扰指数随时间的变化，结合关键节点观察风扰对飞行操纵的影响位置',
    href: '/approach',
    action: '进入动态演示',
    illustration: <ApproachLandingIllustration />,
  },
  {
    title: '机场风扰分析',
    description: '汇总机场尺度的风扰指数表现，通过运行场景与趋势视角观察不同机场的风险差异',
    href: '/airports',
    action: '进入机场画像',
    illustration: <AirportMonitoringIllustration />,
  },
  {
    title: '运行事件关联分析',
    description: '将风扰指数与机场运行事件放在同一视图中，辅助识别重点机场与潜在关联因素',
    href: '/event-analysis',
    action: '进入关联分析',
    illustration: <EventCorrelationIllustration />,
  },
];

function HeroSection() {
  return (
    <section id="overview" className="px-4 pb-14 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-16 lg:pt-28">
      <div className="mx-auto flex max-w-[1360px] flex-col items-center">
        <div className="w-full">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/85 bg-white/78 text-white shadow-[0_8px_20px_rgba(255,255,255,0.18),0_2px_6px_rgba(92,124,108,0.08)] ring-1 ring-white/65 backdrop-blur-lg">
            <Plane size={20} strokeWidth={2} />
          </div>

          <h1 className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
            <span className="flex flex-col gap-2 text-[2.25rem] font-extrabold leading-[1.08] text-foreground drop-shadow-sm sm:text-[3rem] lg:text-[4rem]">
              <span>操纵响应风扰指数</span>
              <span>智能展示平台</span>
            </span>
            <span className="rounded-full border border-white/80 bg-white/76 px-5 py-2 text-sm font-semibold tracking-[0.04em] text-[#3f584d] shadow-soft backdrop-blur-md sm:text-base lg:text-lg">
              Pilot-Response Wind Disturbance Index (PWDI)
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-center text-base font-medium leading-8 text-[#31473d] sm:text-lg">
            基于飞行员操纵响应，展示进近与着陆阶段风扰影响程度的可视化分析平台
          </p>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {heroModules.map((module) => (
              <a
                key={module.title}
                href={module.href}
                className="group flex min-h-[360px] flex-col justify-between overflow-hidden rounded-[30px] border border-white/72 bg-white/72 p-5 text-left shadow-soft backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-accent/25 hover:shadow-hover sm:p-6"
              >
                <span>
                  <span className="block text-xl font-bold leading-tight text-foreground sm:text-2xl">{module.title}</span>
                  <span className="mt-3 block text-sm leading-7 text-muted-foreground">{module.description}</span>
                </span>

                <span className="mt-5 block">{module.illustration}</span>

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#F8FAF7] drop-shadow-[0_1px_4px_rgba(32,49,41,0.32)] transition group-hover:translate-x-0.5 group-hover:text-[#ECF4EE]">
                  {module.action}
                  <ArrowRight size={16} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ApproachLandingIllustration() {
  return (
    <svg viewBox="0 0 360 190" role="img" aria-label="下降中的飞机进近降落示意" className="h-44 w-full">
      <defs>
        <linearGradient id="approach-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f9f3e8" />
          <stop offset="100%" stopColor="#e2d4c0" />
        </linearGradient>
        <linearGradient id="approach-plane" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cad8d0" />
        </linearGradient>
        <filter id="approach-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#3b4f45" floodOpacity="0.18" />
        </filter>
        <clipPath id="approach-inner-clip" clipPathUnits="userSpaceOnUse">
          <rect x="8" y="8" width="344" height="174" rx="28" />
        </clipPath>
        <clipPath id="approach-aircraft-clip">
          <path d="M0 20 H300 V158 H0 Z" />
        </clipPath>
      </defs>

      <rect x="8" y="8" width="344" height="174" rx="28" fill="url(#approach-sky)" />
      <g clipPath="url(#approach-inner-clip)">
        <path d="M-160 164 L520 164" stroke="#7f927f" strokeWidth="27" strokeLinecap="round" />
        <path d="M-84 164 L444 164" stroke="#fff7ec" strokeWidth="5" strokeDasharray="28 22" strokeLinecap="round" />
      </g>

      <g opacity="0.78">
        <path d="M310 70 C286 65, 262 66, 238 74" fill="none" stroke="#5c7c6c" strokeWidth="1.45" strokeLinecap="round" />
        <path d="M314 84 C288 79, 263 80, 239 88" fill="none" stroke="#5c7c6c" strokeWidth="1.45" strokeLinecap="round" />
        <path d="M310 98 C286 93, 262 94, 238 102" fill="none" stroke="#5c7c6c" strokeWidth="1.45" strokeLinecap="round" />
        <path d="M238 74 L246 70 L245 79 Z" fill="#5c7c6c" opacity="0.82" />
        <path d="M239 88 L247 84 L246 93 Z" fill="#5c7c6c" opacity="0.82" />
        <path d="M238 102 L246 98 L245 107 Z" fill="#5c7c6c" opacity="0.82" />
      </g>

      <g clipPath="url(#approach-aircraft-clip)" filter="url(#approach-shadow)">
        <image href={approachPlane} x="-17" y="20" width="306" height="130" opacity="0.98" />
      </g>
    </svg>
  );
}

function AirportMonitoringIllustration() {
  return (
    <svg viewBox="0 0 360 190" role="img" aria-label="机场监控飞机落地示意" className="h-44 w-full">
      <defs>
        <linearGradient id="airport-field" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f9f4eb" />
          <stop offset="100%" stopColor="#d9ccb8" />
        </linearGradient>
        <linearGradient id="airport-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fefbf6" />
          <stop offset="100%" stopColor="#dce8e1" />
        </linearGradient>
        <filter id="airport-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#3b4f45" floodOpacity="0.16" />
        </filter>
        <clipPath id="airport-inner-clip" clipPathUnits="userSpaceOnUse">
          <rect x="22" y="44" width="300" height="128" rx="24" />
        </clipPath>
        <clipPath id="airport-aircraft-clip">
          <path d="M22 42 H278 V154 H22 Z" />
        </clipPath>
      </defs>

      <rect x="8" y="8" width="344" height="174" rx="28" fill="url(#airport-field)" />
      <rect x="22" y="44" width="300" height="128" rx="24" fill="url(#airport-field)" opacity="0.74" />
      <g clipPath="url(#airport-inner-clip)">
        <g opacity="0.64">
          <path d="M28 133 H222 V137 H28 Z" fill="#bca98f" opacity="0.78" />
          <path d="M36 99 H204 L222 133 H36 Z" fill="#d6c8b3" />
          <path d="M52 82 H188 L204 99 H36 Z" fill="#eee4d6" />
          <path d="M55 108 H72 M83 108 H100 M111 108 H128 M139 108 H156 M167 108 H184" stroke="#7f927f" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M55 121 H72 M83 121 H100 M111 121 H128 M139 121 H156 M167 121 H184" stroke="#7f927f" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M36 99 L52 82 M204 99 L222 133" stroke="#bca98f" strokeWidth="1.8" strokeLinecap="round" opacity="0.78" />
        </g>
        <g transform="translate(0 45)" filter="url(#airport-shadow)">
          <path d="M-210 154 L414 62 L600 122 L-28 210 Z" fill="#7d8f7d" />
          <path d="M-34 150 L424 96" stroke="#fff7ec" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="16 13" />
        </g>
      </g>

      <g transform="translate(218 30)" filter="url(#airport-shadow)">
        <rect x="0" y="0" width="94" height="70" rx="16" fill="url(#airport-screen)" />
        <path d="M14 49 C30 33, 46 42, 59 24 S78 18, 84 26" fill="none" stroke="#5c7c6c" strokeWidth="3" strokeLinecap="round" />
        <circle cx="59" cy="24" r="5" fill="#b56b4a" />
        <path d="M47 70 L47 88" stroke="#8f7b63" strokeWidth="5" strokeLinecap="round" />
        <path d="M28 90 L66 90" stroke="#8f7b63" strokeWidth="5" strokeLinecap="round" />
      </g>

      <g clipPath="url(#airport-aircraft-clip)" filter="url(#airport-shadow)" transform="rotate(5 140 63)">
        <image href={airportPlane} x="30" y="8" width="220" height="110" opacity="0.98" />
      </g>
    </svg>
  );
}

function EventCorrelationIllustration() {
  return (
    <svg viewBox="0 0 360 190" role="img" aria-label="机场事件与指数关联分析示意" className="h-44 w-full">
      <defs>
        <linearGradient id="event-panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f9f3e9" />
          <stop offset="100%" stopColor="#dcd0bd" />
        </linearGradient>
        <filter id="event-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#3b4f45" floodOpacity="0.15" />
        </filter>
      </defs>

      <rect x="8" y="8" width="344" height="174" rx="28" fill="url(#event-panel)" />
      <g transform="translate(36 36)" filter="url(#event-shadow)">
        <rect x="0" y="0" width="178" height="126" rx="22" fill="#fffaf2" />
        <path d="M24 98 L154 98 M24 22 L24 98" stroke="#c8b99f" strokeWidth="2" strokeLinecap="round" />
        <path d="M30 84 C48 75, 56 79, 70 58 S102 21, 122 40 S137 75, 154 30" fill="none" stroke="#5c7c6c" strokeWidth="4" strokeLinecap="round" />
        <circle cx="70" cy="58" r="7" fill="#b56b4a" />
        <circle cx="122" cy="40" r="7" fill="#5c7c6c" />
        <circle cx="154" cy="30" r="7" fill="#b56b4a" />
        <path d="M30 98 L30 108 M70 98 L70 108 M110 98 L110 108 M150 98 L150 108" stroke="#c8b99f" strokeWidth="2" />
      </g>

      <g transform="translate(210 50)" filter="url(#event-shadow)">
        <rect x="0" y="0" width="104" height="38" rx="16" fill="#fffaf2" />
        <circle cx="20" cy="19" r="8" fill="#b56b4a" opacity="0.9" />
        <path d="M38 15 H84 M38 24 H68" stroke="#8d7b65" strokeWidth="3" strokeLinecap="round" />
        <rect x="14" y="54" width="90" height="38" rx="16" fill="#fffaf2" />
        <circle cx="34" cy="73" r="8" fill="#5c7c6c" opacity="0.9" />
        <path d="M52 69 H92 M52 78 H78" stroke="#8d7b65" strokeWidth="3" strokeLinecap="round" />
      </g>

      <path d="M199 88 C221 86, 220 69, 238 69" fill="none" stroke="#b56b4a" strokeWidth="2.5" strokeDasharray="5 7" />
      <path d="M185 118 C222 122, 227 123, 246 123" fill="none" stroke="#5c7c6c" strokeWidth="2.5" strokeDasharray="5 7" />
    </svg>
  );
}

export default HeroSection;

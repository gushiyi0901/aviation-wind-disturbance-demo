import { ArrowRight, Plane } from 'lucide-react';
import function1Scene from '../../assets/function1-scene.jpg';
import function3Scene from '../../assets/function3-scene.jpg';
import airportScene from '../../assets/airport-terminal-scene.jpg';

const heroModules = [
  {
    title: '单次航班进近降落风扰分析',
    description: '面向单次航班进近与落地过程，展示风扰指数随时间的变化，结合关键节点观察风扰对飞行操纵的影响位置',
    href: '/approach',
    action: '进入动态演示',
    illustration: <FeatureImage src={function1Scene} label="飞机进近降落场景" objectPosition="center 58%" />,
  },
  {
    title: '机场风扰分析',
    description: '汇总机场尺度的风扰指数表现，通过运行场景与趋势视角观察不同机场的风险差异',
    href: '/airports',
    action: '进入机场画像',
    illustration: <FeatureImage src={airportScene} label="机场航站楼、跑道与停靠飞机场景" />,
  },
  {
    title: '运行风险关联分析',
    description: '将风扰指数与机场运行风险表现放在同一视图中，辅助识别重点机场与潜在影响因素',
    href: '/event-analysis',
    action: '进入关联分析',
    illustration: <FeatureImage src={function3Scene} label="运行风险关联分析图表场景" />,
  },
];

function HeroSection() {
  return (
    <section id="overview" className="px-4 pb-14 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pb-16 lg:pt-10">
      <div className="mx-auto flex max-w-[1360px] flex-col items-center">
        <div className="w-full">
          <div className="mx-auto max-w-5xl rounded-[34px] border border-white/85 bg-white/80 px-5 py-5 text-center shadow-soft backdrop-blur-xl sm:px-8 lg:px-10">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent shadow-[0_8px_20px_rgba(255,255,255,0.18),0_2px_6px_rgba(92,124,108,0.08)] ring-1 ring-white/65">
              <Plane size={20} strokeWidth={2} />
            </div>

            <h1 className="mx-auto flex flex-col items-center gap-3">
              <span className="flex flex-col gap-1.5 text-[1.75rem] font-extrabold leading-[1.08] text-foreground sm:text-[2.25rem] lg:text-[3rem]">
                <span>操纵响应风扰指数</span>
                <span>可视化分析平台</span>
              </span>
              <span className="rounded-full border border-accent/15 bg-white px-5 py-2 text-base font-semibold tracking-[0.04em] text-[#31473d] shadow-sm sm:text-lg lg:text-xl">
                Pilot-Response Wind Disturbance Index (PWDI)
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-lg font-medium leading-8 text-[#24382f] sm:text-xl">
              基于飞行员操纵响应，展示进近与着陆阶段风扰影响程度的可视化分析平台
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {heroModules.map((module) => (
              <a
                key={module.title}
                href={module.href}
                className="group flex min-h-[380px] flex-col justify-between overflow-hidden rounded-[30px] border border-white/85 bg-white/85 p-5 text-left shadow-soft backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-accent/25 hover:shadow-hover sm:p-6 lg:grid lg:grid-rows-[8.75rem_11rem_auto]"
              >
                <span>
                  <span className="block text-xl font-bold leading-tight text-foreground sm:text-2xl">{module.title}</span>
                  <span className="mt-3 block text-base leading-8 text-[#405248] sm:text-lg">{module.description}</span>
                </span>

                <span className="mt-5 block lg:mt-0">{module.illustration}</span>

                <span className="mt-5 inline-flex items-center gap-2 text-base font-semibold text-accent transition group-hover:translate-x-0.5 group-hover:text-accent-secondary sm:text-lg">
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

type FeatureImageProps = {
  src: string;
  label: string;
  objectPosition?: string;
};

function FeatureImage({ src, label, objectPosition = 'center' }: FeatureImageProps) {
  return (
    <div className="relative h-44 w-full overflow-hidden rounded-[28px] border border-border/70 bg-[#edf5f2] shadow-sm" role="img" aria-label={label}>
      <img src={src} alt="" className="h-full w-full object-cover" style={{ objectPosition }} />
      <div className="absolute inset-0 bg-white/12" />
    </div>
  );
}

export default HeroSection;

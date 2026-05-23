import { Activity, BarChart3, MapPin } from 'lucide-react';

function HeroSection() {
  return (
    <section id="overview" className="px-4 pb-10 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-12 lg:pt-28">
      <div className="mx-auto flex max-w-[1280px] flex-col">
        <div className="w-full max-w-5xl">
          <h1 className="flex max-w-4xl flex-col gap-1 text-left">
            <span className="text-[2.55rem] font-bold leading-[1.08] text-foreground sm:text-[3.35rem] lg:text-[4.15rem]">进近风扰风险指数</span>
            <span className="text-[3.05rem] font-extrabold leading-[1.02] text-[#465d54] sm:text-[4.25rem] lg:text-[5.05rem]">智能展示平台</span>
          </h1>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="/approach" className="feature-entry w-fit max-w-[190px] items-start">
              <Activity size={18} className="text-accent" />
              <span className="flex flex-col leading-tight">
                <span>单次进近风扰指数</span>
                <span className="mt-1 text-xs font-medium text-muted-foreground">进入动态演示</span>
              </span>
            </a>
            <a href="/airports" className="feature-entry w-fit max-w-[184px] items-start">
              <MapPin size={18} className="text-accent" />
              <span className="flex flex-col leading-tight">
                <span>机场风扰风险画像</span>
                <span className="mt-1 text-xs font-medium text-muted-foreground">进入机场画像</span>
              </span>
            </a>
            <a href="/event-analysis" className="feature-entry w-fit max-w-[184px] items-start">
              <BarChart3 size={18} className="text-accent" />
              <span className="flex flex-col leading-tight">
                <span>运行事件关联分析</span>
                <span className="mt-1 text-xs font-medium text-muted-foreground">进入关联分析</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

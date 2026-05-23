import { Activity, ArrowRight, BarChart3, MapPin, Plane } from 'lucide-react';

function HeroSection() {
  return (
    <section id="overview" className="px-4 pb-10 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-12 lg:pt-28">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center">
        <div className="w-full max-w-5xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/80 bg-white/72 text-accent shadow-soft ring-1 ring-accent/10 backdrop-blur-xl">
            <Plane size={28} strokeWidth={1.9} />
          </div>

          <h1 className="mx-auto flex max-w-4xl flex-col gap-4 text-center">
            <span className="text-[2.4rem] font-bold leading-[1.08] text-foreground drop-shadow-sm sm:text-[3.15rem] lg:text-[3.9rem]">进近风扰风险指数</span>
            <span className="text-[2.86rem] font-extrabold leading-[1.02] text-[#3d554b] drop-shadow-sm sm:text-[4rem] lg:text-[4.78rem]">智能展示平台</span>
          </h1>
          <p className="mx-auto mt-7 w-fit rounded-full border border-white/80 bg-white/82 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#3f584d] shadow-soft backdrop-blur-md sm:text-sm">
            Intelligent Display Platform for Approach Wind Disturbance Risk Index
          </p>

          <div className="mt-14 flex flex-wrap justify-center gap-3">
            <a href="/approach" className="feature-entry w-[266px] max-w-full items-start">
              <Activity size={20} className="text-accent" />
              <span className="flex flex-col leading-tight">
                <span className="text-base">单次进近风扰指数</span>
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  进入动态演示
                  <ArrowRight size={14} />
                </span>
              </span>
            </a>
            <a href="/airports" className="feature-entry w-[258px] max-w-full items-start">
              <MapPin size={20} className="text-accent" />
              <span className="flex flex-col leading-tight">
                <span className="text-base">机场风扰风险画像</span>
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  进入机场画像
                  <ArrowRight size={14} />
                </span>
              </span>
            </a>
            <a href="/event-analysis" className="feature-entry w-[258px] max-w-full items-start">
              <BarChart3 size={20} className="text-accent" />
              <span className="flex flex-col leading-tight">
                <span className="text-base">运行事件关联分析</span>
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  进入关联分析
                  <ArrowRight size={14} />
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

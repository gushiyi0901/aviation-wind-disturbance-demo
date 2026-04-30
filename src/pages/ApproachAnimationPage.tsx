import { useMemo, useState } from 'react';
import { Activity, ArrowLeft, RotateCcw } from 'lucide-react';
import ApproachChart from '../components/approach/ApproachChart';
import FlightStatusPanel from '../components/approach/FlightStatusPanel';
import {
  approachFlightSummary,
  approachKeyMoments,
  approachMockData,
  type ApproachPoint,
} from '../data/mockApproachData';
import { riskLevelMeta } from '../utils/riskLevel';

function ApproachAnimationPage() {
  const [replayToken, setReplayToken] = useState(0);
  const [currentPoint, setCurrentPoint] = useState<ApproachPoint>(approachMockData[0]);

  const highestRiskPoint = useMemo(
    () => approachMockData.reduce((max, point) => (point.turbulenceIndex > max.turbulenceIndex ? point : max), approachMockData[0]),
    [],
  );

  return (
    <div className="min-h-screen px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <header className="glass-nav mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-5 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex h-10 items-center rounded-full border border-accent/20 bg-accent/10 px-3 text-sm font-semibold text-accent">
          进近风扰风险指数
        </div>

        <div className="text-sm font-semibold text-foreground sm:text-base">单次进近风扰指数</div>

        <a href="/" className="action-secondary">
          <ArrowLeft size={16} />
          返回首页
        </a>
      </header>

      <main className="mx-auto mt-8 max-w-6xl">
        <section className="surface-card px-6 py-7 sm:px-8">
          <div className="section-kicker">单次进近页面</div>
          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl lg:text-[3.25rem]">
            单次进近风扰指数动态演示
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
            以模拟 QAR 秒级数据为基础，展示飞机在 1000 ft 以下进近阶段的风扰指数变化，并联动呈现风向、风速与风险等级。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <span className="eyebrow-tag">模拟数据 · 秒级更新 · 风向风速联动 · 仅用于科研展示</span>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_320px]">
          <ApproachChart
            data={approachMockData}
            replayToken={replayToken}
            onReplay={() => setReplayToken((value) => value + 1)}
            onCurrentPointChange={setCurrentPoint}
          />

          <FlightStatusPanel
            point={currentPoint}
            flight={approachFlightSummary.flight}
            stage={approachFlightSummary.stage}
            fallbackPoint={highestRiskPoint}
          />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {approachKeyMoments.map((item) => {
            const tone = riskLevelMeta[item.point.riskLevel];

            return (
              <article key={item.point.time} className="surface-card bg-white/80">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-foreground">第 {item.point.time} 秒</div>
                    <div className="mt-1 text-sm text-muted-foreground">{item.summary}</div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.pillClass}`}>
                    {item.point.riskLevel}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity size={15} className="text-accent-secondary" />
                  指数 {item.point.turbulenceIndex} / 高度 {item.point.altitude} ft
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-6 rounded-[28px] border border-amber-300/70 bg-amber-50/90 px-5 py-5 shadow-sm">
          <p className="text-sm leading-7 text-slate-700 sm:text-[15px]">
            本页面为科研成果演示 Demo，当前曲线与风向风速数据均为模拟数据或脱敏样例数据，结果仅用于项目交流、方法展示与可视化说明，不作为实际飞行安全决策依据。
          </p>
        </section>
      </main>
    </div>
  );
}

export default ApproachAnimationPage;

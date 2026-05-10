import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowLeft, RefreshCw } from 'lucide-react';
import ApproachChart from '../components/approach/ApproachChart';
import FileUploadPanel from '../components/approach/FileUploadPanel';
import FlightStatusPanel from '../components/approach/FlightStatusPanel';
import {
  approachFlightSummary,
  type ApproachPoint,
} from '../data/mockApproachData';
import { buildApproachDataFromUpload, type UploadedApproachAnalysis } from '../utils/buildApproachDataFromUpload';
import { parseFlightIndexFile } from '../utils/parseFlightIndexFile';
import { riskLevelMeta } from '../utils/riskLevel';

function ApproachAnimationPage() {
  const [replayToken, setReplayToken] = useState(0);
  const [currentPoint, setCurrentPoint] = useState<ApproachPoint | null>(null);
  const [analysis, setAnalysis] = useState<UploadedApproachAnalysis | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedRowCount, setUploadedRowCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isAnalysisStarted, setIsAnalysisStarted] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const analysisData = analysis?.data ?? [];
  const highestRiskPoint = useMemo(() => {
    if (!analysisData.length) {
      return null;
    }

    return analysisData.reduce((max, point) => (point.turbulenceIndex > max.turbulenceIndex ? point : max), analysisData[0]);
  }, [analysisData]);

  useEffect(() => {
    if (analysisData.length) {
      setCurrentPoint(analysisData[0]);
    } else {
      setCurrentPoint(null);
    }
  }, [analysisData]);

  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      return;
    }

    setIsParsing(true);
    setUploadError(null);
    setIsAnalysisStarted(false);

    try {
      const parsed = await parseFlightIndexFile(file);
      const nextAnalysis = buildApproachDataFromUpload(parsed.rows);
      setAnalysis(nextAnalysis);
      setUploadedFileName(parsed.fileName);
      setUploadedRowCount(parsed.rows.length);
    } catch (error) {
      setAnalysis(null);
      setUploadedFileName(null);
      setUploadedRowCount(0);
      setUploadError(error instanceof Error ? error.message : '文件解析失败，请检查后重新上传。');
    } finally {
      setIsParsing(false);
    }
  };

  const handleStartAnalysis = () => {
    if (!analysis) {
      return;
    }

    setCurrentPoint(analysis.data[0]);
    setReplayToken((value) => value + 1);
    setIsAnalysisStarted(true);
  };

  const handleResetUpload = () => {
    setAnalysis(null);
    setUploadedFileName(null);
    setUploadedRowCount(0);
    setUploadError(null);
    setCurrentPoint(null);
    setIsAnalysisStarted(false);
  };

  return (
    <div className="min-h-screen px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <header className="glass-nav mx-auto flex max-w-[1680px] flex-col gap-3 px-4 py-3 sm:px-5 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/20 bg-accent/10">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        </div>

        <div className="text-sm font-semibold text-foreground sm:text-base">单次进近风扰指数</div>

        <a href="/" className="action-secondary">
          <ArrowLeft size={16} />
          返回首页
        </a>
      </header>

      <main className="mx-auto mt-8 max-w-[1680px]">
        <section className="surface-card px-6 py-7 sm:px-8">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-[3.25rem]">单次进近风扰指数动态演示</h1>
          <p className="mt-5 max-w-5xl text-base leading-8 text-muted-foreground sm:text-lg">
            上传秒级风扰指数数据后，系统将生成一次进近过程的动态曲线。
          </p>
          {isAnalysisStarted && uploadedFileName && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/80 px-4 py-2 text-sm text-muted-foreground">
                <Activity size={14} className="text-accent-secondary" />
                <span>{uploadedFileName}</span>
                <span className="font-semibold text-foreground">{uploadedRowCount} 条</span>
              </div>
              <button type="button" onClick={handleResetUpload} className="action-secondary h-10">
                <RefreshCw size={15} />
                重新上传数据
              </button>
            </div>
          )}
        </section>

        {!isAnalysisStarted ? (
          <FileUploadPanel
            onFileSelect={handleFileSelect}
            onStartAnalysis={handleStartAnalysis}
            selectedFileName={uploadedFileName}
            rowCount={uploadedRowCount}
            error={uploadError}
            isReady={!!analysis}
            isParsing={isParsing}
          />
        ) : (
          <section className="mt-6 grid items-stretch gap-6 lg:grid-cols-[minmax(260px,0.28fr)_minmax(0,1fr)] xl:gap-8">
            <FlightStatusPanel
              point={currentPoint ?? highestRiskPoint!}
              flight={approachFlightSummary.flight}
              stage={approachFlightSummary.stage}
              fallbackPoint={highestRiskPoint!}
            />

            <div className="space-y-6">
              <ApproachChart
                data={analysisData}
                replayToken={replayToken}
                onReplay={() => setReplayToken((value) => value + 1)}
                onCurrentPointChange={setCurrentPoint}
              />

              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {analysis?.keyMoments.map((item) => {
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
            </div>
          </section>
        )}

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

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, LogOut, RefreshCw } from 'lucide-react';
import ApproachChart from '../components/approach/ApproachChart';
import type { AverageDimension, TimeRange } from '../components/approach/approachAnalysisTypes';
import FileUploadPanel from '../components/approach/FileUploadPanel';
import FlightStatusPanel from '../components/approach/FlightStatusPanel';
import type { ApproachPoint } from '../data/mockApproachData';
import { exampleApproachMeta, exampleApproachRows } from '../data/exampleApproachDataset';
import {
  buildApproachDataFromUpload,
  buildApproachKeyMoments,
  type UploadedApproachAnalysis,
} from '../utils/buildApproachDataFromUpload';
import { parseFlightIndexFile } from '../utils/parseFlightIndexFile';
import { riskLevelMeta } from '../utils/riskLevel';

type AnalysisMeta = {
  flight: string;
  stage: string;
  sourceLabel: string;
};

const LANDING_REFERENCE_TIME = 60;

type ApproachAnimationPageProps = {
  onLogout: () => void;
};

function ApproachAnimationPage({ onLogout }: ApproachAnimationPageProps) {
  const [replayToken, setReplayToken] = useState(0);
  const [currentPoint, setCurrentPoint] = useState<ApproachPoint | null>(null);
  const [analysis, setAnalysis] = useState<UploadedApproachAnalysis | null>(null);
  const [analysisMeta, setAnalysisMeta] = useState<AnalysisMeta | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedRowCount, setUploadedRowCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isAnalysisStarted, setIsAnalysisStarted] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [averageDimension, setAverageDimension] = useState<AverageDimension>('month');
  const [timeRange, setTimeRange] = useState<TimeRange>([0, LANDING_REFERENCE_TIME]);

  const analysisData = analysis?.data ?? [];
  const availableTimeRange = useMemo<TimeRange>(() => [0, LANDING_REFERENCE_TIME], []);

  const visibleData = useMemo(() => {
    if (!analysisData.length) {
      return [];
    }

    const [startTime, endTime] = timeRange;
    return analysisData.filter((point) => point.time >= startTime && point.time <= endTime);
  }, [analysisData, timeRange]);

  const visibleKeyMoments = useMemo(() => buildApproachKeyMoments(visibleData), [visibleData]);

  const fallbackPoint = useMemo(() => {
    if (visibleData.length) {
      return visibleData.reduce((max, point) => (point.turbulenceIndex > max.turbulenceIndex ? point : max), visibleData[0]);
    }

    if (analysisData.length) {
      return analysisData.reduce((max, point) => (point.turbulenceIndex > max.turbulenceIndex ? point : max), analysisData[0]);
    }

    return null;
  }, [analysisData, visibleData]);

  useEffect(() => {
    if (analysisData.length) {
      setTimeRange([0, LANDING_REFERENCE_TIME]);
      setCurrentPoint(analysisData[0]);
    } else {
      setTimeRange([0, LANDING_REFERENCE_TIME]);
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
      setAnalysisMeta({
        flight: buildFlightLabel(parsed.fileName),
        stage: '进近 / 上传数据',
        sourceLabel: parsed.fileName,
      });
      setUploadedFileName(parsed.fileName);
      setUploadedRowCount(parsed.rows.length);
      setAverageDimension('month');
    } catch (error) {
      setAnalysis(null);
      setAnalysisMeta(null);
      setUploadedFileName(null);
      setUploadedRowCount(0);
      setUploadError(error instanceof Error ? error.message : '文件解析失败，请检查后重新上传。');
    } finally {
      setIsParsing(false);
    }
  };

  const handleStartAnalysis = () => {
    if (!analysis?.data.length) {
      return;
    }

    setCurrentPoint(analysis.data[0]);
    setReplayToken((value) => value + 1);
    setIsAnalysisStarted(true);
  };

  const handleUseExample = () => {
    const exampleAnalysis = buildApproachDataFromUpload(exampleApproachRows);
    setAnalysis(exampleAnalysis);
    setAnalysisMeta({
      flight: exampleApproachMeta.flight,
      stage: exampleApproachMeta.stage,
      sourceLabel: exampleApproachMeta.label,
    });
    setUploadedFileName(exampleApproachMeta.label);
    setUploadedRowCount(exampleApproachRows.length);
    setUploadError(null);
    setAverageDimension('month');
    setCurrentPoint(exampleAnalysis.data[0]);
    setReplayToken((value) => value + 1);
    setIsAnalysisStarted(true);
  };

  const handleResetUpload = () => {
    setAnalysis(null);
    setAnalysisMeta(null);
    setUploadedFileName(null);
    setUploadedRowCount(0);
    setUploadError(null);
    setCurrentPoint(null);
    setIsAnalysisStarted(false);
    setAverageDimension('month');
    setTimeRange([0, LANDING_REFERENCE_TIME]);
  };

  return (
    <div className="min-h-screen px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <header className="glass-nav mx-auto flex max-w-[1680px] flex-col gap-3 px-4 py-3 sm:px-5 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/20 bg-accent/10">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        </div>

        <div className="text-sm font-semibold text-foreground sm:text-base">单次进近风扰指数</div>

        <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
          <a href="/" className="action-secondary">
            <ArrowLeft size={16} />
            返回首页
          </a>
          <button type="button" onClick={onLogout} className="action-secondary">
            <LogOut size={16} />
            退出登录
          </button>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-[1680px]">
        <section className="surface-card px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-[3.1rem]">单次进近风扰指数</h1>

            {isAnalysisStarted && analysisMeta && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/82 px-4 py-2 text-sm text-muted-foreground">
                  <span>{analysisMeta.sourceLabel}</span>
                  <span className="font-semibold text-foreground">{uploadedRowCount} 行</span>
                </div>
                <button type="button" onClick={handleResetUpload} className="action-secondary h-10">
                  <RefreshCw size={15} />
                  重新上传
                </button>
              </div>
            )}
          </div>
        </section>

        {(!isAnalysisStarted || analysisMeta?.sourceLabel === exampleApproachMeta.label) && (
          <FileUploadPanel
            onFileSelect={handleFileSelect}
            onStartAnalysis={handleStartAnalysis}
            onUseExample={handleUseExample}
            selectedFileName={uploadedFileName}
            rowCount={uploadedRowCount}
            error={uploadError}
            isReady={!!analysis}
            isParsing={isParsing}
          />
        )}

        {isAnalysisStarted && (
          <section className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(300px,0.31fr)_minmax(0,0.69fr)] xl:gap-8">
            {fallbackPoint && analysisMeta && (
              <FlightStatusPanel
                point={currentPoint ?? fallbackPoint}
                fallbackPoint={fallbackPoint}
                flight={analysisMeta.flight}
                stage={analysisMeta.stage}
                averageDimension={averageDimension}
                onAverageDimensionChange={setAverageDimension}
                availableTimeRange={availableTimeRange}
                selectedTimeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />
            )}

            <div className="space-y-6">
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleKeyMoments.map((item) => {
                  const tone = riskLevelMeta[item.point.riskLevel];

                  return (
                    <article key={item.point.time} className="surface-card bg-white/82">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.pillClass}`}>
                            高风险-距离接地{LANDING_REFERENCE_TIME - item.point.time}秒
                          </span>
                          <div className="mt-1 text-sm text-muted-foreground">{item.summary}</div>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-muted-foreground">
                        指数 {item.point.turbulenceIndex} / 高度 {item.point.altitude} ft
                      </div>
                    </article>
                  );
                })}
              </section>

              <ApproachChart
                data={visibleData}
                replayToken={replayToken}
                onReplay={() => setReplayToken((value) => value + 1)}
                onCurrentPointChange={setCurrentPoint}
                averageDimension={averageDimension}
                landingReferenceTime={LANDING_REFERENCE_TIME}
                selectedTimeRange={timeRange}
              />
            </div>
          </section>
        )}

        <section className="mt-6 rounded-[28px] border border-amber-300/70 bg-amber-50/90 px-5 py-5 shadow-sm">
          <p className="text-sm leading-7 text-slate-700 sm:text-[15px]">
            当前页面为科研展示 Demo。示例数据、上传后派生的风向风速与置信区间均用于前端演示，不作为实际飞行安全决策依据。
          </p>
        </section>
      </main>
    </div>
  );
}

function buildFlightLabel(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, '').trim();
  return baseName || '上传航班';
}

export default ApproachAnimationPage;

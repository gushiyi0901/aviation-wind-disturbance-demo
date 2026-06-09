import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import ApproachChart from '../components/approach/ApproachChart';
import BrandLogos from '../components/BrandLogos';
import type { AverageDimension, TimeRange } from '../components/approach/approachAnalysisTypes';
import FileUploadPanel from '../components/approach/FileUploadPanel';
import FlightStatusPanel from '../components/approach/FlightStatusPanel';
import type { ApproachPoint } from '../data/mockApproachData';
import { exampleApproachMeta, exampleApproachRows } from '../data/exampleApproachDataset';
import {
  buildApproachDataFromUpload,
  type UploadedApproachAnalysis,
} from '../utils/buildApproachDataFromUpload';
import { parseFlightIndexFile } from '../utils/parseFlightIndexFile';

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
  const [timeRange, setTimeRange] = useState<TimeRange>([0, LANDING_REFERENCE_TIME]);
  const averageDimension: AverageDimension = 'month';

  const analysisData = analysis?.data ?? [];
  const availableTimeRange = useMemo<TimeRange>(() => [0, LANDING_REFERENCE_TIME], []);

  const visibleData = useMemo(() => {
    if (!analysisData.length) {
      return [];
    }

    const [startTime, endTime] = timeRange;
    return analysisData.filter((point) => point.time >= startTime && point.time <= endTime);
  }, [analysisData, timeRange]);

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
    setTimeRange([0, LANDING_REFERENCE_TIME]);
  };

  return (
    <div className="min-h-screen px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <header className="glass-nav mx-auto flex max-w-[1680px] flex-col gap-3 px-4 py-3 sm:px-5 md:flex-row md:items-center md:justify-between">
        <BrandLogos />

        <div className="text-2xl font-bold leading-tight text-foreground sm:text-3xl lg:text-4xl">单次航班进近降落风扰分析</div>

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
        {(!isAnalysisStarted || analysisMeta?.sourceLabel === exampleApproachMeta.label) && (
          <FileUploadPanel
            onFileSelect={handleFileSelect}
            onStartAnalysis={handleStartAnalysis}
            onUseExample={handleUseExample}
            onResetUpload={handleResetUpload}
            selectedFileName={uploadedFileName}
            rowCount={uploadedRowCount}
            error={uploadError}
            isReady={!!analysis}
            isParsing={isParsing}
          />
        )}

        {isAnalysisStarted && (
          <section className="mt-6 grid items-stretch gap-5 lg:grid-cols-[minmax(230px,0.2fr)_minmax(0,0.8fr)]">
            {fallbackPoint && analysisMeta && (
              <FlightStatusPanel
                point={currentPoint ?? fallbackPoint}
                fallbackPoint={fallbackPoint}
                data={visibleData}
                flight={analysisMeta.flight}
                stage={analysisMeta.stage}
                availableTimeRange={availableTimeRange}
                selectedTimeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />
            )}

            <div className="space-y-6">
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
            当前页面为科研展示 Demo。示例数据、上传后派生的风向风速与95%置信区间均用于前端演示，不作为实际飞行安全决策依据。
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

import { FileSpreadsheet, FileUp, Play, RefreshCw } from 'lucide-react';

type FileUploadPanelProps = {
  onFileSelect: (file: File | null) => void;
  onStartAnalysis: () => void;
  selectedFileName: string | null;
  rowCount: number;
  error: string | null;
  isReady: boolean;
  isParsing: boolean;
};

function FileUploadPanel({
  onFileSelect,
  onStartAnalysis,
  selectedFileName,
  rowCount,
  error,
  isReady,
  isParsing,
}: FileUploadPanelProps) {
  return (
    <section className="surface-card mt-6 px-6 py-7 sm:px-8">
      <div className="section-kicker bg-white/70">上传数据</div>
      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <div className="rounded-[30px] border border-dashed border-accent/30 bg-white/55 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">上传秒级风扰指数数据</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">
                生成单次进近过程的动态曲线
              </p>
            </div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <FileSpreadsheet size={22} />
            </div>
          </div>

          <label className="mt-6 block cursor-pointer rounded-[28px] border border-dashed border-border/80 bg-white/70 px-5 py-7 transition duration-200 hover:border-accent/30 hover:bg-white/80">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
            />

            <div className="flex flex-col items-center text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                <FileUp size={24} />
              </div>
              <div className="mt-4 text-lg font-semibold text-foreground">选择数据文件</div>
              <div className="mt-2 text-sm text-muted-foreground">支持 CSV / XLSX / XLS</div>
            </div>
          </label>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={onStartAnalysis} disabled={!isReady || isParsing} className="action-primary disabled:cursor-not-allowed disabled:opacity-60">
              <Play size={16} />
              开始动态分析
            </button>

            {selectedFileName && (
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/80 px-4 py-2 text-sm text-muted-foreground">
                <RefreshCw size={14} className={isParsing ? 'animate-spin' : ''} />
                {selectedFileName}
                {rowCount > 0 && <span className="font-semibold text-foreground">{rowCount} 条</span>}
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-[22px] border border-[#d9b7a8] bg-[#f8ebe4] px-4 py-3 text-sm text-[#8d4a47]">
              {error}
            </div>
          )}
        </div>

        <div className="self-start">
          <article className="rounded-[24px] border border-border/75 bg-white/68 p-4 sm:p-4.5">
            <div className="text-sm font-semibold text-foreground">示例数据格式</div>
            <div className="mt-3 rounded-[18px] bg-[#f8f2e8] p-3 text-sm text-foreground">
              <div className="font-mono text-[12px] leading-6">
                <div>时间,风扰指数</div>
                <div>0,28</div>
                <div>1,30.1</div>
                <div>2,32</div>
              </div>
            </div>
            <div className="mt-3 space-y-1.5 text-xs leading-6 text-muted-foreground">
              <div>时间：以秒为单位</div>
              <div>风扰指数：0–100</div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default FileUploadPanel;

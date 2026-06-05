import { Download, FileSpreadsheet, FileUp, Play, RefreshCw } from 'lucide-react';

type FileUploadPanelProps = {
  onFileSelect: (file: File | null) => void;
  onStartAnalysis: () => void;
  onUseExample: () => void;
  onResetUpload?: () => void;
  selectedFileName: string | null;
  rowCount: number;
  error: string | null;
  isReady: boolean;
  isParsing: boolean;
};

function FileUploadPanel({
  onFileSelect,
  onStartAnalysis,
  onUseExample,
  onResetUpload,
  selectedFileName,
  rowCount,
  error,
  isReady,
  isParsing,
}: FileUploadPanelProps) {
  return (
    <section className="surface-card mt-6 px-6 py-7 sm:px-8">
      <div className="rounded-[30px] border border-dashed border-accent/30 bg-white/58 p-5 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <FileSpreadsheet size={21} />
            </div>
            <h2 className="text-[1.65rem] font-bold leading-tight text-foreground">上传进近风扰指数数据</h2>
          </div>
          <a
            href="/approach_index_template.csv"
            download
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-border/80 bg-white/84 px-5 text-sm font-semibold text-foreground transition hover:-translate-y-0.5"
          >
            <Download size={15} />
            下载模板
          </a>
        </div>

        <label className="mt-5 block cursor-pointer rounded-[28px] border border-dashed border-border/80 bg-white/74 px-5 py-8 transition duration-200 hover:border-accent/30 hover:bg-white/84 sm:py-9">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
          />

          <div className="flex flex-col items-center text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
              <FileUp size={25} />
            </div>
            <div className="mt-3 text-lg font-semibold text-foreground">选择 CSV / Excel 文件</div>
            <div className="mt-1.5 text-sm text-muted-foreground">上传成功后即可进入动态分析界面</div>
          </div>
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onStartAnalysis}
            disabled={!isReady || isParsing}
            className="action-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play size={16} />
            开始分析
          </button>

          {selectedFileName && (
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-border/80 bg-white/82 px-4 py-2 text-sm text-muted-foreground">
              <RefreshCw size={14} className={isParsing ? 'animate-spin' : ''} />
              <span className="truncate">{selectedFileName}</span>
              {rowCount > 0 && <span className="font-semibold text-foreground">{rowCount} 行</span>}
            </div>
          )}

          {selectedFileName && onResetUpload && (
            <button type="button" onClick={onResetUpload} className="action-secondary h-10">
              <RefreshCw size={15} />
              重新上传
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-[22px] border border-[#d9b7a8] bg-[#f8ebe4] px-4 py-3 text-sm text-[#8d4a47]">
            {error}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-[24px] border border-border/70 bg-white/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-base font-semibold text-foreground">示例演示</div>
          <div className="mt-1 text-sm text-muted-foreground">使用内置示例数据进入分析界面</div>
        </div>
        <button type="button" onClick={onUseExample} className="action-primary h-11">
          <Play size={16} />
          展开示例演示
        </button>
      </div>
    </section>
  );
}

export default FileUploadPanel;

import { Download, FileSpreadsheet, FileUp, Play, RefreshCw } from 'lucide-react';

type FileUploadPanelProps = {
  onFileSelect: (file: File | null) => void;
  onStartAnalysis: () => void;
  onUseExample: () => void;
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
  selectedFileName,
  rowCount,
  error,
  isReady,
  isParsing,
}: FileUploadPanelProps) {
  return (
    <section className="surface-card mt-6 px-6 py-7 sm:px-8">
      <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        <div className="flex h-full flex-col rounded-[30px] border border-dashed border-accent/30 bg-white/58 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-[1.85rem] font-bold text-foreground">上传进近风扰指数数据</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">
                当前模板按距接地时间横向展开，每列为一个采样点，风扰指数范围为 0-1
              </p>
            </div>
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <FileSpreadsheet size={22} />
            </div>
          </div>

          <label className="mt-6 block cursor-pointer rounded-[28px] border border-dashed border-border/80 bg-white/74 px-5 py-8 transition duration-200 hover:border-accent/30 hover:bg-white/84">
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
              <div className="mt-4 text-lg font-semibold text-foreground">选择 CSV / Excel 文件</div>
              <div className="mt-2 text-sm text-muted-foreground">上传成功后即可进入动态分析界面</div>
            </div>
          </label>

          <div className="mt-4 grid gap-3 rounded-[24px] border border-border/70 bg-white/72 p-4 text-sm text-muted-foreground sm:grid-cols-2">
            <div>支持格式：CSV / XLSX / XLS</div>
            <div>至少 5 个采样点</div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
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
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/82 px-4 py-2 text-sm text-muted-foreground">
                <RefreshCw size={14} className={isParsing ? 'animate-spin' : ''} />
                <span className="truncate">{selectedFileName}</span>
                {rowCount > 0 && <span className="font-semibold text-foreground">{rowCount} 行</span>}
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-[22px] border border-[#d9b7a8] bg-[#f8ebe4] px-4 py-3 text-sm text-[#8d4a47]">
              {error}
            </div>
          )}
        </div>

        <article className="flex h-full flex-col rounded-[28px] border border-border/75 bg-white/64 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Template</div>
              <div className="mt-2 text-lg font-semibold text-foreground">数据模板预览</div>
            </div>
            <a
              href="/approach_index_template.csv"
              download
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-border/80 bg-white/84 px-4 text-sm font-semibold text-foreground transition hover:-translate-y-0.5"
            >
              <Download size={15} />
              下载模板
            </a>
          </div>

          <div className="mt-4 overflow-hidden rounded-[22px] border border-border/75 bg-[#f8f5ef]">
            <table className="w-full border-collapse text-left text-[13px] text-foreground sm:text-sm">
              <thead className="bg-[#efe7da] text-muted-foreground">
                <tr>
                  {templateColumns.map((column) => (
                    <th key={column || 'blank-header'} className="border-b border-white/80 px-3 py-3 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {templatePreviewRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="odd:bg-white/55">
                    {row.map((cell, cellIndex) => (
                      <td key={`${row[0]}-${cellIndex}`} className="border-b border-white/70 px-3 py-3 font-mono text-[12px] sm:text-[13px]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-2 rounded-[22px] border border-border/70 bg-white/74 p-4 text-sm text-muted-foreground">
            {fieldDescriptions.map((item) => (
              <div key={item.field} className="grid grid-cols-[92px_minmax(0,1fr)] gap-3">
                <span className="font-mono text-foreground">{item.field}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </article>
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

const templateColumns = ['距接地时间/秒', '60', '59', '58', '57', '56'];

const templatePreviewRows = [
  ['flightNo', 'MU2431', 'MU2431', 'MU2431', 'MU2431', 'MU2431'],
  ['phase', 'approach', 'approach', 'approach', 'approach', 'approach'],
  ['index', '0.28', '0.30', '0.32', '0.33', '0.35'],
  ['ciLower', '0.24', '0.27', '0.28', '0.30', '0.31'],
  ['ciUpper', '0.32', '0.34', '0.36', '0.37', '0.39'],
];

const fieldDescriptions = [
  { field: 'flightNo', label: '航班号，每列对应一个样本' },
  { field: 'phase', label: '阶段，每列对应一个样本' },
  { field: 'index', label: '风扰指数，范围 0-1' },
  { field: 'ciLower', label: '置信下界，范围 0-1' },
  { field: 'ciUpper', label: '置信上界，范围 0-1' },
];

export default FileUploadPanel;

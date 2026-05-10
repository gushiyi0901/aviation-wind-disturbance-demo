export type ParsedFlightIndexRow = {
  time: number;
  index: number;
};

type ParseFlightIndexFileResult = {
  rows: ParsedFlightIndexRow[];
  fileName: string;
};

declare global {
  interface Window {
    XLSX?: {
      read: (data: ArrayBuffer | string, options: { type: 'array' | 'string'; raw?: boolean }) => {
        SheetNames: string[];
        Sheets: Record<string, unknown>;
      };
      utils: {
        sheet_to_json: (sheet: unknown, options: { header: 1; raw: true; defval: string }) => unknown[][];
      };
    };
  }
}

const SUPPORTED_EXTENSIONS = ['csv', 'xlsx', 'xls'];
const TIME_HEADERS = new Set(['time', '时间', '秒数', 'second', 'seconds']);
const INDEX_HEADERS = new Set(['index', '风扰指数', 'riskindex', 'turbulenceindex']);

export async function parseFlightIndexFile(file: File): Promise<ParseFlightIndexFileResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    throw new Error('文件格式暂不支持，请上传 CSV 或 Excel。');
  }

  const matrix = extension === 'csv' ? parseCsvText(await file.text()) : await parseExcelFile(file);
  const rows = normalizeMatrixToRows(matrix);

  if (rows.length < 5) {
    throw new Error('有效数据过少，请至少提供 5 个采样点。');
  }

  return {
    rows,
    fileName: file.name,
  };
}

async function parseExcelFile(file: File): Promise<unknown[][]> {
  await ensureXlsxLoaded();
  if (!window.XLSX) {
    throw new Error('Excel 解析组件加载失败，请稍后重试。');
  }

  const workbook = window.XLSX.read(await file.arrayBuffer(), { type: 'array', raw: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('文件为空，请检查后重新上传。');
  }

  const matrix = window.XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
    header: 1,
    raw: true,
    defval: '',
  });

  return matrix;
}

async function ensureXlsxLoaded() {
  if (window.XLSX) {
    return;
  }

  const scriptId = 'sheetjs-xlsx-script';
  const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (existing) {
    await waitForScript(existing);
    return;
  }

  const script = document.createElement('script');
  script.id = scriptId;
  script.src = '/vendor/xlsx.full.min.js';
  script.async = true;
  document.body.appendChild(script);
  await waitForScript(script);
}

function waitForScript(script: HTMLScriptElement) {
  return new Promise<void>((resolve, reject) => {
    if (window.XLSX) {
      resolve();
      return;
    }

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Excel 解析组件加载失败，请稍后重试。'));
  });
}

function parseCsvText(text: string): unknown[][] {
  const normalized = text.replace(/^\uFEFF/, '');
  const lines = normalized.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (!lines.length) {
    throw new Error('文件为空，请检查后重新上传。');
  }

  return lines.map(parseCsvLine);
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (insideQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === ',' && !insideQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function normalizeMatrixToRows(matrix: unknown[][]): ParsedFlightIndexRow[] {
  const meaningfulRows = matrix
    .map((row) => row.map((cell) => (typeof cell === 'string' ? cell.trim() : cell)))
    .filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''));

  if (!meaningfulRows.length) {
    throw new Error('文件为空，请检查后重新上传。');
  }

  const firstRow = meaningfulRows[0];
  const hasHeaderLikeCell = firstRow.some((cell) => typeof cell === 'string' && !isNumericString(cell));

  let timeColumn = 0;
  let indexColumn = 1;
  let dataRows = meaningfulRows;

  if (hasHeaderLikeCell) {
    const normalizedHeaders = firstRow.map((cell) => normalizeHeader(cell));
    const detectedTimeColumn = normalizedHeaders.findIndex((header) => TIME_HEADERS.has(header));
    const detectedIndexColumn = normalizedHeaders.findIndex((header) => INDEX_HEADERS.has(header));

    if (detectedTimeColumn >= 0 && detectedIndexColumn >= 0) {
      timeColumn = detectedTimeColumn;
      indexColumn = detectedIndexColumn;
      dataRows = meaningfulRows.slice(1);
    } else if (firstRow.length >= 2) {
      timeColumn = 0;
      indexColumn = 1;
      dataRows = meaningfulRows.slice(1);
    } else {
      throw new Error('未识别到时间和风扰指数列。');
    }
  } else if (firstRow.length < 2) {
    throw new Error('未识别到时间和风扰指数列。');
  }

  const rows: ParsedFlightIndexRow[] = [];

  for (const row of dataRows) {
    const rawTime = row[timeColumn];
    const rawIndex = row[indexColumn];

    if (String(rawTime ?? '').trim() === '' && String(rawIndex ?? '').trim() === '') {
      continue;
    }

    const time = Number(rawTime);
    const index = Number(rawIndex);

    if (!Number.isFinite(time)) {
      throw new Error('时间列存在无效数据，请检查后重新上传。');
    }

    if (!Number.isFinite(index)) {
      throw new Error('风扰指数列存在无效数据，请检查后重新上传。');
    }

    rows.push({
      time,
      index: clamp(index, 0, 100),
    });
  }

  if (!rows.length) {
    throw new Error('文件为空，请检查后重新上传。');
  }

  return rows.sort((left, right) => left.time - right.time);
}

function normalizeHeader(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
}

function isNumericString(value: string) {
  return value.trim() !== '' && Number.isFinite(Number(value));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

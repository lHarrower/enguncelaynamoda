import fs from 'fs';
import path from 'path';

function readJSON<T = any>(p: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8')) as T;
  } catch {
    return null;
  }
}

function readFirstJSON<T = any>(paths: string[]): T | null {
  for (const p of paths) {
    const data = readJSON<T>(p);
    if (data) return data;
  }
  return null;
}

function readText(p: string): string | null {
  try {
    const buf = fs.readFileSync(p);
    if (!buf || buf.length === 0) return '';
    // BOM detection
    if (buf.length >= 2 && buf[0] === 0xFF && buf[1] === 0xFE) {
      // UTF-16 LE with BOM
      return buf.slice(2).toString('utf16le');
    }
    if (buf.length >= 2 && buf[0] === 0xFE && buf[1] === 0xFF) {
      // UTF-16 BE with BOM -> swap to LE then decode
      const swapped = Buffer.allocUnsafe(buf.length - 2);
      for (let i = 2, j = 0; i + 1 < buf.length; i += 2, j += 2) {
        swapped[j] = buf[i + 1]!;
        swapped[j + 1] = buf[i]!;
      }
      return swapped.toString('utf16le');
    }
    // Heuristic: many zero bytes implies UTF-16 without BOM
    const sampleLen = Math.min(buf.length, 4096);
    let zeroCount = 0;
    for (let i = 0; i < sampleLen; i++) if (buf[i] === 0) zeroCount++;
    if (zeroCount > sampleLen * 0.1) {
      // assume UTF-16 LE without BOM
      return buf.toString('utf16le');
    }
    // Default to UTF-8
    return buf.toString('utf8');
  } catch {
    return null;
  }
}

function findNumberInText(text: string, regex: RegExp): number | null {
  const m = text.match(regex);
  if (m && m[1]) {
    const n = Number(m[1]);
    return isNaN(n) ? null : n;
    
  }
  return null;
}

function formatPct(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return 'N/A';
  return `${n.toFixed(2)}%`;
}

function clamp(n: any, d: number): number | null {
  if (typeof n !== 'number' || isNaN(n)) return null;
  return Number(n.toFixed(d));
}

 function parseTsErrorCount(tsReportPath: string): number | null {
   const txt = readText(tsReportPath);
   if (!txt) return null;
   // Strip ANSI color codes to avoid patterns like "\x1b[31merror TS..."
   const clean = txt.replace(/\x1B\[[0-9;]*m/g, '');
   // Debug snapshot
   try {
     const head = clean.slice(0, 200).replace(/\n/g, '\\n');
     const hasErrorTS = /error\s+TS\d+:/i.test(clean);
     const tsOnly = /TS\d+:/g;
     const tsOnlyCount = (clean.match(tsOnly) || []).length;
     // Remove noisy debug logs after verification
     // console.log(`[DEBUG:TS] len=${clean.length} head='${head}' hasErrorTS=${hasErrorTS} tsOnlyCount=${tsOnlyCount}`);
   } catch {}
   // 1) Explicit summary line, e.g., "Found 38 errors"
   const found = findNumberInText(clean, /Found\s+(\d+)\s+errors?/i);
   if (found !== null) return found;
   // 2) Robust line-by-line counting for typical tsc formats (after stripping ANSI)
   const lineRegex = /error\s+TS\d+:/i;
   let lineCount = 0;
   const lines = clean.split(/\r?\n/);
   for (const line of lines) {
     if (lineRegex.test(line)) lineCount++;
   }
   // 3) Fallback: global match across the whole text
   const globalMatches = clean.match(/error\s+TS\d+:/gi);
   const globalCount = globalMatches ? globalMatches.length : 0;
   // console.log(`[DEBUG:TS] lineCount=${lineCount} globalCount=${globalCount}`);
   // Prefer the larger of the two to avoid undercount in odd encodings
   const count = Math.max(lineCount, globalCount);
   return count;
 }

function getPaths() {
  const root = process.cwd();
  const outDir = path.join(root, 'audit', 'out');
  return {
    root,
    outDir,
    summaryMd: path.join(outDir, 'SUMMARY.md'),
    masterJson: path.join(outDir, 'master-report.json'),
    trendJson: path.join(outDir, 'trend.json'),
    // Prefer ops/reports/jest.json; fallback to project root
    jestJsonOpsReports: path.join(root, 'ops', 'reports', 'jest.json'),
    jestJsonRoot: path.join(root, 'jest.json'),
    // Prefer audit/out/static/eslint.json; fallback to ops/reports/eslint.json
    eslintJson: path.join(outDir, 'static', 'eslint.json'),
    eslintJsonOpsReports: path.join(root, 'ops', 'reports', 'eslint.json'),
    perfJson: path.join(outDir, 'perf', 'perf.json'),
    // TS rapor yolları (birden fazla olası konum)
    tsReportLatest: path.join(root, 'ops', 'reports', 'tsc-report-latest.txt'),
    tsReportAlt1: path.join(root, 'ops', 'reports', 'tsc-report.txt'),
    tsReportAlt2: path.join(root, 'tsc-report-latest.txt'),
    tsReportAlt3: path.join(root, 'tsc-output.txt'),
    tsReportAlt4: path.join(root, 'tsc-report.txt'),
    gercekRapor: path.join(root, 'GERCEK_DURUM_RAPORU.md'),
  };
}

function deriveMetrics() {
  const p = getPaths();

  // Tests (prefer ops/reports, then root)
  const jestRoot = readFirstJSON<any>([p.jestJsonOpsReports, p.jestJsonRoot]);
  const totalTests = jestRoot?.numTotalTests ?? null;
  const failedTests = jestRoot?.numFailedTests ?? null;
  const passedTests = jestRoot?.numPassedTests ?? null;
  const totalSuites = jestRoot?.numTotalTestSuites ?? null;

  // Coverage (use master-report.json authoritative totals)
  const master = readJSON<any>(p.masterJson);
  const coverageStatements = clamp(master?.coverage?.total?.statements?.pct, 2);
  const coverageBranches = clamp(master?.coverage?.total?.branches?.pct, 2);
  const coverageLines = clamp(master?.coverage?.total?.lines?.pct, 2);
  const coverageFunctions = clamp(master?.coverage?.total?.functions?.pct, 2);

  // ESLint (try audit/out/static first, then ops/reports)
  const eslint = readFirstJSON<any>([p.eslintJson, p.eslintJsonOpsReports]);
  let eslintErrors: number | null = null;
  let eslintWarnings: number | null = null;
  if (eslint && typeof eslint === 'object') {
    if (Array.isArray(eslint)) {
      let e = 0, w = 0;
      for (const f of eslint) {
        e += (f?.errorCount ?? 0);
        w += (f?.warningCount ?? 0);
      }
      eslintErrors = e; eslintWarnings = w;
    } else if (Array.isArray((eslint as any).results)) {
      let e = 0, w = 0;
      for (const r of (eslint as any).results) {
        e += (r?.errorCount ?? 0);
        w += (r?.warningCount ?? 0);
      }
      // Some formats also have top-level counts
      eslintErrors = (eslint as any).errorCount ?? e;
      eslintWarnings = (eslint as any).warningCount ?? w;
    } else if ('errorCount' in (eslint as any) || 'warningCount' in (eslint as any)) {
      eslintErrors = (eslint as any).errorCount ?? null;
      eslintWarnings = (eslint as any).warningCount ?? null;
    } else if ('summary' in (eslint as any)) {
      eslintErrors = (eslint as any).summary?.errors ?? null;
      eslintWarnings = (eslint as any).summary?.warnings ?? null;
    }
  }
  // Fallback to master-report.json quality for errors if still null
  if (eslintErrors == null) {
    eslintErrors = master?.quality?.eslintErrors ?? null;
  }

  // TypeScript errors — prefer ops/reports first, then fallbacks under project root
  const tsPreferredPath = firstExistingPath([
    p.tsReportLatest,
    p.tsReportAlt1,
    p.tsReportAlt2,
    p.tsReportAlt3,
    p.tsReportAlt4,
  ]);
  const tsErrors = tsPreferredPath ? parseTsErrorCount(tsPreferredPath) : null;
  // console.log(`[DEBUG] TS path: ${tsPreferredPath ?? 'N/A'} | errors: ${tsErrors ?? 'N/A'}`);

  // Perf samples (prefer perf.json, fallback to master-report.json)
  const perf = readJSON<any>(p.perfJson);
  const perfSamples = (perf?.startup?.samples ?? master?.perf?.startup?.samples ?? 0);

  return {
    totalTests, failedTests, passedTests, totalSuites,
    coverageStatements, coverageBranches, coverageLines, coverageFunctions,
    eslintErrors, eslintWarnings, tsErrors, perfSamples,
  };
}

function decideGoNoGo(m: ReturnType<typeof deriveMetrics>) {
  const reasons: string[] = [];
  const coverageOk = (m.coverageStatements ?? 0) >= 85 && (m.coverageLines ?? 0) >= 85 && (m.coverageFunctions ?? 0) >= 80 && (m.coverageBranches ?? 0) >= 70;
  if (!coverageOk) {
    reasons.push('Coverage eşikleri aşağıda (Statements>=85, Lines>=85, Functions>=80, Branches>=70)');
  }
  if ((m.tsErrors ?? 0) > 0) {
    reasons.push(`${m.tsErrors} TypeScript hatası`);
  }
  if ((m.eslintErrors ?? 0) > 0) {
    reasons.push(`${m.eslintErrors} ESLint hatası`);
  }
  if ((m.failedTests ?? 0) > 0) {
    reasons.push(`${m.failedTests} başarısız test`);
  }
  const go = reasons.length === 0;
  return { go, reasons };
}

function buildSummaryBlock() {
  const p = getPaths();
  const m = deriveMetrics();
  const decision = decideGoNoGo(m);
  const now = new Date().toISOString();

  const lines: string[] = [];
  lines.push('<!-- AUTO-SUMMARY:START -->');
  lines.push(`Durum Özeti (otomatik) — ${now}`);
  lines.push('');
  lines.push(`Karar: ${decision.go ? 'GO' : 'NO-GO'}`);
  if (!decision.go) {
    lines.push(`Nedenler: ${decision.reasons.join(' | ')}`);
  }
  lines.push('');
  lines.push('- Testler: ' + (
    m.totalTests != null && m.passedTests != null && m.failedTests != null
      ? `${m.passedTests}/${m.totalTests} PASS, Hatalı: ${m.failedTests} (Süit: ${m.totalSuites ?? 'N/A'})`
      : 'N/A'
  ));
  lines.push(`- Coverage: Statements ${formatPct(m.coverageStatements)} | Lines ${formatPct(m.coverageLines)} | Functions ${formatPct(m.coverageFunctions)} | Branches ${formatPct(m.coverageBranches)}`);
  lines.push(`- TypeScript Hataları: ${m.tsErrors ?? 'N/A'}`);
  lines.push(`- ESLint: Hata ${m.eslintErrors ?? 'N/A'}, Uyarı ${m.eslintWarnings ?? 'N/A'}`);
  lines.push(`- Performans Örnekleri: ${m.perfSamples ?? 0}`);
  lines.push('');
  lines.push('Kanıtlar:');
  lines.push(`- Özet: audit/out/SUMMARY.md`);
  lines.push(`- Trend: audit/out/trend.json`);
  lines.push(`- Jest: ops/reports/jest.json`);
  lines.push(`- ESLint: audit/out/static/eslint.json (veya ops/reports/eslint.json)`);
  lines.push(`- TS Derleme: ops/reports/tsc-report-latest.txt`);
  lines.push(`- Perf: audit/out/perf/perf.json`);
  lines.push('<!-- AUTO-SUMMARY:END -->');

  return lines.join('\n');
}

function upsertAutoSummary() {
  const p = getPaths();
  const block = buildSummaryBlock();

  let md = readText(p.gercekRapor);
  if (!md) {
    console.error('GERCEK_DURUM_RAPORU.md bulunamadı. Yeni dosya oluşturulacak.');
    md = '# GERÇEK DURUM RAPORU\n\n' + block + '\n';
    fs.writeFileSync(p.gercekRapor, md, 'utf8');
    return;
  }

  const start = '<!-- AUTO-SUMMARY:START -->';
  const end = '<!-- AUTO-SUMMARY:END -->';
  if (md.includes(start) && md.includes(end)) {
    const newMd = md.replace(new RegExp(`${start}[\\s\\S]*?${end}`, 'm'), block);
    fs.writeFileSync(p.gercekRapor, newMd, 'utf8');
  } else {
    // Insert after top title if exists, else prepend
    const lines = md.split('\n');
    let inserted = false;
    for (let i = 0; i < Math.min(lines.length, 30); i++) {
      const line = lines[i] ?? '';
      if (/^#\s+/.test(line)) {
        // after first heading block
        let j = i + 1;
        while (j < lines.length && (lines[j] ?? '').trim() === '') j++;
        lines.splice(j, 0, '', block, '');
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      lines.unshift(block, '');
    }
    fs.writeFileSync(p.gercekRapor, lines.join('\n'), 'utf8');
  }

  console.log('AUTO-SUMMARY güncellendi.');
}

upsertAutoSummary();

function firstExistingPath(paths: string[]): string | null {
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {}
  }
  return null;
}
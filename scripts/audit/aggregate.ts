#!/usr/bin/env ts-node
/**
 * Aggregate disparate audit JSON outputs into a unified master-report.json and SUMMARY.md
 * Contract (extendable): each tool writes JSON into audit/out/**
 */
import fs from 'fs';
import path from 'path';

interface Finding {
  id: string; // unique tool-provided or synthesized
  category: string; // security|quality|performance|a11y|dependency|other
  severity: string; // info|low|medium|high|critical
  score?: number; // numeric risk score if available
  file?: string;
  line?: number;
  description: string;
  remediation?: string;
  sourceTool: string;
  raw?: Record<string, unknown>; // Raw tool output data
  accepted?: boolean; // risk acceptance applied
}

interface Thresholds {
  bundle: { androidReleaseKb: number; iosReleaseKb: number; deltaMaxPercent: number };
  performance: { startupP50Ms: number; startupP95Ms: number; jsFrameDropPctMax: number };
  a11y: { labelCoverageMin: number; contrastIssuesMax: number };
  quality: { eslintErrorMax: number; deadExportsMax: number };
  security: { criticalVulnMax: number; highVulnMax: number };
  stability: { crashFreeMinPct: number };
  coverage?: {
    statementsMin: number;
    branchesMin: number;
    linesMin: number;
    functionsMin: number;
    mutationScoreMin: number;
  };
}

// Simple unsafe 'any' usage scan (source-level) excluding *.d.ts and config scripts
function scanUnsafeAny(root: string): { unsafeAnyCount: number; files: Record<string, number> } {
  const targetDir = path.join(root, 'src');
  const files: string[] = [];
  (function walk(dir: string) {
    if (!fs.existsSync(dir)) {
      return;
    }
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.d.ts')) {
        files.push(full);
      }
    }
  })(targetDir);
  const anyPattern = /:\s*any(\W|$)|<any>|as\s+any/g; // colon any, generic any, assertion as any
  const fileCounts: Record<string, number> = {};
  let total = 0;
  for (const f of files) {
    try {
      const content = fs.readFileSync(f, 'utf8');
      let m: RegExpExecArray | null;
      let c = 0;
      while ((m = anyPattern.exec(content))) {
        c++;
      }
      if (c > 0) {
        fileCounts[path.relative(root, f)] = c;
        total += c;
      }
    } catch {
      /* ignore */
    }
  }
  return { unsafeAnyCount: total, files: fileCounts };
}

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'audit', 'out');
const MASTER_JSON = path.join(OUT_DIR, 'master-report.json');
const SUMMARY_MD = path.join(OUT_DIR, 'SUMMARY.md');
const THRESHOLDS_PATH = path.join(ROOT, 'config', 'audit', 'thresholds.json');
const ESLINT_BASELINE_PATH = path.join(ROOT, 'config', 'audit', 'baseline', 'eslint-baseline.json');

function readJSONSafe(p: string): any | undefined {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return undefined;
  }
}

function collectFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const acc: string[] = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      acc.push(...collectFiles(full));
    } else if (entry.endsWith('.json') && !entry.startsWith('master-report')) {
      acc.push(full);
    }
  }
  return acc;
}

function normalise(): Finding[] {
  const seenVuln = new Set<string>();
  const files = collectFiles(OUT_DIR);
  const findings: Finding[] = [];
  for (const file of files) {
    const data = readJSONSafe(file);
    if (!data) {
      continue;
    }
    const tool = path.basename(file);
    // Heuristics per known tool (extend as needed)
    if (tool.startsWith('eslint')) {
      for (const res of data) {
        for (const msg of res.messages || []) {
          findings.push({
            id: `eslint:${msg.ruleId}:${res.filePath}:${msg.line}`,
            category: 'quality',
            severity: msg.severity === 2 ? 'medium' : 'low',
            file: res.filePath,
            line: msg.line,
            description: `${msg.ruleId} - ${msg.message}`,
            sourceTool: 'eslint',
            raw: msg,
          });
        }
      }
    } else if (tool.includes('semgrep')) {
      const issues = data.results || [];
      for (const r of issues) {
        findings.push({
          id: `semgrep:${r.check_id}:${r.path?.start?.line || r.path?.end?.line || r.path}`,
          category: r.extra?.metadata?.category || 'security',
          severity: (r.extra?.severity || 'medium').toLowerCase(),
          file: r.path,
          line: r.start?.line || r.end?.line,
          description: r.extra?.message || r.check_id,
          remediation: r.extra?.metadata?.fix || undefined,
          sourceTool: 'semgrep',
          raw: r,
        });
      }
    } else if (tool.includes('deadcode') || tool.includes('ts-prune')) {
      if (Array.isArray(data)) {
        for (const item of data) {
          findings.push({
            id: `deadcode:${item.name || item.identifier}`,
            category: 'quality',
            severity: 'info',
            file: item.file || item.path,
            description: `Unused export ${item.name || item.identifier}`,
            sourceTool: 'ts-prune',
            raw: item,
          });
        }
      }
    } else if (tool.includes('osv') || tool.includes('snyk')) {
      const vulns = data.vulnerabilities || data.issues || [];
      for (const v of vulns) {
        const idRaw = v.id || v.cve || v.identifier || `${v.package}:${v.title}`;
        const globalId = `${v.package || v.module || 'pkg'}::${idRaw}`;
        if (seenVuln.has(globalId)) {
          continue;
        } // dedupe cross-tool
        seenVuln.add(globalId);
        let sev: string = (v.severity || '').toString().toLowerCase();
        const cvss = v.cvssScore || v.cvss || v.cvss_v3 || v.cvss_v2;
        if (!sev && typeof cvss === 'number') {
          sev = cvss >= 9 ? 'critical' : cvss >= 7 ? 'high' : cvss >= 4 ? 'medium' : 'low';
        } else if (sev.match(/^[0-9.]+$/)) {
          // numeric severity string
          const num = parseFloat(sev);
          sev = num >= 9 ? 'critical' : num >= 7 ? 'high' : num >= 4 ? 'medium' : 'low';
        }
        if (sev.includes('crit')) {
          sev = 'critical';
        }
        const source = tool.includes('snyk') ? 'snyk' : 'osv';
        findings.push({
          id: `dep:${idRaw}`,
          category: 'security',
          severity: sev || 'medium',
          description: `${v.package || v.module} - ${v.title || idRaw}`,
          remediation: v.fixVersion ? `Update to ${v.fixVersion}` : undefined,
          sourceTool: source,
          raw: v,
        });
      }
    } else if (tool.includes('licenses')) {
      if (Array.isArray(data)) {
        data.forEach((lic: any, idx: number) => {
          findings.push({
            id: `license:${lic.package}:${idx}`,
            category: 'dependency',
            severity: lic.status === 'deny' ? 'high' : 'low',
            description: `Non-allowlisted license ${lic.license} for ${lic.package} (status=${lic.status})`,
            sourceTool: 'license-scan',
            raw: lic,
          });
        });
      }
    } else if (tool.includes('perf')) {
      // performance metrics -> convert threshold breaches into findings later
    } else if (tool.includes('a11y')) {
      // accessibility metrics placeholder
    } else if (tool.includes('rls')) {
      const rlsFinds = data.findings || [];
      for (const r of rlsFinds) {
        findings.push({
          id: r.id,
          category: 'security',
          severity: r.severity || 'medium',
          description: `RLS: ${r.description}`,
          sourceTool: 'rls-tests',
          raw: r,
        });
      }
    } else if (tool.includes('secrets')) {
      const leaks = data.findings || data.secrets || [];
      for (const s of leaks) {
        findings.push({
          id: `secret:${s.rule_id || s.id}:${s.file || s.path}`,
          category: 'security',
          severity: 'high',
          file: s.file || s.path,
          description: `Potential secret: ${s.description || s.rule || s.rule_id}`,
          sourceTool: 'secrets-scan',
          raw: s,
        });
      }
    } else {
      // Generic fallback (array of objects)
      if (Array.isArray(data)) {
        data.forEach((d, idx) =>
          findings.push({
            id: `${tool}:${idx}`,
            category: 'other',
            severity: 'info',
            description: JSON.stringify(d).slice(0, 140),
            sourceTool: tool,
            raw: d,
          }),
        );
      }
    }
  }
  return findings;
}

function dedup(findings: Finding[]): Finding[] {
  const map = new Map<string, Finding>();
  for (const f of findings) {
    const key = `${f.sourceTool}:${f.file || ''}:${f.line || ''}:${f.id}`;
    if (!map.has(key)) {
      map.set(key, f);
    }
  }
  return [...map.values()];
}

function severityRank(sev: string): number {
  switch (sev) {
    case 'critical':
      return 5;
    case 'high':
      return 4;
    case 'medium':
      return 3;
    case 'low':
      return 2;
    default:
      return 1;
  }
}

function riskScore(f: Finding): number {
  const base = severityRank(f.severity);
  return base * (f.category === 'security' ? 2 : 1);
}

function loadEslintBaseline(): { total?: number } {
  const data = readJSONSafe(ESLINT_BASELINE_PATH);
  if (data && typeof data.total === 'number') {
    return { total: data.total };
  }
  return {};
}

function summarise(findings: Finding[], thresholds: Thresholds) {
  // Load risk acceptance config (optional)
  interface Acceptance {
    idPattern: string;
    expires?: string;
    reason?: string;
  }
  const acceptancePath = path.join('config', 'audit', 'risk-acceptance.json');
  let acceptance: Acceptance[] = [];
  if (fs.existsSync(acceptancePath)) {
    try {
      acceptance = JSON.parse(fs.readFileSync(acceptancePath, 'utf8'));
    } catch (e) {
      console.warn('risk-acceptance.json parse failed', (e as Error).message);
    }
  }
  const now = Date.now();
  const acceptanceRegex = acceptance.map((a) => ({
    ...a,
    regex: new RegExp(a.idPattern, 'i'),
    expired: a.expires ? Date.parse(a.expires) < now : false,
  }));
  const expiredAcceptances: string[] = [];
  for (const f of findings) {
    const match = acceptanceRegex.find((a) => a.regex.test(f.id) || a.regex.test(f.description));
    if (match) {
      if (match.expired) {
        expiredAcceptances.push(`${f.id} (reason=${match.reason || ''})`);
      } else {
        f.accepted = true;
      }
    }
  }
  const counts: Record<string, number> = {};
  for (const f of findings) {
    counts[f.severity] = (counts[f.severity] || 0) + 1;
  }

  // Derived domain-specific tallies
  const activeFindings = findings.filter((f) => !f.accepted);
  const securityCritical = activeFindings.filter(
    (f) => f.category === 'security' && f.severity === 'critical',
  ).length;
  const securityHigh = activeFindings.filter(
    (f) => f.category === 'security' && f.severity === 'high',
  ).length;
  const eslintErrors = findings.filter(
    (f) => f.sourceTool === 'eslint' && f.severity === 'medium',
  ).length; // eslint severity 2 mapped to medium above
  const deadExports = findings.filter((f) => f.sourceTool === 'ts-prune').length;
  const licenseDenies = findings.filter(
    (f) =>
      f.sourceTool === 'license-scan' &&
      /non-allowlisted/i.test(f.description) &&
      /status=deny/.test(f.description),
  ).length;
  // Secrets allowlist support (config/audit/secrets-allowlist.json {"patterns": ["regex1", ...]})
  let secretAllowPatterns: RegExp[] = [];
  const allowPath = path.join('config', 'audit', 'secrets-allowlist.json');
  if (fs.existsSync(allowPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(allowPath, 'utf8'));
      const pats: string[] = raw.patterns || [];
      secretAllowPatterns = pats.map((p) => new RegExp(p, 'i'));
    } catch (e: unknown) {
      console.warn('Failed to parse secrets allowlist', e instanceof Error ? e.message : String(e));
    }
  }
  const secretAll = findings.filter((f) => f.sourceTool === 'secrets-scan');
  const secretFindings = secretAll.filter(
    (f) => !secretAllowPatterns.some((r) => r.test(f.description) || r.test(f.file || '')),
  ).length;

  const gates: string[] = [];
  interface GateDetail {
    domain: string;
    name: string;
    message: string;
  }
  const gatesDetailed: GateDetail[] = [];
  const addGate = (domain: string, name: string, message: string) => {
    gates.push(message);
    gatesDetailed.push({ domain, name, message });
  };
  // Security gates (existing)
  if (securityCritical > thresholds.security.criticalVulnMax) {
    addGate(
      'security',
      'criticalVulns',
      `Critical security findings (unaccepted) ${securityCritical} > ${thresholds.security.criticalVulnMax}`,
    );
  }
  if (securityHigh > thresholds.security.highVulnMax) {
    addGate(
      'security',
      'highVulns',
      `High security findings (unaccepted) ${securityHigh} > ${thresholds.security.highVulnMax}`,
    );
  }
  for (const ex of expiredAcceptances) {
    addGate('security', 'riskAcceptanceExpired', `Expired risk acceptance: ${ex}`);
  }
  // Quality gates (use baseline diff for eslint)
  const eslintBaseline = loadEslintBaseline();
  const eslintNewErrors = Math.max(0, eslintErrors - (eslintBaseline.total || 0));
  if (eslintNewErrors > thresholds.quality.eslintErrorMax) {
    addGate(
      'quality',
      'eslintNew',
      `New ESLint errors ${eslintNewErrors} > ${thresholds.quality.eslintErrorMax}`,
    );
  }
  if (deadExports > thresholds.quality.deadExportsMax) {
    addGate(
      'quality',
      'deadExports',
      `Dead exports ${deadExports} > ${thresholds.quality.deadExportsMax}`,
    );
  }
  // License gate - ANY deny should fail
  if (licenseDenies > 0) {
    addGate('licenses', 'denyList', `License policy violations (deny) = ${licenseDenies} > 0`);
  }
  // Secrets gate - any secret finding should fail (already counts toward security high, but explicit message improves clarity)
  if (secretFindings > 0) {
    addGate('security', 'secrets', `Secrets detected ${secretFindings} > 0`);
  }

  // Performance & a11y metric gates
  const perfPath = path.join(OUT_DIR, 'perf', 'perf.json');
  const perf = readJSONSafe(perfPath);
  if (perf) {
    if (perf.startup?.p50 && perf.startup.p50 > thresholds.performance.startupP50Ms) {
      addGate(
        'performance',
        'startupP50',
        `startup p50 ${perf.startup.p50}ms > ${thresholds.performance.startupP50Ms}`,
      );
    }
    if (perf.startup?.p95 && perf.startup.p95 > thresholds.performance.startupP95Ms) {
      addGate(
        'performance',
        'startupP95',
        `startup p95 ${perf.startup.p95}ms > ${thresholds.performance.startupP95Ms}`,
      );
    }
    if (
      typeof perf.jsFrameDropPct === 'number' &&
      perf.jsFrameDropPct > thresholds.performance.jsFrameDropPctMax
    ) {
      addGate(
        'performance',
        'frameDrop',
        `js frame drop pct ${perf.jsFrameDropPct}% > ${thresholds.performance.jsFrameDropPctMax}%`,
      );
    }
  }
  const a11yPath = path.join(OUT_DIR, 'a11y', 'a11y.json');
  const a11y = readJSONSafe(a11yPath);
  if (a11y) {
    if (a11y.labelCoverage && a11y.labelCoverage < thresholds.a11y.labelCoverageMin) {
      gates.push(`a11y label coverage ${a11y.labelCoverage} < ${thresholds.a11y.labelCoverageMin}`);
    }
    if (
      typeof a11y.contrastIssues === 'number' &&
      a11y.contrastIssues > thresholds.a11y.contrastIssuesMax
    ) {
      gates.push(
        `a11y contrast issues ${a11y.contrastIssues} > ${thresholds.a11y.contrastIssuesMax}`,
      );
    }
  }

  // Coverage gates (if coverage artifacts exist and thresholds configured)
  let coverageSummary: any;
  const coveragePath = path.join(OUT_DIR, 'coverage', 'lcov-summary.json');
  if (fs.existsSync(coveragePath)) {
    coverageSummary = readJSONSafe(coveragePath);
  }
  let mutationReport: any;
  const mutationPath = path.join(OUT_DIR, 'mutation', 'mutation-report.json');
  if (fs.existsSync(mutationPath)) {
    mutationReport = readJSONSafe(mutationPath);
  }
  if (thresholds.coverage && coverageSummary) {
    const { statementsMin, branchesMin, linesMin, functionsMin, mutationScoreMin } =
      thresholds.coverage;
    const s = coverageSummary.total || coverageSummary;
    const pct = (k: string) => s[k]?.pct ?? s[k]?.percentage ?? 0;
    if (pct('statements') < statementsMin * 100) {
      addGate(
        'coverage',
        'statements',
        `coverage statements ${pct('statements')}% < ${(statementsMin * 100).toFixed(1)}%`,
      );
    }
    if (pct('branches') < branchesMin * 100) {
      addGate(
        'coverage',
        'branches',
        `coverage branches ${pct('branches')}% < ${(branchesMin * 100).toFixed(1)}%`,
      );
    }
    if (pct('lines') < linesMin * 100) {
      addGate(
        'coverage',
        'lines',
        `coverage lines ${pct('lines')}% < ${(linesMin * 100).toFixed(1)}%`,
      );
    }
    if (pct('functions') < functionsMin * 100) {
      addGate(
        'coverage',
        'functions',
        `coverage functions ${pct('functions')}% < ${(functionsMin * 100).toFixed(1)}%`,
      );
    }
    // Mutation score (stryker) if available
    if (
      mutationReport &&
      typeof mutationReport.systemUnderTestMetrics?.mutationScore === 'number'
    ) {
      const mScore = mutationReport.systemUnderTestMetrics.mutationScore; // already 0-100
      if (mScore < mutationScoreMin * 100) {
        addGate(
          'mutation',
          'score',
          `mutation score ${mScore}% < ${(mutationScoreMin * 100).toFixed(1)}%`,
        );
      }
    }
  }

  const acceptedCount = findings.filter((f) => f.accepted).length;
  // Security package aggregation (unaccepted only)
  const securityPackages: Record<string, { highest: string; count: number }> = {};
  for (const f of activeFindings.filter((f) => f.category === 'security')) {
    const pkg = (
      f.raw?.package ||
      f.raw?.module ||
      f.description.split(' - ')[0] ||
      'unknown'
    ).toString();
    if (!securityPackages[pkg]) {
      securityPackages[pkg] = { highest: f.severity, count: 0 };
    }
    securityPackages[pkg].count++;
    if (severityRank(f.severity) > severityRank(securityPackages[pkg].highest)) {
      securityPackages[pkg].highest = f.severity;
    }
  }
  return {
    counts,
    gates,
    gatesDetailed,
    securityCritical,
    securityHigh,
    perf,
    a11y,
    eslintErrors,
    deadExports,
    licenseDenies,
    secretFindings,
    eslintNewErrors,
    coverageSummary,
    mutationReport,
    acceptedCount,
    securityPackages,
  };
}

function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function main() {
  ensureOutDir();
  const thresholds: Thresholds = readJSONSafe(THRESHOLDS_PATH) || ({} as any);
  let findings = normalise();
  findings = dedup(findings).map((f) => ({ ...f, score: riskScore(f) }));
  const summary = summarise(findings, thresholds);
  // Prepare history list early for delta calculation
  const histDirEarly = path.join('audit', 'history');
  let historyFilesAll: string[] = [];
  if (fs.existsSync(histDirEarly)) {
    historyFilesAll = fs
      .readdirSync(histDirEarly)
      .filter((f) => f.endsWith('.json'))
      .map((f) => path.join(histDirEarly, f))
      .sort();
  }
  const previousPath = historyFilesAll.slice(-1)[0]; // last snapshot before current write
  let prev: any;
  if (previousPath) {
    try {
      prev = JSON.parse(fs.readFileSync(previousPath, 'utf8'));
    } catch {
      /* ignore */
    }
  }
  const nowIso = new Date().toISOString();
  const coveragePct = summary.coverageSummary?.total?.statements?.pct;
  const prevCoveragePct = prev?.coverage?.total?.statements?.pct;
  const mutationScore = summary.mutationReport?.systemUnderTestMetrics?.mutationScore;
  const prevMutationScore = prev?.mutation?.systemUnderTestMetrics?.mutationScore;
  const coverageDelta =
    coveragePct != null && prevCoveragePct != null
      ? +(coveragePct - prevCoveragePct).toFixed(2)
      : undefined;
  const mutationDelta =
    mutationScore != null && prevMutationScore != null
      ? +(mutationScore - prevMutationScore).toFixed(2)
      : undefined;
  // Unsafe any scan & delta
  const unsafe = scanUnsafeAny(ROOT);
  const prevUnsafe = prev?.quality?.unsafeAnyCount as number | undefined;
  const unsafeDelta = prevUnsafe != null ? unsafe.unsafeAnyCount - prevUnsafe : undefined;
  const master = {
    generatedAt: nowIso,
    totals: summary.counts,
    gates: summary.gates,
    gatesDetailed: summary.gatesDetailed,
    perf: summary.perf,
    a11y: summary.a11y,
    quality: {
      eslintErrors: summary.eslintErrors,
      eslintNewErrors: summary.eslintNewErrors,
      deadExports: summary.deadExports,
      unsafeAnyCount: unsafe.unsafeAnyCount,
      unsafeAnyDelta: unsafeDelta,
      unsafeAnyFiles: unsafe.files,
    },
    licenses: { deny: summary.licenseDenies },
    secrets: { total: summary.secretFindings },
    coverage: summary.coverageSummary,
    mutation: summary.mutationReport,
    deltas: { coverageStatementsPct: coverageDelta, mutationScorePct: mutationDelta },
    risk: { accepted: summary.acceptedCount },
    security: { packages: summary.securityPackages },
    findings,
  };
  fs.writeFileSync(MASTER_JSON, JSON.stringify(master, null, 2));
  // Archive history snapshot
  try {
    const histDir = path.join('audit', 'history');
    fs.mkdirSync(histDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:]/g, '-');
    fs.writeFileSync(path.join(histDir, `report-${ts}.json`), JSON.stringify(master));
    // Optional pruning (max files)
    const historyConfigPath = path.join('config', 'audit', 'history.config.json');
    let maxFiles = 120; // default ~4 months if daily
    if (fs.existsSync(historyConfigPath)) {
      try {
        const hc = JSON.parse(fs.readFileSync(historyConfigPath, 'utf8'));
        if (hc.maxFiles) {
          maxFiles = hc.maxFiles;
        }
      } catch {
        /*ignore*/
      }
    }
    const all = fs
      .readdirSync(histDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => path.join(histDir, f))
      .sort();
    const excess = all.length - maxFiles;
    if (excess > 0) {
      for (const f of all.slice(0, excess)) {
        try {
          fs.unlinkSync(f);
        } catch {}
      }
    }
  } catch (e: unknown) {
    console.warn('History archive failed', e instanceof Error ? e.message : String(e));
  }

  // HTML report generation (lightweight, inline CSS, recent trend for key metrics)
  try {
    const histDir = path.join('audit', 'history');
    let historyFiles: string[] = [];
    if (fs.existsSync(histDir)) {
      historyFiles = fs
        .readdirSync(histDir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => path.join(histDir, f))
        .sort()
        .slice(-15); // last 15
    }
    const history = historyFiles
      .map((f) => {
        try {
          return JSON.parse(fs.readFileSync(f, 'utf8'));
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    const metricSeries = (selector: (r: any) => number | undefined) =>
      history.map((r) => selector(r)).filter((v) => typeof v === 'number') as number[];
    const covStatements = metricSeries((r) => r.coverage?.total?.statements?.pct);
    const mutationScores = metricSeries((r) => r.mutation?.systemUnderTestMetrics?.mutationScore);
    const eslintNewSeries = metricSeries((r) => r.quality?.eslintNewErrors);
    const unsafeAnySeries = metricSeries((r) => r.quality?.unsafeAnyCount);
    function spark(values: number[], scale = 100): string {
      if (!values.length) {
        return '';
      }
      const blocks = '▁▂▃▄▅▆▇█';
      const max = Math.max(...values, scale);
      return values
        .map(
          (v) => blocks[Math.min(blocks.length - 1, Math.round((v / max) * (blocks.length - 1)))],
        )
        .join('');
    }
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Audit Report</title><style>
      body{font-family:Arial,Helvetica,sans-serif;margin:20px;}
      h1{margin-top:0}
      .fail{color:#b30000;font-weight:bold}
      .pass{color:#0a730a;font-weight:bold}
      table{border-collapse:collapse;margin:10px 0;}
      th,td{border:1px solid #ccc;padding:4px 8px;font-size:12px;}
      code{background:#f5f5f5;padding:2px 4px;border-radius:3px;}
    </style></head><body>
    <h1>Denetim Raporu</h1>
    <p>Oluşturulma: ${master.generatedAt}</p>
    <h2>Kapı Durumu</h2>
    <ul>${master.gates.length ? master.gates.map((g) => `<li class="fail">BAŞARISIZ: ${g}</li>`).join('') : '<li class="pass">Tüm kapılar geçti</li>'}</ul>
    <h2>Anahtar Metrikler</h2>
    <table><tr><th>Metrik</th><th>Mevcut</th><th>Δ</th><th>Eğilim (son ${history.length})</th></tr>
      <tr><td>Kapsama İfadeleri %</td><td>${master.coverage?.total?.statements?.pct ?? 'mevcut değil'}</td><td>${master.deltas.coverageStatementsPct ?? ''}</td><td><code>${spark(covStatements)}</code></td></tr>
      <tr><td>Mutasyon Skoru %</td><td>${master.mutation?.systemUnderTestMetrics?.mutationScore ?? 'mevcut değil'}</td><td>${master.deltas.mutationScorePct ?? ''}</td><td><code>${spark(mutationScores)}</code></td></tr>
  <tr><td>Yeni ESLint Hataları</td><td>${master.quality.eslintNewErrors}</td><td><code>${spark(eslintNewSeries, Math.max(...eslintNewSeries, 10))}</code></td></tr>
  <tr><td>Güvenli Olmayan any Sayısı</td><td>${master.quality.unsafeAnyCount}</td><td>${master.quality.unsafeAnyDelta ?? ''}</td><td><code>${spark(unsafeAnySeries, Math.max(...unsafeAnySeries, 10))}</code></td></tr>
    </table>
    <h2>Risk Kabulü</h2>
    <p>Kabul edilen bulgular: ${master.risk?.accepted ?? 0}</p>
  <h2>Toplamlar</h2><pre>${JSON.stringify(master.totals, null, 2)}</pre>
  <h2>Güvenlik Paketleri</h2><pre>${JSON.stringify(master.security.packages, null, 2)}</pre>
    <h2>Kalite</h2><pre>${JSON.stringify(master.quality, null, 2)}</pre>
    <h2>Lisanslar</h2><pre>${JSON.stringify(master.licenses, null, 2)}</pre>
    <h2>Gizli Bilgiler</h2><pre>${JSON.stringify(master.secrets, null, 2)}</pre>
    <h2>Ham Kapsama</h2><pre>${JSON.stringify(master.coverage, null, 2)}</pre>
    <h2>Ham Mutasyon</h2><pre>${JSON.stringify(master.mutation, null, 2)}</pre>
    <p><em>Analiz edilen geçmiş dosyaları: ${historyFiles.length}</em></p>
    </body></html>`;
    fs.writeFileSync(path.join(OUT_DIR, 'report.html'), html);
    // trend.json (machine-readable series)
    const trend = {
      generatedAt: master.generatedAt,
      series: {
        coverageStatementsPct: covStatements,
        mutationScorePct: mutationScores,
        eslintNewErrors: eslintNewSeries,
      },
    };
    fs.writeFileSync(path.join(OUT_DIR, 'trend.json'), JSON.stringify(trend, null, 2));
  } catch (e: unknown) {
    console.warn('HTML report generation failed', e instanceof Error ? e.message : String(e));
  }
  const md = [
    '# Denetim Özeti',
    `Oluşturulma: ${master.generatedAt}`,
    '',
    '## Toplamlar',
    '```json',
    JSON.stringify(summary.counts, null, 2),
    '```',
    '',
    '## Kapılar',
    summary.gates.length
      ? summary.gates.map((g) => `- [BAŞARISIZ] ${g}`).join('\n')
      : 'Tüm kapılar geçti',
    '',
    '## Kalite Metrikleri',
    '```json',
    JSON.stringify(
      {
        eslintErrors: summary.eslintErrors,
        eslintNewErrors: summary.eslintNewErrors,
        deadExports: summary.deadExports,
        unsafeAnyCount: master.quality.unsafeAnyCount,
        unsafeAnyDelta: master.quality.unsafeAnyDelta,
      },
      null,
      2,
    ),
    '```',
    '',
    '## Lisans Politikası',
    `Reddedilen lisanslar: ${summary.licenseDenies}`,
    '',
    '## Gizli Bilgi Taraması',
    `Tespit edilen gizli bilgiler: ${summary.secretFindings}`,
    '',
    '## Risk Kabulü',
    `Kabul edilen bulgular: ${summary.acceptedCount}`,
    '',
    '## Değişimler',
    '```json',
    JSON.stringify(master.deltas, null, 2),
    '```',
    '',
    '## Güvenlik Paketleri (kabul edilmemiş)',
    '```json',
    JSON.stringify(summary.securityPackages, null, 2),
    '```',
    '',
    '## Performans Metrikleri',
    master.perf
      ? '```json\n' + JSON.stringify(master.perf, null, 2) + '\n```'
      : '_Performans metrikleri yok_',
    '',
    '## Erişilebilirlik Metrikleri',
    master.a11y
      ? '```json\n' + JSON.stringify(master.a11y, null, 2) + '\n```'
      : '_Erişilebilirlik metrikleri yok_',
    '',
    '## En Önemli 20 Bulgu',
    '',
    '| Önem Derecesi | Kategori | Açıklama | Dosya |',
    '|---------|----------|-------------|------|',
    ...findings
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 20)
      .map(
        (f) =>
          `| ${f.severity} | ${f.category} | ${f.description.replace(/\|/g, '/')} | ${f.file ? path.relative(ROOT, f.file) : ''} |`,
      ),
    '',
    '---',
    'Tüm bulgular: master-report.json dosyasına bakın',
  ];
  fs.writeFileSync(SUMMARY_MD, md.join('\n'));
  // Badge generation
  try {
    const badgeDir = path.join(OUT_DIR, 'badges');
    fs.mkdirSync(badgeDir, { recursive: true });
    function colorScale(pct: number): string {
      if (pct >= 90) {
        return '#2e7d32';
      }
      if (pct >= 75) {
        return '#558b2f';
      }
      if (pct >= 60) {
        return '#f9a825';
      }
      if (pct >= 45) {
        return '#ef6c00';
      }
      return '#c62828';
    }
    function mkBadge(label: string, value: string, color: string) {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='20' role='img' aria-label='${label}: ${value}'><linearGradient id='s' x2='0' y2='100%'><stop offset='0' stop-color='#bbb' stop-opacity='.1'/><stop offset='1' stop-opacity='.1'/></linearGradient><rect rx='3' width='180' height='20' fill='#555'/><rect rx='3' x='80' width='100' height='20' fill='${color}'/><path fill='${color}' d='M80 0h4v20h-4z'/><rect rx='3' width='180' height='20' fill='url(#s)'/><g fill='#fff' text-anchor='middle' font-family='Verdana,Geneva,DejaVu Sans,sans-serif' font-size='11'><text x='40' y='14'>${label}</text><text x='130' y='14'>${value}</text></g></svg>`;
      fs.writeFileSync(
        path.join(badgeDir, label.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.svg'),
        svg,
      );
    }
    if (master.coverage?.total?.statements?.pct != null) {
      const pct = master.coverage.total.statements.pct;
      mkBadge('coverage', pct + '%', colorScale(pct));
    }
    if (master.mutation?.systemUnderTestMetrics?.mutationScore != null) {
      const ms = master.mutation.systemUnderTestMetrics.mutationScore;
      mkBadge('mutation', ms + '%', colorScale(ms));
    }
    mkBadge(
      'eslint-new',
      String(master.quality.eslintNewErrors),
      master.quality.eslintNewErrors === 0 ? '#2e7d32' : '#c62828',
    );
    const highCrit = summary.securityHigh + summary.securityCritical;
    mkBadge('security-hc', String(highCrit), highCrit === 0 ? '#2e7d32' : '#c62828');
  } catch (e) {
    console.warn('Badge generation failed', (e as Error).message);
  }
  // Exit non-zero if gates failed (CI fail)
  if (summary.gates.length) {
    console.error('Gate failures:\n' + summary.gates.join('\n'));
    process.exitCode = 1;
  }
}

main();

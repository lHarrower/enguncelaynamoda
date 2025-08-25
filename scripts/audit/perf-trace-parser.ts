import fs from 'fs';
import path from 'path';
/**
 * Parse RN/Detox performance traces into perf.json.
 * Inputs (optional):
 *  - audit/in/perf/raw-startup.json : number[] (startup durations ms)
 *  - audit/in/perf/frames.json : { totalFrames, droppedFrames }
 */
function percentile(arr: number[], p: number) {
  if (!arr.length) {
    return undefined;
  }
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}
function main() {
  const inDir = path.join(process.cwd(), 'audit', 'in', 'perf');
  const outDir = path.join(process.cwd(), 'audit', 'out', 'perf');
  fs.mkdirSync(outDir, { recursive: true });
  let startups: number[] = [];
  const startupPath = path.join(inDir, 'raw-startup.json');
  if (fs.existsSync(startupPath)) {
    try {
      startups = JSON.parse(fs.readFileSync(startupPath, 'utf8'));
    } catch {}
  }
  let framesPct: number | undefined;
  const framesPath = path.join(inDir, 'frames.json');
  if (fs.existsSync(framesPath)) {
    try {
      const fr = JSON.parse(fs.readFileSync(framesPath, 'utf8'));
      if (fr.totalFrames && fr.droppedFrames != null) {
        framesPct = (fr.droppedFrames / fr.totalFrames) * 100;
      }
    } catch {}
  }
  const metrics = {
    startup: {
      samples: startups.length,
      p50: percentile(startups, 50),
      p95: percentile(startups, 95),
    },
    jsFrameDropPct: framesPct,
  };
  fs.writeFileSync(path.join(outDir, 'perf.json'), JSON.stringify(metrics, null, 2));
}
main();

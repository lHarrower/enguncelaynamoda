#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';

const LEVEL = process.argv[2] || 'patch';
const CONFIG = path.join(process.cwd(), 'app.config.ts');
let content = fs.readFileSync(CONFIG, 'utf8');

function bump(version: string) {
  const [maj, min, pat] = version.split('.').map(Number);
  if (LEVEL === 'major') {
    return `${maj + 1}.0.0`;
  }
  if (LEVEL === 'minor') {
    return `${maj}.${min + 1}.0`;
  }
  return `${maj}.${min}.${pat + 1}`;
}

const versionMatch = content.match(/version:\s*['\"](\d+\.\d+\.\d+)['\"]/);
if (!versionMatch) {
  
  process.exit(1);
}
const current = versionMatch[1];
const next = bump(current);

content = content.replace(versionMatch[0], `version: '${next}'`);

// runtimeVersion policy: keep equal to app version
const rtMatch = content.match(/runtimeVersion:\s*['\"]([^'\"]+)['\"]/);
if (rtMatch) {
  content = content.replace(rtMatch[0], `runtimeVersion: '${next}'`);
}

fs.writeFileSync(CONFIG, content);


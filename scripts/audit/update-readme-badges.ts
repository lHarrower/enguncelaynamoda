import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/*
 * Inserts or updates an audit badges block in the root README.md.
 * Markers:
 *   <!-- audit-badges:start -->
 *   <!-- audit-badges:end -->
 * Only modifies the region between markers. Creates markers if absent (appended near top after title).
 */

interface BadgeDef {
  file: string;
  alt: string;
  label: string;
}
const badgeDir = 'audit/out/badges';
const badges: BadgeDef[] = [
  { file: 'coverage.svg', alt: 'Kapsama', label: 'Kapsama' },
  { file: 'mutation.svg', alt: 'Mutasyon Skoru', label: 'Mutasyon' },
  { file: 'eslint-new.svg', alt: 'Yeni ESLint Hataları', label: 'Yeni ESLint' },
  { file: 'security-hc.svg', alt: 'Yüksek/Kritik Güvenlik Açıkları', label: 'Güvenlik YK' },
];

function buildMarkdown(): string {
  const lines: string[] = [];
  for (const b of badges) {
    const p = join(badgeDir, b.file).replace(/\\/g, '/');
    if (existsSync(p)) {
      lines.push(`![${b.alt}](${p})`);
    }
  }
  if (!lines.length) {
    return '*Henüz denetim rozetleri oluşturulmadı.*';
  }
  return lines.join(' ');
}

function run() {
  const readmePath = 'README.md';
  if (!existsSync(readmePath)) {
    
    process.exit(0);
  }
  const raw = readFileSync(readmePath, 'utf8');
  const startMarker = '<!-- audit-badges:start -->';
  const endMarker = '<!-- audit-badges:end -->';
  const blockContent = `${startMarker}\n${buildMarkdown()}\n${endMarker}`;

  if (raw.includes(startMarker) && raw.includes(endMarker)) {
    const updated = raw.replace(new RegExp(`${startMarker}[\s\S]*?${endMarker}`), blockContent);
    writeFileSync(readmePath, updated, 'utf8');
    
  } else {
    // Insert after H1 title (first blank line after # ...)
    const lines = raw.split(/\r?\n/);
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]?.startsWith('# ')) {
        // Insert after next blank or immediately after title line
        insertIndex = i + 1;
        while (insertIndex < lines.length && lines[insertIndex]?.trim() !== '') {
          insertIndex++;
        }
        break;
      }
    }
    lines.splice(insertIndex, 0, '', blockContent, '');
    writeFileSync(readmePath, lines.join('\n'), 'utf8');
    
  }
}

run();

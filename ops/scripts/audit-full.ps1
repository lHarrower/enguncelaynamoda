# AYNAMODA Full Audit - Local (Windows PowerShell)
Param(
  [switch]$SkipTests
)

$ErrorActionPreference = "Stop"
$reports = "ops/reports"
if (!(Test-Path $reports)) { New-Item -ItemType Directory -Path $reports | Out-Null }

Write-Host "== Step 1: Env & Install =="
node -v
npm -v
npm ci

Write-Host "== Step 2: Project health =="
npx expo config --type public | Out-File "$reports/expo-config.txt" -Encoding utf8
npx expo-doctor | Out-File "$reports/expo-doctor.txt" -Encoding utf8

Write-Host "== Step 3: Lint & Static Analysis =="
npx eslint . --ext .ts,.tsx -f json -o "$reports/eslint.json" 2>$null
npx eslint . --ext .ts,.tsx -f stylish | Out-File "$reports/eslint-stylish.txt" -Encoding utf8
npx depcheck | Out-File "$reports/depcheck.txt" -Encoding utf8

Write-Host "== Step 4: Dependency Security =="
npm audit --omit=dev --json > "$reports/npm-audit.json"

Write-Host "== Step 5: Tests (Jest) =="
if (-not $SkipTests) {
  # JSON çıktı + özet
  npx jest --runInBand --json --outputFile="$reports/jest.json" `
    --coverage --coverageReporters=json-summary,text `
    | Out-File "$reports/jest-console.txt" -Encoding utf8
} else {
  "Skipped by flag" | Out-File "$reports/jest.json" -Encoding utf8
}

Write-Host "== Step 6: Bundle & Perf snapshot =="
# (hızlı snapshot – detaylı analiz CI'da yapılır)
npx react-native-bundle-visualizer --platform android --entry-file index.js `
  | Out-File "$reports/bundle-visualizer.txt" -Encoding utf8

Write-Host "== Step 7: EAS build dry check =="
# Yapılandırma geçer mi? Gerçek build'e gerek yok
eas build:configure --non-interactive | Out-File "$reports/eas-configure.txt" -Encoding utf8

Write-Host "== Step 8: Summarize (Markdown) =="
# Basit özet oluştur
$eslint = "{}"; if (Test-Path "$reports/eslint.json") { $eslint = Get-Content "$reports/eslint.json" -Raw }
$jest   = "{}"; if (Test-Path "$reports/jest.json")   { $jest   = Get-Content "$reports/jest.json" -Raw }
$npmAud = "{}"; if (Test-Path "$reports/npm-audit.json") { $npmAud = Get-Content "$reports/npm-audit.json" -Raw }

$eslintErrors = 0
try { $eslintErrors = ((ConvertFrom-Json $eslint) | Measure-Object).Count } catch {}
$jestObj = $null
try { $jestObj = (ConvertFrom-Json $jest) } catch {}
$testsTotal = if ($jestObj) { $jestObj.numTotalTests } else { 0 }
$testsFailed = if ($jestObj) { $jestObj.numFailedTests } else { 0 }

$npma = $null
try { $npma = ConvertFrom-Json $npmAud } catch {}
$advisories = if ($npma -and $npma.vulnerabilities) { $npma.vulnerabilities } else { @{} }
$highCount = 0
if ($advisories) {
  foreach ($k in $advisories.Keys) { $highCount += $advisories[$k].high }
}

$md = @"
# AYNAMODA – Full Audit (Local)
**Tarih:** $(Get-Date -Format "u")

## Özet
- ESLint bulguları (dosya adedi): **$eslintErrors**
- Testler: **$testsTotal** toplam / **$testsFailed** başarısız
- NPM güvenlik (yüksek): **$highCount**
- Detay dosyaları: \`ops/reports\`

## Dosyalar
- expo-config.txt, expo-doctor.txt
- eslint.json, eslint-stylish.txt
- depcheck.txt
- npm-audit.json
- jest.json, jest-console.txt (coverage dahil)
- bundle-visualizer.txt
- eas-configure.txt

"@
$md | Out-File "$reports/AUDIT_SUMMARY.md" -Encoding utf8

Write-Host ""
Write-Host "== DONE =="
Write-Host "Rapor klasörü: $reports"
Write-Host "Özet: $reports/AUDIT_SUMMARY.md"

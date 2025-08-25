param(
  [switch]$FailOnGate
)
# Ensure output directories
$ErrorActionPreference = 'Stop'
$newDirs = @(
  'audit/out/static',
  'audit/out/security',
  'audit/out/deps'
)
foreach ($d in $newDirs) { if (!(Test-Path $d)) { New-Item -ItemType Directory -Force -Path $d | Out-Null } }

Write-Host 'Running ESLint...'
& .\node_modules\.bin\eslint.cmd . --ext .js,.jsx,.ts,.tsx -f json -o audit/out/static/eslint.json
if ($LASTEXITCODE -ne 0) { Write-Warning 'ESLint reported issues (non-zero exit), continuing for report generation.' }

# Run Semgrep only if config AND binary exist
if (Test-Path 'config/audit/semgrep/config.yml') {
  $semgrepCmd = Get-Command semgrep -ErrorAction SilentlyContinue
  if ($null -ne $semgrepCmd) {
    Write-Host 'Running Semgrep (fast set)...'
    & semgrep --config config/audit/semgrep --json > audit/out/static/semgrep.json
    if ($LASTEXITCODE -ne 0) { Write-Warning 'Semgrep failed' }
  } else {
    Write-Warning 'Semgrep binary not found, skipping.'
  }
} else {
  Write-Warning 'Semgrep config missing, skipping.'
}

Write-Host 'Running dead code (ts-prune)...'
& .\node_modules\.bin\ts-prune.cmd -p tsconfig.app.json --json > audit/out/static/deadcode.json

Write-Host 'Aggregating...'
& .\node_modules\.bin\ts-node.cmd scripts/audit/aggregate.ts
$exit = $LASTEXITCODE
if ($FailOnGate -and $exit -ne 0) { exit $exit }

Param(
  [string]$JestArgs = ''
)
# Runs jest coverage producing lcov-summary.json for aggregator
Write-Host 'Running Jest with coverage...'
# Ensure coverage directory under audit/out/coverage
$coverageOut = 'audit/out/coverage'
if (-Not (Test-Path $coverageOut)) { New-Item -ItemType Directory -Force -Path $coverageOut | Out-Null }
# Run jest
.\node_modules\.bin\jest.cmd --coverage --coverageReporters="json-summary" --coverageReporters="text" $JestArgs
# Move coverage-summary to expected location
$summaryPath = 'coverage/coverage-summary.json'
if (Test-Path $summaryPath) {
  Copy-Item $summaryPath (Join-Path $coverageOut 'lcov-summary.json') -Force
  Write-Host 'Coverage summary copied to audit/out/coverage/lcov-summary.json'
} else {
  Write-Warning 'coverage-summary.json not found; coverage gating will be skipped.'
}

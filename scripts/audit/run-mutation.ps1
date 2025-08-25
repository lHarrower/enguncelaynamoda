Param(
  [string]$StrykerArgs = ''
)
Write-Host 'Running Stryker mutation tests...'
$mutationOut = 'audit/out/mutation'
if (-Not (Test-Path $mutationOut)) { New-Item -ItemType Directory -Force -Path $mutationOut | Out-Null }
# Invoke stryker (expects config file stryker.conf.js or package.json config)
npx stryker run $StrykerArgs
# Default Stryker HTML report lives under reports/mutation/html; JSON report requires config
# If JSON report exists, copy it; else emit placeholder
$jsonReport = 'reports/mutation/mutation-report.json'
if (Test-Path $jsonReport) {
  Copy-Item $jsonReport (Join-Path $mutationOut 'mutation-report.json') -Force
  Write-Host 'Mutation report copied to audit/out/mutation/mutation-report.json'
} else {
  # Create minimal placeholder if absent so aggregator notes absence but does not fail
  if (-Not (Test-Path (Join-Path $mutationOut 'mutation-report.json'))) {
    '{"note":"No mutation-report.json produced. Ensure Stryker json reporter enabled.","systemUnderTestMetrics":{"mutationScore":0}}' | Out-File -Encoding UTF8 (Join-Path $mutationOut 'mutation-report.json')
  }
  Write-Warning 'mutation-report.json not found; ensure json reporter enabled in Stryker config.'
}

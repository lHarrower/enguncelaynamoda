param([switch]$FailOnGate)
$ErrorActionPreference='Stop'
$new='audit/out/security'; if(!(Test-Path $new)){New-Item -ItemType Directory -Force -Path $new | Out-Null}
if (!(Get-Command gitleaks -ErrorAction SilentlyContinue)) { Write-Warning 'gitleaks not installed (choco install gitleaks). Skipping.'; exit 0 }
Write-Host 'Running gitleaks secrets scan...'
& gitleaks detect --no-git -f json -r audit/out/security/secrets.json
if($LASTEXITCODE -ne 0){ Write-Warning 'gitleaks exit code indicates findings (not fatal here).'}
& npx ts-node scripts/audit/aggregate.ts
if($FailOnGate -and $LASTEXITCODE -ne 0){ exit $LASTEXITCODE }

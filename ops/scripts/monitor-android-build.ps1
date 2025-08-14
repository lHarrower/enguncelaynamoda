param(
  [string]$BuildId = "9dc902d0-b0ae-4372-8bdb-ff1e502613d2",
  [string]$TargetRuntimeVersion = "1.0.1",
  [int]$PollSeconds = 30
)

Write-Host "[monitor] Starting Android build monitor for $BuildId (poll every ${PollSeconds}s)"
$rawOutPath = "ops/reports/_last-build-raw.json"
$finalPath = "ops/reports/last-build.json"
$beforeVersionPath = "ops/reports/remote-version-android-before.json"
$afterVersionPath = "ops/reports/remote-version-android.json"

function Select-ArtifactUrl($artifacts) {
  if (-not $artifacts) { return $null }
  foreach ($k in 'buildUrl','applicationArchiveUrl','artifactUrl','url') {
    if ($artifacts.PSObject.Properties.Name -contains $k) {
      $v = $artifacts.$k
      if ($v) { return $v }
    }
  }
  return $null
}

while ($true) {
  try {
    $json = eas build:view $BuildId --json 2>$null
    if (-not $json) { Write-Host "[monitor] Empty response; retry in $PollSeconds s"; Start-Sleep -Seconds $PollSeconds; continue }
    $obj = $json | ConvertFrom-Json
  } catch {
    Write-Host "[monitor] Exception during poll: $_. Retrying in $PollSeconds s"
    Start-Sleep -Seconds $PollSeconds
    continue
  }
  $ts = Get-Date -Format o
  Write-Host "[monitor] $ts status=$($obj.status) queuePosition=$($obj.queuePosition)"
  if ($obj.status -in @('finished','errored','canceled')) {
    $json | Out-File -Encoding utf8 $rawOutPath
    break
  }
  Start-Sleep -Seconds $PollSeconds
}

# Process terminal status
$raw = Get-Content $rawOutPath -Raw | ConvertFrom-Json
$status = $raw.status
$artifactUrl = Select-ArtifactUrl $raw.artifacts

if ($status -ne 'finished') {
  $errMsg = $null
  if ($raw.PSObject.Properties.Name -contains 'error') { $errMsg = $raw.error }
  if (-not $errMsg -and $raw.PSObject.Properties.Name -contains 'errorMessage') { $errMsg = $raw.errorMessage }
  $summaryObj = [pscustomobject]@{
    buildId = $raw.id
    status = $status
    error = $errMsg
    runtimeVersion = $raw.runtimeVersion
  }
  $summaryObj | ConvertTo-Json -Depth 5 | Out-File -Encoding utf8 $finalPath
  Write-Host "[monitor][FAIL] Build ended with status=$status" -ForegroundColor Red
  return
}

$finalObj = [pscustomobject]@{
  buildId = $raw.id
  status = $status
  artifactUrl = $artifactUrl
  appVersionReported = $raw.appVersion
  runtimeVersion = $raw.runtimeVersion
}
$finalObj | ConvertTo-Json -Depth 5 | Out-File -Encoding utf8 $finalPath
Write-Host "[monitor][OK] Build finished. Artifact: $artifactUrl" -ForegroundColor Green

# Sourcemaps upload attempt (if env + script available)
$scriptPath = "ops/scripts/upload-sourcemaps-android.sh"
$envOk = $env:SENTRY_AUTH_TOKEN -and $env:SENTRY_ORG -and $env:SENTRY_PROJECT -and $env:EXPO_PUBLIC_SENTRY_DSN
if (-not (Test-Path $scriptPath)) {
  Write-Host "[sourcemaps] Script not found; skipping"
} elseif (-not $envOk) {
  Write-Host "[sourcemaps] Required env vars missing; leaving existing warning"
} elseif (-not (Get-Command bash -ErrorAction SilentlyContinue)) {
  Write-Host "[sourcemaps] bash not available; cannot run script"
} else {
  Write-Host "[sourcemaps] Uploading sourcemaps..."
  bash $scriptPath > ops/reports/sourcemaps-upload.txt 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-Host "[sourcemaps] Upload success"
  } else {
    "Sourcemaps upload failed (exit $LASTEXITCODE). See ops/reports/sourcemaps-upload.txt" | Out-File -Encoding utf8 ops/warnings/SOURCEMAPS_UPLOAD_FAILED.md
  }
}

# Remote version sync
Write-Host "[version] Capturing remote version BEFORE"
(eas build:version:get --platform android --json) > $beforeVersionPath 2>&1
Write-Host "[version] Setting remote app version to 1.0.1"
$setOutput = (eas build:version:set --platform android --app-version 1.0.1 --non-interactive) 2>&1
if ($LASTEXITCODE -ne 0) {
  $setOutput | Out-File -Encoding utf8 ops/warnings/REMOTE_APP_VERSION_NOT_SET.md
  Write-Host "[version] Failed to set remote version"
}
Write-Host "[version] Capturing remote version AFTER"
(eas build:version:get --platform android --json) > $afterVersionPath 2>&1
Write-Host "[monitor] Post-build steps complete"

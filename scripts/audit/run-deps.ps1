param([switch]$FailOnGate)
$ErrorActionPreference='Stop'
$depsDir='audit/out/deps'; if(!(Test-Path $depsDir)){New-Item -ItemType Directory -Force -Path $depsDir | Out-Null}
Write-Host 'Generating CycloneDX SBOM...'
& npx cyclonedx-npm --output $depsDir/sbom.json
if($LASTEXITCODE -ne 0){ Write-Warning 'SBOM generation failed'}
if (!(Get-Command osv-scanner -ErrorAction SilentlyContinue)) { Write-Warning 'osv-scanner not installed. Skipping vulnerability scan.' } else {
  Write-Host 'Running osv-scanner...'
  & osv-scanner --lockfile package-lock.json --json > $depsDir/osv.json
}
# Placeholder license scan (simple grep) - can replace with license-checker
Write-Host 'Collecting license metadata...'
& npx license-checker --json > $depsDir/licenses-raw.json 2>$null
if(Test-Path $depsDir/licenses-raw.json){
  $allowConfig = Get-Content config/audit/policies.licenses-allowlist.json -Raw | ConvertFrom-Json
  $raw = Get-Content $depsDir/licenses-raw.json -Raw | ConvertFrom-Json
  $licenseFindings = @()
  foreach($pkg in $raw.PSObject.Properties){
    $name=$pkg.Name; $lic=($pkg.Value.licenses | Out-String).Trim()
    if($lic -and -not ($allowConfig.allow -contains $lic)){
      $licenseFindings += [pscustomobject]@{ package=$name; license=$lic; status= (if($allowConfig.deny -contains $lic){'deny'} else {'unknown'}) }
    }
  }
  $licenseFindings | ConvertTo-Json -Depth 4 > $depsDir/licenses.json
}
 # Optional Snyk scan (requires snyk CLI + SNYK_TOKEN)
 if (Get-Command snyk -ErrorAction SilentlyContinue) {
   if ($env:SNYK_TOKEN) {
     Write-Host 'Running Snyk test (json)...'
     try {
       snyk test --all-projects --json | Out-File -FilePath $depsDir/snyk.json -Encoding utf8
     } catch {
       Write-Warning "Snyk scan failed: $($_.Exception.Message)"
     }
   } else {
     Write-Host 'SNYK_TOKEN not set, skipping Snyk scan.'
   }
 } else {
   Write-Host 'snyk CLI not found, skipping Snyk scan.'
 }
& npx ts-node scripts/audit/aggregate.ts
if($FailOnGate -and $LASTEXITCODE -ne 0){ exit $LASTEXITCODE }

# Convenience script to just regenerate HTML from existing JSON (reruns aggregate)
Write-Host 'Rebuilding audit HTML report via aggregator...'
if (!(Test-Path 'audit/out')) { Write-Warning 'audit/out missing; run a full audit first.' }
& npx ts-node scripts/audit/aggregate.ts

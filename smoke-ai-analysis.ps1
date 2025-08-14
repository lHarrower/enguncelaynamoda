$ErrorActionPreference = "Stop"
Write-Host "== AYNAMODA AI Smoke Başlıyor ==" -ForegroundColor Cyan

# ===== AYNAMODA ai-analysis end-to-end smoke (single run) =====

$ErrorActionPreference = "Stop"
Set-Location -Path "$PSScriptRoot" -ErrorAction SilentlyContinue

# === 0) CONFIG: Supabase URL + keys ===
$SUPA_URL = "https://sntlqqerajehwgmjbkgw.supabase.co"
$FN_URL   = "https://sntlqqerajehwgmjbkgw.functions.supabase.co/ai-analysis"

Write-Host "Paste SERVICE_ROLE key" -ForegroundColor Yellow
$SERVICE = Read-Host -AsSecureString | % { [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }

Write-Host "Paste ANON key (EXPO_PUBLIC_SUPABASE_ANON_KEY)" -ForegroundColor Yellow
$ANON = Read-Host -AsSecureString | % { [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }

# Test kullanıcı (yeni bir e-posta üretir)
$stamp = (Get-Date -Format "yyyyMMddHHmmss")
$EMAIL = "hkillibacak0+smoke-$stamp@gmail.com"
$PASSWORD = "AynaM0da!$stamp"

# === 1) PATCH SOURCE: apikey header + error mapping ===
$File = ".\supabase\functions\ai-analysis\index.ts"
if (!(Test-Path $File)) { throw "Bulunamadı: $File (repo kökünde misin?)" }
$content = Get-Content -Raw $File

# apikey: supabaseAnonKey ekle (idempotent)
if ($content -notmatch 'apikey\s*:\s*supabaseAnonKey') {
  $content = $content -replace '(headers\s*:\s*{\s*[^}]*Authorization\s*:\s*authHeader\s*,)',
    '$1 apikey: supabaseAnonKey,'
}

# error mapping’i daha net yap
$pattern = 'let\s+status\s*=\s*400;[\s\S]*?return new Response'
$replacement = @'
let status = 400;
const msg = (error.message || "").toLowerCase();
if (msg.includes("authentication") || msg.includes("unauthorized")) {
  status = 401;
} else if (msg.includes("not found")) {
  status = 404;
} else if (error.name === "AbortError") {
  status = 408;
}
return new Response'@
if ($content -match $pattern) { $content = [regex]::Replace($content,$pattern,$replacement, 'Singleline') }

# dosyayı yaz
[System.IO.File]::WriteAllText($File, $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "✓ index.ts patched" -ForegroundColor Green

# === 2) REDEPLOY FUNCTION ===
supabase functions deploy ai-analysis --project-ref sntlqqerajehwgmjbkgw | Out-Host

# === 3) STORAGE: bucket oluştur + test.png yükle ===
# bucket (public)
try {
  Invoke-RestMethod -Uri "$SUPA_URL/storage/v1/bucket" `
    -Method POST `
    -Headers @{ Authorization="Bearer $SERVICE"; apikey=$SERVICE; "Content-Type"="application/json" } `
    -Body (@{ name="wardrobe"; public=$true } | ConvertTo-Json) | Out-Null
} catch { }

# 1x1 png dosyası
$bytes = [Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAoMBgWgq8P0AAAAASUVORK5CYII=")
$fn = "test.png"; [IO.File]::WriteAllBytes($fn,$bytes)

# upload
Invoke-RestMethod -Uri "$SUPA_URL/storage/v1/object/wardrobe/$fn" `
  -Method POST -Headers @{ Authorization="Bearer $SERVICE"; apikey=$SERVICE; "Content-Type"="image/png" } `
  -InFile $fn | Out-Null
$IMG = "$SUPA_URL/storage/v1/object/public/wardrobe/$fn"
Write-Host "✓ Uploaded image: $IMG" -ForegroundColor Green

# === 4) AUTH: test user oluştur + login ===
# create (confirmed)
$createBody = @{ email=$EMAIL; password=$PASSWORD; email_confirm=$true } | ConvertTo-Json
$created = Invoke-RestMethod -Uri "$SUPA_URL/auth/v1/admin/users?apikey=$SERVICE" `
  -Headers @{ Authorization="Bearer $SERVICE"; apikey=$SERVICE; "Content-Type"="application/json" } `
  -Method POST -Body $createBody
$userId = $created.id
Write-Host "✓ Created user: $EMAIL id=$userId" -ForegroundColor Green

# login (anon)
$login = Invoke-RestMethod -Uri "$SUPA_URL/auth/v1/token?grant_type=password" `
  -Method POST -Headers @{ apikey=$ANON; "Content-Type"="application/json" } `
  -Body (@{ email=$EMAIL; password=$PASSWORD } | ConvertTo-Json)
$TOKEN = $login.access_token
Write-Host ("✓ Got token: " + $TOKEN.Substring(0,20) + "…") -ForegroundColor Green

# === 5) DB: aynı kullanıcıya ait gerçek wardrobe_items ekle (service_role) ===
$ins = Invoke-RestMethod -Uri "$SUPA_URL/rest/v1/wardrobe_items" -Method POST `
  -Headers @{ apikey=$SERVICE; Authorization="Bearer $SERVICE"; "Content-Type"="application/json"; Prefer="return=representation" } `
  -Body (@{
    user_id = $userId
    name = "Smoke Test Item"
    category = "tops"
    colors = @("black")
    tags = @("t-shirt","basic")
    image_uri = $IMG
    processed_image_uri = $IMG
  } | ConvertTo-Json)
$itemId = $ins[0].id
Write-Host "✓ Inserted wardrobe_items.id=$itemId" -ForegroundColor Green

# === 6) CALL FUNCTION with real itemId + public image ===
$fnBody = @{ itemId = $itemId; imageUrl = $IMG } | ConvertTo-Json
try {
  $resp = Invoke-WebRequest -Uri $FN_URL -Method POST `
    -Headers @{ Authorization="Bearer $TOKEN"; "Content-Type"="application/json" } `
    -Body $fnBody -ErrorAction Stop
  $text = [Text.Encoding]::UTF8.GetString($resp.Content)
  Write-Host "✓ ai-analysis 200 OK" -ForegroundColor Green
  Write-Host $text
} catch {
  $r = $_.Exception.Response
  if ($r) {
    $rd = New-Object IO.StreamReader($r.GetResponseStream()); $b = $rd.ReadToEnd()
    Write-Host ("ai-analysis HTTP " + [int]$r.StatusCode) -ForegroundColor Yellow
    Write-Host $b
    Write-Host ""
    Write-Host "NOT:" -ForegroundColor Yellow
    Write-Host "- Eğer mesaj 'Invalid authentication' değilse ve 'Cloudinary configuration is missing' görürsen, AUTH düzelmiştir." -ForegroundColor Yellow
    Write-Host "- Cloudinary kullanmak için: supabase secrets set CLOUDINARY_CLOUD_NAME=\"<your_cloud_name>\"" -ForegroundColor Yellow
  } else { Write-Host "Unknown error" }
}
# =============================================================

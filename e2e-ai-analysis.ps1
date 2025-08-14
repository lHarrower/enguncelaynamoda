# e2e-ai-analysis.ps1  —  AYNAMODA uçtan uca smoke testi
$ErrorActionPreference = "Stop"

# === 0) Proje sabitleri ===
$SUPA_URL = "https://sntlqqerajehwgmjbkgw.supabase.co"
$FN_URL   = "https://sntlqqerajehwgmjbkgw.functions.supabase.co/ai-analysis"
$BUCKET   = "wardrobe"
$TEST_OBJ = "test.png"
$TEST_IMG_PUBLIC = "$SUPA_URL/storage/v1/object/public/$BUCKET/$TEST_OBJ"

function Read-Secret([string]$prompt) {
  $sec = Read-Host $prompt -AsSecureString
  [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
  )
}
function Read-ErrBody($err){
  if($err.Exception -and $err.Exception.Response){
    $rd = New-Object IO.StreamReader($err.Exception.Response.GetResponseStream())
    return $rd.ReadToEnd()
  }
  return ""
}

Write-Host "== Step 1) Anahtarları al ==" -ForegroundColor Cyan
$SERVICE = Read-Secret "Paste SERVICE_ROLE key"
$ANON    = Read-Secret "Paste ANON key"

# Admin header
$adminH = @{ apikey=$SERVICE; Authorization="Bearer $SERVICE"; "Content-Type"="application/json" }

Write-Host "== Step 2) Smoke user oluştur & login ==" -ForegroundColor Cyan
$stamp = (Get-Date -Format "yyyyMMddHHmmss")
$email = "hkillibacak0+smoke-$stamp@gmail.com"
$pwd   = "Smoke!$stamp"

# 2a create
try {
  $body = @{ email=$email; password=$pwd; email_confirm=$true } | ConvertTo-Json
  $created = Invoke-RestMethod -Uri "$SUPA_URL/auth/v1/admin/users?apikey=$SERVICE" -Headers $adminH -Method POST -Body $body
  $uid = $created.id
  Write-Host "✓ CREATED $email | uid=$uid"
} catch {
  $b = Read-ErrBody $_
  throw "Admin create failed: $b"
}

# 2b password login
try {
  $login = Invoke-RestMethod -Uri "$SUPA_URL/auth/v1/token?grant_type=password" -Method POST `
    -Headers @{ apikey=$ANON; "Content-Type"="application/json" } `
    -Body (@{ email=$email; password=$pwd }|ConvertTo-Json)
  $TOKEN = $login.access_token
  $uid = $login.user.id
  Write-Host ("✓ LOGIN token: " + $TOKEN.Substring(0,20) + "… | uid=" + $uid)
} catch {
  $b = Read-ErrBody $_
  throw "Login failed: $b"
}

Write-Host "== Step 3) Storage test objesi =="$ -ForegroundColor Cyan
# 1x1 png oluştur
$bytes = [Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAoMBgWgq8P0AAAAASUVORK5CYII=")
[IO.File]::WriteAllBytes($TEST_OBJ,$bytes) | Out-Null

# bucket oluştur (varsa sorun etme)
try {
  Invoke-RestMethod -Uri "$SUPA_URL/storage/v1/bucket" -Method POST `
    -Headers @{ apikey=$SERVICE; Authorization="Bearer $SERVICE"; "Content-Type"="application/json" } `
    -Body (@{ name=$BUCKET; public=$true }|ConvertTo-Json) | Out-Null
} catch { } # 409 ise geç

# dosya yükle
try {
  Invoke-RestMethod -Uri "$SUPA_URL/storage/v1/object/$BUCKET/$TEST_OBJ" -Method POST `
    -Headers @{ apikey=$SERVICE; Authorization="Bearer $SERVICE"; "Content-Type"="image/png" } `
    -InFile $TEST_OBJ | Out-Null
  Write-Host "✓ Uploaded: $TEST_IMG_PUBLIC"
} catch {
  $b = Read-ErrBody $_
  if($b -notmatch "already exists"){ throw "Upload failed: $b" } else { Write-Host "ℹ already exists: $TEST_IMG_PUBLIC" }
}

Write-Host "== Step 4) wardrobe_items insert ==" -ForegroundColor Cyan
$userH = @{ apikey=$ANON; Authorization="Bearer $TOKEN"; "Content-Type"="application/json"; Prefer="return=representation" }
$item = $null
try {
  $payload = @(
    @{
      user_id             = $uid
      image_uri           = $TEST_IMG_PUBLIC
      processed_image_uri = $TEST_IMG_PUBLIC
      category            = "tops"
      colors              = @("#000000")
      tags                = @("smoke","test")
      brand               = "SmokeTest"
    }
  ) | ConvertTo-Json
  $ins = Invoke-RestMethod -Uri "$SUPA_URL/rest/v1/wardrobe_items" -Headers $userH -Method POST -Body $payload
  if($ins -is [System.Array]){ $item = $ins[0] } else { $item = $ins }
  Write-Host ("✓ INSERT id=" + $item.id)
} catch {
  $b = Read-ErrBody $_
  throw "Insert failed: $b"
}

Write-Host "== Step 5) ai-analysis çağır ==" -ForegroundColor Cyan
try {
  $fnBody = @{ itemId=$item.id; imageUrl=$TEST_IMG_PUBLIC } | ConvertTo-Json
  $resp = Invoke-RestMethod -Uri $FN_URL -Method POST -Headers @{ Authorization="Bearer $TOKEN"; apikey=$ANON; "Content-Type"="application/json" } -Body $fnBody
  Write-Host "[ANALYSIS]"
  $resp | ConvertTo-Json -Depth 8
} catch {
  $b = Read-ErrBody $_
  throw "ai-analysis failed: $b"
}

Write-Host "== BİTTİ ==" -ForegroundColor Green

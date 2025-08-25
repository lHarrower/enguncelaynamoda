# Denetim Betikleri

Birleşik denetim toplama için başlangıç omurgası.

## Betikler

- `run-static.ps1` : Runs eslint, semgrep (fast), dead code, then aggregation.
- `aggregate.ts` : Normalises tool outputs into `audit/out/master-report.json` + `SUMMARY.md` and enforces gates from `config/audit/thresholds.json`.

## Çıktı Yapısı

```
audit/
  out/
    static/
      eslint.json
      semgrep.json
      deadcode.json
    master-report.json
    SUMMARY.md
```

## Genişletme

Toplayıcıyı çağırmadan önce `audit/out/**` (herhangi bir klasör) altına yeni araç JSON çıktıları ekleyin. `.json` dosyalarını otomatik keşfeder (master-report hariç).

## Kapılar

Şu anda zorunlu kılınan (aggregate.ts):

- Critical security findings <= thresholds.security.criticalVulnMax
- High security findings <= thresholds.security.highVulnMax
- ESLint errors <= thresholds.quality.eslintErrorMax
  - Uses baseline diff: file `config/audit/baseline/eslint-baseline.json` defines current total; gate counts only new errors beyond baseline.
- Dead exports (ts-prune) <= thresholds.quality.deadExportsMax
- Any deny-listed license (fail if > 0)
- Any secrets detected (fail if > 0)
- Performance p50/p95 / frame drop gates (thresholds.performance)
- Accessibility label coverage & contrast (thresholds.a11y)
- Coverage (statements / branches / lines / functions %) if `audit/out/coverage/lcov-summary.json` exists and coverage thresholds configured
- Mutation score (Stryker) if `audit/out/mutation/mutation-report.json` exists and mutation threshold configured

### Güvenlik Açığı Normalleştirme

OSV & Snyk JSON artık tekleştirilir: aynı paket+id ikilisi dedupe edilir ve security kategorisine taşınır. CVSS numeric skorları severity (critical/high/medium/low) eşlemesine dönüştürülür.

## Gizli Bilgiler İzin Listesi

Dosya: `config/audit/secrets-allowlist.json` bulgu açıklaması veya dosya yoluna karşı test edilen regex parçacıklarının `patterns` dizisi ile (büyük/küçük harf duyarsız). Eşleşen bulgular kapı sayımından hariç tutulur (master-report'ta hala kaydedilir).

## Geçmiş Arşivleme

Her toplama işlemi `audit/history/report-<ISO>.json` altında zaman damgalı bir anlık görüntü saklar ve daha sonra trend analizi araçlarını etkinleştirir.

## HTML Raporu

Toplayıcı artık şunları içeren `audit/out/report.html` yazar:

- Gate pass/fail list
- Key metrics with sparkline trend (coverage statements %, mutation score %, new ESLint errors)
- Raw sections for quality, licenses, secrets, coverage, mutation
  History window: last 15 snapshots for trend.

### Rozetler

SVG rozetler `audit/out/badges/` klasöründe üretilir: coverage, mutation, eslint-new, security-hc. README veya portalınıza embed edebilirsiniz.

### Risk Kabul Çıktısı

`risk.accepted` metrikleri master-report.json ve SUMMARY.md’de yer alır; kabul edilen bulgular gate dışında tutulur.

## Performans ve Erişilebilirlik Ayrıştırıcıları

- `perf-trace-parser.ts` girdileri: `audit/in/perf/raw-startup.json` (num array), `audit/in/perf/frames.json` (droppedFrames/totalFrames) -> `perf.json`.
- `a11y-scan.ts` girdisi: `audit/in/a11y/elements.json` -> labelCoverage & contrastIssues.

## CI Modları

- PR (hafif): `audit:pr` (static + coverage + perf parse + a11y scan) mutation testi yok.
- Full (push/nightly): tüm metrikler + mutation.

## PDF Raporu (Opsiyonel)

`npm run audit:pdf` komutu `puppeteer` yüklüyse `audit/out/report.pdf` üretir; yoksa sessizce atlar.

## RLS Negatif Testleri

`supabase/policy-matrix.json` sağlayın (`policy-matrix.example.json`'a bakın). RLS test betiği şunlar için bulgular üretir:

- Eksik matris dosyası
- Anonim yıkıcı erişim (anon insert/update/delete)
- Ayrıcalıklı roller (service_role/admin) atlanmış (düşük önem dereceli uyarı)
- Silme izni var ama güncelleme işlemi eksik (tutarlılık)

## Risk Kabulü

Opsiyonel dosya: `config/audit/risk-acceptance.json` (örneğe bakın). Girişler:

```
[{ "idPattern": "regex", "expires": "YYYY-MM-DD", "reason": "why" }]
```

Eşleşen bulgular `accepted: true` alır ve süresi dolana kadar güvenlik kapısı sayımından hariç tutulur. Süresi dolan kabuller kapı başarısızlıklarını tetikler.

Kapı Detayları JSON: master-report artık programatik tüketim (panolar, PR açıklamaları) için `{ domain, name, message }` nesneleri ile `gatesDetailed` dizisini içerir.

Snyk Entegrasyonu (opsiyonel): `run-deps.ps1` Snyk CLI ve `SNYK_TOKEN` mevcutsa `audit/out/deps/snyk.json` üretir; toplayıcı OSV ile birlikte tekilleştirir.

`aggregate.ts` içindeki summarise() fonksiyonunu `addGate(domain,name,message)` yardımcısını kullanarak yeni alan kapıları eklemek için genişletin.

## Yol Haritası (sonraki)

- Jest kapsama özetini `audit/out/coverage/lcov-summary.json` içine üreten betik ekle (şu anda toplayıcı mevcutsa tüketir)
- `audit/out/mutation/mutation-report.json` çıktısı veren Stryker mutasyon test çalıştırıcısı ekle
- Yer tutucuları değiştiren gerçek performans enstrümantasyonu (Detox yakalama) ve erişilebilirlik taraması (axe)
- Bilinen kalıpları düşürmek için gizli bilgiler izin listesi dosyası
- HTML/PDF raporu ve trend arşivleme (tarih damgalı anlık görüntüler)

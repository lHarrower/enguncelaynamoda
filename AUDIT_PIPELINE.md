# AYNAMODA Ultra Derin Teknik & Güvenlik Audit Pipeline

Bu doküman mevcut uygulamayı BOZMADAN, yeni ürün özelliği eklemeden; sadece kalite, güvenlik, performans, erişilebilirlik ve yayın güvenilirliğini kanıtlanabilir şekilde yükseltmek için tasarlanmış nihai denetim çerçevesidir.

## Stratejik İlkeler

- Zero Feature Drift: Üretim davranışı değişmeden iyileştirme / tespit
- Kanıtlanabilirlik: Her bulguya otomatik üretilmiş artefakt (log, rapor, ekran görüntüsü, JSON)
- Tek Kaynaklı Nihai Rapor: Tüm alt raporlar JSON + PDF konsolidasyonu
- Idempotent Çalıştırma: Tek komutla tekrar üretilebilir sonuç
- Risk Önceliklendirme: CVSS + İş Etkisi (Kritik / Yüksek / Orta / Düşük)

## 0. Orkestrasyon Katmanı (ÇATI)

Komut: `pnpm audit:all` (veya `npm run audit:all`) tüm alt aşamaları sıralı / paralel çalıştırır, `./audit-output/manifest.json` üretir.

Pipeline Fazları:

1. Kod & Mimari Statik Analiz
2. Bağımlılık / Supply Chain / SBOM
3. Sır & PII Sızıntı Taraması
4. Mobil Spesifik Güvenlik (Android/iOS artefaktları)
5. Supabase & Backend Güvenlik (RLS / Policy / Input Validation)
6. Performans & Bundle & Bellek Profili
7. Erişilebilirlik (WCAG 2.2 AA)
8. Test Güvenirliği, Kapsam & Mutasyon Analizi
9. Dayanıklılık / Chaos / Ağ Hata Enjeksiyonu
10. Observability & Log Hijyen Denetimi
11. Gizlilik & Veri Envanteri (Data Flow Mapping)
12. Yayın & Build Bütünlüğü (Reproducibility + SBOM İmzalama)
13. Threat Modeling & Risk Tablosu Otomasyonu
14. Nihai Konsolidasyon & Skorlama

---

## 1. Kod & Mimari Statik Analiz

Araçlar:

- ESLint (strict) + TypeScript `--noUnused* --exactOptionalPropertyTypes`
- Semgrep (güvenlik + framework kuralları)
- SonarQube (opsiyonel self-host) / CodeQL (GitHub)
- Dependency Graph & Cycle: **depcruise** + **madge** → `architecture-graph.svg`
- Kompleksite: `ts-complex` / Plato raporu

Çıktılar:

- `audit-output/code/semgrep.json`
- `audit-output/code/eslint.json`
- `audit-output/code/dependency-cycles.json`
- `audit-output/code/complexity-summary.md`

Özel Kurallar (örnek):

- Yasak `any` (istisna: test shim) → severity: medium
- Catch bloklarında çıplak `error.message` log + PII örüntüsü → severity: high
- Unvalidated Supabase insert/update → severity: high

## 2. Bağımlılık / Supply Chain

Araçlar: `npm audit --omit=dev --json`, Snyk (CI), OWASP Dependency-Check (CVEs), **CycloneDX SBOM** üretimi, Lisans tarama (license-checker, ClearlyDefined).

Çıktılar: `audit-output/deps/sbom.json`, `licenses.csv`, `vuln-report.json`
Ek Doğrulama: Hash kilidi → `package-lock.json` / `pnpm-lock.yaml` integrity diff.

## 3. Sır & PII Sızıntı Taraması

Araçlar: Gitleaks, TruffleHog, Regex PII tarayıcı (email, phone, iban, tc?).
Çıktı: `audit-output/secrets/findings.json`
Fail Conditions: Hardcoded API key, Supabase anon/public key dışı gizli anahtar.

## 4. Mobil Spesifik Güvenlik

Adımlar:

- Android Manifest inceleme (izin suistimali, exported activity)
- iOS entitlements plist denetimi
- MobSF static scan (apk / ipa build artefaktı) → `mobsf-report.json`
- Reverse engineering sertlik: minify/obfuscate (hermetik JS bundling, source map kontrollü)

## 5. Supabase & Backend Güvenliği

Otomatik RLS Test Matrisi:

- Roller: (Anon, Auth(UserA), Auth(UserB), Service)
- Kaynak: Wardrobe, Feedback, Recommendation tabloları
- Aksiyon: SELECT/INSERT/UPDATE/DELETE
  Script Jest içinde: her kombinasyon → izin / engelleme assertion.

Ek: Zod şema validasyonu coverage → Hangi endpoint hangi şema ile doğruluyor listesi.

Çıktı: `audit-output/backend/rls-matrix.json`, `validation-coverage.json`

## 6. Performans & Bundle & Bellek

Araçlar:

- `react-native-bundle-visualizer` → `bundle-report.html`
- Hermes profile + JS heap snapshot (devtools) → leak diffs
- Flipper network tracker export → `network-latency.json`
- Synthetic cold start ölçümü (detox scripti ilk render süresi)

Metrix: TTI, Başlangıç JS Boyutu, Aşırı büyük modül (>150KB), Resim inlining anomali.

## 7. Erişilebilirlik

Katmanlar:

- Statik kurallar: axe-core RN adaptasyonu (custom harness)
- Renk kontrast simülasyonu: script ile `DesignSystem` palette kontrast matris üretimi
- Focus order testleri: Detox scenario (gesture → expected focus chain)

Çıktı: `audit-output/a11y/violations.json`, `contrast-matrix.csv`

## 8. Test Güvenirliği & Mutasyon

Adımlar:

- Coverage threshold (global ≥ 85%, kritik modüller ≥ 90%)
- Mutation testing: Stryker (TS) → öldürülmeyen mutantlar listesi
- Flaky test algılayıcı: Aynı suite 3 tekrar, değişken sonuç raporu

Çıktı: `audit-output/tests/coverage-final.json`, `mutation-report.html`, `flaky-tests.json`

## 9. Dayanıklılık / Chaos

Senaryolar:

- Ağ kesinti (timeout, 500, yavaşlık) → useErrorRecovery davranış ispatı
- Supabase rate limit simulasyonu (429) → retry/backoff doğrulama
- Disk dolu / AsyncStorage hata enjeksiyonu → graceful degrade

Çıktı: `audit-output/resilience/chaos-log.json`

## 10. Observability & Log Hijyen

Kurallar:

- PII redaction (email -> `[REDACTED_EMAIL]`)
- Konsol gürültüsü seviyesi (prod build'te sadece error sınırı)
- Error taxonomy örtüşmesi: AppError.category vs handler expectation diff

## 11. Gizlilik & Veri Envanteri

Otomatik kaynak kod taraması: `collectUser|email|phone|address` gibi patternler → Data Entity Listesi
Manuel doğrulama ek alan: Kaynak → Depolama → İletim → Retention
Çıktı: `audit-output/privacy/data-map.json`

## 12. Yayın & Build Bütünlüğü

- Deterministic build hash karşılaştırma (aynı commit iki build -> aynı bundle boyutu tolerans ±1%)
- Source map doğrulama (sourcemap tüketilebilir / hatasız line mapping smoke)
- SBOM imzalama (cosign opsiyonel)

## 13. Threat Modeling

- Otomatik STRIDE matrisi generator (kaynak = data-map + endpoint list)
- Manuel ek risk anotasyon alanı
  Çıktı: `audit-output/threat/threat-model.json`

## 14. Konsolidasyon

`scripts/audit/aggregate.ts` tüm JSON'ları okuyup:

- Risk Tablosu (CSV + Markdown)
- Öncelik Sırası (Eisenhower + Risk skor sort)
- Nihai PDF (Pandoc veya md-to-pdf)

## Risk Skorlama Formülü

`risk = CVSS_base * exploitability_modifier * (business_impact ∈ {1..3})`

- Otomatik kategori: `>=7.5 kritik`, `5-7.4 yüksek`, `3-4.9 orta`, `<3 düşük`

## Örnek Komut Seti (Planlanan)

```
npm run audit:code
npm run audit:deps
npm run audit:secrets
npm run audit:rls
npm run audit:perf
npm run audit:a11y
npm run audit:tests
npm run audit:chaos
npm run audit:aggregate
```

## Ek Derinlik (Mevcut Plana Eklenen)

- Sır Taraması, Mutasyon Testi, Chaos Engineering, Threat Modeling, Data Flow Haritası, Build Determinism, Log Hijyen Skoru, STRIDE Otomasyonu, SBOM + İmza, Flaky Test Dedektörü.

## Uygulama Aşamaları (Sprint Önerisi)

1. Altyapı (scripts + temel config + boş rapor dizini)
2. Kod & Bağımlılık & Secrets
3. RLS + Validation + Threat Data Toplama
4. Performans + A11y + Coverage
5. Mutasyon + Chaos + Observability
6. Konsolidasyon + PDF + CI entegrasyon

## Dizin Yapısı (Önerilen)

```
scripts/audit/
  run-all.ps1
  config/
    semgrep-rules.yaml
    depcruise.json
  collectors/
    collect-deps.ts
    collect-rls.ts
    collect-a11y.ts
  aggregate.ts
audit-output/ (gitignore)
```

## Sonuç

Bu çerçeve yeni özellik eklemeden mevcut uygulamayı ölçülebilir şekilde “kurumsal yayın olgunluğu” seviyesine taşımak için yeterlidir. Bir sonraki adım: script iskeletlerinin eklenmesi & CI task wiring (GitHub Actions / EAS).

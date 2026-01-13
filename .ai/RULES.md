# ⚖️ Proje Anayasası (Döviz Servisi)

## 1. Finansal Hassasiyet
- **KURAL:** Asla `number` (float) ile hesaplama yapma.
- **ARAÇ:** Daima `decimal.js` kullan.
- **FORMAT:** Kur değerlerini veritabanında/cache'te string olarak sakla, işlem anında Decimal'e çevir.

## 2. Mimari Standartlar
- **YAPI:** Controller -> Service -> Provider (External API) -> Cache.
- **PATH ALIAS:** Daima `@/` prefix'ini kullan (Örn: `@/modules/currency/...`).
- **VALIDATION:** Tüm inputlar (Request Params/Query) `Zod` ile doğrulanmalıdır.

## 3. Loglama ve İzlenebilirlik
- **REQ_ID:** Her isteğe bir `X-Correlation-Id` atanmalı.
- **LOGGER:** `winston` kullanılmalı. Hatalarda `stack trace` loglanmalı ancak kullanıcıya `JSON Error Code` dönülmelidir.

## 4. Hata Yönetimi
- **STANDART:** Hata mesajları dile duyarlı (i18n hazır) hata kodları (`ERR_INVALID_CURRENCY` vb.) ile dönülmelidir.
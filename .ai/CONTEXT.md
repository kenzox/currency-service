# 📍 Mevcut Bağlam (Current Context)

## Tamamlananlar (Done)
- [x] Proje klasör yapısı oluşturuldu.
- [x] `tsconfig.json` ve Path Alias (@/*) tanımlandı.
- [x] Docker ve Docker Compose (App + Redis) hazırlandı.
- [x] `.env` yönetimi ve Zod validasyonu kuruldu.
- [x] Loglama altyapısı (Winston + Correlation ID) yapılandırıldı.

## Sırada Ne Var? (Next Steps)
- [x] `ExternalApiProvider` entegrasyonu (currencyapi.com).
- [x] `Redis` bağlantı servisinin yazılması.
- [x] Cross-rate hesaplama motorunun (ExchangeRateService) inşası.
- [x] Hassasiyet ayarı (DECIMAL_PRECISION) eklendi.
- [x] Unit testler (EUR->TRY, GBP->USD) tamamlandı.
- [x] **API & Validasyon:** `GET /convert` ve `GET /rates` endpointleri. Zod ile validation.
- [x] **Hata Yönetimi:** Global Error Filter, Correlation ID ve standart hata yanıtları.
- [x] **Swagger:** `/api-docs` altında dökümantasyon.
- [x] **Delivery:** Health check (Redis status), README, Postman Collection, Cache Logs.
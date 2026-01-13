# 📝 Değişim Günlüğü

### [2026-01-13] - Başlangıç
- **İşlem:** Proje iskeleti kuruldu.
- **Detay:** NestJS/Express temeli atıldı, Dockerize edildi.
- **Karar:** Finansal güvenlik için `decimal.js` kütüphanesi eklendi.
- **Update:** Dış API Entegrasyonu (currencyapi) ve Redis Servisi (Resilient) eklendi. Unit test şablonları oluşturuldu.
- **Feature:** `CurrencyService` ile cross-rate hesaplama motoru devreye alındı. `decimal.js` hassasiyeti korundu. Cache stratejisi (Redis -> API -> Cache) uygulandı.
- **Code Quality:** Global Error Handler, Correlation ID Middleware ve Zod Validation katmanları eklendi. API endpointleri Swagger ile dokümante edildi. `crypto` ile native UUID kullanıldı.
- **Delivery:** `/health` endpoint eklendi. README.md hazırlandı. Postman koleksiyonu oluşturuldu. Cache doğrulama mekanizması eklendi.
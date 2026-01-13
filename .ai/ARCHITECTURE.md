# 🏛️ Mimari Tasarım

## Veri Akış Şeması (Workflow)
1. **Request:** Kullanıcıdan `/convert` isteği gelir.
2. **Validation:** Zod, parametreleri (`from`, `to`, `amount`) doğrular.
3. **Cache Check:** Redis'te ilgili kur var mı?
   - **EVET:** Cache'ten veriyi al.
   - **HAYIR:** `ExternalApiProvider` üzerinden `currencyapi.com`'a git -> Cache'i güncelle.
4. **Logic:** `ExchangeRateService` üzerinden Cross-Rate (Köprü Hesaplama) yap.
5. **Response:** `decimal.js` ile hesaplanmış sonucu dön.

## Hata Toleransı (Resilience)
- **Redis Down:** Redis erişilemezse uygulama hata vermez, doğrudan API'ye gider (Loglara uyarı basar).
- **API Down:** Dış servis kapalıysa, cache'teki son veri (expired olsa bile) "stale-while-revalidate" mantığıyla dönülebilir (opsiyonel).

## ⚠️ Geçici Çözümler & Limitler (Booking.com Senaryosu)

Bu servis Booking.com gibi devasa bir trafik altında çalışsaydı, şu noktalarda darboğaz yaşanabilirdi:

### 1. External API Quota (En Kritik)
- **Sorun:** `currencyapi.com` veya benzeri sağlayıcıların günlük istek limiti dolarsa, servis **500** dönmeye başlar.
- **Çözüm:** 
  - **Multi-Provider Strategy:** Tek bir sağlayıcı yerine (Provider A -> Provider B -> Provider C) zinciri kurulmalı.
  - **Stale-While-Revalidate:** Cache süresi dolsa bile, API başarısızsa eski veri ile yanıt verilmeye devam edilmeli (Circuit Breaker).

### 2. Redis Network Saturation
- **Sorun:** Çok yüksek trafikli anlarda (Black Friday), her request için Redis'e gitmek network I/O darboğazı yaratabilir.
- **Çözüm:**
  - **L1 In-Memory Cache:** Node.js process belleğinde (LRU Cache) çok kısa süreli (1-2 sn) bir önbellek tutulmalı.
  - **Read Replicas:** Redis Cluster/Sentinel yapısına geçilmeli.

### 3. CPU Bound (Decimal.js)
- **Sorun:** `decimal.js` hassas hesaplama yapar ancak native float işleminden yavaştır. Milyonlarca işlemde CPU şişebilir.
- **Çözüm:** 
  - **Horizontal Scaling:** auto-scaling grupları ile Node.js instance sayısı artırılmalı.
  - **Worker Threads:** Hesaplama işi ana thread'den ayrılmalı.
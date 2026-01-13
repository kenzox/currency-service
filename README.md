# Currency Service (PixelArt 2026)

Profesyonel Döviz Dönüştürme API Servisi.

## 🚀 Özellikler

- **Multi-Cloud Resilience:** Redis önbellekleme ve External API (currencyapi) yedekleme mekanizması.
- **Finansal Hassasiyet:** `decimal.js` ile sıfır kayıplı hesaplama.
- **Güvenlik & Validasyon:** Zod ile sıkı veri doğrulama.
- **İzlenebilirlik:** Her istek için `X-Correlation-Id` takibi.
- **API Dokümantasyonu:** Swagger/OpenAPI entegrasyonu.

## 🛠 Mimari & Teknolojiler

- **Runtime:** Node.js (TypeScript)
- **Framework:** Express.js
- **Database:** Redis (Caching)
- **Architecture:** Modular (Controller-Service-Provider)
- **Containerization:** Docker & Docker Compose (Multi-stage build)

## 📦 Kurulum ve Çalıştırma

### Gereksinimler
- Docker & Docker Compose

### Adımlar

1. Projeyi klonlayın:
   ```bash
   git clone <repo-url>
   cd currency-service
   ```

2. `.env` dosyasını oluşturun:
   ```bash
   cp .env.example .env
   # .env içindeki CURRENCY_API_KEY değerini güncelleyin
   ```

3. Docker ile ayağa kaldırın:
   ```bash
   docker-compose up --build
   ```

4. Servis `http://localhost:3000` adresinde çalışacaktır.

## 🔌 API Endpointleri

### 1. Döviz Dönüştürme
**GET** `/convert`

- **Parametreler:**
  - `amount`: Tutar (Pozitif sayı)
  - `from`: Kaynak para birimi (3 karakter, örn: USD)
  - `to`: Hedef para birimi (3 karakter, örn: TRY)

- **Örnek İstek:**
  ```http
  GET /convert?amount=100&from=USD&to=TRY
  ```

- **Örnek Yanıt:**
  ```json
  {
    "success": true,
    "data": {
      "amount": 100,
      "from": "USD",
      "to": "TRY",
      "result": "3425.5000"
    },
    "correlationId": "a1b2c3..."
  }
  ```

### 2. Kurları Getir
**GET** `/rates`

- **Parametreler:**
  - `base`: Baz para birimi (Varsayılan: USD)

### 3. Sağlık Kontrolü (Health Check)
**GET** `/health`

## 🚨 Hata Kodları

| Kod | Açıklama | HTTP Status |
|---|---|---|
| `ERR_VALIDATION` | Eksik veya hatalı parametre | 400 |
| `ERR_UNSUPPORTED_CURRENCY` | Desteklenmeyen para birimi | 400 |
| `ERR_INTERNAL` | Sunucu hatası | 500 |
| `ERR_EXTERNAL_API_FAILED` | Dış servis hatası | 502 |

## 🧪 Testler

```bash
# Unit & Integration Testleri
npm test
```

# Etkileşimli Kriptografik Algoritma Analiz ve Görselleştirme Platformu

Bu proje, Kriptografi ve Uygulamaları dersi final yönergesine göre hazırlanmış bağımlılıksız bir web uygulamasıdır.

## Çalıştırma

En pratik yöntem:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Sonra tarayıcıda `http://127.0.0.1:4173/index.html` adresini açın. İnternet bağlantısı gerekmez.

Not: `index.html` dosyası doğrudan da açılabilir; ancak SHA-256/HMAC modülü bazı tarayıcılarda güvenli bağlam istediği için `localhost` üzerinden çalıştırmak daha güvenilirdir.

## Modüller

- AES-128 round görselleştirme: SubBytes, ShiftRows, MixColumns ve AddRoundKey adımları.
- GF(2^8) hesaplayıcı: XOR toplama, indirgemeli çarpma ve adım izi.
- DES / 3-DES eğitsel modülü: Feistel ağı ve 3-DES EDE mantığı.
- SHA-256 ve HMAC-SHA-256: Web Crypto API ile bütünlük ve kimlik doğrulama örnekleri.
- Rastgele bit üretimi: `crypto.getRandomValues` ile CSPRNG ve basit frekans testi.

## Teslim İçeriği

- `index.html`: Uygulama arayüzü.
- `styles.css`: Görsel tasarım.
- `src/crypto-core.js`: Algoritma çekirdeği.
- `src/app.js`: Arayüz etkileşimleri.
- `RAPOR.md`: Proje raporu.
- `test.js`: AES ve GF işlemleri için yerel doğrulama.

## Test

```powershell
node test.js
```

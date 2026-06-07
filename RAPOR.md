# Etkileşimli Kriptografik Algoritma Analiz ve Görselleştirme Platformu

## 1. Giriş

Kriptografik algoritmalar yalnızca formüllerle anlatıldığında soyut kalabilir. Bu proje, DES, 3-DES, AES, hash fonksiyonları, MAC yapıları, Galois Alanları ve rastgele bit üretimi gibi ders konularını etkileşimli bir platform üzerinden görünür hale getirmek için geliştirilmiştir.

Amaç, yeni ve karmaşık bir kriptosistem tasarlamak değil; mevcut algoritmaların iç işleyişini eğitim amaçlı olarak adım adım incelemektir. Kullanıcı metin ve anahtar girebilir, AES round adımları arasında ileri/geri gezebilir, GF(2^8) işlemlerinin izini görebilir, DES ile 3-DES mantığını karşılaştırabilir, SHA-256/HMAC çıktıları üretebilir ve kriptografik rastgele bit üretimini deneyebilir.

## 2. Arka Plan ve Teorik Temeller

### Simetrik Kriptografi

Simetrik kriptografide şifreleme ve çözme için aynı gizli anahtar kullanılır. DES, 64 bit bloklar üzerinde çalışan Feistel tabanlı tarihsel bir algoritmadır. Anahtar uzunluğu günümüz için yetersiz kaldığından 3-DES, DES işlemini şifrele-çöz-şifrele sırasıyla birden fazla anahtarla uygulayarak güvenliği artırmayı amaçlamıştır.

AES, modern simetrik şifreleme standardıdır. AES-128, 16 byte veri bloğu ve 16 byte anahtar kullanır. Algoritma durum matrisini roundlar boyunca dönüştürür. Temel adımlar SubBytes, ShiftRows, MixColumns ve AddRoundKey işlemleridir.

### Galois Alanları GF(2^8)

AES byte değerlerini GF(2^8) alanının elemanları olarak ele alır. Bu alanda toplama XOR işlemidir. Çarpma ise polinom çarpımı ve indirgeme işlemiyle yapılır. AES'te indirgeme polinomu:

`x^8 + x^4 + x^3 + x + 1`

Bu yapı özellikle MixColumns adımında kullanılır. MixColumns, her sütunu sabit bir matrisle GF(2^8) üzerinde çarpar ve difüzyonu artırır.

### Hash Fonksiyonları

Hash fonksiyonları değişken uzunluklu girdileri sabit uzunluklu özetlere dönüştürür. SHA-256, 256 bit çıktı üretir. Veri bütünlüğü kontrolünde kullanılır; küçük bir girdi değişikliği büyük ve öngörülemez çıktı değişikliğine yol açar.

### MAC ve HMAC

MAC, mesajın hem bütünlüğünü hem de kaynağını doğrulamak için kullanılır. HMAC, kriptografik hash fonksiyonunu gizli anahtarla birleştirir. Bu projede HMAC-SHA-256 kullanılmıştır.

### Rastgele Bit Üretimi

Kriptografik anahtarlar, IV/nonce değerleri ve protokollerdeki birçok güvenlik parametresi güvenli rastgeleliğe ihtiyaç duyar. Projede tarayıcıların kriptografik rastgele sayı üreticisi olan `crypto.getRandomValues` kullanılmış ve üretilen bitler üzerinde basit frekans testi gösterilmiştir.

## 3. Sistem Tasarımı

Platform bağımlılıksız statik web uygulaması olarak tasarlanmıştır. Bu tercih, kolay teslim ve çalıştırma sağlar.

Mimari bileşenler:

- Algoritma motoru: `src/crypto-core.js`
- Görselleştirme ve kullanıcı etkileşimi: `src/app.js`
- Arayüz yapısı: `index.html`
- Stil dosyası: `styles.css`

Arayüz beş modüle ayrılmıştır:

- AES Görselleştirme
- Galois Alanı
- DES / 3-DES
- Hash ve HMAC
- Rastgele Bit Üretimi

## 4. Uygulama Detayları

### AES Implementasyonu

Projede AES-128 şifreleme akışı elle implemente edilmiştir. Kodda AES S-box tablosu, round constant değerleri, anahtar genişletme, SubBytes, ShiftRows, MixColumns ve AddRoundKey fonksiyonları bulunur.

AES modülü her ara durumu kaydeder. Kullanıcı adımlar arasında gezdiğinde durum matrisi yeniden çizilir ve değişen byte hücreleri vurgulanır. Bu, round işlemlerinin etkisini somutlaştırır.

### GF(2^8) Implementasyonu

GF toplama işlemi XOR ile yapılır. Çarpma işleminde her turda çarpanın düşük biti kontrol edilir, gerekli olduğunda ara değer sonuca XOR ile eklenir. En yüksek bit taşarsa AES indirgeme sabiti `0x1B` uygulanır.

GF hesaplayıcı modülü hem sonucu hem de çarpmanın adım izini gösterir.

### DES ve 3-DES Modülü

Bu bölüm eğitim amaçlı basitleştirilmiş Feistel ağı kullanır. DES'in temel fikri olan sol/sağ yarı blok ayrımı, round fonksiyonu ve XOR ile yeni yarı blok üretimi gösterilir. 3-DES ise EDE yapısı ile modellenir:

`Encrypt(K1) -> Decrypt(K2) -> Encrypt(K1)`

Bu modül tam standart DES yerine ders kavramlarını anlaşılır kılacak sade bir simülasyon olarak tasarlanmıştır.

### Hash ve HMAC Modülleri

SHA-256 ve HMAC-SHA-256 işlemleri tarayıcıların Web Crypto API desteğiyle üretilir. Bu yaklaşım, güvenilir standart implementasyon kullanarak veri bütünlüğü ve mesaj doğrulama kavramlarını gösterir.

### Rastgele Bit Üretimi

RBG modülünde `crypto.getRandomValues` ile byte dizisi üretilir. Byte'lar bit dizisine dönüştürülür ve 0/1 frekansı hesaplanır. Bu test tek başına kriptografik güvenlik kanıtı değildir; ancak rastgelelik kavramını gözlemlemek için basit ve anlaşılır bir göstergedir.

## 5. Kullanılabilirlik ve Eğitimsel Değerlendirme

Platform, kullanıcıyı tek ekranda modüller arasında gezdirecek biçimde tasarlanmıştır. AES modülünde ileri, geri ve otomatik oynatma kontrolleri vardır. Hız ayarı sayesinde kullanıcı round geçişlerini kendi öğrenme temposuna göre izleyebilir.

Görselleştirmenin en önemli katkısı AES'in matris tabanlı yapısını görünür kılmasıdır. SubBytes tek tek byte değişimi, ShiftRows konum değişimi, MixColumns GF aritmetiği ve AddRoundKey XOR işlemi olarak ayrı ayrı açıklanır. Böylece algoritma yalnızca nihai şifreli çıktıdan ibaret kalmaz.

Güçlü yönler:

- AES adımlarının ayrıntılı görselleştirilmesi.
- GF(2^8) çarpmasının izlenebilir olması.
- Hash, HMAC ve RBG kavramlarının aynı platformda gösterilmesi.
- Kurulumsuz ve kolay çalıştırılabilir yapı.

Sınırlılıklar:

- DES modülü standart DES'in tüm permütasyon ve S-box ayrıntılarını içermez; eğitim amaçlı Feistel simülasyonudur.
- RBG modülündeki frekans testi temel düzeydedir; NIST testleri gibi ileri istatistiksel testler eklenebilir.

## 6. Sonuç ve Gelecek Çalışmalar

Bu proje, kriptografik algoritmaların iç işleyişini etkileşimli ve görsel hale getiren bir eğitim platformu sunar. AES, GF(2^8), DES/3-DES mantığı, SHA-256, HMAC ve güvenli rastgele bit üretimi aynı çatı altında ele alınmıştır.

Gelecek geliştirmeler:

- Standart DES'in tüm tablolarıyla eksiksiz implementasyonu.
- AES anahtar genişletme adımlarının ayrıca görselleştirilmesi.
- MD5 ve SHA-1 gibi tarihsel hash fonksiyonlarının güvenlik karşılaştırması.
- NIST rastgelelik testlerinden monobit, runs ve poker testlerinin eklenmesi.
- Kısa etkileşimli alıştırmalar ve otomatik değerlendirme ekranı.

## 7. Kaynakça

- National Institute of Standards and Technology, FIPS 197: Advanced Encryption Standard (AES).
- National Institute of Standards and Technology, FIPS 46-3: Data Encryption Standard (DES).
- National Institute of Standards and Technology, FIPS 198-1: The Keyed-Hash Message Authentication Code (HMAC).
- National Institute of Standards and Technology, SP 800-90A: Recommendation for Random Number Generation Using Deterministic Random Bit Generators.
- Menezes, A. J., van Oorschot, P. C., Vanstone, S. A. Handbook of Applied Cryptography.
- Stallings, W. Cryptography and Network Security.

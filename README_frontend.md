# hk. MüzikAkademi — Frontend

**Türkçe · [English](./README.en.md)**

Bu depo, hk. MüzikAkademi platformunun frontend (istemci tarafı) kodunu içerir. React 19 üzerine kurulu, tek sayfa uygulama (SPA) mimarisiyle geliştirilmiştir. Öğrenci tarafı — kurs vitrin sayfası, video oynatıcı, "Cadenza" yapay zeka asistanı arayüzü, profil/rozet/sertifika ekranları — ve admin paneli (kurs/video yönetimi, izleme analitiği grafikleri) bu repoda kodlanmıştır. Backend'e HTTPS üzerinden `fetch()` ile bağlanır.

Frontend: React 19 · Backend: [hk.MüzikAkademi](https://github.com/berkantkilic777-gif/hk.M-zikAkademi) (ASP.NET Core Web API)

---

## İçindekiler

- [Bu Repo Ne İçeriyor](#bu-repo-ne-i̇çeriyor)
- [Kullanılan Teknolojiler](#kullanılan-teknolojiler)
- [Öne Çıkan Özellikler](#öne-çıkan-özellikler)
- [Sayfa ve Rota Yapısı](#sayfa-ve-rota-yapısı)
- [Backend İletişimi](#backend-i̇letişimi)
- [State Yönetimi](#state-yönetimi)
- [Animasyon ve Performans Yaklaşımı](#animasyon-ve-performans-yaklaşımı)
- [Kurulum](#kurulum)
- [Proje Yapısı](#proje-yapısı)
- [Tasarım Sistemi](#tasarım-sistemi)
- [Bilinen Sınırlamalar](#bilinen-sınırlamalar)
- [Bağlantılar](#bağlantılar)

---

## Bu Repo Ne İçeriyor

hk. MüzikAkademi platformunun kullanıcı arayüzü, React 19 üzerine kurulu bir tek sayfa uygulamasıdır (SPA). Öğrencilerin kurs satın aldığı, video izlediği, Cadenza adlı yapay zeka asistanıyla etkileşime girdiği ve ilerlemesini takip ettiği tüm ekranlar; ayrıca adminlerin platformu yönettiği kontrol paneli bu depoda kodlanmıştır. Uygulama, backend ile herhangi bir sunucu taraflı render (SSR) olmadan, tamamen istemci tarafında çalışan bir mimariyle iletişim kurar.

## Kullanılan Teknolojiler

| Teknoloji | Kullanım Amacı |
|---|---|
| React 19 | Bileşen tabanlı UI kütüphanesi |
| React Router 7 | Client-side routing (SPA yönlendirme) |
| Vite 8 | Build aracı / geliştirme sunucusu |
| Tailwind CSS v4 | `@theme` tabanlı, merkezi tasarım token sistemi |
| Framer Motion | Sayfa geçişleri, hover animasyonları, modallar |
| Web Speech API (tarayıcı yerleşik) | Sesli okuma (TTS) ve mikrofonla soru sorma (STT) |
| Web Audio API (tarayıcı yerleşik) | Arayüz bildirim sesleri |
| MediaDevices API (tarayıcı yerleşik) | Kamera erişimi (Cadenza fotoğraf çekimi) |

Harici bir state yönetim kütüphanesi (Redux, Zustand vb.) kullanılmamıştır; sayfa bazlı `useState`/`useEffect` ve `localStorage` (JWT token saklama) tercih edilmiştir. Bu tercihin gerekçesi, uygulamanın veri akışının çoğunlukla sayfa/bileşen düzeyinde kalması ve global state karmaşıklığının projenin ölçeği için gereksiz bir soyutlama katmanı eklemesinin önlenmek istenmesidir.

## Öne Çıkan Özellikler

**Video oynatıcı**

Tarayıcının varsayılan `<video>` kontrolleri kaldırılarak sıfırdan tasarlanmış bir oynatıcı arayüzü geliştirilmiştir. A-B tekrar (belirli bir aralığın döngüsel oynatılması), oynatma hızı ayarı, klavye kısayolları (boşluk tuşuyla oynat/durdur, ok tuşlarıyla ileri/geri sarma) ve backend'den gelen transkript verisinden türetilen tıklanabilir bölüm şeridi içerir. İzleme sırasında `onTimeUpdate` olayı dinlenerek belirli aralıklarla backend'e analitik verisi (izlenen saniyeler, duraklama noktaları) gönderilir.

**Cadenza sohbet arayüzü**

Sağ alt köşede sabit duran, genişletilebilir bir sohbet penceresi. Metin sohbetinin yanı sıra kamera erişimi ile anlık fotoğraf çekimi (çekim kılavuzu overlay'i ile), galeriden fotoğraf seçme, izlenmekte olan videodan otomatik kare yakalama, mikrofonla soru sorma, sesli cevap dinleme, cevaplardaki zaman damgalarına tıklanınca videoyu o ana atlatma ve öğrencinin mesajındaki duygu tonuna göre renk değiştiren bir avatar gibi etkileşimleri barındırır. Pencere kayan bir gradyan çerçeveye ve arka planı bulanıklaştıran bir odak efektine sahiptir.

**Kimlik doğrulama akışı**

Giriş formu backend'e istek atar, dönen JWT token `localStorage`'a kaydedilir. Token içeriği bir yardımcı modül (`jwtYardimci.js`) ile çözümlenerek kullanıcının rolüne göre arayüz öğeleri (örneğin admin paneli linki) koşullu olarak gösterilir. Şifremi unuttum akışı, e-posta ile gönderilen bir bağlantı üzerinden çalışır.

**Atmosfer katmanı**

Uygulama genelinde tutarlı bir görsel kimlik sağlamak amacıyla `App.jsx` içerisinde merkezi olarak mount edilen birkaç dekoratif bileşen bulunur: fare imlecini yumuşak bir gecikmeyle takip eden bir ışık efekti, sayfa kaydırma ilerlemesini segment segment dolan dikey bir gösterge, çok düşük opaklıkta bir analog doku overlay'i ve ilk sayfa yüklemesinde kısa süreli bir giriş animasyonu. Bu bileşenlerin tamamı `prefers-reduced-motion` medya sorgusunu dikkate alır.

**Duyarlı (responsive) tasarım**

Dar ekranlarda gezinme çubuğu bir hamburger menüye dönüşür; bileşenlerin büyük çoğunluğu Tailwind'in duyarlı (responsive) sınıflarıyla ekran boyutuna göre uyarlanır. Masaüstüne özgü bazı dekoratif bileşenler (örneğin ışık takip efekti), performans ve dokunmatik ekranlarda anlamsız olmaları nedeniyle mobilde devre dışı bırakılır.

**Merkezi bildirim sistemi**

Tarayıcının `window` nesnesi üzerinden özel bir olay (custom event) tetiklenmesi prensibiyle çalışan bir toast bildirim sistemi. `bildirimSistemi.js` içerisindeki `bildirimGoster()` fonksiyonu çağrıldığında bu olay tetiklenir, `ToastContainer` bileşeni bu olayı dinleyerek bildirimi ekranda gösterir. Bu mimari, herhangi bir prop aktarımına gerek kalmadan uygulamanın herhangi bir noktasından bildirim tetiklenebilmesini sağlar.

**Sayfa geçiş animasyonları**

`AnimatePresence` ile her sayfada tutarlı bir giriş/çıkış animasyonu uygulanır; bu, merkezi bir sarmalayıcı bileşen aracılığıyla yönetildiğinden, her yeni sayfanın kendi animasyon kodunu yazmasına gerek yoktur. Video sayfasına özel olarak ayrı, daha belirgin bir geçiş efekti tanımlanmıştır.

**Silme onayları ve hata sayfaları**

Tarayıcının `window.confirm()` gibi varsayılan diyalog kutuları yerine, tasarım diline uygun özel onay modalleri kullanılır. Tanımsız bir rotaya gidildiğinde kullanıcıyı ana sayfaya yönlendiren özel bir 404 sayfası bulunur.

## Sayfa ve Rota Yapısı

Tüm rotalar `App.jsx` içerisinde React Router 7 ile tanımlanır ve her geçiş ortak bir animasyon sarmalayıcısından geçer.

| Rota | Sayfa | Açıklama |
|---|---|---|
| `/login`, `/register` | Login, Register | Kimlik doğrulama |
| `/sifremi-unuttum`, `/sifre-sifirla` | SifremiUnuttum, SifreSifirla | Şifre sıfırlama akışı |
| `/anasayfa` | AnaSayfa | Kurs vitrini, arama |
| `/egitimlerim` | Egitimlerim | Satın alınan kurslar, arama/sıralama |
| `/egitim/:id` | EgitimDetay | Bir kursun video listesi, ilerleme durumu |
| `/video/:id` | VideoDetay | Video oynatıcı, Cadenza, izleme analitiği gönderimi |
| `/profil` | Profile | Profil bilgisi, şifre değiştirme, avatar |
| `/rozetlerim` | Rozetlerim | Kazanılan rozetler |
| `/favorilerim` | Favorilerim | Favori işaretlenen videolar |
| `/admin` | AdminPanel | Yönetim paneli (yalnızca admin rolü, `AdminRoute` ile korunur) |
| `*` | SayfaBulunamadi | Tanımsız rotalar için 404 |

## Backend İletişimi

İstekler doğrudan tarayıcının yerleşik `fetch()` API'si ile atılır; ek bir HTTP istemci kütüphanesi (axios vb.) kullanılmaz. Giriş sonrası alınan JWT, her korumalı isteğe `Authorization: Bearer <token>` başlığıyla eklenir. Dosya yükleme gerektiren istekler (fotoğraf, video, sertifika indirme) `FormData` nesnesiyle `multipart/form-data` olarak gönderilir. API hataları, backend'den dönen mesaj metniyle birlikte merkezi bildirim sistemi üzerinden kullanıcıya gösterilir; başarılı işlemler de aynı sistem üzerinden onaylanır.

Geliştirme ortamında backend adresi `https://localhost:7264` olarak sabit kodlanmıştır; farklı bir ortamda çalıştırmak için ilgili dosyalardaki temel URL değerinin güncellenmesi gerekir.

## State Yönetimi

Uygulama, global bir state yönetim kütüphanesi kullanmaz. Her sayfa kendi verisini `useEffect` içerisinde backend'den çeker ve `useState` ile yerel olarak tutar. Oturum bilgisi (JWT token ve kullanıcı rolü) `localStorage` üzerinden kalıcı hale getirilir ve `jwtYardimci.js` içerisindeki yardımcı fonksiyonlarla okunur. Sayfalar arası paylaşılması gereken tek gerçek "global" veri bildirim sistemidir; bu da bir state kütüphanesi yerine tarayıcı olaylarıyla (custom events) çözülmüştür.

## Animasyon ve Performans Yaklaşımı

Tüm animasyonlar Framer Motion ile GPU hızlandırmalı özellikler (transform, opacity) üzerinden yapılır; layout'u yeniden hesaplatan (reflow tetikleyen) özellikler kullanımdan kaçınılır. Dekoratif, sürekli çalışan animasyonların (ışık takip efekti, doku overlay'i gibi) tamamı `prefers-reduced-motion` medya sorgusuna duyarlıdır ve bu tercihi işaretlemiş kullanıcılarda devre dışı kalır. Masaüstüne özgü, fare hareketine bağlı efektler `md:` ve üstü Tailwind kırılma noktalarıyla sınırlandırılarak mobil cihazlarda hem performans hem anlam kaybı yaşanmaması sağlanır.

## Kurulum

Gereksinimler: [Node.js](https://nodejs.org/) (18 veya üzeri), çalışan bir backend örneği ([hk.MüzikAkademi](https://github.com/berkantkilic777-gif/hk.M-zikAkademi)).

```bash
npm install
npm run dev
```

Uygulama varsayılan olarak `http://localhost:5173` adresinde açılır ve backend'e `https://localhost:7264` üzerinden bağlanır.

```bash
npm run build      # Üretim (production) derlemesi
npm run preview    # Üretim derlemesini yerel olarak önizleme
npm run lint        # ESLint ile statik kod analizi
```

## Proje Yapısı

```
src/
├── AnaSayfa.jsx, Egitimlerim.jsx, EgitimDetay.jsx    Kurs vitrin ve listeleme sayfaları
├── VideoDetay.jsx                                     Video oynatıcı ve izleme analitiği
├── GeminiAsistan.jsx                                   Cadenza yapay zeka asistanı
├── Profile.jsx, Rozetlerim.jsx, Favorilerim.jsx        Öğrenci hesap sayfaları
├── AdminPanel.jsx, AdminRoute.jsx                       Yönetim paneli ve rota koruması
├── Login.jsx, Register.jsx, SifremiUnuttum.jsx, ...    Kimlik doğrulama akışı
├── SayfaBulunamadi.jsx                                    404 sayfası
├── Navbar.jsx, ToastContainer.jsx, Yukleniyor.jsx      Paylaşılan bileşenler
├── OdemeModal.jsx                                        Kurs satın alma akışı
├── GrainDokusu.jsx, SahneIsigiSpotu.jsx, ...             Atmosfer/tema bileşenleri
├── bildirimSistemi.js, jwtYardimci.js                   Yardımcı fonksiyonlar
├── index.css                                              Merkezi tasarım token sistemi
└── App.jsx                                                Rota tanımları, global mount noktası
```

## Tasarım Sistemi

Renk paleti ve tipografi, `index.css` içerisinde Tailwind v4'ün `@theme` direktifiyle merkezi olarak tanımlanmıştır; tek bir dosya üzerinde yapılan değişiklik tüm uygulamaya yayılır, ayrı bir `tailwind.config.js` dosyasına ihtiyaç yoktur.

| Token | Değer | Kullanım |
|---|---|---|
| `--color-ink` | `#15111f` | Ana arka plan |
| `--color-panel` | `#211c33` | Kart / panel arka planı |
| `--color-brass` | `#4fd1c5` | Ana vurgu rengi |
| `--color-parchment` | `#ece9f7` | Açık metin |
| `--color-practice` | `#5fa98a` | Başarı / onay rengi |

Fontlar: Fraunces (başlık), Inter (gövde), IBM Plex Mono (teknik etiketler, sayaçlar). Bu üçlü font sistemi, platforma hem zarif hem karakteristik bir görsel kimlik kazandırmak amacıyla bir arada kullanılır.

## Bilinen Sınırlamalar

Kaydırma tabanlı ("scroll-reveal") giriş animasyonları henüz uygulanmamıştır; sayfa içeriği şu an yalnızca ilk yüklemede animasyonlu olarak belirir. Backend adresi ortam değişkeni (environment variable) yerine ilgili dosyalarda sabit olarak tanımlıdır; farklı ortamlara dağıtım için bu değerin merkezi bir yapılandırma dosyasına taşınması önerilir.

## Bağlantılar

Backend reposu ve tam proje dokümantasyonu: [hk.MüzikAkademi](https://github.com/berkantkilic777-gif/hk.M-zikAkademi)

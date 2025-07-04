# PolyBet PWA 🎯

Modern prediction market uygulaması - Tinder tarzı swipe mekanizması ile bahis yapın!

## 🚀 Özellikler

- **Tinder Tarzı Swipe:** Kartları sola (NO) veya sağa (YES) kaydırın
- **Progressive Web App (PWA):** Telefonunuza yükleyebilirsiniz
- **Responsive Design:** Tüm cihazlarda mükemmel çalışır
- **Modern Animasyonlar:** React Spring ile akıcı geçişler
- **Touch Optimized:** Dokunmatik cihazlar için optimize edilmiş

## 🎮 Nasıl Oynanır?

1. **Bahis miktarını ayarlayın** (+/- butonları ile)
2. **Kartı okuyun** (başlık ve açıklama)
3. **Swipe yapın:**
   - ⬅️ **Sola kaydır:** NO (olmayacak diye bahse gir)
   - ➡️ **Sağa kaydır:** YES (olacak diye bahse gir)
4. **Sonuçları takip edin** (toplam bahis, kalan kart sayısı)

## 📱 Kurulum ve Çalıştırma

### Geliştirme Ortamı
```bash
# Dependencies yükle
npm install

# Geliştirme sunucusunu başlat
npm start
```

### Production Build
```bash
# PWA için build oluştur
npm run build

# Build klasörünü deploy et
```

### PWA Deployment
```bash
# Netlify, Vercel veya GitHub Pages kullanabilirsiniz
# build/ klasörünü upload edin

# Örnek Netlify:
npx netlify deploy --prod --dir=build
```

## 🛠️ Teknolojiler

- **React 18** - UI Framework
- **React Spring** - Animasyonlar
- **@use-gesture/react** - Touch/Swipe gestureları
- **React Icons** - Modern ikonlar
- **CSS3** - Responsive design ve gradientler

## 🎨 Bahis Konuları

1. **Crypto:** Bitcoin $100k'ya ulaşacak mı?
2. **Technology:** AI işlerin %30'unu alacak mı?
3. **Economics:** 2025'te durgunluk olacak mı?
4. **Stocks:** Tesla $300'e çıkacak mı?
5. **Space:** SpaceX Mars'a inecek mi?

## 📁 Proje Yapısı

```
PolyBetPWA/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── favicon.ico
├── src/
│   ├── App.js          # Ana uygulama
│   ├── App.css         # Stil dosyası
│   └── index.js        # Giriş noktası
├── package.json
└── README.md
```

## 🌟 PWA Özellikleri

- **Offline çalışma** (Service Worker)
- **Ana ekrana ekleme** (Add to Home Screen)
- **Tam ekran deneyim** (Standalone mode)
- **Hızlı yükleme** (Cache stratejileri)

## 🔧 Konfigürasyon

### PWA Ayarları
`public/manifest.json` dosyasından PWA ayarlarını değiştirebilirsiniz.

### Stil Değişiklikleri
`src/App.css` dosyasından renkleri ve boyutları özelleştirebilirsiniz.

## 📱 Mobil Optimizasyon

- Touch-friendly butonlar
- Swipe gestures
- Responsive design
- Safe area support
- Orientation locked (portrait)

## 🚀 Deploy Seçenekleri

1. **Netlify:** Otomatik SSL, CDN
2. **Vercel:** Serverless, hızlı
3. **GitHub Pages:** Ücretsiz, Git entegrasyonu
4. **Firebase Hosting:** Google altyapısı

---

**Made with ❤️ for modern web experiences** 
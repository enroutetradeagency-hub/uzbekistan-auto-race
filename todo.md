# Toshkent Driving Demo — Tekshirish ro‘yxati

- [x] Telefon touch boshqaruvida chap/o‘ng rul, gaz, tormoz va nitro uzluksiz ishlashini tasdiqlash.
- [x] O‘yinchi mashinasining manual driving modeli, yo‘l chegarasi, drift, tormoz va to‘qnashuv holatlarini kuchaytirish.
- [x] Orqa quvuvchi va ichki kokpit kameralarini ishlaydigan almashtirish tugmasi bilan qo‘shish.
- [x] Minimap, real vaqt taymeri, tezlik, joylashuv, aylana va nitro ko‘rsatkichlarini bog‘lash.
- [x] AI raqiblar, start sanog‘i, checkpoint/lap hisoblash va finish oqimini sinash.
- [x] Natija ekranida keyingi Sirdaryo bosqichini ochish va local progress saqlanishini ulash.
- [x] 12 viloyat uchun region konfiguratsiyasi, qulflash va keyingi xarita kengaytirish kontraktini yakunlash.
- [x] Android landscape ekranda menyu, driving HUD va barcha tugmalarni vizual hamda funksional tekshirish.

## Sirdaryo va Garaj iteratsiyasi

- [x] 12 viloyat uchun data-driven region progress modeli va Toshkent–Sirdaryo–Jizzax unlock zanjirini qo‘shish.
- [x] Sirdaryo uchun shahar, dala, qishloq va magistral muhitiga ega boshqariladigan 3D trassani yaratish.
- [x] Bosh menyuda Poyga, Garaj, Viloyatlar va Sozlamalar bo‘limlari o‘rtasidagi ishlaydigan navigatsiyani qo‘shish.
- [x] Cobalt, Gentra, Nexia 2, Nexia 3, Lacetti, Spark, Damas, Malibu, Onix va Tracker katalogini alohida driving presetlari bilan kiritish.
- [x] Garajda mashina tanlash, rang almashtirish, tezlanish/tezlik/handling upgrade’lari va local progress saqlanishini yaratish.
- [x] Tanlangan mashina va upgrade’lar Toshkent hamda Sirdaryo gameplayiga amalda qo‘llanishini tekshirish.
- [x] Android landscape’da Toshkent, Sirdaryo va Garaj oqimini tekshirish; TypeScript va production buildni o‘tkazish.

## Jizzax, 12 viloyat va Android APK iteratsiyasi

- [x] Jizzaxni Forish tog‘-tekislik trassasi bilan to‘liq boshqariladigan uchinchi bosqich sifatida qo‘shish.
- [x] Toshkent → Sirdaryo → Jizzax unlock oqimini Jizzax gameplayiga bog‘lash.
- [x] Samarqanddan Xorazmgacha qolgan 9 viloyat uchun alohida trassa va muhit presetlarini kiritish.
- [x] Mashina faralari, yomg‘ir/tuman/chang ta’siri, yo‘l belgilari, svetofor va oddiy traffic oqimini qo‘shish.
- [x] Motor, shina va tormoz tovushlarini avtomobil tezligi hamda holatiga ulash.
- [x] Android APK uchun Capacitor konfiguratsiyasi, Android loyiha fayllari va build yo‘riqnomasini yaratish.
- [x] 12 viloyat oqimi, Jizzax driving, audio/ob-havo va Android build konfiguratsiyasini tekshirish.

## Android CI APK iteratsiyasi

- [x] GitHub Actions Android CI workflow’ini API 36 va Build-Tools 35 bilan yaratish.
- [x] Debug APK artefaktini CI buildida yig‘ish va yuklab olinadigan fayl sifatida saqlash.
- [ ] Release signing secretlari mavjud bo‘lganda imzolangan release APK/AAB yo‘lini qo‘shish.
- [x] Native Android manifest, landscape yo‘nalishi va WebView paketlash sozlamalarini tekshirish.
- [x] CI buildga yuborish va APK artefaktini olish uchun GitHub repository ulash talabini hujjatlashtirish.

## GitHub Actions APK bajarilishi

- [ ] `UZBEKISTAN_GITHUB_USERNAME/uzbekistan-auto-race` repository remote’ini ulash.

Repository manzili: `temurbekhan7-web/uzbekistan-auto-race`.

HTTPS remote: `https://github.com/temurbekhan7-web/uzbekistan-auto-race.git`.

Yangi HTTPS remote: `https://github.com/enroutetradeagency-hub/uzbekistan-auto-race.git`.

- [x] `enroutetradeagency-hub/uzbekistan-auto-race` repository uchun Connector orqali read va push ruxsatlarini tekshirish.

- [x] Yangilangan write ruxsati tasdiqlangach o‘yin commitini repositoryga push qilish va debug APK buildini ishga tushirish.

- [ ] Repository URL takror tasdiqlangach Connector write ruxsatini qayta tekshirish.

## Connector qayta autentifikatsiyasi

- [ ] GitHub Connector tokenining amaldagi akkaunti va repository permissionlarini tekshirish.
- [ ] Git transport 403 xatosi repository write, Actions workflow yoki organization policy cheklovidan kelayotganini ajratish.
- [ ] Ruxsat yangilanganidan keyin push va CI debug APK buildini qayta sinash.

- [ ] Qayta ulangan GitHub Connector tokenida repository uchun Git push ruxsatini tasdiqlash.

- [x] Qayta autentifikatsiyadan so‘ng Git transportining 403 bermasligini real push orqali tekshirish.

- [ ] Repository kirishi qayta tekshirilgach GitHub Actions debug APK buildini ishga tushirish.

## GitHub Connector ruxsat tekshiruvi

- [ ] Ulangan GitHub Connector akkauntining login nomini tekshirish.
- [ ] `temurbekhan7-web/uzbekistan-auto-race` repository uchun API orqali read ko‘rinishini tekshirish.
- [ ] Connector tokenida write/push huquqi borligini tekshirish.
- [ ] Akkaunt mos kelmasa, GitHub Connector’ni repository egasi hisobiga qayta autentifikatsiya qilishni so‘rash.
- [x] Android o‘yin kodi va CI workflow’ini repositoryga push qilish.
- [x] GitHub Actions debug APK workflow’ini ishga tushirish va build natijasini tekshirish.
- [x] Muvaffaqiyatli debug APK artefaktini yuklab olish uchun olish.
- [x] Release APK workflow’ini signing uchun tayyor holatda tasdiqlash.

## Fotorealistik mobil racing iteratsiyasi

- [x] Joriy Babylon.js material, yoritish va mobil render byudjetini audit qilish.
- [x] Asfalt uchun PBR yo‘l qoplamasi, yoriq, chang, rezina izi va refleks materiallarini tayyorlash.
- [x] Avtomobil kuzovi, oynasi, xromi va faralari uchun realistik materiallarni qo‘shish.
- [x] Toshkent, Sirdaryo va Jizzax uchun batafsil yo‘l cheti, daraxt, uy, tog‘, dala hamda yo‘l belgisi assetlarini qo‘shish.
- [x] Quyosh/ambient lighting, soyalar, atrof-muhit akslari, tuman, yomg‘ir, chang va tezlik post-effektlarini integratsiya qilish.
- [x] High/Medium/Low rejimlarda rendering sifatini va FPS yuklamasini moslashtirish.
- [x] Yangilangan grafikani Android landscape’da tekshirib, GitHub Actions orqali yangi debug APK yaratish.

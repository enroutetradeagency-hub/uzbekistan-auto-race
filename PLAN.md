# O‘yin rejasi: UZBEKISTAN AUTO RACE

## Dastlabki yetkazib berish chegarasi

Birinchi versiya — Android ekranlarida ishlashga moslashtirilgan, brauzerda o‘ynaladigan **Toshkent viloyati poyga demosidir**. U to‘liq ekranli 3D sahna, bitta boshqariladigan sedan, AI raqiblar, aylana poygasi, pozitsiya va aylana hisoblagichi, nitro, to‘qnashuv jarimasi, kun/tun hamda ob-havo almashinuvi va High/Medium/Low grafik profillarini beradi. Uchinchi tomon native-paket vositasi hali ulanmagani uchun bu bosqich APK emas; loyiha Android Chrome va WebView-ga mos web-o‘yin sifatida quriladi.

## Xavfli vazifalar

### 1. Mobilga mos avtomobil dinamikasi

- **Nega alohida:** to‘liq g‘ildirak kollayderli fizik tizim Android uchun og‘ir va turli brauzerlarda izchil bo‘lmasligi mumkin.
- **Yondashuv:** soddalashtirilgan kinematik “bicycle” modeli ishlatiladi: tezlanish, tormoz, boshqaruv sezgirligi, lateral grip, drift chegarasi, nitro va yo‘l chetidagi tezlik yo‘qotilishi mustaqil modullarda hisoblanadi. Yo‘l cheti va AI bilan to‘qnashuvlar oldindan aniqlanadigan radiuslarga tayanadi.
- **Tekshiruv:** gaz berilganda mashina yo‘l bo‘ylab oldinga yuradi; burilish tezligi yuqori bo‘lganda yon sirpanish ko‘rinadi; tormoz masofasi seziladi; nitro faqat zaxira bo‘lsa tezlikni oshiradi; yo‘ldan chiqish va to‘qnashuv tezlikni tushiradi.

### 2. Quvuvchi uchinchi shaxs kamerasi

- **Nega alohida:** kamera avtomobilga juda yaqin bo‘lsa geometriyaga kirib ketadi, juda uzoqda bo‘lsa tezlik hissi va mobil HUD o‘qilishi yo‘qoladi.
- **Yondashuv:** avtomobil yo‘nalishiga nisbatan yumshoq interpolatsiyalangan quvuvchi kamera; nitroda cheklangan FOV kengayishi; kameraning yer balandligidan pastga tushmasligini tekshiruvchi himoya qatlam ishlatiladi.
- **Tekshiruv:** kuchli burilishlarda kamera mashinani markazda ushlab turadi, rasm keskin sakramaydi, nitroda kichik vizual tezlik hissi keladi va mobil ekranlarda HUD bilan to‘qnashmaydi.

### 3. AI raqiblar va aylana progresi

- **Nega alohida:** erkin navigatsiya AI uchun ortiqcha murakkab; noto‘g‘ri chekpoint mantiqi o‘yinchining noto‘g‘ri pozitsiyasini ko‘rsatadi.
- **Yondashuv:** AI mashinalari spline-ga o‘xshash poyga chizig‘ining namunalangan nuqtalaridan boradi; har bir raqibning tezlik ofseti, lateral joylashuvi va quvib o‘tish rejimi bor. Aylana/progress masofasi nuqtalar indeksi orqali hisoblanadi.
- **Tekshiruv:** AI 3 aylana davomida trassadan chiqmaydi; o‘yinchi pozitsiyasi AI’dan o‘tsa darhol o‘zgaradi; marraga 3 aylana ketma-ket yakunlanadi.

### 4. Bosimga mos sahna sifati

- **Nega alohida:** katta masofali tog‘/shahar muhiti va effektlar Android qurilmalarida FPS pasaytirishi mumkin.
- **Yondashuv:** `High`, `Medium`, `Low` profillari render scale, soyalar, AI soni, vegetatsiya zichligi va atmosferik effektlarni o‘zgartiradi. Distant fon tekisliklari, instanslangan prop’lar va yengil materiallar qo‘llanadi.
- **Tekshiruv:** grafik rejimi almashtirilganda sahna buzilmaydi; Low rejimida eng muhim yo‘l, avtomobil, AI va HUD saqlanadi; barcha rejimlarda tugmalar responsiv qoladi.

## Asosiy yig‘ma

Toshkent bosqichi quyidagi ko‘rinadigan tizimlarni birlashtiradi: quruq tekislik va uzoq tog‘ fonidagi aylana yo‘l, qishloq cheti detallari, svetoforli tugun, yo‘l belgilari, tungi rejim va yomg‘ir varianti, bitta o‘yinchi avtomobili hamda to‘rtta AI sedan. DOM HUD tezlik, nitro, aylana, pozitsiya, pause, grafik profil va telefonga mos sensor/tugma boshqaruvlarini beradi. Viloyatlar data-konfiguratsiya sifatida e’lon qilinadi: Toshkent ochiq, qolgan 11 bosqich qulflangan; keyingi xaritalar shu `RegionConfig` interfeysidan foydalanadi.

- **Aktivlar:** asfalt teksturasi (`/manus-storage/asphalt-road-material_295b4bbf.png`) 6 m takrorlanadi; steppe teksturasi (`/manus-storage/dry-steppe-ground-material_71ab26d2.png`) 12 m takrorlanadi; tog‘ fon manzarasi (`/manus-storage/tashkent-foothills-backdrop_e4f50cb9.png`) uzoq siluet tekisligida; vizual target (`/manus-storage/tashkent-race-visual-target_b61f1911.png`) asosiy menyuda va yuklanish kadri sifatida; logo (`/manus-storage/uzbekistan-auto-race-logo_2d167d75.png`) menyu, yuklanish va favicon uchun.
- **Tekshiruv:**
  - Klaviatura va ekrandagi boshqaruv avtomobil javobiga mos keladi.
  - Kamera, avtomobil va AI raqiblar real vaqtida harakatlanadi.
  - HUD o‘qiladi, ekrandan chiqmaydi va 360–430 px kenglikda joylashadi.
  - Teksturalar va manzara yuklanadi; tayyor bo‘lmagan generatsiya placeholder’lari bo‘lsa ham kod xatosi kelmaydi.
  - `?demo` rejimida avtopilot poygani ko‘rsatadi, shuning uchun ekran tasvirida haqiqiy o‘yin holati ko‘rinadi.
  - Brauzer konsolida xato bo‘lmaydi; `pnpm check` va build muvaffaqiyatli yakunlanadi.
  - Vizual targetga mos: past quvuvchi kamera, issiq asfalt palitrasi, tog‘li Toshkent foni, AI sedanlar, minimal texnik HUD.

## Kengaytirish tartibi

Keyingi yetkazib berishlarda Sirdaryo, Jizzax, Samarqand, Buxoro, Navoiy, Qashqadaryo, Surxondaryo, Andijon, Namangan, Farg‘ona va Xorazm uchun `RegionConfig`, o‘z trassa geometriyasi, landmark prop’lari, ob-havo profili va ochilish talablari qo‘shiladi. Avtomobillar katalogi ham shu data tizimiga Cobalt, Gentra, Lacetti, Nexia 2/3, Spark, Matiz, Damas, Malibu, Onix va Tracker uchun sozlamalar bilan kengaytiriladi.

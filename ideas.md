# UZBEKISTAN AUTO RACE — Dizayn g‘oyalari

## Uch yo‘nalish

| Theme Name | Very Brief Intro | Probability |
| --- | --- | ---: |
| **Asfalt Atlas** | O‘zbekiston yo‘llarini zamonaviy avtomobil madaniyati bilan bog‘laydigan, kinematik va tabiiy issiq rangli poyga tajribasi. Yo‘l — xaritaning markaziy qahramoni. | 0.047 |
| **Kechki Magistral** | Nam asfalt, shahar chiroqlari va tungi yo‘l energiyasiga tayangan dramatik poyga uslubi. HUD minimal, tezlik hissi kuchli. | 0.083 |
| **Qadimiy Yo‘l** | Samarqand va Xiva siluetlarini iliq, grafikali sayohat-poyga estetikasida birlashtiradigan yo‘nalish. Ko‘proq stilizatsiya, kamroq realizm. | 0.026 |

## Tanlangan yo‘nalish: Asfalt Atlas

### Design Movement

**Kinematik avtomobil fotografiyasi** va **zamonaviy yo‘l-atlasi** estetikasi. O‘yin fotorealizmga intiladi, biroq Android qurilmalarida ravon ishlashi uchun materiallar, muhit geometriyasi va post-processing qatlamlari muvozanatli bo‘ladi.

### Core Principles

1. **Yo‘l markazda:** kamera, marshrut va HUD doimo avtomobil tezligi hamda yo‘l o‘qishini aniq ko‘rsatadi.
2. **Mahalliylik seziladi:** belgilashlar, yo‘l chetidagi ko‘kalamzor, mahalla devorlari, tog‘ va tekislik siluetlari Toshkent viloyati kayfiyatini beradi, stereotipga aylanmaydi.
3. **Haqiqiy tezlik, aniq o‘qilish:** poyga vaziyati yuqori kontrast va katta boshqaruv elementlari bilan bir qarashda tushunarli.
4. **Mobilga mos sahna boyligi:** uzoq muhit soddaroq siluet, yaqin yo‘l va avtomobil esa boyroq materiallarda ishlanadi.

### Color Philosophy

Asosiy ranglar **issiq asfalt kulrangi**, **changli qum beji**, **chuqur archa-yashil** va **musaffo osmonday zangori** atrofida quriladi. Bu ranglar Toshkent atrofidagi quyoshli yo‘lning tabiiy holatini saqlaydi. Faqat musobaqaviy holatlarda — nitro, marraga yaqinlashish va xavf — energiyani ifodalovchi **atlas zarg‘aldoq** aksenti ishlatiladi. Qorong‘i HUD yuzasi asfalt bilan uyg‘un, mat va yarim shaffof bo‘ladi.

### Layout Paradigm

Interfeys ekranning markazini bo‘sh qoldiradigan **yo‘l-koridor** tizimiga asoslanadi. Telemetriya chap yuqori va pastki markazga, poyga pozitsiyasi o‘ng yuqoriga, boshqaruv esa ikki pastki burchakka joylashadi. Menyular o‘ng chetidan yo‘l belgisi kabi slayd qilib chiqadi; markazga katta kartochkalar to‘plab qo‘yilmaydi.

### Signature Elements

1. **Atlas chizig‘i:** HUD va yuklanish holatlarida uchraydigan, magistral yo‘lning uzilgan markaziy chizig‘idan ilhomlangan ikki qatlamli zarg‘aldoq marker.
2. **Yo‘l koordinatasi:** xarita va bosqich tanlovida viloyat nomi bilan birga ixcham marshrut koordinatasi ko‘rsatiladi.
3. **Shamol izi:** tezlanish va nitro paytida yo‘l chetidagi chang, panjara va vegetatsiya qisqa dinamik reaktsiya beradi.

### Interaction Philosophy

Boshqaruvlar avtomobil asboblari kabi **to‘g‘ridan-to‘g‘ri va og‘irlikka ega** tuyuladi. Telefonni gorizontal ushlash uchun yirik, yarim shaffof gaz/tormoz pedallari va chap/o‘ng burish maydoni beriladi. Klaviatura boshqaruvi ham sinov va kompyuter rejimi uchun saqlanadi. Har bir tugma 100–160 ms ichida vizual javob qaytaradi.

### Animation

Start sanog‘ida HUD elementlari qisqa, ketma-ket kesib kiradi; ekran bo‘ylab uzun “kartochka uchishi” emas, yo‘l belgisining yengil siljishi qo‘llanadi. Nitro holatida FOV ozgina kengayadi, egzozga zarg‘aldoq chaqnash va g‘ildirak izlarida qisqa chang paydo bo‘ladi. `prefers-reduced-motion` uchun kamera tebranishi, FOV o‘zgarishi va dekorativ harakatlar pasaytiriladi.

### Typography System

Sarlavhalar uchun **Barlow Condensed** — texnik, tik va tezlikni eslatuvchi display serif-siz oilasi; interfeys, sonlar va yordamchi matnlar uchun **Manrope**. Bosqich nomlari katta harflarda va 700–800 vaznda; tezlik ko‘rsatkichi Barlow Condensed 800; yordamchi matnlar Manrope 500–600. Inter ishlatilmaydi.

### Brand Essence

**O‘zbekiston yo‘llarini bosib o‘tadigan, mahalliy avtomobillar va real poyga hissini Androidga olib keladigan mobil 3D race.**

Shaxsiyat: **qat’iy, mahalliy, kinematik.**

### Brand Voice

Sarlavha va CTA’lar qisqa, buyruq ohangida, poyga ritmiga mos yoziladi; ular umumiy reklama iboralaridan qochadi.

> “TOSHKENT HALQASI. START CHIZIG‘IGA CHIQ.”

> “NITRONI SAQLA. BURILISH HAL QILADI.”

### Wordmark & Logo

Wordmark “UZBEKISTAN AUTO RACE” nomini keng, qiya va kesilgan terminali bor maxsus sans uslubida tasavvur qiladi. Logo belgisi — magistralning ikki qatlamli markaziy chizig‘i va O‘zbekiston xaritasi konturining ixcham kesishmasi; matnsiz, yirik o‘qiladigan va ilova ikonkasiga mos ramz.

### Signature Brand Color

**Atlas Zarg‘aldoq — `#F5A524`**. U poyga marshruti, nitro va faol holatlar uchun yagona brend signalidir.

## Style Decisions

Har bir asosiy ekran **yo‘l-koridor signali**ni ko‘rsatadi: start menyusida poyga kadri va viloyat yo‘nalishi, poygada esa asfalt trassasi, ufq, telemetriya va markaziy tezlik indikatorlari mavjud bo‘ladi. Atlas Zarg‘aldoq faqat poyga harakati va muhim statuslar — nitro, faol grafik tanlovi, bosqich, start CTA va asosiy telemetriya — uchun ishlatiladi. Matn ohangi qisqa o‘zbekcha poyga-buyruqlari bilan cheklanadi; u umumiy landing-page iboralarini qabul qilmaydi.

Toshkent sahnasi mahalliy kinematik belgilarni saqlaydi: tog‘oldi ufqi, poplar qatori, mahalla uylari, svetofor va ko‘rsatgichlar, quruq steppe zamin hamda gardishli asfalt yo‘l. Barlow Condensed buyruq va tezlik holatlarini boshqaradi, Manrope esa yordamchi telemetriya va kontekst uchun ishlatiladi.

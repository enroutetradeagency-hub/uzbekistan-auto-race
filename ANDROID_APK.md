# UZBEKISTAN AUTO RACE — Android APK tayyorlash

Loyiha Capacitor orqali Android WebView ilovasi sifatida paketlanadi. O‘yin logikasi va Babylon.js sahnasi qurilma ichida ishlaydi; tarmoqdan faqat kelajakdagi ixtiyoriy yangilanish yoki onlayn funksiyalar uchun foydalaniladi.

## Tayyorlash

`pnpm android:sync` buyrug‘i avval frontend production buildini yaratadi, so‘ng `dist/public` tarkibini Android loyihasiga nusxalaydi. Android Studio o‘rnatilgan ishchi muhitda `pnpm android:open` buyrug‘i bilan loyiha ochiladi. Android Studio ichida **Build → Generate Signed Bundle / APK** orqali release APK yaratiladi.

## Qurilma talablari

O‘yin Android 10 yoki undan yuqori, horizontal ekranli telefonlar uchun mo‘ljallangan. Low grafik profilida render yuklamasi pasayadi; High profilida yo‘l, muhit va yorug‘lik sifati yuqoriroq bo‘ladi.

## Eslatma

## Android CI

`.github/workflows/android-apk.yml` workflow’i GitHub Actions runnerida Java 21, Android API 36 va Build-Tools 35.0.0 ni o‘rnatadi. `main` branchga yuborilganda debug APK avtomatik artefakt sifatida saqlanadi. Workflow’ni qo‘lda **release** turi bilan boshlash unsigned release APK’ni ham artefakt sifatida chiqaradi.

Imzolangan release APK uchun GitHub repository secret’lariga release keystore, uning paroli, alias va key parolini kiritib signing qadami qo‘shiladi. Keystore yoki signing secretlari bu loyiha ichida saqlanmaydi.

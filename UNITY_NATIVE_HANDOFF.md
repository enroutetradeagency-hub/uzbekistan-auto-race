# Unity 6 URP native handoff — UZBEKISTAN AUTO RACE

## 1. Foydalanuvchi tayyorlaydigan lokal loyiha

Unity Hub’da **Unity 6 LTS** editorini Android Build Support modullari bilan o‘rnating. Keyin yangi loyiha ochilganda `Universal 3D` (URP) template tanlanadi va quyidagi nom ishlatiladi:

```text
UZBEKISTAN-AUTO-RACE-UNITY
```

Loyiha yaratilib Unity uni bir marta ochib `Library/` va `ProjectSettings/` generatsiya qilgach, aynan loyiha root papkasini Manus Desktop orqali ulang. `Assets`, `Packages` va `ProjectSettings` kataloglari ko‘rinib turishi kerak; faqat `Assets` yoki export qilingan APK papkasi ulanmasligi kerak.

| Unity Hub modul | Kerakligi | Qabul holati |
| --- | --- | --- |
| Unity 6 LTS Editor | C# gameplay, URP renderer, asset import va scene authoring uchun | Majburiy |
| Android Build Support | APK/AAB build targeti uchun | Majburiy |
| Android SDK & NDK Tools | IL2CPP/ARM64 native build uchun | Majburiy |
| OpenJDK | Android Gradle export/build uchun | Majburiy |
| Visual Studio yoki Rider | C# tahrirlash va debug uchun | Tavsiya etiladi |
| Git LFS | Katta FBX/GLB/texture assetlarini Git orqali saqlash uchun | Asset hajmiga bog‘liq, kuchli tavsiya |

## 2. Ulangan zahoti bajariladigan native sprint

| Tartib | Ish | Isbot |
| ---: | --- | --- |
| 1 | Project version, URP package, Android Build Support va source-control holati tekshiriladi. | `ProjectVersion.txt`, Package Manager va Git status. |
| 2 | `UNITY_URP_NATIVE_BLUEPRINT.md` bo‘yicha `_UAR` folder, asmdef, URP renderer asset va initial scenes yaratiladi. | Unity scene hierarchy va compile-clean Console. |
| 3 | `VehicleController`, touch router, chase/cockpit camera, race state hamda ScriptableObject data kontrakti implement qilinadi. | Play Mode’dagi touch/input va C# testlar. |
| 4 | Huquqi tekshirilgan bitta native car + road PBR set + vegetation/terrain kit import qilinadi. | Asset Register, real mesh inspector va LODGroup evidence. |
| 5 | Toshkent race vertical slice’ida 3 lap, AI, collision, drift, nitro, HUD, weather va wet-road toggle ishlatiladi. | Real Android device screen recording hamda profiler capture. |
| 6 | High/Medium/Low quality benchmarki qurilmaga qarab to‘ldiriladi; memory, frame time va thermals qayd qilinadi. | Per-profile profiler table. |
| 7 | GitHub Actions Unity Android development APK pipeline’i qo‘shiladi. | Yashil CI run va APK artifact. |

Bu tartibda Sirdaryo va Jizzaxga faqat Toshkent vertical slice’ining real asset, device va performance gate’i qabul qilingandan keyin o‘tiladi. Mavjud Babylon/WebView loyiha bu paytda o‘zgarmaydi va native build bilan aralashtirilmaydi.

## 3. Android Build Profile bazaviy qiymatlari

| Group | Boshlang‘ich qiymat | Keyingi device-test qarori |
| --- | --- | --- |
| Platform | Android | Unity build profile tanlovida saqlanadi. |
| Orientation | Landscape Left/Right | Touch HUD va racing camera uchun lock. |
| Scripting backend | IL2CPP | ARM64 native output. [1] |
| Architectures | ARM64 | Release track uchun. |
| Graphics APIs | Vulkan first, OpenGLES3 fallback | Dastlabki uchta telefon profilidan keyin blacklist/rank tuziladi. |
| Color space | Linear | URP Lit PBR pipeline. |
| Texture bundles | ASTC primary; ETC2 compatibility path | APK faqat first compression formatni ishlatishini hisobga olib distribution strategy belgilanadi. [1] |
| Development Build | Development + Autoconnect Profiler | Faqat test APK’larida. |
| Production release | Signed AAB, symbols va crash mapping | Keystore faqat secret sifatida, repositoryda hech qachon emas. |

## 4. GitHub Actions native CI kontrakti

Yangi native project repository ildizida bo‘lsa, Unity build workflow `.github/workflows/unity-android.yml` bo‘ladi. Native Unity project subfolderda saqlansa, workflow `projectPath`ni aniq ko‘rsatadi. GameCI Builder Android va boshqa platformalarga Unity build qilishni avtomatlashtiradi, build output uchun GitHub artifact ishlatiladi va `Library/` cache key bilan build tezlashadi. [2]

| Secret yoki input | Egasi | Vazifasi |
| --- | --- | --- |
| `UNITY_LICENSE` | Foydalanuvchi, GitHub Actions secret | Personal Unity license’ning bir martalik manual activationdan keyingi CI faollashtirish qiymati. [2] |
| `UNITY_EMAIL`, `UNITY_PASSWORD` | Foydalanuvchi, faqat zarur bo‘lsa | GameCI activation dokumentatsiyasida ko‘rsatilgan CI credentiallari; plaintext filega yozilmaydi. [2] |
| `ANDROID_KEYSTORE_BASE64` | Foydalanuvchi, release bosqichi | Imzolangan Android AAB/APK. Development APK uchun talab qilinmaydi. |
| `ANDROID_KEYSTORE_PASS`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_ALIAS_PASS` | Foydalanuvchi, release bosqichi | Release signing; GitHub Secrets’da saqlanadi. |
| `UNITY_VERSION` | Repository `ProjectVersion.txt` | GameCI Builder `auto` orqali project versionni oladi. [2] |

CI’ning birinchi iteratsiyasida `Development APK` artifact yaratiladi. Imzolangan release AAB faqat keystore va versioning siyosati tayyor bo‘lgandan keyin alohida user approval bilan qo‘shiladi. Bu mavjud Capacitor debug workflow’ini o‘chirib tashlash emas: workflow’lar `legacy-capacitor` va `unity-native` sifatida aniq ajratilgan holda turadi.

## 5. Birinchi kun yakunida kutiladigan real natija

Qabul qilinadigan natija yangi landing page yoki HTML ko‘rinishi emas. Quyidagi native Unity deliverable’lar bo‘lishi kerak:

| Deliverable | Qabul mezoni |
| --- | --- |
| Unity URP project | Unity 6 editor’da clean compile bo‘ladi, scene’lar blueprint bo‘yicha ochiladi. |
| Toshkent native race scene | Real car mesh, real PBR road, non-primitive terrain/vegetation, URP lighting va camera ishlaydi. |
| Android development APK | GitHub Actions’dan artifact sifatida yaratiladi va haqiqiy Android telefonda ochiladi. |
| Visual/profil evidence | Video/screenshot + Unity Profiler frame time/memory capture’lari High, Medium va Low uchun saqlanadi. |
| Asset register | Har bir import source, license class, format, LOD va texture budget bilan ro‘yxatga olingan. |

## 6. Ushbu loyihaga qo‘shilgan tayyorgarlik hujjatlari

| Fayl | Vazifasi |
| --- | --- |
| `GRAPHICS_REBUILD_AUDIT.md` | Nega Babylon/WebView PBR passini davom ettirmaslik va nima uchun Unity URP tanlanganini ko‘rsatadi. |
| `UNITY_URP_NATIVE_BLUEPRINT.md` | Scene, folder, C# modul, Android va URP rendering architecture kontrakti. |
| `UNITY_URP_ASSET_MANIFEST.md` | Real vehicle/road/environment assetlari, LOD, PBR, licensing va import gate’lari. |
| `UNITY_NATIVE_HANDOFF.md` | Lokal Unity papkasi ulangach boshlanadigan sprint va CI tartibi. |

## References

[1] [Unity 6 — Android Player settings](https://docs.unity3d.com/6000.0/Documentation/Manual/class-PlayerSettingsAndroid.html)

[2] [GameCI — Unity Builder for GitHub Actions](https://game.ci/docs/github/builder/)

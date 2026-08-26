# UZBEKISTAN AUTO RACE — Arxitektura

## Asosiy tamoyil

React faqat to‘liq ekranli ramka va DOM interfeysini ta’minlaydi; Babylon.js 3D rasm, sahna va materiallarni yaratadi; o‘yin qoidalari esa `client/src/game/` ichidagi mustaqil TypeScript modullarida yashaydi.

## Modul egaligi

| Modul | Mas’uliyat | Muhim holat |
| --- | --- | --- |
| `scene.ts` | Babylon engine uchun sahna yaratish, `GameHandle` qaytarish va dispose | `Scene`, `GameWorld` |
| `world/GameWorld.ts` | Bosqich, o‘yin fazasi, vaqt, ob-havo, yangilanish delegatsiyasi | `raceState`, `graphicsProfile` |
| `actors/Vehicle.ts` | Sedan mesh’i, kinematik haydash, drift/nitro, to‘qnashuv radiusi | `speed`, `heading`, `nitro` |
| `actors/AIRacer.ts` | Poyga chizig‘i bo‘ylab avtomatik yuruvchi raqib | `trackIndex`, `pace`, `laneOffset` |
| `systems/InputManager.ts` | Klaviatura, touch va tugmalarni semantik action’ga aylantirish | `throttle`, `brake`, `steer`, `nitro` |
| `systems/RaceManager.ts` | Aylana, checkpoint, pozitsiya va finish holati | `lap`, `position`, `raceFinished` |
| `systems/CameraController.ts` | Quvuvchi kamera va nitro FOV | `smoothedTarget` |
| `systems/TrackBuilder.ts` | Toshkent poyga chizig‘i, asfalt, chet, belgilar, prop’lar | `samples`, `roadMeshes` |
| `systems/EnvironmentBuilder.ts` | Osmon, steppe, tog‘ foni, vaqt va yomg‘ir | `weather`, `timeOfDay` |
| `ui/HudController.ts` | DOM ichidagi HUD holatini tez, React renderlarsiz yangilash | `root`, `uiBindings` |
| `data/regions.ts` | 12 viloyat uchun data shablonlari va qulflash qoidasi | `RegionConfig[]` |
| `data/cars.ts` | Keyingi mashina katalogi uchun fizik va vizual presetlar | `CarSpec[]` |

## O‘yin oqimi

`menu → countdown → racing → finished → menu` holatlari `GameWorld` tomonidan boshqariladi. Har bir render kadridan avval `world.update(delta)` bir marta chaqiriladi; u input, o‘yinchi, AI, poyga progressi, kamera, muhit va HUD’ni tartib bilan yangilaydi.

## Render va aktiv strategiyasi

Katta 3D modellar o‘rniga sedanlar, yo‘l, beton uylar, svetoforlar va belgilar procedural mesh’lardan tuziladi. Realistik o‘qilish yaratilgan asfalt, ground va tog‘ fon teksturalari orqali kuchaytiriladi. Barcha masofaviy rasm aktivlari `/manus-storage/...` URL’laridan yuklanadi; loyiha ichiga katta media fayl qo‘shilmaydi.

## Grafik profillari

| Rejim | Ustuvorlik | O‘zgaruvchilar |
| --- | --- | --- |
| High | Vizual masofa va soyalar | 1.0 render scale, 4 AI, 60 prop, yumshoq soyalar, yomg‘ir zarralari |
| Medium | Barqaror mobil tezlik | 0.85 render scale, 3 AI, 36 prop, yengil soyalar |
| Low | Keng moslik | 0.7 render scale, 2 AI, 18 prop, soyasiz, zarrasiz |

## Asset Hints

| Aktiv | Ishlatilishi | O‘yin ichidagi o‘lcham |
| --- | --- | --- |
| Asfalt texture | Poyga yo‘li | 6 m tile |
| Steppe texture | Yo‘l tashqarisidagi zamin | 12 m tile |
| Toshkent foothills backdrop | Uzoq manzara tekisligi | 120 m × 38 m |
| Race visual target | Bosh menyu va yuklanish kadri | 1920 × 1080 px cover |
| Matnsiz logo | Brand / start panel | 92 × 92 px; favicon uchun 64 × 64 px |
